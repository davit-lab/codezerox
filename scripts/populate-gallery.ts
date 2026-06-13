// Script to populate code gallery with sample snippets
// Run with: npx tsx scripts/populate-gallery.ts

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sampleSnippets = [
  {
    title: 'Animated Gradient Button',
    html_code: '<button class="gradient-btn">Click Me</button>',
    css_code: `.gradient-btn {
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  animation: gradient 3s ease infinite;
  background-size: 200% 200%;
}
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.gradient-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}`,
    js_code: 'document.querySelector(".gradient-btn").addEventListener("click", () => {\n  alert("Button clicked!");\n});',
    language: 'web',
    is_public: true,
    hide_code: false,
    views: 150
  },
  {
    title: 'Python Hello World',
    html_code: '',
    css_code: '',
    js_code: 'def greet(name):\n    """Greet a person by name."""\n    return f"Hello, {name}! Welcome to Python!"\n\nif __name__ == "__main__":\n    print(greet("World"))\n    \n    # List comprehension example\n    numbers = [1, 2, 3, 4, 5]\n    squares = [n**2 for n in numbers]\n    print(f"Squares: {squares}")',
    language: 'python',
    is_public: true,
    hide_code: false,
    views: 200
  },
  {
    title: 'Async/Await Fetch Example',
    html_code: '',
    css_code: '',
    js_code: `async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

fetchData('https://api.example.com/data')
  .then(data => console.log(data))
  .catch(error => console.error(error));`,
    language: 'javascript',
    is_public: true,
    hide_code: false,
    views: 180
  },
  {
    title: 'SQL Basic Queries',
    html_code: '',
    css_code: '',
    js_code: '-- Select all users\nSELECT * FROM users WHERE active = true;\n\n-- Insert new user\nINSERT INTO users (name, email, created_at)\nVALUES (\'John Doe\', \'john@example.com\', NOW());\n\n-- Update user\nUPDATE users \nSET last_login = NOW() \nWHERE id = 1;\n\n-- Delete user\nDELETE FROM users WHERE id = 1;\n\n-- Join tables\nSELECT u.name, o.order_date \nFROM users u\nJOIN orders o ON u.id = o.user_id;',
    language: 'sql',
    is_public: true,
    hide_code: false,
    views: 120
  },
  {
    title: 'Go Hello World',
    html_code: '',
    css_code: '',
    js_code: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n    \n    name := "Go Developer"\n    age := 25\n    \n    fmt.Printf("Name: %s, Age: %d\\n", name, age)\n    \n    numbers := []int{1, 2, 3, 4, 5}\n    sum := 0\n    for _, num := range numbers {\n        sum += num\n    }\n    fmt.Printf("Sum: %d\\n", sum)\n}',
    language: 'go',
    is_public: true,
    hide_code: false,
    views: 90
  },
  {
    title: 'Rust Basic Example',
    html_code: '',
    css_code: '',
    js_code: 'fn main() {\n    println!("Hello, Rust!");\n    \n    let x = 5;\n    let y: i32 = 10;\n    \n    println!("x = {}, y = {}", x, y);\n    \n    let numbers = vec![1, 2, 3, 4, 5];\n    let sum: i32 = numbers.iter().sum();\n    \n    println!("Sum: {}", sum);\n}',
    language: 'rust',
    is_public: true,
    hide_code: false,
    views: 85
  },
  {
    title: 'Java Simple Class',
    html_code: '',
    css_code: '',
    js_code: 'public class HelloWorld {\n    private String name;\n    \n    public HelloWorld(String name) {\n        this.name = name;\n    }\n    \n    public void greet() {\n        System.out.println("Hello, " + name + "!");\n    }\n    \n    public static void main(String[] args) {\n        HelloWorld hw = new HelloWorld("World");\n        hw.greet();\n        \n        int[] numbers = {1, 2, 3, 4, 5};\n        int sum = 0;\n        for (int num : numbers) {\n            sum += num;\n        }\n        System.out.println("Sum: " + sum);\n    }\n}',
    language: 'java',
    is_public: true,
    hide_code: false,
    views: 110
  },
  {
    title: 'TypeScript Interface',
    html_code: '',
    css_code: '',
    js_code: 'interface User {\n    id: number;\n    name: string;\n    email: string;\n    age?: number;\n}\n\nfunction createUser(user: User): User {\n    return {\n        ...user,\n        id: user.id || Date.now()\n    };\n}\n\nconst user: User = {\n    id: 1,\n    name: "John Doe",\n    email: "john@example.com",\n    age: 30\n};\n\nconst createdUser = createUser(user);\nconsole.log(createdUser);',
    language: 'typescript',
    is_public: true,
    hide_code: false,
    views: 130
  },
  {
    title: 'Modern Card Component',
    html_code: '<div class="card">\n  <div class="card-image">\n    <img src="https://via.placeholder.com/300" alt="Card Image">\n  </div>\n  <div class="card-content">\n    <h3 class="card-title">Card Title</h3>\n    <p class="card-description">This is a beautiful card component with hover effects.</p>\n    <button class="card-button">Learn More</button>\n  </div>\n</div>',
    css_code: '.card {\n  background: white;\n  border-radius: 16px;\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);\n  overflow: hidden;\n  transition: transform 0.3s, box-shadow 0.3s;\n  max-width: 350px;\n}\n.card:hover {\n  transform: translateY(-8px);\n  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);\n}\n.card-image img {\n  width: 100%;\n  height: 200px;\n  object-fit: cover;\n}\n.card-content {\n  padding: 24px;\n}\n.card-title {\n  margin: 0 0 12px;\n  font-size: 20px;\n  font-weight: bold;\n  color: #333;\n}\n.card-description {\n  margin: 0 0 20px;\n  color: #666;\n  line-height: 1.6;\n}\n.card-button {\n  background: #667eea;\n  color: white;\n  border: none;\n  padding: 12px 24px;\n  border-radius: 8px;\n  font-weight: bold;\n  cursor: pointer;\n  transition: background 0.3s;\n}\n.card-button:hover {\n  background: #764ba2;\n}',
    js_code: 'document.querySelector(".card-button").addEventListener("click", () => {\n  alert("Learn More clicked!");\n});',
    language: 'web',
    is_public: true,
    hide_code: false,
    views: 140
  }
];

async function populateGallery() {
  console.log('Populating code gallery with sample snippets...');
  
  for (const snippet of sampleSnippets) {
    try {
      const { error } = await supabase
        .from('code_snippets')
        .insert({
          title: snippet.title,
          html_code: snippet.html_code,
          css_code: snippet.css_code,
          js_code: snippet.js_code,
          language: snippet.language,
          is_public: snippet.is_public,
          hide_code: snippet.hide_code,
          views: snippet.views,
          user_id: null
        });
      
      if (error) {
        console.error(`Error inserting "${snippet.title}":`, error);
      } else {
        console.log(`✓ Inserted: ${snippet.title}`);
      }
    } catch (error) {
      console.error(`Error inserting "${snippet.title}":`, error);
    }
  }
  
  console.log('Done!');
}

populateGallery().catch(console.error);
