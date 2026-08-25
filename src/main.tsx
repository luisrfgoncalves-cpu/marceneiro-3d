import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { I18nextProvider } from 'react-i18next'
import './index.css'
import './lib/i18n'
import App from './App'
import { ThemeProvider } from './components/ThemeProvider'

// Registro do Service Worker (Anexo A3) — autoUpdate silencioso.
// Quando há nova versão, o SW é instalado em background e ativa
// na próxima vez que o usuário abre o app.
registerSW({
  onNeedRefresh() {
    // Atualização disponível — o autoUpdate cuida disso automaticamente.
    // Para exibir um banner de "nova versão", implemente aqui.
  },
  onOfflineReady() {
    console.info('[PWA] App pronto para uso offline.')
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nextProvider i18n={await import('./lib/i18n').then(m => m.default)}>
      <ThemeProvider defaultTheme="light"><App /></ThemeProvider>
    </I18nextProvider>
  </StrictMode>,
)
