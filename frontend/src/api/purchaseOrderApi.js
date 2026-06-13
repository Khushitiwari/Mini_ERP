import axiosInstance from './axiosInstance';

const unwrap = (res) => res.data.data;

export const getPurchaseOrders = async (params) =>
  unwrap(await axiosInstance.get('/purchase-orders', { params }));

export const createPurchaseOrder = async (payload) =>
  unwrap(await axiosInstance.post('/purchase-orders', payload));

export const confirmPurchaseOrder = async (id) =>
  unwrap(await axiosInstance.put(`/purchase-orders/${id}/confirm`));

export const receivePurchaseOrder = async (id, items) =>
  unwrap(await axiosInstance.put(`/purchase-orders/${id}/receive`, { items }));

export const cancelPurchaseOrder = async (id) =>
  unwrap(await axiosInstance.put(`/purchase-orders/${id}/cancel`));
