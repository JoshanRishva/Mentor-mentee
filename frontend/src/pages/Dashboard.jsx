import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import styles from '../features/auth/styles/auth.module.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className={styles.dashboardPage}>
      <div className={styles.dashboardCard}>
        <h1 className={styles.dashboardTitle}>Welcome, {user?.full_name || user?.email}!</h1>
        <p className={styles.dashboardSubtitle}>
          You are logged in as <strong>{user?.role}</strong>.
        </p>
        <button type="button" className={styles.submitButton} onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
