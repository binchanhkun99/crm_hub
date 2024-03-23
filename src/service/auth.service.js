import request, { setAuth } from "../utils/request";


const API_URL_LOGIN = "api/log_acc.php";
const API_URL_REG = "api/user/register";

class AuthService {
  async login(user) {
    let dataForm = new FormData();
    dataForm.append('user',user.email);
    dataForm.append('pass', user.password);
    try {
      const response = await request.post(API_URL_LOGIN, dataForm);
  
      const data = response.data;
      console.log(data); // In ra dữ liệu để kiểm tra
  
      if (data.status === "error" || data.level !== 0) {
        alert("Bạn không có quyền này!!!");
        return;
      } else {
        localStorage.setItem("user", JSON.stringify(response.data));
        setAuth();
        return response.data;
      }
    } catch (e) {
      console.log(e);
      throw new Error(e);
    }
  }
  

  async register(user) {
    try {
      const response = await request.post(API_URL_REG, {
        email: user.email,
        password: user.password,
        username: user.username
      });
      const data = response.data
      localStorage.setItem("user", JSON.stringify(data));

    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }

  logout() {
    localStorage.removeItem("user");
  }
}

export default new AuthService();
