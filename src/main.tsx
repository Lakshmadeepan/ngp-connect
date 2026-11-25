import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const savedTheme = localStorage.getItem('ngp-theme-preference')
const preferredTheme =
  savedTheme === 'light' || savedTheme === 'dark'
    ? savedTheme
    : 'light'

document.documentElement.dataset.theme = preferredTheme

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
