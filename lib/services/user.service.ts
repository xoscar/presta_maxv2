import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import type { User } from '@prisma/client';
import type { IUserInfo, LoginCredentials, JWTPayload } from '@/types';

export interface ValidationError {
  statusCode: number;
  messages: Array<{ code: string; text: string }>;
  type: string;
}

export const userService = {
  /**
   * Validate user creation data
   */
  async validateCreate(
    body: Partial<{ username: string; password: string }> = {}
  ): Promise<{ username: string; password: string }> {
    const errors: Array<{ code: string; text: string }> = [];

    if (!body.username || !/^[a-zA-Z0-9]+$/.test(body.username) || body.username.length < 4) {
      errors.push({ code: 'username', text: 'Not a valid username.' });
    }

    if (!body.password || body.password.length < 6) {
      errors.push({ code: 'password', text: 'Not a valid password.' });
    }

    if (errors.length) {
      throw {
        statusCode: 400,
        messages: errors,
        type: 'ValidationError',
      } as ValidationError;
    }

    return { username: body.username!, password: body.password! };
  },

  /**
   * Validate login credentials
   */
  async validateLogin(body: LoginCredentials): Promise<LoginCredentials> {
    const errors = ['username', 'password'].reduce(
      (acc: Array<{ code: string; text: string }>, field) => {
        if (!body[field as keyof LoginCredentials]) {
          acc.push({ code: field, text: `El ${field} no puede ser vacío` });
        }
        return acc;
      },
      []
    );

    if (errors.length) {
      throw {
        statusCode: 400,
        messages: errors,
        type: 'ValidationError',
      } as ValidationError;
    }

    return body;
  },

  /**
   * Validate JWT token and return user
   */
  async validateToken(jwtPayload: JWTPayload): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { username: jwtPayload.username },
    });

    if (!user) {
      throw {
        statusCode: 401,
        code: 'User not found',
      };
    }

    return user;
  },

  /**
   * Login user with credentials
   */
  async login(query: LoginCredentials): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { username: query.username },
    });

    if (!user) {
      throw {
        statusCode: 401,
        messages: [{ code: 'UserNotFound', text: 'User not found' }],
        type: 'NotFoundError',
      };
    }

    const isMatch = await bcrypt.compare(query.password, user.password);
    if (!isMatch) {
      throw {
        statusCode: 401,
        messages: [{ code: 'InvalidPassword', text: 'Invalid password' }],
        type: 'AuthError',
      };
    }

    return user;
  },

  /**
   * Create a new user
   */
  async create(data: { username: string; password: string }): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const token = await bcrypt.hash(uuidv4(), salt);

    return prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        token,
        role: 'user',
      },
    });
  },

  /**
   * Validate change-password body
   */
  validateChangePassword(body: Partial<{ currentPassword: string; newPassword: string }> = {}): {
    currentPassword: string;
    newPassword: string;
  } {
    const errors: Array<{ code: string; text: string }> = [];

    if (!body.currentPassword || String(body.currentPassword).trim() === '') {
      errors.push({ code: 'currentPassword', text: 'La contraseña actual es requerida.' });
    }

    if (!body.newPassword || body.newPassword.length < 6) {
      errors.push({
        code: 'newPassword',
        text: 'La nueva contraseña debe tener al menos 6 caracteres.',
      });
    }

    if (body.currentPassword && body.newPassword && body.currentPassword === body.newPassword) {
      errors.push({
        code: 'newPassword',
        text: 'La nueva contraseña debe ser distinta a la actual.',
      });
    }

    if (errors.length) {
      throw {
        statusCode: 400,
        messages: errors,
        type: 'ValidationError',
      } as ValidationError;
    }

    return {
      currentPassword: body.currentPassword!,
      newPassword: body.newPassword!,
    };
  },

  /**
   * Update user password (hashes and saves)
   */
  async updatePassword(userId: string, newPassword: string): Promise<User> {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    return prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  },

  /**
   * Compare password with stored hash
   */
  async comparePassword(user: User, candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, user.password);
  },

  /**
   * Convert user to info object (safe for client)
   */
  toInfo(user: User): IUserInfo {
    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  },

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  },
};

export default userService;
