import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.dictionaryapi.dev/api/v2/entries/en',
  timeout: 8000, // 8 seconds timeout
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

export default api;
