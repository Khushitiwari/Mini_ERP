import axiosInstance from './axiosInstance';

const unwrap = (res) => res.data.data;

export const getAllBoms = async () =>
  unwrap(await axiosInstance.get('/bom'));

export const getBom = async (productId) =>
  unwrap(await axiosInstance.get(`/bom/${productId}`));

export const createBom = async (payload) =>
  unwrap(await axiosInstance.post('/bom', payload));

export const updateBom = async (id, payload) =>
  unwrap(await axiosInstance.put(`/bom/${id}`, payload));
