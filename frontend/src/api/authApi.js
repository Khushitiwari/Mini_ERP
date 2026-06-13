import axiosInstance from './axiosInstance';

const unwrap = (res) => res.data.data;

export const login = async (email, password) =>
  unwrap(await axiosInstance.post('/auth/login', { email, password }));

export const getMe = async () => unwrap(await axiosInstance.get('/auth/me'));
