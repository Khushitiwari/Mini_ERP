import axiosInstance from './axiosInstance';

const unwrap = (res) => res.data.data;

export const getManufacturingOrders = async (params) =>
  unwrap(await axiosInstance.get('/manufacturing-orders', { params }));

export const createManufacturingOrder = async (payload) =>
  unwrap(await axiosInstance.post('/manufacturing-orders', payload));

export const startMO = async (id) =>
  unwrap(await axiosInstance.put(`/manufacturing-orders/${id}/start`));

export const completeWorkOrder = async (moId, woId) =>
  unwrap(await axiosInstance.put(`/manufacturing-orders/${moId}/work-orders/${woId}/complete`));

export const completeMO = async (id) =>
  unwrap(await axiosInstance.put(`/manufacturing-orders/${id}/complete`));

export const cancelMO = async (id) =>
  unwrap(await axiosInstance.put(`/manufacturing-orders/${id}/cancel`));
