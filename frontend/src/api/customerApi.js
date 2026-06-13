import axiosInstance from './axiosInstance';

const unwrap = (res) => res.data.data;

export const getCustomers = async () => unwrap(await axiosInstance.get('/customers'));

export const createCustomer = async (payload) =>
  unwrap(await axiosInstance.post('/customers', payload));

export const updateCustomer = async (id, payload) =>
  unwrap(await axiosInstance.put(`/customers/${id}`, payload));

export const deleteCustomer = async (id) =>
  unwrap(await axiosInstance.delete(`/customers/${id}`));
