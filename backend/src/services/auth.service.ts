import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'MANAGER' | 'ADMIN';
}

interface TokenPayload {
  userId: string;
  username: string;
  role: string;
}

export class AuthService {
  /**
   * Authenticate user and generate tokens
   */
  async login(credentials: LoginCredentials) {
    const { username, password } = credentials;

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new AppError('Invalid username or password', 401, 'INVALID_CREDENTIALS');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid username or password', 401, 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const accessToken = this.generateAccessToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    const refreshToken = this.generateRefreshToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData) {
    const { username, email, password, fullName, role } = data;

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw new AppError('Username already exists', 400, 'USERNAME_EXISTS');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash: hashedPassword,
        fullName,
        role,
      },
    });

    // Generate tokens
    const accessToken = this.generateAccessToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    const refreshToken = this.generateRefreshToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET as string) as TokenPayload;

      // Check if user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken({
        userId: user.id,
        username: user.username,
        role: user.role,
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  /**
   * Get current user by ID
   */
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true,
        lastLogin: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return user;
  }

  /**
   * Generate access token
   */
  private generateAccessToken(payload: TokenPayload): string {
    const options: any = {
      expiresIn: JWT_EXPIRES_IN,
    };
    return jwt.sign(payload, JWT_SECRET as any, options);
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(payload: TokenPayload): string {
    const options: any = {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    };
    return jwt.sign(payload, REFRESH_TOKEN_SECRET as any, options);
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET as string) as TokenPayload;
    } catch (error) {
      throw new AppError('Invalid access token', 401, 'INVALID_ACCESS_TOKEN');
    }
  }
}

export const authService = new AuthService();
