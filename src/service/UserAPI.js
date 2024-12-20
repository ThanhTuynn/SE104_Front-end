import axios from 'axios';

// Update the signIn function in UserAPI.js to use axios:
export const signIn = async (username, password) => {
  try {
    const response = await axios.post('http://localhost:3002/api/users/login', {
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

export const signUp = async (username, password, email, role) => {
  try {
    const response = await axios.post('http://localhost:3002/api/users/register', {
      username,
      password,
      email,
      role
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
    throw new Error(error.response?.data?.message || 'Failed to sign up');
  }
};