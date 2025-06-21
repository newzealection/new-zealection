import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('main.tsx loaded');

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(
    <>
      <App />
      <div style={{position: 'fixed', bottom: 0, left: 0, background: 'yellow', color: 'black', zIndex: 9999}}>
        React mounted
      </div>
    </>
  );
} else {
  document.body.innerHTML = '<div style="color:red">Root element not found</div>';
}
