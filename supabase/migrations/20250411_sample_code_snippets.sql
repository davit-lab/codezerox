-- Add sample code snippets to populate the public gallery
-- These are example snippets in various languages

INSERT INTO public.code_snippets (id, title, html_code, css_code, js_code, language, user_id, is_public, hide_code, views, created_at, updated_at) VALUES
-- Web - Animated Button
(
  gen_random_uuid(),
  'Animated Gradient Button',
  '<button class="gradient-btn">Click Me</button>',
  '.gradient-btn {
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
}',
  'document.querySelector(".gradient-btn").addEventListener("click", () => {
  alert("Button clicked!");
});',
  'web',
  NULL,
  true,
  false,
  150,
  NOW(),
  NOW()
),

-- Python - Hello World with Function
(
  gen_random_uuid(),
  'Python Hello World',
  '',
  '',
  'def greet(name):
    """Greet a person by name."""
    return f"Hello, {name}! Welcome to Python!"

if __name__ == "__main__":
    print(greet("World"))
    
    # List comprehension example
    numbers = [1, 2, 3, 4, 5]
    squares = [n**2 for n in numbers]
    print(f"Squares: {squares}")',
  'python',
  NULL,
  true,
  false,
  200,
  NOW(),
  NOW()
),

-- JavaScript - Async/Await Example
(
  gen_random_uuid(),
  'Async/Await Fetch Example',
  '',
  '',
  `async function fetchData(url) {
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

// Usage
fetchData('https://api.example.com/data')
  .then(data => console.log(data))
  .catch(error => console.error(error));`,
  'javascript',
  NULL,
  true,
  false,
  180,
  NOW(),
  NOW()
),

-- SQL - Basic Queries
(
  gen_random_uuid(),
  'SQL Basic Queries',
  '',
  '',
  '-- Select all users
SELECT * FROM users WHERE active = true;

-- Insert new user
INSERT INTO users (name, email, created_at)
VALUES ('John Doe', 'john@example.com', NOW());

-- Update user
UPDATE users 
SET last_login = NOW() 
WHERE id = 1;

-- Delete user
DELETE FROM users WHERE id = 1;

-- Join tables
SELECT u.name, o.order_date 
FROM users u
JOIN orders o ON u.id = o.user_id;',
  'sql',
  NULL,
  true,
  false,
  120,
  NOW(),
  NOW()
),

-- Go - Hello World
(
  gen_random_uuid(),
  'Go Hello World',
  '',
  '',
  'package main

import "fmt"

func main() {
    // Print Hello World
    fmt.Println("Hello, World!")
    
    // Variable declaration
    name := "Go Developer"
    age := 25
    
    fmt.Printf("Name: %s, Age: %d\\n", name, age)
    
    // Slice example
    numbers := []int{1, 2, 3, 4, 5}
    sum := 0
    for _, num := range numbers {
        sum += num
    }
    fmt.Printf("Sum: %d\\n", sum)
}',
  'go',
  NULL,
  true,
  false,
  90,
  NOW(),
  NOW()
),

-- Rust - Basic Example
(
  gen_random_uuid(),
  'Rust Basic Example',
  '',
  '',
  'fn main() {
    // Print to console
    println!("Hello, Rust!");
    
    // Variable binding
    let x = 5;
    let y: i32 = 10;
    
    println!("x = {}, y = {}", x, y);
    
    // Vector example
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    
    println!("Sum: {}", sum);
    
    // String manipulation
    let greeting = String::from("Hello");
    let world = "World";
    let message = format!("{} {}", greeting, world);
    println!("{}", message);
}',
  'rust',
  NULL,
  true,
  false,
  85,
  NOW(),
  NOW()
),

-- Java - Simple Class
(
  gen_random_uuid(),
  'Java Simple Class',
  '',
  '',
  'public class HelloWorld {
    private String name;
    
    public HelloWorld(String name) {
        this.name = name;
    }
    
    public void greet() {
        System.out.println("Hello, " + name + "!");
    }
    
    public static void main(String[] args) {
        HelloWorld hw = new HelloWorld("World");
        hw.greet();
        
        // Array example
        int[] numbers = {1, 2, 3, 4, 5};
        int sum = 0;
        for (int num : numbers) {
            sum += num;
        }
        System.out.println("Sum: " + sum);
    }
}',
  'java',
  NULL,
  true,
  false,
  110,
  NOW(),
  NOW()
),

-- TypeScript - Interface Example
(
  gen_random_uuid(),
  'TypeScript Interface',
  '',
  '',
  'interface User {
    id: number;
    name: string;
    email: string;
    age?: number;
}

function createUser(user: User): User {
    return {
        ...user,
        id: user.id || Date.now()
    };
}

const user: User = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    age: 30
};

const createdUser = createUser(user);
console.log(createdUser);

// Generic function
function identity<T>(arg: T): T {
    return arg;
}

const result = identity<string>("Hello TypeScript");
console.log(result);',
  'typescript',
  NULL,
  true,
  false,
  130,
  NOW(),
  NOW()
),

-- PHP - Basic Example
(
  gen_random_uuid(),
  'PHP Basic Example',
  '',
  '',
  '<?php
// Function to greet
function greet($name) {
    return "Hello, " . $name . "!";
}

// Array example
$fruits = ["apple", "banana", "orange"];
foreach ($fruits as $fruit) {
    echo $fruit . "\\n";
}

// Class example
class Person {
    public $name;
    public $age;
    
    public function __construct($name, $age) {
        $this->name = $name;
        $this->age = $age;
    }
    
    public function introduce() {
        return "My name is " . $this->name . " and I am " . $this->age . " years old.";
    }
}

$person = new Person("John", 30);
echo $person->introduce();
?>',
  'php',
  NULL,
  true,
  false,
  75,
  NOW(),
  NOW()
),

-- Swift - Basic Example
(
  gen_random_uuid(),
  'Swift Basic Example',
  '',
  '',
  'import Foundation

// Function
func greet(name: String) -> String {
    return "Hello, \\(name)!"
}

print(greet(name: "World"))

// Struct
struct Person {
    var name: String
    var age: Int
    
    func introduce() -> String {
        return "My name is \\(name) and I am \\(age) years old."
    }
}

let person = Person(name: "John", age: 30)
print(person.introduce())

// Array
let numbers = [1, 2, 3, 4, 5]
let sum = numbers.reduce(0, +)
print("Sum: \\(sum)")',
  'swift',
  NULL,
  true,
  false,
  70,
  NOW(),
  NOW()
),

-- Kotlin - Basic Example
(
  gen_random_uuid(),
  'Kotlin Basic Example',
  '',
  '',
  'fun main() {
    // Print
    println("Hello, Kotlin!")
    
    // Variables
    val name = "John"
    var age = 30
    
    println("Name: $name, Age: $age")
    
    // Data class
    data class Person(val name: String, val age: Int)
    
    val person = Person("Jane", 25)
    println(person)
    
    // List operations
    val numbers = listOf(1, 2, 3, 4, 5)
    val sum = numbers.sum()
    println("Sum: $sum")
    
    // Filter example
    val evenNumbers = numbers.filter { it % 2 == 0 }
    println("Even numbers: $evenNumbers")
}',
  'kotlin',
  NULL,
  true,
  false,
  65,
  NOW(),
  NOW()
),

-- Web - Card Component
(
  gen_random_uuid(),
  'Modern Card Component',
  '<div class="card">
  <div class="card-image">
    <img src="https://via.placeholder.com/300" alt="Card Image">
  </div>
  <div class="card-content">
    <h3 class="card-title">Card Title</h3>
    <p class="card-description">This is a beautiful card component with hover effects.</p>
    <button class="card-button">Learn More</button>
  </div>
</div>',
  '.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  max-width: 350px;
}
.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}
.card-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
.card-content {
  padding: 24px;
}
.card-title {
  margin: 0 0 12px;
  font-size: 20px;
  font-weight: bold;
  color: #333;
}
.card-description {
  margin: 0 0 20px;
  color: #666;
  line-height: 1.6;
}
.card-button {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}
.card-button:hover {
  background: #764ba2;
}',
  'document.querySelector(".card-button").addEventListener("click", () => {
  alert("Learn More clicked!");
});',
  'web',
  NULL,
  true,
  false,
  140,
  NOW(),
  NOW()
);
