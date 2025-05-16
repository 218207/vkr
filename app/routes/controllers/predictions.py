from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.routes.deps import get_current_user
from app.services.price_predictor import price_predictor

router = APIRouter()


@router.post("/price")
def predict_apartment_price(
    *,
    db: Session = Depends(get_db),
    apartment_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Прогнозирование стоимости аренды квартиры на основе ее характеристик
    """
    # Проверяем, обучена ли модель
    if not price_predictor.is_trained:
        # Обучаем модель, если она еще не обучена
        success = price_predictor.train(db)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Не удалось обучить модель прогнозирования цен. Недостаточно данных.",
            )
    
    # Прогнозируем цену
    predicted_price = price_predictor.predict_price(apartment_data)
    
    if predicted_price is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Не удалось выполнить прогноз. Проверьте входные данные.",
        )
    
    return {
        "predicted_price": predicted_price,
        "message": "Рекомендуемая стоимость аренды на основе анализа рынка",
    }