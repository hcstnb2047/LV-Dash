import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { BottomNav } from './components/BottomNav'
import { ToastContainer } from './components/Toast'
import { ActionsPage } from './pages/ActionsPage'
import { SettingsPage } from './pages/SettingsPage'
import { WelcomePage } from './pages/WelcomePage'
import { PlaceholderPage } from './pages/PlaceholderPage'

function AppRoutes() {
  const { pat, patLoading } = useApp()

  if (patLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      <Routes>
        <Route path="/" element={pat ? <ActionsPage /> : <WelcomePage />} />
        <Route path="/knowledge" element={<PlaceholderPage title="Knowledge" />} />
        <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {pat && <BottomNav />}
    </>
  )
}

function PWAUpdatePrompt() {
  // vite-plugin-pwa registerType:'prompt' provides useRegisterSW
  // For now, a simple manual reload notification
  return null
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <ToastContainer />
        <AppRoutes />
        <PWAUpdatePrompt />
      </AppProvider>
    </HashRouter>
  )
}
