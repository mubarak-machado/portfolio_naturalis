/**
 * main.tsx — Ponto de Entrada da Aplicação
 * ==========================================
 * Arquivo que inicia o React e monta o componente App
 * no elemento #root do index.html.
 * 
 * Importa o CSS global (index.css) que contém o design system.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
