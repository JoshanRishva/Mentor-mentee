import axiosInstance from '../../../api/axiosConfig';

const authService = {
  register: (registerData) =>
    axiosInstance.post('/api/auth/register', {
      full_name: registerData.fullName,
      email: registerData.email,
      password: registerData.password,
      role: registerData.role,
    }),

  login: (email, password) =>
    axiosInstance.post('/api/auth/login', { email, password }),

  logout: () => axiosInstance.post('/api/auth/logout'),
};

export default authService;
