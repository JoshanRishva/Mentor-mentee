import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  validateRegisterForm,
  validatePassword,
  getPasswordStrengthColor,
  getPasswordStrengthLabel,
} from '../utils/validation';
import PasswordInput from './PasswordInput';
import LoadingSpinner from './LoadingSpinner';
import styles from '../styles/auth.module.css';

/**
 * RegisterForm Component
 * Handles user registration with email, password, and role selection
 * Features: password strength indicator, form validation, error handling
 */
const RegisterForm = () => {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'mentee',
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitError, setSubmitError] = useState('');
  const passwordStrength = formData.password
    ? (() => {
        const validation = validatePassword(formData.password);
        return {
          strength: validation.strength,
          label: getPasswordStrengthLabel(validation.strength),
          color: getPasswordStrengthColor(validation.strength),
        };
      })()
    : { strength: 0, label: 'None', color: '#ef4444' };

  // Clear global error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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
    const validation = validateRegisterForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Check terms agreement
    if (!formData.agreeToTerms) {
      setErrors(prev => ({
        ...prev,
        agreeToTerms: 'You must agree to the terms and conditions',
      }));
      return;
    }

    // Clear previous errors
    setErrors({});

    // Attempt registration
    const result = await register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    });

    if (result.success) {
      // Navigate to login page on successful registration
      navigate('/auth/login', {
        state: { message: 'Registration successful! Please log in.' },
        replace: true,
      });
    } else {
      setSubmitError(result.error || 'Registration failed. Please try again.');
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
        <label htmlFor="fullName" className={styles.label}>
          Full Name
          <span className={styles.required}>*</span>
        </label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder="Enter your full name"
          disabled={isLoading}
          className={`${styles.input} ${
            touched.fullName && errors.fullName ? styles.inputError : ''
          }`}
          aria-invalid={touched.fullName && !!errors.fullName}
          aria-describedby={touched.fullName && errors.fullName ? 'fullName-error' : undefined}
        />
        {touched.fullName && errors.fullName && (
          <span className={styles.errorText} id="fullName-error">
            {errors.fullName}
          </span>
        )}
      </div>

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
        placeholder="Create a strong password"
        error={touched.password && errors.password}
        strength={passwordStrength.strength}
        strengthColor={passwordStrength.color}
        strengthLabel={passwordStrength.label}
        disabled={isLoading}
        required
      />

      <PasswordInput
        label="Confirm Password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder="Confirm your password"
        error={touched.confirmPassword && errors.confirmPassword}
        disabled={isLoading}
        required
      />

      <div className={styles.formGroup}>
        <label htmlFor="role" className={styles.label}>
          I am a
          <span className={styles.required}>*</span>
        </label>
        <div className={styles.roleSelector}>
          {['mentee', 'mentor'].map(roleOption => (
            <label key={roleOption} className={styles.radioLabel}>
              <input
                type="radio"
                name="role"
                value={roleOption}
                checked={formData.role === roleOption}
                onChange={handleInputChange}
                disabled={isLoading}
                className={styles.radio}
              />
              <span className={styles.roleText}>
                {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
              </span>
            </label>
          ))}
        </div>
        {touched.role && errors.role && (
          <span className={styles.errorText}>{errors.role}</span>
        )}
      </div>

      <label className={styles.checkboxLabel}>
        <input
          type="checkbox"
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleInputChange}
          disabled={isLoading}
          className={styles.checkbox}
        />
        <span>
          I agree to the{' '}
          <Link to="/terms" className={styles.authLink}>
            Terms and Conditions
          </Link>
        </span>
      </label>
      {errors.agreeToTerms && (
        <span className={styles.errorText}>{errors.agreeToTerms}</span>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={styles.submitButton}
        aria-busy={isLoading}
      >
        {isLoading ? <LoadingSpinner size="small" /> : 'Create Account'}
      </button>

      <div className={styles.authFooter}>
        <p>
          Already have an account?{' '}
          <Link to="/auth/login" className={styles.authLink}>
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
};

export default RegisterForm;
