import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const savedTheme = localStorage.getItem('ngp-theme')
const preferredTheme =
  savedTheme === 'light' || savedTheme === 'dark'
    ? savedTheme
    : window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'

document.documentElement.dataset.theme = preferredTheme

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
