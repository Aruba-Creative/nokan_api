import * as jwt from 'jsonwebtoken';
import config from '@/config';

/**
 * Interface for JWT payload
 */
export interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

/**
 * Sign a new JWT token
 * @param payload - Data to encode in the token
 * @returns The signed JWT token
 */
export const signToken = (payload: object): string => {
  // Bypass TypeScript checking with a type assertion
  return (jwt as any).sign(
    payload, 
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
};

/**
 * Verify a JWT token
 * @param token - The token to verify
 * @returns The decoded payload if valid
 */
export const verifyToken = (token: string): Promise<JwtPayload> => {
  return new Promise((resolve, reject) => {
    // Bypass TypeScript checking with a type assertion
    (jwt as any).verify(token, config.jwtSecret, (err: any, decoded: any) => {
      if (err) return reject(err);
      if (!decoded) return reject(new Error('Token verification returned empty payload'));
      resolve(decoded as JwtPayload);
    });
  });
};