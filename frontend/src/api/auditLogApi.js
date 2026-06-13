import axiosInstance from './axiosInstance';

const unwrap = (res) => res.data.data;

export const getAuditLogs = async (params) =>
  unwrap(await axiosInstance.get('/audit-logs', { params }));
