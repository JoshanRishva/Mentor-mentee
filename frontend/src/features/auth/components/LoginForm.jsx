import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateLoginForm } from '../utils/validation';
import PasswordInput from './PasswordInput';
import LoadingSpinner from './LoadingSpinner';
import styles from '../styles/auth.module.css';

/**
 * LoginForm Component
 * Handles user login with email and password
 * Features: form validation, error handling, remember me, loading state
 */
const LoginForm = () => {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();

  const getRememberedEmail = () => {
    try {
      const remembered = localStorage.getItem('rememberMe');
      return remembered ? JSON.parse(remembered).email || '' : '';
    } catch {
      return '';
    }
  };

  const rememberedEmail = getRememberedEmail();

  const [formData, setFormData] = useState({
    email: rememberedEmail,
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedEmail));
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Clear global error when component mounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Validate form
    const validation = validateLoginForm(formData.email, formData.password);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Clear previous errors
    setErrors({});

    // Attempt login
    const result = await login(
      formData.email,
      formData.password,
      rememberMe
    );

    if (result.success) {
      // Navigate to dashboard on successful login
      navigate('/dashboard', { replace: true });
    } else {
      setSubmitError(result.error || 'Login failed. Please try again.');
    }
  };

  const displayError = submitError || error;

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate>
      {displayError && (
        <div className={styles.alertError} role="alert">
          <span className={styles.alertIcon}>⚠️</span>
          <span>{displayError}</span>
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email Address
          <span className={styles.required}>*</span>
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="Enter your email"
          disabled={isLoading}
          className={`${styles.input} ${
            touched.email && errors.email ? styles.inputError : ''
          }`}
          aria-invalid={touched.email && !!errors.email}
          aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
        />
        {touched.email && errors.email && (
          <span className={styles.errorText} id="email-error">
            {errors.email}
          </span>
        )}
      </div>

      <PasswordInput
        label="Password"
        name="password"
        value={formData.password}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder="Enter your password"
        error={touched.password && errors.password}
        disabled={isLoading}
        required
      />

      <div className={styles.rememberForgot}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
            className={styles.checkbox}
          />
          <span>Remember me</span>
        </label>
        <Link to="/auth/forgot-password" className={styles.forgotLink}>
          Forgot password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={styles.submitButton}
        aria-busy={isLoading}
      >
        {isLoading ? <LoadingSpinner size="small" /> : 'Sign In'}
      </button>

      <div className={styles.authFooter}>
        <p>
          Don't have an account?{' '}
          <Link to="/auth/register" className={styles.authLink}>
            Create one
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
