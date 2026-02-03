import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authService } from '../services/auth.service';

const router = Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CREDENTIALS',
          message: 'Username and password are required',
        },
      });
    }
    
    const result = await authService.login({ username, password });
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'LOGIN_FAILED',
        message: error.message || 'Login failed',
      },
    });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body;
    
    if (!username || !password || !fullName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Username, password, and fullName are required',
        },
      });
    }
    
    const result = await authService.register({ username, password, fullName, role: role || 'WORKER' });
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'REGISTRATION_FAILED',
        message: error.message || 'Registration failed',
      },
    });
  }
});

// Logout
router.post('/logout', authenticate, (_req, res) => {
  // TODO: Implement logout logic (blacklist token, etc.)
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REFRESH_TOKEN',
          message: 'Refresh token is required',
        },
      });
    }
    
    const result = await authService.refreshToken(refreshToken);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 401;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'INVALID_REFRESH_TOKEN',
        message: error.message || 'Invalid refresh token',
      },
    });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  const authReq = req as any;
  try {
    const user = await authService.getCurrentUser(authReq.user.userId);
    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 404;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'USER_NOT_FOUND',
        message: error.message || 'User not found',
      },
    });
  }
});

export default router;
