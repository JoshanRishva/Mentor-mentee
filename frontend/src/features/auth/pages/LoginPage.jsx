import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/login.module.css';

/**
 * LoginPage Component
 * Complete login page with branded left section and form on right
 */
const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const leftContent = (
    <div className={styles.brandingContent}>
      <div className={styles.logoSection}>
        <div className={styles.logo}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" />
            <path
              d="M24 14V34M14 24H34"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1 className={styles.brandName}>MentorHub</h1>
      </div>

      <div className={styles.tagline}>
        <p>Connect with mentors, grow your skills</p>
      </div>

      <div className={styles.illustration}>
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="60" r="25" stroke="currentColor" strokeWidth="2" />
          <path
            d="M75 90C75 75 85 65 100 65C115 65 125 75 125 90"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="60" cy="140" r="20" stroke="currentColor" strokeWidth="2" />
          <circle cx="140" cy="140" r="20" stroke="currentColor" strokeWidth="2" />
          <line x1="60" y1="160" x2="60" y2="190" stroke="currentColor" strokeWidth="2" />
          <line x1="140" y1="160" x2="140" y2="190" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      <div className={styles.features}>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>✓</span>
          <span>Learn from experienced mentors</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>✓</span>
          <span>Real-time collaboration</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>✓</span>
          <span>Track your progress</span>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>✓</span>
          <span>Secure & private</span>
        </div>
      </div>
    </div>
  );

  return (
    <AuthLayout
      leftContent={leftContent}
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
