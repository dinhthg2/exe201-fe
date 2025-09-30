const axios = require('axios');

// Force IPv4
const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api'
});

(async () => {
  try {
    console.log('Testing register...');
    const email = `test_${Date.now()}@example.com`;
    
    const registerRes = await api.post('/auth/register', {
      name: 'Test User Frontend',
      email: email,
      password: '123456',
      role: 'student'
    });
    
    console.log('Register success:', registerRes.status, registerRes.data);
    
    console.log('Testing login...');
    const loginRes = await api.post('/auth/login', {
      email: email,
      password: '123456'
    });
    
    console.log('Login success:', loginRes.status, loginRes.data);
    
  } catch (error) {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
  }
})();