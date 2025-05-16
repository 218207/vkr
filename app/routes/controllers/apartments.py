# from typing import Any, List, Optional

# from fastapi import APIRouter, Depends, HTTPException, Query, status
# from sqlalchemy.orm import Session
# import logging

# from app.config.database import get_db
# from app.models.user import User
# from app.repositories.apartment_repository import apartment as apartment_repository
# from app.routes.deps import get_current_user
# from app.schemas.apartment_schema import Apartment, ApartmentCreate, ApartmentUpdate

# logger = logging.getLogger(__name__)

# router = APIRouter()


# @router.get("/", response_model=List[Apartment])
# def read_apartments(
#     db: Session = Depends(get_db),
#     skip: int = 0,
#     limit: int = 100,
#     metro: Optional[str] = None,
#     min_price: Optional[float] = None,
#     max_price: Optional[float] = None,
#     rooms: Optional[int] = None,
#     min_area: Optional[float] = None,
# ) -> Any:
#     """
#     Получение списка квартир с возможностью фильтрации
#     """
#     # Если указаны параметры фильтрации, используем метод поиска
#     if metro or min_price is not None or max_price is not None or rooms or min_area is not None:
#         apartments = apartment_repository.search(
#             db,
#             metro=metro,
#             min_price=min_price,
#             max_price=max_price,
#             rooms=rooms,
#             min_area=min_area,
#             skip=skip,
#             limit=limit
#         )
#     else:
#         # Иначе получаем все квартиры
#         apartments = apartment_repository.get_multi(db, skip=skip, limit=limit)
    
#     return apartments


# @router.get("/latest", response_model=List[Apartment])
# def read_latest_apartments(
#     db: Session = Depends(get_db),
#     skip: int = 0,
#     limit: int = 10,
# ) -> Any:
#     """
#     Получение списка последних добавленных квартир
#     """
#     apartments = apartment_repository.get_latest(db, skip=skip, limit=limit)
#     return apartments


# @router.post("/", response_model=Apartment, status_code=status.HTTP_201_CREATED)
# def create_apartment(
#     *,
#     db: Session = Depends(get_db),
#     apartment_in: ApartmentCreate,
#     current_user: User = Depends(get_current_user),
# ) -> Any:
#     """
#     Создание новой квартиры
#     """
#     apartment = apartment_repository.create_with_owner(
#         db=db, obj_in=apartment_in, owner_id=current_user.id
#     )
#     return apartment


# @router.get("/my", response_model=List[Apartment])
# def read_user_apartments(
#     db: Session = Depends(get_db),
#     skip: int = 0,
#     limit: int = 100,
#     current_user: User = Depends(get_current_user),
# ) -> Any:
#     """
#     Получение списка квартир текущего пользователя
#     """
#     apartments = apartment_repository.get_multi_by_owner(
#         db=db, owner_id=current_user.id, skip=skip, limit=limit
#     )
#     return apartments


# @router.get("/{apartment_id}", response_model=Apartment)
# def read_apartment(
#     *,
#     db: Session = Depends(get_db),
#     apartment_id: int,
# ) -> Any:
#     """
#     Получение конкретной квартиры по ID
#     """
#     logger.info(f"Запрос квартиры с ID: {apartment_id}")
#     try:
#         apartment = apartment_repository.get(db=db, id=apartment_id)
#         logger.info(f"Результат запроса: {apartment}")
        
#         if not apartment:
#             logger.warning(f"Квартира с ID {apartment_id} не найдена")
#             raise HTTPException(
#                 status_code=status.HTTP_404_NOT_FOUND,
#                 detail="Квартира не найдена",
#             )
        
#         try:
#             # Увеличиваем счетчик просмотров
#             apartment_repository.increment_views(db=db, id=apartment_id)
#         except Exception as e:
#             # Игнорируем ошибки при увеличении счетчика просмотров
#             logger.error(f"Ошибка при увеличении счетчика просмотров: {e}")
        
#         return apartment
#     except Exception as e:
#         logger.error(f"Ошибка при получении квартиры: {str(e)}", exc_info=True)
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Ошибка сервера: {str(e)}"
#         )


# @router.patch("/{apartment_id}", response_model=Apartment)
# def update_apartment(
#     *,
#     db: Session = Depends(get_db),
#     apartment_id: int,
#     apartment_in: ApartmentUpdate,
#     current_user: User = Depends(get_current_user),
# ) -> Any:
#     """
#     Обновление информации о квартире
#     """
#     apartment = apartment_repository.get(db=db, id=apartment_id)
#     if not apartment:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Квартира не найдена",
#         )
#     if apartment.owner_id != current_user.id:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Недостаточно прав для редактирования этой квартиры",
#         )
    
#     apartment = apartment_repository.update(db=db, db_obj=apartment, obj_in=apartment_in)
#     return apartment


# @router.delete("/{apartment_id}", response_model=Apartment)
# def delete_apartment(
#     *,
#     db: Session = Depends(get_db),
#     apartment_id: int,
#     current_user: User = Depends(get_current_user),
# ) -> Any:
#     """
#     Удаление квартиры
#     """
#     apartment = apartment_repository.get(db=db, id=apartment_id)
#     if not apartment:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND,
#             detail="Квартира не найдена",
#         )
#     if apartment.owner_id != current_user.id:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Недостаточно прав для удаления этой квартиры",
#         )
    
#     apartment = apartment_repository.remove(db=db, id=apartment_id)
#     return apartment

from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
import logging

from app.config.database import get_db
from app.models.user import User
from app.repositories.apartment_repository import apartment as apartment_repository
from app.routes.deps import get_current_user
from app.schemas.apartment_schema import Apartment, ApartmentCreate, ApartmentUpdate

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=List[Apartment])
def read_apartments(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    metro: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    rooms: Optional[int] = None,
    min_area: Optional[float] = None,
) -> Any:
    """
    Получение списка квартир с возможностью фильтрации
    """
    try:
        logger.info(f"Запрос квартир с фильтрами: metro={metro}, min_price={min_price}, max_price={max_price}, rooms={rooms}, min_area={min_area}")
        
        # Если указаны параметры фильтрации, используем метод поиска
        if metro or min_price is not None or max_price is not None or rooms or min_area is not None:
            apartments = apartment_repository.search(
                db,
                metro=metro,
                min_price=min_price,
                max_price=max_price,
                rooms=rooms,
                min_area=min_area,
                skip=skip,
                limit=limit
            )
        else:
            # Иначе получаем все квартиры
            apartments = apartment_repository.get_multi(db, skip=skip, limit=limit)
        
        logger.info(f"Найдено {len(apartments)} квартир")
        return apartments
    except Exception as e:
        logger.error(f"Ошибка при поиске квартир: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера при поиске квартир: {str(e)}"
        )


@router.get("/latest", response_model=List[Apartment])
def read_latest_apartments(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10,
) -> Any:
    """
    Получение списка последних добавленных квартир
    """
    apartments = apartment_repository.get_latest(db, skip=skip, limit=limit)
    return apartments


@router.post("/", response_model=Apartment, status_code=status.HTTP_201_CREATED)
def create_apartment(
    *,
    db: Session = Depends(get_db),
    apartment_in: ApartmentCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Создание новой квартиры
    """
    apartment = apartment_repository.create_with_owner(
        db=db, obj_in=apartment_in, owner_id=current_user.id
    )
    return apartment


@router.get("/my", response_model=List[Apartment])
def read_user_apartments(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Получение списка квартир текущего пользователя
    """
    apartments = apartment_repository.get_multi_by_owner(
        db=db, owner_id=current_user.id, skip=skip, limit=limit
    )
    return apartments


@router.get("/{apartment_id}", response_model=Apartment)
def read_apartment(
    *,
    db: Session = Depends(get_db),
    apartment_id: int,
) -> Any:
    """
    Получение конкретной квартиры по ID
    """
    logger.info(f"Запрос квартиры с ID: {apartment_id}")
    try:
        apartment = apartment_repository.get(db=db, id=apartment_id)
        logger.info(f"Результат запроса: {apartment}")
        
        if not apartment:
            logger.warning(f"Квартира с ID {apartment_id} не найдена")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Квартира не найдена",
            )
        
        try:
            # Увеличиваем счетчик просмотров
            apartment_repository.increment_views(db=db, id=apartment_id)
        except Exception as e:
            # Игнорируем ошибки при увеличении счетчика просмотров
            logger.error(f"Ошибка при увеличении счетчика просмотров: {e}")
        
        return apartment
    except Exception as e:
        logger.error(f"Ошибка при получении квартиры: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка сервера: {str(e)}"
        )


@router.patch("/{apartment_id}", response_model=Apartment)
def update_apartment(
    *,
    db: Session = Depends(get_db),
    apartment_id: int,
    apartment_in: ApartmentUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Обновление информации о квартире
    """
    apartment = apartment_repository.get(db=db, id=apartment_id)
    if not apartment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Квартира не найдена",
        )
    if apartment.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для редактирования этой квартиры",
        )
    
    apartment = apartment_repository.update(db=db, db_obj=apartment, obj_in=apartment_in)
    return apartment


@router.delete("/{apartment_id}", response_model=Apartment)
def delete_apartment(
    *,
    db: Session = Depends(get_db),
    apartment_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Удаление квартиры
    """
    apartment = apartment_repository.get(db=db, id=apartment_id)
    if not apartment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Квартира не найдена",
        )
    if apartment.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав для удаления этой квартиры",
        )
    
    apartment = apartment_repository.remove(db=db, id=apartment_id)
    return apartment