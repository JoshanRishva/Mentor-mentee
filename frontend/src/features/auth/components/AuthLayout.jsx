import styles from '../styles/auth.module.css';

/**
 * AuthLayout Component
 * Two-column layout: branded left panel + form card on the right
 */
const AuthLayout = ({ leftContent, title, subtitle, children }) => {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authBrandSection}>
        <div className={styles.brandContent}>{leftContent}</div>
      </div>
      <div className={styles.authFormSection}>
        <div className={styles.formCard}>
          <h1 className={styles.formTitle}>{title}</h1>
          <p className={styles.formSubtitle}>{subtitle}</p>
          <div className={styles.formContent}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
