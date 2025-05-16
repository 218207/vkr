import logging
import numpy as np
import pandas as pd
from typing import Optional, Dict, List, Union, Any
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from sqlalchemy.orm import Session
from app.models.apartment import Apartment

logger = logging.getLogger(__name__)


class PricePredictorService:
    """
    Сервис для прогнозирования стоимости аренды квартир
    """
    def __init__(self):
        self.model = None
        self.categorical_features = ['metro', 'way']
        self.numerical_features = ['minutes', 'storey', 'storeys', 'rooms', 'total_area', 'living_area', 'kitchen_area']
        self.preprocessor = None
        self.is_trained = False

    def _prepare_data(self, apartments: List[Apartment]) -> pd.DataFrame:
        """
        Подготовка данных для обучения модели
        """
        data = []
        
        for apartment in apartments:
            apartment_data = {
                'metro': apartment.metro,
                'price': apartment.price,
                'minutes': apartment.minutes,
                'way': apartment.way,
                'storey': apartment.storey,
                'storeys': apartment.storeys,
                'rooms': apartment.rooms,
                'total_area': apartment.total_area,
                'living_area': apartment.living_area if apartment.living_area else 0,
                'kitchen_area': apartment.kitchen_area if apartment.kitchen_area else 0,
            }
            data.append(apartment_data)
        
        df = pd.DataFrame(data)
        return df

    def train(self, db: Session) -> bool:
        """
        Обучение модели на основе данных из базы
        """
        try:
            # Получаем все квартиры из базы
            apartments = db.query(Apartment).all()
            
            if not apartments or len(apartments) < 10:
                logger.warning("Недостаточно данных для обучения модели")
                return False
            
            # Подготовка данных
            df = self._prepare_data(apartments)
            
            # Разделение на признаки и целевую переменную
            X = df.drop('price', axis=1)
            y = df['price']
            
            # Создание препроцессора для обработки категориальных и числовых признаков
            categorical_transformer = OneHotEncoder(handle_unknown='ignore')
            numerical_transformer = StandardScaler()
            
            self.preprocessor = ColumnTransformer(
                transformers=[
                    ('cat', categorical_transformer, self.categorical_features),
                    ('num', numerical_transformer, self.numerical_features)
                ])
            
            # Создание и обучение модели
            self.model = Pipeline(steps=[
                ('preprocessor', self.preprocessor),
                ('regressor', GradientBoostingRegressor(
                    n_estimators=100,
                    learning_rate=0.1,
                    max_depth=5,
                    random_state=42
                ))
            ])
            
            self.model.fit(X, y)
            self.is_trained = True
            
            logger.info(f"Модель прогнозирования цены обучена на {len(apartments)} экземплярах")
            return True
            
        except Exception as e:
            logger.error(f"Ошибка при обучении модели: {e}")
            return False

    def predict_price(self, apartment_data: Dict[str, Any]) -> Optional[float]:
        """
        Прогнозирование стоимости аренды для заданной квартиры
        """
        if not self.is_trained or not self.model:
            logger.warning("Модель не обучена")
            return None
        
        try:
            # Подготовка входных данных
            input_data = pd.DataFrame([apartment_data])
            
            # Прогноз
            predicted_price = self.model.predict(input_data)[0]
            
            # Округляем и ограничиваем минимальную цену
            predicted_price = max(round(predicted_price, 2), 10000)
            
            return predicted_price
            
        except Exception as e:
            logger.error(f"Ошибка при прогнозировании цены: {e}")
            return None


# Создаем синглтон для использования в приложении
price_predictor = PricePredictorService()