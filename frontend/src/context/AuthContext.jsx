import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const KEY = 'palaniyappa-admin-token';
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Attach token from localStorage to every axios request going to our API
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem(KEY);
    if (token && config.url?.startsWith(API)) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // null=checking, {}=user, false=guest
    const token = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;

    useEffect(() => {
        let alive = true;
        const check = async () => {
            if (!token) {
                if (alive) setUser(false);
                return;
            }
            try {
                const { data } = await axios.get(`${API}/auth/me`);
                if (alive) setUser(data);
            } catch {
                localStorage.removeItem(KEY);
                if (alive) setUser(false);
            }
        };
        check();
        return () => { alive = false; };
    }, [token]);

    const login = async (email, password) => {
        const { data } = await axios.post(`${API}/auth/login`, { email, password });
        localStorage.setItem(KEY, data.access_token);
        setUser(data.user);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem(KEY);
        setUser(false);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}

export function formatApiError(detail) {
    if (detail == null) return 'Something went wrong.';
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map((e) => e?.msg || JSON.stringify(e)).join(' ');
    if (detail?.msg) return detail.msg;
    return String(detail);
}
