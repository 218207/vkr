from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.config.database import Base


class Apartment(Base):
    __tablename__ = "apartments"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    metro = Column(String, index=True)
    price = Column(Float, index=True)
    minutes = Column(Integer)  # время до метро в минутах
    way = Column(String)  # способ добраться до метро (пешком/транспорт)
    provider = Column(String)  # источник объявления
    fee_percent = Column(Float)  # процент комиссии
    views = Column(Integer, default=0)  # количество просмотров
    storey = Column(Integer)  # этаж
    storeys = Column(Integer)  # количество этажей в доме
    rooms = Column(Integer, index=True)  # количество комнат
    total_area = Column(Float)  # общая площадь
    living_area = Column(Float)  # жилая площадь
    kitchen_area = Column(Float)  # площадь кухни
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Отношения
    owner = relationship("User", back_populates="apartments")
    favorites = relationship("Favorite", back_populates="apartment")