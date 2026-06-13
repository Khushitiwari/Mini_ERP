import axiosInstance from './axiosInstance';

const unwrap = (res) => res.data.data;

export const getProducts = async (params) =>
  unwrap(await axiosInstance.get('/products', { params }));

export const createProduct = async (payload) =>
  unwrap(await axiosInstance.post('/products', payload));

export const updateProduct = async (id, payload) =>
  unwrap(await axiosInstance.put(`/products/${id}`, payload));

export const deleteProduct = async (id) =>
  unwrap(await axiosInstance.delete(`/products/${id}`));
