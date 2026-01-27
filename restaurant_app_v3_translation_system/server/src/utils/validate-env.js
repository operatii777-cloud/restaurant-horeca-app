/**
 * ENTERPRISE MODULE - Environment Variables Validation
 * 
 * Validates required environment variables and sets defaults for optional ones.
 * Prevents server from starting with invalid configuration.
 */

function validateEnv() {
  const required = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];
  
  const optional = {
    PORT: 3001,
    NODE_ENV: 'development',
    CORS_ORIGIN: '*',
    JWT_EXPIRES_IN: '24h',
    JWT_REFRESH_EXPIRES_IN: '7d',
    DATABASE_PATH: './database.db'
  };
  
  // Check required variables
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n💡 Copy .env.example to .env and fill in the values');
    console.error('💡 Or set them in your environment/system variables');
    process.exit(1);
  }
  
  // Set defaults for optional variables
  Object.entries(optional).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = String(defaultValue);
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`⚠️  ${key} not set, using default: ${defaultValue}`);
      }
    }
  });
  
  // Validate JWT secrets strength in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET.length < 32) {
      console.error('❌ JWT_SECRET must be at least 32 characters in production');
      console.error(`   Current length: ${process.env.JWT_SECRET.length}`);
      process.exit(1);
    }
    
    if (process.env.JWT_REFRESH_SECRET.length < 32) {
      console.error('❌ JWT_REFRESH_SECRET must be at least 32 characters in production');
      console.error(`   Current length: ${process.env.JWT_REFRESH_SECRET.length}`);
      process.exit(1);
    }
    
    if (process.env.JWT_SECRET === process.env.JWT_REFRESH_SECRET) {
      console.error('❌ JWT_SECRET and JWT_REFRESH_SECRET must be different in production');
      process.exit(1);
    }
    
    if (process.env.CORS_ORIGIN === '*') {
      console.warn('⚠️  CORS_ORIGIN is set to "*" in production - this is insecure!');
      console.warn('   Set CORS_ORIGIN to your actual domain(s)');
    }
  }
  
  // Validate JWT expiration format
  const jwtExpirationRegex = /^\d+[smhd]$/;
  if (!jwtExpirationRegex.test(process.env.JWT_EXPIRES_IN)) {
    console.warn(`⚠️  JWT_EXPIRES_IN format may be invalid: ${process.env.JWT_EXPIRES_IN}`);
    console.warn('   Expected format: number + unit (e.g., "24h", "30m", "7d")');
  }
  
  if (!jwtExpirationRegex.test(process.env.JWT_REFRESH_EXPIRES_IN)) {
    console.warn(`⚠️  JWT_REFRESH_EXPIRES_IN format may be invalid: ${process.env.JWT_REFRESH_EXPIRES_IN}`);
  }
  
  console.log('✅ Environment variables validated');
}

module.exports = { validateEnv };

