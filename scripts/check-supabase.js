// Check Supabase connection and data
const { createClient } = require('@supabase/supabase-js');

// Current credentials
const supabaseUrl = 'https://cnkhdwcqfxkdmluvikzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNua2hkd2NxZnhrZG1sdXZpa3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MTc1NDgsImV4cCI6MjA5MDE5MzU0OH0.IB7XhBjJlckK0N0NF2tXeWrbqYjoyWtFk5vxiGGh-L0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  console.log('Checking Supabase:', supabaseUrl);
  console.log('');
  
  // Check books
  const { data: books, error: booksError } = await supabase
    .from('books')
    .select('id, title, cover_url');
  
  console.log('Books count:', books?.length || 0);
  if (booksError) console.log('Books error:', booksError.message);
  
  if (books && books.length > 0) {
    console.log('\nFirst 3 books:');
    books.slice(0, 3).forEach(b => console.log(`  - ${b.title}`));
  }
  
  // Check code snippets
  const { data: snippets, error: snippetsError } = await supabase
    .from('code_snippets')
    .select('count', { count: 'exact', head: true });
  
  console.log('\nCode snippets count:', snippets?.length || 0);
  if (snippetsError) console.log('Snippets error:', snippetsError.message);
  
  // Check users
  const { count: usersCount, error: usersError } = await supabase
    .from('profiles')
    .select('count', { count: 'exact', head: true });
  
  console.log('\nUsers count:', usersCount || 0);
  if (usersError) console.log('Users error:', usersError.message);
}

checkData().catch(console.error);
