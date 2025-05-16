from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field


# Общие атрибуты
class ApartmentBase(BaseModel):
    metro: str
    price: float
    minutes: int
    way: str
    provider: Optional[str] = None
    fee_percent: Optional[float] = 0
    storey: int
    storeys: int
    rooms: int
    total_area: float
    living_area: Optional[float] = None
    kitchen_area: Optional[float] = None


# Свойства для создания квартиры
class ApartmentCreate(ApartmentBase):
    pass


# Свойства для обновления квартиры
class ApartmentUpdate(BaseModel):
    metro: Optional[str] = None
    price: Optional[float] = None
    minutes: Optional[int] = None
    way: Optional[str] = None
    provider: Optional[str] = None
    fee_percent: Optional[float] = None
    views: Optional[int] = None
    storey: Optional[int] = None
    storeys: Optional[int] = None
    rooms: Optional[int] = None
    total_area: Optional[float] = None
    living_area: Optional[float] = None
    kitchen_area: Optional[float] = None


# Свойства в БД
class ApartmentInDB(ApartmentBase):
    id: int
    owner_id: int
    views: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        orm_mode = True


# Свойства для возврата клиенту
class Apartment(ApartmentInDB):
    class Config:
        orm_mode = True