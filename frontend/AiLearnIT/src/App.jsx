// Router import hatao
import { Routes, Route, Navigate } from 'react-router-dom'  // BrowserRouter as Router ❌
import { useAuth } from './context/AuthContext'
import LoginPage from './Pages/Auth/LoginPage'
import RegisterPage from './Pages/Auth/RegisterPage'
import NotFoundPage from './Pages/NotFoundPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

import DashPage from "./Pages/Dahboard/DashPage"
import DocListPage from "./Pages/Documents/DocListPage"
import DocDetailPage from "./Pages/Documents/DocDetailPage"
import FlashListPage from "./Pages/Flashcard/FlashListPage"
import FlashcardPage from "./Pages/Flashcard/FlashcardPage"
import QuizTakePage from "./Pages/Quizzes/QuzTakePage"
import QuizResPage from "./Pages/Quizzes/QuzResPage"
import ProfilePage from "./Pages/Profile/ProfilePage"
import { AppLayout } from './components/layout/AppLayout'

export default function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <p>loading.....</p>
      </div>
    )
  }

  // <Router> wrap hatao — sirf Routes rakho
  return (
    <Routes>
      <Route
        path='/'
        element={
          isAuthenticated 
            ? <Navigate to='/dashboard' replace /> 
            : <Navigate to='/login' replace />
        }
      />
      <Route path='/login' element={<LoginPage />} />
      <Route path='/register' element={<RegisterPage />} />
      <Route element={<AppLayout />}>
        <Route path='/dashboard' element={<DashPage />} />
        <Route path='/documents' element={<DocListPage />} />
        <Route path='/documents/:id' element={<DocDetailPage />} />
        <Route path='/flashcards' element={<FlashListPage />} />
        <Route path='/documents/:id/flashcards' element={<FlashcardPage />} />
        <Route path='/quiz/:quizId' element={<QuizTakePage />} />
        <Route path='/quiz/:quizId/results' element={<QuizResPage />} />
        <Route path='/profile' element={<ProfilePage />} />
      </Route>
      <Route path='*' element={<NotFoundPage />} />
    </Routes>
  )
}