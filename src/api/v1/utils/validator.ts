/**
 * Validates an email address using a standard regular expression.
 * @param email - The string to validate
 * @returns boolean
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};



/**
 * Validates if a password meets strong security criteria.
 * @param password - The string to validate
 * @returns boolean
 */
export const isStrongPassword = (password: string): boolean => {
  // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};