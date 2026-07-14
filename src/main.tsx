import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // 👈 THIS EXACT LINE IS PROBABLY MISSING OR WRONG!
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
