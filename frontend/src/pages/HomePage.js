import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ApartmentCard from '../components/ApartmentCard';
import { apartmentService } from '../services/api';

const HomePage = () => {
    const [latestApartments, setLatestApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLatestApartments = async () => {
            try {
                const response = await apartmentService.getLatestApartments();
                setLatestApartments(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке квартир:', error);
                setError('Не удалось загрузить последние квартиры. Пожалуйста, попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };

        fetchLatestApartments();
    }, []);

    return (
        <Container>
            {/* Hero секция */}
            <div className="py-5 text-center">
                <h1 className="display-4">Аренда недвижимости в Москве</h1>
                <p className="lead">
                    Найдите идеальную квартиру для аренды с помощью нашего сервиса
                </p>
                <div className="mt-4">
                    <Button as={Link} to="/apartments" variant="primary" size="lg" className="me-2">
                        Найти квартиру
                    </Button>
                    <Button as={Link} to="/add-apartment" variant="outline-primary" size="lg">
                        Сдать квартиру
                    </Button>
                </div>
            </div>

            {/* Карусель с преимуществами */}
            <Carousel className="mb-5 shadow-sm rounded">
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        style={{ height: '400px', objectFit: 'cover' }}
                        src="https://source.unsplash.com/random/1200x400/?apartment,living"
                        alt="Современные квартиры"
                    />
                    <Carousel.Caption>
                        <h3>Современные квартиры</h3>
                        <p>Широкий выбор квартир в самых популярных районах Москвы</p>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        style={{ height: '400px', objectFit: 'cover' }}
                        src="https://source.unsplash.com/random/1200x400/?apartment,kitchen"
                        alt="Без комиссии"
                    />
                    <Carousel.Caption>
                        <h3>Без комиссии</h3>
                        <p>Многие квартиры доступны для аренды без комиссии агентству</p>
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        style={{ height: '400px', objectFit: 'cover' }}
                        src="https://source.unsplash.com/random/1200x400/?apartment,bathroom"
                        alt="Удобный поиск"
                    />
                    <Carousel.Caption>
                        <h3>Удобный поиск</h3>
                        <p>Интеллектуальная система рекомендаций поможет найти идеальный вариант</p>
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel>

            {/* Последние добавленные квартиры */}
            <section className="mb-5">
                <h2 className="mb-4">Новые предложения</h2>
                {loading ? (
                    <p className="text-center">Загрузка...</p>
                ) : error ? (
                    <p className="text-center text-danger">{error}</p>
                ) : (
                    <Row>
                        {latestApartments.map(apartment => (
                            <Col md={6} lg={4} key={apartment.id} className="mb-4">
                                <ApartmentCard apartment={apartment} />
                            </Col>
                        ))}
                    </Row>
                )}
                <div className="text-center mt-3">
                    <Button as={Link} to="/apartments" variant="outline-primary">
                        Посмотреть все квартиры
                    </Button>
                </div>
            </section>

            {/* Особенности нашего сервиса */}
            <section className="mb-5">
                <h2 className="mb-4">Почему выбирают нас</h2>
                <Row>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="text-center">
                                <div className="mb-3">
                                    <i className="bi bi-search fs-1 text-primary"></i>
                                </div>
                                <Card.Title>Удобный поиск</Card.Title>
                                <Card.Text>
                                    Большой выбор фильтров для поиска именно того, что вам нужно
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="text-center">
                                <div className="mb-3">
                                    <i className="bi bi-graph-up-arrow fs-1 text-primary"></i>
                                </div>
                                <Card.Title>Прогноз стоимости</Card.Title>
                                <Card.Text>
                                    Узнайте справедливую цену аренды квартиры с учетом всех параметров
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-4">
                        <Card className="h-100 shadow-sm">
                            <Card.Body className="text-center">
                                <div className="mb-3">
                                    <i className="bi bi-heart fs-1 text-primary"></i>
                                </div>
                                <Card.Title>Рекомендации</Card.Title>
                                <Card.Text>
                                    Получайте персонализированные рекомендации на основе ваших предпочтений
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </section>
        </Container>
    );
};

export default HomePage;