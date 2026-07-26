import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import styles from '../styles/register.module.css';

/**
 * RegisterPage Component
 * Complete registration page with welcome content and form
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const leftContent = (
    <div className={styles.welcomeContent}>
      <div className={styles.header}>
        <h2>Join Our Community</h2>
        <p>Start your learning journey today</p>
      </div>

      <div className={styles.benefits}>
        <div className={styles.benefitCard}>
          <div className={styles.benefitIcon}>🚀</div>
          <h3>Accelerate Growth</h3>
          <p>Get personalized guidance from experienced mentors in your field</p>
        </div>

        <div className={styles.benefitCard}>
          <div className={styles.benefitIcon}>🤝</div>
          <h3>Build Network</h3>
          <p>Connect with professionals and learners from around the world</p>
        </div>

        <div className={styles.benefitCard}>
          <div className={styles.benefitIcon}>📈</div>
          <h3>Track Progress</h3>
          <p>Monitor your achievements and celebrate milestones together</p>
        </div>

        <div className={styles.benefitCard}>
          <div className={styles.benefitIcon}>🎯</div>
          <h3>Achieve Goals</h3>
          <p>Set clear objectives and work with mentors to achieve them</p>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <h4>10K+</h4>
          <p>Active Users</p>
        </div>
        <div className={styles.stat}>
          <h4>500+</h4>
          <p>Expert Mentors</p>
        </div>
        <div className={styles.stat}>
          <h4>95%</h4>
          <p>Success Rate</p>
        </div>
      </div>
    </div>
  );

  return (
    <AuthLayout
      leftContent={leftContent}
      title="Create Account"
      subtitle="Join thousands of learners and mentors"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterPage;
