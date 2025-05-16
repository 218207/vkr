import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { predictionService } from '../services/api';

const PricePredictor = () => {
    const [formData, setFormData] = useState({
        metro: '',
        minutes: '',
        way: 'пешком',
        rooms: '',
        total_area: '',
        living_area: '',
        kitchen_area: '',
        storey: '',
        storeys: ''
    });

    const [loading, setLoading] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState(null);

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
        setPrediction(null);

        try {
            // Преобразование строковых значений в числа
            const dataToSend = {
                ...formData,
                minutes: parseInt(formData.minutes),
                rooms: parseInt(formData.rooms),
                total_area: parseFloat(formData.total_area),
                living_area: formData.living_area ? parseFloat(formData.living_area) : null,
                kitchen_area: formData.kitchen_area ? parseFloat(formData.kitchen_area) : null,
                storey: parseInt(formData.storey),
                storeys: parseInt(formData.storeys)
            };

            // Отправка запроса на прогнозирование
            const response = await predictionService.predictPrice(dataToSend);
            setPrediction(response.data);
        } catch (error) {
            console.error('Ошибка при прогнозировании цены:', error);
            setError(error.response?.data?.detail || 'Не удалось выполнить прогноз. Попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    // Форматирование цены
    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU').format(price);
    };

    return (
        <Card className="shadow-sm">
            <Card.Body>
                <Card.Title>Прогноз стоимости аренды</Card.Title>
                <Card.Text>
                    Введите характеристики квартиры, чтобы узнать рекомендуемую стоимость аренды
                </Card.Text>

                {error && (
                    <Alert variant="danger">{error}</Alert>
                )}

                {prediction && (
                    <Alert variant="success">
                        <Alert.Heading>Рекомендуемая стоимость аренды</Alert.Heading>
                        <h3 className="text-center">{formatPrice(prediction.predicted_price)} ₽/мес</h3>
                        <p className="mb-0">{prediction.message}</p>
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
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

                    <div className="d-grid">
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
                                    Прогнозирование...
                                </>
                            ) : (
                                'Рассчитать стоимость'
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default PricePredictor;