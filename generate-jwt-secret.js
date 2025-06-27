const crypto = require('crypto');

console.log('🔐 Generating JWT Secret...');
console.log('');
console.log('Add this to your .env file:');
console.log(`JWT_SECRET=${crypto.randomBytes(32).toString('hex')}`);
console.log('');
console.log('✅ JWT Secret generated successfully!');
