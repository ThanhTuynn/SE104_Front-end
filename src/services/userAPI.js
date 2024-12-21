import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// Create axios instance
const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor
axiosClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response);
    throw error;
  }
);

export const signIn = async (username, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/users/login`, {
      username,
      password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Transform backend response to match frontend expectations
    return {
      token: `Bearer ${response.data.userId}`, // Create a token format
      user: {
        id: response.data.userId,
        username: response.data.username,
        role: response.data.role
      }
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to sign in');
  }
};

export const signUp = async (username, password, role) => {
  try {
    const response = await axiosClient.post('/api/users/register', {
      username,
      password,
      role
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Signup Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    return {
      success: false,
      message: error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
    };
  }
};