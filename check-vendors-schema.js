// Quick script to check vendors table schema
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  // Try to insert with all possible fields, see which ones fail
  const testData = {
    id: '00000000-0000-0000-0000-000000000000',
    business_name: 'TEST',
    email: 'test@test.com',
    phone: '555-1234',
    category: 'Test',
    city: 'Test City',
    state: 'TS',
    description: 'Test description',
  };

  console.log('Testing vendor insert with minimal fields...');
  const { data, error } = await supabase
    .from('vendors')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error querying vendors:', error);
  } else {
    console.log('Existing vendor example:', data[0]);
    console.log('\nColumn names:', data[0] ? Object.keys(data[0]) : 'No vendors found');
  }
}

checkSchema();
