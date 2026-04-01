import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// Get all users (with pagination and filters)
router.get('/', authenticate, async (req, res) => {
  try {
    const authReq = req as any;
    const { page = 1, limit = 20, role, isActive, search } = req.query;
    
    // Allow any authenticated user to view users (role-based filtering happens on UI)
    // If you want to restrict, uncomment the following:
    // if (authReq.user.role !== 'MANAGER' && authReq.user.role !== 'ADMIN') {
    //   throw new AppError('Unauthorized - Manager role required', 403, 'UNAUTHORIZED');
    // }

    const skip = (Number(page) - 1) * Number(limit);
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.is_active = isActive === 'true';
    }

    if (search) {
      where.OR = [
        { username: { contains: search as string, mode: 'insensitive' } },
        { fullName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        select: {
          id: true,
          username: true,
          email: true,
          fullName: true,
          role: true,
          is_active: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { fullName: 'asc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_USERS_FAILED',
        message: error.message || 'Failed to fetch users',
      },
    });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        is_active: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_USER_FAILED',
        message: error.message || 'Failed to fetch user',
      },
    });
  }
});

// Create new user (admin function)
router.post('/', authenticate, async (req, res) => {
  try {
    const authReq = req as any;
    const { username, email, password, fullName, role } = req.body;

    // Only managers can create users
    if (authReq.user.role !== 'MANAGER') {
      throw new AppError('Unauthorized - Manager role required', 403, 'UNAUTHORIZED');
    }

    if (!username || !email || !password || !fullName) {
      throw new AppError('Username, email, password, and fullName are required', 400, 'MISSING_FIELDS');
    }

    // Check if username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    });

    if (existingUser) {
      throw new AppError('Username or email already exists', 400, 'USER_EXISTS');
    }

    // Hash password (using bcrypt via auth service)
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        id: `user-${Date.now()}`,
        username,
        email,
        passwordHash,
        fullName,
        role: role || 'WORKER',
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        is_active: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'CREATE_USER_FAILED',
        message: error.message || 'Failed to create user',
      },
    });
  }
});

// Update user
router.put('/:id', authenticate, async (req, res) => {
  try {
    const authReq = req as any;
    const { id } = req.params;
    const { email, fullName, role, isActive } = req.body;

    // Only managers can update other users, or users can update themselves
    const isManager = authReq.user.role === 'MANAGER';
    const isSelf = authReq.user.userId === id;

    if (!isManager && !isSelf) {
      throw new AppError('Unauthorized', 403, 'UNAUTHORIZED');
    }

    // Managers can update role and isActive, regular users can only update their own profile
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (email) updateData.email = email;
    if (fullName) updateData.fullName = fullName;
    
    if (isManager) {
      if (role) updateData.role = role;
      if (isActive !== undefined) updateData.is_active = isActive;
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        is_active: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'UPDATE_USER_FAILED',
        message: error.message || 'Failed to update user',
      },
    });
  }
});

// Delete (deactivate) user
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const authReq = req as any;
    const { id } = req.params;

    // Only managers can deactivate users
    if (authReq.user.role !== 'MANAGER') {
      throw new AppError('Unauthorized - Manager role required', 403, 'UNAUTHORIZED');
    }

    // Cannot deactivate yourself
    if (authReq.user.userId === id) {
      throw new AppError('Cannot deactivate your own account', 400, 'CANNOT_DEACTIVATE_SELF');
    }

    await prisma.user.update({
      where: { id },
      data: { is_active: false, updatedAt: new Date() },
    });

    res.json({
      success: true,
      message: 'User deactivated successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'DELETE_USER_FAILED',
        message: error.message || 'Failed to deactivate user',
      },
    });
  }
});

// Change password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const authReq = req as any;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400, 'MISSING_FIELDS');
    }

    const user = await prisma.user.findUnique({
      where: { id: authReq.user.userId },
    });

    if (!user || !user.passwordHash) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const bcrypt = require('bcrypt');
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValid) {
      throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: authReq.user.userId },
      data: { passwordHash: newPasswordHash, updatedAt: new Date() },
    });

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'CHANGE_PASSWORD_FAILED',
        message: error.message || 'Failed to change password',
      },
    });
  }
});

export default router;
