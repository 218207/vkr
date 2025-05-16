import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Tabs, Tab, Form, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { apartmentService, recommendationService, authService } from '../services/api';
import ApartmentCard from '../components/ApartmentCard';

const ProfilePage = () => {
    const { user, isAuthenticated, logout } = useContext(AuthContext);
    const [userApartments, setUserApartments] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (isAuthenticated && user) {
            setFormData({
                ...formData,
                username: user.username || '',
                email: user.email || ''
            });
            
            fetchUserData();
        }
    }, [isAuthenticated, user]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            // Загрузка квартир пользователя
            const apartmentsResponse = await apartmentService.getUserApartments();
            setUserApartments(apartmentsResponse.data);
            
            // Загрузка рекомендаций
            const recommendationsResponse = await recommendationService.getPersonalizedRecommendations();
            setRecommendations(recommendationsResponse.data);
        } catch (error) {
            console.error('Ошибка при загрузке данных профиля:', error);
            setError('Не удалось загрузить данные профиля');
        } finally {
            setLoading(false);
        }
    };

    // Обработка изменения полей формы
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Обработка отправки формы обновления профиля
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // Проверка совпадения паролей
        if (formData.password && formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            setLoading(false);
            return;
        }

        try {
            // Подготовка данных для обновления
            const updateData = {
                username: formData.username,
                email: formData.email
            };

            // Добавляем пароль только если он был введен
            if (formData.password) {
                updateData.password = formData.password;
            }

            // Отправка запроса на обновление профиля
            await authService.updateProfile(updateData);
            
            setSuccess('Профиль успешно обновлен');
            // Сбрасываем поля пароля
            setFormData({
                ...formData,
                password: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            setError(error.response?.data?.detail || 'Не удалось обновить профиль. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    // Если пользователь не авторизован, показываем сообщение
    if (!isAuthenticated) {
        return (
            <Container className="py-5">
                <Alert variant="warning">
                    Для доступа к профилю необходимо авторизоваться.
                </Alert>
                <Button as={Link} to="/login" variant="primary">
                    Войти
                </Button>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h1 className="mb-4">Личный кабинет</h1>
            
            <Tabs defaultActiveKey="apartments" id="profile-tabs" className="mb-4">
                <Tab eventKey="apartments" title="Мои квартиры">
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h4 className="mb-0">Мои объявления</h4>
                                <Button as={Link} to="/add-apartment" variant="primary">
                                    Добавить квартиру
                                </Button>
                            </div>
                            
                            {loading ? (
                                <div className="text-center my-5">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Загрузка...</span>
                                    </Spinner>
                                </div>
                            ) : userApartments.length === 0 ? (
                                <Alert variant="info">
                                    У вас пока нет объявлений. <Link to="/add-apartment">Добавьте свою первую квартиру</Link>.
                                </Alert>
                            ) : (
                                <Row>
                                    {userApartments.map(apartment => (
                                        <Col md={6} lg={4} key={apartment.id} className="mb-4">
                                            <ApartmentCard apartment={apartment} />
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>
                
                <Tab eventKey="recommendations" title="Рекомендации">
                    <Card className="shadow-sm mb-4">
                        <Card.Body>
                            <h4 className="mb-4">Персонализированные рекомендации</h4>
                            
                            {loading ? (
                                <div className="text-center my-5">
                                    <Spinner animation="border" role="status">
                                        <span className="visually-hidden">Загрузка...</span>
                                    </Spinner>
                                </div>
                            ) : recommendations.length === 0 ? (
                                <Alert variant="info">
                                    Для вас пока нет рекомендаций. Просмотрите больше квартир, чтобы получить персонализированные предложения.
                                </Alert>
                            ) : (
                                <Row>
                                    {recommendations.map(apartment => (
                                        <Col md={6} lg={4} key={apartment.id} className="mb-4">
                                            <ApartmentCard apartment={apartment} />
                                        </Col>
                                    ))}
                                </Row>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>
                
                <Tab eventKey="settings" title="Настройки профиля">
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h4 className="mb-4">Настройки учетной записи</h4>
                            
                            {error && (
                                <Alert variant="danger">{error}</Alert>
                            )}
                            
                            {success && (
                                <Alert variant="success">{success}</Alert>
                            )}
                            
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Имя пользователя</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Имя пользователя"
                                        required
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Email"
                                        required
                                    />
                                </Form.Group>
                                
                                <hr className="my-4" />
                                
                                <h5>Изменение пароля</h5>
                                <Form.Text className="text-muted mb-3 d-block">
                                    Оставьте поля пустыми, если не хотите менять пароль
                                </Form.Text>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Новый пароль</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Новый пароль"
                                        minLength="6"
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-4">
                                    <Form.Label>Подтверждение пароля</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Подтвердите новый пароль"
                                        minLength="6"
                                    />
                                </Form.Group>
                                
                                <div className="d-flex justify-content-between">
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
                                                Сохранение...
                                            </>
                                        ) : (
                                            'Сохранить изменения'
                                        )}
                                    </Button>
                                    
                                    <Button 
                                        variant="outline-danger" 
                                        onClick={logout}
                                    >
                                        Выйти из аккаунта
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>
        </Container>
    );
};

export default ProfilePage;