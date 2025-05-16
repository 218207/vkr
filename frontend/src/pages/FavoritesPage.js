import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { favoriteService } from '../services/api';
import ApartmentCard from '../components/ApartmentCard';

const FavoritesPage = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchFavorites();
        }
    }, [isAuthenticated]);

    const fetchFavorites = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await favoriteService.getFavorites();
            setFavorites(response.data);
        } catch (error) {
            console.error('Ошибка при загрузке избранного:', error);
            setError('Не удалось загрузить список избранного. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    // Обработка переключения избранного
    const handleToggleFavorite = async (apartmentId) => {
        try {
            await favoriteService.removeFromFavorites(apartmentId);
            // Обновляем список избранного, удаляя квартиру
            setFavorites(prevFavorites => 
                prevFavorites.filter(apartment => apartment.id !== apartmentId)
            );
        } catch (error) {
            console.error('Ошибка при удалении из избранного:', error);
        }
    };

    // Если пользователь не авторизован, показываем сообщение
    if (!isAuthenticated) {
        return (
            <Container className="py-5">
                <Alert variant="warning">
                    Для доступа к избранному необходимо авторизоваться.
                </Alert>
                <Button as={Link} to="/login" variant="primary">
                    Войти
                </Button>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h1 className="mb-4">Избранное</h1>
            
            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Загрузка...</span>
                    </Spinner>
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : favorites.length === 0 ? (
                <Alert variant="info">
                    У вас пока нет избранных квартир. <Link to="/apartments">Просмотрите доступные квартиры</Link> и добавьте понравившиеся в избранное.
                </Alert>
            ) : (
                <>
                    <p className="mb-4">В избранном: {favorites.length} {getFavoritesWord(favorites.length)}</p>
                    <Row>
                        {favorites.map(apartment => (
                            <Col md={6} lg={4} key={apartment.id} className="mb-4">
                                <ApartmentCard
                                    apartment={apartment}
                                    isFavorite={true}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            </Col>
                        ))}
                    </Row>
                </>
            )}
        </Container>
    );
};

// Вспомогательная функция для склонения слова "квартира"
const getFavoritesWord = (count) => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'квартир';
    }
    
    if (lastDigit === 1) {
        return 'квартира';
    }
    
    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'квартиры';
    }
    
    return 'квартир';
};

export default FavoritesPage;