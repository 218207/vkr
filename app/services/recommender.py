# import logging
# import numpy as np
# from typing import List, Dict, Optional, Any
# from sklearn.neighbors import NearestNeighbors
# from sklearn.preprocessing import OneHotEncoder, StandardScaler
# from sklearn.compose import ColumnTransformer
# from sqlalchemy.orm import Session

# from app.models.apartment import Apartment
# from app.models.favorite import Favorite

# logger = logging.getLogger(__name__)


# class RecommenderService:
#     """
#     Сервис для формирования рекомендаций по объектам недвижимости
#     """
#     def __init__(self):
#         self.model = None
#         self.apartments_data = None
#         self.apartment_ids = None
#         self.categorical_features = ['metro', 'way']
#         self.numerical_features = ['price', 'minutes', 'rooms', 'total_area']
#         self.preprocessor = None
#         self.is_trained = False

#     def train(self, db: Session) -> bool:
#         """
#         Обучение модели рекомендаций на основе данных из базы
#         """
#         try:
#             # Получаем все квартиры из базы
#             apartments = db.query(Apartment).all()
            
#             if not apartments or len(apartments) < 5:
#                 logger.warning("Недостаточно данных для обучения модели рекомендаций")
#                 return False
            
#             # Подготовка данных
#             features = []
#             self.apartment_ids = []
            
#             for apartment in apartments:
#                 apartment_features = {
#                     'metro': apartment.metro,
#                     'price': apartment.price,
#                     'minutes': apartment.minutes,
#                     'way': apartment.way,
#                     'rooms': apartment.rooms,
#                     'total_area': apartment.total_area,
#                 }
#                 features.append(apartment_features)
#                 self.apartment_ids.append(apartment.id)
            
#             self.apartments_data = features
            
#             # Создание препроцессора для обработки категориальных и числовых признаков
#             categorical_transformer = OneHotEncoder(handle_unknown='ignore')
#             numerical_transformer = StandardScaler()
            
#             self.preprocessor = ColumnTransformer(
#                 transformers=[
#                     ('cat', categorical_transformer, self.categorical_features),
#                     ('num', numerical_transformer, self.numerical_features)
#                 ])
            
#             # Преобразование данных
#             transformed_features = self.preprocessor.fit_transform(features)
            
#             # Создание и обучение модели
#             self.model = NearestNeighbors(
#                 n_neighbors=min(6, len(apartments)),  # Максимум 5 рекомендаций + 1 (сам объект)
#                 algorithm='auto',
#                 metric='euclidean'
#             )
#             self.model.fit(transformed_features)
            
#             self.is_trained = True
#             logger.info(f"Модель рекомендаций обучена на {len(apartments)} экземплярах")
            
#             return True
            
#         except Exception as e:
#             logger.error(f"Ошибка при обучении модели рекомендаций: {e}")
#             return False

#     def get_similar_apartments(self, db: Session, apartment_id: int, n_recommendations: int = 5) -> List[Apartment]:
#         """
#         Получение списка похожих квартир для заданной квартиры
#         """
#         if not self.is_trained or not self.model:
#             logger.warning("Модель рекомендаций не обучена")
#             self.train(db)
#             if not self.is_trained:
#                 return []
        
#         try:
#             # Получаем квартиру по ID
#             apartment = db.query(Apartment).filter(Apartment.id == apartment_id).first()
            
#             if not apartment:
#                 logger.warning(f"Квартира с ID {apartment_id} не найдена")
#                 return []
            
#             # Подготовка входных данных
#             apartment_features = {
#                 'metro': apartment.metro,
#                 'price': apartment.price,
#                 'minutes': apartment.minutes,
#                 'way': apartment.way,
#                 'rooms': apartment.rooms,
#                 'total_area': apartment.total_area,
#             }
            
#             # Ищем индекс квартиры в обучающих данных
#             try:
#                 apartment_index = self.apartment_ids.index(apartment_id)
#             except ValueError:
#                 # Если квартиры нет в обучающих данных, преобразуем ее признаки
#                 transformed_features = self.preprocessor.transform([apartment_features])
#                 _, indices = self.model.kneighbors(transformed_features)
                
#                 # Получаем ID рекомендованных квартир
#                 recommended_ids = [self.apartment_ids[i] for i in indices[0] if self.apartment_ids[i] != apartment_id][:n_recommendations]
#             else:
#                 # Если квартира есть в обучающих данных
#                 _, indices = self.model.kneighbors(self.preprocessor.transform([apartment_features]))
                
#                 # Убираем саму квартиру из рекомендаций
#                 recommended_indices = [i for i in indices[0] if self.apartment_ids[i] != apartment_id][:n_recommendations]
#                 recommended_ids = [self.apartment_ids[i] for i in recommended_indices]
            
#             # Получаем объекты квартир по ID
#             recommended_apartments = db.query(Apartment).filter(Apartment.id.in_(recommended_ids)).all()
            
#             return recommended_apartments
            
#         except Exception as e:
#             logger.error(f"Ошибка при получении рекомендаций: {e}")
#             return []

#     def get_recommendations_for_user(self, db: Session, user_id: int, n_recommendations: int = 5) -> List[Apartment]:
#         """
#         Получение персонализированных рекомендаций для пользователя на основе его избранных квартир
#         """
#         if not self.is_trained or not self.model:
#             logger.warning("Модель рекомендаций не обучена")
#             self.train(db)
#             if not self.is_trained:
#                 return []
        
#         try:
#             # Получаем избранные квартиры пользователя
#             favorite_ids = db.query(Favorite.apartment_id).filter(Favorite.user_id == user_id).all()
#             favorite_ids = [fav[0] for fav in favorite_ids]
            
#             if not favorite_ids:
#                 logger.info(f"У пользователя с ID {user_id} нет избранных квартир для формирования рекомендаций")
#                 # Возвращаем просто популярные квартиры (с наибольшим числом просмотров)
#                 return db.query(Apartment).order_by(Apartment.views.desc()).limit(n_recommendations).all()
            
#             # Получаем рекомендации для каждой избранной квартиры
#             all_recommendations = []
#             for fav_id in favorite_ids:
#                 recommendations = self.get_similar_apartments(db, fav_id, n_recommendations=3)
#                 all_recommendations.extend(recommendations)
            
#             # Удаляем дубликаты и избранные квартиры из рекомендаций
#             unique_recommendations = []
#             recommendation_ids = set()
            
#             for apartment in all_recommendations:
#                 if apartment.id not in recommendation_ids and apartment.id not in favorite_ids:
#                     unique_recommendations.append(apartment)
#                     recommendation_ids.add(apartment.id)
#                     if len(unique_recommendations) >= n_recommendations:
#                         break
            
#             # Если рекомендаций недостаточно, добавляем популярные квартиры
#             if len(unique_recommendations) < n_recommendations:
#                 popular_apartments = db.query(Apartment).filter(
#                     ~Apartment.id.in_(recommendation_ids.union(favorite_ids))
#                 ).order_by(Apartment.views.desc()).limit(n_recommendations - len(unique_recommendations)).all()
                
#                 unique_recommendations.extend(popular_apartments)
            
#             return unique_recommendations
            
#         except Exception as e:
#             logger.error(f"Ошибка при получении персонализированных рекомендаций: {e}")
#             return []


# # Создаем синглтон для использования в приложении
# recommender = RecommenderService()

import logging
import numpy as np
from typing import List, Dict, Optional, Any
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sqlalchemy.orm import Session
import pandas as pd

from app.models.apartment import Apartment
from app.models.favorite import Favorite

logger = logging.getLogger(__name__)


class RecommenderService:
    """
    Сервис для формирования рекомендаций по объектам недвижимости
    """
    def __init__(self):
        self.model = None
        self.apartments_data = None
        self.apartment_ids = None
        self.categorical_features = ['metro', 'way']
        self.numerical_features = ['price', 'minutes', 'rooms', 'total_area']
        self.preprocessor = None
        self.is_trained = False

    def train(self, db: Session) -> bool:
        """
        Обучение модели рекомендаций на основе данных из базы
        """
        try:
            # Получаем все квартиры из базы
            apartments = db.query(Apartment).all()
            
            if not apartments or len(apartments) < 5:
                logger.warning("Недостаточно данных для обучения модели рекомендаций")
                return False
            
            # Подготовка данных
            features = []
            self.apartment_ids = []
            
            for apartment in apartments:
                apartment_features = {
                    'metro': apartment.metro,
                    'price': apartment.price,
                    'minutes': apartment.minutes,
                    'way': apartment.way,
                    'rooms': apartment.rooms,
                    'total_area': apartment.total_area,
                }
                features.append(apartment_features)
                self.apartment_ids.append(apartment.id)
            
            self.apartments_data = features
            
            # Преобразуем список словарей в DataFrame
            features_df = pd.DataFrame(features)
            
            # Создание препроцессора для обработки категориальных и числовых признаков
            categorical_transformer = OneHotEncoder(handle_unknown='ignore')
            numerical_transformer = StandardScaler()
            
            self.preprocessor = ColumnTransformer(
                transformers=[
                    ('cat', categorical_transformer, self.categorical_features),
                    ('num', numerical_transformer, self.numerical_features)
                ])
            
            # Преобразование данных
            transformed_features = self.preprocessor.fit_transform(features_df)
            
            # Создание и обучение модели
            self.model = NearestNeighbors(
                n_neighbors=min(6, len(apartments)),  # Максимум 5 рекомендаций + 1 (сам объект)
                algorithm='auto',
                metric='euclidean'
            )
            self.model.fit(transformed_features)
            
            self.is_trained = True
            logger.info(f"Модель рекомендаций обучена на {len(apartments)} экземплярах")
            
            return True
            
        except Exception as e:
            logger.error(f"Ошибка при обучении модели рекомендаций: {e}")
            return False

    def get_similar_apartments(self, db: Session, apartment_id: int, n_recommendations: int = 5) -> List[Apartment]:
        """
        Получение списка похожих квартир для заданной квартиры
        """
        if not self.is_trained or not self.model:
            logger.warning("Модель рекомендаций не обучена")
            # Вместо повторной попытки обучения просто вернем пустой список
            return []
        
        try:
            # Получаем квартиру по ID
            apartment = db.query(Apartment).filter(Apartment.id == apartment_id).first()
            
            if not apartment:
                logger.warning(f"Квартира с ID {apartment_id} не найдена")
                return []
            
            # Подготовка входных данных
            apartment_features = {
                'metro': apartment.metro,
                'price': apartment.price,
                'minutes': apartment.minutes,
                'way': apartment.way,
                'rooms': apartment.rooms,
                'total_area': apartment.total_area,
            }
            
            # Преобразуем в DataFrame
            features_df = pd.DataFrame([apartment_features])
            
            # Преобразуем признаки
            transformed_features = self.preprocessor.transform(features_df)
            
            # Получаем рекомендации
            _, indices = self.model.kneighbors(transformed_features)
            
            # Получаем ID рекомендованных квартир, исключая текущую
            recommended_ids = [self.apartment_ids[i] for i in indices[0] if self.apartment_ids[i] != apartment_id][:n_recommendations]
            
            # Получаем объекты квартир по ID
            recommended_apartments = db.query(Apartment).filter(Apartment.id.in_(recommended_ids)).all()
            
            return recommended_apartments
            
        except Exception as e:
            logger.error(f"Ошибка при получении рекомендаций: {e}", exc_info=True)
            return []

    def get_recommendations_for_user(self, db: Session, user_id: int, n_recommendations: int = 5) -> List[Apartment]:
        """
        Получение персонализированных рекомендаций для пользователя на основе его избранных квартир
        """
        if not self.is_trained or not self.model:
            logger.warning("Модель рекомендаций не обучена")
            # Вместо повторной попытки обучения просто вернем популярные квартиры
            return db.query(Apartment).order_by(Apartment.views.desc()).limit(n_recommendations).all()
        
        try:
            # Получаем избранные квартиры пользователя
            favorite_ids = db.query(Favorite.apartment_id).filter(Favorite.user_id == user_id).all()
            favorite_ids = [fav[0] for fav in favorite_ids]
            
            if not favorite_ids:
                logger.info(f"У пользователя с ID {user_id} нет избранных квартир для формирования рекомендаций")
                # Возвращаем просто популярные квартиры (с наибольшим числом просмотров)
                return db.query(Apartment).order_by(Apartment.views.desc()).limit(n_recommendations).all()
            
            # Получаем рекомендации для каждой избранной квартиры
            all_recommendations = []
            for fav_id in favorite_ids:
                try:
                    recommendations = self.get_similar_apartments(db, fav_id, n_recommendations=3)
                    all_recommendations.extend(recommendations)
                except Exception as e:
                    logger.error(f"Ошибка при получении рекомендаций для квартиры {fav_id}: {e}")
                    continue
            
            # Удаляем дубликаты и избранные квартиры из рекомендаций
            unique_recommendations = []
            recommendation_ids = set()
            
            for apartment in all_recommendations:
                if apartment.id not in recommendation_ids and apartment.id not in favorite_ids:
                    unique_recommendations.append(apartment)
                    recommendation_ids.add(apartment.id)
                    if len(unique_recommendations) >= n_recommendations:
                        break
            
            # Если рекомендаций недостаточно, добавляем популярные квартиры
            if len(unique_recommendations) < n_recommendations:
                try:
                    popular_apartments = db.query(Apartment).filter(
                        ~Apartment.id.in_(recommendation_ids.union(favorite_ids))
                    ).order_by(Apartment.views.desc()).limit(n_recommendations - len(unique_recommendations)).all()
                    
                    unique_recommendations.extend(popular_apartments)
                except Exception as e:
                    logger.error(f"Ошибка при получении популярных квартир: {e}")
            
            return unique_recommendations
            
        except Exception as e:
            logger.error(f"Ошибка при получении персонализированных рекомендаций: {e}")
            # В случае ошибки возвращаем просто популярные квартиры
            return db.query(Apartment).order_by(Apartment.views.desc()).limit(n_recommendations).all()


# Создаем синглтон для использования в приложении
recommender = RecommenderService()