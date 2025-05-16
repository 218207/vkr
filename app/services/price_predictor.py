# import logging
# import numpy as np
# import pandas as pd
# from typing import Optional, Dict, List, Union, Any
# from sklearn.ensemble import GradientBoostingRegressor
# from sklearn.preprocessing import OneHotEncoder, StandardScaler
# from sklearn.compose import ColumnTransformer
# from sklearn.pipeline import Pipeline

# from sqlalchemy.orm import Session
# from app.models.apartment import Apartment

# logger = logging.getLogger(__name__)


# class PricePredictorService:
#     """
#     Сервис для прогнозирования стоимости аренды квартир
#     """
#     def __init__(self):
#         self.model = None
#         self.categorical_features = ['metro', 'way']
#         self.numerical_features = ['minutes', 'storey', 'storeys', 'rooms', 'total_area', 'living_area', 'kitchen_area']
#         self.preprocessor = None
#         self.is_trained = False

#     def _prepare_data(self, apartments: List[Apartment]) -> pd.DataFrame:
#         """
#         Подготовка данных для обучения модели
#         """
#         data = []
        
#         for apartment in apartments:
#             apartment_data = {
#                 'metro': apartment.metro,
#                 'price': apartment.price,
#                 'minutes': apartment.minutes,
#                 'way': apartment.way,
#                 'storey': apartment.storey,
#                 'storeys': apartment.storeys,
#                 'rooms': apartment.rooms,
#                 'total_area': apartment.total_area,
#                 'living_area': apartment.living_area if apartment.living_area else 0,
#                 'kitchen_area': apartment.kitchen_area if apartment.kitchen_area else 0,
#             }
#             data.append(apartment_data)
        
#         df = pd.DataFrame(data)
#         return df

#     def train(self, db: Session) -> bool:
#         """
#         Обучение модели на основе данных из базы
#         """
#         try:
#             # Получаем все квартиры из базы
#             apartments = db.query(Apartment).all()
            
#             if not apartments or len(apartments) < 10:
#                 logger.warning("Недостаточно данных для обучения модели")
#                 return False
            
#             # Подготовка данных
#             df = self._prepare_data(apartments)
            
#             # Разделение на признаки и целевую переменную
#             X = df.drop('price', axis=1)
#             y = df['price']
            
#             # Создание препроцессора для обработки категориальных и числовых признаков
#             categorical_transformer = OneHotEncoder(handle_unknown='ignore')
#             numerical_transformer = StandardScaler()
            
#             self.preprocessor = ColumnTransformer(
#                 transformers=[
#                     ('cat', categorical_transformer, self.categorical_features),
#                     ('num', numerical_transformer, self.numerical_features)
#                 ])
            
#             # Создание и обучение модели
#             self.model = Pipeline(steps=[
#                 ('preprocessor', self.preprocessor),
#                 ('regressor', GradientBoostingRegressor(
#                     n_estimators=100,
#                     learning_rate=0.1,
#                     max_depth=5,
#                     random_state=42
#                 ))
#             ])
            
#             self.model.fit(X, y)
#             self.is_trained = True
            
#             logger.info(f"Модель прогнозирования цены обучена на {len(apartments)} экземплярах")
#             return True
            
#         except Exception as e:
#             logger.error(f"Ошибка при обучении модели: {e}")
#             return False

#     def predict_price(self, apartment_data: Dict[str, Any]) -> Optional[float]:
#         """
#         Прогнозирование стоимости аренды для заданной квартиры
#         """
#         if not self.is_trained or not self.model:
#             logger.warning("Модель не обучена")
#             return None
        
#         try:
#             # Подготовка входных данных
#             input_data = pd.DataFrame([apartment_data])
            
#             # Прогноз
#             predicted_price = self.model.predict(input_data)[0]
            
#             # Округляем и ограничиваем минимальную цену
#             predicted_price = max(round(predicted_price, 2), 10000)
            
#             return predicted_price
            
#         except Exception as e:
#             logger.error(f"Ошибка при прогнозировании цены: {e}")
#             return None


# # Создаем синглтон для использования в приложении
# price_predictor = PricePredictorService()

import logging
import numpy as np
import pandas as pd
from typing import Optional, Dict, List, Union, Any, Tuple
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.svm import SVR
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

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
        self.model_performance = {}  # Для хранения метрик производительности модели

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

    def _evaluate_model(self, model, X_train, X_test, y_train, y_test) -> Dict[str, float]:
        """
        Оценка производительности модели на тестовых данных
        """
        # Обучаем модель
        model.fit(X_train, y_train)
        
        # Предсказываем на обучающих и тестовых данных
        y_train_pred = model.predict(X_train)
        y_test_pred = model.predict(X_test)
        
        # Вычисляем метрики
        train_mse = mean_squared_error(y_train, y_train_pred)
        test_mse = mean_squared_error(y_test, y_test_pred)
        train_rmse = np.sqrt(train_mse)
        test_rmse = np.sqrt(test_mse)
        train_mae = mean_absolute_error(y_train, y_train_pred)
        test_mae = mean_absolute_error(y_test, y_test_pred)
        train_r2 = r2_score(y_train, y_train_pred)
        test_r2 = r2_score(y_test, y_test_pred)
        
        # Относительная ошибка (в процентах)
        train_rel_error = np.mean(np.abs((y_train - y_train_pred) / y_train)) * 100
        test_rel_error = np.mean(np.abs((y_test - y_test_pred) / y_test)) * 100
        
        return {
            'train_mse': train_mse,
            'test_mse': test_mse,
            'train_rmse': train_rmse,
            'test_rmse': test_rmse,
            'train_mae': train_mae,
            'test_mae': test_mae,
            'train_r2': train_r2,
            'test_r2': test_r2,
            'train_rel_error': train_rel_error,
            'test_rel_error': test_rel_error
        }

    def _compare_models(self, X_train, X_test, y_train, y_test) -> Tuple[Pipeline, Dict[str, Dict[str, float]]]:
        """
        Сравнение различных моделей регрессии и выбор лучшей
        """
        # Создаем препроцессор для обработки категориальных и числовых признаков
        categorical_transformer = OneHotEncoder(handle_unknown='ignore')
        numerical_transformer = StandardScaler()
        
        self.preprocessor = ColumnTransformer(
            transformers=[
                ('cat', categorical_transformer, self.categorical_features),
                ('num', numerical_transformer, self.numerical_features)
            ])
        
        # Определяем модели для сравнения
        models = {
            'Linear Regression': LinearRegression(),
            'Ridge': Ridge(alpha=1.0),
            'Lasso': Lasso(alpha=0.1),
            'ElasticNet': ElasticNet(alpha=0.1, l1_ratio=0.5),
            'SVR': SVR(kernel='linear'),
            'Random Forest': RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            ),
            'Gradient Boosting': GradientBoostingRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
            )
        }
        
        # Создаем пайплайны для каждой модели
        pipelines = {name: Pipeline(steps=[
            ('preprocessor', self.preprocessor),
            ('regressor', model)
        ]) for name, model in models.items()}
        
        # Оцениваем каждую модель
        model_scores = {}
        for name, pipeline in pipelines.items():
            logger.info(f"Оценка модели: {name}")
            try:
                model_scores[name] = self._evaluate_model(pipeline, X_train, X_test, y_train, y_test)
                logger.info(f"Модель {name}: R² = {model_scores[name]['test_r2']:.4f}, RMSE = {model_scores[name]['test_rmse']:.2f}, MAE = {model_scores[name]['test_mae']:.2f}")
            except Exception as e:
                logger.error(f"Ошибка при оценке модели {name}: {e}")
                model_scores[name] = {'test_r2': -float('inf')}
        
        # Выбираем лучшую модель по R² на тестовых данных
        best_model_name = max(model_scores.keys(), key=lambda name: model_scores[name]['test_r2'])
        best_model = pipelines[best_model_name]
        
        logger.info(f"Выбрана лучшая модель: {best_model_name} с R² = {model_scores[best_model_name]['test_r2']:.4f}")
        
        return best_model, model_scores

    def train(self, db: Session) -> bool:
        """
        Обучение модели на основе данных из базы с выбором лучшей модели
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
            
            # Разделение на обучающую и тестовую выборки
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Сравниваем разные модели и выбираем лучшую
            best_model, model_scores = self._compare_models(X_train, X_test, y_train, y_test)
            
            # Сохраняем лучшую модель и её показатели
            self.model = best_model
            self.model_performance = model_scores
            
            # Обучаем модель на всех данных
            logger.info("Обучение финальной модели на всех данных...")
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
    
    def get_performance_metrics(self) -> Dict[str, Dict[str, float]]:
        """
        Получение метрик производительности модели
        """
        if not self.is_trained:
            logger.warning("Модель не обучена, метрики недоступны")
            return {}
        
        return self.model_performance


# Создаем синглтон для использования в приложении
price_predictor = PricePredictorService()