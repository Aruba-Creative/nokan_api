declare global {
    namespace NodeJS {
      interface ProcessEnv {
        NODE_ENV: 'development' | 'production' | 'test';
        PORT: string;
        DATABASE_LOCAL: string;
        JWT_SECRET: string;
        JWT_EXPIRES_IN: string;
        JWT_COOKIE_EXPIRES_IN: string;
      }
    }
  }
  
  export {};