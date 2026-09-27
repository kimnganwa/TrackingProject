import {Toaster} from 'sonner' ;
import {BrowserRouter, Routes, Route} from 'react-router' ;
import HomePage from './pages/HomePage' ;
import NotFound from './pages/NotFound' ;
import LoginPage from './pages/LoginPage' ;
import DashboardPage from './pages/DashboardPage';
import BacklogPage from './pages/BacklogPage';
import SprintPage from './pages/SprintPage';
import AnalyticsPage from './pages/AnalyticsPage';
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
          <Route
            path="/projects/:projectCode/backlog"
            element={<BacklogPage />}
          />
          <Route
            path="/projects/:projectCode/sprints"
            element={<SprintPage />}
          />
          <Route
            path="/projects/:projectCode/analytics"
            element={<AnalyticsPage />}
          />
        </Routes>
       
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </>
  )
}

export default App
