// Helper script to set user roles in the database using the Service Role Key.
// Usage: node set-role.js <email> <role>
// Example: node set-role.js test@example.com admin

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
  console.log('\nUsage: node set-role.js <email> <role>');
  console.log('Roles: customer, farmer, admin\n');
  process.exit(0);
}

const email = args[0].trim().toLowerCase();
const role = args[1].trim().toLowerCase();

const validRoles = ['customer', 'farmer', 'admin'];
if (!validRoles.includes(role)) {
  console.error(`Error: Invalid role "${role}". Valid roles are: ${validRoles.join(', ')}`);
  process.exit(1);
}

async function run() {
  console.log(`Searching profile for email: ${email}...`);
  
  // 1. Find the user profile by email
  const { data: profile, error: findError } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('email', email)
    .maybeSingle();

  if (findError) {
    console.error('Error querying profiles:', findError.message);
    process.exit(1);
  }

  if (!profile) {
    console.error(`\nError: No profile found for email "${email}".`);
    console.log('Make sure the user has signed up/registered in the application first.\n');
    process.exit(1);
  }

  console.log(`Found profile: ID=${profile.id}, Current Role=${profile.role}`);

  // 2. Update the role
  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update({ role: role })
    .eq('id', profile.id)
    .select()
    .single();

  if (updateError) {
    console.error('Error updating role:', updateError.message);
    process.exit(1);
  }

  console.log(`\nSuccess! Updated user "${email}" role to: "${updated.role}".`);
}

run();
