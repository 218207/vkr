import React, { useContext, useState } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { favoriteService } from '../services/api';

const ApartmentCard = ({ apartment, isFavorite, onToggleFavorite }) => {
    const { isAuthenticated } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    // Функция для форматирования цены
    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU').format(price);
    };

    // Обработка добавления/удаления из избранного
    const handleToggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            alert('Для добавления в избранное необходимо авторизоваться');
            return;
        }

        setLoading(true);
        try {
            if (isFavorite) {
                await favoriteService.removeFromFavorites(apartment.id);
            } else {
                await favoriteService.addToFavorites(apartment.id);
            }
            
            if (onToggleFavorite) {
                onToggleFavorite(apartment.id);
            }
        } catch (error) {
            console.error('Ошибка при изменении избранного:', error);
        } finally {
            setLoading(false);
        }
    };

    // Генерация URL случайного изображения квартиры
    const getRandomApartmentImage = () => {
        const imageId = apartment.id % 10 + 1; // От 1 до 10
        return `https://source.unsplash.com/random/300x200/?apartment,interior,${imageId}`;
    };

    return (
        <Card className="apartment-card h-100 shadow-sm">
            {isAuthenticated && (
                <Button 
                    variant={isFavorite ? "danger" : "outline-danger"}
                    className="btn-favorite rounded-circle" 
                    onClick={handleToggleFavorite}
                    disabled={loading}
                >
                    <i className={`bi bi-heart${isFavorite ? '-fill' : ''}`}></i>
                </Button>
            )}
            <Card.Img variant="top" src={getRandomApartmentImage()} alt={`Квартира ${apartment.id}`} />
            <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                    <Badge bg="danger">{apartment.metro}</Badge>
                    <Badge bg="primary">{apartment.rooms} комн.</Badge>
                </div>
                <Card.Title className="mb-0">{formatPrice(apartment.price)} ₽/мес</Card.Title>
                <Card.Text className="text-muted small">
                    {apartment.total_area} м² • {apartment.storey}/{apartment.storeys} этаж
                </Card.Text>
                <Card.Text>
                    {apartment.minutes} мин. {apartment.way === 'пешком' ? 'пешком' : 'транспортом'} до метро
                </Card.Text>
            </Card.Body>
            <Card.Footer className="bg-white">
                <Button as={Link} to={`/apartments/${apartment.id}`} variant="primary" className="w-100">
                    Подробнее
                </Button>
            </Card.Footer>
        </Card>
    );
};

export default ApartmentCard;