import logging
import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config.database import get_db, engine, Base
from app.config.settings import settings
from app.routes.api import router as api_router
from app.services.data_loader import init_db
from app.services.price_predictor import price_predictor
from app.services.recommender import recommender

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Создание директории для CSV файлов, если ее нет
os.makedirs(os.path.join(os.path.dirname(__file__), "app", "data"), exist_ok=True)

# Создание экземпляра приложения
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение API роутеров
app.include_router(api_router, prefix=settings.API_V1_STR)


# События приложения
@app.on_event("startup")
async def startup_event():
    """
    Выполняется при запуске приложения
    """
    logger.info("Инициализация приложения...")
    
    # Создание таблиц в базе данных
    Base.metadata.create_all(bind=engine)
    
    # Инициализация базы данных начальными данными
    db = next(get_db())
    init_db(db)
    
    # Обучение моделей
    logger.info("Обучение модели прогнозирования цен...")
    price_predictor.train(db)
    
    logger.info("Обучение рекомендательной системы...")
    recommender.train(db)
    
    logger.info("Приложение инициализировано и готово к работе")


@app.get("/")
def read_root():
    """
    Корневой эндпоинт
    """
    return {
        "message": f"Добро пожаловать в API {settings.PROJECT_NAME}!",
        "docs_url": f"/docs"
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )