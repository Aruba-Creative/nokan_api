import { register } from 'tsconfig-paths';
import { resolve } from 'path';

// Register path aliases for runtime
register({
  baseUrl: resolve(__dirname, '../'),
  paths: {
    '@/*': ['src/*']
  }
});