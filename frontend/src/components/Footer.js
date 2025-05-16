import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="bg-dark text-light py-4 mt-5">
            <Container>
                <Row>
                    <Col md={4}>
                        <h5>Аренда Недвижимости</h5>
                        <p className="text-muted">
                            Веб-приложение для управления недвижимостью и получения арендного дохода
                        </p>
                    </Col>
                    <Col md={4}>
                        <h5>Ссылки</h5>
                        <ul className="list-unstyled">
                            <li><a href="/" className="text-light">Главная</a></li>
                            <li><a href="/apartments" className="text-light">Квартиры</a></li>
                            <li><a href="/login" className="text-light">Вход</a></li>
                            <li><a href="/register" className="text-light">Регистрация</a></li>
                        </ul>
                    </Col>
                    <Col md={4}>
                        <h5>Контакты</h5>
                        <address className="text-muted">
                            <p>г. Москва</p>
                            <p>Email: info@arendanedvizhimosti.ru</p>
                            <p>Телефон: +7 (495) 123-45-67</p>
                        </address>
                    </Col>
                </Row>
                <hr className="my-4 bg-secondary" />
                <Row>
                    <Col className="text-center">
                        <p className="mb-0">
                            &copy; {new Date().getFullYear()} Аренда Недвижимости. Все права защищены.
                        </p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;