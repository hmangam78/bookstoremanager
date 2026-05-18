import { api } from "../lib/api";

export interface LoginResponse {
    token: string;
    level: 'admin' | 'user';
}

export interface CheckResponse {
    valid: boolean;
    level: 'admin' | 'user';
}

export interface SetupStateResponse {
    needsSetup: boolean;
}

const TOKEN_KEY = 'auth_token';
const LEVEL_KEY = 'auth_level';

export function getStoredToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function getStoredLevel(): string | null {
    return localStorage.getItem(LEVEL_KEY);
}

export function isAuthenticated(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
}

export function isAdmin(): boolean {
    return localStorage.getItem(LEVEL_KEY) === 'admin';
}

export async function login(password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/login', { password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(LEVEL_KEY, data.level);
    // Set the default auth header for all future requests
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
}

export async function checkSession(): Promise<CheckResponse> {
    const token = getStoredToken();
    if (!token) {
        return { valid: false, level: 'user' };
    }
    try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const { data } = await api.post<CheckResponse>('/auth/check');
        return data;
    } catch {
        logout();
        return { valid: false, level: 'user' };
    }
}

export async function getSetupState(): Promise<SetupStateResponse> {
    const { data } = await api.get<SetupStateResponse>('/auth/setup-state');
    return data;
}

export async function setupInitialPasswords(adminPassword: string, userPassword: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/auth/setup', { adminPassword, userPassword });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(LEVEL_KEY, data.level);
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
}

export async function changePassword(settingKey: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { settingKey, newPassword });
}

export function logout(): void {
    const token = getStoredToken();
    if (token) {
        api.post('/auth/logout').catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEVEL_KEY);
    delete api.defaults.headers.common['Authorization'];
}

// Initialize auth header from stored token on app load
const storedToken = getStoredToken();
if (storedToken) {
    api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}
