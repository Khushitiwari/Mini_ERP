import axiosInstance from './axiosInstance';

const unwrap = (res) => res.data.data;

export const login = async (email, password) =>
  unwrap(await axiosInstance.post('/auth/login', { email, password }));

export const getMe = async () => unwrap(await axiosInstance.get('/auth/me'));

export const createUser = async (payload) =>
  unwrap(await axiosInstance.post('/auth/users', payload));

export const getAllUsers = async () => unwrap(await axiosInstance.get('/auth/users'));

export const updateUserRole = async (userId, role) =>
  unwrap(await axiosInstance.put(`/auth/users/${userId}/role`, { role }));

export const deleteUser = async (userId) =>
  unwrap(await axiosInstance.delete(`/auth/users/${userId}`));
