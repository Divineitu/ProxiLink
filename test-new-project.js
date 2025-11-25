// Test with YOUR new Supabase project
const SUPABASE_URL = 'https://usdftdymaiyddgmlaaqm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZGZ0ZHltYWl5ZGRnbWxhYXFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDUzNzcsImV4cCI6MjA3ODYyMTM3N30.AE_EPYbDNWomWN_3HQLK63MIktlKAKSXo3yNPARBoVs';

async function testNewProject() {
  console.log('Testing YOUR Supabase project...\n');
  
  // Test 1: Create account
  try {
    const signupResponse = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `test${Date.now()}@gmail.com`,  // Use gmail.com for valid domain
        password: 'Test123456',
        data: {
          full_name: 'Test User',
          phone: '1234567890'
        }
      })
    });
    
    const signupResult = await signupResponse.json();
    console.log('1. Signup Status:', signupResponse.status);
    
    if (signupResponse.status === 200 && signupResult.user) {
      console.log('✓ User created!');
      console.log('User ID:', signupResult.user.id);
      console.log('Email:', signupResult.user.email);
      
      const userId = signupResult.user.id;
      const accessToken = signupResult.access_token;
      
      // Test 2: Create profile
      console.log('\n2. Creating profile...');
      const profileResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          id: userId,
          full_name: 'Test User',
          phone: '1234567890'
        })
      });
      
      console.log('Profile Status:', profileResponse.status);
      if (profileResponse.ok) {
        console.log('✓ Profile created!');
      } else {
        const error = await profileResponse.text();
        console.log('❌ Profile error:', error);
      }
      
      // Test 3: Create user role
      console.log('\n3. Creating user role...');
      const roleResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          user_id: userId,
          role: 'user'
        })
      });
      
      console.log('Role Status:', roleResponse.status);
      if (roleResponse.ok) {
        console.log('✓ Role created!');
      } else {
        const error = await roleResponse.text();
        console.log('❌ Role error:', error);
      }
      
      // Test 4: Verify everything
      console.log('\n4. Verifying data...');
      const verifyResponse = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      const profile = await verifyResponse.json();
      console.log('Profile data:', JSON.stringify(profile, null, 2));
      
      console.log('\n✅ SUCCESS! Now check your Supabase dashboard:');
      console.log('https://supabase.com/dashboard/project/usdftdymaiyddgmlaaqm/auth/users');
      
    } else {
      console.log('❌ Signup failed:', signupResult);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

testNewProject();
