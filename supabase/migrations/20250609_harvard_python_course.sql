-- =============================================
-- HARVARD CS50P: Introduction to Programming with Python
-- =============================================

INSERT INTO public.video_courses (
  id, title, slug, description, short_description,
  category, difficulty, price_gel, is_active, sort_order,
  created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'Harvard CS50P: Introduction to Programming with Python',
  'harvard-cs50-python',
  'Harvard University-ის CS50P კურსი — Python-ით პროგრამირების სრულყოფილი შესავალი. მოიცავს ფუნქციებს, პირობებს, ციკლებს, გამონაკლისებს, ბიბლიოთეკებს, Unit Testing-ს, ფაილებთან მუშაობას, Regular Expressions-ს, OOP-ს და მეტს.',
  'Python-ის სრულყოფილი კურსი Harvard-იდან',
  'პროგრამირება',
  'beginner',
  0,
  true,
  1,
  now(),
  now()
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  short_description = EXCLUDED.short_description,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  price_gel = EXCLUDED.price_gel,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

DO $$
DECLARE
  v_course_id UUID;
  section_id UUID;
  lecture_id UUID;
  assignment_id UUID;
BEGIN
  SELECT id INTO v_course_id FROM public.video_courses WHERE slug = 'harvard-cs50-python';

  DELETE FROM public.video_assignments WHERE video_assignments.course_id = v_course_id;
  DELETE FROM public.video_lectures WHERE video_lectures.course_id = v_course_id;
  DELETE FROM public.video_course_sections WHERE video_course_sections.course_id = v_course_id;

  -- ============================================================
  -- WEEK 0: Functions, Variables
  -- ============================================================
  section_id := gen_random_uuid();
  INSERT INTO public.video_course_sections (id, course_id, title, sort_order, created_at)
  VALUES (section_id, v_course_id, 'კვირა 0: ფუნქციები, ცვლადები', 0, now());

  lecture_id := gen_random_uuid();
  INSERT INTO public.video_lectures (id, section_id, course_id, title, description, sort_order, created_at)
  VALUES (lecture_id, section_id, v_course_id, 'ლექცია 0: ფუნქციები და ცვლადები', 'Python-ის საფუძვლები: functions, arguments, return values, variables, str/int/float, input(), print(), f-strings.', 0, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Indoor Voice', 'input()-ს გადაიყვანე lowercase-ში. str.lower() გამოყენებით.', 0, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Playback Speed', 'YouTube Playback Speed კონვერტაცია: 1.0 → 1x, 1.25 → 1.25x. float-ის ფორმატირება.', 1, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Making Faces', 'ტექსტური ემოტიკონები :) და :( შეცვალე emoji სიმბოლოებით emoji ბიბლიოთეკის გამოყენებით.', 2, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Einstein', 'E = mc2 ფორმულით გამოთვალე ენერგია ჯოულებში. mass შეიყვანე კგ-ში.', 3, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Tip Calculator', 'მომხმარებელი შეიყვანს კვების ღირებულებას, tip პროცენტს და ადამიანთა რაოდენობას. გამოთვალე თითოეულის გასადახდი.', 4, now());

  -- ============================================================
  -- WEEK 1: Conditionals
  -- ============================================================
  section_id := gen_random_uuid();
  INSERT INTO public.video_course_sections (id, course_id, title, sort_order, created_at)
  VALUES (section_id, v_course_id, 'კვირა 1: პირობითი ოპერატორები', 1, now());

  lecture_id := gen_random_uuid();
  INSERT INTO public.video_lectures (id, section_id, course_id, title, description, sort_order, created_at)
  VALUES (lecture_id, section_id, v_course_id, 'ლექცია 1: Conditionals', 'if, elif, else, match statements, bool, operators: and, or, not, nested conditions.', 5, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Deep Thought', 'მომხმარებელი შეიყვანს რიცხვს. თუ პასუხი 42-ია — Yes, სხვა შემთხვევაში — No.', 0, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Home Federal Savings Bank', 'Hello greeting-ის ვარიაციებზე სხვადასხვა საბანკო პასუხი: hello → $0, how → $20, სხვა → $100.', 1, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'File Extensions', 'ფაილის გაფართოებაზე დაყრდნობით media type: .gif → image/gif, .mp3 → audio/mpeg, .pdf → application/pdf.', 2, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Math Interpreter', 'მარტივი გამოთვლა: X + Y, X - Y, X * Y, X / Y ფორმატის input-ის დამუშავება და შედეგის გამოტანა.', 3, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Meal Time', 'დროის მიხედვით კვების სახელი: breakfast 7:00-8:00, lunch 12:00-13:00, dinner 18:00-19:00.', 4, now());

  -- ============================================================
  -- WEEK 2: Loops
  -- ============================================================
  section_id := gen_random_uuid();
  INSERT INTO public.video_course_sections (id, course_id, title, sort_order, created_at)
  VALUES (section_id, v_course_id, 'კვირა 2: ციკლები (Loops)', 2, now());

  lecture_id := gen_random_uuid();
  INSERT INTO public.video_lectures (id, section_id, course_id, title, description, sort_order, created_at)
  VALUES (lecture_id, section_id, v_course_id, 'ლექცია 2: Loops', 'for loops, while loops, break, continue, list comprehensions, range(), len().', 10, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'camelCase', 'camelCase სტრიქონი გარდაქმენი snake_case-ად. მაგ: firstName → first_name.', 0, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Coke Machine', 'Coke Machine სიმულაცია: Cola ეღირება 50 ცენტი. მონეტები: 25, 10, 5. ნაშთი გამოთვლა.', 1, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Just setting up my twttr', 'Twitter-სტილის ტექსტი: ამოიღე ხმოვნები a, e, i, o, u სტრიქონიდან.', 2, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Vanity Plates', 'Massachusetts-ის სანომრე ნიშნის ვალიდაცია: მხოლოდ ასოები/ციფრები, 2-6 სიმბოლო, ციფრები ბოლოში.', 3, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Nutrition Facts', 'Starbucks კვების ცხრილი: საკვების სახელი → კალორიები. Dictionary + loops.', 4, now());

  -- ============================================================
  -- WEEK 3: Exceptions
  -- ============================================================
  section_id := gen_random_uuid();
  INSERT INTO public.video_course_sections (id, course_id, title, sort_order, created_at)
  VALUES (section_id, v_course_id, 'კვირა 3: გამონაკლისები (Exceptions)', 3, now());

  lecture_id := gen_random_uuid();
  INSERT INTO public.video_lectures (id, section_id, course_id, title, description, sort_order, created_at)
  VALUES (lecture_id, section_id, v_course_id, 'ლექცია 3: Exceptions', 'try/except, raise, ValueError, TypeError, KeyError, else/finally in exception handling.', 15, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Fuel Gauge', 'X/Y fraction → პროცენტი. ZeroDivisionError და ValueError-ის დამუშავება. E ≤1%, F ≥99%.', 0, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Felipe''s Taqueria', 'Taco შეკვეთა სიმულაცია. Dictionary-ის გამოყენება ფასების სავალდებულო მენიუსთვის. KeyboardInterrupt-ის დამუშავება.', 1, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Grocery List', 'სასურსათო სია: items-ის შეყვანა, UPPERCASE-ში ჩვენება, ანბანური თანმიმდევრობა, განმეორება → რაოდენობა.', 2, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Outdated', 'თარიღის ფორმატის კონვერტაცია: 9/8/1636 ან September 8, 1636 → 1636-09-08 (ISO 8601).', 3, now());

  -- ============================================================
  -- WEEK 4: Libraries
  -- ============================================================
  section_id := gen_random_uuid();
  INSERT INTO public.video_course_sections (id, course_id, title, sort_order, created_at)
  VALUES (section_id, v_course_id, 'კვირა 4: ბიბლიოთეკები (Libraries)', 4, now());

  lecture_id := gen_random_uuid();
  INSERT INTO public.video_lectures (id, section_id, course_id, title, description, sort_order, created_at)
  VALUES (lecture_id, section_id, v_course_id, 'ლექცია 4: Libraries', 'import, from, modules, packages, pip, random, statistics, sys, os, requests, emoji, pyfiglet.', 20, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Emojize', 'emoji library: emoji shortcode-ები :wave: :snake: რეალური emoji-ებად გადაიყვანე.', 0, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Frank, Ian & Glen''s Fonts', 'pyfiglet library: მომხმარებლის ტექსტი ASCII art font-ებად გამოიტანე. Random ან specified font.', 1, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Adieu, Adieu', 'სახელების სია Oxford comma-ით: Ana, Bob → Ana and Bob; Ana, Bob, Charlie → Ana, Bob, and Charlie.', 2, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Guessing Game', 'random.randint-ით 1-100 შორის რიცხვი. Too small / Too large / Just right.', 3, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Little Professor', 'მათემატიკის quiz: 10 random სიმრავლე. 3 მცდელობა, შემდეგ სწორი პასუხი. ქულების ანგარიში.', 4, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Bitcoin Price Index', 'CoinDesk API-დან Bitcoin-ის ფასი. sys.argv-ით ვალუტის კოდი. requests library.', 5, now());

  -- ============================================================
  -- WEEK 5: Unit Tests
  -- ============================================================
  section_id := gen_random_uuid();
  INSERT INTO public.video_course_sections (id, course_id, title, sort_order, created_at)
  VALUES (section_id, v_course_id, 'კვირა 5: Unit Tests', 5, now());

  lecture_id := gen_random_uuid();
  INSERT INTO public.video_lectures (id, section_id, course_id, title, description, sort_order, created_at)
  VALUES (lecture_id, section_id, v_course_id, 'ლექცია 5: Unit Tests', 'pytest, assert, test functions, test files, edge cases, code coverage, TDD პრინციპები.', 26, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Testing my twttr', 'Week 2-ის twttr.py-სთვის test_twttr.py-ის დაწერა. pytest-ით ხმოვნების ამოღების ლოგიკის ტესტი.', 0, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Back to the Bank', 'Week 1-ის Home Federal Savings Bank-სთვის test_bank.py. Hello-ს სხვადასხვა ვარიაციის ტესტირება.', 1, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Re-requesting a Vanity Plate', 'Week 2-ის Vanity Plates-სთვის test_plates.py. ვალიდი/ინვალიდი plate-ების სრული ტესტი.', 2, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Refueling', 'Week 3-ის Fuel Gauge-სთვის test_fuel.py. convert() და gauge() ფუნქციების სრული ტესტი.', 3, now());

  -- ============================================================
  -- WEEK 6: File I/O
  -- ============================================================
  section_id := gen_random_uuid();
  INSERT INTO public.video_course_sections (id, course_id, title, sort_order, created_at)
  VALUES (section_id, v_course_id, 'კვირა 6: ფაილებთან მუშაობა (File I/O)', 6, now());

  lecture_id := gen_random_uuid();
  INSERT INTO public.video_lectures (id, section_id, course_id, title, description, sort_order, created_at)
  VALUES (lecture_id, section_id, v_course_id, 'ლექცია 6: File I/O', 'open(), read/write/append, with statement, csv module, csv.reader, csv.DictReader, csv.writer, PIL/Pillow.', 30, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Lines of Code', 'Python ფაილის კოდის სტრიქონების დათვლა — კომენტარები და ცარიელი სტრიქონები გამოირიცხება.', 0, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Pizza Py', 'Pinocchio''s Pizza CSV მენიუ → tabulate library-ით ASCII ცხრილი.', 1, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Scourgify', 'CSV-ის გასუფთავება: Potter, Harry → first, last ველებად გაყოფა. csv.DictReader + csv.writer.', 2, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'CS50 P-Shirt', 'Pillow library: ადამიანის ფოტოზე CS50P მაისური გადააფარე. Image.open(), paste(), composite().', 3, now());

  -- ============================================================
  -- WEEK 7: Regular Expressions
  -- ============================================================
  section_id := gen_random_uuid();
  INSERT INTO public.video_course_sections (id, course_id, title, sort_order, created_at)
  VALUES (section_id, v_course_id, 'კვირა 7: Regular Expressions', 7, now());

  lecture_id := gen_random_uuid();
  INSERT INTO public.video_lectures (id, section_id, course_id, title, description, sort_order, created_at)
  VALUES (lecture_id, section_id, v_course_id, 'ლექცია 7: Regular Expressions', 're module, re.search(), re.match(), re.sub(), re.fullmatch(), groups, character classes, quantifiers.', 34, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'NUMB3RS', 'IPv4 მისამართის ვალიდაცია regex-ით: თითოეული octet 0-255. re.fullmatch() გამოყენება.', 0, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Watch on YouTube', 'HTML/URL-დან YouTube video ID-ის ამოღება regex-ით. youtu.be ან youtube.com/watch?v= ფორმატები.', 1, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Working 9 to 5', 'სამუშაო საათების კონვერტაცია: 9 AM to 5 PM → 09:00 to 17:00. AM/PM → 24-სთიანი ფორმატი.', 2, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Regular, um', 'მეტყველებაში um სიტყვის რაოდენობის დათვლა. Regex case-insensitive matching.', 3, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Response Validation', 'Yes/No/Y/N (case-insensitive) პასუხის ვალიდაცია regex-ით. InvalidResponse exception-ის გენერაცია.', 4, now());

  -- ============================================================
  -- WEEK 8: Object-Oriented Programming
  -- ============================================================
  section_id := gen_random_uuid();
  INSERT INTO public.video_course_sections (id, course_id, title, sort_order, created_at)
  VALUES (section_id, v_course_id, 'კვირა 8: ობიექტ-ორიენტირებული პროგრამირება (OOP)', 8, now());

  lecture_id := gen_random_uuid();
  INSERT INTO public.video_lectures (id, section_id, course_id, title, description, sort_order, created_at)
  VALUES (lecture_id, section_id, v_course_id, 'ლექცია 8: Object-Oriented Programming', 'class, __init__, methods, @property, @classmethod, @staticmethod, inheritance, operator overloading.', 39, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Seasons of Love', 'დაბადების თარიღიდან გამოთვალე ასაკი წუთებში. datetime + relativedelta. Invalid date-ის დამუშავება.', 0, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'Cookie Jar', 'Cookie Jar კლასი: deposit() და withdraw() მეთოდები. capacity შეზღუდვა. ValueError overflow/underflow.', 1, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'CS50 Shirtificate', 'fpdf2 library: PDF გენერაცია. CS50P მაისურის გამოსახულება + სახელი. FPDF კლასის inheritance.', 2, now());

  -- ============================================================
  -- WEEK 9: Et Cetera + Final Project
  -- ============================================================
  section_id := gen_random_uuid();
  INSERT INTO public.video_course_sections (id, course_id, title, sort_order, created_at)
  VALUES (section_id, v_course_id, 'კვირა 9: Et Cetera + ფინალური პროექტი', 9, now());

  lecture_id := gen_random_uuid();
  INSERT INTO public.video_lectures (id, section_id, course_id, title, description, sort_order, created_at)
  VALUES (lecture_id, section_id, v_course_id, 'ლექცია 9: Et Cetera', 'type hints, mypy, docstrings, argparse, unpacking, *args, **kwargs, map, filter, list/dict comprehensions, enumerate, generators, iterators.', 43, now());

  assignment_id := gen_random_uuid();
  INSERT INTO public.video_assignments (id, lecture_id, course_id, title, description, sort_order, created_at)
  VALUES (assignment_id, lecture_id, v_course_id, 'ფინალური პროექტი', 'თავისუფლად შექმენი Python პროგრამა. Requirements: main() ფუნქცია, 3+ custom ფუნქცია, test_project.py pytest ტესტებით, README.md, requirements.txt.', 0, now());

  RAISE NOTICE 'Harvard CS50P course inserted successfully';
END $$;
