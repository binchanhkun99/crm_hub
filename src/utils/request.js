import axios from 'axios';
const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers:{
    'Access-Control-Allow-Origin': '*',
    "Content-Type": "application/x-www-form-urlencoded",
  }
});
// Add a response interceptor
request.interceptors.response.use(function (response) {
  return response;
}, function (error) {
  if (error.response && error.response.data && error.response.data.message === "Không tìm thấy thông tin người dùng.") {
    localStorage.removeItem("user"); // Remove user from localStorage
    router.push('/login'); // Redirect to login page
  }
  return Promise.reject(error);
});
export const setAuth = ()=>{
  // const token = JSON.parse(localStorage.getItem("user") || '{}')
  // const refreshToken = token.token
  // request.defaults.headers.common['Authorization'] = `Bearer ${refreshToken}`
}
setAuth()
export default request
