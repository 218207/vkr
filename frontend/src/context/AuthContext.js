import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Проверка токена и получение информации о пользователе при загрузке
    useEffect(() => {
        const checkAuth = async () => {
            if (token) {
                try {
                    const response = await api.get('/users/me');
                    setUser(response.data);
                } catch (error) {
                    console.error('Ошибка аутентификации:', error);
                    logout();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [token]);

    // Функция входа в систему
    const login = async (email, password) => {
        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const response = await api.post('/auth/login', formData);
            const { access_token } = response.data;

            localStorage.setItem('token', access_token);
            setToken(access_token);

            const userResponse = await api.get('/users/me');
            setUser(userResponse.data);

            return { success: true };
        } catch (error) {
            console.error('Ошибка входа:', error);
            return {
                success: false,
                message: error.response?.data?.detail || 'Не удалось войти в систему'
            };
        }
    };

    // Функция регистрации
    const register = async (username, email, password) => {
        try {
            await api.post('/users/', {
                username,
                email,
                password
            });
            
            return {
                success: true,
                message: 'Регистрация успешна! Теперь вы можете войти в систему.'
            };
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            return {
                success: false,
                message: error.response?.data?.detail || 'Не удалось зарегистрироваться'
            };
        }
    };

    // Функция выхода из системы
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        navigate('/login');
    };

    // Проверка авторизации
    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                isAuthenticated
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};