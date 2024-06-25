import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import ProjectManager from './components/ProjectManager.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ProjectManager />
  </React.StrictMode>,
)
