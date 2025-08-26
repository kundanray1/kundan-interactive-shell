import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// No service worker needed - using server-side API proxy

createRoot(document.getElementById("root")!).render(<App />);
