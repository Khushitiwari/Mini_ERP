import axiosInstance from './axiosInstance';

const unwrap = (res) => res.data.data;

export const getStock = async () => unwrap(await axiosInstance.get('/stock'));

export const getStockLedger = async (productId) =>
  unwrap(await axiosInstance.get(`/stock/${productId}/ledger`));

export const adjustStock = async (productId, payload) =>
  unwrap(await axiosInstance.post(`/stock/${productId}/adjust`, payload));
