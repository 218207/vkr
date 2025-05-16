import React, { useState, useContext } from 'react';
import { Container, Form, Button, Card, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apartmentService } from '../services/api';
import PricePredictor from '../components/PricePredictor';

const AddApartmentPage = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        metro: '',
        price: '',
        minutes: '',
        way: 'пешком',
        provider: '',
        fee_percent: '0',
        storey: '',
        storeys: '',
        rooms: '',
        total_area: '',
        living_area: '',
        kitchen_area: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPricePredictor, setShowPricePredictor] = useState(false);

    // Проверяем авторизацию
    if (!isAuthenticated) {
        return (
            <Container className="py-5">
                <Alert variant="warning">
                    Для добавления квартиры необходимо авторизоваться.
                </Alert>
                <Button 
                    variant="primary" 
                    onClick={() => navigate('/login', { state: { from: '/add-apartment' } })}
                >
                    Войти
                </Button>
            </Container>
        );
    }

    // Обработка изменения полей формы
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Обработка отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Преобразование строковых значений в числа
            const dataToSend = {
                ...formData,
                price: parseFloat(formData.price),
                minutes: parseInt(formData.minutes),
                fee_percent: parseFloat(formData.fee_percent),
                storey: parseInt(formData.storey),
                storeys: parseInt(formData.storeys),
                rooms: parseInt(formData.rooms),
                total_area: parseFloat(formData.total_area),
                living_area: formData.living_area ? parseFloat(formData.living_area) : null,
                kitchen_area: formData.kitchen_area ? parseFloat(formData.kitchen_area) : null
            };

            // Отправка запроса на создание квартиры
            const response = await apartmentService.createApartment(dataToSend);
            
            // Перенаправление на страницу просмотра созданной квартиры
            navigate(`/apartments/${response.data.id}`);
        } catch (error) {
            console.error('Ошибка при создании квартиры:', error);
            setError(error.response?.data?.detail || 'Не удалось создать объявление. Пожалуйста, проверьте введенные данные.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <h1 className="mb-4">Добавление новой квартиры</h1>
            
            {error && (
                <Alert variant="danger">{error}</Alert>
            )}
            
            <Row>
                <Col lg={8}>
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <Form onSubmit={handleSubmit}>
                                <h4 className="mb-3">Основная информация</h4>
                                
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Станция метро</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="metro"
                                                value={formData.metro}
                                                onChange={handleChange}
                                                placeholder="Название станции метро"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Время до метро (мин)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="minutes"
                                                value={formData.minutes}
                                                onChange={handleChange}
                                                placeholder="Время до метро"
                                                required
                                                min="1"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Способ</Form.Label>
                                            <Form.Select
                                                name="way"
                                                value={formData.way}
                                                onChange={handleChange}
                                                required
                                            >
                                                <option value="пешком">Пешком</option>
                                                <option value="транспорт">Транспортом</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Количество комнат</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="rooms"
                                                value={formData.rooms}
                                                onChange={handleChange}
                                                placeholder="Комнаты"
                                                required
                                                min="1"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Этаж</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="storey"
                                                value={formData.storey}
                                                onChange={handleChange}
                                                placeholder="Этаж квартиры"
                                                required
                                                min="1"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Всего этажей</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="storeys"
                                                value={formData.storeys}
                                                onChange={handleChange}
                                                placeholder="Этажность дома"
                                                required
                                                min="1"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Общая площадь (м²)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="total_area"
                                                value={formData.total_area}
                                                onChange={handleChange}
                                                placeholder="Общая площадь"
                                                required
                                                min="1"
                                                step="0.1"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Жилая площадь (м²)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="living_area"
                                                value={formData.living_area}
                                                onChange={handleChange}
                                                placeholder="Жилая площадь"
                                                min="1"
                                                step="0.1"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Площадь кухни (м²)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="kitchen_area"
                                                value={formData.kitchen_area}
                                                onChange={handleChange}
                                                placeholder="Площадь кухни"
                                                min="1"
                                                step="0.1"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <h4 className="mb-3 mt-4">Условия аренды</h4>
                                
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Стоимость аренды (₽/мес)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="price"
                                                value={formData.price}
                                                onChange={handleChange}
                                                placeholder="Стоимость аренды"
                                                required
                                                min="1"
                                            />
                                            <Form.Text 
                                                className="text-primary" 
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setShowPricePredictor(!showPricePredictor)}
                                            >
                                                {showPricePredictor ? 'Скрыть прогноз стоимости' : 'Показать прогноз стоимости'}
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Комиссия (%)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="fee_percent"
                                                value={formData.fee_percent}
                                                onChange={handleChange}
                                                placeholder="Комиссия"
                                                min="0"
                                                max="100"
                                                step="0.5"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Источник объявления</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="provider"
                                                value={formData.provider}
                                                onChange={handleChange}
                                                placeholder="Например: ЦИАН, Авито"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <div className="d-grid gap-2 mt-4">
                                    <Button 
                                        variant="primary" 
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <Spinner
                                                    as="span"
                                                    animation="border"
                                                    size="sm"
                                                    role="status"
                                                    aria-hidden="true"
                                                    className="me-2"
                                                />
                                                Создание объявления...
                                            </>
                                        ) : (
                                            'Опубликовать объявление'
                                        )}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col lg={4}>
                    {showPricePredictor && (
                        <div className="sticky-top" style={{ top: '20px' }}>
                            <PricePredictor />
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default AddApartmentPage;