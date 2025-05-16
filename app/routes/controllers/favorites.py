from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.user import User
from app.models.apartment import Apartment
from app.repositories.favorite_repository import favorite as favorite_repository
from app.repositories.apartment_repository import apartment as apartment_repository
from app.routes.deps import get_current_user
from app.schemas.favorite_schema import Favorite, FavoriteCreate
from app.schemas.apartment_schema import Apartment as ApartmentSchema

router = APIRouter()


@router.get("/", response_model=List[ApartmentSchema])
def read_user_favorites(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Получение списка избранных квартир текущего пользователя
    """
    apartments = favorite_repository.get_user_favorites(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return apartments


@router.post("/", response_model=Favorite, status_code=status.HTTP_201_CREATED)
def create_favorite(
    *,
    db: Session = Depends(get_db),
    favorite_in: FavoriteCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Добавление квартиры в избранное текущего пользователя
    """
    # Проверяем, существует ли такая квартира
    apartment = apartment_repository.get(db=db, id=favorite_in.apartment_id)
    if not apartment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Квартира не найдена",
        )
    
    # Проверяем, не добавлена ли уже эта квартира в избранное
    existing_favorite = favorite_repository.get_by_user_and_apartment(
        db=db, user_id=current_user.id, apartment_id=favorite_in.apartment_id
    )
    if existing_favorite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Эта квартира уже добавлена в избранное",
        )
    
    favorite = favorite_repository.create_with_user(
        db=db, obj_in=favorite_in, user_id=current_user.id
    )
    return favorite


@router.delete("/{apartment_id}", response_model=Favorite)
def delete_favorite(
    *,
    db: Session = Depends(get_db),
    apartment_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Удаление квартиры из избранного текущего пользователя
    """
    favorite = favorite_repository.get_by_user_and_apartment(
        db=db, user_id=current_user.id, apartment_id=apartment_id
    )
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Квартира не найдена в избранном",
        )
    
    favorite = favorite_repository.remove_by_user_and_apartment(
        db=db, user_id=current_user.id, apartment_id=apartment_id
    )
    return favorite