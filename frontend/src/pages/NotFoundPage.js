import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow text-center py-5">
                        <Card.Body>
                            <h1 className="display-1 text-primary mb-4">404</h1>
                            <h2 className="mb-4">Страница не найдена</h2>
                            <p className="lead mb-5">
                                Запрашиваемая страница не существует или была перемещена.
                            </p>
                            <div className="d-flex justify-content-center gap-3">
                                <Button as={Link} to="/" variant="primary">
                                    Вернуться на главную
                                </Button>
                                <Button as={Link} to="/apartments" variant="outline-primary">
                                    Просмотреть квартиры
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default NotFoundPage;