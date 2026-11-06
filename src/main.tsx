import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initViewportHeight } from './utils/viewport';

initViewportHeight();

createRoot(document.getElementById('root')!).render(<App />);
