from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


# Общие атрибуты
class UserBase(BaseModel):
    username: str
    email: EmailStr
    is_active: Optional[bool] = True


# Свойства для создания пользователя
class UserCreate(UserBase):
    password: str


# Свойства для обновления пользователя
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None


# Свойства в БД
class UserInDB(UserBase):
    id: int
    hashed_password: str

    class Config:
        orm_mode = True


# Свойства для возврата клиенту
class User(UserBase):
    id: int

    class Config:
        orm_mode = True