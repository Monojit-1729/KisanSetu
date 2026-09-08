import jwt from 'jsonwebtoken';
import { User, USER_ROLES, PUBLIC_REGISTRATION_ROLES } from '../users/index.js';

class AuthService {
  /**
   * Generates a signed JWT for an authenticated user.
   */
  generateToken(user) {
    const payload = {
      id: user.id || user._id.toString(),
      role: user.role,
      email: user.email,
    };

    const secret = process.env.JWT_SECRET || 'kisansetu_dev_jwt_secret_key_2026';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Registers a new user. Public registration only allows Farmer, FPO, and Buyer.
   */
  async registerUser({ name, email, password, role = USER_ROLES.FARMER, phone = '' }) {
    // Sanitize input
    const normalizedEmail = (email || '').trim().toLowerCase();
    const trimmedName = (name || '').trim();
    const normalizedRole = (role || '').trim().toLowerCase();

    // Prevent public admin registration
    if (normalizedRole === USER_ROLES.ADMIN) {
      const error = new Error('Public registration as Admin is not permitted');
      error.statusCode = 403;
      throw error;
    }

    if (!PUBLIC_REGISTRATION_ROLES.includes(normalizedRole)) {
      const error = new Error(`Invalid role. Permitted roles for registration: ${PUBLIC_REGISTRATION_ROLES.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    // Check for duplicate account
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      const error = new Error('An account with this email already exists');
      error.statusCode = 409;
      throw error;
    }

    // Create user
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password,
      role: normalizedRole,
      phone: (phone || '').trim(),
    });

    const token = this.generateToken(user);

    return {
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Authenticates an existing user and returns a token and safe profile.
   */
  async loginUser({ email, password, role }) {
    const normalizedEmail = (email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    // Explicitly query for the password hash
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    // Optional role validation: backend database role is strictly authoritative
    if (role && role.toLowerCase() !== user.role) {
      const error = new Error(`Account registered as ${user.role}. Please log in with the correct role selection.`);
      error.statusCode = 403;
      throw error;
    }

    const token = this.generateToken(user);

    return {
      user: user.toJSON(),
      token,
    };
  }

  /**
   * Retrieves current user profile by ID without password.
   */
  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      const error = new Error('User account not found');
      error.statusCode = 404;
      throw error;
    }
    return user.toJSON();
  }
}

export default new AuthService();
