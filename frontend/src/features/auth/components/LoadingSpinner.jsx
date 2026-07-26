import React from 'react';
import styles from '../styles/auth.module.css';

/**
 * LoadingSpinner Component
 * Displays loading indicator with optional message
 * Used during async operations like login/register
 */
const LoadingSpinner = ({
  size = 'medium',
  message = 'Loading...',
  fullScreen = false,
  overlay = true,
}) => {
  const sizeClasses = {
    small: styles.spinnerSmall,
    medium: styles.spinnerMedium,
    large: styles.spinnerLarge,
  };

  const spinnerContent = (
    <div className={`${styles.spinnerContainer} ${sizeClasses[size] || sizeClasses.medium}`}>
      <div className={styles.spinner}>
        <div className={styles.spinnerInner}></div>
      </div>
      {message && <p className={styles.spinnerMessage}>{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className={`${styles.fullScreenSpinner} ${overlay ? styles.withOverlay : ''}`}>
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;
