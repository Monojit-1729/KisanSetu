/**
 * Environment configuration and startup validation for KisanSetu Backend.
 */
export const validateEnv = () => {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    const missing = [];

    if (!process.env.MONGODB_URI) {
      missing.push('MONGODB_URI');
    } else if (
      process.env.MONGODB_URI.includes('localhost') ||
      process.env.MONGODB_URI.includes('127.0.0.1')
    ) {
      missing.push('MONGODB_URI (cannot use localhost in production)');
    }

    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET === 'kisansetu_dev_jwt_secret_key_2026' ||
      process.env.JWT_SECRET === 'replace_with_a_secure_random_secret_in_production'
    ) {
      missing.push('JWT_SECRET (must be configured with a secure production secret)');
    }

    if (!process.env.CLIENT_URL) {
      missing.push('CLIENT_URL');
    }

    if (missing.length > 0) {
      const errorMsg = `[KisanSetu Backend] Production Configuration Error: ${missing.join(', ')}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  }
};

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'replace_with_a_secure_random_secret_in_production') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET is required in production');
    }
    return 'kisansetu_dev_jwt_secret_key_2026';
  }
  return secret;
};

export default {
  validateEnv,
  getJwtSecret,
};
