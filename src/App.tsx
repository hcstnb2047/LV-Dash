import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { BottomNav } from './components/BottomNav'
import { ToastContainer } from './components/Toast'
import { SettingsPage } from './pages/SettingsPage'
import { WelcomePage } from './pages/WelcomePage'
import { KnowledgePage } from './pages/KnowledgePage'
import { KnowledgeViewPage } from './pages/KnowledgeViewPage'
import { FlashcardsPage } from './pages/FlashcardsPage'

function AppRoutes() {
  const { pat, patLoading } = useApp()
  const location = useLocation()
  const hideNav = location.pathname === '/knowledge/view'

  if (patLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
      </div>
    )
  }

  return (
    <>
      <Routes>
        <Route path="/" element={pat ? <KnowledgePage /> : <WelcomePage />} />
        <Route path="/knowledge/view" element={<KnowledgeViewPage />} />
        <Route path="/flashcards" element={pat ? <FlashcardsPage /> : <Navigate to="/" replace />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {pat && !hideNav && <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <ToastContainer />
        <AppRoutes />
      </AppProvider>
    </HashRouter>
  )
}
