import axios from 'axios';
const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers:{
    'Access-Control-Allow-Origin': '*',
    "Content-Type": "application/x-www-form-urlencoded",
  }
});

export const setAuth = ()=>{
  // const token = JSON.parse(localStorage.getItem("user") || '{}')
  // const refreshToken = token.token
  // request.defaults.headers.common['Authorization'] = `Bearer ${refreshToken}`
}
setAuth()
export default request
