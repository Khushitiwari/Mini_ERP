import axiosInstance from './axiosInstance';

const unwrap = (res) => res.data.data;

export const getSalesOrders = async (params) =>
  unwrap(await axiosInstance.get('/sales-orders', { params }));

export const createSalesOrder = async (payload) =>
  unwrap(await axiosInstance.post('/sales-orders', payload));

export const confirmSalesOrder = async (id) =>
  unwrap(await axiosInstance.put(`/sales-orders/${id}/confirm`));

export const deliverSalesOrder = async (id, items) =>
  unwrap(await axiosInstance.put(`/sales-orders/${id}/deliver`, { items }));

export const cancelSalesOrder = async (id) =>
  unwrap(await axiosInstance.put(`/sales-orders/${id}/cancel`));
