import axiosInstance from './axiosInstance';

const unwrap = (res) => res.data.data;

export const getSummary = async () => unwrap(await axiosInstance.get('/dashboard/summary'));
