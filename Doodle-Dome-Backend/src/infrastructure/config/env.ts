import dotenv from 'dotenv';
import { Secret } from 'jsonwebtoken';

dotenv.config();

export const config = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'drawing_user',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_DATABASE || 'drawing_org_db',
  },
  jwt: {
    secret: process.env.JWT_SECRET as Secret || 'default_secret_key_change_this',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  server: {
    port: Number(process.env.PORT) || 3000,
  },
}; 