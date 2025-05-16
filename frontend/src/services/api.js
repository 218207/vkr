import axios from 'axios';

// Создаем экземпляр axios с базовым URL API
const api = axios.create({
    baseURL: '/api/v1',
});

// Добавляем перехватчик запросов для добавления токена авторизации
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Добавляем перехватчик ответов для обработки ошибок авторизации
// api.interceptors.response.use(
//     (response) => {
//         return response;
//     },
//     (error) => {
//         if (error.response && error.response.status === 401) {
//             // Если запрос не авторизован, удаляем токен и перенаправляем на страницу входа
//             localStorage.removeItem('token');
//             window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );
// Добавляем перехватчик ответов для более детальной отладки
api.interceptors.response.use(
    response => {
        console.log(`Успешный ответ API: ${response.config.url}`, response.data);
        return response;
    },
    error => {
        console.error(`Ошибка API: ${error.config?.url || 'Неизвестный URL'}`, {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
        
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
// Функции для работы с API

// Аутентификация и пользователи
// const authService = {
//     login: (credentials) => api.post('/auth/login', credentials),
//     register: (userData) => api.post('/users/', userData),
//     getCurrentUser: () => api.get('/users/me'),
//     updateProfile: (userData) => api.patch('/users/me', userData),
// };

// Аутентификация и пользователи
const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/users/', userData),
    getCurrentUser: () => api.get('/users/me'),
    updateProfile: (userData) => api.patch('/users/me', userData),
    getUserById: (id) => api.get(`/users/${id}`), // Новый метод для получения пользователя по ID
};

// Квартиры
const apartmentService = {
    getApartments: (params) => api.get('/apartments/', { params }),
    getLatestApartments: () => api.get('/apartments/latest'),
    getApartment: (id) => api.get(`/apartments/${id}`),
    getUserApartments: () => api.get('/apartments/my'),
    createApartment: (data) => api.post('/apartments/', data),
    updateApartment: (id, data) => api.patch(`/apartments/${id}`, data),
    deleteApartment: (id) => api.delete(`/apartments/${id}`),
};

// Избранное
const favoriteService = {
    getFavorites: () => api.get('/favorites/'),
    addToFavorites: (apartmentId) => api.post('/favorites/', { apartment_id: apartmentId }),
    removeFromFavorites: (apartmentId) => api.delete(`/favorites/${apartmentId}`),
};

// Прогнозирование и рекомендации
const predictionService = {
    predictPrice: (data) => api.post('/predictions/price', data),
};

const recommendationService = {
    getSimilarApartments: (apartmentId) => api.get(`/recommendations/similar/${apartmentId}`),
    getPersonalizedRecommendations: () => api.get('/recommendations/personalized'),
};

export {
    authService,
    apartmentService,
    favoriteService,
    predictionService,
    recommendationService,
};

export default api;

