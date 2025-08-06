import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log(`Specialized API: ${import.meta.env.VITE_SPECIALIZED_API_URL}`);

createRoot(document.getElementById("root")!).render(
  <StrictMode> 
  <App /> 
  </StrictMode>
);
