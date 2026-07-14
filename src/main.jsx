import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global Fetch Interceptor to automatically inject JWT Authorization header
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
  if (!options.headers) {
    options.headers = {};
  }

  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.token) {
        if (options.headers instanceof Headers) {
          options.headers.set("Authorization", `Bearer ${user.token}`);
        } else {
          options.headers["Authorization"] = `Bearer ${user.token}`;
        }
      }
    } catch (e) {
      console.error("Fetch interceptor error parsing user:", e);
    }
  }
  return originalFetch(url, options);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
