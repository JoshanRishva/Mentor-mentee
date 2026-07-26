/**
 * Auth Feature Index
 * Exports all authentication-related components, hooks, and utilities
 */

// Context
export { AuthProvider, AuthContext } from './context/AuthContext';

// Components
export { default as LoginForm } from './components/LoginForm';
export { default as RegisterForm } from './components/RegisterForm';
export { default as AuthLayout } from './components/AuthLayout';
export { default as ProtectedRoute } from './components/ProtectedRoute';
export { default as PasswordInput } from './components/PasswordInput';
export { default as LoadingSpinner } from './components/LoadingSpinner';

// Pages
export { default as LoginPage } from './pages/LoginPage';
export { default as RegisterPage } from './pages/RegisterPage';

// Hooks
export { useAuth } from './hooks/useAuth';

// Services
export { default as authService } from './services/authService';

// Utils
export {
  validateEmail,
  validatePassword,
  validateFullName,
  validateRole,
  validatePasswordsMatch,
  validateLoginForm,
  validateRegisterForm,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
} from './utils/validation';