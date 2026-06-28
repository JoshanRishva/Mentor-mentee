/**
 * Validation Utilities
 * Common validation functions for authentication forms
 * Email, password, and field validations
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Returns: { isValid, strength, feedback }
 */
export const validatePassword = (password) => {
  const feedback = [];
  let strength = 0;

  if (!password) {
    return {
      isValid: false,
      strength: 0,
      feedback: ['Password is required'],
    };
  }

  if (password.length < 8) {
    feedback.push('At least 8 characters');
  } else {
    strength++;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('At least one uppercase letter');
  } else {
    strength++;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('At least one lowercase letter');
  } else {
    strength++;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('At least one number');
  } else {
    strength++;
  }

  if (!/[!@#$%^&*]/.test(password)) {
    feedback.push('At least one special character (!@#$%^&*)');
  } else {
    strength++;
  }

  return {
    isValid: feedback.length === 0,
    strength: Math.min(strength, 5),
    feedback,
  };
};

/**
 * Get password strength label
 */
export const getPasswordStrengthLabel = (strength) => {
  const labels = {
    0: 'None',
    1: 'Weak',
    2: 'Fair',
    3: 'Good',
    4: 'Strong',
    5: 'Very Strong',
  };
  return labels[strength] || 'None';
};

/**
 * Get password strength color
 */
export const getPasswordStrengthColor = (strength) => {
  const colors = {
    0: '#ef4444', // red
    1: '#f97316', // orange
    2: '#eab308', // yellow
    3: '#84cc16', // lime
    4: '#22c55e', // green
    5: '#16a34a', // dark green
  };
  return colors[strength] || '#ef4444';
};

/**
 * Validate full name
 */
export const validateFullName = (name) => {
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      error: 'Full name is required',
    };
  }

  if (name.trim().length < 2) {
    return {
      isValid: false,
      error: 'Name must be at least 2 characters',
    };
  }

  if (name.trim().length > 50) {
    return {
      isValid: false,
      error: 'Name must not exceed 50 characters',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Validate role selection
 */
export const validateRole = (role) => {
  const validRoles = ['mentor', 'mentee'];
  
  if (!role) {
    return {
      isValid: false,
      error: 'Please select a role',
    };
  }

  if (!validRoles.includes(role.toLowerCase())) {
    return {
      isValid: false,
      error: 'Invalid role selected',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Validate passwords match
 */
export const validatePasswordsMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return {
      isValid: false,
      error: 'Passwords do not match',
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Validate login form
 */
export const validateLoginForm = (email, password) => {
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validate register form
 */
export const validateRegisterForm = (formData) => {
  const errors = {};

  // Validate full name
  const nameValidation = validateFullName(formData.fullName);
  if (!nameValidation.isValid) {
    errors.fullName = nameValidation.error;
  }

  // Validate email
  if (!formData.email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(formData.email)) {
    errors.email = 'Invalid email format';
  }

  // Validate password
  if (!formData.password) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      errors.password = `Password strength: ${getPasswordStrengthLabel(passwordValidation.strength)}`;
    }
  }

  // Validate confirm password
  if (!formData.confirmPassword) {
    errors.confirmPassword = 'Confirm password is required';
  } else {
    const matchValidation = validatePasswordsMatch(formData.password, formData.confirmPassword);
    if (!matchValidation.isValid) {
      errors.confirmPassword = matchValidation.error;
    }
  }

  // Validate role
  const roleValidation = validateRole(formData.role);
  if (!roleValidation.isValid) {
    errors.role = roleValidation.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
