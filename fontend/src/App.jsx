import {Toaster} from 'sonner' ;
import {BrowserRouter, Routes, Route} from 'react-router' ;
import HomePage from './pages/HomePage' ;
import NotFound from './pages/NotFound' ;
import LoginPage from './pages/LoginPage' ;
import DashboardPage from './pages/DashboardPage';

function App() {
  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={<HomePage />} 
          />
          <Route 
            path="/projects/:projectCode/board" 
            element={<HomePage />} 
          />
          <Route 
            path="*" 
            element={<NotFound />} 
          />
           <Route 
          path="/login" 
          element={<LoginPage />} 
          />
          <Route 
            path="/dashboard" 
            element={<DashboardPage />} 
          />
        </Routes>
       
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </>
  )
}

export default App
