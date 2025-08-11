import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import TestComponent from './TestComponent.tsx';
import './index.css';
import './pwa';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TestComponent />
  </StrictMode>
);
