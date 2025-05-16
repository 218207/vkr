from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from app.config.database import get_db
from app.models.user import User
from app.repositories.apartment_repository import apartment as apartment_repository
from app.routes.deps import get_current_user
from app.schemas.apartment_schema import Apartment
from app.services.recommender import recommender

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/similar/{apartment_id}", response_model=List[Apartment])
def get_similar_apartments(
    *,
    db: Session = Depends(get_db),
    apartment_id: int,
    limit: int = 5,
) -> Any:
    """
    Получение похожих квартир для заданной квартиры
    """
    try:
        # Проверяем, существует ли такая квартира
        apartment = apartment_repository.get(db=db, id=apartment_id)
        if not apartment:
            logger.warning(f"Квартира с ID {apartment_id} не найдена")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Квартира не найдена",
            )
        
        # Проверяем, обучена ли модель рекомендаций
        if not recommender.is_trained:
            # Обучаем модель, если она еще не обучена
            logger.info("Модель рекомендаций не обучена, пытаемся обучить")
            success = recommender.train(db)
            if not success:
                logger.warning("Не удалось обучить модель рекомендаций")
                # Возвращаем пустой список вместо ошибки
                return []
        
        # Получаем рекомендации
        similar_apartments = recommender.get_similar_apartments(
            db=db, apartment_id=apartment_id, n_recommendations=limit
        )
        
        return similar_apartments
    except Exception as e:
        # Логируем ошибку, но возвращаем пустой список вместо ошибки
        logger.error(f"Ошибка при получении похожих квартир: {str(e)}", exc_info=True)
        return []


@router.get("/personalized", response_model=List[Apartment])
def get_personalized_recommendations(
    *,
    db: Session = Depends(get_db),
    limit: int = 5,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Получение персонализированных рекомендаций для текущего пользователя
    """
    try:
        # Проверяем, обучена ли модель рекомендаций
        if not recommender.is_trained:
            # Обучаем модель, если она еще не обучена
            logger.info("Модель рекомендаций не обучена, пытаемся обучить")
            success = recommender.train(db)
            if not success:
                logger.warning("Не удалось обучить модель рекомендаций")
                # Возвращаем популярные квартиры вместо ошибки
                return db.query(Apartment).order_by(Apartment.views.desc()).limit(limit).all()
        
        # Получаем персонализированные рекомендации
        recommended_apartments = recommender.get_recommendations_for_user(
            db=db, user_id=current_user.id, n_recommendations=limit
        )
        
        return recommended_apartments
    except Exception as e:
        # Логируем ошибку, но возвращаем популярные квартиры вместо ошибки
        logger.error(f"Ошибка при получении персонализированных рекомендаций: {str(e)}", exc_info=True)
        return db.query(Apartment).order_by(Apartment.views.desc()).limit(limit).all()