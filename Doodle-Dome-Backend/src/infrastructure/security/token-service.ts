import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';
import { User } from '../../core/domain/entities/User';

interface TokenPayload {
  userId: number;
  email: string;
  userType: string;
}

export class TokenService {
  generateToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id!,
      email: user.email,
      userType: user.userType
    };

    const secretKey = Buffer.from(config.jwt.secret as string, 'utf-8');
    const options: SignOptions = {
      expiresIn: 24 * 60 * 60 * 1000
    };

    return jwt.sign(payload, secretKey, options);
  }

  verifyToken(token: string): TokenPayload {
    const secretKey = Buffer.from(config.jwt.secret as string, 'utf-8');
    return jwt.verify(token, secretKey) as TokenPayload;
  }
} 