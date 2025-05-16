from typing import List, Optional
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.apartment import Apartment
from app.models.user import User
from app.schemas.apartment_schema import ApartmentCreate, ApartmentUpdate
from app.repositories.base import BaseRepository


class ApartmentRepository(BaseRepository[Apartment, ApartmentCreate, ApartmentUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: ApartmentCreate, owner_id: int
    ) -> Apartment:
        """Создание новой квартиры с указанием владельца"""
        obj_in_data = obj_in.dict()
        db_obj = Apartment(**obj_in_data, owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    
    def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Apartment]:
        """Получение списка квартир конкретного владельца"""
        return (
            db.query(Apartment)
            .filter(Apartment.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_latest(
        self, db: Session, *, skip: int = 0, limit: int = 10
    ) -> List[Apartment]:
        """Получение списка последних добавленных квартир"""
        return (
            db.query(Apartment)
            .order_by(desc(Apartment.created_at))
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def search(
        self,
        db: Session,
        *,
        metro: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        rooms: Optional[int] = None,
        min_area: Optional[float] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Apartment]:
        """Поиск квартир по различным критериям"""
        query = db.query(Apartment)
        
        if metro:
            query = query.filter(Apartment.metro == metro)
        if min_price is not None:
            query = query.filter(Apartment.price >= min_price)
        if max_price is not None:
            query = query.filter(Apartment.price <= max_price)
        if rooms:
            query = query.filter(Apartment.rooms == rooms)
        if min_area is not None:
            query = query.filter(Apartment.total_area >= min_area)
        
        return query.offset(skip).limit(limit).all()
    
    def increment_views(self, db: Session, *, id: int) -> Apartment:
        """Увеличение счетчика просмотров квартиры"""
        db_obj = db.query(Apartment).filter(Apartment.id == id).first()
        if db_obj:
            db_obj.views += 1
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
        return db_obj


apartment = ApartmentRepository(Apartment)