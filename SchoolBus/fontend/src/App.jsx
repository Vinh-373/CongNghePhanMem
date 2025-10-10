import { Toaster, } from 'sonner';
import { BrowserRouter, Routes, Route } from 'react-router'
import  Login  from './pages/LoginPage.jsx';
import  Register  from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import { NotFound } from './pages/NotFound.jsx';

function App() {
  return <>
    
    <Toaster />
    <BrowserRouter>
      <Routes>
        <Route path='/schoolbus/register' element={<Register />} />
        <Route path='/schoolbus/login' element={<Login />} />
        <Route path='/schoolbus/dashboard' element={<DashboardPage />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </>
}

export default App
