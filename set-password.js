// Helper script to set user passwords in the database using the Service Role Key.
// Usage: node set-password.js <email> <new_password>
// Example: node set-password.js admin@gmail.com admin123

global.WebSocket = class WebSocket {};
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Parse .env file
const envPath = path.join(__dirname, '.env');
const env = {};
try {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = match[2] || '';
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      env[key] = val.trim();
    }
  });
} catch (e) {
  console.error('Error reading .env file:', e.message);
  process.exit(1);
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env file.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('\nUsage: node set-password.js <email> <new_password>\n');
  process.exit(0);
}

const email = args[0].trim().toLowerCase();
const newPassword = args[1].trim();

if (newPassword.length < 6) {
  console.error('Error: Password must be at least 6 characters.');
  process.exit(1);
}

async function run() {
  console.log(`Searching auth user for email: ${email}...`);
  
  // 1. Get user by email to get their ID
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Error querying users:', listError.message);
    process.exit(1);
  }

  const user = users.find(u => u.email.toLowerCase() === email);
  if (!user) {
    console.error(`Error: User with email "${email}" not found in auth.users.`);
    process.exit(1);
  }

  console.log(`Found user: ID=${user.id}. Attempting to update password...`);

  // 2. Update password
  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  );

  if (error) {
    console.error('Error updating password:', error.message);
    process.exit(1);
  }

  console.log(`\nSuccess! Password for user "${email}" has been updated.`);
}

run();
