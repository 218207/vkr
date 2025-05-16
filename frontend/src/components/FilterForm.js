import React, { useState } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';

const FilterForm = ({ onFilter }) => {
    const [filters, setFilters] = useState({
        metro: '',
        minPrice: '',
        maxPrice: '',
        rooms: '',
        minArea: '',
    });

    // Обработка изменения полей формы
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters({
            ...filters,
            [name]: value
        });
    };

    // Обработка отправки формы
    const handleSubmit = (e) => {
        e.preventDefault();
        onFilter(filters);
    };

    // Очистка фильтров
    const handleReset = () => {
        setFilters({
            metro: '',
            minPrice: '',
            maxPrice: '',
            rooms: '',
            minArea: '',
        });
        onFilter({});
    };

    return (
        <Card className="mb-4 shadow-sm">
            <Card.Body>
                <Card.Title>Фильтры поиска</Card.Title>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6} lg={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Метро</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="metro"
                                    value={filters.metro}
                                    onChange={handleChange}
                                    placeholder="Введите станцию метро"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6} lg={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Количество комнат</Form.Label>
                                <Form.Select
                                    name="rooms"
                                    value={filters.rooms}
                                    onChange={handleChange}
                                >
                                    <option value="">Любое</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4+</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6} lg={3}>
                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Цена от</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="minPrice"
                                            value={filters.minPrice}
                                            onChange={handleChange}
                                            placeholder="От"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>до</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="maxPrice"
                                            value={filters.maxPrice}
                                            onChange={handleChange}
                                            placeholder="До"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Col>
                        <Col md={6} lg={3}>
                            <Form.Group className="mb-3">
                                <Form.Label>Площадь от, м²</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="minArea"
                                    value={filters.minArea}
                                    onChange={handleChange}
                                    placeholder="Минимальная площадь"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="d-flex justify-content-end gap-2">
                        <Button variant="secondary" onClick={handleReset}>
                            Сбросить
                        </Button>
                        <Button variant="primary" type="submit">
                            Применить фильтры
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default FilterForm;