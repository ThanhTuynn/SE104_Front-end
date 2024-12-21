import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

export const signIn = async (username, password) => {
  try {
    const response = await axiosInstance.post('/api/user/login', {
      username,
      password,
    });

    console.log('Login response:', response.data); // Debug log

    if (!response.data) {
      throw new Error('No response data received');
    }

    // Transform backend response to match frontend expectations
    return {
      token: response.data.accessToken,
      user: {
        id: response.data.userId,
        username: response.data.username,
        role: response.data.role
      }
    };
  } catch (error) {
    console.error('Login Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });
    throw new Error(error.response?.data?.message || 'Đăng nhập thất bại');
  }
};

export const signUp = async (username, password, email, role) => {
  try {
    console.log('Sending signup request with data:', {
      TenTaiKhoan: username,
      MatKhau: password,
      Email: email,
      Role: role
    });

    const response = await axiosInstance.post('/api/user/register', {
      TenTaiKhoan: username,
      MatKhau: password,
      Email: email,
      Role: role
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Signup Error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Đăng ký thất bại.'
    };
  }
};