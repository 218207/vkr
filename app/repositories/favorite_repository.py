from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.favorite import Favorite
from app.models.apartment import Apartment
from app.schemas.favorite_schema import FavoriteCreate, FavoriteInDB
from app.repositories.base import BaseRepository


class FavoriteRepository(BaseRepository[Favorite, FavoriteCreate, FavoriteInDB]):
    def get_by_user_and_apartment(
        self, db: Session, *, user_id: int, apartment_id: int
    ) -> Optional[Favorite]:
        """Получение записи избранного по id пользователя и id квартиры"""
        return (
            db.query(Favorite)
            .filter(
                Favorite.user_id == user_id,
                Favorite.apartment_id == apartment_id
            )
            .first()
        )
    
    def get_user_favorites(
        self, db: Session, *, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[Apartment]:
        """Получение списка избранных квартир пользователя"""
        return (
            db.query(Apartment)
            .join(Favorite, Favorite.apartment_id == Apartment.id)
            .filter(Favorite.user_id == user_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def create_with_user(
        self, db: Session, *, obj_in: FavoriteCreate, user_id: int
    ) -> Favorite:
        """Создание новой записи избранного для пользователя"""
        db_obj = Favorite(
            user_id=user_id,
            apartment_id=obj_in.apartment_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def remove_by_user_and_apartment(
        self, db: Session, *, user_id: int, apartment_id: int
    ) -> Favorite:
        """Удаление записи избранного по id пользователя и id квартиры"""
        obj = (
            db.query(Favorite)
            .filter(
                Favorite.user_id == user_id,
                Favorite.apartment_id == apartment_id
            )
            .first()
        )
        if obj:
            db.delete(obj)
            db.commit()
        return obj


favorite = FavoriteRepository(Favorite)