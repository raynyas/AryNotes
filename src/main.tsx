import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initServiceWorker } from './utils/notifications';

// Register Service Worker for Android background notifications
initServiceWorker();

createRoot(document.getElementById('root')!).render(<App />);
