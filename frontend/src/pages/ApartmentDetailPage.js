import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Carousel, Modal } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apartmentService, favoriteService, recommendationService, authService } from '../services/api';
import ApartmentCard from '../components/ApartmentCard';

const ApartmentDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useContext(AuthContext);
    
    const [apartment, setApartment] = useState(null);
    const [owner, setOwner] = useState(null);
    const [similarApartments, setSimilarApartments] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [toggleFavoriteLoading, setToggleFavoriteLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Загрузка информации о квартире
                const response = await apartmentService.getApartment(id);
                setApartment(response.data);
                
                // Загрузка информации о владельце
                try {
                    // Если такого метода нет, добавить его в authService или другой подходящий сервис
                    const ownerResponse = await authService.getUserById(response.data.owner_id);
                    setOwner(ownerResponse.data);
                } catch (ownerError) {
                    console.error('Ошибка при загрузке информации о владельце:', ownerError);
                }
                
                // Если пользователь авторизован, загружаем избранное
                if (isAuthenticated) {
                    try {
                        const favoritesResponse = await favoriteService.getFavorites();
                        const favoriteIds = favoritesResponse.data.map(apt => apt.id);
                        setFavorites(favoriteIds);
                        setIsFavorite(favoriteIds.includes(Number(id)));
                    } catch (favError) {
                        console.error('Ошибка при загрузке избранного:', favError);
                        // Игнорируем ошибку загрузки избранного
                    }
                }
                
                // Загрузка похожих квартир
                try {
                    const similarResponse = await recommendationService.getSimilarApartments(id);
                    setSimilarApartments(similarResponse.data);
                } catch (recError) {
                    console.error('Ошибка при загрузке рекомендаций:', recError);
                    setSimilarApartments([]);
                    // Игнорируем ошибку загрузки рекомендаций
                }
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                console.error('Детали ошибки:', {
                    response: error.response,
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data
                });
                setError('Не удалось загрузить информацию о квартире. Пожалуйста, попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, isAuthenticated]);

    // Обработка переключения избранного
    const handleToggleFavorite = async () => {
        if (!isAuthenticated) {
            alert('Для добавления в избранное необходимо авторизоваться');
            return;
        }

        setToggleFavoriteLoading(true);
        try {
            if (isFavorite) {
                await favoriteService.removeFromFavorites(id);
            } else {
                await favoriteService.addToFavorites(id);
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Ошибка при изменении избранного:', error);
        } finally {
            setToggleFavoriteLoading(false);
        }
    };

    // Функции для работы с модальным окном подтверждения удаления
    const handleShowDeleteModal = () => {
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
    };

    // Функция для запуска процесса удаления, теперь просто показывает модальное окно
    const handleDelete = () => {
        handleShowDeleteModal();
    };

    // Новая функция для подтверждения удаления
    const confirmDelete = async () => {
        try {
            await apartmentService.deleteApartment(id);
            navigate('/apartments');
        } catch (error) {
            console.error('Ошибка при удалении квартиры:', error);
            alert('Не удалось удалить квартиру. Пожалуйста, попробуйте позже.');
        }
        handleCloseDeleteModal();
    };

    // Форматирование цены
    const formatPrice = (price) => {
        if (price === undefined || price === null) {
            return '0';
        }
        return new Intl.NumberFormat('ru-RU').format(price);
    };

    // Генерация URL случайных изображений квартиры
    const getApartmentImages = () => {
        const images = [];
        for (let i = 1; i <= 5; i++) {
            images.push(`https://source.unsplash.com/random/800x600/?apartment,interior,${id}-${i}`);
        }
        return images;
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </Spinner>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
                <Button as={Link} to="/apartments" variant="primary">
                    Вернуться к списку квартир
                </Button>
            </Container>
        );
    }

    if (!apartment) {
        return (
            <Container className="py-5">
                <Alert variant="warning">Квартира не найдена</Alert>
                <Button as={Link} to="/apartments" variant="primary">
                    Вернуться к списку квартир
                </Button>
            </Container>
        );
    }

    const isOwner = user && apartment.owner_id === user.id;

    return (
        <Container className="py-4">
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="mb-0">
                            Квартира {apartment.rooms}-комн., {apartment.total_area} м²
                        </h1>
                        <div>
                            {isOwner ? (
                                <div className="d-flex gap-2">
                                    <Button 
                                        as={Link} 
                                        to={`/apartments/${apartment.id}/edit`} 
                                        variant="outline-primary"
                                    >
                                        Редактировать
                                    </Button>
                                    <Button 
                                        variant="outline-danger"
                                        onClick={handleDelete}
                                    >
                                        Удалить
                                    </Button>
                                </div>
                            ) : isAuthenticated && (
                                <Button 
                                    variant={isFavorite ? "danger" : "outline-danger"}
                                    onClick={handleToggleFavorite}
                                    disabled={toggleFavoriteLoading}
                                >
                                    {toggleFavoriteLoading ? (
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <>
                                            <i className={`bi bi-heart${isFavorite ? '-fill' : ''} me-2`}></i>
                                            {isFavorite ? 'В избранном' : 'Добавить в избранное'}
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col lg={8}>
                    {/* Карусель изображений */}
                    <Carousel className="mb-4 shadow-sm">
                        {getApartmentImages().map((image, index) => (
                            <Carousel.Item key={index}>
                                <img
                                    className="d-block w-100"
                                    style={{ height: '500px', objectFit: 'cover' }}
                                    src={image}
                                    alt={`Фото квартиры ${index + 1}`}
                                />
                            </Carousel.Item>
                        ))}
                    </Carousel>
                    
                    {/* Описание квартиры */}
                    <Card className="mb-4 shadow-sm">
                        <Card.Body>
                            <Card.Title>Описание</Card.Title>
                            <Row className="mb-3">
                                <Col xs={6} md={3} className="mb-2">
                                    <div className="text-muted">Комнат</div>
                                    <div className="fw-bold">{apartment.rooms}</div>
                                </Col>
                                <Col xs={6} md={3} className="mb-2">
                                    <div className="text-muted">Общая площадь</div>
                                    <div className="fw-bold">{apartment.total_area} м²</div>
                                </Col>
                                <Col xs={6} md={3} className="mb-2">
                                    <div className="text-muted">Жилая площадь</div>
                                    <div className="fw-bold">{apartment.living_area || '-'} м²</div>
                                </Col>
                                <Col xs={6} md={3} className="mb-2">
                                    <div className="text-muted">Площадь кухни</div>
                                    <div className="fw-bold">{apartment.kitchen_area || '-'} м²</div>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col xs={6} md={3} className="mb-2">
                                    <div className="text-muted">Этаж</div>
                                    <div className="fw-bold">{apartment.storey} из {apartment.storeys}</div>
                                </Col>
                                <Col xs={6} md={3} className="mb-2">
                                    <div className="text-muted">Метро</div>
                                    <div className="fw-bold">{apartment.metro}</div>
                                </Col>
                                <Col xs={12} md={6} className="mb-2">
                                    <div className="text-muted">До метро</div>
                                    <div className="fw-bold">{apartment.minutes} мин. {apartment.way}</div>
                                </Col>
                            </Row>
                            <div className="mt-3">
                                <p>
                                    Сдается уютная {apartment.rooms}-комнатная квартира в хорошем состоянии.
                                    Удобное расположение рядом с метро {apartment.metro}.
                                    В квартире есть все необходимое для комфортного проживания.
                                </p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    {/* Информация о цене и владельце */}
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <h3 className="mb-0">{formatPrice(apartment.price)} ₽/мес</h3>
                                    {apartment.fee_percent > 0 && (
                                        <small className="text-danger">Комиссия {apartment.fee_percent}%</small>
                                    )}
                                </div>
                                <Badge bg="primary" className="p-2">
                                    {apartment.views} {getViewsWord(apartment.views)}
                                </Badge>
                            </div>
                            <hr />
                            <div className="mb-3">
                                <div className="text-muted mb-1">Источник объявления</div>
                                <div className="fw-bold">{apartment.provider || 'Собственник'}</div>
                            </div>
                            <div className="mb-3">
                                <div className="text-muted mb-1">Дата публикации</div>
                                <div className="fw-bold">{formatDate(apartment.created_at)}</div>
                            </div>
                            
                            {/* Информация о владельце */}
                            <div className="mb-3">
                                <div className="text-muted mb-1">Владелец</div>
                                <div className="fw-bold">
                                    {owner ? owner.username : 'Админ'}
                                </div>
                            </div>
                            {owner && (
                                <div className="mb-3">
                                    <div className="text-muted mb-1">Email для связи</div>
                                    <div className="fw-bold">
                                        <a href={`mailto:${owner.email}`}>{owner.email}</a>
                                    </div>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            {/* Похожие квартиры */}
            {similarApartments.length > 0 && (
                <section className="mb-5">
                    <h2 className="mb-4">Похожие квартиры</h2>
                    <Row>
                        {similarApartments.map(apt => (
                            <Col md={6} lg={4} key={apt.id} className="mb-4">
                                <ApartmentCard
                                    apartment={apt}
                                    isFavorite={favorites.includes(apt.id)}
                                    onToggleFavorite={() => {}}
                                />
                            </Col>
                        ))}
                    </Row>
                </section>
            )}
            
            {/* Модальное окно подтверждения удаления */}
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Подтверждение удаления</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Вы уверены, что хотите удалить эту квартиру?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteModal}>
                        Отмена
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Удалить
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

// Вспомогательная функция для склонения слова "просмотр"
const getViewsWord = (views) => {
    const lastDigit = views % 10;
    const lastTwoDigits = views % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'просмотров';
    }
    
    if (lastDigit === 1) {
        return 'просмотр';
    }
    
    if (lastDigit >= 2 && lastDigit <= 4) {
        return 'просмотра';
    }
    
    return 'просмотров';
};

// Форматирование даты
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
};

export default ApartmentDetailPage;