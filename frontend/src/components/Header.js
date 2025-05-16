import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

const Header = () => {
    const { isAuthenticated, user, logout } = useContext(AuthContext);

    return (
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
            <Container>
                <Navbar.Brand as={Link} to="/">Аренда Недвижимости</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={NavLink} to="/">Главная</Nav.Link>
                        <Nav.Link as={NavLink} to="/apartments">Квартиры</Nav.Link>
                        {isAuthenticated && (
                            <>
                                <Nav.Link as={NavLink} to="/favorites">Избранное</Nav.Link>
                                <Nav.Link as={NavLink} to="/add-apartment">Добавить квартиру</Nav.Link>
                            </>
                        )}
                    </Nav>
                    <Nav>
                        {isAuthenticated ? (
                            <>
                                <Nav.Link as={NavLink} to="/profile">
                                    {user?.username || 'Профиль'}
                                </Nav.Link>
                                <Button variant="outline-light" onClick={logout}>Выход</Button>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={NavLink} to="/login">Вход</Nav.Link>
                                <Nav.Link as={NavLink} to="/register">Регистрация</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;