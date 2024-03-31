import axios from 'axios';
import router from '@/router'; // Import router instance

const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Access-Control-Allow-Origin': '*',
    "Content-Type": "application/x-www-form-urlencoded",
  }
});
// Add a response interceptor
request.interceptors.response.use(function (response) {
  if (response.data?.message === "Không tìm thấy thông tin người dùng.") {
    localStorage.removeItem("user"); // Remove user from localStorage
    window.location.href = '/login';
  }
  return response;
}, function (error) {  
  if (error.response && error.response.data && error.response.data.message === "Không tìm thấy thông tin người dùng.") {
    localStorage.removeItem("user"); // Remove user from localStorage
    console.log("error", error);
    window.location.href = '/login';

  }
  return Promise.reject(error);
});
export const setAuth = () => {
  // const token = JSON.parse(localStorage.getItem("user") || '{}')
  // const refreshToken = token.token
  // request.defaults.headers.common['Authorization'] = `Bearer ${refreshToken}`
}
setAuth()
export default request
