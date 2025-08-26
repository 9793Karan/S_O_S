import axios from "axios";

const api = axios.create({
  baseURL: "https://s-o-s.onrender.com/api/", 
  withCredentials: true, 
});

export default api;
