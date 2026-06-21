import { apiRequest } from './api-client.js';

export const login = (phoneNumber, password) => apiRequest('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ phoneNumber, password }),
});

export const logout = () => apiRequest('/auth/logout', { method: 'POST' });

export const register = (phoneNumber, displayName, password, confirmPassword) => apiRequest('/auth/register', {
  method: 'POST',
  body: JSON.stringify({ phoneNumber, displayName, password, confirmPassword }),
});
