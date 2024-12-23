import axiosInstance from './axiosInstance';

const customerService = {
  getAllCustomers: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axiosInstance.get('/api/customers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      if (error.response?.status === 403) {
        // Handle forbidden error
        window.location.href = '/login';
      }
      throw error;
    }
  },
  // ...other methods
};

export default customerService;
