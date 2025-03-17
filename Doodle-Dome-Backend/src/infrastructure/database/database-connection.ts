import { Connection, getConnection as typeormGetConnection } from 'typeorm';

/**
 * Gets the current TypeORM connection
 * @returns The active database connection
 */
export function getConnection(): Connection {
  return typeormGetConnection();
} 