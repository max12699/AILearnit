// Router import hatao
import { Routes, Route, Navigate } from 'react-router-dom'  // BrowserRouter as Router ❌
import { useAuth } from './context/AuthContext'

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