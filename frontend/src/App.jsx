
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './features/auth';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute element={<Dashboard />} />}
          />
          <Route path="/" element={<Navigate to="/auth/login" replace />} />
          <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );


  return <ChatPage />;
}

export default App;