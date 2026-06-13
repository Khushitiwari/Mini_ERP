import axiosInstance from './axiosInstance';

const unwrap = (res) => res.data.data;

export const getVendors = async () => unwrap(await axiosInstance.get('/vendors'));

export const createVendor = async (payload) =>
  unwrap(await axiosInstance.post('/vendors', payload));

export const updateVendor = async (id, payload) =>
  unwrap(await axiosInstance.put(`/vendors/${id}`, payload));

export const deleteVendor = async (id) =>
  unwrap(await axiosInstance.delete(`/vendors/${id}`));
