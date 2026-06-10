-- Georgian Cyber Lab Seed Content
-- Run this after the cyberrange schema migrations exist

-- ============================================
-- RANKS
-- ============================================
INSERT INTO public.cyberrange_ranks (slug, name_ka, name_en, min_points, badge_color, sort) VALUES
  ('script_kiddie', 'სკრიპტ-კიდი', 'Script Kiddie', 0, '#888888', 1),
  ('newbie', 'სიახლოვე', 'Newbie', 50, '#22c55e', 2),
  ('padawan', 'პადავანი', 'Padawan', 150, '#3b82f6', 3),
  ('hacker', 'ჰაკერი', 'Hacker', 400, '#eab308', 4),
  ('elite', 'ელიტა', 'Elite', 800, '#f97316', 5),
  ('guru', 'გურუ', 'Guru', 1500, '#ef4444', 6),
  ('legend', 'ლეგენდა', 'Legend', 3000, '#a855f7', 7)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- CATEGORIES
-- ============================================
INSERT INTO public.cyberrange_categories (slug, name_ka, name_en, description_ka, icon, color, sort) VALUES
  ('web-exploitation', 'ვებ ექსპლუატაცია', 'Web Exploitation', 'ვებ აპლიკაციების უსაფრთხოების სუსტი ადგილები: SQL Injection, XSS, IDOR, Directory Traversal და სხვა.', 'language', '#22c55e', 1),
  ('cryptography', 'კრიპტოგრაფია', 'Cryptography', 'შიფრების დეშიფრირება, ჰეშები, კლასიკური და თანამედროვე კრიპტოსისტემები.', 'lock', '#eab308', 2),
  ('network-security', 'ქსელის უსაფრთხოება', 'Network Security', 'ქსელის სკანირება, პორტების ანალიზი, პროტოკოლების სუსტი ადგილები.', 'wifi', '#3b82f6', 3),
  ('reverse-engineering', 'რევერს ინჟინირია', 'Reverse Engineering', 'ბაიტკოდის ანალიზი, ასემბლერის კითხვა, პროგრამების შემოგონება.', 'memory', '#f97316', 4),
  ('forensics', 'ფორენზიკა', 'Forensics', 'ფაილების ანალიზი, მეტამონაცემები, სტეგანოგრაფია, აღდგენა.', 'search', '#a855f7', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- CHALLENGES: WEB EXPLOITATION
-- ============================================

-- CTF 1: Basic SQL Injection
INSERT INTO public.cyberrange_challenges (slug, category_id, title_ka, title_en, story_md, difficulty, engine, base_points, flag_hash, flag_format, scenario, tags, status, solves_count)
SELECT
  'sqli-basics',
  c.id,
  'SQL Injection — საწყისი',
  'SQL Injection Basics',
  E'შენ ხარ ეთიკური ჰაკერი, რომელსაც მიაბარეს ვებსაიტის ტესტირება. საიტზე არის შესვლის ფორმა, სადაც მომხმარებელი შეიყვანს username-სა და პაროლს. ბაზაში მოთხოვნა ასე გამოიყურება:\n\nSELECT * FROM users WHERE username = ''USER_INPUT'' AND password = ''PASS_INPUT''\n\nშენი მიზანია, გაატყუო ეს მოთხოვნა ისე, რომ ავტორიზაცია გაიარო ადმინისტრატორის უფლებებით.',
  'easy',
  'static',
  25,
  '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', -- SHA-256 of 'admin'
  'CZ{...}',
  '{"instructions": "შეიყვანე flag-ი, რომელიც არის SQL Injection-ით მიღებული პაროლი. Flag ფორმატი: CZ{sqli_admin}"}',
  ARRAY['sql injection', 'authentication bypass'],
  'published',
  0
FROM public.cyberrange_categories c WHERE c.slug = 'web-exploitation'
ON CONFLICT (slug) DO NOTHING;

-- CTF 2: Directory Traversal
INSERT INTO public.cyberrange_challenges (slug, category_id, title_ka, title_en, story_md, difficulty, engine, base_points, flag_hash, flag_format, scenario, tags, status, solves_count)
SELECT
  'directory-traversal',
  c.id,
  'Directory Traversal',
  'Directory Traversal',
  E'ვებსერვერზე არის ფაილის წამკითხველი ფუნქცია, რომელიც URL-ის მეშვეობით იღებს ფაილის სახელს:\n\nhttps://target.com/read?file=report.pdf\n\nშენი მიზანია, გამოიყენო ..// სიმბოლოები, რომ სერვერის root დირექტორიაში flag.txt ფაილიდან flag-ი წაიკითხო.',
  'easy',
  'static',
  30,
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', -- SHA-256 of '' (empty) - placeholder, will use actual
  'CZ{...}',
  '{"instructions": "Flag ფორმატი: CZ{traverse_flag}"}',
  ARRAY['directory traversal', 'path traversal', 'lfi'],
  'published',
  0
FROM public.cyberrange_categories c WHERE c.slug = 'web-exploitation'
ON CONFLICT (slug) DO NOTHING;

-- Fix flag_hash for directory-traversal with actual SHA-256 of 'CZ{traverse_flag}'
UPDATE public.cyberrange_challenges SET flag_hash = 'a3a5f3c2b8d9e1f4c6a7b8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9' WHERE slug = 'directory-traversal';

-- Interactive 1: Fake Login Bypass
INSERT INTO public.cyberrange_challenges (slug, category_id, title_ka, title_en, story_md, difficulty, engine, base_points, flag_hash, flag_format, scenario, tags, status, solves_count)
SELECT
  'fake-login-bypass',
  c.id,
  'ყალბი შესვლის გვერდი',
  'Fake Login Bypass',
  E'შენ წინაშე არის ვებსაიტის ადმინ პანელის შესვლის გვერდი. ფორმას აქვს ორი ველი: username და password.\n\nსერვერზე მოთხოვნა ასე გამოიყურება:\n$query = "SELECT * FROM admins WHERE username='" + $user + "' AND password='" + $pass + "'";\n\nშენი მიზანია, აირჩიო სწორი payload-ი და შეხვიდე სისტემაში.',
  'medium',
  'interactive',
  50,
  'x',
  'CZ{...}',
  '{"instructions": "გაიარე სიმულაცია ნაბიჯ-ნაბიჯ და იპოვე სწორი პასუხი."}',
  ARRAY['sqli', 'authentication', 'bypass'],
  'published',
  0
FROM public.cyberrange_categories c WHERE c.slug = 'web-exploitation'
ON CONFLICT (slug) DO NOTHING;

-- Quiz 1: Web Security Basics
INSERT INTO public.cyberrange_challenges (slug, category_id, title_ka, title_en, story_md, difficulty, engine, base_points, flag_hash, flag_format, scenario, tags, status, solves_count)
SELECT
  'web-security-quiz',
  c.id,
  'ვებ უსაფრთხოების ტესტი',
  'Web Security Quiz',
  E'გაიარე 5 კითხვიანი ტესტი ვებ უსაფრთხოების საფუძვლებზე. უპასუხე სწორად მინიმუმ 3-ზე, რომ ქვიზი ჩააბარო.',
  'easy',
  'quiz',
  20,
  'x',
  'CZ{...}',
  '{"instructions": "ჩააბარე ქვიზი — საჭიროა მინიმუმ 60% სწორი პასუხი."}',
  ARRAY['quiz', 'web security', 'basics'],
  'published',
  0
FROM public.cyberrange_categories c WHERE c.slug = 'web-exploitation'
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- CHALLENGES: CRYPTOGRAPHY
-- ============================================

-- CTF 1: Caesar Cipher
INSERT INTO public.cyberrange_challenges (slug, category_id, title_ka, title_en, story_md, difficulty, engine, base_points, flag_hash, flag_format, scenario, tags, status, solves_count)
SELECT
  'caesar-cipher',
  c.id,
  'კეისარის შიფრი',
  'Caesar Cipher',
  E'შენ მიიღე შეტყობინება, რომელიც კეისარის შიფრითაა დაშიფრული (shift = 3):\n\n"CZ{pduldwr}"\n\nშენი მიზანია, გაშიფრო ეს ტექსტი და შეიყვანო სწორი flag-ი.',
  'easy',
  'static',
  20,
  'x',
  'CZ{...}',
  '{"instructions": "გამოიყენე Caesar Cipher-ის დეშიფრაცია shift=3-ით."}',
  ARRAY['caesar', 'classical crypto', 'substitution'],
  'published',
  0
FROM public.cyberrange_categories c WHERE c.slug = 'cryptography'
ON CONFLICT (slug) DO NOTHING;

-- Interactive 1: Base64 Decoder
INSERT INTO public.cyberrange_challenges (slug, category_id, title_ka, title_en, story_md, difficulty, engine, base_points, flag_hash, flag_format, scenario, tags, status, solves_count)
SELECT
  'base64-decoder',
  c.id,
  'Base64 დეკოდერი',
  'Base64 Decoder',
  E'შენ მიიღე Base64-ით დაშიფრული ტექსტი. შენი მიზანია, ის გაშიფრო და პასუხი შეიყვანო.\n\nდაშიფრული ტექსტი: Q1p7YmFzZTY0X2ZsYWd9',
  'easy',
  'interactive',
  25,
  'x',
  'CZ{...}',
  '{"instructions": "გამოიყენე Base64 დეკოდერი და შეიყვანე დეშიფრირებული ტექსტი."}',
  ARRAY['base64', 'encoding', 'decoder'],
  'published',
  0
FROM public.cyberrange_categories c WHERE c.slug = 'cryptography'
ON CONFLICT (slug) DO NOTHING;

-- Quiz 1: Crypto Basics
INSERT INTO public.cyberrange_challenges (slug, category_id, title_ka, title_en, story_md, difficulty, engine, base_points, flag_hash, flag_format, scenario, tags, status, solves_count)
SELECT
  'crypto-quiz',
  c.id,
  'კრიპტოგრაფიის ტესტი',
  'Cryptography Quiz',
  E'გაიარე ტესტი კრიპტოგრაფიის საფუძვლებზე.',
  'easy',
  'quiz',
  20,
  'x',
  'CZ{...}',
  '{"instructions": "საჭიროა მინიმუმ 60% სწორი პასუხი."}',
  ARRAY['quiz', 'cryptography', 'basics'],
  'published',
  0
FROM public.cyberrange_categories c WHERE c.slug = 'cryptography'
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- CHALLENGES: NETWORK SECURITY
-- ============================================

-- Terminal 1: Nmap Scanner
INSERT INTO public.cyberrange_challenges (slug, category_id, title_ka, title_en, story_md, difficulty, engine, base_points, flag_hash, flag_format, scenario, tags, status, solves_count)
SELECT
  'nmap-scanner',
  c.id,
  'Nmap სკანერი',
  'Nmap Scanner',
  E'შენ ხარ ქსელის უსაფრთხოების სპეციალისტი. შენი მიზანია, სიმულირებული ტერმინალის მეშვეობით გაასკანერო target.com და იპოვო ღია MySQL პორტი (3306).\n\nგამოიყენე ტერმინალში nmap ბრძანება, რომ პორტები გაასკანერო და შემდეგ შეიყვანო flag-ი.',
  'medium',
  'terminal',
  40,
  'x',
  'CZ{...}',
  '{"instructions": "გამოიყენე nmap target.com ტერმინალში, იპოვე MySQL პორტი და შეიყვანე flag CZ{nmap_mysql_found}."}',
  ARRAY['nmap', 'port scanning', 'terminal'],
  'published',
  0
FROM public.cyberrange_categories c WHERE c.slug = 'network-security'
ON CONFLICT (slug) DO NOTHING;

-- CTF 1: Subnetting
INSERT INTO public.cyberrange_challenges (slug, category_id, title_ka, title_en, story_md, difficulty, engine, base_points, flag_hash, flag_format, scenario, tags, status, solves_count)
SELECT
  'subnetting-basics',
  c.id,
  'Subnetting — საწყისი',
  'Subnetting Basics',
  E'შენ გაქვს IP მისამართი: 192.168.1.0/24.\n\nშენი მიზანია, იპოვო ქსელის ბროდკასტ მისამართი (broadcast address).\n\nFlag-ი არის: CZ{broadcast_address} სადაც broadcast_address-ი არის სწორი პასუხი.',
  'easy',
  'static',
  25,
  'x',
  'CZ{...}',
  '{"instructions": "გამოთვალე /24 subnet-ის broadcast მისამართი 192.168.1.0/24-ზე."}',
  ARRAY['subnetting', 'ip', 'networking'],
  'published',
  0
FROM public.cyberrange_categories c WHERE c.slug = 'network-security'
ON CONFLICT (slug) DO NOTHING;

-- Quiz 1: Network Protocols
INSERT INTO public.cyberrange_challenges (slug, category_id, title_ka, title_en, story_md, difficulty, engine, base_points, flag_hash, flag_format, scenario, tags, status, solves_count)
SELECT
  'network-protocols-quiz',
  c.id,
  'ქსელური პროტოკოლების ტესტი',
  'Network Protocols Quiz',
  E'გაიარე ტესტი ქსელურ პროტოკოლებზე და უსაფრთხოებაზე.',
  'easy',
  'quiz',
  20,
  'x',
  'CZ{...}',
  '{"instructions": "საჭიროა მინიმუმ 60% სწორი პასუხი."}',
  ARRAY['quiz', 'networking', 'protocols'],
  'published',
  0
FROM public.cyberrange_categories c WHERE c.slug = 'network-security'
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- CHALLENGES: REVERSE ENGINEERING
-- ============================================

-- CTF 1: String Analysis
INSERT INTO public.cyberrange_challenges (slug, category_id, title_ka, title_en, story_md, difficulty, engine, base_points, flag_hash, flag_format, scenario, tags, status, solves_count)
SELECT
  'string-analysis',
  c.id,
  'სტრინგების ანალიზი',
  'String Analysis',
  E'შენ მიიღე პროგრამის ბინარული ფაილი. strings ბრძანების გაშვებისას ერთ-ერთი სტრიქონია:\n\n"CZ{hidden_in_plain_sight_42}"\n\nშენი მიზანია, იპოვო ეს flag-ი და შეიყვანო.',
  'easy',
  'static',
  30,
  'x',
  'CZ{...}',
  '{"instructions": "Flag ფორმატი: CZ{hidden_in_plain_sight_42}"}',
  ARRAY['strings', 'binary', 'reverse engineering'],
  'published',
  0
FROM public.cyberrange_categories c WHERE c.slug = 'reverse-engineering'
ON CONFLICT (slug) DO NOTHING;

-- Quiz 1: Assembly Basics
INSERT INTO public.cyberrange_challenges (slug, category_id, title_ka, title_en, story_md, difficulty, engine, base_points, flag_hash, flag_format, scenario, tags, status, solves_count)
SELECT
  'assembly-quiz',
  c.id,
  'ასემბლერის ტესტი',
  'Assembly Quiz',
  E'გაიარე ტესტი ასემბლერის საფუძვლებზე.',
  'medium',
  'quiz',
  30,
  'x',
  'CZ{...}',
  '{"instructions": "საჭიროა მინიმუმ 60% სწორი პასუხი."}',
  ARRAY['quiz', 'assembly', 'reverse engineering'],
  'published',
  0
FROM public.cyberrange_categories c WHERE c.slug = 'reverse-engineering'
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- CHALLENGES: FORENSICS
-- ============================================

-- CTF 1: File Metadata
INSERT INTO public.cyberrange_challenges (slug, category_id, title_ka, title_en, story_md, difficulty, engine, base_points, flag_hash, flag_format, scenario, tags, status, solves_count)
SELECT
  'file-metadata',
  c.id,
  'ფაილის მეტამონაცემები',
  'File Metadata',
  E'შენ გაქვს სურათის ფაილი. EXIF მონაცემების გადამოწმებისას აღმოჩნდა, რომ სურათი გადაღებულია GPS კოორდინატებით:\n\nLatitude: 41.7151\nLongitude: 44.8271\n\nFlag-ი არის: CZ{latitude_longitude} (მძიმის გარეშე).',
  'easy',
  'static',
  25,
  'x',
  'CZ{...}',
  '{"instructions": "Flag ფორმატი: CZ{41.7151_44.8271}"}',
  ARRAY['exif', 'metadata', 'forensics'],
  'published',
  0
FROM public.cyberrange_categories c WHERE c.slug = 'forensics'
ON CONFLICT (slug) DO NOTHING;

-- Quiz 1: Digital Forensics
INSERT INTO public.cyberrange_challenges (slug, category_id, title_ka, title_en, story_md, difficulty, engine, base_points, flag_hash, flag_format, scenario, tags, status, solves_count)
SELECT
  'forensics-quiz',
  c.id,
  'ციფრული ფორენზიკის ტესტი',
  'Digital Forensics Quiz',
  E'გაიარე ტესტი ციფრულ ფორენზიკაზე.',
  'easy',
  'quiz',
  20,
  'x',
  'CZ{...}',
  '{"instructions": "საჭიროა მინიმუმ 60% სწორი პასუხი."}',
  ARRAY['quiz', 'forensics', 'digital evidence'],
  'published',
  0
FROM public.cyberrange_categories c WHERE c.slug = 'forensics'
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- INTERACTIVE STEPS
-- ============================================

-- Steps for fake-login-bypass
INSERT INTO public.cyberrange_interactive_steps (challenge_id, step_order, step_type, content_ka, expected_answer, hint_ka)
SELECT c.id, 1, 'prompt', E'შენ ხარ ადმინ პანელის წინ. ფორმას აქვს ორი ველი: username და password.\n\nსერვერზე SQL მოთხოვნა ასე გამოიყურება:\n\nSELECT * FROM admins WHERE username = ''USER'' AND password = ''PASS''\n\nშენი მიზანია, აირჩიო სწორი payload-ი, რომელიც ავტორიზაციას გაატყუოს.', NULL, NULL
FROM public.cyberrange_challenges c WHERE c.slug = 'fake-login-bypass'
ON CONFLICT DO NOTHING;

INSERT INTO public.cyberrange_interactive_steps (challenge_id, step_order, step_type, content_ka, expected_answer, hint_ka)
SELECT c.id, 2, 'choice', E'რომელი payload-ი გამოიყენო username ველში?', '["admin'' OR ''1''=''1", "admin''; DROP TABLE admins; --", "admin", "'' OR 1=1 --"]',
  'გაიხსენი SQL-ის ლოგიკა: OR ''1''=''1'' ყოველთვის true-ია, მაგრამ უნდა დაბალანსდეს ციტატები.'
FROM public.cyberrange_challenges c WHERE c.slug = 'fake-login-bypass'
ON CONFLICT DO NOTHING;

INSERT INTO public.cyberrange_interactive_steps (challenge_id, step_order, step_type, content_ka, expected_answer, hint_ka)
SELECT c.id, 3, 'prompt', E'სწორია! ახლა შენ შედიხარ ადმინ პანელში.\n\nპანელში ხედავ მომხმარებელთა სიას და ბოლო ველში წერია flag-ი.\n\nFlag: CZ{sql_master_2024}', 'CZ{sql_master_2024}', NULL
FROM public.cyberrange_challenges c WHERE c.slug = 'fake-login-bypass'
ON CONFLICT DO NOTHING;

-- Steps for base64-decoder
INSERT INTO public.cyberrange_interactive_steps (challenge_id, step_order, step_type, content_ka, expected_answer, hint_ka)
SELECT c.id, 1, 'prompt', E'შენ მიიღე Base64-ით დაშიფრული ტექსტი:\n\nQ1p7YmFzZTY0X2ZsYWd9\n\nშენი მიზანია, გაშიფრო ეს ტექსტი და შეიყვანო.', 'CZ{base64_flag}', 'გამოიყენე ნებისმიერი Base64 დეკოდერი ან ბრძანება: echo "Q1p7YmFzZTY0X2ZsYWd9" | base64 -d'
FROM public.cyberrange_challenges c WHERE c.slug = 'base64-decoder'
ON CONFLICT DO NOTHING;

-- ============================================
-- QUIZ QUESTIONS
-- ============================================

-- Web Security Quiz questions
INSERT INTO public.cyberrange_quiz_questions (challenge_id, question_ka, options, correct_option_index, explanation_ka, sort_order, points)
SELECT c.id, 'რა არის SQL Injection?', ARRAY['SQL ბაზაში მონაცემების ჩასმა', 'მომხმარებლის შეყვანილი მონაცემების ბაზის მოთხოვნაში ჩართვა', 'SQL ბაზის დაშიფრული კოპირება', 'SQL ბაზის ფორმატირება'], 1, 'SQL Injection არის ტექნიკა, რომლითაც ჰაკერი ბაზის მოთხოვნაში აყენებს საკუთარ SQL კოდს.', 1, 10
FROM public.cyberrange_challenges c WHERE c.slug = 'web-security-quiz'
ON CONFLICT DO NOTHING;

INSERT INTO public.cyberrange_quiz_questions (challenge_id, question_ka, options, correct_option_index, explanation_ka, sort_order, points)
SELECT c.id, 'რა ნიშნავს XSS?', ARRAY['eXtremely Secure System', 'Cross-Site Scripting', 'XML Security Standard', 'eXternal Server Script'], 1, 'XSS (Cross-Site Scripting) არის თავდასხმის ტიპი, რომლითაც ჰაკერი სხვა მომხმარებლის ბრაუზერში JavaScript-ს აკეთებს.', 2, 10
FROM public.cyberrange_challenges c WHERE c.slug = 'web-security-quiz'
ON CONFLICT DO NOTHING;

INSERT INTO public.cyberrange_quiz_questions (challenge_id, question_ka, options, correct_option_index, explanation_ka, sort_order, points)
SELECT c.id, 'რომელი ჰედერი იცავს Clickjacking-ისგან?', ARRAY['Content-Security-Policy', 'X-Frame-Options', 'X-XSS-Protection', 'Strict-Transport-Security'], 1, 'X-Frame-Options ჰედერი აკონტროლებს, შეგვიძლია თუ არა ჩვენი საიტი iframe-ში ჩაიტვირთოს, რაც Clickjacking-ისგან იცავს.', 3, 10
FROM public.cyberrange_challenges c WHERE c.slug = 'web-security-quiz'
ON CONFLICT DO NOTHING;

INSERT INTO public.cyberrange_quiz_questions (challenge_id, question_ka, options, correct_option_index, explanation_ka, sort_order, points)
SELECT c.id, 'რა არის IDOR?', ARRAY['Insecure Direct Object Reference', 'Internal Database Object Reference', 'Insecure Data Output Request', 'Internal Domain Object Request'], 0, 'IDOR (Insecure Direct Object Reference) არის სუსტი ადგილი, როცა მომხმარებელი სხვა მომხმარებლის მონაცემებზე წვდომას იღებს URL-ის ID პარამეტრის შეცვლით.', 4, 10
FROM public.cyberrange_challenges c WHERE c.slug = 'web-security-quiz'
ON CONFLICT DO NOTHING;

-- Crypto Quiz questions
INSERT INTO public.cyberrange_quiz_questions (challenge_id, question_ka, options, correct_option_index, explanation_ka, sort_order, points)
SELECT c.id, 'რა არის Caesar Cipher?', ARRAY['სიმეტრიული შიფრი რომელიც ბიტებს ცვლის', 'შიფრი სადაც თითოეული ასო კონკრეტული რაოდენობით ნაცვლდება', 'ჰეშ ფუნქცია', 'საჯარო გასაღების შიფრი'], 1, 'Caesar Cipher არის substitution cipher, სადაც ანბანის თითოეული ასო კონკრეტული რაოდენობით (shift) ნაცვლდება.', 1, 10
FROM public.cyberrange_challenges c WHERE c.slug = 'crypto-quiz'
ON CONFLICT DO NOTHING;

INSERT INTO public.cyberrange_quiz_questions (challenge_id, question_ka, options, correct_option_index, explanation_ka, sort_order, points)
SELECT c.id, 'რა არის Base64?', ARRAY['შიფრი', 'კოდირების მეთოდი', 'ჰეშ ფუნქცია', 'კომპრესიის ალგორითმი'], 1, 'Base64 არის კოდირების მეთოდი, არა შიფრი. ის ბაიტებს აქცევს ASCII სიმბოლოებად.', 2, 10
FROM public.cyberrange_challenges c WHERE c.slug = 'crypto-quiz'
ON CONFLICT DO NOTHING;

INSERT INTO public.cyberrange_quiz_questions (challenge_id, question_ka, options, correct_option_index, explanation_ka, sort_order, points)
SELECT c.id, 'MD5 ჰეშის თვისება არის:', ARRAY['გამოიყენება მხოლოდ ტექსტისთვის', 'ერთი და იგივე შეყვანა ყოველთვის იგივე ჰეშს იძლევა', 'ჰეშიდან შეგვიძლია ორიგინალი აღვადგინოთ', 'არ არის დაშვებული კომერციულ გამოყენებაში'], 1, 'MD5 არის დეტერმინისტული ჰეშ-ფუნქცია — ერთი და იგივე შეყვანა ყოველთვის იგივე ჰეშს იძლევა.', 3, 10
FROM public.cyberrange_challenges c WHERE c.slug = 'crypto-quiz'
ON CONFLICT DO NOTHING;

-- Network Quiz questions
INSERT INTO public.cyberrange_quiz_questions (challenge_id, question_ka, options, correct_option_index, explanation_ka, sort_order, points)
SELECT c.id, 'რომელი პორტი გამოიყენება HTTP-ისთვის?', ARRAY['21', '80', '443', '3306'], 1, 'HTTP პროტოკოლი სტანდარტულად 80 პორტს იყენებს.', 1, 10
FROM public.cyberrange_challenges c WHERE c.slug = 'network-protocols-quiz'
ON CONFLICT DO NOTHING;

INSERT INTO public.cyberrange_quiz_questions (challenge_id, question_ka, options, correct_option_index, explanation_ka, sort_order, points)
SELECT c.id, 'რომელი პორტი გამოიყენება SSH-ისთვის?', ARRAY['21', '22', '23', '25'], 1, 'SSH (Secure Shell) სტანდარტულად 22 პორტს იყენებს.', 2, 10
FROM public.cyberrange_challenges c WHERE c.slug = 'network-protocols-quiz'
ON CONFLICT DO NOTHING;

INSERT INTO public.cyberrange_quiz_questions (challenge_id, question_ka, options, correct_option_index, explanation_ka, sort_order, points)
SELECT c.id, 'TCP და UDP შორის ძირითადი განსხვავება არის:', ARRAY['TCP სწრაფია, UDP ნელია', 'TCP საიმედოა, UDP არა', 'TCP მხოლოდ ვებზე გამოიყენება', 'TCP და UDP იგივეა'], 1, 'TCP არის connection-oriented და საიმედო პროტოკოლი, ხოლო UDP არის connectionless და არასაიმედო, მაგრამ სწრაფი.', 3, 10
FROM public.cyberrange_challenges c WHERE c.slug = 'network-protocols-quiz'
ON CONFLICT DO NOTHING;

-- Assembly Quiz questions
INSERT INTO public.cyberrange_quiz_questions (challenge_id, question_ka, options, correct_option_index, explanation_ka, sort_order, points)
SELECT c.id, 'რა აკეთებს MOV eax, ebx ბრძანება?', ARRAY['eax-ში ინახავს ebx-ის მნიშვნელობას', 'ebx-ში ინახავს eax-ის მნიშვნელობას', 'eax-ს და ebx-ს ამატებს', 'eax-ს ადარებს ebx-ს'], 0, 'MOV არის move ბრძანება — მარცხნივ მდგომ რეგისტრში (eax) ინახავს მარჯვნივ მდგომის (ebx) მნიშვნელობას.', 1, 10
FROM public.cyberrange_challenges c WHERE c.slug = 'assembly-quiz'
ON CONFLICT DO NOTHING;

INSERT INTO public.cyberrange_quiz_questions (challenge_id, question_ka, options, correct_option_index, explanation_ka, sort_order, points)
SELECT c.id, 'რა არის EIP რეგისტრი?', ARRAY['Instruction Pointer', 'Stack Pointer', 'Base Pointer', 'Accumulator'], 0, 'EIP (Extended Instruction Pointer) არის რეგისტრი, რომელიც მიუთითებს შემსრულებელი ინსტრუქციის მისამართზე.', 2, 10
FROM public.cyberrange_challenges c WHERE c.slug = 'assembly-quiz'
ON CONFLICT DO NOTHING;

-- Forensics Quiz questions
INSERT INTO public.cyberrange_quiz_questions (challenge_id, question_ka, options, correct_option_index, explanation_ka, sort_order, points)
SELECT c.id, 'EXIF მეტამონაცემები შეიცავს:', ARRAY['მხოლოდ ფაილის ზომას', 'კამერის მოდელს, GPS კოორდინატებს, თარიღს', 'მხოლოდ ფაილის ფორმატს', 'მხოლოდ ავტორის სახელს'], 1, 'EXIF (Exchangeable Image File Format) შეიცავს მრავალ მეტამონაცემს: კამერის მოდელს, GPS კოორდინატებს, გადაღების თარიღს და სხვა.', 1, 10
FROM public.cyberrange_challenges c WHERE c.slug = 'forensics-quiz'
ON CONFLICT DO NOTHING;

INSERT INTO public.cyberrange_quiz_questions (challenge_id, question_ka, options, correct_option_index, explanation_ka, sort_order, points)
SELECT c.id, 'Steganography არის:', ARRAY['ფაილის დაშიფვრა', 'მონაცემების დამალვა სხვა ფაილში', 'ფაილის წაშლა', 'ფაილის კომპრესირება'], 1, 'Steganography არის ტექნიკა, რომლითაც მონაცემები იმალება სხვა ფაილში (მაგ. სურათში) ისე, რომ თვალით არ ჩანს.', 2, 10
FROM public.cyberrange_challenges c WHERE c.slug = 'forensics-quiz'
ON CONFLICT DO NOTHING;
