import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Spinner, Alert, Pagination } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { apartmentService, favoriteService } from '../services/api';
import FilterForm from '../components/FilterForm';
import ApartmentCard from '../components/ApartmentCard';

const ApartmentsPage = () => {
    const { isAuthenticated } = useContext(AuthContext);
    const [apartments, setApartments] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({});
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 9;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Формируем параметры запроса с учетом фильтров и пагинации
                const params = {
                    skip: (currentPage - 1) * itemsPerPage,
                    limit: itemsPerPage
                };

                // Добавляем только непустые значения фильтров
                if (filters.metro) params.metro = filters.metro;
                if (filters.rooms) params.rooms = parseInt(filters.rooms);
                if (filters.minPrice) params.min_price = parseFloat(filters.minPrice);
                if (filters.maxPrice) params.max_price = parseFloat(filters.maxPrice);
                if (filters.minArea) params.min_area = parseFloat(filters.minArea);

                // Загрузка списка квартир
                const response = await apartmentService.getApartments(params);
                setApartments(response.data);
                
                // Примерный расчет общего числа страниц
                // В реальном API лучше возвращать total_count
                setTotalPages(Math.ceil(response.data.length > 0 ? 30 : 0 / itemsPerPage));
                
                // Если пользователь авторизован, загружаем избранное
                if (isAuthenticated) {
                    const favoritesResponse = await favoriteService.getFavorites();
                    setFavorites(favoritesResponse.data.map(apt => apt.id));
                }
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
                console.error('Детали ошибки:', {
                    response: error.response,
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data
                });
                setError('Не удалось загрузить квартиры. Пожалуйста, попробуйте позже.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentPage, filters, isAuthenticated]);

    // Обработка применения фильтров
    const handleFilter = (newFilters) => {
        // Проверка наличия числовых данных
        const validatedFilters = {};
        
        if (newFilters.metro) validatedFilters.metro = newFilters.metro;
        if (newFilters.rooms) validatedFilters.rooms = newFilters.rooms;
        if (newFilters.minPrice) validatedFilters.minPrice = newFilters.minPrice;
        if (newFilters.maxPrice) validatedFilters.maxPrice = newFilters.maxPrice;
        if (newFilters.minArea) validatedFilters.minArea = newFilters.minArea;
        
        setFilters(validatedFilters);
        setCurrentPage(1); // Сбрасываем на первую страницу при изменении фильтров
    };

    // Обработка переключения избранного
    const handleToggleFavorite = (apartmentId) => {
        setFavorites(prevFavorites => {
            if (prevFavorites.includes(apartmentId)) {
                return prevFavorites.filter(id => id !== apartmentId);
            } else {
                return [...prevFavorites, apartmentId];
            }
        });
    };

    // Формирование элементов пагинации
    const pagination = [];
    for (let i = 1; i <= totalPages; i++) {
        pagination.push(
            <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => setCurrentPage(i)}
            >
                {i}
            </Pagination.Item>
        );
    }

    return (
        <Container className="py-4">
            <h1 className="mb-4">Аренда квартир в Москве</h1>
            
            {/* Компонент фильтрации */}
            <FilterForm onFilter={handleFilter} />

            {/* Отображение списка квартир */}
            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Загрузка...</span>
                    </Spinner>
                </div>
            ) : error ? (
                <Alert variant="danger">{error}</Alert>
            ) : apartments.length === 0 ? (
                <Alert variant="info">
                    Квартиры не найдены. Попробуйте изменить параметры поиска.
                </Alert>
            ) : (
                <>
                    <p className="mb-4">Найдено: {apartments.length} объявлений</p>
                    <Row>
                        {apartments.map(apartment => (
                            <Col md={6} lg={4} key={apartment.id} className="mb-4">
                                <ApartmentCard
                                    apartment={apartment}
                                    isFavorite={favorites.includes(apartment.id)}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            </Col>
                        ))}
                    </Row>
                    
                    {/* Пагинация */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <Pagination>
                                <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                                <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
                                {pagination}
                                <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
                                <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                            </Pagination>
                        </div>
                    )}
                </>
            )}
        </Container>
    );
};

export default ApartmentsPage;