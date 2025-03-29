import axios from 'axios';

const BASE_URL = 'https://reqres.in/api';

const handleApiError = (error) => {
  if (error.response) {
    return error.response.data?.error || `Request failed with status ${error.response.status}`;
  }
  return error.message || 'An unknown network error occurred';
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}/login`, { email, password });
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getUsers = async (page = 1) => {
  try {
    const response = await axios.get(`${BASE_URL}/users?page=${page}&_=${Date.now()}`);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(`${BASE_URL}/users/${id}`, userData);
    return {
      ...response.data,
      ...userData,
      id: parseInt(id),
      avatar: userData.avatar || `https://reqres.in/img/faces/${id}-image.jpg`
    };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const deleteUser = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/users/${id}`);
    return { id: parseInt(id) };
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};