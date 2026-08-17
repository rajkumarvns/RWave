import axios from 'axios';
import http from 'http';

async function run() {
  try {
    // 1. Login to get a cookie
    const loginRes = await axios.post('http://localhost:4500/api/auth/login', {
      email: 'john@example.com', // Need to know a valid email
      password: 'password123'
    });
    
    const cookie = loginRes.headers['set-cookie'][0];
    
    // 2. Call clear history
    const clearRes = await axios.delete('http://localhost:4500/api/messages/clear/648a12345678901234567890', {
      headers: { Cookie: cookie },
      withCredentials: true
    });
    
    console.log("Success:", clearRes.status, clearRes.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

run();
