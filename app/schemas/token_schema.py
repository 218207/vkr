from typing import Optional
from pydantic import BaseModel


# Свойства для создания записи избранного
class FavoriteCreate(BaseModel):
    apartment_id: int


# Свойства в БД
class FavoriteInDB(FavoriteCreate):
    id: int
    user_id: int

    class Config:
        orm_mode = True


# Свойства для возврата клиенту
class Favorite(FavoriteInDB):
    class Config:
        orm_mode = True

class Token(BaseModel):
    """
    Схема для токена доступа
    """
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    """
    Схема для полезной нагрузки токена
    """
    sub: Optional[int] = None