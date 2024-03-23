export default function authHeader() {
    let user = JSON.parse(localStorage.getItem('user') || '{}');
  
    if (user && user.token) {
      return { Authorization: 'Bearer ' + user.token, 'X-Custom-Header': 'foobar', "Access-Control-Allow-Origin": "*"};
    } else {
      return {};
    }
  }
  
