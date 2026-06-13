-- Seed data for certification exams and questions

-- Insert certification exams
INSERT INTO public.certification_exams (id, name, slug, category, subcategory, description, total_questions, pass_threshold, price_gel, time_limit_minutes, is_active, final_assignment)
VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'React Fundamentals',
    'react-fundamentals',
    'frontend',
    'react',
    'ეს გამოცდა ამოწმებს თქვენი ცოდნას React-ის ძირითად კონცეფციებში, მათ შორის: components, state, props, hooks, და lifecycle methods.',
    50,
    35,
    10,
    90,
    true,
    'შექმენით სრული React აპლიკაცია, რომელიც მოიცავს: user authentication, data fetching, და state management-ს.'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'JavaScript Advanced',
    'javascript-advanced',
    'frontend',
    'javascript',
    'ეს გამოცდა ამოწმებს თქვენი ცოდნას JavaScript-ის მოწინავე კონცეფციებში, მათ შორის: closures, promises, async/await, ES6+ features, და design patterns.',
    50,
    35,
    10,
    90,
    true,
    'შექმენით კომპლექსური JavaScript აპლიკაცია, რომელიც იყენებს advanced patterns-ს და modern JavaScript features-ს.'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Python Programming',
    'python-programming',
    'backend',
    'python',
    'ეს გამოცდა ამოწმებს თქვენი ცოდნას Python-ის ფუნდამენტალურ და მოწინავე კონცეპციებში, მათ შორის: data types, functions, OOP, და standard library.',
    50,
    35,
    10,
    90,
    true,
    'შექმენით Python პროექტი, რომელიც მოიცავს: data processing, API integration, და database operations-ს.'
  )
ON CONFLICT (id) DO NOTHING;

-- Note: Questions should be added separately via admin panel or separate migration files
-- This migration only sets up the exam structure with 50 questions each
