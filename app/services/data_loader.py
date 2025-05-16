import csv
import logging
import os
from typing import List, Dict, Any

from sqlalchemy.orm import Session

from app.models.apartment import Apartment
from app.models.user import User
from app.repositories.user_repository import user as user_repository
from app.schemas.user_schema import UserCreate


logger = logging.getLogger(__name__)


def create_initial_user(db: Session) -> User:
    """
    Создает администратора системы, если его еще нет
    """
    user = user_repository.get_by_email(db, email="admin@example.com")
    if not user:
        user_in = UserCreate(
            email="admin@example.com",
            username="admin",
            password="admin123",
            is_active=True
        )
        user = user_repository.create(db, obj_in=user_in)
        logger.info("Создан пользователь admin@example.com")
    return user


def load_apartments_from_csv(
    db: Session, csv_file_path: str, owner_id: int
) -> List[Apartment]:
    """
    Загружает данные о квартирах из CSV-файла в базу данных
    """
    apartments = []
    
    # Проверяем, существует ли файл
    if not os.path.isfile(csv_file_path):
        logger.warning(f"Файл {csv_file_path} не найден")
        return apartments
    
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as f:
            # Проверяем первую строку, чтобы понять формат CSV
            first_line = f.readline().strip()
            f.seek(0)  # Возвращаемся в начало файла
            
            # Если первый символ запятая, значит первый столбец без заголовка
            has_unnamed_first_column = first_line.startswith(',')
            
            if has_unnamed_first_column:
                # Используем csv.reader вместо DictReader для большего контроля
                reader = csv.reader(f)
                # Пропускаем заголовок
                headers = next(reader)
                
                for row in reader:
                    # Пропускаем первый столбец (индекс) и используем остальные данные
                    # Предполагаем, что порядок следующий: metro,price,minutes,way,provider,fee_percent,views,storey,storeys,rooms,total_area,living_area,kitchen_area
                    try:
                        apartment_data = {
                            "metro": row[1] if len(row) > 1 else "",
                            "price": float(row[2]) if len(row) > 2 and row[2] else 0.0,
                            "minutes": int(row[3]) if len(row) > 3 and row[3] else 0,
                            "way": row[4] if len(row) > 4 else "пешком",
                            "provider": row[5] if len(row) > 5 else "",
                            "fee_percent": float(row[6]) if len(row) > 6 and row[6] else 0.0,
                            "views": int(row[7]) if len(row) > 7 and row[7] else 0,
                            "storey": int(row[8]) if len(row) > 8 and row[8] else 0,
                            "storeys": int(row[9]) if len(row) > 9 and row[9] else 0,
                            "rooms": int(row[10]) if len(row) > 10 and row[10] else 0,
                            "total_area": float(row[11]) if len(row) > 11 and row[11] else 0.0,
                            "living_area": float(row[12]) if len(row) > 12 and row[12] else None,
                            "kitchen_area": float(row[13]) if len(row) > 13 and row[13] else None,
                            "owner_id": owner_id
                        }
                        
                        # Вывод данных для отладки
                        logger.debug(f"Загрузка квартиры: {apartment_data}")
                        
                        # Создаем объект квартиры
                        apartment = Apartment(**apartment_data)
                        db.add(apartment)
                        apartments.append(apartment)
                    except Exception as row_error:
                        logger.error(f"Ошибка при обработке строки {row}: {row_error}")
            else:
                # Используем стандартный DictReader, если CSV имеет обычный формат
                reader = csv.DictReader(f)
                
                for row in reader:
                    try:
                        apartment_data = {
                            "metro": row.get("metro", ""),
                            "price": float(row.get("price", 0)),
                            "minutes": int(row.get("minutes", 0)),
                            "way": row.get("way", "пешком"),
                            "provider": row.get("provider", ""),
                            "fee_percent": float(row.get("fee_percent", 0)),
                            "views": int(row.get("views", 0)),
                            "storey": int(row.get("storey", 0)),
                            "storeys": int(row.get("storeys", 0)),
                            "rooms": int(row.get("rooms", 0)),
                            "total_area": float(row.get("total_area", 0)),
                            "living_area": float(row.get("living_area")) if row.get("living_area") else None,
                            "kitchen_area": float(row.get("kitchen_area")) if row.get("kitchen_area") else None,
                            "owner_id": owner_id
                        }
                        
                        # Вывод данных для отладки
                        logger.debug(f"Загрузка квартиры: {apartment_data}")
                        
                        # Создаем объект квартиры
                        apartment = Apartment(**apartment_data)
                        db.add(apartment)
                        apartments.append(apartment)
                    except Exception as row_error:
                        logger.error(f"Ошибка при обработке строки {row}: {row_error}")
            
            db.commit()
            logger.info(f"Загружено {len(apartments)} квартир из CSV")
    
    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка при загрузке данных из CSV: {e}")
    
    return apartments


def init_db(db: Session) -> None:
    """
    Инициализирует базу данных начальными данными
    """
    # Создаем администратора
    user = create_initial_user(db)
    
    # Проверяем, есть ли уже квартиры в базе
    existing_apartments = db.query(Apartment).count()
    if existing_apartments == 0:
        # Загружаем квартиры из CSV
        csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "apartments.csv")
        load_apartments_from_csv(db, csv_path, user.id)
        logger.info("База данных инициализирована")
    else:
        logger.info(f"В базе данных уже есть {existing_apartments} квартир")