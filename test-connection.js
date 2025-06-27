require('dotenv').config();
const { supabase } = require('./config/database');

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test connection by fetching from users table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Connection failed:', error.message);
      console.log('Please check your Supabase URL and keys in .env file');
    } else {
      console.log('✅ Supabase connection successful!');
      console.log('Ready to use authentication endpoints');
    }
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();
