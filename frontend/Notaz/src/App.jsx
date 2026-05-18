import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/Homepage';
import LoginPage from './components/Loginpage';
import RegisterPage from './components/Registerpage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;