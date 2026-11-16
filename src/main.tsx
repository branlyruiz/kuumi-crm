import React from 'react';import {createRoot} from 'react-dom/client';import App from './App';import './style.css';import {ConfirmProvider} from './ui';
createRoot(document.getElementById('root')!).render(<React.StrictMode><ConfirmProvider><App/></ConfirmProvider></React.StrictMode>);
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
