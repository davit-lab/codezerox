// Data Migration Script
// Migrates data from old mobile app database to Supabase
// Run with: npx tsx scripts/migrate-data.ts

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// OLD DATA - Replace with your actual data
// ============================================

// Old users data (format: array of user objects)
const oldUsers = [
  // Example format - replace with your actual data
  // {
  //   id: "user-id-1",
  //   email: "user@example.com",
  //   full_name: "John Doe",
  //   avatar_url: "https://example.com/avatar.jpg",
  //   created_at: "2024-01-01T00:00:00Z"
  // }
];

// Old books data
const oldBooks = [
  // Example format
  // {
  //   title: "Book Title",
  //   author: "Author Name",
  //   description: "Book description",
  //   price: 29.99,
  //   cover_url: "https://example.com/cover.jpg",
  //   pdf_url: "https://example.com/book.pdf",
  //   category_id: "category-id",
  //   is_free: false,
  //   is_new: true,
  //   is_popular: false
  // }
];

// Old purchases data
const oldPurchases = [
  // Example format
  // {
  //   user_id: "user-id-1",
  //   book_id: "book-id-1",
  //   purchased_at: "2024-01-01T00:00:00Z"
  // }
];

// Old gallery/code snippets data
const oldGallery = [
  // Example format
  // {
  //   title: "Snippet Title",
  //   html_code: "<div>HTML</div>",
  //   css_code: "div { color: red; }",
  //   js_code: "console.log('hello');",
  //   language: "web",
  //   is_public: true,
  //   views: 100
  // }
];

// Old blog posts data
const oldBlogs = [
  // Example format
  // {
  //   title: "Blog Title",
  //   slug: "blog-slug",
  //   content: "Blog content...",
  //   excerpt: "Blog excerpt",
  //   cover_url: "https://example.com/cover.jpg",
  //   tags: ["tag1", "tag2"],
  //   is_published: true
  // }
];

// ============================================
// MIGRATION FUNCTIONS
// ============================================

async function migrateUsers() {
  console.log('👤 Migrating users...');
  
  for (const user of oldUsers) {
    try {
      // Check if user already exists
      const { data: existing } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existing) {
        console.log(`  ⏭️  User ${user.email} already exists, skipping`);
        continue;
      }
      
      // Insert into profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          email: user.email,
          full_name: user.full_name,
          avatar_url: user.avatar_url,
          created_at: user.created_at
        });
      
      if (profileError) {
        console.error(`  ❌ Error inserting profile for ${user.email}:`, profileError);
        continue;
      }
      
      // Insert into user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'user'
        });
      
      if (roleError) {
        console.error(`  ❌ Error inserting role for ${user.email}:`, roleError);
      } else {
        console.log(`  ✅ User ${user.email} migrated`);
      }
    } catch (error) {
      console.error(`  ❌ Error migrating user ${user.email}:`, error);
    }
  }
  
  console.log('✅ Users migration complete\n');
}

async function migrateBooks() {
  console.log('📚 Migrating books...');
  
  for (const book of oldBooks) {
    try {
      // Check if book already exists
      const { data: existing } = await supabase
        .from('books')
        .select('id')
        .eq('title', book.title)
        .maybeSingle();
      
      if (existing) {
        console.log(`  ⏭️  Book "${book.title}" already exists, skipping`);
        continue;
      }
      
      const { error } = await supabase
        .from('books')
        .insert({
          title: book.title,
          author: book.author,
          description: book.description,
          price: book.price,
          cover_url: book.cover_url,
          pdf_url: book.pdf_url,
          category_id: book.category_id,
          is_free: book.is_free || false,
          is_new: book.is_new || false,
          is_popular: book.is_popular || false,
          rating: 0
        });
      
      if (error) {
        console.error(`  ❌ Error inserting book "${book.title}":`, error);
      } else {
        console.log(`  ✅ Book "${book.title}" migrated`);
      }
    } catch (error) {
      console.error(`  ❌ Error migrating book "${book.title}":`, error);
    }
  }
  
  console.log('✅ Books migration complete\n');
}

async function migratePurchases() {
  console.log('🛒 Migrating purchases...');
  
  for (const purchase of oldPurchases) {
    try {
      // Check if purchase already exists
      const { data: existing } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', purchase.user_id)
        .eq('book_id', purchase.book_id)
        .maybeSingle();
      
      if (existing) {
        console.log(`  ⏭️  Purchase for user ${purchase.user_id} already exists, skipping`);
        continue;
      }
      
      const { error } = await supabase
        .from('purchases')
        .insert({
          user_id: purchase.user_id,
          book_id: purchase.book_id,
          purchased_at: purchase.purchased_at
        });
      
      if (error) {
        console.error(`  ❌ Error inserting purchase:`, error);
      } else {
        console.log(`  ✅ Purchase migrated`);
      }
    } catch (error) {
      console.error(`  ❌ Error migrating purchase:`, error);
    }
  }
  
  console.log('✅ Purchases migration complete\n');
}

async function migrateGallery() {
  console.log('🎨 Migrating gallery/code snippets...');
  
  for (const snippet of oldGallery) {
    try {
      // Check if snippet already exists
      const { data: existing } = await supabase
        .from('code_snippets')
        .select('id')
        .eq('title', snippet.title)
        .maybeSingle();
      
      if (existing) {
        console.log(`  ⏭️  Snippet "${snippet.title}" already exists, skipping`);
        continue;
      }
      
      const { error } = await supabase
        .from('code_snippets')
        .insert({
          title: snippet.title,
          html_code: snippet.html_code || '',
          css_code: snippet.css_code || '',
          js_code: snippet.js_code || '',
          language: snippet.language || 'web',
          is_public: snippet.is_public !== undefined ? snippet.is_public : true,
          hide_code: false,
          views: snippet.views || 0,
          user_id: null
        });
      
      if (error) {
        console.error(`  ❌ Error inserting snippet "${snippet.title}":`, error);
      } else {
        console.log(`  ✅ Snippet "${snippet.title}" migrated`);
      }
    } catch (error) {
      console.error(`  ❌ Error migrating snippet "${snippet.title}":`, error);
    }
  }
  
  console.log('✅ Gallery migration complete\n');
}

async function migrateBlogs() {
  console.log('📝 Migrating blog posts...');
  
  for (const blog of oldBlogs) {
    try {
      // Check if blog already exists
      const { data: existing } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', blog.slug)
        .maybeSingle();
      
      if (existing) {
        console.log(`  ⏭️  Blog "${blog.slug}" already exists, skipping`);
        continue;
      }
      
      const { error } = await supabase
        .from('blog_posts')
        .insert({
          title: blog.title,
          slug: blog.slug,
          content: blog.content,
          excerpt: blog.excerpt,
          cover_url: blog.cover_url,
          tags: blog.tags || [],
          is_published: blog.is_published !== undefined ? blog.is_published : true,
          views: 0
        });
      
      if (error) {
        console.error(`  ❌ Error inserting blog "${blog.slug}":`, error);
      } else {
        console.log(`  ✅ Blog "${blog.slug}" migrated`);
      }
    } catch (error) {
      console.error(`  ❌ Error migrating blog "${blog.slug}":`, error);
    }
  }
  
  console.log('✅ Blogs migration complete\n');
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  console.log('🚀 Starting data migration...\n');
  
  try {
    // Run migrations in order
    await migrateUsers();
    await migrateBooks();
    await migratePurchases();
    await migrateGallery();
    await migrateBlogs();
    
    console.log('🎉 All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
