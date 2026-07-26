import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import styles from '../styles/auth.module.css';

/**
 * PasswordInput Component
 * Reusable password input with show/hide toggle
 * Includes validation feedback and strength indicator
 */
const PasswordInput = ({
  label,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  strength = null,
  strengthColor = null,
  strengthLabel = null,
  disabled = false,
  required = false,
  name = 'password',
  id,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.formGroup}>
      <label htmlFor={id || name} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>

      <div className={styles.passwordInputWrapper}>
        <input
          id={id || name}
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />

        <button
          type="button"
          onClick={togglePasswordVisibility}
          className={styles.passwordToggle}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {strength !== null && (
        <div className={styles.strengthIndicator}>
          <div className={styles.strengthBars}>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`${styles.strengthBar} ${
                  i < strength ? styles.strengthBarFilled : ''
                }`}
                style={{
                  backgroundColor: i < strength ? strengthColor : '#e5e7eb',
                }}
              />
            ))}
          </div>
          <span className={styles.strengthLabel} style={{ color: strengthColor }}>
            {strengthLabel}
          </span>
        </div>
      )}

      {error && (
        <span className={styles.errorText} id={`${name}-error`}>
          {error}
        </span>
      )}
    </div>
  );
};

export default PasswordInput;
