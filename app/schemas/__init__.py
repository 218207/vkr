# Импорт схем
from app.schemas.user_schema import UserCreate, UserUpdate, UserInDB, User
from app.schemas.apartment_schema import ApartmentCreate, ApartmentUpdate, ApartmentInDB, Apartment
from app.schemas.favorite_schema import FavoriteCreate, FavoriteInDB, Favorite
from app.schemas.token_schema import Token, TokenPayload