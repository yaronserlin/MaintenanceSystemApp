import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './index.css';
import AppRoutes from './routes';
import ErrorBoundary from './components/ErrorComponent/ErrorBoundary';
import { ThemeModeProvider } from './contexts/ThemeContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeModeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeModeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
