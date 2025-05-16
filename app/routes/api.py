from fastapi import APIRouter

from app.routes.controllers import users, auth, apartments, favorites, predictions, recommendations

# Создание основного роутера API
router = APIRouter()

# Подключение роутеров отдельных модулей
router.include_router(auth.router, prefix="/auth", tags=["authentication"])
router.include_router(users.router, prefix="/users", tags=["users"])
router.include_router(apartments.router, prefix="/apartments", tags=["apartments"])
router.include_router(favorites.router, prefix="/favorites", tags=["favorites"])
router.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])