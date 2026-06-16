export type LessonType = 'puzzle' | 'editor' | 'challenge' | 'quiz' | 'fillblanks' | 'memory';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface PuzzlePiece {
  id: string;
  content: string;
  order: number;
}

export interface EditorStep {
  instruction: string;
  expectedCode: string;
  hint: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface FillBlank {
  instruction: string;
  template: string;  // e.g. "<__1__>Hello</__1__>"
  blanks: { id: string; answer: string; hints: string[] }[];
  xpReward: number;
}

export interface KidsLesson {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  difficulty: DifficultyLevel;
  emoji: string;
  color: string;
  xpReward: number;
  module: string;
  moduleNumber: number;
  theory: string;
  puzzlePieces?: PuzzlePiece[];
  correctOrder?: string[];
  resultHtml?: string;
  steps?: EditorStep[];
  starterCode?: string;
  targetHtml?: string;
  targetCss?: string;
  starterCss?: string;
  challengeHtml?: string;
  hints?: string[];
  quizQuestions?: QuizQuestion[];
  fillBlanks?: FillBlank[];
}

export const kidsLessons: KidsLesson[] = [
  {
    "id": "puzzle-1",
    "title": "ვებ-გვერდის სტრუქტურა 뼈",
    "description": "ისწავლე HTML დოკუმენტის ძირითადი სტრუქტურა კოდის ნაწილების სწორად დალაგებით.",
    "type": "puzzle",
    "difficulty": "easy",
    "emoji": "🏗️",
    "color": "from-sky-400 to-cyan-400",
    "xpReward": 10,
    "module": "რა არის ვებ-გვერდი?",
    "moduleNumber": 1,
    "theory": "🌐 რა არის ვებ-გვერდი?\n\nვებ-გვერდი არის ფაილი, რომელსაც ბრაუზერი (Chrome, Firefox) კითხულობს და ეკრანზე აჩვენებს.\n\n📦 ყველა ვებ-გვერდი შედგება 3 ძირითადი ნაწილისგან:\n\n1️⃣ <html> — მთელი გვერდის კონტეინერი, ყველაფერი მის შიგნით არის\n2️⃣ <head> — გვერდის 'ტვინი', აქ ინფორმაცია ინახება (სათაური, სტილები)\n3️⃣ <body> — გვერდის 'სხეული', აქ ჩანს ყველაფერი რასაც ხედავ\n\n💡 ამ პაზლში შენ უნდა ააწყო ეს სტრუქტურა სწორი თანმიმდევრობით!",
    "puzzlePieces": [
      {
        "id": "p1",
        "content": "<html>",
        "order": 1
      },
      {
        "id": "p2",
        "content": "  <head>\n  </head>",
        "order": 2
      },
      {
        "id": "p3",
        "content": "  <body>\n  </body>",
        "order": 3
      },
      {
        "id": "p4",
        "content": "</html>",
        "order": 4
      }
    ],
    "correctOrder": [
      "p1",
      "p2",
      "p3",
      "p4"
    ],
    "resultHtml": "<div style='font-family: sans-serif; padding: 20px; background: #e0f7fa; border-radius: 8px; text-align: center;'><h3 style='color: #00796b;'>ყოჩაღ!</h3><p style='color: #004d40;'>შენ სწორად ააწყვე ვებ-გვერდის ძირითადი სტრუქტურა.</p></div>"
  },
  {
    "id": "editor-1",
    "title": "შენი პირველი კოდი ✍️",
    "description": "დაწერე შენი პირველი HTML კოდი, რომელიც ქმნის ცარიელ ვებ-გვერდს.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "✍️",
    "color": "from-sky-500 to-indigo-500",
    "xpReward": 10,
    "module": "რა არის ვებ-გვერდი?",
    "moduleNumber": 1,
    "theory": "✍️ კოდის წერის პირველი ნაბიჯები\n\nკოდის წერა ნიშნავს კომპიუტერისთვის ინსტრუქციების მიცემას. HTML-ში ჩვენ ვიყენებთ 'თეგებს' (tags).\n\n📌 თეგი ასე გამოიყურება: <სახელი>\n\n🔑 მნიშვნელოვანი წესები:\n• ყველა თეგი იწყება < ნიშნით და მთავრდება > ნიშნით\n• თითქმის ყველა თეგს აქვს 'გამხსნელი' და 'დამხურავი' ვერსია\n• დამხურავ თეგს / ნიშანი აქვს დამატებული: </სახელი>\n\n📝 მაგალითი:\n<html> ← ეს ხსნის\n</html> ← ეს ხურავს\n\nმოდი, დავწეროთ შენი პირველი თეგი!",
    "starterCode": "",
    "steps": [
      {
        "instruction": "ყველა HTML დოკუმენტი იწყება `<html>`-ით. დაწერე საწყისი თეგი.",
        "expectedCode": "<html>",
        "hint": "უბრალოდ აკრიფე `<html>`."
      },
      {
        "instruction": "თითქმის ყველა თეგს სჭირდება დახურვა. დახურე `<html>` თეგი `</html>`-ის დაწერით.",
        "expectedCode": "<html>\n</html>",
        "hint": "დამხურავი თეგი იგივეა, რაც საწყისი, მაგრამ დამატებული აქვს `/` ნიშანი."
      }
    ]
  },
  {
    "id": "editor-2",
    "title": "თავი და ტანი: Head & Body",
    "description": "ისწავლე `<head>` და `<body>` თეგების გამოყენება და მათი როლი ვებ-გვერდში.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "🧠💪",
    "color": "from-teal-400 to-yellow-400",
    "xpReward": 10,
    "module": "რა არის ვებ-გვერდი?",
    "moduleNumber": 1,
    "theory": "🧠 Head და Body — ვებ-გვერდის ორი მთავარი ნაწილი\n\n<html> თეგის შიგნით ორი მნიშვნელოვანი სექცია არის:\n\n🧠 <head> — 'ტვინი':\n• აქ ინახება ინფორმაცია გვერდის შესახებ\n• ბრაუზერი კითხულობს, მაგრამ მომხმარებელი ვერ ხედავს\n• მაგ: გვერდის სათაური, სტილები\n\n💪 <body> — 'სხეული':\n• აქ თავსდება ყველაფერი, რასაც მომხმარებელი ხედავს\n• ტექსტი, სურათები, ღილაკები, ვიდეოები...\n\n📐 სტრუქტურა:\n<html>\n  <head>...</head>\n  <body>...</body>\n</html>\n\nყოველთვის ჯერ <head>, შემდეგ <body>!",
    "starterCode": "<html>\n</html>",
    "steps": [
      {
        "instruction": "`<html>` თეგებს შორის, დაამატე `<head>` თეგი და მაშინვე დახურე.",
        "expectedCode": "<html>\n  <head>\n  </head>\n</html>",
        "hint": "დაწერე `<head>` და მის ქვემოთ `</head>`."
      },
      {
        "instruction": "`<head>`-ის დახურვის შემდეგ, დაამატე `<body>` თეგი და დახურე ისიც.",
        "expectedCode": "<html>\n  <head>\n  </head>\n  <body>\n  </body>\n</html>",
        "hint": "დაწერე `<body>` და მის ქვემოთ `</body>`."
      }
    ]
  },
  {
    "id": "editor-3",
    "title": "გვერდის სათაური: Title 🏷️",
    "description": "დაამატე სათაური შენს ვებ-გვერდს, რომელიც ბრაუზერის ჩანართში (tab) გამოჩნდება.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "🏷️",
    "color": "from-purple-400 to-pink-400",
    "xpReward": 10,
    "module": "რა არის ვებ-გვერდი?",
    "moduleNumber": 1,
    "theory": "🏷️ Title — გვერდის სათაური\n\n<title> თეგი განსაზღვრავს ტექსტს, რომელიც ბრაუზერის ჩანართზე (tab) ჩანს.\n\n📍 სად თავსდება?\n• <title> ყოველთვის <head> სექციაში უნდა იყოს\n• ის არ ჩანს თავად გვერდზე, მხოლოდ ჩანართზე!\n\n🎯 რისთვის არის საჭირო?\n• მომხმარებელს ეხმარება გვერდის პოვნაში\n• Google-ც ამ სათაურს აჩვენებს ძიების შედეგებში\n\n📝 მაგალითი:\n<head>\n  <title>ჩემი გვერდი</title>\n</head>\n\nსცადე შენც!",
    "starterCode": "<html>\n  <head>\n  </head>\n  <body>\n  </body>\n</html>",
    "steps": [
      {
        "instruction": "`<head>` თეგებს შორის, დაამატე `<title>` თეგი.",
        "expectedCode": "<html>\n  <head>\n    <title></title>\n  </head>\n  <body>\n  </body>\n</html>",
        "hint": "დაწერე `<title>` და `</title>` ერთმანეთის გვერდით."
      },
      {
        "instruction": "ახლა, `<title>` თეგებს შორის ჩაწერე 'ჩემი პირველი გვერდი'.",
        "expectedCode": "<html>\n  <head>\n    <title>ჩემი პირველი გვერდი</title>\n  </head>\n  <body>\n  </body>\n</html>",
        "hint": "ტექსტი უნდა იყოს `<title>`-სა და `</title>`-ს შორის."
      }
    ]
  },
  {
    "id": "puzzle-2",
    "title": "სრული სტრუქტურის აწყობა",
    "description": "დაალაგე კოდის ნაწილები, რომ შექმნა სრული HTML დოკუმენტი სათაურით.",
    "type": "puzzle",
    "difficulty": "easy",
    "emoji": "🧩",
    "color": "from-green-400 to-blue-500",
    "xpReward": 10,
    "module": "რა არის ვებ-გვერდი?",
    "moduleNumber": 1,
    "theory": "🧩 გავიმეოროთ სტრუქტურა!\n\nუკვე ისწავლე 3 მთავარი ნაწილი:\n\n1️⃣ <html> — ყველაფრის კონტეინერი\n2️⃣ <head> + <title> — 'ტვინი' და სათაური\n3️⃣ <body> — ყველაფერი რაც ჩანს\n\n📐 სწორი სტრუქტურა ასე გამოიყურება:\n<html>\n  <head>\n    <title>სათაური</title>\n  </head>\n  <body>\n    შიგთავსი\n  </body>\n</html>\n\n⚡ ახლა შენ ეს ნაწილები პაზლივით უნდა ააწყო!",
    "puzzlePieces": [
      {
        "id": "p1",
        "content": "<html>",
        "order": 1
      },
      {
        "id": "p2",
        "content": "  <head>\n    <title>ჩემი გვერდი</title>\n  </head>",
        "order": 2
      },
      {
        "id": "p3",
        "content": "  <body>\n    <!-- აქ იქნება შიგთავსი -->\n  </body>",
        "order": 3
      },
      {
        "id": "p4",
        "content": "</html>",
        "order": 4
      }
    ],
    "correctOrder": [
      "p1",
      "p2",
      "p3",
      "p4"
    ],
    "resultHtml": "<div style='font-family: sans-serif; padding: 20px; background: #e8f5e9; border-radius: 8px; text-align: center;'><h3 style='color: #2e7d32;'>შესანიშნავია!</h3><p style='color: #1b5e20;'>შენ კარგად გაიგე HTML-ის სტრუქტურა.</p></div>"
  },
  {
    "id": "editor-4",
    "title": "პირველი სათაური: H1 📣",
    "description": "ისწავლე როგორ დაამატო ყველაზე დიდი სათაური შენს ვებ-გვერდზე h1 თეგის გამოყენებით.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "📣",
    "color": "from-red-500 to-orange-500",
    "xpReward": 10,
    "module": "პირველი HTML თეგები",
    "moduleNumber": 2,
    "theory": "📣 H1 — ყველაზე მთავარი სათაური\n\nHTML-ს აქვს სპეციალური თეგი მთავარი სათაურისთვის: <h1>\n\n📌 რა უნდა იცოდე:\n• 'h' მოდის სიტყვიდან 'heading' (სათაური)\n• '1' ნიშნავს ყველაზე მაღალ, ყველაზე მნიშვნელოვან დონეს\n• <h1> ტექსტი ყველაზე დიდი და მუქი გამოჩნდება\n\n🎯 სად გამოიყენება?\n• სტატიის სათაური\n• გვერდის მთავარი სათაური\n• Google ამ სათაურს განსაკუთრებით აფასებს!\n\n📝 მაგალითი:\n<body>\n  <h1>გამარჯობა!</h1>\n</body>\n\n⚠️ ერთ გვერდზე მხოლოდ ერთი <h1> სასურველია!",
    "starterCode": "<body>\n</body>",
    "steps": [
      {
        "instruction": "`<body>` თეგებს შორის, დაამატე `<h1>` თეგი და მაშინვე დახურე.",
        "expectedCode": "<body>\n  <h1></h1>\n</body>",
        "hint": "დაწერე `<h1>` და შემდეგ `</h1>`."
      },
      {
        "instruction": "ახლა, `<h1>` თეგებს შორის ჩაწერე ტექსტი: 'გამარჯობა, ვებ-გვერდო!'",
        "expectedCode": "<body>\n  <h1>გამარჯობა, ვებ-გვერდო!</h1>\n</body>",
        "hint": "ტექსტი უნდა იყოს `<h1>`-სა და `</h1>`-ს შორის."
      }
    ]
  },
  {
    "id": "editor-5",
    "title": "პარაგრაფი: P 📖",
    "description": "ისწავლე როგორ დაამატო ტექსტის აბზაცი, ანუ პარაგრაფი, `<p>` თეგის გამოყენებით.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "📖",
    "color": "from-yellow-400 to-amber-500",
    "xpReward": 10,
    "module": "პირველი HTML თეგები",
    "moduleNumber": 2,
    "theory": "📖 P — პარაგრაფი (ტექსტის ბლოკი)\n\n<p> თეგი გამოიყენება ტექსტის აბზაცების შესაქმნელად.\n\n📌 რა უნდა იცოდე:\n• 'p' მოდის სიტყვიდან 'paragraph' (პარაგრაფი)\n• ბრაუზერი ავტომატურად ამატებს ცარიელ ადგილს პარაგრაფებს შორის\n• ერთ <p> თეგში ერთი აზრი ან აბზაცი იწერება\n\n📝 მაგალითი:\n<p>ეს არის პირველი აბზაცი.</p>\n<p>ეს არის მეორე აბზაცი.</p>\n\n💡 რჩევა: ყოველი ახალი აზრისთვის ახალი <p> გამოიყენე!",
    "starterCode": "<body>\n  <h1>ჩემი ბლოგი</h1>\n</body>",
    "steps": [
      {
        "instruction": "სათაურის (`<h1>`) შემდეგ, დაამატე `<p>` თეგი და მაშინვე დახურე.",
        "expectedCode": "<body>\n  <h1>ჩემი ბლოგი</h1>\n  <p></p>\n</body>",
        "hint": "დაწერე `<p>` და შემდეგ `</p>`."
      },
      {
        "instruction": "`<p>` თეგებს შორის ჩაწერე: 'ეს ჩემი პირველი პოსტია. მე ვსწავლობ HTML-ს!'",
        "expectedCode": "<body>\n  <h1>ჩემი ბლოგი</h1>\n  <p>ეს ჩემი პირველი პოსტია. მე ვსწავლობ HTML-ს!</p>\n</body>",
        "hint": "ტექსტი უნდა იყოს `<p>`-სა და `</p>`-ს შორის."
      }
    ]
  },
  {
    "id": "puzzle-3",
    "title": "სათაური და პარაგრაფი",
    "description": "ააწყე გვერდი, რომელსაც აქვს სათაური და მის ქვეშ პარაგრაფი.",
    "type": "puzzle",
    "difficulty": "easy",
    "emoji": "📰",
    "color": "from-lime-400 to-green-500",
    "xpReward": 10,
    "module": "პირველი HTML თეგები",
    "moduleNumber": 2,
    "theory": "📰 სათაური + პარაგრაფი = სტატია!\n\nყველა სტატია, ბლოგპოსტი ან ახალი ამბავი ასე იწყება:\n\n1️⃣ სათაური (<h1>) — გვეუბნება რაზეა ტექსტი\n2️⃣ პარაგრაფი (<p>) — თავად ტექსტი\n\n📐 სწორი სტრუქტურა:\n<h1>ცხოველები</h1>\n<p>პირველი აბზაცი...</p>\n<p>მეორე აბზაცი...</p>\n\n⚡ ყოველთვის ჯერ სათაური, შემდეგ ტექსტი!\nდაალაგე ნაწილები სწორად!",
    "puzzlePieces": [
      {
        "id": "p1",
        "content": "<h1>ცხოველების შესახებ</h1>",
        "order": 1
      },
      {
        "id": "p2",
        "content": "<p>ცხოველები ჩვენი პლანეტის მნიშვნელოვანი ნაწილია.</p>",
        "order": 2
      },
      {
        "id": "p3",
        "content": "<p>ზოგი დაფრინავს, ზოგი დაცურავს და ზოგიც დარბის.</p>",
        "order": 3
      }
    ],
    "correctOrder": [
      "p1",
      "p2",
      "p3"
    ],
    "resultHtml": "<div style='font-family: sans-serif; padding: 20px;'><h1>ცხოველების შესახებ</h1><p>ცხოველები ჩვენი პლანეტის მნიშვნელოვანი ნაწილია.</p><p>ზოგი დაფრინავს, ზოგი დაცურავს და ზოგიც დარბის.</p></div>"
  },
  {
    "id": "editor-6",
    "title": "სხვა სათაურები: h2-h6",
    "description": "გამოიკვლიე სხვადასხვა ზომის სათაურები `<h2>`-დან `<h6>`-მდე.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "📊",
    "color": "from-cyan-400 to-light-blue-500",
    "xpReward": 10,
    "module": "პირველი HTML თეგები",
    "moduleNumber": 2,
    "theory": "📊 სათაურების იერარქია: H1-დან H6-მდე\n\nHTML-ს აქვს 6 დონის სათაური:\n\n📏 ზომის მიხედვით:\n• <h1> — ყველაზე დიდი (მთავარი სათაური)\n• <h2> — მეორე დონის (ქვესათაური)\n• <h3> — მესამე დონის\n• <h4>, <h5>, <h6> — სულ პატარა\n\n🏗️ როგორ გამოვიყენოთ:\n<h1>წიგნის სათაური</h1>\n  <h2>თავი 1</h2>\n    <h3>თემა 1.1</h3>\n  <h2>თავი 2</h2>\n\n⚠️ წესი: ნუ გამოტოვებ დონეებს! h1-ის შემდეგ h2 მოდის, არა h4!",
    "starterCode": "<body>\n  <h1>მთავარი სათაური (h1)</h1>\n</body>",
    "steps": [
      {
        "instruction": "`<h1>`-ის შემდეგ, დაამატე `<h2>` სათაური ტექსტით 'ქვესათაური (h2)'.",
        "expectedCode": "<body>\n  <h1>მთავარი სათაური (h1)</h1>\n  <h2>ქვესათაური (h2)</h2>\n</body>",
        "hint": "გამოიყენე `<h2>` და `</h2>` თეგები."
      },
      {
        "instruction": "ახლა, დაამატე `<h3>` სათაური ტექსტით 'უფრო პატარა (h3)'.",
        "expectedCode": "<body>\n  <h1>მთავარი სათაური (h1)</h1>\n  <h2>ქვესათაური (h2)</h2>\n  <h3>უფრო პატარა (h3)</h3>\n</body>",
        "hint": "სტრუქტურა იგივეა, იცვლება მხოლოდ ციფრი."
      },
      {
        "instruction": "და ბოლოს, დაამატე ყველაზე პატარა `<h6>` სათაური ტექსტით 'ძალიან პატარა (h6)'.",
        "expectedCode": "<body>\n  <h1>მთავარი სათაური (h1)</h1>\n  <h2>ქვესათაური (h2)</h2>\n  <h3>უფრო პატარა (h3)</h3>\n  <h6>ძალიან პატარა (h6)</h6>\n</body>",
        "hint": "გამოიყენე `<h6>` და `</h6>` თეგები."
      }
    ]
  },
  {
    "id": "editor-7",
    "title": "გამუქება და დახრა 💪",
    "description": "ისწავლე ტექსტის ნაწილის გამუქება `<strong>`-ით და დახრა `<em>`-ით.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "✍️",
    "color": "from-indigo-300 to-purple-400",
    "xpReward": 10,
    "module": "პირველი HTML თეგები",
    "moduleNumber": 2,
    "theory": "✍️ ტექსტის ფორმატირება: გამუქება და დახრა\n\nHTML-ს აქვს თეგები ტექსტის გამოსარჩევად:\n\n💪 <strong> — ტექსტის გამუქება:\n• მნიშვნელოვანი სიტყვები მუქად გამოჩნდება\n• Google-ც აფასებს strong ტექსტს\n• მაგ: <strong>ყურადღება!</strong>\n\n✨ <em> — ტექსტის დახრა (კურსივი):\n• ხაზს უსვამს სიტყვას ან ფრაზას\n• 'em' = 'emphasis' (ხაზგასმა)\n• მაგ: <em>ძალიან</em> კარგია\n\n💡 შეგიძლია ორივე ერთად:\n<strong><em>ძალიან მნიშვნელოვანი</em></strong>",
    "starterCode": "<body>\n  <p>ეს არის ჩვეულებრივი ტექსტი.</p>\n</body>",
    "steps": [
      {
        "instruction": "შექმენი ახალი პარაგრაფი, რომელშიც სიტყვა 'მნიშვნელოვანი' იქნება `<strong>` თეგებში.",
        "expectedCode": "<body>\n  <p>ეს არის ჩვეულებრივი ტექსტი.</p>\n  <p>ეს არის <strong>მნიშვნელოვანი</strong> ტექსტი.</p>\n</body>",
        "hint": "<p>... <strong>სიტყვა</strong> ...</p>"
      },
      {
        "instruction": "შექმენი კიდევ ერთი პარაგრაფი, რომელშიც სიტყვა 'დახრილი' იქნება `<em>` თეგებში.",
        "expectedCode": "<body>\n  <p>ეს არის ჩვეულებრივი ტექსტი.</p>\n  <p>ეს არის <strong>მნიშვნელოვანი</strong> ტექსტი.</p>\n  <p>ეს არის <em>დახრილი</em> ტექსტი.</p>\n</body>",
        "hint": "<p>... <em>სიტყვა</em> ...</p>"
      }
    ]
  },
  {
    "id": "editor-8",
    "title": "ხაზის გავლება და ახალზე გადასვლა",
    "description": "ისწავლე როგორ გაავლო ჰორიზონტალური ხაზი `<hr>`-ით და როგორ გადახვიდე ახალ ხაზზე `<br>`-ით.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "↔️",
    "color": "from-blue-gray-400 to-cool-gray-500",
    "xpReward": 10,
    "module": "პირველი HTML თეგები",
    "moduleNumber": 2,
    "theory": "↩️ ხაზის გაწყვეტა და ჰორიზონტალური ხაზი\n\nHTML-ში ახალ ხაზზე გადასასვლელად 2 სპეციალური თეგი გვაქვს:\n\n🔹 <br> — ხაზის გაწყვეტა (line break):\n• ტექსტს ახალ ხაზზე გადაიტანს\n• არ სჭირდება დამხურავი თეგი!\n• მაგ: ხაზი 1<br>ხაზი 2\n\n🔹 <hr> — ჰორიზონტალური ხაზი:\n• გვერდზე გამყოფ ხაზს დახაზავს\n• ამ თეგსაც არ სჭირდება დახურვა\n• გამოიყენება სექციების გამოსაყოფად\n\n⚠️ <br> და <hr> არის 'ცარიელი' თეგები — მათ არ აქვთ დამხურავი !</>",
    "starterCode": "<body>\n  <p>პირველი ნაწილი.</p>\n  <p>მეორე ნაწილი.</p>\n</body>",
    "steps": [
      {
        "instruction": "ორ პარაგრაფს შორის, დაამატე ჰორიზონტალური ხაზი. გამოიყენე `<hr>` თეგი.",
        "expectedCode": "<body>\n  <p>პირველი ნაწილი.</p>\n  <hr>\n  <p>მეორე ნაწილი.</p>\n</body>",
        "hint": "`<hr>` თეგს არ სჭირდება დამხურავი თეგი."
      },
      {
        "instruction": "ახლა, მეორე პარაგრაფში, სიტყვა 'მეორე'-ს შემდეგ დაამატე `<br>` თეგი, რომ ტექსტი ახალ ხაზზე გადავიდეს.",
        "expectedCode": "<body>\n  <p>პირველი ნაწილი.</p>\n  <hr>\n  <p>მეორე <br> ნაწილი.</p>\n</body>",
        "hint": "უბრალოდ ჩასვი `<br>` იქ, სადაც ხაზის გაწყვეტა გინდა."
      }
    ]
  },
  {
    "id": "editor-9",
    "title": "დაულაგებელი სია 📋",
    "description": "შექმენი პუნქტებიანი სია `<ul>` და `<li>` თეგების გამოყენებით.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "📋",
    "color": "from-rose-400 to-pink-500",
    "xpReward": 10,
    "module": "სიები და ბმულები",
    "moduleNumber": 3,
    "theory": "📋 დაულაგებელი სია (Unordered List)\n\nსიები გამოიყენება ელემენტების ჩამოსათვლელად.\n\n📌 ორი თეგი გვჭირდება:\n• <ul> — სიის კონტეინერი (unordered list)\n• <li> — თითოეული ელემენტი (list item)\n\n📐 სტრუქტურა:\n<ul>\n  <li>ვაშლი</li>\n  <li>ბანანი</li>\n  <li>მსხალი</li>\n</ul>\n\n🔵 შედეგი:\n• ვაშლი\n• ბანანი\n• მსხალი\n\n💡 ყველა <li> უნდა იყოს <ul>-ის შიგნით!",
    "starterCode": "<body>\n  <h2>საყიდლების სია</h2>\n</body>",
    "steps": [
      {
        "instruction": "სათაურის შემდეგ, შექმენი სიის კონტეინერი `<ul>` თეგის დამატებით და დახურვით.",
        "expectedCode": "<body>\n  <h2>საყიდლების სია</h2>\n  <ul>\n  </ul>\n</body>",
        "hint": "ყველა `<li>` ელემენტი ამ თეგებს შორის მოთავსდება."
      },
      {
        "instruction": "`<ul>`-ს შიგნით დაამატე პირველი ელემენტი: `<li>პური</li>`.",
        "expectedCode": "<body>\n  <h2>საყიდლების სია</h2>\n  <ul>\n    <li>პური</li>\n  </ul>\n</body>",
        "hint": "თითოეული პროდუქტი ცალკე `<li>` თეგში უნდა იყოს."
      },
      {
        "instruction": "დაამატე კიდევ ორი ელემენტი: 'ყველი' და 'რძე'.",
        "expectedCode": "<body>\n  <h2>საყიდლების სია</h2>\n  <ul>\n    <li>პური</li>\n    <li>ყველი</li>\n    <li>რძე</li>\n  </ul>\n</body>",
        "hint": "დაამატე ორი ახალი `<li>` ელემენტი წინას ქვემოთ."
      }
    ]
  },
  {
    "id": "puzzle-4",
    "title": "ააწყვე სია",
    "description": "დაალაგე კოდის ნაწილები, რომ შექმნა ხილის დაულაგებელი სია.",
    "type": "puzzle",
    "difficulty": "easy",
    "emoji": "🍓",
    "color": "from-red-400 to-rose-400",
    "xpReward": 10,
    "module": "სიები და ბმულები",
    "moduleNumber": 3,
    "theory": "🧩 სიის აწყობა\n\nუკვე ისწავლე სიების სტრუქტურა:\n\n📐 სწორი თანმიმდევრობა:\n1. ჯერ იხსნება <ul> (სიის დასაწყისი)\n2. შემდეგ <li> ელემენტები (სიის წევრები)\n3. ბოლოს იხურება </ul>\n\n⚠️ გახსოვდეს:\n• <li> ყოველთვის <ul>-ის შიგნით!\n• ყველა <li>-ს ჰქონდეს </li> დახურვა\n• <ul>-ს ჰქონდეს </ul> დახურვა\n\nააწყვე ეს პაზლი სწორად! 🎯",
    "puzzlePieces": [
      {
        "id": "p1",
        "content": "<ul>",
        "order": 1
      },
      {
        "id": "p2",
        "content": "  <li>ვაშლი</li>",
        "order": 2
      },
      {
        "id": "p3",
        "content": "  <li>ბანანი</li>",
        "order": 3
      },
      {
        "id": "p4",
        "content": "  <li>ფორთოხალი</li>",
        "order": 4
      },
      {
        "id": "p5",
        "content": "</ul>",
        "order": 5
      }
    ],
    "correctOrder": [
      "p1",
      "p2",
      "p3",
      "p4",
      "p5"
    ],
    "resultHtml": "<div style='font-family: sans-serif; padding: 20px;'><h3>ჩემი საყვარელი ხილი:</h3><ul><li>ვაშლი</li><li>ბანანი</li><li>ფორთოხალი</li></ul></div>"
  },
  {
    "id": "editor-10",
    "title": "დალაგებული სია 🔢",
    "description": "შექმენი დანომრილი სია `<ol>` და `<li>` თეგების გამოყენებით.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "🔢",
    "color": "from-emerald-400 to-teal-500",
    "xpReward": 10,
    "module": "სიები და ბმულები",
    "moduleNumber": 3,
    "theory": "🔢 დალაგებული სია (Ordered List)\n\nდალაგებული სია ავტომატურად ანომრებს ელემენტებს!\n\n📌 განსხვავება <ul>-ისგან:\n• <ul> → • წერტილები (bullet points)\n• <ol> → 1. 2. 3. ნომრები\n\n📐 სტრუქტურა:\n<ol>\n  <li>პირველი</li>\n  <li>მეორე</li>\n  <li>მესამე</li>\n</ol>\n\n🔢 შედეგი:\n1. პირველი\n2. მეორე\n3. მესამე\n\n🎯 გამოიყენება: ნაბიჯები, რეცეპტები, რეიტინგები",
    "starterCode": "<body>\n  <h2>გასაკეთებელი საქმეები</h2>\n</body>",
    "steps": [
      {
        "instruction": "სათაურის შემდეგ, შექმენი დანომრილი სიის კონტეინერი `<ol>` თეგის დამატებით.",
        "expectedCode": "<body>\n  <h2>გასაკეთებელი საქმეები</h2>\n  <ol>\n  </ol>\n</body>",
        "hint": "არ დაგავიწყდეს `</ol>` დამხურავი თეგი."
      },
      {
        "instruction": "`<ol>`-ს შიგნით დაამატე პირველი პუნქტი: `<li>HTML-ის სწავლა</li>`",
        "expectedCode": "<body>\n  <h2>გასაკეთებელი საქმეები</h2>\n  <ol>\n    <li>HTML-ის სწავლა</li>\n  </ol>\n</body>",
        "hint": "ბრაუზერი ავტომატურად დაუწერს ამ პუნქტს ნომერ '1'-ს."
      },
      {
        "instruction": "დაამატე მეორე პუნქტი: 'პროექტის გაკეთება' და მესამე: 'დასვენება'.",
        "expectedCode": "<body>\n  <h2>გასაკეთებელი საქმეები</h2>\n  <ol>\n    <li>HTML-ის სწავლა</li>\n    <li>პროექტის გაკეთება</li>\n    <li>დასვენება</li>\n  </ol>\n</body>",
        "hint": "დაამატე კიდევ ორი `<li>` ელემენტი სიის ბოლოში."
      }
    ]
  },
  {
    "id": "editor-11",
    "title": "შენი პირველი ბმული (ლინკი) 🔗",
    "description": "ისწავლე როგორ შექმნა ტექსტი, რომელზე დაჭერითაც სხვა გვერდზე გადახვალ.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "🔗",
    "color": "from-blue-500 to-violet-500",
    "xpReward": 15,
    "module": "სიები და ბმულები",
    "moduleNumber": 3,
    "theory": "🔗 ბმულები — ინტერნეტის ძირითადი ელემენტი\n\n<a> თეგი ქმნის ბმულს (ლინკს), რომელზეც დაჭერით სხვა გვერდზე გადახვალ.\n\n📌 სტრუქტურა:\n<a href='მისამართი'>ტექსტი</a>\n\n🔑 ნაწილები:\n• <a> — თეგის სახელი ('anchor' = ღუზა)\n• href — ატრიბუტი, სადაც URL იწერება\n• ტექსტი — რაც ეკრანზე ჩანს\n\n📝 მაგალითი:\n<a href='https://google.com'>Google-ზე გადასვლა</a>\n\n💡 href = 'hypertext reference' (ჰიპერტექსტის მითითება)",
    "starterCode": "<body>\n  <p>ეწვიე საძიებო სისტემას.</p>\n</body>",
    "steps": [
      {
        "instruction": "გარდაქმენი სიტყვები 'საძიებო სისტემას' ბმულად `<a>` თეგის გამოყენებით. ჯერ-ჯერობით `href`-ის გარეშე.",
        "expectedCode": "<body>\n  <p>ეწვიე <a>საძიებო სისტემას</a>.</p>\n</body>",
        "hint": "ჩასვი `<a>` და `</a>` სასურველი ტექსტის გარშემო."
      },
      {
        "instruction": "ახლა, `<a>` თეგს დაუმატე `href` ატრიბუტი და მიუთითე 'https://www.google.com'.",
        "expectedCode": "<body>\n  <p>ეწვიე <a href=\"https://www.google.com\">საძიებო სისტემას</a>.</p>\n</body>",
        "hint": "ატრიბუტი იწერება ასე: `href=\"მისამართი\"` და თავსდება საწყის თეგში."
      }
    ]
  },
  {
    "id": "editor-12",
    "title": "ბმულის გახსნა ახალ ფანჯარაში",
    "description": "ისწავლე `target=\"_blank\"` ატრიბუტის გამოყენება, რათა ბმული ახალ ჩანართში გაიხსნას.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "✨",
    "color": "from-fuchsia-500 to-purple-600",
    "xpReward": 15,
    "module": "სიები და ბმულები",
    "moduleNumber": 3,
    "theory": "🪟 ბმულის ახალ ფანჯარაში გახსნა\n\ntarget ატრიბუტი განსაზღვრავს, სად გაიხსნას ბმული.\n\n📌 ორი ძირითადი მნიშვნელობა:\n• target='_self' — იმავე ფანჯარაში (ჩვეულებრივი)\n• target='_blank' — ახალ ფანჯარაში/ჩანართში\n\n📝 მაგალითი:\n<a href='https://google.com' target='_blank'>Google</a>\n\n🎯 როდის გამოვიყენოთ _blank?\n• გარე საიტების ბმულებისთვის\n• რომ მომხმარებელი არ დატოვოს შენი გვერდი",
    "starterCode": "<body>\n  <a href=\"https://www.youtube.com\">ნახე ვიდეოები YouTube-ზე</a>\n</body>",
    "steps": [
      {
        "instruction": "`<a>` თეგს, `href` ატრიბუტის შემდეგ, დაუმატე `target=\"_blank\"`.",
        "expectedCode": "<body>\n  <a href=\"https://www.youtube.com\" target=\"_blank\">ნახე ვიდეოები YouTube-ზე</a>\n</body>",
        "hint": "ატრიბუტებს შორის გამოტოვე ერთი ცარიელი ადგილი (space)."
      }
    ]
  },
  {
    "id": "editor-13",
    "title": "სურათის დამატება 🖼️",
    "description": "ისწავლე როგორ დაამატო სურათი შენს ვებ-გვერდზე `<img>` თეგის გამოყენებით.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "🖼️",
    "color": "from-orange-400 to-red-500",
    "xpReward": 10,
    "module": "სურათები და მედია",
    "moduleNumber": 4,
    "theory": "🖼️ სურათის დამატება: <img> თეგი\n\nვებ-გვერდზე სურათის დასამატებლად <img> თეგი გამოიყენება.\n\n📌 მნიშვნელოვანი:\n• <img> არის 'ცარიელი' თეგი — არ სჭირდება დახურვა!\n• src ატრიბუტში სურათის მისამართი იწერება\n\n📐 სტრუქტურა:\n<img src='სურათის_მისამართი'>\n\n📝 მაგალითი:\n<img src='https://example.com/cat.jpg'>\n\n💡 src = 'source' (წყარო) — საიდან უნდა ჩატვირთოს სურათი",
    "starterCode": "<body>\n  <h1>ჩემი საყვარელი ცხოველი</h1>\n</body>",
    "steps": [
      {
        "instruction": "სათაურის შემდეგ, დაამატე `<img>` თეგი.",
        "expectedCode": "<body>\n  <h1>ჩემი საყვარელი ცხოველი</h1>\n  <img>\n</body>",
        "hint": "ამ თეგს არ აქვს დამხურავი `/` ვერსია. ის მარტო დგას."
      },
      {
        "instruction": "ახლა დაუმატე `src` ატრიბუტი და მიუთითე სურათის მისამართი: 'https://picsum.photos/200'",
        "expectedCode": "<body>\n  <h1>ჩემი საყვარელი ცხოველი</h1>\n  <img src=\"https://picsum.photos/200\">\n</body>",
        "hint": "ატრიბუტი იწერება ასე: `src=\"მისამართი\"`."
      }
    ]
  },
  {
    "id": "editor-14",
    "title": "სურათის აღწერა: Alt ატრიბუტი",
    "description": "ისწავლე `alt` ატრიბუტის მნიშვნელობა და გამოყენება.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "💬",
    "color": "from-amber-400 to-orange-500",
    "xpReward": 15,
    "module": "სურათები და მედია",
    "moduleNumber": 4,
    "theory": "♿ Alt ატრიბუტი — სურათის აღწერა\n\nalt ატრიბუტი სურათის ტექსტური აღწერაა.\n\n🎯 რისთვის არის საჭირო?\n1. თუ სურათი ვერ ჩაიტვირთა — ეს ტექსტი გამოჩნდება\n2. უსინათლო ადამიანების პროგრამები ამ ტექსტს კითხულობენ\n3. Google-ს ეხმარება სურათის გაგებაში\n\n📝 მაგალითი:\n<img src='cat.jpg' alt='ნარინჯისფერი კატა სკამზე'>\n\n⚠️ ყოველთვის დაამატე alt! ეს არა მხოლოდ წესია, არამედ კარგი პრაქტიკა.",
    "starterCode": "<body>\n  <img src=\"https://picsum.photos/id/237/200\">\n</body>",
    "steps": [
      {
        "instruction": "`<img>` თეგს, `src` ატრიბუტის შემდეგ, დაუმატე `alt` ატრიბუტი.",
        "expectedCode": "<body>\n  <img src=\"https://picsum.photos/id/237/200\" alt=\"\">\n</body>",
        "hint": "`alt` ატრიბუტსაც სჭირდება ბრჭყალები."
      },
      {
        "instruction": "`alt` ატრიბუტის ბრჭყალებში ჩაწერე სურათის აღწერა: 'საყვარელი შავი ლეკვი'.",
        "expectedCode": "<body>\n  <img src=\"https://picsum.photos/id/237/200\" alt=\"საყვარელი შავი ლეკვი\">\n</body>",
        "hint": "აღწერა უნდა იყოს მოკლე და ზუსტი."
      }
    ]
  },
  {
    "id": "editor-15",
    "title": "სურათის ზომები: Width & Height",
    "description": "აკონტროლე სურათის ზომა `width` და `height` ატრიბუტებით.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "📏",
    "color": "from-teal-300 to-cyan-400",
    "xpReward": 15,
    "module": "სურათები და მედია",
    "moduleNumber": 4,
    "theory": "📏 სურათის ზომები: Width და Height\n\nwidth და height ატრიბუტები განსაზღვრავენ სურათის ზომას.\n\n📌 გამოყენება:\n<img src='cat.jpg' width='300' height='200'>\n\n🔢 ზომები პიქსელებში (px) იწერება:\n• width='300' → 300 პიქსელი სიგანე\n• height='200' → 200 პიქსელი სიმაღლე\n\n💡 რჩევები:\n• თუ მხოლოდ width-ს მიუთითებ, height ავტომატურად მორგდება\n• ზომების მითითება გვერდის ჩატვირთვას აჩქარებს",
    "starterCode": "<body>\n  <img src=\"https://picsum.photos/id/1025/300/200\" alt=\"პაგი\">\n</body>",
    "steps": [
      {
        "instruction": "`<img>` თეგს დაუმატე `width` ატრიბუტი და მიანიჭე მნიშვნელობა '150'.",
        "expectedCode": "<body>\n  <img src=\"https://picsum.photos/id/1025/300/200\" alt=\"პაგი\" width=\"150\">\n</body>",
        "hint": "ეს სურათის სიგანეს გახდის 150 პიქსელს."
      },
      {
        "instruction": "ახლა იქვე დაამატე `height` ატრიბუტი და მიანიჭე მნიშვნელობა '100'.",
        "expectedCode": "<body>\n  <img src=\"https://picsum.photos/id/1025/300/200\" alt=\"პაგი\" width=\"150\" height=\"100\">\n</body>",
        "hint": "ეს სურათის სიმაღლეს გახდის 100 პიქსელს."
      }
    ]
  },
  {
    "id": "puzzle-5",
    "title": "სურათის თეგის აწყობა",
    "description": "სწორად დაალაგე `<img>` თეგის ნაწილები - თავად თეგი და მისი ატრიბუტები.",
    "type": "puzzle",
    "difficulty": "medium",
    "emoji": "🧩",
    "color": "from-light-blue-400 to-indigo-500",
    "xpReward": 15,
    "module": "სურათები და მედია",
    "moduleNumber": 4,
    "theory": "🧩 სურათის თეგის სტრუქტურა\n\n<img> თეგი უნიკალურია:\n\n📌 გახსოვდეს:\n• არ აქვს დამხურავი თეგი!\n• აუცილებელი ატრიბუტები: src და alt\n• არასავალდებულო: width, height\n\n📐 სრული სტრუქტურა:\n<img src='მისამართი' alt='აღწერა' width='300'>\n\n⚡ სწორი თანმიმდევრობა:\n1. <img ← თეგის სახელი\n2. src='...' ← სურათის წყარო\n3. alt='...' ← აღწერა\n4. > ← თეგის დახურვა",
    "puzzlePieces": [
      {
        "id": "p1",
        "content": "<img",
        "order": 1
      },
      {
        "id": "p2",
        "content": "src=\"https://picsum.photos/id/1062/150\"",
        "order": 2
      },
      {
        "id": "p3",
        "content": "alt=\"მთიანი პეიზაჟი\"",
        "order": 3
      },
      {
        "id": "p4",
        "content": "width=\"150\"",
        "order": 4
      },
      {
        "id": "p5",
        "content": ">",
        "order": 5
      }
    ],
    "correctOrder": [
      "p1",
      "p2",
      "p3",
      "p4",
      "p5"
    ],
    "resultHtml": "<div style='font-family: sans-serif; padding: 20px; text-align: center;'><h3>სურათი მზადაა!</h3><img src='https://picsum.photos/id/1062/150' alt='მთიანი პეიზაჟი' width='150'></div>"
  },
  {
    "id": "editor-16",
    "title": "ცხრილის შექმნა ሠ",
    "description": "ისწავლე ცხრილის შექმნა `<table>`, `<tr>` და `<td>` თეგებით.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "📅",
    "color": "from-gray-500 to-slate-600",
    "xpReward": 15,
    "module": "ცხრილები",
    "moduleNumber": 5,
    "theory": "📊 ცხრილები HTML-ში\n\nცხრილი შედგება რამდენიმე თეგისგან:\n\n📌 3 მთავარი თეგი:\n• <table> — მთელი ცხრილის კონტეინერი\n• <tr> — ცხრილის რიგი (table row)\n• <td> — ცხრილის უჯრა (table data)\n\n📐 სტრუქტურა:\n<table>\n  <tr>\n    <td>უჯრა 1</td>\n    <td>უჯრა 2</td>\n  </tr>\n  <tr>\n    <td>უჯრა 3</td>\n    <td>უჯრა 4</td>\n  </tr>\n</table>\n\n💡 ყოველ <tr>-ში ერთნაირი რაოდენობის <td> უნდა იყოს!",
    "starterCode": "<body>\n  <h2>ჩემი მეგობრები</h2>\n</body>",
    "steps": [
      {
        "instruction": "სათაურის შემდეგ, შექმენი ცხრილის კონტეინერი `<table>` თეგით. არ დაგავიწყდეს დახურვა!",
        "expectedCode": "<body>\n  <h2>ჩემი მეგობრები</h2>\n  <table>\n  </table>\n</body>",
        "hint": "ყველა ცხრილის ელემენტი `<table>`-სა და `</table>`-ს შორის უნდა იყოს."
      },
      {
        "instruction": "`<table>`-ს შიგნით, შექმენი პირველი რიგი `<tr>`-ით.",
        "expectedCode": "<body>\n  <h2>ჩემი მეგობრები</h2>\n  <table>\n    <tr>\n    </tr>\n  </table>\n</body>",
        "hint": "თითოეული რიგი ცალკე `<tr>`-ს საჭიროებს."
      },
      {
        "instruction": "ახლად შექმნილ `<tr>`-ში, დაამატე ორი უჯრა `<td>`-თი: 'ანა' და '12'.",
        "expectedCode": "<body>\n  <h2>ჩემი მეგობრები</h2>\n  <table>\n    <tr>\n      <td>ანა</td>\n      <td>12</td>\n    </tr>\n  </table>\n</body>",
        "hint": "დაწერე `<td>ანა</td>` და მის გვერდით `<td>12</td>`."
      },
      {
        "instruction": "პირველი `<tr>`-ის დახურვის შემდეგ, შექმენი ახალი რიგი, რომელშიც იქნება 'ლუკა' და '11'.",
        "expectedCode": "<body>\n  <h2>ჩემი მეგობრები</h2>\n  <table>\n    <tr>\n      <td>ანა</td>\n      <td>12</td>\n    </tr>\n    <tr>\n      <td>ლუკა</td>\n      <td>11</td>\n    </tr>\n  </table>\n</body>",
        "hint": "გაიმეორე იგივე სტრუქტურა ახალი მონაცემებისთვის."
      }
    ]
  },
  {
    "id": "editor-17",
    "title": "ცხრილის სათაურები: th",
    "description": "გამოიყენე `<th>` თეგი, რათა შექმნა ცხრილის სვეტების სათაურები.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "📌",
    "color": "from-stone-500 to-neutral-600",
    "xpReward": 15,
    "module": "ცხრილები",
    "moduleNumber": 5,
    "theory": "📊 ცხრილის სათაურები: <th>\n\n<th> თეგი ცხრილის სათაურისთვის გამოიყენება.\n\n📌 განსხვავება <td>-ისგან:\n• <td> — ჩვეულებრივი უჯრა\n• <th> — სათაურის უჯრა (table header)\n• <th> ტექსტი ავტომატურად მუქდება და ცენტრდება\n\n📐 მაგალითი:\n<table>\n  <tr>\n    <th>სახელი</th>\n    <th>ასაკი</th>\n  </tr>\n  <tr>\n    <td>ნინო</td>\n    <td>12</td>\n  </tr>\n</table>\n\n💡 <th> ჩვეულებრივ პირველ <tr>-ში იწერება!",
    "starterCode": "<table>\n  <tr>\n    <td>ანა</td>\n    <td>12</td>\n  </tr>\n  <tr>\n    <td>ლუკა</td>\n    <td>11</td>\n  </tr>\n</table>",
    "steps": [
      {
        "instruction": "ცხრილის დასაწყისში, შექმენი ახალი რიგი (`<tr>`) სათაურებისთვის.",
        "expectedCode": "<table>\n  <tr>\n\n  </tr>\n  <tr>\n    <td>ანა</td>\n    <td>12</td>\n  </tr>\n  <tr>\n    <td>ლუკა</td>\n    <td>11</td>\n  </tr>\n</table>",
        "hint": "პირველი `<tr>` ახლა ცარიელი უნდა იყოს."
      },
      {
        "instruction": "ამ ახალ რიგში, დაამატე ორი სათაურის უჯრა `<th>`-ით: 'სახელი' და 'ასაკი'.",
        "expectedCode": "<table>\n  <tr>\n    <th>სახელი</th>\n    <th>ასაკი</th>\n  </tr>\n  <tr>\n    <td>ანა</td>\n    <td>12</td>\n  </tr>\n  <tr>\n    <td>ლუკა</td>\n    <td>11</td>\n  </tr>\n</table>",
        "hint": "`<th>` გამოიყენება `<td>`-ს ნაცვლად, მხოლოდ სათაურის რიგში."
      }
    ]
  },
  {
    "id": "editor-18",
    "title": "ფორმის შექმნა 📝",
    "description": "ისწავლე `<form>` თეგის გამოყენება, რომელიც მომხმარებლისგან ინფორმაციის მისაღებად გვჭირდება.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "📝",
    "color": "from-violet-400 to-purple-500",
    "xpReward": 10,
    "module": "ფორმები",
    "moduleNumber": 6,
    "theory": "📝 ფორმები — მონაცემების შეგროვება\n\n<form> თეგი გამოიყენება მომხმარებლისგან ინფორმაციის მისაღებად.\n\n🎯 სად გამოიყენება?\n• რეგისტრაციის ფორმა\n• ძიების ველი\n• კომენტარის დატოვება\n• გამოკითხვა\n\n📐 სტრუქტურა:\n<form>\n  <!-- ფორმის ელემენტები აქ -->\n</form>\n\n📌 <form> თეგი თავისთავად ვიზუალურად არაფერს აჩვენებს — შიგნით სხვა ელემენტები უნდა ჩასვა (input, button და ა.შ.)",
    "starterCode": "<body>\n  <h2>რეგისტრაცია</h2>\n</body>",
    "steps": [
      {
        "instruction": "სათაურის შემდეგ, დაამატე `<form>` თეგი და მაშინვე დახურე.",
        "expectedCode": "<body>\n  <h2>რეგისტრაცია</h2>\n  <form>\n  </form>\n</body>",
        "hint": "ყველა სარეგისტრაციო ველი ამ თეგებს შორის მოთავსდება."
      }
    ]
  },
  {
    "id": "editor-19",
    "title": "ტექსტური ველი: Input",
    "description": "ისწავლე ტექსტის შესაყვანი ველის შექმნა `<input>` თეგით და მისი დაკავშირება `<label>`-თან.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "⌨️",
    "color": "from-fuchsia-400 to-pink-600",
    "xpReward": 15,
    "module": "ფორმები",
    "moduleNumber": 6,
    "theory": "⌨️ Input — ტექსტური ველი\n\n<input> თეგი ქმნის ველს, სადაც მომხმარებელი ტექსტს წერს.\n\n📌 მნიშვნელოვანი:\n• <input> ცარიელი თეგია — არ სჭირდება დახურვა!\n• type ატრიბუტი განსაზღვრავს ველის ტიპს\n• placeholder აჩვენებს მინიშნებას ველში\n\n📝 მაგალითი:\n<input type='text' placeholder='შეიყვანე სახელი'>\n\n🎯 type='text' — ჩვეულებრივი ტექსტური ველი\n\n💡 placeholder ტექსტი ქრება, როცა მომხმარებელი წერს",
    "starterCode": "<form>\n</form>",
    "steps": [
      {
        "instruction": "`<form>`-ის შიგნით, დაამატე `<label>` ტექსტით 'სახელი:'.",
        "expectedCode": "<form>\n  <label>სახელი:</label>\n</form>",
        "hint": "დაწერე `<label>` და `</label>` თეგები და მათ შორის ჩაწერე ტექსტი."
      },
      {
        "instruction": "`<label>`-ის შემდეგ, დაამატე ტექსტური ველი: `<input type=\"text\">`.",
        "expectedCode": "<form>\n  <label>სახელი:</label>\n  <input type=\"text\">\n</form>",
        "hint": "`<input>` თეგს არ სჭირდება დამხურავი თეგი."
      },
      {
        "instruction": "მოდი, დავაკავშიროთ ისინი. `<label>`-ს დაუმატე `for=\"username\"`, ხოლო `<input>`-ს `id=\"username\"`.",
        "expectedCode": "<form>\n  <label for=\"username\">სახელი:</label>\n  <input type=\"text\" id=\"username\">\n</form>",
        "hint": "`for`-ის და `id`-ის მნიშვნელობები იდენტური უნდა იყოს. ახლა ლეიბლზე დაკლიკებით კურსორი ტექსტურ ველში გადავა."
      }
    ]
  },
  {
    "id": "editor-20",
    "title": "ღილაკის დამატება",
    "description": "ისწავლე როგორ დაამატო დასაჭერი ღილაკი ფორმაში `<button>` თეგის გამოყენებით.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "🔘",
    "color": "from-green-500 to-lime-500",
    "xpReward": 10,
    "module": "ფორმები",
    "moduleNumber": 6,
    "theory": "🔘 Button — ღილაკი\n\n<button> თეგი ქმნის ღილაკს, რომელზეც მომხმარებელი დააჭერს.\n\n📌 სტრუქტურა:\n<button>ტექსტი</button>\n\n🎯 გამოყენების მაგალითები:\n• <button>გაგზავნა</button>\n• <button>რეგისტრაცია</button>\n• <button>ძიება</button>\n\n📌 ფორმაში ღილაკის ტიპები:\n• type='submit' — ფორმის გაგზავნა\n• type='button' — ჩვეულებრივი ღილაკი\n• type='reset' — ფორმის გასუფთავება\n\n💡 <button> თეგის შიგნით ტექსტიც შეგიძლია ჩასვა და სურათიც!",
    "starterCode": "<form>\n  <label for=\"username\">სახელი:</label>\n  <input type=\"text\" id=\"username\">\n</form>",
    "steps": [
      {
        "instruction": "`<input>` ველის შემდეგ, ახალ ხაზზე, დაამატე `<button>` თეგი.",
        "expectedCode": "<form>\n  <label for=\"username\">სახელი:</label>\n  <input type=\"text\" id=\"username\">\n  <button></button>\n</form>",
        "hint": "არ დაგავიწყდეს დამხურავი თეგი `</button>`."
      },
      {
        "instruction": "ღილაკის თეგებს შორის ჩაწერე ტექსტი 'გაგზავნა'.",
        "expectedCode": "<form>\n  <label for=\"username\">სახელი:</label>\n  <input type=\"text\" id=\"username\">\n  <button>გაგზავნა</button>\n</form>",
        "hint": "ეს ტექსტი გამოჩნდება ღილაკზე."
      }
    ]
  },
  {
    "id": "editor-21",
    "title": "სხვა Input ტიპები",
    "description": "გაეცანი სხვა პოპულარულ `<input>` ტიპებს: `password`, `email`, `number`.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "🔑",
    "color": "from-sky-400 to-cyan-500",
    "xpReward": 15,
    "module": "ფორმები",
    "moduleNumber": 6,
    "theory": "🔤 Input-ის სხვადასხვა ტიპები\n\ntype ატრიბუტი ცვლის input-ის ქცევას:\n\n📌 ძირითადი ტიპები:\n• type='text' → ტექსტური ველი\n• type='password' → პაროლის ველი (ტექსტი იმალება)\n• type='email' → ელ-ფოსტის ველი (ამოწმებს @-ს)\n• type='number' → მხოლოდ რიცხვები\n• type='checkbox' → მონიშვნის ყუთი ☑️\n• type='radio' → არჩევანის წრე ◉\n\n📝 მაგალითი:\n<input type='email' placeholder='ელ-ფოსტა'>\n<input type='password' placeholder='პაროლი'>\n\n💡 ბრაუზერი ავტომატურად ამოწმებს სწორ ფორმატს!",
    "starterCode": "<form>\n  <label for=\"username\">სახელი:</label>\n  <input type=\"text\" id=\"username\">\n  <br><br>\n  <button>გაგზავნა</button>\n</form>",
    "steps": [
      {
        "instruction": "სახელის ველის შემდეგ, `<br>` თეგამდე, დაამატე პაროლის ველი. გამოიყენე `<label>` და `<input type=\"password\">`.",
        "expectedCode": "<form>\n  <label for=\"username\">სახელი:</label>\n  <input type=\"text\" id=\"username\">\n  <br><br>\n  <label for=\"pass\">პაროლი:</label>\n  <input type=\"password\" id=\"pass\">\n  <br><br>\n  <button>გაგზავნა</button>\n</form>",
        "hint": "სტრუქტურა იგივეა, რაც სახელის ველის შემთხვევაში, იცვლება მხოლოდ `type`, `for` და `id`."
      },
      {
        "instruction": "ახლა, პაროლის ველის შემდეგ, დაამატე იმეილის ველი `<input type=\"email\">`-ით.",
        "expectedCode": "<form>\n  <label for=\"username\">სახელი:</label>\n  <input type=\"text\" id=\"username\">\n  <br><br>\n  <label for=\"pass\">პაროლი:</label>\n  <input type=\"password\" id=\"pass\">\n  <br><br>\n  <label for=\"mail\">იმეილი:</label>\n  <input type=\"email\" id=\"mail\">\n  <br><br>\n  <button>გაგზავნა</button>\n</form>",
        "hint": "გამოიყენე `<label for=\"mail\">` და `<input id=\"mail\">`."
      }
    ]
  },
  {
    "id": "editor-22",
    "title": "ჩამოსაშლელი სია: Select",
    "description": "შექმენი ჩამოსაშლელი სია, საიდანაც მომხმარებელი ერთ-ერთ ვარიანტს აირჩევს.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "🔽",
    "color": "from-rose-500 to-red-600",
    "xpReward": 15,
    "module": "ფორმები",
    "moduleNumber": 6,
    "theory": "📋 Select — ჩამოსაშლელი სია\n\n<select> ქმნის ჩამოსაშლელ მენიუს, საიდანაც ერთს ირჩევ.\n\n📌 ორი თეგი გვჭირდება:\n• <select> — კონტეინერი\n• <option> — თითოეული ვარიანტი\n\n📐 სტრუქტურა:\n<select>\n  <option>ვარიანტი 1</option>\n  <option>ვარიანტი 2</option>\n  <option>ვარიანტი 3</option>\n</select>\n\n💡 value ატრიბუტი:\n<option value='ge'>საქართველო</option>\n\nvalue არის მნიშვნელობა, რომელიც სერვერზე იგზავნება.",
    "starterCode": "<form>\n</form>",
    "steps": [
      {
        "instruction": "ფორმის შიგნით, დაამატე `<label>` ტექსტით 'აირჩიე ფერი:' და დაუკავშირე ის `id`-ს 'colors'.",
        "expectedCode": "<form>\n  <label for=\"colors\">აირჩიე ფერი:</label>\n</form>",
        "hint": "გამოიყენე `<label for=\"colors\">`."
      },
      {
        "instruction": "`<label>`-ის შემდეგ, დაამატე `<select>` თეგი `id=\"colors\"`-ით.",
        "expectedCode": "<form>\n  <label for=\"colors\">აირჩიე ფერი:</label>\n  <select id=\"colors\">\n  </select>\n</form>",
        "hint": "ვარიანტები ამ თეგებს შორის მოთავსდება."
      },
      {
        "instruction": "`<select>`-ის შიგნით დაამატე პირველი ვარიანტი: `<option>წითელი</option>`.",
        "expectedCode": "<form>\n  <label for=\"colors\">აირჩიე ფერი:</label>\n  <select id=\"colors\">\n    <option>წითელი</option>\n  </select>\n</form>",
        "hint": "თითოეული არჩევანი ცალკე `<option>` თეგში იწერება."
      },
      {
        "instruction": "დაამატე კიდევ ორი ვარიანტი: 'ლურჯი' და 'მწვანე'.",
        "expectedCode": "<form>\n  <label for=\"colors\">აირჩიე ფერი:</label>\n  <select id=\"colors\">\n    <option>წითელი</option>\n    <option>ლურჯი</option>\n    <option>მწვანე</option>\n  </select>\n</form>",
        "hint": "დაამატე ორი ახალი `<option>` ელემენტი წინას ქვემოთ."
      }
    ]
  },
  {
    "id": "editor-23",
    "title": "რა არის CSS? 🎨",
    "description": "გაიგე, რა არის CSS და როგორ დავამატოთ სტილები HTML-ს `<style>` თეგის გამოყენებით.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "🎨",
    "color": "from-pink-500 to-rose-500",
    "xpReward": 10,
    "module": "CSS-ის შესავალი",
    "moduleNumber": 7,
    "theory": "🎨 CSS — ვებ-გვერდის 'ტანსაცმელი'\n\nCSS (Cascading Style Sheets) არის ენა, რომელიც ვებ-გვერდს ალამაზებს.\n\n📌 HTML vs CSS:\n• HTML — რა ჩანს (სტრუქტურა)\n• CSS — როგორ ჩანს (სტილი)\n\n🎯 CSS-ით შეგიძლია:\n• ფერების შეცვლა\n• ზომების მორგება\n• ელემენტების განლაგება\n• ანიმაციების დამატება\n\n📐 CSS-ის სტრუქტურა:\nსელექტორი {\n  თვისება: მნიშვნელობა;\n}\n\n📝 მაგალითი:\np {\n  color: red;\n}\nეს ყველა პარაგრაფს გაწითლებს!",
    "starterCode": "<head>\n  <title>CSS-ის გაკვეთილი</title>\n</head>\n<body>\n  <h1>გამარჯობა, CSS!</h1>\n</body>",
    "steps": [
      {
        "instruction": "`<head>` სექციაში, `<title>` თეგის შემდეგ, დაამატე `<style>` თეგი.",
        "expectedCode": "<head>\n  <title>CSS-ის გაკვეთილი</title>\n  <style>\n  </style>\n</head>\n<body>\n  <h1>გამარჯობა, CSS!</h1>\n</body>",
        "hint": "ყველა ჩვენი სტილი `<style>`-სა და `</style>`-ს შორის დაიწერება."
      }
    ]
  },
  {
    "id": "editor-24",
    "title": "ტექსტის ფერი: color",
    "description": "ისწავლე როგორ შეცვალო ტექსტის ფერი CSS-ის `color` თვისებით.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "🌈",
    "color": "from-red-400 via-yellow-400 to-green-500",
    "xpReward": 10,
    "module": "CSS-ის შესავალი",
    "moduleNumber": 7,
    "theory": "🔴 color — ტექსტის ფერი\n\ncolor თვისება ცვლის ტექსტის ფერს.\n\n📌 ფერის მითითების გზები:\n1. სახელით: red, blue, green, purple\n2. HEX კოდით: #ff0000, #0000ff\n3. RGB-ით: rgb(255, 0, 0)\n\n📝 მაგალითი:\nh1 {\n  color: blue;\n}\n\np {\n  color: #ff6600;\n}\n\n🎯 ხშირად გამოყენებული ფერები:\n• red — წითელი\n• blue — ლურჯი\n• green — მწვანე\n• purple — იასამნისფერი\n• orange — ნარინჯისფერი",
    "starterCode": "<style>\n</style>\n\n<h1>გამარჯობა, CSS!</h1>",
    "steps": [
      {
        "instruction": "`<style>`-ში ჩაწერე სელექტორი `h1` და ფიგურული ფრჩხილები `{ }`.",
        "expectedCode": "<style>\nh1 {\n\n}\n</style>\n\n<h1>გამარჯობა, CSS!</h1>",
        "hint": "ეს ნიშნავს, რომ ჩვენ `h1` ელემენტის გასტილვას ვაპირებთ."
      },
      {
        "instruction": "ფიგურულ ფრჩხილებში ჩაწერე თვისება `color: blue;`.",
        "expectedCode": "<style>\nh1 {\n  color: blue;\n}\n</style>\n\n<h1>გამარჯობა, CSS!</h1>",
        "hint": "ეს h1-ის ტექსტს გალურჯებს. არ დაგავიწყდეს წერტილ-მძიმე (`;`)."
      }
    ]
  },
  {
    "id": "challenge-1",
    "title": "გამოწვევა: გააწითლე პარაგრაფი!",
    "description": "გამოიყენე ნასწავლი `color` თვისება და გახადე პარაგრაფის ტექსტი წითელი.",
    "type": "challenge",
    "difficulty": "easy",
    "emoji": "🌶️",
    "color": "from-red-500 to-red-700",
    "xpReward": 15,
    "module": "CSS-ის შესავალი",
    "moduleNumber": 7,
    "theory": "🎯 CSS გამოწვევა!\n\nუკვე ისწავლე color თვისება. ახლა პრაქტიკის დროა!\n\n📌 გახსოვდეს:\n• CSS-ში თვისება ორწერტილის შემდეგ იწერება\n• ბოლოს წერტილ-მძიმე (;) აუცილებელია\n• სელექტორი ირჩევს, რომელ ელემენტს ენიჭება სტილი\n\n📝 მაგალითი:\np {\n  color: red;\n}\n\nსცადე შეუცვალე ფერი პარაგრაფს!",
    "challengeHtml": "<p>ეს ტექსტი უნდა გაწითლდეს.</p>",
    "targetCss": "p {\n  color: red;\n}",
    "starterCss": "p {\n  /* დაწერე შენი კოდი აქ */\n}",
    "hints": [
      "შენი სელექტორი უნდა იყოს `p`.",
      "გამოიყენე `color` თვისება.",
      "ფერის სახელი უნდა იყოს `red`.",
      "თვისების შემდეგ დასვი `:` და მნიშვნელობის შემდეგ `;`."
    ]
  },
  {
    "id": "editor-25",
    "title": "ფონის ფერი: background-color",
    "description": "ისწავლე როგორ შეცვალო ელემენტის ფონის ფერი `background-color` თვისებით.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "🎨",
    "color": "from-yellow-300 to-orange-400",
    "xpReward": 10,
    "module": "CSS-ის შესავალი",
    "moduleNumber": 7,
    "theory": "🟡 background-color — ფონის ფერი\n\nbackground-color ცვლის ელემენტის ფონის ფერს.\n\n📌 სხვაობა color-ისგან:\n• color → ტექსტის ფერი\n• background-color → ფონის ფერი\n\n📝 მაგალითი:\nh1 {\n  color: white;\n  background-color: navy;\n}\n\n🎯 ეფექტური კომბინაციები:\n• თეთრი ტექსტი + მუქი ფონი\n• მუქი ტექსტი + ღია ფონი\n\n⚠️ ყოველთვის უზრუნველყავი კონტრასტი — ტექსტი კარგად უნდა იკითხებოდეს!",
    "starterCode": "<style>\nbody {\n\n}\n</style>\n\n<h1>გამარჯობა!</h1>",
    "steps": [
      {
        "instruction": "`body` სელექტორის ბლოკში ჩაწერე `background-color: lightblue;`.",
        "expectedCode": "<style>\nbody {\n  background-color: lightblue;\n}\n</style>\n\n<h1>გამარჯობა!</h1>",
        "hint": "ეს მთელი გვერდის ფონს ღია ლურჯად შეღებავს."
      }
    ]
  },
  {
    "id": "challenge-2",
    "title": "გამოწვევა: ყვითელი სათაური",
    "description": "გახადე სათაურის (`h1`) ფონი ყვითელი.",
    "type": "challenge",
    "difficulty": "easy",
    "emoji": "🌟",
    "color": "from-yellow-400 to-amber-500",
    "xpReward": 15,
    "module": "CSS-ის შესავალი",
    "moduleNumber": 7,
    "theory": "🎯 ფერების გამოწვევა!\n\n📌 გახსოვდეს ეს ორი თვისება:\n• color: ფერი; → ტექსტის ფერი\n• background-color: ფერი; → ფონის ფერი\n\n🎨 ფერების სია:\nred, blue, green, yellow, orange, purple, pink, cyan, navy, gold, coral, tomato\n\n💡 შეგიძლია ნებისმიერი ფერი გამოიყენო! სცადე სხვადასხვა კომბინაცია.",
    "challengeHtml": "<h1>ამ სათაურს სჭირდება ყვითელი ფონი!</h1>",
    "targetCss": "h1 {\n  background-color: yellow;\n}",
    "starterCss": "h1 {\n  /* შეავსე ეს კოდი */\n}",
    "hints": [
      "გამოიყენე `background-color` თვისება.",
      "ფერის სახელი, რომელსაც ეძებ, არის `yellow`.",
      "დარწმუნდი, რომ კოდი `h1` სელექტორის ფიგურულ ფრჩხილებშია."
    ]
  },
  {
    "id": "editor-26",
    "title": "შრიფტის ზომა: font-size",
    "description": "ისწავლე როგორ აკონტროლო ტექსტის ზომა `font-size` თვისებით.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "🔍",
    "color": "from-blue-300 to-indigo-400",
    "xpReward": 10,
    "module": "CSS-ის შესავალი",
    "moduleNumber": 7,
    "theory": "🔠 font-size — შრიფტის ზომა\n\nfont-size თვისება ცვლის ტექსტის ზომას.\n\n📌 ზომის ერთეულები:\n• px (პიქსელი) — ყველაზე ზუსტი: font-size: 16px;\n• em — მშობელ ელემენტთან შედარებით: font-size: 1.5em;\n• rem — root ელემენტთან შედარებით: font-size: 1.2rem;\n\n📝 მაგალითი:\nh1 { font-size: 36px; }\np { font-size: 16px; }\nsmall { font-size: 12px; }\n\n💡 სტანდარტული ზომა ბრაუზერში: 16px\n\n🎯 რჩევა: სათაურები დიდი, ტექსტი საშუალო, შენიშვნები პატარა!",
    "starterCode": "<style>\np {\n\n}\n</style>\n\n<p>ეს ტექსტი პატარაა.</p>",
    "steps": [
      {
        "instruction": "`p` სელექტორის ბლოკში ჩაწერე `font-size: 24px;`.",
        "expectedCode": "<style>\np {\n  font-size: 24px;\n}\n</style>\n\n<p>ეს ტექსტი პატარაა.</p>",
        "hint": "ეს პარაგრაფის ტექსტს 24 პიქსელის სიმაღლედ აქცევს. არ დაგავიწყდეს `px`!"
      }
    ]
  },
  {
    "id": "editor-27",
    "title": "შრიფტის ოჯახი: font-family",
    "description": "შეცვალე შრიფტი, ანუ ტექსტის წერის სტილი, `font-family` თვისებით.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "🖋️",
    "color": "from-slate-400 to-gray-500",
    "xpReward": 15,
    "module": "CSS-ის შესავალი",
    "moduleNumber": 7,
    "theory": "🔤 font-family — შრიფტის ოჯახი\n\nfont-family ცვლის ტექსტის შრიფტს (ფონტს).\n\n📌 ძირითადი შრიფტის ოჯახები:\n• serif — სერიფებიანი (Times New Roman)\n• sans-serif — სერიფების გარეშე (Arial, Helvetica)\n• monospace — ერთნაირი სიგანის ასოები (კოდისთვის)\n• cursive — ხელნაწერის მსგავსი\n\n📝 მაგალითი:\nbody {\n  font-family: Arial, sans-serif;\n}\n\n💡 რამდენიმე შრიფტს ჩამოთვლი — თუ პირველი არ არის, მეორეს გამოიყენებს:\nfont-family: 'Georgia', 'Times New Roman', serif;",
    "starterCode": "<style>\nbody {\n  font-size: 20px;\n}\n</style>\n\n<p>ამ ტექსტს შევუცვალოთ შრიფტი.</p>",
    "steps": [
      {
        "instruction": "`body` სელექტორის ბლოკში, დაამატე `font-family: Georgia;`.",
        "expectedCode": "<style>\nbody {\n  font-size: 20px;\n  font-family: Georgia;\n}\n</style>\n\n<p>ამ ტექსტს შევუცვალოთ შრიფტი.</p>",
        "hint": "ეს შეცვლის მთელი გვერდის შრიფტს."
      },
      {
        "instruction": "რა მოხდება, თუ შრიფტის სახელი ორ სიტყვას შეიცავს? შეცვალე `Georgia` `\"Courier New\"`-თი (ბრჭყალებით).",
        "expectedCode": "<style>\nbody {\n  font-size: 20px;\n  font-family: \"Courier New\";\n}\n</style>\n\n<p>ამ ტექსტს შევუცვალოთ შრიფტი.</p>",
        "hint": "თუ შრიფტის სახელი ერთზე მეტი სიტყვისგან შედგება, ის ბრჭყალებში უნდა ჩაისვას."
      }
    ]
  },
  {
    "id": "editor-28",
    "title": "კლასის სელექტორი",
    "description": "ისწავლე როგორ მიმართო კონკრეტულ ელემენტებს `class` ატრიბუტით.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "🎯",
    "color": "from-emerald-500 to-green-600",
    "xpReward": 15,
    "module": "CSS-ის შესავალი",
    "moduleNumber": 7,
    "theory": "🏷️ კლასის სელექტორი (.)\n\nკლასი საშუალებას გაძლევს ერთ სტილს მიანიჭო რამდენიმე ელემენტს.\n\n📌 როგორ მუშაობს:\n1. HTML-ში: class='სახელი' ატრიბუტს ამატებ\n2. CSS-ში: .სახელი სელექტორით სტილს წერ\n\n📝 მაგალითი:\nHTML: <p class='important'>მნიშვნელოვანი</p>\nCSS: .important { color: red; font-weight: bold; }\n\n💡 კლასის უპირატესობები:\n• ერთი კლასი — ბევრ ელემენტზე\n• ერთ ელემენტს — ბევრი კლასი\n• class='big red bold' ← 3 კლასი ერთად!",
    "starterCode": "<style>\n</style>\n\n<p>ეს ჩვეულებრივი პარაგრაფია.</p>\n<p class=\"highlight\">ეს გასაფერადებელი პარაგრაფია.</p>",
    "steps": [
      {
        "instruction": "`<style>`-ში შექმენი კლასის სელექტორი `.highlight`.",
        "expectedCode": "<style>\n.highlight {\n\n}\n</style>\n\n<p>ეს ჩვეულებრივი პარაგრაფია.</p>\n<p class=\"highlight\">ეს გასაფერადებელი პარაგრაფია.</p>",
        "hint": "სელექტორი იწყება წერტილით (`.`)."
      },
      {
        "instruction": "ამ სელექტორის ბლოკში დაამატე `color: blue;` და `background-color: yellow;`.",
        "expectedCode": "<style>\n.highlight {\n  color: blue;\n  background-color: yellow;\n}\n</style>\n\n<p>ეს ჩვეულებრივი პარაგრაფია.</p>\n<p class=\"highlight\">ეს გასაფერადებელი პარაგრაფია.</p>",
        "hint": "ეს სტილები მხოლოდ იმ ელემენტს შეეხება, რომელსაც აქვს `class=\"highlight\"`."
      }
    ]
  },
  {
    "id": "editor-29",
    "title": "ID სელექტორი",
    "description": "ისწავლე როგორ მიმართო ერთ, უნიკალურ ელემენტს `id` ატრიბუტით.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "🆔",
    "color": "from-purple-500 to-indigo-600",
    "xpReward": 15,
    "module": "CSS-ის შესავალი",
    "moduleNumber": 7,
    "theory": "🔑 ID სელექტორი (#)\n\nID არის უნიკალური იდენტიფიკატორი — მხოლოდ ერთ ელემენტს ენიჭება.\n\n📌 კლასი vs ID:\n• .class → ბევრ ელემენტზე (ზოგადი)\n• #id → მხოლოდ ერთ ელემენტზე (უნიკალური)\n\n📝 მაგალითი:\nHTML: <h1 id='main-title'>სათაური</h1>\nCSS: #main-title { color: navy; font-size: 48px; }\n\n⚠️ წესები:\n• ერთ გვერდზე ერთი ID მხოლოდ ერთხელ!\n• ID ბევრჯერ არ გამოიყენო — კლასი სჯობს\n• ID-ს # ნიშნით მივმართავთ CSS-ში",
    "starterCode": "<style>\n</style>\n\n<h1 id=\"main-title\">მთავარი სათაური</h1>\n<h2>ქვესათაური</h2>",
    "steps": [
      {
        "instruction": "`<style>`-ში შექმენი id სელექტორი `#main-title`.",
        "expectedCode": "<style>\n#main-title {\n\n}\n</style>\n\n<h1 id=\"main-title\">მთავარი სათაური</h1>\n<h2>ქვესათაური</h2>",
        "hint": "სელექტორი იწყება დიეზით (`#`)."
      },
      {
        "instruction": "ამ სელექტორის ბლოკში დაამატე `font-size: 40px;` და `color: purple;`.",
        "expectedCode": "<style>\n#main-title {\n  font-size: 40px;\n  color: purple;\n}\n</style>\n\n<h1 id=\"main-title\">მთავარი სათაური</h1>\n<h2>ქვესათაური</h2>",
        "hint": "ეს სტილები მხოლოდ `h1` ელემენტს შეეხება, რადგან მას აქვს `id=\"main-title\"`."
      }
    ]
  },
  {
    "id": "challenge-3",
    "title": "ყუთის მოდელის შესავალი",
    "description": "შექმენი მარტივი ყუთი `width`, `height` და `background-color` თვისებებით.",
    "type": "challenge",
    "difficulty": "easy",
    "emoji": "📦",
    "color": "from-amber-500 to-orange-600",
    "xpReward": 15,
    "module": "ყუთის მოდელი",
    "moduleNumber": 8,
    "theory": "📦 ყუთის მოდელი (Box Model)\n\nCSS-ში ყველა ელემენტი 'ყუთია'. ყუთის მოდელი განსაზღვრავს ელემენტის სივრცეს.\n\n📐 4 ფენა (შიგნიდან გარეთ):\n1. Content — შიგთავსი (ტექსტი, სურათი)\n2. Padding — შიდა დაშორება (შიგთავსიდან ჩარჩომდე)\n3. Border — ჩარჩო (საზღვარი)\n4. Margin — გარე დაშორება (სხვა ელემენტებამდე)\n\n📝 წარმოიდგინე სურათი ჩარჩოში:\n• სურათი = content\n• თეთრი ადგილი სურათსა და ჩარჩოს შორის = padding\n• ჩარჩო = border\n• მანძილი სხვა სურათებამდე = margin",
    "challengeHtml": "<div class=\"box\"></div>",
    "targetCss": ".box {\n  width: 100px;\n  height: 100px;\n  background-color: dodgerblue;\n}",
    "starterCss": ".box {\n  /* შენი კოდი აქ */\n}",
    "hints": [
      "გამოიყენე `width` თვისება სიგანის მისათითებლად.",
      "სიმაღლისთვის გამოიყენე `height` თვისება.",
      "ორივე თვისებას მნიშვნელობად მიუთითე `100px`.",
      "ფონისთვის გამოიყენე `background-color`."
    ]
  },
  {
    "id": "editor-30",
    "title": "ჩარჩო: border",
    "description": "ისწავლე როგორ დაამატო ჩარჩო ელემენტს `border` თვისების გამოყენებით.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "🖼️",
    "color": "from-cyan-400 to-teal-500",
    "xpReward": 10,
    "module": "ყუთის მოდელი",
    "moduleNumber": 8,
    "theory": "🖼️ Border — ჩარჩო\n\nborder თვისება ელემენტს ჩარჩოს (საზღვარს) უმატებს.\n\n📌 3 ნაწილი:\nborder: სისქე სტილი ფერი;\n\n🎨 ჩარჩოს სტილები:\n• solid — უწყვეტი ხაზი ———\n• dashed — ტიროსანი - - - -\n• dotted — წერტილოვანი · · · ·\n• double — ორმაგი ═══\n\n📝 მაგალითი:\n.box {\n  border: 2px solid #333;\n}\n\n💡 ცალკეულ მხარეებზე:\nborder-top, border-right, border-bottom, border-left",
    "starterCode": "<style>\n.my-box {\n  width: 150px;\n  height: 100px;\n  background-color: lightgray;\n}\n</style>\n\n<div class=\"my-box\"></div>",
    "steps": [
      {
        "instruction": "`.my-box` სელექტორის ბლოკში დაამატე `border: 2px solid black;`.",
        "expectedCode": "<style>\n.my-box {\n  width: 150px;\n  height: 100px;\n  background-color: lightgray;\n  border: 2px solid black;\n}\n</style>\n\n<div class=\"my-box\"></div>",
        "hint": "მნიშვნელობები (`2px`, `solid`, `black`) ერთმანეთისგან გამოყოფილია სფეისით."
      }
    ]
  },
  {
    "id": "editor-31",
    "title": "შიდა დაშორება: padding",
    "description": "ისწავლე როგორ შექმნა სივრცე ელემენტის შიგთავსსა და ჩარჩოს შორის `padding`-ით.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "🛋️",
    "color": "from-lime-400 to-green-500",
    "xpReward": 15,
    "module": "ყუთის მოდელი",
    "moduleNumber": 8,
    "theory": "⬜ Padding — შიდა დაშორება\n\npadding ქმნის სივრცეს შიგთავსისა და ჩარჩოს (border) შორის.\n\n📌 მითითების გზები:\n• padding: 20px; → ყველა მხარეს 20px\n• padding: 10px 20px; → ზემოთ/ქვემოთ 10, მარცხნივ/მარჯვნივ 20\n• padding: 5px 10px 15px 20px; → ზემოთ, მარჯვნივ, ქვემოთ, მარცხნივ\n\n📝 მაგალითი:\n.card {\n  padding: 20px;\n  border: 1px solid #ddd;\n}\n\n🎯 padding ზრდის ელემენტის ზომას!\n💡 წარმოიდგინე: ტანსაცმლის შიგნით ბალიში",
    "starterCode": "<style>\n.padded-box {\n  border: 2px solid green;\n  background-color: #e8f5e9;\n}\n</style>\n\n<div class=\"padded-box\">ეს ტექსტი კედლებზეა მიწებებული.</div>",
    "steps": [
      {
        "instruction": "`.padded-box` სელექტორს დაუმატე `padding: 20px;`.",
        "expectedCode": "<style>\n.padded-box {\n  border: 2px solid green;\n  background-color: #e8f5e9;\n  padding: 20px;\n}\n</style>\n\n<div class=\"padded-box\">ეს ტექსტი კედლებზეა მიწებებული.</div>",
        "hint": "ეს დაამატებს 20 პიქსელიან დაშორებას შიგნიდან, ყველა მხარეს."
      }
    ]
  },
  {
    "id": "editor-32",
    "title": "გარე დაშორება: margin",
    "description": "ისწავლე როგორ შექმნა სივრცე ელემენტებს შორის `margin`-ით.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "🚦",
    "color": "from-red-400 to-pink-500",
    "xpReward": 15,
    "module": "ყუთის მოდელი",
    "moduleNumber": 8,
    "theory": "↔️ Margin — გარე დაშორება\n\nmargin ქმნის სივრცეს ელემენტსა და მის მეზობელ ელემენტებს შორის.\n\n📌 padding vs margin:\n• padding — შიგნით (ჩარჩომდე)\n• margin — გარეთ (სხვა ელემენტებამდე)\n\n📌 მითითების გზები (padding-ის მსგავსი):\n• margin: 20px; → ყველა მხარეს\n• margin: 10px 20px; → ვერტ./ჰორიზ.\n• margin: 0 auto; → ჰორიზონტალურად გაცენტრება!\n\n📝 მაგალითი:\n.box {\n  margin: 20px;\n  margin-bottom: 40px;\n}\n\n💡 margin: 0 auto; — ელემენტს ცენტრში აყენებს!",
    "starterCode": "<style>\n.box1, .box2 {\n  width: 80px; height: 80px;\n  background-color: orange;\n}\n</style>\n\n<div class=\"box1\"></div>\n<div class=\"box2\"></div>",
    "steps": [
      {
        "instruction": "`.box1` კლასს დაუმატე თვისება `margin-bottom: 30px;`.",
        "expectedCode": "<style>\n.box1, .box2 {\n  width: 80px; height: 80px;\n  background-color: orange;\n}\n.box1 { \n  margin-bottom: 30px;\n}\n</style>\n\n<div class=\"box1\"></div>\n<div class=\"box2\"></div>",
        "hint": "ეს შექმნის 30 პიქსელიან სივრცეს პირველ და მეორე ყუთს შორის."
      },
      {
        "instruction": "მოდი, მეორე ყუთიც დავაშოროთ მარცხენა კედლიდან. `.box2`-ს დაუმატე `margin-left: 50px;`.",
        "expectedCode": "<style>\n.box1, .box2 {\n  width: 80px; height: 80px;\n  background-color: orange;\n}\n.box1 { \n  margin-bottom: 30px;\n}\n.box2 { \n  margin-left: 50px;\n}\n</style>\n\n<div class=\"box1\"></div>\n<div class=\"box2\"></div>",
        "hint": "ეს მეორე ყუთს 50 პიქსელით დაძრავს მარჯვნივ."
      }
    ]
  },
  {
    "id": "challenge-4",
    "title": "გამოწვევა: ყუთის მოდელი",
    "description": "ააწყე სრული ყუთი: დაამატე ჩარჩო, შიდა და გარე დაშორება.",
    "type": "challenge",
    "difficulty": "medium",
    "emoji": "🎁",
    "color": "from-teal-400 to-blue-500",
    "xpReward": 20,
    "module": "ყუთის მოდელი",
    "moduleNumber": 8,
    "theory": "📦 ყუთის მოდელის გამოწვევა\n\nგახსოვდეს ყუთის მოდელის 3 თვისება:\n\n🔹 border — ჩარჩო\nborder: 2px solid #333;\n\n🔹 padding — შიდა სივრცე\npadding: 15px;\n\n🔹 margin — გარე სივრცე\nmargin: 20px;\n\n📐 ვიზუალურად:\n[---margin---]\n[  border     ]\n[  [padding]  ]\n[  [ content] ]\n\nგამოიყენე სამივე ერთად ლამაზი ბარათის შესაქმნელად!",
    "challengeHtml": "<div class=\"pretty-box\">მე ვსწავლობ ყუთის მოდელს!</div>",
    "targetCss": ".pretty-box {\n  background-color: #e0f2f1;\n  border: 3px dashed #00796b;\n  padding: 25px;\n  margin: 20px;\n}",
    "starterCss": ".pretty-box {\n  background-color: #e0f2f1;\n  /* დაამატე border, padding და margin */\n}",
    "hints": [
      "`border`-ისთვის მიუთითე `3px dashed #00796b`.",
      "`padding`-ისთვის გამოიყენე `25px`.",
      "`margin`-ისთვის გამოიყენე `20px`."
    ]
  },
  {
    "id": "editor-33",
    "title": "ტექსტის გასწორება: text-align",
    "description": "ისწავლე ტექსტის ჰორიზონტალურად გასწორება: მარცხნივ, მარჯვნივ ან ცენტრში.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "↔️",
    "color": "from-sky-400 to-cyan-400",
    "xpReward": 10,
    "module": "ტექსტი და ტიპოგრაფია",
    "moduleNumber": 9,
    "theory": "📏 text-align — ტექსტის გასწორება\n\ntext-align განსაზღვრავს, როგორ გაესწორება ტექსტი ჰორიზონტალურად.\n\n📌 მნიშვნელობები:\n• left — მარცხნივ (ნაგულისხმევი)\n• center — ცენტრში\n• right — მარჯვნივ\n• justify — ორივე მხარეს გასწორებული\n\n📝 მაგალითი:\nh1 { text-align: center; }\np { text-align: justify; }\n\n💡 text-align მხოლოდ ბლოკ ელემენტებზე მუშაობს (div, p, h1...)\n\n🎯 ხშირად გამოიყენება: სათაურების ცენტრირება, ტექსტის justify",
    "starterCode": "<style>\n.center-me {\n  border: 1px solid gray;\n}\n.right-me {\n  border: 1px solid gray;\n}\n</style>\n\n<p class=\"center-me\">გამასწორე ცენტრში</p>\n<p class=\"right-me\">გამასწორე მარჯვნივ</p>",
    "steps": [
      {
        "instruction": "`.center-me` კლასს დაუმატე `text-align: center;`.",
        "expectedCode": "<style>\n.center-me {\n  border: 1px solid gray;\n  text-align: center;\n}\n.right-me {\n  border: 1px solid gray;\n}\n</style>\n\n<p class=\"center-me\">გამასწორე ცენტრში</p>\n<p class=\"right-me\">გამასწორე მარჯვნივ</p>",
        "hint": "ეს ტექსტს ჰორიზონტალურ ცენტრში მოათავსებს."
      },
      {
        "instruction": "`.right-me` კლასს დაუმატე `text-align: right;`.",
        "expectedCode": "<style>\n.center-me {\n  border: 1px solid gray;\n  text-align: center;\n}\n.right-me {\n  border: 1px solid gray;\n  text-align: right;\n}\n</style>\n\n<p class=\"center-me\">გამასწორე ცენტრში</p>\n<p class=\"right-me\">გამასწორე მარჯვნივ</p>",
        "hint": "ეს ტექსტს მარჯვენა კიდესთან მიიტანს."
      }
    ]
  },
  {
    "id": "editor-34",
    "title": "ტექსტის დეკორაცია",
    "description": "დაამატე ან მოაშორე ტექსტს ხაზები `text-decoration` თვისებით.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "✒️",
    "color": "from-indigo-400 to-purple-500",
    "xpReward": 15,
    "module": "ტექსტი და ტიპოგრაფია",
    "moduleNumber": 9,
    "theory": "✨ text-decoration — ტექსტის დეკორაცია\n\ntext-decoration ამატებს ან აშორებს ხაზებს ტექსტს.\n\n📌 მნიშვნელობები:\n• underline — ქვედა ხაზი (ბმულებს ავტომატურად აქვთ)\n• overline — ზედა ხაზი\n• line-through — გადახაზვა (წაშლილი ტექსტისთვის)\n• none — დეკორაციის მოხსნა\n\n📝 მაგალითი:\na { text-decoration: none; } ← ბმულს ხაზს აშორებს\n.sale { text-decoration: line-through; color: red; }\n\n🎯 ყველაზე ხშირი გამოყენება: ბმულებს ხაზის მოხსნა!\n\na:hover { text-decoration: underline; } ← ჰოვერზე ხაზი ბრუნდება",
    "starterCode": "<style>\n.underline {\n}\n.line-through {\n}\na {\n}\n</style>\n\n<p class=\"underline\">ხაზი გამისვი</p>\n<p class=\"line-through\">ხაზი გადამისვი</p>\n<a href=\"#\">ამ ბმულს მოვაშოროთ ხაზი</a>",
    "steps": [
      {
        "instruction": "`.underline` კლასს დაუმატე `text-decoration: underline;`.",
        "expectedCode": "<style>\n.underline {\n  text-decoration: underline;\n}\n.line-through {\n}\na {\n}\n</style>\n\n<p class=\"underline\">ხაზი გამისვი</p>\n<p class=\"line-through\">ხაზი გადამისვი</p>\n<a href=\"#\">ამ ბმულს მოვაშოროთ ხაზი</a>",
        "hint": "ეს ტექსტს ქვემოდან გაუსვამს ხაზს."
      },
      {
        "instruction": "`.line-through` კლასს დაუმატე `text-decoration: line-through;`.",
        "expectedCode": "<style>\n.underline {\n  text-decoration: underline;\n}\n.line-through {\n  text-decoration: line-through;\n}\na {\n}\n</style>\n\n<p class=\"underline\">ხაზი გამისვი</p>\n<p class=\"line-through\">ხაზი გადამისვი</p>\n<a href=\"#\">ამ ბმულს მოვაშოროთ ხაზი</a>",
        "hint": "ეს ტექსტს გადახაზავს, თითქოს ამოშლილია."
      },
      {
        "instruction": "ბმულებს (`<a>` თეგებს) ბრაუზერი ავტომატურად უსვამს ხაზს. მოვაშოროთ ის `a` სელექტორში `text-decoration: none;`-ის დამატებით.",
        "expectedCode": "<style>\n.underline {\n  text-decoration: underline;\n}\n.line-through {\n  text-decoration: line-through;\n}\na {\n  text-decoration: none;\n}\n</style>\n\n<p class=\"underline\">ხაზი გამისვი</p>\n<p class=\"line-through\">ხაზი გადამისვი</p>\n<a href=\"#\">ამ ბმულს მოვაშოროთ ხაზი</a>",
        "hint": "`none` აქრობს ნებისმიერი სახის დეკორაციას."
      }
    ]
  },
  {
    "id": "editor-35",
    "title": "ტექსტის ტრანსფორმაცია",
    "description": "შეცვალე ტექსტის რეგისტრი (დიდი/პატარა ასოები) `text-transform` თვისებით.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "🔡",
    "color": "from-rose-400 to-fuchsia-500",
    "xpReward": 15,
    "module": "ტექსტი და ტიპოგრაფია",
    "moduleNumber": 9,
    "theory": "🔠 text-transform — ტექსტის ტრანსფორმაცია\n\ntext-transform ცვლის ტექსტის რეგისტრს (დიდი/პატარა ასოები).\n\n📌 მნიშვნელობები:\n• uppercase — ყველა ასო დიდი: HELLO WORLD\n• lowercase — ყველა ასო პატარა: hello world\n• capitalize — ყოველი სიტყვის პირველი ასო დიდი: Hello World\n• none — ცვლილების გარეშე\n\n📝 მაგალითი:\n.title { text-transform: uppercase; }\n.subtitle { text-transform: capitalize; }\n\n💡 ეს მხოლოდ ვიზუალურად ცვლის — HTML-ში ტექსტი იგივე რჩება!",
    "starterCode": "<style>\n.upper { }\n.lower { }\n.capital { }\n</style>\n\n<p class=\"upper\">ეს ტექსტი უნდა დაიწეროს დიდი ასოებით.</p>\n<p class=\"lower\">ეს ტექსტი უნდა დაიწეროს პატარა ასოებით.</p>\n<p class=\"capital\">ეს ტექსტი უნდა დაიწეროს წინადადების სტილით.</p>",
    "steps": [
      {
        "instruction": "`.upper` კლასს დაუმატე `text-transform: uppercase;`.",
        "expectedCode": "<style>\n.upper { text-transform: uppercase; }\n.lower { }\n.capital { }\n</style>\n\n<p class=\"upper\">ეს ტექსტი უნდა დაიწეროს დიდი ასოებით.</p>\n<p class=\"lower\">ეს ტექსტი უნდა დაიწეროს პატარა ასოებით.</p>\n<p class=\"capital\">ეს ტექსტი უნდა დაიწეროს წინადადების სტილით.</p>",
        "hint": "TEXT WILL LOOK LIKE THIS."
      },
      {
        "instruction": "`.lower` კლასს დაუმატე `text-transform: lowercase;`.",
        "expectedCode": "<style>\n.upper { text-transform: uppercase; }\n.lower { text-transform: lowercase; }\n.capital { }\n</style>\n\n<p class=\"upper\">ეს ტექსტი უნდა დაიწეროს დიდი ასოებით.</p>\n<p class=\"lower\">ეს ტექსტი უნდა დაიწეროს პატარა ასოებით.</p>\n<p class=\"capital\">ეს ტექსტი უნდა დაიწეროს წინადადების სტილით.</p>",
        "hint": "text will look like this."
      },
      {
        "instruction": "`.capital` კლასს დაუმატე `text-transform: capitalize;`.",
        "expectedCode": "<style>\n.upper { text-transform: uppercase; }\n.lower { text-transform: lowercase; }\n.capital { text-transform: capitalize; }\n</style>\n\n<p class=\"upper\">ეს ტექსტი უნდა დაიწეროს დიდი ასოებით.</p>\n<p class=\"lower\">ეს ტექსტი უნდა დაიწეროს პატარა ასოებით.</p>\n<p class=\"capital\">ეს ტექსტი უნდა დაიწეროს წინადადების სტილით.</p>",
        "hint": "Text Will Look Like This."
      }
    ]
  },
  {
    "id": "challenge-5",
    "title": "გამოწვევა: სტატიის სათაური",
    "description": "გასტილე საინფორმაციო ბარათის სათაური: გააცენტრე, გახადე დიდი ასოებით და გაზარდე ზომაში.",
    "type": "challenge",
    "difficulty": "medium",
    "emoji": "📰",
    "color": "from-blue-gray-500 to-slate-600",
    "xpReward": 20,
    "module": "ტექსტი და ტიპოგრაფია",
    "moduleNumber": 9,
    "theory": "📰 სტატიის გაფორმების გამოწვევა\n\nგამოიყენე ნასწავლი ტიპოგრაფიის თვისებები:\n\n📌 ხელმისაწვდომი თვისებები:\n• text-align — გასწორება (center, justify)\n• text-decoration — ხაზები (underline, none)\n• text-transform — რეგისტრი (uppercase, capitalize)\n• font-size — ზომა\n• font-family — შრიფტი\n• color — ფერი\n\n🎯 სცადე ყველა ერთად და შექმენი ლამაზი სტატიის სათაური!",
    "challengeHtml": "<div class=\"card\">\n  <h2 class=\"card-title\">მნიშვნელოვანი სიახლეები</h2>\n  <p>დღეს ჩვენ ვისწავლეთ CSS-ის ტიპოგრაფიის თვისებები.</p>\n</div>",
    "targetCss": ".card-title {\n  text-align: center;\n  text-transform: uppercase;\n  font-size: 24px;\n}",
    "starterCss": ".card-title {\n  /* დაამატე 3 თვისება აქ */\n}",
    "hints": [
      "ტექსტის გასაცენტრებლად გამოიყენე `text-align: center;`.",
      "ყველა ასოს გასადიდებლად გამოიყენე `text-transform: uppercase;`.",
      "შრიფტის ზომისთვის გამოიყენე `font-size: 24px;`."
    ]
  },
  {
    "id": "editor-36",
    "title": "HEX ფერები",
    "description": "ისწავლე ფერების მითითება HEX კოდებით.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "#️⃣",
    "color": "from-gray-700 via-gray-900 to-black",
    "xpReward": 15,
    "module": "ფერები და ფონები",
    "moduleNumber": 10,
    "theory": "🎨 HEX ფერები — #RRGGBB\n\nHEX კოდი ფერს 6 სიმბოლოთი გამოხატავს.\n\n📐 სტრუქტურა: #RRGGBB\n• RR — წითელი (00-დან FF-მდე)\n• GG — მწვანე\n• BB — ლურჯი\n\n🔢 მაგალითები:\n• #FF0000 — წითელი (მაქს. წითელი, 0 მწვანე, 0 ლურჯი)\n• #00FF00 — მწვანე\n• #0000FF — ლურჯი\n• #000000 — შავი\n• #FFFFFF — თეთრი\n• #FFD700 — ოქროსფერი\n\n📝 CSS-ში:\nh1 { color: #3366CC; }\n\n💡 შემოკლება: #RGB → #RRGGBB\n#F00 = #FF0000",
    "starterCode": "<style>\nh1 {\n  /* ფერი: `#ff4500` - ნარინჯისფერ-წითელი */\n}\np {\n  /* ფერი: `#1e90ff` - ლურჯი */\n}\n</style>\n\n<h1>ნარინჯისფერი სათაური</h1>\n<p>ლურჯი ტექსტი</p>",
    "steps": [
      {
        "instruction": "`h1` სელექტორში, `color` თვისებას მიანიჭე HEX კოდი `#ff4500`.",
        "expectedCode": "<style>\nh1 {\n  color: #ff4500;\n}\np {\n  /* ფერი: `#1e90ff` - ლურჯი */\n}\n</style>\n\n<h1>ნარინჯისფერი სათაური</h1>\n<p>ლურჯი ტექსტი</p>",
        "hint": "`#ff` (წითელი), `#45` (მწვანე), `#00` (ლურჯი)."
      },
      {
        "instruction": "`p` სელექტორში, `color` თვისებას მიანიჭე HEX კოდი `#1e90ff`.",
        "expectedCode": "<style>\nh1 {\n  color: #ff4500;\n}\np {\n  color: #1e90ff;\n}\n</style>\n\n<h1>ნარინჯისფერი სათაური</h1>\n<p>ლურჯი ტექსტი</p>",
        "hint": "სხვადასხვა კოდი სხვადასხვა ფერს გვაძლევს. ინტერნეტში ბევრი 'Color Picker' ინსტრუმენტია."
      }
    ]
  },
  {
    "id": "editor-37",
    "title": "RGB და RGBA ფერები",
    "description": "ისწავლე ფერების მითითება RGB და RGBA მოდელებით, გამჭვირვალობის ჩათვლით.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "💧",
    "color": "from-blue-500 to-transparent",
    "xpReward": 15,
    "module": "ფერები და ფონები",
    "moduleNumber": 10,
    "theory": "🌈 RGB და RGBA — ფერი რიცხვებით\n\nRGB ფერს 3 რიცხვით გამოხატავს (0-255).\n\n📐 სტრუქტურა:\nrgb(წითელი, მწვანე, ლურჯი)\n\n📝 მაგალითები:\n• rgb(255, 0, 0) — წითელი\n• rgb(0, 128, 0) — მწვანე\n• rgb(0, 0, 255) — ლურჯი\n\n🔮 RGBA — გამჭვირვალობით:\nrgba(255, 0, 0, 0.5) — ნახევრად გამჭვირვალე წითელი\n\n📌 A (alpha) = გამჭვირვალობა:\n• 0 — სრულად გამჭვირვალე\n• 0.5 — ნახევრად\n• 1 — სრულად ხილული\n\n📝 CSS-ში:\n.overlay { background-color: rgba(0, 0, 0, 0.7); }",
    "starterCode": "<style>\n.rgb-box {\n  width: 100px; height: 100px;\n}\n.rgba-box {\n  width: 100px; height: 100px;\n  margin-top: -50px; margin-left: 50px;\n}\n</style>\n\n<div class=\"rgb-box\"></div>\n<div class=\"rgba-box\"></div>",
    "steps": [
      {
        "instruction": "`.rgb-box`-ს დაუმატე `background-color: rgb(220, 20, 60);`.",
        "expectedCode": "<style>\n.rgb-box {\n  width: 100px; height: 100px;\n  background-color: rgb(220, 20, 60);\n}\n.rgba-box {\n  width: 100px; height: 100px;\n  margin-top: -50px; margin-left: 50px;\n}\n</style>\n\n<div class=\"rgb-box\"></div>\n<div class=\"rgba-box\"></div>",
        "hint": "ეს არის ჟოლოსფერი."
      },
      {
        "instruction": "`.rgba-box`-ს დაუმატე `background-color: rgba(60, 179, 113, 0.7);`.",
        "expectedCode": "<style>\n.rgb-box {\n  width: 100px; height: 100px;\n  background-color: rgb(220, 20, 60);\n}\n.rgba-box {\n  width: 100px; height: 100px;\n  margin-top: -50px; margin-left: 50px;\n  background-color: rgba(60, 179, 113, 0.7);\n}\n</style>\n\n<div class=\"rgb-box\"></div>\n<div class=\"rgba-box\"></div>",
        "hint": "ეს არის ზღვისფერი მწვანე, 70%-იანი გაუმჭვირვალობით. შეამჩნიე, როგორ ჩანს მის უკან მოთავსებული წითელი ყუთი."
      }
    ]
  },
  {
    "id": "challenge-6",
    "title": "გამოწვევა: გამჭვირვალე ფონი",
    "description": "შექმენი ტექსტის ბლოკი, რომელსაც აქვს ნახევრად გამჭვირვალე შავი ფონი.",
    "type": "challenge",
    "difficulty": "medium",
    "emoji": "👻",
    "color": "from-white to-gray-500",
    "xpReward": 20,
    "module": "ფერები და ფონები",
    "moduleNumber": 10,
    "theory": "🔮 გამჭვირვალე ფონის გამოწვევა\n\nRGBA ფერით შეგიძლია გამჭვირვალე ფონი შექმნა.\n\n📌 გახსოვდეს:\nrgba(R, G, B, A)\n• R, G, B — 0-დან 255-მდე\n• A — 0-დან 1-მდე (გამჭვირვალობა)\n\n🎯 პრაქტიკული გამოყენება:\n• ტექსტის ფონი სურათზე\n• მოდალური ფანჯრის overlay\n• ჰოვერ ეფექტები\n\nსცადე სხვადასხვა alpha მნიშვნელობა!",
    "challengeHtml": "<div class=\"background-image\" style=\"background: url('https://picsum.photos/id/10/300/150') center/cover; padding: 20px;\">\n  <div class=\"text-overlay\">\n    <h2>გამოსცადე RGBA!</h2>\n  </div>\n</div>",
    "targetCss": ".text-overlay {\n  background-color: rgba(0, 0, 0, 0.5);\n  color: white;\n  padding: 10px;\n}",
    "starterCss": ".text-overlay {\n  /* დაამატე ფონის ფერი, ტექსტის ფერი და padding */\n  color: white;\n  padding: 10px;\n}",
    "hints": [
      "გამოიყენე `background-color`.",
      "მნიშვნელობისთვის გამოიყენე `rgba`.",
      "შავის RGB კოდია `0, 0, 0`.",
      "ნახევრად გამჭვირვალობისთვის ალფა არხი უნდა იყოს `0.5`."
    ]
  },
  {
    "id": "editor-38",
    "title": "ხაზოვანი გრადიენტი",
    "description": "შექმენი ფონი, რომელიც ერთი ფერიდან მეორეში შეუფერხებლად გადადის.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "🌅",
    "color": "from-red-500 to-yellow-500",
    "xpReward": 15,
    "module": "ფერები და ფონები",
    "moduleNumber": 10,
    "theory": "🌈 ხაზოვანი გრადიენტი\n\nlinear-gradient ქმნის ფერების თანდათანობით გადასვლას.\n\n📐 სტრუქტურა:\nbackground: linear-gradient(მიმართულება, ფერი1, ფერი2);\n\n📌 მიმართულებები:\n• to right — მარცხნიდან მარჯვნივ\n• to bottom — ზემოდან ქვემოთ (ნაგულისხმევი)\n• to bottom right — ჩაიხრელა\n• 45deg — 45 გრადუსი\n\n📝 მაგალითი:\n.banner {\n  background: linear-gradient(to right, #667eea, #764ba2);\n}\n\n💡 3+ ფერიც შეგიძლია:\nlinear-gradient(to right, red, yellow, green)",
    "starterCode": "<style>\n.gradient-box {\n  width: 200px;\n  height: 100px;\n  border: 1px solid black;\n}\n</style>\n\n<div class=\"gradient-box\"></div>",
    "steps": [
      {
        "instruction": "`.gradient-box`-ს დაუმატე თვისება `background-image`.",
        "expectedCode": "<style>\n.gradient-box {\n  width: 200px;\n  height: 100px;\n  border: 1px solid black;\n  background-image: \n}\n</style>\n\n<div class=\"gradient-box\"></div>",
        "hint": "მნიშვნელობა იქნება `linear-gradient` ფუნქცია."
      },
      {
        "instruction": "თვისების მნიშვნელობად დაუწერე `linear-gradient(to right, red, yellow);`.",
        "expectedCode": "<style>\n.gradient-box {\n  width: 200px;\n  height: 100px;\n  border: 1px solid black;\n  background-image: linear-gradient(to right, red, yellow);\n}\n</style>\n\n<div class=\"gradient-box\"></div>",
        "hint": "ეს შექმნის გრადიენტს, რომელიც მარცხნიდან (წითელი) მარჯვნივ (ყვითელი) გადადის."
      },
      {
        "instruction": "მოდი, შევცვალოთ მიმართულება. შეცვალე `to right` `45deg`-ით (45 გრადუსი).",
        "expectedCode": "<style>\n.gradient-box {\n  width: 200px;\n  height: 100px;\n  border: 1px solid black;\n  background-image: linear-gradient(45deg, red, yellow);\n}\n</style>\n\n<div class=\"gradient-box\"></div>",
        "hint": "ახლა გრადიენტი დიაგონალზე წავა."
      }
    ]
  },
  {
    "id": "editor-39",
    "title": "Display: block vs inline",
    "description": "გაიგე განსხვავება `block` და `inline` ელემენტებს შორის.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "🧱",
    "color": "from-zinc-400 to-stone-500",
    "xpReward": 15,
    "module": "განლაგების საფუძვლები",
    "moduleNumber": 11,
    "theory": "📐 Display: Block vs Inline\n\nყველა HTML ელემენტი ან 'ბლოკია' ან 'ინლაინი'.\n\n📦 Block ელემენტები:\n• მთელ სიგანეს იკავებენ\n• ახალ ხაზზე იწყებენ\n• მაგ: <div>, <p>, <h1>, <ul>\n\n📏 Inline ელემენტები:\n• მხოლოდ საჭირო სიგანეს იკავებენ\n• იმავე ხაზზე რჩებიან\n• მაგ: <span>, <a>, <strong>, <em>\n\n📝 CSS-ით ცვლა:\n.inline { display: inline; }\n.block { display: block; }\n.hidden { display: none; } ← სრულად იმალება\n\n💡 display: inline-block; — ორივეს აერთიანებს!",
    "starterCode": "<style>\nspan {\n  background-color: yellow;\n}\ndiv {\n  background-color: lightblue;\n}\n</style>\n\n<span>ეს არის inline ელემენტი.</span> <span>მეორე inline ელემენტი.</span>\n<div>ეს არის block ელემენტი.</div> <div>მეორე block ელემენტი.</div>",
    "steps": [
      {
        "instruction": "მოდი, `span` ელემენტს `block` ქცევა მივანიჭოთ. `span` სელექტორს დაუმატე `display: block;`.",
        "expectedCode": "<style>\nspan {\n  background-color: yellow;\n  display: block;\n}\ndiv {\n  background-color: lightblue;\n}\n</style>\n\n<span>ეს არის inline ელემენტი.</span> <span>მეორე inline ელემენტი.</span>\n<div>ეს არის block ელემენტი.</div> <div>მეორე block ელემენტი.</div>",
        "hint": "შეამჩნიე, როგორ დაიწყეს `span` ელემენტებმა ახალი ხაზიდან და დაიკავეს მთელი სიგანე."
      },
      {
        "instruction": "ახლა კი `div` ელემენტები ვაქციოთ `inline`-ად. `div` სელექტორს დაუმატე `display: inline;`.",
        "expectedCode": "<style>\nspan {\n  background-color: yellow;\n  display: block;\n}\ndiv {\n  background-color: lightblue;\n  display: inline;\n}\n</style>\n\n<span>ეს არის inline ელემენტი.</span> <span>მეორე inline ელემენტი.</span>\n<div>ეს არის block ელემენტი.</div> <div>მეორე block ელემენტი.</div>",
        "hint": "ახლა `div` ელემენტები ერთ ხაზზე განლაგდნენ და მხოლოდ საჭირო სიგანე დაიკავეს."
      }
    ]
  },
  {
    "id": "challenge-7",
    "title": "ნავიგაციის მენიუ",
    "description": "გამოიყენე `display: inline-block` თვისება, რომ შექმნა ჰორიზონტალური ნავიგაციის მენიუ.",
    "type": "challenge",
    "difficulty": "medium",
    "emoji": "🧭",
    "color": "from-teal-500 to-cyan-600",
    "xpReward": 20,
    "module": "განლაგების საფუძვლები",
    "moduleNumber": 11,
    "theory": "🧭 ნავიგაციის მენიუს გამოწვევა\n\nინლაინ display-ით შეგიძლია ჰორიზონტალური მენიუ შექმნა.\n\n📌 ტექნიკა:\n1. <ul> სიის სტილის მოხსნა: list-style: none;\n2. <li> ელემენტების ინლაინ გაკეთება: display: inline;\n3. დაშორებების დამატება: padding, margin\n\n📝 მაგალითი:\nnav ul { list-style: none; }\nnav li { display: inline; margin: 0 10px; }\nnav a { text-decoration: none; color: white; }\n\nსცადე ლამაზი ნავიგაციის შექმნა!",
    "challengeHtml": "<nav>\n  <a>მთავარი</a>\n  <a>ჩვენს შესახებ</a>\n  <a>პროექტები</a>\n  <a>კონტაქტი</a>\n</nav>",
    "targetCss": "a {\n  display: inline-block;\n  padding: 10px 15px;\n  background-color: #00897b;\n  color: white;\n  text-decoration: none;\n  margin-right: 5px;\n}",
    "starterCss": "a {\n  /* შენი კოდი აქ */\n  background-color: #00897b;\n  color: white;\n  text-decoration: none;\n}",
    "hints": [
      "ელემენტების ერთ ხაზზე მოსათავსებლად, მაგრამ ზომების გასაკონტროლებლად გამოიყენე `display: inline-block;`.",
      "დაამატე შიდა დაშორება `padding: 10px 15px;` (10px ზემოთ-ქვემოთ, 15px მარცხნივ-მარჯვნივ).",
      "ელემენტებს შორის მანძილისთვის გამოიყენე `margin-right: 5px;`."
    ]
  },
  {
    "id": "editor-40",
    "title": "პოზიციონირება: relative & absolute",
    "description": "ისწავლე ელემენტების ზუსტი განლაგება `position` თვისებით.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "📍",
    "color": "from-rose-500 to-pink-600",
    "xpReward": 20,
    "module": "განლაგების საფუძვლები",
    "moduleNumber": 11,
    "theory": "📍 პოზიციონირება: Relative & Absolute\n\nposition თვისება ცვლის ელემენტის განთავსების წესს.\n\n📌 ძირითადი მნიშვნელობები:\n\n🔹 static — ნაგულისხმევი, ჩვეულებრივი\n🔹 relative — საკუთარ ადგილთან შედარებით იწევს\n🔹 absolute — უახლოეს relative მშობელთან შედარებით\n🔹 fixed — ეკრანზე ფიქსირდება (სქროლისას რჩება)\n\n📝 მაგალითი:\n.parent { position: relative; }\n.child {\n  position: absolute;\n  top: 10px;\n  right: 10px;\n}\n\n💡 absolute ელემენტი 'მიცურავს' — relative მშობელი აუცილებელია!",
    "starterCode": "<style>\n.container {\n  position: relative;\n  width: 200px; height: 150px;\n  background-color: lightblue;\n}\n.box {\n  width: 50px; height: 50px;\n  background-color: tomato;\n}\n</style>\n\n<div class=\"container\">\n  <div class=\"box\"></div>\n</div>",
    "steps": [
      {
        "instruction": "`.box`-ს დაუმატე `position: absolute;`.",
        "expectedCode": "<style>\n.container {\n  position: relative;\n  width: 200px; height: 150px;\n  background-color: lightblue;\n}\n.box {\n  position: absolute;\n  width: 50px; height: 50px;\n  background-color: tomato;\n}\n</style>\n\n<div class=\"container\">\n  <div class=\"box\"></div>\n</div>",
        "hint": "ჯერ-ჯერობით არაფერი შეიცვლება, სანამ კოორდინატებს არ მივუთითებთ."
      },
      {
        "instruction": "ახლა `.box`-ს დაუმატე `top: 20px;` და `right: 30px;`.",
        "expectedCode": "<style>\n.container {\n  position: relative;\n  width: 200px; height: 150px;\n  background-color: lightblue;\n}\n.box {\n  position: absolute;\n  top: 20px;\n  right: 30px;\n  width: 50px; height: 50px;\n  background-color: tomato;\n}\n</style>\n\n<div class=\"container\">\n  <div class=\"box\"></div>\n</div>",
        "hint": "ყუთი დაპოზიციონირდა კონტეინერის ზედა კიდიდან 20px-ით და მარჯვენა კიდიდან 30px-ით."
      }
    ]
  },
  {
    "id": "challenge-8",
    "title": "გამოწვევა: შეტყობინების ღილაკი",
    "description": "შექმენი ღილაკი, რომელსაც კუთხეში აქვს შეტყობინების წითელი წრე.",
    "type": "challenge",
    "difficulty": "medium",
    "emoji": "🔔",
    "color": "from-red-500 to-orange-500",
    "xpReward": 25,
    "module": "განლაგების საფუძვლები",
    "moduleNumber": 11,
    "theory": "🔔 შეტყობინების ღილაკის გამოწვევა\n\nposition: relative + absolute კომბინაციით შეგიძლია ელემენტი სხვას 'მიაკრა'.\n\n📐 მაგალითი — ღილაკი ბეჯით:\n.btn { position: relative; }\n.badge {\n  position: absolute;\n  top: -5px;\n  right: -5px;\n}\n\n💡 absolute ბავშვი relative მშობელში მოთავსდება.\ntop, right, bottom, left — ადგილს განსაზღვრავს.\n\nსცადე ღილაკზე შეტყობინების ბეჯის მიკრება!",
    "challengeHtml": "<button class=\"notification-btn\">\n  შეტყობინებები\n  <span class=\"badge\">3</span>\n</button>",
    "targetCss": ".notification-btn {\n  position: relative;\n  padding: 10px 20px;\n  font-size: 16px;\n}\n.badge {\n  position: absolute;\n  top: -5px;\n  right: -5px;\n  background-color: red;\n  color: white;\n  border-radius: 50%;\n  width: 20px;\n  height: 20px;\n  text-align: center;\n  line-height: 20px;\n}",
    "starterCss": ".notification-btn {\n  /* გახადე ეს კონტეინერი relative */\n  padding: 10px 20px;\n  font-size: 16px;\n}\n.badge {\n  /* გახადე ეს absolute და დააპოზიციონირე */\n  background-color: red;\n  color: white;\n  border-radius: 50%;\n  width: 20px;\n  height: 20px;\n  text-align: center;\n  line-height: 20px; /* ტრიუკი ვერტიკალური ცენტრირებისთვის */\n}",
    "hints": [
      "`.notification-btn`-ს დაუმატე `position: relative;`.",
      "`.badge`-ს დაუმატე `position: absolute;`.",
      "`.badge`-ის პოზიციისთვის გამოიყენე `top: -5px;` და `right: -5px;`."
    ]
  },
  {
    "id": "editor-41",
    "title": "Flexbox-ის შესავალი",
    "description": "დაალაგე ელემენტები მარტივად `display: flex` გამოყენებით.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "🤸",
    "color": "from-green-400 to-cyan-500",
    "xpReward": 10,
    "module": "Flexbox",
    "moduleNumber": 12,
    "theory": "💪 Flexbox — თანამედროვე განლაგება\n\nFlexbox არის CSS-ის ყველაზე მოსახერხებელი განლაგების სისტემა.\n\n📌 როგორ ჩავრთოთ:\n.container { display: flex; }\n\n🎯 Flexbox-ის უპირატესობები:\n• ელემენტების მარტივი გასწორება\n• თანაბარი განაწილება\n• საპასუხო (responsive) დიზაინი\n\n📐 ძირითადი კონცეფცია:\n• Flex container — მშობელი (display: flex)\n• Flex items — შვილები (ავტომატურად ეწყობა)\n\n📝 მაგალითი:\n.nav {\n  display: flex;\n  gap: 10px;\n}\n\nშვილი ელემენტები ჰორიზონტალურად დალაგდება!",
    "starterCode": "<style>\n.container {\n  border: 2px solid #333;\n}\n.item {\n  background-color: gold; padding: 10px; margin: 5px;\n}\n</style>\n\n<div class=\"container\">\n  <div class=\"item\">1</div>\n  <div class=\"item\">2</div>\n  <div class=\"item\">3</div>\n</div>",
    "steps": [
      {
        "instruction": "`.container` კლასს დაუმატე `display: flex;`.",
        "expectedCode": "<style>\n.container {\n  display: flex;\n  border: 2px solid #333;\n}\n.item {\n  background-color: gold; padding: 10px; margin: 5px;\n}\n</style>\n\n<div class=\"container\">\n  <div class=\"item\">1</div>\n  <div class=\"item\">2</div>\n  <div class=\"item\">3</div>\n</div>",
        "hint": "შეამჩნიე, როგორ დალაგდნენ `div` ელემენტები (რომლებიც `block` ტიპის არიან) ერთ ხაზზე."
      }
    ]
  },
  {
    "id": "editor-42",
    "title": "ჰორიზონტალური გასწორება: justify-content",
    "description": "აკონტროლე ელემენტების ჰორიზონტალური განლაგება flex-კონტეინერში.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "↔️",
    "color": "from-blue-400 to-purple-500",
    "xpReward": 15,
    "module": "Flexbox",
    "moduleNumber": 12,
    "theory": "↔️ justify-content — ჰორიზონტალური გასწორება\n\njustify-content არეგულირებს ელემენტების განლაგებას მთავარ ღერძზე.\n\n📌 მნიშვნელობები:\n• flex-start — დასაწყისში (ნაგულისხმევი)\n• flex-end — ბოლოში\n• center — ცენტრში\n• space-between — თანაბარი სივრცე შორის\n• space-around — თანაბარი სივრცე გარშემო\n• space-evenly — ზუსტად თანაბარი\n\n📝 მაგალითი:\n.nav {\n  display: flex;\n  justify-content: space-between;\n}\n\n💡 space-between: პირველი მარცხნივ, ბოლო მარჯვნივ, შუა თანაბრად",
    "starterCode": "<style>\n.container {\n  display: flex;\n  background-color: lightgray; height: 50px;\n}\n.item { background-color: dodgerblue; width: 30px; }\n</style>\n\n<div class=\"container\">\n  <div class=\"item\"></div>\n  <div class=\"item\"></div>\n  <div class=\"item\"></div>\n</div>",
    "steps": [
      {
        "instruction": "`.container`-ს დაუმატე `justify-content: center;`.",
        "expectedCode": "<style>\n.container {\n  display: flex;\n  justify-content: center;\n  background-color: lightgray; height: 50px;\n}\n.item { background-color: dodgerblue; width: 30px; }\n</style>\n\n<div class=\"container\">\n  <div class=\"item\"></div>\n  <div class=\"item\"></div>\n  <div class=\"item\"></div>\n</div>",
        "hint": "ყველა ელემენტი ერთად მოგროვდა ცენტრში."
      },
      {
        "instruction": "ახლა შეცვალე `center` `space-between`-ით.",
        "expectedCode": "<style>\n.container {\n  display: flex;\n  justify-content: space-between;\n  background-color: lightgray; height: 50px;\n}\n.item { background-color: dodgerblue; width: 30px; }\n</style>\n\n<div class=\"container\">\n  <div class=\"item\"></div>\n  <div class=\"item\"></div>\n  <div class=\"item\"></div>\n</div>",
        "hint": "პირველი ელემენტი მარცხენა კიდეზეა, ბოლო - მარჯვენაზე, დანარჩენი კი მათ შორის თანაბრად გადანაწილდა."
      }
    ]
  },
  {
    "id": "editor-43",
    "title": "ვერტიკალური გასწორება: align-items",
    "description": "აკონტროლე ელემენტების ვერტიკალური განლაგება flex-კონტეინერში.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "↕️",
    "color": "from-amber-400 to-red-500",
    "xpReward": 15,
    "module": "Flexbox",
    "moduleNumber": 12,
    "theory": "↕️ align-items — ვერტიკალური გასწორება\n\nalign-items ელემენტებს ვერტიკალურად ასწორებს.\n\n📌 მნიშვნელობები:\n• stretch — გაწელვა (ნაგულისხმევი)\n• flex-start — ზემოთ\n• flex-end — ქვემოთ\n• center — ცენტრში ვერტიკალურად\n• baseline — ტექსტის ხაზზე\n\n🎯 ცენტრში მოთავსება (ყველაზე ხშირი):\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n}\n\n💡 ეს 3 ხაზი ნებისმიერ ელემენტს ზუსტად ცენტრში მოათავსებს!",
    "starterCode": "<style>\n.container {\n  display: flex;\n  justify-content: center;\n  background-color: lightgray; height: 100px;\n}\n.item { background-color: dodgerblue; width: 30px; }\n</style>\n\n<div class=\"container\">\n  <div class=\"item\" style=\"height: 30px;\"></div>\n  <div class=\"item\" style=\"height: 50px;\"></div>\n  <div class=\"item\" style=\"height: 20px;\"></div>\n</div>",
    "steps": [
      {
        "instruction": "`.container`-ს დაუმატე `align-items: center;`.",
        "expectedCode": "<style>\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  background-color: lightgray; height: 100px;\n}\n.item { background-color: dodgerblue; width: 30px; }\n</style>\n\n<div class=\"container\">\n  <div class=\"item\" style=\"height: 30px;\"></div>\n  <div class=\"item\" style=\"height: 50px;\"></div>\n  <div class=\"item\" style=\"height: 20px;\"></div>\n</div>",
        "hint": "ყველა ელემენტი ვერტიკალურ ცენტრში გასწორდა."
      }
    ]
  },
  {
    "id": "challenge-9",
    "title": "გამოწვევა: ცენტრში მოთავსება",
    "description": "გამოიყენე Flexbox, რათა ელემენტი მოათავსო მშობლის ცენტრში, როგორც ჰორიზონტალურად, ასევე ვერტიკალურად.",
    "type": "challenge",
    "difficulty": "medium",
    "emoji": "🎯",
    "color": "from-emerald-400 to-lime-500",
    "xpReward": 25,
    "module": "Flexbox",
    "moduleNumber": 12,
    "theory": "🎯 ცენტრში მოთავსების გამოწვევა\n\nFlexbox-ით ელემენტის ცენტრში მოთავსება ძალიან მარტივია!\n\n📌 'ოქროს' კომბინაცია:\n.center {\n  display: flex;\n  justify-content: center;  /* ჰორიზონტალურად */\n  align-items: center;      /* ვერტიკალურად */\n  height: 100vh;            /* სრული სიმაღლე */\n}\n\n🎯 ეს CSS-ის ყველაზე გავრცელებული 'ტრიუკია' — ისწავლე კარგად!",
    "challengeHtml": "<div class=\"parent\">\n  <div class=\"child\"></div>\n</div>",
    "targetCss": ".parent {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}",
    "starterCss": "/* ეს CSS მხოლოდ ვიზუალისთვისაა, არ შეცვალო */\n.parent {\n  width: 200px; height: 150px;\n  background-color: #eee;\n}\n.child {\n  width: 50px; height: 50px;\n  background-color: crimson;\n}\n\n/* შეავსე `.parent` კლასი ქვემოთ */\n.parent {\n\n}",
    "hints": [
      "მშობელი გახადე flex-კონტეინერი: `display: flex;`.",
      "ჰორიზონტალური ცენტრირებისთვის გამოიყენე `justify-content: center;`.",
      "ვერტიკალური ცენტრირებისთვის გამოიყენე `align-items: center;`."
    ]
  },
  {
    "id": "editor-44",
    "title": "Grid-ის შესავალი",
    "description": "შექმენი ბადე (Grid) `display: grid`-ით და განსაზღვრე სვეტები და რიგები.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "▦",
    "color": "from-violet-500 to-fuchsia-600",
    "xpReward": 20,
    "module": "CSS Grid",
    "moduleNumber": 13,
    "theory": "🏁 CSS Grid — ბადე\n\nGrid არის 2D განლაგების სისტემა — სტრიქონებად და სვეტებად.\n\n📌 Flexbox vs Grid:\n• Flexbox — 1 განზომილება (ხაზი)\n• Grid — 2 განზომილება (ბადე)\n\n📐 როგორ ჩავრთოთ:\n.container {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr; /* 3 თანაბარი სვეტი */\n  gap: 10px;\n}\n\n🔢 ერთეული 'fr' = fraction (წილი):\n• 1fr 1fr → 2 თანაბარი სვეტი\n• 1fr 2fr → მეორე 2-ჯერ ფართო\n\n📝 repeat() ფუნქცია:\ngrid-template-columns: repeat(3, 1fr); ← 3 თანაბარი",
    "starterCode": "<style>\n.container {\n  border: 2px solid #333;\n}\n.item { background-color: #ffc107; padding: 20px; text-align: center; }\n</style>\n\n<div class=\"container\">\n  <div class=\"item\">1</div> <div class=\"item\">2</div>\n  <div class=\"item\">3</div> <div class=\"item\">4</div>\n</div>",
    "steps": [
      {
        "instruction": "`.container`-ს დაუმატე `display: grid;`.",
        "expectedCode": "<style>\n.container {\n  display: grid;\n  border: 2px solid #333;\n}\n.item { background-color: #ffc107; padding: 20px; text-align: center; }\n</style>\n\n<div class=\"container\">\n  <div class=\"item\">1</div> <div class=\"item\">2</div>\n  <div class=\"item\">3</div> <div class=\"item\">4</div>\n</div>",
        "hint": "ამ ეტაპზე ვიზუალურად არაფერი იცვლება. ახლა უნდა განვსაზღვროთ სვეტები."
      },
      {
        "instruction": "დაამატე `grid-template-columns: 100px 100px;`. ეს შექმნის ორ, 100-პიქსელიან სვეტს.",
        "expectedCode": "<style>\n.container {\n  display: grid;\n  grid-template-columns: 100px 100px;\n  border: 2px solid #333;\n}\n.item { background-color: #ffc107; padding: 20px; text-align: center; }\n</style>\n\n<div class=\"container\">\n  <div class=\"item\">1</div> <div class=\"item\">2</div>\n  <div class=\"item\">3</div> <div class=\"item\">4</div>\n</div>",
        "hint": "ახლა ელემენტები ორ-სვეტიან ბადეში ჩალაგდნენ."
      },
      {
        "instruction": "გამოვიყენოთ `fr` ერთეული. შეცვალე `100px 100px` `1fr 1fr`-ით.",
        "expectedCode": "<style>\n.container {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  border: 2px solid #333;\n}\n.item { background-color: #ffc107; padding: 20px; text-align: center; }\n</style>\n\n<div class=\"container\">\n  <div class=\"item\">1</div> <div class=\"item\">2</div>\n  <div class=\"item\">3</div> <div class=\"item\">4</div>\n</div>",
        "hint": "`fr` (fraction) ნიშნავს 'ნაწილს'. `1fr 1fr` ქმნის ორ, თანაბარი სიგანის სვეტს, რომლებიც იკავებენ მთელ ხელმისაწვდომ სივრცეს."
      }
    ]
  },
  {
    "id": "challenge-10",
    "title": "გამოწვევა: ფოტო გალერეა",
    "description": "შექმენი 3-სვეტიანი ფოტო გალერეის განლაგება Grid-ის გამოყენებით.",
    "type": "challenge",
    "difficulty": "medium",
    "emoji": "🖼️",
    "color": "from-stone-500 to-amber-600",
    "xpReward": 25,
    "module": "CSS Grid",
    "moduleNumber": 13,
    "theory": "📸 ფოტო გალერეის გამოწვევა\n\nGrid-ით ლამაზი გალერეა მარტივად კეთდება!\n\n📌 ტექნიკა:\n.gallery {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 10px;\n}\n\n💡 საპასუხოდ:\ngrid-template-columns: repeat(auto-fill, minmax(200px, 1fr));\n\nეს ავტომატურად მოარგებს სვეტების რაოდენობას ეკრანის ზომას!",
    "challengeHtml": "<div class=\"gallery\">\n  <div class=\"photo\">1</div> <div class=\"photo\">2</div> <div class=\"photo\">3</div>\n  <div class=\"photo\">4</div> <div class=\"photo\">5</div> <div class=\"photo\">6</div>\n</div>",
    "targetCss": ".gallery {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 10px;\n}",
    "starterCss": "/* ვიზუალი, არ შეცვალო */\n.photo { background-color: #a1887f; height: 80px; color: white; display: grid; place-items: center; }\n\n.gallery {\n  /* შენი Grid-ის კოდი აქ */\n}",
    "hints": [
      "გალერეა გახადე grid-კონტეინერი: `display: grid;`.",
      "3 თანაბარი სვეტის შესაქმნელად გამოიყენე `grid-template-columns: 1fr 1fr 1fr;` ან უფრო მარტივად `repeat(3, 1fr);`.",
      "ელემენტებს შორის დაშორებისთვის გამოიყენე `gap: 10px;`."
    ]
  },
  {
    "id": "editor-45",
    "title": "Responsiveness-ის შესავალი",
    "description": "გაიგე, რა არის საპასუხო (Responsive) დიზაინი და როგორ გამოვიყენოთ viewport მეტა თეგი.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "📱",
    "color": "from-teal-300 to-sky-400",
    "xpReward": 10,
    "module": "საპასუხო დიზაინი",
    "moduleNumber": 14,
    "theory": "📱 Responsive Design — საპასუხო დიზაინი\n\nსაპასუხო დიზაინი ნიშნავს, რომ გვერდი ყველა ეკრანზე კარგად გამოიყურება.\n\n📌 3 ძირითადი პრინციპი:\n1. მოქნილი ზომები (%, em, vw/vh)\n2. მოქნილი სურათები (max-width: 100%)\n3. მედია მიმართვები (@media)\n\n📏 ზომის ერთეულები:\n• % — მშობლის პროცენტი\n• vw — viewport სიგანის პროცენტი\n• vh — viewport სიმაღლის პროცენტი\n\n📝 მაგალითი:\nimg { max-width: 100%; height: auto; }\n\n💡 ეს სურათს არასოდეს გაუშვებს კონტეინერს გარეთ!",
    "starterCode": "<head>\n  <title>Responsive</title>\n</head>",
    "steps": [
      {
        "instruction": "`<head>` სექციაში დაამატე viewport მეტა თეგი: `<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">`",
        "expectedCode": "<head>\n  <title>Responsive</title>\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n</head>",
        "hint": "ეს სტანდარტული კოდია, რომელიც თითქმის ყველა თანამედროვე ვებ-გვერდს სჭირდება. ის ეუბნება ბრაუზერს, რომ გვერდის სიგანე მოარგოს მოწყობილობის ეკრანის სიგანეს."
      }
    ]
  },
  {
    "id": "editor-46",
    "title": "მედია მიმართვები (Media Queries)",
    "description": "ისწავლე როგორ შეცვალო სტილები ეკრანის ზომის მიხედვით `@media` წესის გამოყენებით.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "📏",
    "color": "from-blue-400 to-emerald-500",
    "xpReward": 20,
    "module": "საპასუხო დიზაინი",
    "moduleNumber": 14,
    "theory": "📲 Media Queries — მედია მიმართვები\n\n@media წესი CSS-ს ცვლის ეკრანის ზომის მიხედვით.\n\n📐 სტრუქტურა:\n@media (max-width: 768px) {\n  /* ეს სტილები მუშაობს მხოლოდ 768px-ზე ვიწრო ეკრანზე */\n}\n\n📌 ძირითადი breakpoint-ები:\n• 480px — ტელეფონი\n• 768px — ტაბლეტი\n• 1024px — ლეპტოპი\n• 1200px — მონიტორი\n\n📝 მაგალითი:\n.container { display: flex; }\n@media (max-width: 768px) {\n  .container { flex-direction: column; }\n}\n\n💡 მობილურზე სვეტებად, დესკტოპზე ხაზად!",
    "starterCode": "<style>\nbody {\n  background-color: lightgreen;\n}\n</style>\n\n<h1>შეცვალე ბრაუზერის ზომა</h1>",
    "steps": [
      {
        "instruction": "არსებული სტილის შემდეგ დაამატე `@media` წესი: `@media (max-width: 600px) { ... }`",
        "expectedCode": "<style>\nbody {\n  background-color: lightgreen;\n}\n\n@media (max-width: 600px) {\n\n}\n</style>\n\n<h1>შეცვალე ბრაუზერის ზომა</h1>",
        "hint": "ამ ბლოკში დაწერილი კოდი იმუშავებს მხოლოდ მაშინ, როცა ეკრანის სიგანე 600px-ზე ნაკლები ან ტოლია."
      },
      {
        "instruction": "`@media` ბლოკის შიგნით, დაამატე წესი, რომელიც `body`-ს ფონს შეუცვლის `lightblue`-ზე.",
        "expectedCode": "<style>\nbody {\n  background-color: lightgreen;\n}\n\n@media (max-width: 600px) {\n  body {\n    background-color: lightblue;\n  }\n}\n</style>\n\n<h1>შეცვალე ბრაუზერის ზომა</h1>",
        "hint": "დააპატარავე ბრაუზერის ფანჯარა და ნახე, როგორ შეიცვლება ფონის ფერი, როდესაც სიგანე 600px-ს ჩამოსცდება."
      }
    ]
  },
  {
    "id": "challenge-11",
    "title": "გამოწვევა: საპასუხო სვეტები",
    "description": "შექმენი Flexbox განლაგება, რომელიც დიდ ეკრანზე ორ სვეტს აჩვენებს, ხოლო პატარაზე - ერთს.",
    "type": "challenge",
    "difficulty": "medium",
    "emoji": "🔄",
    "color": "from-fuchsia-500 to-cyan-500",
    "xpReward": 25,
    "module": "საპასუხო დიზაინი",
    "moduleNumber": 14,
    "theory": "📱 საპასუხო სვეტების გამოწვევა\n\n@media-თი ელემენტები სხვადასხვა ზომაზე სხვადასხვანაირად ალაგებ.\n\n📌 ტექნიკა:\n1. დესკტოპზე: display: flex; (ჰორიზონტალურად)\n2. მობილურზე: flex-direction: column; (ვერტიკალურად)\n\n📝 მაგალითი:\n.cols { display: flex; gap: 20px; }\n@media (max-width: 600px) {\n  .cols { flex-direction: column; }\n}\n\nსცადე სხვადასხვა breakpoint!",
    "challengeHtml": "<div class=\"container\">\n  <div class=\"column\">სვეტი 1</div>\n  <div class=\"column\">სვეტი 2</div>\n</div>",
    "targetCss": ".container {\n  display: flex;\n  flex-direction: column; /* Mobile first: სვეტები ერთმანეთის ქვეშ */\n}\n\n/* 768px-ზე დიდ ეკრანებზე: */\n@media (min-width: 768px) {\n  .container {\n    flex-direction: row; /* გადავაწყოთ რიგში */\n  }\n}",
    "starterCss": "/* ვიზუალი, არ შეცვალო */\n.column { background: #b2dfdb; padding: 20px; margin: 10px; flex: 1; }\n\n/* Mobile-first სტილები */\n.container {\n  display: flex;\n  flex-direction: column;\n}\n\n/* დაამატე media query დიდი ეკრანებისთვის */\n",
    "hints": [
      "დაამატე `@media (min-width: 768px) { ... }`.",
      "ამ media query-ს შიგნით, მიმართე `.container` კლასს.",
      "შეუცვალე მას `flex-direction` თვისება `row`-ზე."
    ]
  },
  {
    "id": "editor-47",
    "title": "CSS გადასვლები: Transition",
    "description": "ისწავლე, როგორ გახადო სტილის ცვლილებები გლუვი და ანიმაციური `transition`-ით.",
    "type": "editor",
    "difficulty": "easy",
    "emoji": "🪄",
    "color": "from-yellow-400 to-orange-500",
    "xpReward": 15,
    "module": "გადასვლები და ანიმაციები",
    "moduleNumber": 15,
    "theory": "🎭 CSS Transition — გლუვი გადასვლა\n\ntransition თვისება ანიმაციას ამატებს CSS ცვლილებებს.\n\n📐 სტრუქტურა:\ntransition: თვისება ხანგრძლივობა ეფექტი;\n\n📝 მაგალითი:\n.btn {\n  background: blue;\n  transition: background 0.3s ease;\n}\n.btn:hover {\n  background: red;\n}\n\n📌 ეფექტის ტიპები:\n• ease — ნელა-სწრაფად-ნელა\n• linear — თანაბარი სიჩქარით\n• ease-in — ნელა იწყება\n• ease-out — ნელა მთავრდება\n\n💡 transition: all 0.3s ease; — ყველა თვისებას ანიმაციას უკეთებს!",
    "starterCode": "<style>\n.button {\n  background-color: dodgerblue;\n  color: white;\n  padding: 15px 25px;\n  border: none;\n  font-size: 18px;\n}\n\n.button:hover {\n  background-color: crimson;\n}\n</style>\n\n<button class=\"button\">დამაჭირე</button>",
    "steps": [
      {
        "instruction": "`.button` კლასს დაუმატე `transition: background-color 0.4s;`.",
        "expectedCode": "<style>\n.button {\n  background-color: dodgerblue;\n  color: white;\n  padding: 15px 25px;\n  border: none;\n  font-size: 18px;\n  transition: background-color 0.4s;\n}\n\n.button:hover {\n  background-color: crimson;\n}\n</style>\n\n<button class=\"button\">დამაჭირე</button>",
        "hint": "ახლა, როდესაც ღილაკზე მაუსს გადაატარებ, ფონის ფერი შეიცვლება არა მომენტალურად, არამედ 0.4 წამის განმავლობაში. `transition` ყოველთვის იწერება საწყის მდგომარეობაში და არა `:hover`-ში."
      }
    ]
  },
  {
    "id": "editor-48",
    "title": "CSS ტრანსფორმაციები: Transform",
    "description": "ისწავლე ელემენტების გადაადგილება, დატრიალება და მასშტაბირება `transform` თვისებით.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "🤸‍♀️",
    "color": "from-teal-400 to-green-500",
    "xpReward": 20,
    "module": "გადასვლები და ანიმაციები",
    "moduleNumber": 15,
    "theory": "🔄 CSS Transform — ტრანსფორმაცია\n\ntransform ცვლის ელემენტის ფორმას, ზომას, პოზიციას ან ბრუნვას.\n\n📌 ძირითადი ფუნქციები:\n• rotate(45deg) — ბრუნვა 45 გრადუსით\n• scale(1.5) — 1.5-ჯერ გადიდება\n• translateX(20px) — 20px მარჯვნივ გადაწევა\n• translateY(-10px) — 10px ზემოთ\n• skew(10deg) — დახრა\n\n📝 მაგალითი:\n.card:hover {\n  transform: scale(1.05);\n  transition: transform 0.3s ease;\n}\n\n💡 ეს ჰოვერზე ბარათს ოდნავ გაადიდებს — ძალიან ლამაზი ეფექტია!",
    "starterCode": "<style>\n.box {\n  width: 80px; height: 80px;\n  background-color: rebeccapurple;\n  margin: 50px;\n  transition: transform 0.5s;\n}\n.box:hover {\n\n}\n</style>\n\n<div class=\"box\"></div>",
    "steps": [
      {
        "instruction": "`.box:hover`-ში დაამატე `transform: rotate(45deg);`.",
        "expectedCode": "<style>\n.box {\n  width: 80px; height: 80px;\n  background-color: rebeccapurple;\n  margin: 50px;\n  transition: transform 0.5s;\n}\n.box:hover {\n  transform: rotate(45deg);\n}\n</style>\n\n<div class=\"box\"></div>",
        "hint": "მაუსის გადატარებისას, ყუთი 45 გრადუსით შემობრუნდება."
      },
      {
        "instruction": "მოდი, ერთდროულად დავატრიალოთ და გავადიდოთ. შეცვალე `rotate(45deg)` `rotate(45deg) scale(1.2)`-ით.",
        "expectedCode": "<style>\n.box {\n  width: 80px; height: 80px;\n  background-color: rebeccapurple;\n  margin: 50px;\n  transition: transform 0.5s;\n}\n.box:hover {\n  transform: rotate(45deg) scale(1.2);\n}\n</style>\n\n<div class=\"box\"></div>",
        "hint": "რამდენიმე ტრანსფორმაციის ფუნქციის გამოყენებისას, ისინი ერთ `transform` თვისებაში იწერება, ერთმანეთის მიყოლებით."
      }
    ]
  },
  {
    "id": "challenge-12",
    "title": "გამოწვევა: მბრუნავი ბარათი",
    "description": "შექმენი ბარათი, რომელიც მაუსის გადატარებისას ოდნავ ზემოთ იწევა და ბრუნავს.",
    "type": "challenge",
    "difficulty": "medium",
    "emoji": "🃏",
    "color": "from-gray-700 to-gray-900",
    "xpReward": 25,
    "module": "გადასვლები და ანიმაციები",
    "moduleNumber": 15,
    "theory": "🃏 მბრუნავი ბარათის გამოწვევა\n\ntransform + transition კომბინაციით ბარათს ბრუნვის ეფექტი გაუკეთე.\n\n📌 ტექნიკა:\n.card {\n  transition: transform 0.6s;\n}\n.card:hover {\n  transform: rotateY(180deg);\n}\n\n💡 perspective დაამატე მშობელს 3D ეფექტისთვის:\n.container { perspective: 1000px; }\n\nსცადე სხვადასხვა ბრუნვის ღერძი: rotateX, rotateY, rotateZ",
    "challengeHtml": "<div class=\"card\">Hover Me</div>",
    "targetCss": ".card {\n  transition: transform 0.3s ease-in-out;\n}\n.card:hover {\n  transform: translateY(-10px) rotate(-3deg);\n}",
    "starterCss": "/* ვიზუალი, არ შეცვალო */\n.card {\n  width: 150px; height: 200px; background: white;\n  border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);\n  display: grid; place-items: center; font-size: 20px;\n}\n\n/* შეავსე ეს კლასები */\n.card {\n  \n}\n.card:hover {\n\n}",
    "hints": [
      "საწყის `.card` კლასს დაუმატე `transition: transform 0.3s ease-in-out;`.",
      "`.card:hover` კლასში გამოიყენე `transform` თვისება.",
      "ტრანსფორმაციისთვის გამოიყენე `translateY(-10px)` და `rotate(-3deg)` ერთად."
    ]
  },
  {
    "id": "editor-49",
    "title": "ანიმაცია: @keyframes",
    "description": "ისწავლე, როგორ შექმნა უფრო რთული ანიმაციები `@keyframes` წესის გამოყენებით.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "🎬",
    "color": "from-red-500 via-purple-500 to-blue-500",
    "xpReward": 20,
    "module": "გადასვლები და ანიმაციები",
    "moduleNumber": 15,
    "theory": "🎬 @keyframes — ანიმაცია\n\n@keyframes-ით რთულ, მრავალეტაპიან ანიმაციებს ქმნი.\n\n📐 სტრუქტურა:\n@keyframes სახელი {\n  from { /* საწყისი */ }\n  to { /* საბოლოო */ }\n}\n\n📌 ან პროცენტებით:\n@keyframes bounce {\n  0% { transform: translateY(0); }\n  50% { transform: translateY(-20px); }\n  100% { transform: translateY(0); }\n}\n\n📝 გამოყენება:\n.ball {\n  animation: bounce 1s ease infinite;\n}\n\n💡 animation თვისება:\nanimation: სახელი ხანგრძლივობა ეფექტი გამეორება;",
    "starterCode": "<style>\n.box {\n  width: 100px; height: 100px;\n  background-color: skyblue;\n  position: relative;\n}\n</style>\n\n<div class=\"box\"></div>",
    "steps": [
      {
        "instruction": "შექმენი `@keyframes` წესი სახელით `move-right`.",
        "expectedCode": "<style>\n.box {\n  width: 100px; height: 100px;\n  background-color: skyblue;\n  position: relative;\n}\n\n@keyframes move-right {\n  from { left: 0; }\n  to { left: 200px; }\n}\n</style>\n\n<div class=\"box\"></div>",
        "hint": "ანიმაცია დაიწყება `left: 0`-დან და დასრულდება `left: 200px`-ზე."
      },
      {
        "instruction": "ახლა, `.box` კლასს დაუმატე `animation` თვისება, რომ ეს ანიმაცია გამოიყენო: `animation: move-right 2s;`.",
        "expectedCode": "<style>\n.box {\n  width: 100px; height: 100px;\n  background-color: skyblue;\n  position: relative;\n  animation: move-right 2s;\n}\n\n@keyframes move-right {\n  from { left: 0; }\n  to { left: 200px; }\n}\n</style>\n\n<div class=\"box\"></div>",
        "hint": "ეს ეუბნება `.box`-ს, რომ გამოიყენოს `move-right` ანიმაცია, რომელიც 2 წამს გაგრძელდება."
      }
    ]
  },
  {
    "id": "challenge-13",
    "title": "გამოწვევა: მოციმციმე ვარსკვლავი",
    "description": "შექმენი ანიმაცია, რომელიც ელემენტს უსასრულოდ ადიდებს, აპატარავებს და ფერს უცვლის.",
    "type": "challenge",
    "difficulty": "medium",
    "emoji": "🌟",
    "color": "from-yellow-300 to-orange-400",
    "xpReward": 25,
    "module": "გადასვლები და ანიმაციები",
    "moduleNumber": 15,
    "theory": "⭐ მოციმციმე ვარსკვლავის გამოწვევა\n\n@keyframes-ით შექმენი მოციმციმე ეფექტი.\n\n📌 ტექნიკა:\n@keyframes twinkle {\n  0%, 100% { opacity: 1; transform: scale(1); }\n  50% { opacity: 0.5; transform: scale(0.8); }\n}\n\n.star {\n  animation: twinkle 2s ease-in-out infinite;\n}\n\n💡 opacity ცვლის გამჭვირვალობას\nscale ცვლის ზომას\n\nკომბინაციით ლამაზი ციმციმის ეფექტი მიიღება!",
    "challengeHtml": "<div class=\"star\"></div>",
    "targetCss": "@keyframes-pulse {\n  0% { transform: scale(1); background-color: yellow; }\n  50% { transform: scale(1.2); background-color: gold; }\n  100% { transform: scale(1); background-color: yellow; }\n}\n.star {\n  animation: pulse 2s infinite;\n}",
    "starterCss": "/* ვიზუალი */\n.star { width: 50px; height: 50px; background-color: yellow; clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); }\n\n/* შექმენი @keyframes */\n\n\n/* მიანიჭე ანიმაცია .star კლასს */\n.star {\n\n}",
    "hints": [
      "შექმენი `@keyframes pulse { ... }`.",
      "შიგნით აღწერე 0%, 50% და 100% ეტაპები `transform: scale()` და `background-color` თვისებებით.",
      "`.star` კლასს დაუმატე `animation: pulse 2s infinite;`."
    ]
  },
  {
    "id": "editor-50",
    "title": "ფსევდო-კლასები: :nth-child",
    "description": "ისწავლე როგორ მიმართო სიის ყოველ მეორე, მესამე ან კონკრეტულ ელემენტს.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "🦓",
    "color": "from-gray-400 to-gray-600",
    "xpReward": 20,
    "module": "გაფართოებული სელექტორები",
    "moduleNumber": 16,
    "theory": "🎯 :nth-child — ბავშვების შერჩევა\n\n:nth-child() ფსევდო-კლასი შესაძლებლობას გაძლევს ელემენტები რიგის მიხედვით შეარჩიო.\n\n📌 მაგალითები:\n• :nth-child(2) — მე-2 ელემენტი\n• :nth-child(odd) — კენტი (1, 3, 5...)\n• :nth-child(even) — ლუწი (2, 4, 6...)\n• :nth-child(3n) — ყოველი მე-3 (3, 6, 9...)\n\n📝 მაგალითი:\ntr:nth-child(even) {\n  background: #f5f5f5;\n}\n\n💡 ეს ცხრილის ლუწ სტრიქონებს ფონს უცვლის — 'ზებრის' ეფექტი!\n\n🎯 ასევე: :first-child, :last-child",
    "starterCode": "<style>\nli {\n  padding: 5px;\n}\n</style>\n\n<ul>\n  <li>ერთი</li> <li>ორი</li> <li>სამი</li>\n  <li>ოთხი</li> <li>ხუთი</li> <li>ექვსი</li>\n</ul>",
    "steps": [
      {
        "instruction": "გავაფერადოთ ლუწი ელემენტები. დაამატე სელექტორი `li:nth-child(even)` და მიანიჭე მას `background-color: #f2f2f2;`.",
        "expectedCode": "<style>\nli {\n  padding: 5px;\n}\nli:nth-child(even) {\n  background-color: #f2f2f2;\n}\n</style>\n\n<ul>\n  <li>ერთი</li> <li>ორი</li> <li>სამი</li>\n  <li>ოთხი</li> <li>ხუთი</li> <li>ექვსი</li>\n</ul>",
        "hint": "ეს შექმნის 'ზებრას' ეფექტს, რაც სიების კითხვას აადვილებს."
      },
      {
        "instruction": "ახლა, გავამუქოთ მესამე ელემენტი. დაამატე სელექტორი `li:nth-child(3)` და მიანიჭე `font-weight: bold;`.",
        "expectedCode": "<style>\nli {\n  padding: 5px;\n}\nli:nth-child(even) {\n  background-color: #f2f2f2;\n}\nli:nth-child(3) {\n  font-weight: bold;\n}\n</style>\n\n<ul>\n  <li>ერთი</li> <li>ორი</li> <li>სამი</li>\n  <li>ოთხი</li> <li>ხუთი</li> <li>ექვსი</li>\n</ul>",
        "hint": "შეგიძლია მიუთითო ნებისმიერი რიცხვი, რომ კონკრეტული ელემენტი აირჩიო."
      }
    ]
  },
  {
    "id": "editor-51",
    "title": "ფსევდო-ელემენტები: ::before და ::after",
    "description": "ისწავლე როგორ დაამატო კონტენტი ელემენტის წინ ან შემდეგ CSS-იდან.",
    "type": "editor",
    "difficulty": "medium",
    "emoji": "✨",
    "color": "from-purple-400 to-pink-500",
    "xpReward": 20,
    "module": "გაფართოებული სელექტორები",
    "moduleNumber": 16,
    "theory": "✨ ::before და ::after — ფსევდო-ელემენტები\n\nფსევდო-ელემენტები შიგთავსს ამატებენ CSS-იდან, HTML-ის შეცვლის გარეშე.\n\n📌 ორი ძირითადი:\n• ::before — ელემენტის წინ ამატებს\n• ::after — ელემენტის შემდეგ ამატებს\n\n⚠️ content თვისება აუცილებელია!\n\n📝 მაგალითი:\n.quote::before {\n  content: '❝';\n  font-size: 2em;\n  color: gold;\n}\n\n.link::after {\n  content: ' →';\n}\n\n💡 content: ''; — ცარიელიც შეიძლება, დეკორატიული ელემენტებისთვის",
    "starterCode": "<style>\na {\n  text-decoration: none;\n  color: #0288d1;\n}\n</style>\n\n<a href=\"#\">ბმული</a>",
    "steps": [
      {
        "instruction": "დავუმატოთ ბმულს ემოჯი მის შემდეგ. შექმენი სელექტორი `a::after`.",
        "expectedCode": "<style>\na {\n  text-decoration: none;\n  color: #0288d1;\n}\na::after {\n\n}\n</style>\n\n<a href=\"#\">ბმული</a>",
        "hint": "ფსევდო-ელემენტი იწერება ორი ორწერტილით (`::`)."
      },
      {
        "instruction": "`a::after`-ს დაუმატე თვისება `content: ' 🔗';`.",
        "expectedCode": "<style>\na {\n  text-decoration: none;\n  color: #0288d1;\n}\na::after {\n  content: ' 🔗';\n}\n</style>\n\n<a href=\"#\">ბმული</a>",
        "hint": "`content` თვისების გარეშე ფსევდო-ელემენტი არ გამოჩნდება. ბრჭყალებში მითითებული ტექსტი დაემატება ბმულის ტექსტის შემდეგ."
      }
    ]
  },
  {
    "id": "challenge-14",
    "title": "გამოწვევა: ციტატის გაფორმება",
    "description": "გამოიყენე `::before` და `::after` ფსევდო-ელემენტები, რათა ციტატას დაუმატო ბრჭყალები.",
    "type": "challenge",
    "difficulty": "medium",
    "emoji": "❝❞",
    "color": "from-slate-500 to-cool-gray-600",
    "xpReward": 25,
    "module": "გაფართოებული სელექტორები",
    "moduleNumber": 16,
    "theory": "💬 ციტატის გაფორმების გამოწვევა\n\n::before და ::after-ით ლამაზი ციტატის ბლოკი შექმენი.\n\n📌 ტექნიკა:\n.quote {\n  border-left: 4px solid gold;\n  padding-left: 20px;\n  font-style: italic;\n}\n.quote::before { content: '❝'; font-size: 2em; }\n.quote::after { content: '❞'; font-size: 2em; }\n\n💡 ფსევდო-ელემენტები ვიზუალურ დეტალებს ამატებენ HTML-ის 'დაბინძურების' გარეშე!",
    "challengeHtml": "<blockquote class=\"quote\">კოდის წერა არის აზროვნების პროცესი.</blockquote>",
    "targetCss": ".quote::before {\n  content: '“';\n  font-size: 3em;\n  color: #ccc;\n  margin-right: 10px;\n}\n.quote::after {\n  content: '”';\n  font-size: 3em;\n  color: #ccc;\n  margin-left: 10px;\n}",
    "starterCss": "/* ვიზუალი */\n.quote { font-style: italic; font-size: 20px; }\n\n/* დაამატე გამხსნელი ბრჭყალი */\n.quote::before {\n\n}\n\n/* დაამატე დამხურავი ბრჭყალი */\n.quote::after {\n  \n}",
    "hints": [
      "`.quote::before`-ში გამოიყენე `content: '“';`.",
      "`.quote::after`-ში გამოიყენე `content: '”';`.",
      "ორივე ფსევდო-ელემენტს დაუმატე `font-size: 3em;` და `color: #ccc;`.",
      "გამოიყენე `margin-right` `::before`-სთვის და `margin-left` `::after`-ისთვის, რომ დააშორო ბრჭყალები ტექსტს."
    ]
  },
  {
    "id": "challenge-15",
    "title": "პროექტი: პროფილის ბარათი",
    "description": "ააწყვე და გააფორმე პროფილის ბარათი HTML და CSS გამოყენებით.",
    "type": "challenge",
    "difficulty": "medium",
    "emoji": "🧑‍💻",
    "color": "from-cyan-500 to-blue-500",
    "xpReward": 30,
    "module": "მინი პროექტები",
    "moduleNumber": 17,
    "theory": "🪪 პროფილის ბარათის პროექტი\n\nეს მინი პროექტია! ყველაფერს ერთად გამოიყენებ:\n\n📌 გჭირდება:\n• box-shadow — ჩრდილი\n• border-radius — მრგვალი კუთხეები\n• text-align: center — ცენტრირება\n• padding, margin — დაშორებები\n• font-family — შრიფტი\n• color, background — ფერები\n\n🎯 ბარათის სტრუქტურა:\n1. სურათი (img) — border-radius: 50% წრიულად\n2. სახელი (h2)\n3. აღწერა (p)\n4. ღილაკი\n\nშექმენი ლამაზი პროფილის ბარათი!",
    "challengeHtml": "<div class=\"profile-card\">\n  <img src=\"https://i.pravatar.cc/150?u=a042581f4e29026704d\" alt=\"პროფილის სურათი\">\n  <h2>ანა ჭავჭავაძე</h2>\n  <p class=\"title\">ვებ დეველოპერი</p>\n  <p>მე მიყვარს კოდის წერა და ახალი ტექნოლოგიების სწავლა.</p>\n</div>",
    "targetCss": ".profile-card {\n  width: 250px;\n  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);\n  text-align: center;\n  font-family: sans-serif;\n  background-color: white;\n  border-radius: 10px;\n  overflow: hidden;\n}\nimg {\n  width: 100%;\n}\nh2 {\n  margin-top: 15px;\n}\n.title {\n  color: grey;\n  font-size: 18px;\n  margin: 5px 0;\n}\np {\n  padding: 0 15px 15px 15px;\n}",
    "starterCss": "body { background-color: #f4f4f4; display: grid; place-items: center; height: 100vh; margin: 0; }\n\n.profile-card {\n  /* შენი სტილები აქ. დაიწყე სიგანით და ჩრდილით */\n\n}\n\nimg {\n  /* სურათმა უნდა შეავსოს ბარათის სიგანე */\n\n}\n\n.title {\n  /* ტექსტის ფერი და ზომა */\n\n}\n",
    "hints": [
      "ბარათს მიანიჭე `width: 250px;`, `box-shadow` და `border-radius`.",
      "შიგთავსი გააცენტრე `text-align: center;`-ით.",
      "სურათს მიანიჭე `width: 100%;` რომ კონტეინერს მოერგოს.",
      "გამოიყენე `margin` და `padding` ელემენტებს შორის დაშორების შესაქმნელად."
    ]
  },
  {
    "id": "challenge-16",
    "title": "პროექტი: ნავიგაციის მენიუ",
    "description": "შექმენი საპასუხო (responsive) ნავიგაციის მენიუ Flexbox-ის გამოყენებით.",
    "type": "challenge",
    "difficulty": "medium",
    "emoji": "🗺️",
    "color": "from-green-500 to-teal-600",
    "xpReward": 30,
    "module": "მინი პროექტები",
    "moduleNumber": 17,
    "theory": "🧭 ნავიგაციის მენიუს პროექტი\n\nFlexbox-ით პროფესიონალური ნავიგაცია შექმენი.\n\n📌 სტრუქტურა:\n1. ლოგო მარცხნივ\n2. ბმულები მარჯვნივ\n3. ჰოვერ ეფექტები\n\n🎯 CSS ტექნიკები:\n• display: flex + justify-content: space-between\n• text-decoration: none — ბმულებს ხაზის მოხსნა\n• :hover — ჰოვერ ეფექტი\n• transition — გლუვი ანიმაცია\n\n📝 მაგალითი:\n.navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem;\n  background: #333;\n}\n\nგამოიყენე ყველაფერი, რაც ისწავლე!",
    "challengeHtml": "<header class=\"navbar\">\n  <a href=\"#\" class=\"logo\">ჩემი საიტი</a>\n  <nav>\n    <a href=\"#\">მთავარი</a>\n    <a href=\"#\">სერვისები</a>\n    <a href=\"#\">კონტაქტი</a>\n  </nav>\n</header>",
    "targetCss": ".navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  background-color: #333;\n  padding: 1rem;\n}\n.logo {\n  color: white;\n  text-decoration: none;\n  font-size: 1.5rem;\n}\n.navbar nav a {\n  color: white;\n  text-decoration: none;\n  padding: 0.5rem 1rem;\n}\n.navbar nav a:hover {\n  background-color: #555;\n  border-radius: 5px;\n}",
    "starterCss": "body { margin: 0; font-family: sans-serif; }\n\n.navbar {\n  /* გახადე flex, გაასწორე ელემენტები */\n  background-color: #333;\n  padding: 1rem;\n\n}\n\n.logo {\n  /* ლოგოს სტილები */\n  color: white;\n  text-decoration: none;\n  font-size: 1.5rem;\n}\n\n.navbar nav a {\n  /* ბმულების სტილები */\n  color: white;\n  text-decoration: none;\n  padding: 0.5rem 1rem;\n}\n\n.navbar nav a:hover {\n  /* ჰოვერ ეფექტი */\n\n}",
    "hints": [
      "`.navbar`-ს დაუმატე `display: flex;`, `justify-content: space-between;` და `align-items: center;`.",
      "მოაშორე ბმულებს ხაზი `text-decoration: none;`-ით და მიეცი ფერი.",
      "დაამატე `padding` ბმულებს, რომ უფრო ადვილი დასაჭერი იყოს.",
      "შექმენი `:hover` ეფექტი ბმულებისთვის, შეუცვალე `background-color`."
    ]
  },
  {"id": "editor-45", "title": "ფორმის შექმნა", "description": "ისწავლე HTML ფორმის ძირითადი სტრუქტურა <form> თეგით.", "type": "editor", "difficulty": "easy", "emoji": "📝", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "HTML ფორმები", "moduleNumber": 18, "theory": "📝 HTML ფორმები\n\nფორმა (<form>) არის ელემენტი, რომლითაც მომხმარებელი აგზავნის ინფორმაციას.\n\n📌 ძირითადი თეგები:\n• <form> — ფორმის კონტეინერი\n• <input> — ტექსტის ველი\n• <button> — ღილაკი\n\n💡 მაგალითი:\n`<form>`\n  `<input type=\"text\" placeholder=\"სახელი\">`\n  `<button>გაგზავნა</button>`\n`</form>`", "starterCode": "<form>\n</form>", "steps": [{"instruction": "დაამატე <form> თეგი", "expectedCode": "<form>\n</form>", "hint": "ჩაწერე <form> და </form>"}]},
  {"id": "editor-46", "title": "ტექსტის ველი", "description": "ისწავლე <input> თეგის გამოყენება ტექსტის ველის შესაქმნელად.", "type": "editor", "difficulty": "easy", "emoji": "✏️", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "HTML ფორმები", "moduleNumber": 18, "theory": "✏️ Input ელემენტი\n\n<input> არის ერთ-ერთი ყველაზე ხშირად გამოყენებული ფორმის ელემენტი.\n\n📌 ატრიბუტები:\n• type=\"text\" — ტექსტის ველი\n• placeholder — მინიშნების ტექსტი\n• name — ველის სახელი\n\n💡 მაგალითი:\n`<input type=\"text\" placeholder=\"ჩაწერე აქ\">`", "starterCode": "<form>\n</form>", "steps": [{"instruction": "დაამატე input ველი ფორმაში", "expectedCode": "<form>\n<input type=\"text\" placeholder=\"სახელი\">\n</form>", "hint": "ჩაწერე <input type=\"text\" placeholder=\"სახელი\"> ფორმის შიგნით"}]},
  {"id": "editor-47", "title": "პაროლის ველი", "description": "ისწავლე პაროლის ტიპის input ველის შექმნა.", "type": "editor", "difficulty": "easy", "emoji": "🔒", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "HTML ფორმები", "moduleNumber": 18, "theory": "🔒 პაროლის ველი\n\ntype=\"password\" ატრიბუტი ტექსტს წერტილებით მალავს.\n\n📌 გამოყენება:\n`<input type=\"password\" placeholder=\"პაროლი\">`\n\n💡 პაროლის ველში ჩაწერილი ტექსტი არ ჩანს — ეს უსაფრთხოებისთვის არის!", "starterCode": "<form>\n<input type=\"text\" placeholder=\"სახელი\">\n</form>", "steps": [{"instruction": "დაამატე პაროლის ველი", "expectedCode": "<form>\n<input type=\"text\" placeholder=\"სახელი\">\n<input type=\"password\" placeholder=\"პაროლი\">\n</form>", "hint": "დაამატე <input type=\"password\"> ტექსტის ველის ქვემოთ"}]},
  {"id": "editor-48", "title": "ღილაკი ფორმაში", "description": "ისწავლე <button> ელემენტის დამატება ფორმაში.", "type": "editor", "difficulty": "easy", "emoji": "🔘", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "HTML ფორმები", "moduleNumber": 18, "theory": "🔘 ღილაკი\n\n<button> ელემენტი ფორმის გაგზავნისთვის გამოიყენება.\n\n📌 ტიპები:\n• type=\"submit\" — ფორმის გაგზავნა\n• type=\"button\" — ჩვეულებრივი ღილაკი\n• type=\"reset\" — ფორმის გასუფთავება\n\n💡 მაგალითი:\n`<button type=\"submit\">გაგზავნა</button>`", "starterCode": "<form>\n<input type=\"text\">\n</form>", "steps": [{"instruction": "დაამატე submit ღილაკი", "expectedCode": "<form>\n<input type=\"text\">\n<button type=\"submit\">გაგზავნა</button>\n</form>", "hint": "დაამატე <button type=\"submit\">გაგზავნა</button>"}]},
  {"id": "puzzle-6", "title": "ფორმის სტრუქტურა", "description": "ააწყვე ფორმის ელემენტები სწორი თანმიმდევრობით.", "type": "puzzle", "difficulty": "easy", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "HTML ფორმები", "moduleNumber": 18, "theory": "🧩 ფორმის სტრუქტურა\n\nფორმა შედგება რამდენიმე ნაწილისგან:\n1. <form> — კონტეინერი\n2. <label> — ველის აღწერა\n3. <input> — შეყვანის ველი\n4. <button> — გაგზავნის ღილაკი", "puzzlePieces": [{"id": "p1", "content": "<form>", "order": 1}, {"id": "p2", "content": "<label>", "order": 2}, {"id": "p3", "content": "<input>", "order": 3}, {"id": "p4", "content": "<button>", "order": 4}], "correctOrder": ["p1", "p2", "p3", "p4"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>ფორმის სტრუქტურა</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "editor-49", "title": "Label თეგი", "description": "ისწავლე <label> თეგის გამოყენება ფორმის ველების აღსაწერად.", "type": "editor", "difficulty": "easy", "emoji": "🏷️", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "ფორმის ელემენტები", "moduleNumber": 19, "theory": "🏷️ Label თეგი\n\n<label> ელემენტი აღწერს ფორმის ველს.\n\n📌 for ატრიბუტი:\n• label-ის for უნდა ემთხვეოდეს input-ის id-ს\n• ეს აადვილებს ველზე დაჭერას\n\n💡 მაგალითი:\n`<label for=\"name\">სახელი:</label>`\n`<input id=\"name\" type=\"text\">`", "starterCode": "", "steps": [{"instruction": "შექმენი label და input ველი", "expectedCode": "<label for=\"name\">სახელი:</label>\n<input id=\"name\" type=\"text\">", "hint": "გამოიყენე for და id ატრიბუტები label-ისა და input-ის დასაკავშირებლად"}]},
  {"id": "editor-50", "title": "Textarea ველი", "description": "ისწავლე მრავალხაზიანი ტექსტის ველის შექმნა.", "type": "editor", "difficulty": "easy", "emoji": "📄", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "ფორმის ელემენტები", "moduleNumber": 19, "theory": "📄 Textarea\n\n<textarea> ელემენტი მრავალხაზიანი ტექსტისთვის გამოიყენება.\n\n📌 ატრიბუტები:\n• rows — ხაზების რაოდენობა\n• cols — სიგანე სიმბოლოებში\n• placeholder — მინიშნება\n\n💡 მაგალითი:\n`<textarea rows=\"4\" placeholder=\"შეტყობინება\"></textarea>`", "starterCode": "", "steps": [{"instruction": "შექმენი textarea ელემენტი", "expectedCode": "<textarea rows=\"4\" placeholder=\"შეტყობინება\"></textarea>", "hint": "გამოიყენე <textarea> თეგი rows ატრიბუტით"}]},
  {"id": "editor-51", "title": "Select ელემენტი", "description": "ისწავლე ჩამოსაშლელი სიის შექმნა.", "type": "editor", "difficulty": "easy", "emoji": "📋", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "ფორმის ელემენტები", "moduleNumber": 19, "theory": "📋 Select ელემენტი\n\nჩამოსაშლელი სია <select> და <option> თეგებით იქმნება.\n\n📌 სტრუქტურა:\n`<select>`\n  `<option value=\"1\">პირველი</option>`\n  `<option value=\"2\">მეორე</option>`\n`</select>`\n\n💡 value ატრიბუტი — ეს არის მნიშვნელობა, რომელიც იგზავნება სერვერზე.", "starterCode": "", "steps": [{"instruction": "შექმენი select ჩამოსაშლელი სია", "expectedCode": "<select>\n<option value=\"html\">HTML</option>\n<option value=\"css\">CSS</option>\n</select>", "hint": "გამოიყენე <select> და <option> თეგები"}]},
  {"id": "editor-52", "title": "Checkbox და Radio", "description": "ისწავლე მონიშვნის ველის და რადიო ღილაკების შექმნა.", "type": "editor", "difficulty": "easy", "emoji": "☑️", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "ფორმის ელემენტები", "moduleNumber": 19, "theory": "☑️ Checkbox და Radio\n\nCheckbox — მონიშვნის ველი (რამდენიმეს შეარჩევს).\nRadio — რადიო ღილაკი (ერთს შეარჩევს).\n\n📌 მაგალითები:\n`<input type=\"checkbox\" id=\"agree\">`\n`<label for=\"agree\">ვეთანხმები</label>`\n\n`<input type=\"radio\" name=\"color\" value=\"red\"> წითელი`\n`<input type=\"radio\" name=\"color\" value=\"blue\"> ლურჯი`\n\n💡 Radio ღილაკებს ერთი name უნდა ჰქონდეთ!", "starterCode": "", "steps": [{"instruction": "შექმენი checkbox ელემენტი", "expectedCode": "<input type=\"checkbox\" id=\"agree\">\n<label for=\"agree\">ვეთანხმები</label>", "hint": "გამოიყენე type=\"checkbox\" და label"}]},
  {"id": "challenge-17", "title": "ფორმის დიზაინი", "description": "გააფორმე ფორმა CSS-ით — ლამაზი ველები და ღილაკი.", "type": "challenge", "difficulty": "easy", "emoji": "🎨", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "ფორმის ელემენტები", "moduleNumber": 19, "theory": "🎨 ფორმის დიზაინი\n\nCSS-ით ფორმას ლამაზ იერს ვაძლევთ.\n\n📌 ხშირი სტილები:\n• padding — ველის შიგა სივრცე\n• border — ჩარჩო\n• border-radius — მომრგვალება\n• outline: none — ფოკუსის ჩარჩოს მოხსნა\n• :focus — ფოკუსის სტილი\n\n💡 მაგალითი:\ninput {\n  padding: 10px;\n  border: 2px solid #ddd;\n  border-radius: 8px;\n}\ninput:focus {\n  border-color: #7c3aed;\n}", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>ფორმის დიზაინი</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-53", "title": "Transition ეფექტი", "description": "ისწავლე CSS transition-ის გამოყენება გლუვი ანიმაციისთვის.", "type": "editor", "difficulty": "easy", "emoji": "✨", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Transitions", "moduleNumber": 20, "theory": "✨ CSS Transitions\n\ntransition ეფექტი ცვლილებას გლუვს ხდის.\n\n📌 სინტაქსი:\ntransition: თვისება ხანგრძლივობა;\n\n💡 მაგალითი:\n.box {\n  background: #3b82f6;\n  transition: background 0.3s;\n}\n.box:hover {\n  background: #7c3aed;\n}\n\n📌 შეგიძლია რამდენიმე თვისებაც:\ntransition: all 0.3s ease;", "starterCode": "<div class=\"box\">Hover me</div>", "steps": [{"instruction": "დაამატე transition ეფექტი", "expectedCode": "<div class=\"box\" style=\"transition: all 0.3s;\">Hover me</div>", "hint": "დაამატე style ატრიბუტში transition: all 0.3s;"}]},
  {"id": "editor-54", "title": "Hover ტრანსფორმაცია", "description": "ისწავლე hover-ზე ელემენტის გადიდება transition-ით.", "type": "editor", "difficulty": "easy", "emoji": "🔍", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Transitions", "moduleNumber": 20, "theory": "🔍 Hover + Transform\n\ntransform: scale() ელემენტის ზომას ცვლის.\n\n📌 გამოყენება:\n.card {\n  transition: transform 0.3s;\n}\n.card:hover {\n  transform: scale(1.05);\n}\n\n💡 scale(1.05) — 5%-ით გადიდება\nscale(0.95) — 5%-ით დაპატარავება", "starterCode": "<div class=\"card\">ბარათი</div>", "steps": [{"instruction": "დაამატე transform სტილი", "expectedCode": "<div class=\"card\" style=\"transition: transform 0.3s;\">ბარათი</div>", "hint": "დაამატე transition: transform 0.3s style-ში"}]},
  {"id": "challenge-18", "title": "ღილაკის ანიმაცია", "description": "შექმენი ღილაკი hover ეფექტით — ფერის ცვლა და გადიდება.", "type": "challenge", "difficulty": "easy", "emoji": "🎯", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "CSS Transitions", "moduleNumber": 20, "theory": "🎯 ღილაკის ანიმაცია\n\nპროფესიონალური ღილაკი transition-ით.\n\n📌 ნაბიჯები:\n1. ღილაკს მიეცი ფერი და padding\n2. დაამატე transition: all 0.3s;\n3. :hover-ზე შეცვალე ფერი\n4. დაამატე transform: scale(1.05)\n\n💡 cursor: pointer — მაუსის ხელის ფორმა", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>ღილაკის ანიმაცია</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-55", "title": "@keyframes ანიმაცია", "description": "ისწავლე @keyframes წესით ანიმაციის შექმნა.", "type": "editor", "difficulty": "easy", "emoji": "🎬", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS ანიმაციები", "moduleNumber": 21, "theory": "🎬 @keyframes\n\n@keyframes ანიმაციის ეტაპებს განსაზღვრავს.\n\n📌 სინტაქსი:\n@keyframes bounce {\n  0% { transform: translateY(0); }\n  50% { transform: translateY(-20px); }\n  100% { transform: translateY(0); }\n}\n\n💡 ანიმაციის გამოყენება:\n.ball {\n  animation: bounce 1s infinite;\n}", "starterCode": "<div class=\"ball\">⚽</div>", "steps": [{"instruction": "დაამატე animation სტილი", "expectedCode": "<div class=\"ball\" style=\"animation: bounce 1s infinite;\">⚽</div>", "hint": "style-ში ჩაწერე animation: bounce 1s infinite;"}]},
  {"id": "editor-56", "title": "Spin ანიმაცია", "description": "შექმენი ტრიალის ანიმაცია @keyframes-ით.", "type": "editor", "difficulty": "easy", "emoji": "🔄", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS ანიმაციები", "moduleNumber": 21, "theory": "🔄 Spin ანიმაცია\n\nტრიალის ეფექტი transform: rotate()-ით იქმნება.\n\n📌 მაგალითი:\n@keyframes spin {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}\n.spinner {\n  animation: spin 2s linear infinite;\n}\n\n💡 linear — თანაბარი სიჩქარე\ninfinite — უსასრულოდ", "starterCode": "<div class=\"spinner\">⚙️</div>", "steps": [{"instruction": "დაამატე spin ანიმაცია", "expectedCode": "<div class=\"spinner\" style=\"animation: spin 2s linear infinite;\">⚙️</div>", "hint": "გამოიყენე animation: spin 2s linear infinite;"}]},
  {"id": "editor-57", "title": "Fade In ეფექტი", "description": "ისწავლე ელემენტის გამოჩენის ანიმაცია.", "type": "editor", "difficulty": "easy", "emoji": "👻", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS ანიმაციები", "moduleNumber": 21, "theory": "👻 Fade In ეფექტი\n\nopacity ცვლილებით ელემენტი თანდათან ჩნდება.\n\n📌 მაგალითი:\n@keyframes fadeIn {\n  from { opacity: 0; }\n  to { opacity: 1; }\n}\n.element {\n  animation: fadeIn 1s ease-in;\n}\n\n💡 ease-in — ნელა იწყება\nease-out — ნელა სრულდება", "starterCode": "<div class=\"text\">გამარჯობა!</div>", "steps": [{"instruction": "დაამატე fadeIn ანიმაცია", "expectedCode": "<div class=\"text\" style=\"animation: fadeIn 1s ease-in;\">გამარჯობა!</div>", "hint": "გამოიყენე animation: fadeIn 1s ease-in;"}]},
  {"id": "challenge-19", "title": "ანიმირებული ბარათი", "description": "შექმენი ბარათი fadeIn და hover ეფექტებით.", "type": "challenge", "difficulty": "easy", "emoji": "💳", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "CSS ანიმაციები", "moduleNumber": 21, "theory": "💳 ანიმირებული ბარათი\n\nშექმენი ბარათი, რომელიც:\n1. გამოჩნდება fadeIn ანიმაციით\n2. hover-ზე ოდნავ გადიდდება\n3. ჩრდილი შეიცვლება\n\n📌 CSS:\n.card {\n  animation: fadeIn 0.5s;\n  transition: all 0.3s;\n}\n.card:hover {\n  transform: scale(1.03);\n  box-shadow: 0 8px 20px rgba(0,0,0,0.15);\n}", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>ანიმირებული ბარათი</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-58", "title": "CSS ცვლადები", "description": "ისწავლე CSS Custom Properties (ცვლადები) შექმნა და გამოყენება.", "type": "editor", "difficulty": "easy", "emoji": "🔧", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Variables", "moduleNumber": 22, "theory": "🔧 CSS ცვლადები\n\nCSS ცვლადები ერთ ადგილას ინახავ მნიშვნელობებს.\n\n📌 სინტაქსი:\n:root {\n  --primary: #7c3aed;\n  --spacing: 16px;\n}\n\n💡 გამოყენება:\n.box {\n  color: var(--primary);\n  padding: var(--spacing);\n}\n\n📌 უპირატესობა — ერთ ადგილას ცვლი, ყველგან იცვლება!", "starterCode": "<div class=\"box\">ცვლადები</div>", "steps": [{"instruction": "გამოიყენე CSS ცვლადი", "expectedCode": "<div class=\"box\" style=\"--color: #7c3aed; color: var(--color);\">ცვლადები</div>", "hint": "style-ში განსაზღვრე --color და გამოიყენე var(--color)"}]},
  {"id": "editor-59", "title": "თემის ცვლადები", "description": "ისწავლე ფერების სქემის მართვა CSS ცვლადებით.", "type": "editor", "difficulty": "easy", "emoji": "🎨", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Variables", "moduleNumber": 22, "theory": "🎨 თემის ცვლადები\n\nCSS ცვლადებით ადვილად ვქმნით სხვადასხვა თემას.\n\n📌 მუქი თემა:\n:root {\n  --bg: #1a1a2e;\n  --text: #eee;\n  --accent: #e94560;\n}\n\n📌 ნათელი თემა:\n.light {\n  --bg: #ffffff;\n  --text: #333;\n  --accent: #7c3aed;\n}\n\n💡 ყველა ელემენტი var() ფუნქციით იყენებს ცვლადებს.", "starterCode": "<div class=\"theme-box\">თემა</div>", "steps": [{"instruction": "შექმენი თემის ცვლადები", "expectedCode": "<div class=\"theme-box\" style=\"--bg: #1a1a2e; --text: #eee; background: var(--bg); color: var(--text);\">თემა</div>", "hint": "განსაზღვრე --bg და --text ცვლადები და გამოიყენე var()-ით"}]},
  {"id": "challenge-20", "title": "ფერების თემა", "description": "შექმენი ბარათი CSS ცვლადებით — ადვილად ცვალებადი ფერები.", "type": "challenge", "difficulty": "easy", "emoji": "🌈", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "CSS Variables", "moduleNumber": 22, "theory": "🌈 ფერების თემა ცვლადებით\n\nშექმენი ბარათი, სადაც ყველა ფერი CSS ცვლადებით არის განსაზღვრული.\n\n📌 ცვლადები:\n--card-bg, --card-text, --card-accent\n\n💡 ცვლადების შეცვლით მთელი დიზაინი იცვლება!", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>ფერების თემა</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-60", "title": "::before ელემენტი", "description": "ისწავლე ::before pseudo-ელემენტის გამოყენება.", "type": "editor", "difficulty": "easy", "emoji": "⬅️", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Pseudo ელემენტები", "moduleNumber": 23, "theory": "⬅️ ::before ელემენტი\n\n::before ამატებს კონტენტს ელემენტის წინ.\n\n📌 სინტაქსი:\n.box::before {\n  content: '★ ';\n  color: gold;\n}\n\n💡 აუცილებელია content თვისება!\nცარიელიც კი: content: '';", "starterCode": "<div class=\"star-box\">ვარსკვლავი</div>", "steps": [{"instruction": "დაამატე ტექსტი ::before-ით", "expectedCode": "<div class=\"star-box\">★ ვარსკვლავი</div>", "hint": "დაამატე ★ სიმბოლო ტექსტის წინ"}]},
  {"id": "editor-61", "title": "::after ელემენტი", "description": "ისწავლე ::after pseudo-ელემენტის გამოყენება.", "type": "editor", "difficulty": "easy", "emoji": "➡️", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Pseudo ელემენტები", "moduleNumber": 23, "theory": "➡️ ::after ელემენტი\n\n::after ამატებს კონტენტს ელემენტის შემდეგ.\n\n📌 მაგალითი:\n.link::after {\n  content: ' →';\n}\n\n💡 ::before და ::after ხშირად გამოიყენება დეკორაციისთვის:\n• ხაზების დამატება\n• აიქონების ჩასმა\n• ტალღის ეფექტი", "starterCode": "<p class=\"link\">წაიკითხე მეტი</p>", "steps": [{"instruction": "დაამატე ისარი ტექსტის ბოლოს", "expectedCode": "<p class=\"link\">წაიკითხე მეტი →</p>", "hint": "დაამატე → სიმბოლო ტექსტის ბოლოს"}]},
  {"id": "challenge-21", "title": "დეკორირებული სათაური", "description": "შექმენი სათაური, რომელსაც ხაზები აქვს ორივე მხარეს ::before და ::after-ით.", "type": "challenge", "difficulty": "easy", "emoji": "📐", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Pseudo ელემენტები", "moduleNumber": 23, "theory": "📐 დეკორირებული სათაური\n\nშექმენი სათაური ხაზებით ორივე მხრიდან.\n\n📌 ტექნიკა:\n• Flexbox + gap\n• ::before და ::after ელემენტები\n• flex: 1 + height: 1px + background\n\n💡 ეს პოპულარული დიზაინ პატერნია!", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>დეკორირებული სათაური</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-62", "title": "Media Queries", "description": "ისწავლე @media წესის გამოყენება სხვადასხვა ეკრანის ზომაზე.", "type": "editor", "difficulty": "easy", "emoji": "📱", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Responsive დიზაინი", "moduleNumber": 24, "theory": "📱 Media Queries\n\n@media წესი სტილებს ეკრანის ზომის მიხედვით ცვლის.\n\n📌 სინტაქსი:\n@media (max-width: 768px) {\n  .container {\n    flex-direction: column;\n  }\n}\n\n💡 ხშირი breakpoints:\n• 480px — მობილური\n• 768px — ტაბლეტი\n• 1024px — დესკტოპი", "starterCode": "<div class=\"container\">Responsive!</div>", "steps": [{"instruction": "შექმენი responsive კონტეინერი", "expectedCode": "<div class=\"container\" style=\"max-width: 100%; padding: 20px;\">Responsive!</div>", "hint": "გამოიყენე max-width: 100% და padding"}]},
  {"id": "editor-63", "title": "Viewport Meta", "description": "ისწავლე viewport meta თეგის მნიშვნელობა.", "type": "editor", "difficulty": "easy", "emoji": "🖥️", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Responsive დიზაინი", "moduleNumber": 24, "theory": "🖥️ Viewport Meta\n\nviewport meta თეგი ბრაუზერს ეუბნება, როგორ აჩვენოს გვერდი მობილურზე.\n\n📌 სტანდარტული:\n`<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">`\n\n💡 ეს თეგი <head>-ში უნდა იყოს!\nმის გარეშე გვერდი მობილურზე პატარა გამოჩნდება.", "starterCode": "<head>\n</head>", "steps": [{"instruction": "დაამატე viewport meta თეგი", "expectedCode": "<head>\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n</head>", "hint": "ჩაწერე <meta name=\"viewport\" ...> head-ის შიგნით"}]},
  {"id": "editor-64", "title": "Responsive სურათები", "description": "ისწავლე სურათების ადაპტაცია სხვადასხვა ეკრანზე.", "type": "editor", "difficulty": "easy", "emoji": "🖼️", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Responsive დიზაინი", "moduleNumber": 24, "theory": "🖼️ Responsive სურათები\n\nmax-width: 100% სურათს კონტეინერში ათავსებს.\n\n📌 მაგალითი:\nimg {\n  max-width: 100%;\n  height: auto;\n}\n\n💡 height: auto — პროპორციას ინარჩუნებს\nobject-fit: cover — კონტეინერს ავსებს", "starterCode": "<img src=\"photo.jpg\" alt=\"სურათი\">", "steps": [{"instruction": "გახადე სურათი responsive", "expectedCode": "<img src=\"photo.jpg\" alt=\"სურათი\" style=\"max-width: 100%; height: auto;\">", "hint": "დაამატე style=\"max-width: 100%; height: auto;\""}]},
  {"id": "puzzle-7", "title": "Responsive სტრუქტურა", "description": "ააწყვე responsive გვერდის ელემენტები სწორი თანმიმდევრობით.", "type": "puzzle", "difficulty": "easy", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "Responsive დიზაინი", "moduleNumber": 24, "theory": "🧩 Responsive სტრუქტურა\n\nResponsive გვერდი მოიცავს:\n1. viewport meta თეგს\n2. Flexible კონტეინერებს\n3. Media queries-ს\n4. Responsive სურათებს", "puzzlePieces": [{"id": "p1", "content": "viewport", "order": 1}, {"id": "p2", "content": "Flexible", "order": 2}, {"id": "p3", "content": "Media", "order": 3}, {"id": "p4", "content": "Responsive", "order": 4}], "correctOrder": ["p1", "p2", "p3", "p4"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>Responsive სტრუქტურა</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "challenge-22", "title": "მობილურისთვის ადაპტაცია", "description": "გადადე desktop layout მობილურ ვერსიაზე media query-ით.", "type": "challenge", "difficulty": "easy", "emoji": "📲", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Responsive დიზაინი", "moduleNumber": 24, "theory": "📲 მობილური ადაპტაცია\n\nDesktop-ზე 3 სვეტი, მობილურზე 1 სვეტი.\n\n📌 ტექნიკა:\n.grid { display: grid; grid-template-columns: repeat(3, 1fr); }\n@media (max-width: 768px) {\n  .grid { grid-template-columns: 1fr; }\n}", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>მობილურისთვის ადაპტაცია</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-65", "title": "Flex Wrap", "description": "ისწავლე flex-wrap თვისება ელემენტების ახალ ხაზზე გადატანისთვის.", "type": "editor", "difficulty": "medium", "emoji": "🔃", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Flexbox Advanced", "moduleNumber": 25, "theory": "🔃 Flex Wrap\n\nflex-wrap ელემენტებს ახალ ხაზზე გადაიტანს.\n\n📌 მნიშვნელობები:\n• nowrap — ერთ ხაზზე (default)\n• wrap — ახალ ხაზზე\n• wrap-reverse — საპირისპიროდ\n\n💡 მაგალითი:\n.container {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 10px;\n}", "starterCode": "<div class=\"flex-container\">items</div>", "steps": [{"instruction": "დაამატე flex-wrap სტილი", "expectedCode": "<div class=\"flex-container\" style=\"display: flex; flex-wrap: wrap; gap: 10px;\">items</div>", "hint": "გამოიყენე display: flex და flex-wrap: wrap"}]},
  {"id": "editor-66", "title": "Flex Order", "description": "ისწავლე ელემენტების თანმიმდევრობის ცვლა order თვისებით.", "type": "editor", "difficulty": "medium", "emoji": "🔢", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Flexbox Advanced", "moduleNumber": 25, "theory": "🔢 Flex Order\n\norder თვისება ელემენტების თანმიმდევრობას ცვლის.\n\n📌 default: order: 0\n• order: -1 — პირველი\n• order: 1 — ბოლო\n\n💡 მაგალითი:\n.first { order: -1; }\n.last { order: 1; }", "starterCode": "<div style=\"display:flex\"><div>A</div><div>B</div><div>C</div></div>", "steps": [{"instruction": "შეცვალე ელემენტების რიგი order-ით", "expectedCode": "<div style=\"display:flex\"><div style=\"order:2\">A</div><div style=\"order:1\">B</div><div style=\"order:0\">C</div></div>", "hint": "თითოეულ div-ს მიეცი style=\"order: N\""}]},
  {"id": "editor-67", "title": "Flex Grow და Shrink", "description": "ისწავლე flex-grow და flex-shrink თვისებები.", "type": "editor", "difficulty": "medium", "emoji": "📏", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Flexbox Advanced", "moduleNumber": 25, "theory": "📏 Flex Grow & Shrink\n\nflex-grow — რამდენად იზრდება ელემენტი.\nflex-shrink — რამდენად მცირდება.\n\n📌 მაგალითი:\n.sidebar { flex: 0 0 200px; } — ფიქსირებული\n.main { flex: 1; } — დარჩენილს ავსებს\n\n💡 flex: 1 არის შემოკლება flex-grow: 1-ის", "starterCode": "<div style=\"display:flex\"><div>Sidebar</div><div>Main</div></div>", "steps": [{"instruction": "გამოიყენე flex-grow", "expectedCode": "<div style=\"display:flex\"><div style=\"flex: 0 0 200px;\">Sidebar</div><div style=\"flex: 1;\">Main</div></div>", "hint": "sidebar-ს მიეცი flex: 0 0 200px, main-ს flex: 1"}]},
  {"id": "challenge-23", "title": "Flex Layout", "description": "შექმენი Header + Sidebar + Main layout Flexbox-ით.", "type": "challenge", "difficulty": "medium", "emoji": "📐", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Flexbox Advanced", "moduleNumber": 25, "theory": "📐 Flex Layout\n\nშექმენი კლასიკური layout:\n• Header ზემოთ\n• Sidebar მარცხნივ (200px)\n• Main მარჯვნივ (flex: 1)\n\n📌 ტექნიკა:\n.wrapper { display: flex; }\n.sidebar { flex: 0 0 200px; }\n.main { flex: 1; }", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>Flex Layout</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-68", "title": "Grid Areas", "description": "ისწავლე grid-template-areas თვისება layout-ის სახელებით.", "type": "editor", "difficulty": "medium", "emoji": "🗺️", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Grid Advanced", "moduleNumber": 26, "theory": "🗺️ Grid Areas\n\ngrid-template-areas ლეიაუთს სახელებით ქმნის.\n\n📌 სინტაქსი:\n.container {\n  display: grid;\n  grid-template-areas:\n    'header header'\n    'sidebar main'\n    'footer footer';\n}\n.header { grid-area: header; }\n.sidebar { grid-area: sidebar; }\n\n💡 ეს ყველაზე წასაკითხი Grid მეთოდია!", "starterCode": "<div class=\"grid-layout\">Grid</div>", "steps": [{"instruction": "შექმენი grid layout", "expectedCode": "<div class=\"grid-layout\" style=\"display: grid; grid-template-columns: 1fr 2fr; gap: 10px;\">Grid</div>", "hint": "გამოიყენე display: grid და grid-template-columns"}]},
  {"id": "editor-69", "title": "Grid Auto Flow", "description": "ისწავლე grid-auto-flow თვისება ელემენტების განლაგებისთვის.", "type": "editor", "difficulty": "medium", "emoji": "🔀", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Grid Advanced", "moduleNumber": 26, "theory": "🔀 Grid Auto Flow\n\ngrid-auto-flow განსაზღვრავს, როგორ ლაგდება ელემენტები.\n\n📌 მნიშვნელობები:\n• row — ხაზებად (default)\n• column — სვეტებად\n• dense — ცარიელ ადგილებს ავსებს\n\n💡 მაგალითი:\n.gallery {\n  display: grid;\n  grid-auto-flow: dense;\n  grid-template-columns: repeat(3, 1fr);\n}", "starterCode": "<div class=\"gallery\">Gallery</div>", "steps": [{"instruction": "შექმენი grid გალერეა", "expectedCode": "<div class=\"gallery\" style=\"display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;\">Gallery</div>", "hint": "გამოიყენე repeat(3, 1fr) სვეტებისთვის"}]},
  {"id": "puzzle-8", "title": "Grid Layout", "description": "ააწყვე Grid layout-ის ელემენტები სწორი თანმიმდევრობით.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "Grid Advanced", "moduleNumber": 26, "theory": "🧩 Grid Layout\n\nGrid-ის ძირითადი ნაწილები:\n1. display: grid — Grid-ის ჩართვა\n2. grid-template-columns — სვეტები\n3. grid-template-rows — რიგები\n4. gap — დაშორება", "puzzlePieces": [{"id": "p1", "content": "display:", "order": 1}, {"id": "p2", "content": "grid-template-columns", "order": 2}, {"id": "p3", "content": "grid-template-rows", "order": 3}, {"id": "p4", "content": "gap", "order": 4}], "correctOrder": ["p1", "p2", "p3", "p4"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>Grid Layout</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "challenge-24", "title": "Grid გალერეა", "description": "შექმენი სურათების გალერეა CSS Grid-ით.", "type": "challenge", "difficulty": "medium", "emoji": "🖼️", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Grid Advanced", "moduleNumber": 26, "theory": "🖼️ Grid გალერეა\n\nშექმენი 3-სვეტიანი გალერეა Grid-ით.\n\n📌 ტექნიკა:\n.gallery {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 10px;\n}\n.gallery img {\n  width: 100%;\n  border-radius: 8px;\n}", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>Grid გალერეა</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-70", "title": "Blur ფილტრი", "description": "ისწავლე filter: blur() ეფექტის გამოყენება.", "type": "editor", "difficulty": "medium", "emoji": "🌫️", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Filters", "moduleNumber": 27, "theory": "🌫️ CSS Filters\n\nfilter თვისება ვიზუალურ ეფექტებს ამატებს.\n\n📌 ხშირი ფილტრები:\n• blur(5px) — ბუნდოვანი\n• brightness(1.5) — სიკაშკაშე\n• grayscale(100%) — შავ-თეთრი\n• contrast(2) — კონტრასტი\n• saturate(2) — ფერის გაძლიერება\n\n💡 მაგალითი:\nimg {\n  filter: blur(3px);\n}\nimg:hover {\n  filter: none;\n}", "starterCode": "<img src=\"photo.jpg\" alt=\"blur\">", "steps": [{"instruction": "დაამატე blur ფილტრი", "expectedCode": "<img src=\"photo.jpg\" alt=\"blur\" style=\"filter: blur(3px);\">", "hint": "დაამატე style=\"filter: blur(3px);\""}]},
  {"id": "editor-71", "title": "Grayscale ეფექტი", "description": "ისწავლე სურათის შავ-თეთრად გადაქცევა filter-ით.", "type": "editor", "difficulty": "medium", "emoji": "🖤", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Filters", "moduleNumber": 27, "theory": "🖤 Grayscale\n\ngrayscale() სურათს შავ-თეთრს ხდის.\n\n📌 მაგალითი:\nimg {\n  filter: grayscale(100%);\n  transition: filter 0.3s;\n}\nimg:hover {\n  filter: grayscale(0%);\n}\n\n💡 100% — სრულად შავ-თეთრი\n50% — ნაწილობრივ", "starterCode": "<img src=\"photo.jpg\" alt=\"grayscale\">", "steps": [{"instruction": "დაამატე grayscale ფილტრი", "expectedCode": "<img src=\"photo.jpg\" alt=\"grayscale\" style=\"filter: grayscale(100%);\">", "hint": "გამოიყენე filter: grayscale(100%);"}]},
  {"id": "challenge-25", "title": "ფოტო გალერეა ფილტრებით", "description": "შექმენი გალერეა, სადაც hover-ზე ფილტრი იხსნება.", "type": "challenge", "difficulty": "medium", "emoji": "📸", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "CSS Filters", "moduleNumber": 27, "theory": "📸 ფილტრიანი გალერეა\n\nსურათები grayscale-ია, hover-ზე ფერადი ხდება.\n\n📌 ტექნიკა:\nimg {\n  filter: grayscale(100%);\n  transition: filter 0.4s;\n}\nimg:hover {\n  filter: grayscale(0%);\n  transform: scale(1.05);\n}", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>ფოტო გალერეა ფილტრებით</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-72", "title": "Overflow თვისება", "description": "ისწავლე overflow თვისება კონტენტის მართვისთვის.", "type": "editor", "difficulty": "medium", "emoji": "📜", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Overflow და Scrolling", "moduleNumber": 28, "theory": "📜 Overflow\n\noverflow განსაზღვრავს, რა ხდება როცა კონტენტი კონტეინერზე დიდია.\n\n📌 მნიშვნელობები:\n• visible — გამოჩნდეს (default)\n• hidden — დაიმალოს\n• scroll — scrollbar\n• auto — საჭიროებისამებრ\n\n💡 overflow-x და overflow-y ცალ-ცალკე მართავს.", "starterCode": "<div style=\"height: 100px;\">ტექსტი...</div>", "steps": [{"instruction": "დაამატე overflow: auto", "expectedCode": "<div style=\"height: 100px; overflow: auto;\">ტექსტი...</div>", "hint": "დაამატე overflow: auto style-ში"}]},
  {"id": "editor-73", "title": "Text Overflow", "description": "ისწავლე ტექსტის შეწყვეტა ellipsis-ით.", "type": "editor", "difficulty": "medium", "emoji": "✂️", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Overflow და Scrolling", "moduleNumber": 28, "theory": "✂️ Text Overflow\n\nგრძელი ტექსტის შეწყვეტა ... -ით.\n\n📌 3 თვისება ერთად:\nwhite-space: nowrap;\noverflow: hidden;\ntext-overflow: ellipsis;\n\n💡 ეს ტრიო ყოველთვის ერთად გამოიყენე!", "starterCode": "<p style=\"width: 200px;\">ძალიან გრძელი ტექსტი</p>", "steps": [{"instruction": "დაამატე text-overflow: ellipsis", "expectedCode": "<p style=\"width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;\">ძალიან გრძელი ტექსტი</p>", "hint": "დაამატე white-space, overflow და text-overflow"}]},
  {"id": "challenge-26", "title": "Scrollable ბარათი", "description": "შექმენი ბარათი, რომელსაც scroll აქვს შიგნით.", "type": "challenge", "difficulty": "medium", "emoji": "📋", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Overflow და Scrolling", "moduleNumber": 28, "theory": "📋 Scrollable ბარათი\n\nფიქსირებული სიმაღლის ბარათი scrollbar-ით.\n\n📌 ტექნიკა:\n.card {\n  height: 300px;\n  overflow-y: auto;\n  padding: 20px;\n}\n\n💡 scrollbar-ის სტილიზაცია:\n::-webkit-scrollbar { width: 6px; }\n::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 3px; }", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>Scrollable ბარათი</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-74", "title": "Semantic თეგები", "description": "ისწავლე <header>, <main>, <footer> სემანტიკური თეგების გამოყენება.", "type": "editor", "difficulty": "medium", "emoji": "🏛️", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "სემანტიკური HTML", "moduleNumber": 29, "theory": "🏛️ სემანტიკური HTML\n\nსემანტიკური თეგები გვერდის სტრუქტურას აღწერს.\n\n📌 ძირითადი:\n• <header> — ჰედერი\n• <nav> — ნავიგაცია\n• <main> — ძირითადი კონტენტი\n• <section> — სექცია\n• <article> — სტატია\n• <aside> — გვერდითი\n• <footer> — ფუტერი\n\n💡 ეს თეგები div-ის ნაცვლად გამოიყენე!", "starterCode": "", "steps": [{"instruction": "შექმენი სემანტიკური სტრუქტურა", "expectedCode": "<header>\n<h1>საიტი</h1>\n</header>\n<main>\n<p>კონტენტი</p>\n</main>\n<footer>\n<p>ფუტერი</p>\n</footer>", "hint": "გამოიყენე <header>, <main>, <footer> თეგები"}]},
  {"id": "editor-75", "title": "Article და Section", "description": "ისწავლე <article> და <section> თეგების განსხვავება.", "type": "editor", "difficulty": "medium", "emoji": "📰", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "სემანტიკური HTML", "moduleNumber": 29, "theory": "📰 Article vs Section\n\n<article> — დამოუკიდებელი კონტენტი (ბლოგ პოსტი).\n<section> — გვერდის ლოგიკური ნაწილი.\n\n📌 მაგალითი:\n<section>\n  <h2>ახალი ამბები</h2>\n  <article>\n    <h3>სათაური</h3>\n    <p>ტექსტი...</p>\n  </article>\n</section>\n\n💡 article შეიძლება section-ის შიგნით იყოს!", "starterCode": "", "steps": [{"instruction": "შექმენი article სექციის შიგნით", "expectedCode": "<section>\n<h2>ბლოგი</h2>\n<article>\n<h3>პოსტი</h3>\n<p>ტექსტი</p>\n</article>\n</section>", "hint": "ჯერ <section>, შემდეგ შიგნით <article>"}]},
  {"id": "puzzle-9", "title": "სემანტიკური სტრუქტურა", "description": "ააწყვე სემანტიკური HTML ელემენტები სწორი თანმიმდევრობით.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "სემანტიკური HTML", "moduleNumber": 29, "theory": "🧩 სემანტიკური სტრუქტურა\n\nსწორი თანმიმდევრობა:\n1. <header> — ზედა\n2. <nav> — ნავიგაცია\n3. <main> — ძირითადი\n4. <footer> — ქვედა", "puzzlePieces": [{"id": "p1", "content": "<header>", "order": 1}, {"id": "p2", "content": "<nav>", "order": 2}, {"id": "p3", "content": "<main>", "order": 3}, {"id": "p4", "content": "<footer>", "order": 4}], "correctOrder": ["p1", "p2", "p3", "p4"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>სემანტიკური სტრუქტურა</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "editor-76", "title": "Alt ატრიბუტი", "description": "ისწავლე სურათებისთვის alt ტექსტის დაწერა.", "type": "editor", "difficulty": "medium", "emoji": "♿", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Accessibility", "moduleNumber": 30, "theory": "♿ Alt ატრიბუტი\n\nalt ატრიბუტი სურათის აღწერას იძლევა.\n\n📌 რატომ არის მნიშვნელოვანი:\n• მხედველობის პრობლემების მქონე ადამიანებისთვის\n• სურათი რომ არ ჩაიტვირთოს, ტექსტი ჩნდება\n• SEO-სთვის\n\n💡 მაგალითი:\n`<img src=\"cat.jpg\" alt=\"ნარინჯისფერი კატა სავარძელზე\">`\n\nცარიელი alt=\"\" — დეკორაციული სურათისთვის.", "starterCode": "<img src=\"dog.jpg\">", "steps": [{"instruction": "დაამატე alt ატრიბუტი", "expectedCode": "<img src=\"dog.jpg\" alt=\"ძაღლი პარკში\">", "hint": "დაამატე alt=\"ძაღლი პარკში\" ატრიბუტი"}]},
  {"id": "editor-77", "title": "ARIA Labels", "description": "ისწავლე aria-label ატრიბუტის გამოყენება.", "type": "editor", "difficulty": "medium", "emoji": "🏷️", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Accessibility", "moduleNumber": 30, "theory": "🏷️ ARIA Labels\n\naria-label ელემენტს აღწერს screen reader-ისთვის.\n\n📌 გამოყენება:\n• ღილაკებზე, რომლებსაც ტექსტი არ აქვთ\n• აიქონ ღილაკებზე\n\n💡 მაგალითი:\n`<button aria-label=\"მენიუს გახსნა\">`\n  `<span>☰</span>`\n`</button>`", "starterCode": "<button>☰</button>", "steps": [{"instruction": "დაამატე aria-label", "expectedCode": "<button aria-label=\"მენიუს გახსნა\">☰</button>", "hint": "დაამატე aria-label=\"მენიუს გახსნა\""}]},
  {"id": "challenge-27", "title": "Accessible ფორმა", "description": "შექმენი ფორმა სრული accessibility-ით — label, aria, focus.", "type": "challenge", "difficulty": "medium", "emoji": "🌐", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Accessibility", "moduleNumber": 30, "theory": "🌐 Accessible ფორმა\n\nშექმენი ფორმა, რომელიც ყველასთვის ხელმისაწვდომია.\n\n📌 მოთხოვნები:\n• ყველა ველს label ჰქონდეს\n• aria-required=\"true\" საჭირო ველებზე\n• focus სტილები\n• ღილაკს aria-label", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>Accessible ფორმა</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-78", "title": "Box Sizing", "description": "ისწავლე box-sizing: border-box თვისება.", "type": "editor", "difficulty": "medium", "emoji": "📦", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Box Model Deep", "moduleNumber": 31, "theory": "📦 Box Sizing\n\nbox-sizing განსაზღვრავს, რა შედის width-ში.\n\n📌 content-box (default):\nwidth = კონტენტი (padding და border ემატება)\n\n📌 border-box:\nwidth = კონტენტი + padding + border\n\n💡 რეკომენდაცია:\n* { box-sizing: border-box; }\n\nეს ყველა ელემენტს ინტუიტიურს ხდის!", "starterCode": "<div style=\"width: 200px; padding: 20px;\">Box</div>", "steps": [{"instruction": "დაამატე box-sizing: border-box", "expectedCode": "<div style=\"width: 200px; padding: 20px; box-sizing: border-box;\">Box</div>", "hint": "დაამატე box-sizing: border-box style-ში"}]},
  {"id": "editor-79", "title": "Outline vs Border", "description": "ისწავლე outline და border-ის განსხვავება.", "type": "editor", "difficulty": "medium", "emoji": "🔲", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Box Model Deep", "moduleNumber": 31, "theory": "🔲 Outline vs Border\n\nborder — ელემენტის ნაწილია, ადგილს იკავებს.\noutline — ზემოდან ხატავს, ადგილს არ იკავებს.\n\n📌 outline ხშირად :focus-ზე:\ninput:focus {\n  outline: 2px solid #7c3aed;\n  outline-offset: 2px;\n}\n\n💡 outline-offset — outline-ის დაშორება.", "starterCode": "<input type=\"text\" placeholder=\"Focus me\">", "steps": [{"instruction": "დაამატე outline სტილი", "expectedCode": "<input type=\"text\" placeholder=\"Focus me\" style=\"outline: 2px solid #7c3aed;\">", "hint": "დაამატე outline: 2px solid #7c3aed style-ში"}]},
  {"id": "challenge-28", "title": "Box Model ვიზუალიზაცია", "description": "შექმენი ყუთი, სადაც margin, padding, border ცალკე ფერებით ჩანს.", "type": "challenge", "difficulty": "medium", "emoji": "🎁", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "CSS Box Model Deep", "moduleNumber": 31, "theory": "🎁 Box Model ვიზუალიზაცია\n\nშექმენი ყუთი, სადაც:\n• margin — ნარინჯისფერი ფონი\n• border — მუქი ჩარჩო\n• padding — მწვანე ფონი\n• content — თეთრი ფონი\n\nეს დაგეხმარება Box Model-ის გაგებაში!", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>Box Model ვიზუალიზაცია</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-80", "title": "HTML ცხრილი", "description": "ისწავლე <table> ელემენტით ცხრილის შექმნა.", "type": "editor", "difficulty": "medium", "emoji": "📊", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Tables", "moduleNumber": 32, "theory": "📊 HTML ცხრილები\n\nცხრილი <table> თეგით იქმნება.\n\n📌 ძირითადი თეგები:\n• <table> — ცხრილი\n• <tr> — რიგი (table row)\n• <th> — სათაურის უჯრა (bold)\n• <td> — მონაცემების უჯრა\n\n💡 მაგალითი:\n<table>\n  <tr><th>სახელი</th><th>ასაკი</th></tr>\n  <tr><td>ნინო</td><td>12</td></tr>\n</table>", "starterCode": "", "steps": [{"instruction": "შექმენი მარტივი ცხრილი", "expectedCode": "<table>\n<tr><th>სახელი</th><th>ასაკი</th></tr>\n<tr><td>ნინო</td><td>12</td></tr>\n</table>", "hint": "გამოიყენე <table>, <tr>, <th>, <td> თეგები"}]},
  {"id": "editor-81", "title": "ცხრილის სტილიზაცია", "description": "ისწავლე ცხრილის CSS-ით გაფორმება.", "type": "editor", "difficulty": "medium", "emoji": "🎨", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Tables", "moduleNumber": 32, "theory": "🎨 ცხრილის სტილი\n\nCSS-ით ცხრილი ლამაზი და წასაკითხი ხდება.\n\n📌 ხშირი სტილები:\ntable { border-collapse: collapse; width: 100%; }\nth, td { padding: 10px; border: 1px solid #ddd; }\nth { background: #7c3aed; color: white; }\ntr:nth-child(even) { background: #f5f5f5; }\n\n💡 border-collapse: collapse — ორმაგი ჩარჩოს მოხსნა", "starterCode": "<table><tr><th>A</th></tr><tr><td>B</td></tr></table>", "steps": [{"instruction": "დაამატე ცხრილის სტილი", "expectedCode": "<table style=\"border-collapse: collapse; width: 100%;\"><tr><th style=\"padding: 10px; background: #7c3aed; color: white;\">A</th></tr><tr><td style=\"padding: 10px; border: 1px solid #ddd;\">B</td></tr></table>", "hint": "დაამატე border-collapse, padding და background"}]},
  {"id": "puzzle-10", "title": "ცხრილის სტრუქტურა", "description": "ააწყვე ცხრილის ელემენტები სწორი თანმიმდევრობით.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "Tables", "moduleNumber": 32, "theory": "🧩 ცხრილის სტრუქტურა\n\nცხრილი:\n1. <table> — კონტეინერი\n2. <tr> — რიგი\n3. <th> — სათაური\n4. <td> — მონაცემი", "puzzlePieces": [{"id": "p1", "content": "<table>", "order": 1}, {"id": "p2", "content": "<tr>", "order": 2}, {"id": "p3", "content": "<th>", "order": 3}, {"id": "p4", "content": "<td>", "order": 4}], "correctOrder": ["p1", "p2", "p3", "p4"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>ცხრილის სტრუქტურა</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "editor-82", "title": "Sticky Position", "description": "ისწავლე position: sticky გამოყენება.", "type": "editor", "difficulty": "medium", "emoji": "📌", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Position Advanced", "moduleNumber": 33, "theory": "📌 Sticky Position\n\nsticky ელემენტი scroll-ზე მიეწებება.\n\n📌 სინტაქსი:\n.header {\n  position: sticky;\n  top: 0;\n}\n\n💡 sticky = relative + fixed:\n• ჩვეულებრივად ბუნებრივ ადგილზეა\n• scroll-ზე ფიქსირდება top მნიშვნელობაზე", "starterCode": "<div class=\"sticky-header\">Header</div>", "steps": [{"instruction": "გახადე ელემენტი sticky", "expectedCode": "<div class=\"sticky-header\" style=\"position: sticky; top: 0;\">Header</div>", "hint": "დაამატე position: sticky; top: 0;"}]},
  {"id": "editor-83", "title": "Z-Index", "description": "ისწავლე z-index თვისება ელემენტების ზემოდან/ქვემოდან განლაგებისთვის.", "type": "editor", "difficulty": "medium", "emoji": "🔝", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Position Advanced", "moduleNumber": 33, "theory": "🔝 Z-Index\n\nz-index განსაზღვრავს, რომელი ელემენტი არის ზემოთ.\n\n📌 წესები:\n• მაღალი z-index = ზემოთ\n• მუშაობს მხოლოდ position-ით (relative, absolute, fixed, sticky)\n\n💡 მაგალითი:\n.modal { z-index: 100; }\n.overlay { z-index: 50; }\n.content { z-index: 1; }", "starterCode": "<div style=\"position: relative;\">Content</div>", "steps": [{"instruction": "დაამატე z-index", "expectedCode": "<div style=\"position: relative; z-index: 10;\">Content</div>", "hint": "დაამატე z-index: 10 style-ში"}]},
  {"id": "challenge-29", "title": "Sticky ნავიგაცია", "description": "შექმენი ნავიგაცია, რომელიც scroll-ზე მიეწებება.", "type": "challenge", "difficulty": "medium", "emoji": "🧲", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Position Advanced", "moduleNumber": 33, "theory": "🧲 Sticky ნავიგაცია\n\nშექმენი nav, რომელიც scroll-ზე sticky ხდება.\n\n📌 ტექნიკა:\nnav {\n  position: sticky;\n  top: 0;\n  background: white;\n  box-shadow: 0 2px 8px rgba(0,0,0,0.1);\n  z-index: 100;\n}", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>Sticky ნავიგაცია</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "challenge-30", "title": "პორტფოლიო გვერდი", "description": "შექმენი მინი პორტფოლიო Grid და Flexbox-ით.", "type": "challenge", "difficulty": "medium", "emoji": "💼", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "მინი პროექტები II", "moduleNumber": 34, "theory": "💼 პორტფოლიო პროექტი\n\nშექმენი პორტფოლიო გვერდი:\n• Header ლოგოთი და ნავიგაციით\n• Hero სექცია სახელით\n• პროექტების Grid\n• Footer\n\n📌 გამოიყენე ყველაფერი, რაც ისწავლე!", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>პორტფოლიო გვერდი</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "challenge-31", "title": "Blog Layout", "description": "შექმენი ბლოგის გვერდის layout სემანტიკური HTML-ით.", "type": "challenge", "difficulty": "medium", "emoji": "📝", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "მინი პროექტები II", "moduleNumber": 34, "theory": "📝 Blog Layout\n\nშექმენი ბლოგის layout:\n• <header> ნავიგაციით\n• <main> სტატიებით (<article>)\n• <aside> გვერდითი ბარი\n• <footer>\n\n📌 გამოიყენე CSS Grid 2 სვეტით!", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>Blog Layout</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "challenge-32", "title": "Landing Page", "description": "შექმენი landing page ყველა ნასწავლი ტექნიკით.", "type": "challenge", "difficulty": "medium", "emoji": "🚀", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "მინი პროექტები II", "moduleNumber": 34, "theory": "🚀 Landing Page\n\nშექმენი სრული landing page:\n• Hero სექცია დიდი ტექსტით\n• Features Grid (3 ბარათი)\n• CTA ღილაკი transition-ით\n• Footer\n\n📌 ეს შენი ფინალური პროექტია!", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>Landing Page</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "puzzle-11", "title": "გვერდის არქიტექტურა", "description": "ააწყვე landing page-ის ელემენტები სწორი თანმიმდევრობით.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "მინი პროექტები II", "moduleNumber": 34, "theory": "🧩 გვერდის არქიტექტურა\n\nLanding page:\n1. Header + Nav\n2. Hero Section\n3. Features\n4. CTA\n5. Footer", "puzzlePieces": [{"id": "p1", "content": "Header", "order": 1}, {"id": "p2", "content": "Hero", "order": 2}, {"id": "p3", "content": "Features", "order": 3}, {"id": "p4", "content": "CTA", "order": 4}, {"id": "p5", "content": "Footer", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>გვერდის არქიტექტურა</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "challenge-33", "title": "E-commerce ბარათი", "description": "შექმენი პროდუქტის ბარათი hover ეფექტებით.", "type": "challenge", "difficulty": "medium", "emoji": "🛍️", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "მინი პროექტები II", "moduleNumber": 34, "theory": "🛍️ E-commerce ბარათი\n\nპროდუქტის ბარათი:\n• სურათი (hover-ზე zoom)\n• სათაური, ფასი\n• ღილაკი transition-ით\n• box-shadow hover-ზე\n\n📌 გამოიყენე:\ntransition, transform, box-shadow", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>E-commerce ბარათი</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "challenge-34", "title": "Dashboard Layout", "description": "შექმენი admin dashboard layout Grid-ით.", "type": "challenge", "difficulty": "medium", "emoji": "📊", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "მინი პროექტები II", "moduleNumber": 34, "theory": "📊 Dashboard Layout\n\nAdmin panel layout:\n• Sidebar (მარცხნივ, ფიქსირებული)\n• Header (ზემოთ, sticky)\n• Main content (Grid ბარათები)\n• Stats ბარათები\n\n📌 გამოიყენე Grid + Flexbox!", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>Dashboard Layout</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "puzzle-12", "title": "Dashboard სტრუქტურა", "description": "ააწყვე dashboard-ის კომპონენტები სწორ თანმიმდევრობით.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "მინი პროექტები II", "moduleNumber": 34, "theory": "🧩 Dashboard სტრუქტურა\n\nDashboard:\n1. Sidebar\n2. Header\n3. Stats Grid\n4. Main Content\n5. Footer", "puzzlePieces": [{"id": "p1", "content": "Sidebar", "order": 1}, {"id": "p2", "content": "Header", "order": 2}, {"id": "p3", "content": "Stats", "order": 3}, {"id": "p4", "content": "Main", "order": 4}, {"id": "p5", "content": "Footer", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>Dashboard სტრუქტურა</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "challenge-35", "title": "Pricing Table", "description": "შექმენი ფასების ცხრილი 3 გეგმით.", "type": "challenge", "difficulty": "medium", "emoji": "💰", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "მინი პროექტები II", "moduleNumber": 34, "theory": "💰 Pricing Table\n\n3 ფასის გეგმა:\n• Basic — $9/თვე\n• Pro — $19/თვე (პოპულარული)\n• Enterprise — $49/თვე\n\n📌 პოპულარულ გეგმას:\n• transform: scale(1.05)\n• ფერადი ჩარჩო\n• ბეჯი 'პოპულარული'", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>Pricing Table</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "challenge-36", "title": "Contact გვერდი", "description": "შექმენი Contact Us გვერდი ფორმით და ინფორმაციით.", "type": "challenge", "difficulty": "medium", "emoji": "📬", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "მინი პროექტები II", "moduleNumber": 34, "theory": "📬 Contact გვერდი\n\n2-სვეტიანი layout:\n• მარცხნივ: საკონტაქტო ინფო\n• მარჯვნივ: ფორმა\n\n📌 ფორმა:\n• სახელი, ელფოსტა, შეტყობინება\n• Submit ღილაკი\n• Focus სტილები\n\nგამოიყენე CSS Grid!", "challengeHtml": "<div class=\"challenge-area\">\n  <h2>Contact გვერდი</h2>\n  <p>ტექსტი</p>\n</div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "puzzle-13", "title": "ფორმის ელემენტები", "description": "ააწყვე ფორმის ელემენტები სწორი თანმიმდევრობით.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "მინი პროექტები II", "moduleNumber": 34, "theory": "🧩 ფორმის ელემენტები\n\nსწორი ფორმა:\n1. <form>\n2. <label> + <input>\n3. <textarea>\n4. <button type=\"submit\">", "puzzlePieces": [{"id": "p1", "content": "<form>", "order": 1}, {"id": "p2", "content": "<label>", "order": 2}, {"id": "p3", "content": "<textarea>", "order": 3}, {"id": "p4", "content": "<button", "order": 4}], "correctOrder": ["p1", "p2", "p3", "p4"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>ფორმის ელემენტები</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "puzzle-14", "title": "CSS თვისებების პრიორიტეტი", "description": "ააწყვე CSS specificity-ის დონეები სწორი თანმიმდევრობით.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "მინი პროექტები II", "moduleNumber": 34, "theory": "🧩 CSS Specificity\n\nპრიორიტეტის თანმიმდევრობა:\n1. !important\n2. inline style\n3. #id\n4. .class\n5. element", "puzzlePieces": [{"id": "p1", "content": "!important", "order": 1}, {"id": "p2", "content": "inline", "order": 2}, {"id": "p3", "content": "#id", "order": 3}, {"id": "p4", "content": ".class", "order": 4}, {"id": "p5", "content": "element", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>CSS თვისებების პრიორიტეტი</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "puzzle-15", "title": "ვებ-გვერდის რენდერინგი", "description": "ააწყვე ბრაუზერის რენდერინგის ეტაპები.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "მინი პროექტები II", "moduleNumber": 34, "theory": "🧩 რენდერინგის ეტაპები\n\nბრაუზერი:\n1. HTML-ის წაკითხვა\n2. DOM-ის აგება\n3. CSS-ის წაკითხვა\n4. CSSOM-ის აგება\n5. Layout & Paint", "puzzlePieces": [{"id": "p1", "content": "HTML-ის", "order": 1}, {"id": "p2", "content": "DOM-ის", "order": 2}, {"id": "p3", "content": "CSS-ის", "order": 3}, {"id": "p4", "content": "CSSOM-ის", "order": 4}, {"id": "p5", "content": "Layout", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>ვებ-გვერდის რენდერინგი</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "editor-84", "title": "CSS Clamp ფუნქცია", "description": "ისწავლე clamp() ფუნქცია responsive ზომების შესაქმნელად.", "type": "editor", "difficulty": "medium", "emoji": "📐", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "მინი პროექტები II", "moduleNumber": 34, "theory": "📐 CSS Clamp\n\nclamp() 3 მნიშვნელობას იღებს: min, preferred, max.\n\n📌 სინტაქსი:\nfont-size: clamp(1rem, 2.5vw, 2rem);\n\n💡 ეს ნიშნავს:\n• მინიმუმ 1rem\n• სასურველი 2.5vw\n• მაქსიმუმ 2rem\n\n📌 გამოყენება:\n• font-size — ტექსტის ზომა\n• width — სიგანე\n• padding — დაშორება", "starterCode": "<h1>Responsive Text</h1>", "steps": [{"instruction": "დაამატე clamp font-size", "expectedCode": "<h1 style=\"font-size: clamp(1rem, 3vw, 2.5rem);\">Responsive Text</h1>", "hint": "გამოიყენე style=\"font-size: clamp(1rem, 3vw, 2.5rem);\""}]},
  {"id": "editor-85", "title": "Rotate ტრანსფორმაცია", "description": "ისწავლე ელემენტის ბრუნვა transform: rotate()-ით.", "type": "editor", "difficulty": "medium", "emoji": "🔄", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Transform", "moduleNumber": 35, "theory": "🔄 Transform: Rotate\n\nrotate() ელემენტს აბრუნებს.\n\n📌 სინტაქსი:\ntransform: rotate(45deg);\n\n💡 მნიშვნელობები:\n• deg — გრადუსი\n• turn — სრული ბრუნვა (1turn = 360deg)\n• დადებითი — საათის მიმართულებით\n• უარყოფითი — საათის საწინააღმდეგოდ", "starterCode": "<div class=\"box\">🔄</div>", "steps": [{"instruction": "მოაბრუნე ელემენტი 45 გრადუსით", "expectedCode": "<div class=\"box\" style=\"transform: rotate(45deg);\">🔄</div>", "hint": "დაამატე style=\"transform: rotate(45deg);\""}]},
  {"id": "editor-86", "title": "Scale ტრანსფორმაცია", "description": "ისწავლე ელემენტის გადიდება/დაპატარავება scale()-ით.", "type": "editor", "difficulty": "medium", "emoji": "🔎", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Transform", "moduleNumber": 35, "theory": "🔎 Transform: Scale\n\nscale() ელემენტის ზომას ცვლის.\n\n📌 მაგალითები:\n• scale(1.5) — 50%-ით გადიდება\n• scale(0.5) — 50%-ით დაპატარავება\n• scaleX(2) — მხოლოდ სიგანე\n• scaleY(0.8) — მხოლოდ სიმაღლე", "starterCode": "<div class=\"card\">📦</div>", "steps": [{"instruction": "გაადიდე ელემენტი 1.2-ჯერ", "expectedCode": "<div class=\"card\" style=\"transform: scale(1.2);\">📦</div>", "hint": "გამოიყენე transform: scale(1.2);"}]},
  {"id": "editor-87", "title": "Translate ტრანსფორმაცია", "description": "ისწავლე ელემენტის გადაადგილება translate()-ით.", "type": "editor", "difficulty": "medium", "emoji": "↗️", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Transform", "moduleNumber": 35, "theory": "↗️ Transform: Translate\n\ntranslate() ელემენტს ადგილიდან ძრავს.\n\n📌 სინტაქსი:\n• translateX(50px) — მარჯვნივ\n• translateY(-20px) — ზემოთ\n• translate(50px, -20px) — ორივე\n\n💡 ეს layout-ს არ ცვლის — მხოლოდ ვიზუალურად ძრავს!", "starterCode": "<div class=\"item\">➡️</div>", "steps": [{"instruction": "გადაიტანე ელემენტი მარჯვნივ 30px-ით", "expectedCode": "<div class=\"item\" style=\"transform: translateX(30px);\">➡️</div>", "hint": "გამოიყენე transform: translateX(30px);"}]},
  {"id": "editor-88", "title": "Skew ტრანსფორმაცია", "description": "ისწავლე ელემენტის დახრა skew()-ით.", "type": "editor", "difficulty": "medium", "emoji": "📐", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Transform", "moduleNumber": 35, "theory": "📐 Transform: Skew\n\nskew() ელემენტს ახრის.\n\n📌 სინტაქსი:\n• skewX(10deg) — ჰორიზონტალური დახრა\n• skewY(5deg) — ვერტიკალური დახრა\n• skew(10deg, 5deg) — ორივე\n\n💡 ხშირად დეკორაციულ ელემენტებზე გამოიყენება.", "starterCode": "<div class=\"skewed\">Skew</div>", "steps": [{"instruction": "დაახარე ელემენტი 10 გრადუსით", "expectedCode": "<div class=\"skewed\" style=\"transform: skewX(10deg);\">Skew</div>", "hint": "გამოიყენე transform: skewX(10deg);"}]},
  {"id": "challenge-37", "title": "Transform კომბინაცია", "description": "შექმენი ელემენტი რამდენიმე transform ეფექტით ერთად.", "type": "challenge", "difficulty": "medium", "emoji": "🎪", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "CSS Transform", "moduleNumber": 35, "theory": "🎪 Transform კომბინაცია\n\nრამდენიმე transform ერთად:\ntransform: rotate(10deg) scale(1.1) translateY(-5px);\n\n📌 თანმიმდევრობა მნიშვნელოვანია!\nჯერ rotate, მერე scale — განსხვავებულია scale, მერე rotate-სგან.", "challengeHtml": "<div class=\"challenge-area\"><h2>Transform კომბინაცია</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-89", "title": "Background Size", "description": "ისწავლე background-size თვისების გამოყენება.", "type": "editor", "difficulty": "medium", "emoji": "🖼️", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Backgrounds Advanced", "moduleNumber": 36, "theory": "🖼️ Background Size\n\nbackground-size ფონის სურათის ზომას აკონტროლებს.\n\n📌 მნიშვნელობები:\n• cover — ავსებს მთლიანად\n• contain — მთლიანად ჩანს\n• 100% 50% — კონკრეტული ზომა\n• auto — ორიგინალი\n\n💡 cover ყველაზე პოპულარულია hero სექციებისთვის!", "starterCode": "<div class=\"hero\">Hero</div>", "steps": [{"instruction": "დაამატე background-size: cover", "expectedCode": "<div class=\"hero\" style=\"background-size: cover; background-position: center;\">Hero</div>", "hint": "დაამატე background-size: cover და background-position: center"}]},
  {"id": "editor-90", "title": "Background Position", "description": "ისწავლე ფონის სურათის პოზიციის მართვა.", "type": "editor", "difficulty": "medium", "emoji": "🎯", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Backgrounds Advanced", "moduleNumber": 36, "theory": "🎯 Background Position\n\nbackground-position ფონის ადგილს განსაზღვრავს.\n\n📌 მნიშვნელობები:\n• center — ცენტრში\n• top right — ზედა მარჯვნივ\n• 50% 30% — პროცენტული\n• 10px 20px — პიქსელური\n\n💡 background: url() center/cover no-repeat; — შემოკლებული ჩაწერა", "starterCode": "<div class=\"bg-box\">Position</div>", "steps": [{"instruction": "განათავსე ფონი ცენტრში", "expectedCode": "<div class=\"bg-box\" style=\"background-position: center;\">Position</div>", "hint": "გამოიყენე background-position: center;"}]},
  {"id": "editor-91", "title": "Multiple Backgrounds", "description": "ისწავლე რამდენიმე ფონის გამოყენება ერთ ელემენტზე.", "type": "editor", "difficulty": "medium", "emoji": "🎨", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Backgrounds Advanced", "moduleNumber": 36, "theory": "🎨 Multiple Backgrounds\n\nCSS-ში ერთ ელემენტზე რამდენიმე ფონი შეიძლება.\n\n📌 სინტაქსი:\nbackground:\n  url(top.png) top/100% no-repeat,\n  url(bottom.png) bottom/100% no-repeat,\n  #f0f0f0;\n\n💡 პირველი ფონი ზემოდან ჩნდება, ბოლო — ქვემოთ.", "starterCode": "<div class=\"multi-bg\">Layers</div>", "steps": [{"instruction": "დაამატე ფონის ფერი", "expectedCode": "<div class=\"multi-bg\" style=\"background-color: #f0f4ff;\">Layers</div>", "hint": "გამოიყენე background-color: #f0f4ff;"}]},
  {"id": "challenge-38", "title": "Hero Banner", "description": "შექმენი Hero სექცია ფონის სურათით და ტექსტით.", "type": "challenge", "difficulty": "medium", "emoji": "🏔️", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Backgrounds Advanced", "moduleNumber": 36, "theory": "🏔️ Hero Banner\n\nHero სექცია ფონის სურათით:\n\n📌 ტექნიკა:\n.hero {\n  background: url() center/cover no-repeat;\n  min-height: 400px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  color: white;\n  text-shadow: 0 2px 8px rgba(0,0,0,0.5);\n}", "challengeHtml": "<div class=\"challenge-area\"><h2>Hero Banner</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-92", "title": "Google Fonts", "description": "ისწავლე Google Fonts-ის დაკავშირება ვებ-გვერდთან.", "type": "editor", "difficulty": "medium", "emoji": "🔤", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Typography", "moduleNumber": 37, "theory": "🔤 Google Fonts\n\nGoogle Fonts უფასო შრიფტებს გთავაზობს.\n\n📌 დაკავშირება:\n1. <link> თეგით <head>-ში:\n`<link href=\"https://fonts.googleapis.com/css2?family=Roboto\" rel=\"stylesheet\">`\n\n2. CSS-ში გამოყენება:\nfont-family: 'Roboto', sans-serif;\n\n💡 fonts.google.com — აირჩიე შრიფტი!", "starterCode": "<head>\n</head>\n<body>\n<p>ტექსტი</p>\n</body>", "steps": [{"instruction": "დაამატე Google Font link", "expectedCode": "<head>\n<link href=\"https://fonts.googleapis.com/css2?family=Roboto\" rel=\"stylesheet\">\n</head>\n<body>\n<p>ტექსტი</p>\n</body>", "hint": "დაამატე <link> თეგი head-ის შიგნით"}]},
  {"id": "editor-93", "title": "Text Shadow", "description": "ისწავლე text-shadow ეფექტი ტექსტისთვის.", "type": "editor", "difficulty": "medium", "emoji": "🌟", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Typography", "moduleNumber": 37, "theory": "🌟 Text Shadow\n\ntext-shadow ტექსტს ჩრდილს ამატებს.\n\n📌 სინტაქსი:\ntext-shadow: x y blur color;\n\n💡 მაგალითები:\n• text-shadow: 2px 2px 4px rgba(0,0,0,0.3);\n• text-shadow: 0 0 10px #7c3aed; — glow ეფექტი\n• რამდენიმე ჩრდილი მძიმით გამოყოფილი", "starterCode": "<h1>Shadow Text</h1>", "steps": [{"instruction": "დაამატე text-shadow", "expectedCode": "<h1 style=\"text-shadow: 2px 2px 4px rgba(0,0,0,0.3);\">Shadow Text</h1>", "hint": "გამოიყენე text-shadow: 2px 2px 4px rgba(0,0,0,0.3);"}]},
  {"id": "editor-94", "title": "Letter და Word Spacing", "description": "ისწავლე ასოებსა და სიტყვებს შორის დაშორება.", "type": "editor", "difficulty": "medium", "emoji": "📝", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Typography", "moduleNumber": 37, "theory": "📝 Spacing\n\nletter-spacing — ასოებს შორის დაშორება.\nword-spacing — სიტყვებს შორის.\n\n📌 მაგალითები:\n• letter-spacing: 2px; — ფართო\n• letter-spacing: -0.5px; — მჭიდრო\n• word-spacing: 5px;\n\n💡 სათაურებს ხშირად letter-spacing ემატება!", "starterCode": "<h2>SPACING</h2>", "steps": [{"instruction": "დაამატე letter-spacing", "expectedCode": "<h2 style=\"letter-spacing: 3px;\">SPACING</h2>", "hint": "გამოიყენე letter-spacing: 3px;"}]},
  {"id": "challenge-39", "title": "Typography კომპოზიცია", "description": "შექმენი ლამაზი ტექსტური კომპოზიცია სხვადასხვა სტილით.", "type": "challenge", "difficulty": "medium", "emoji": "🖋️", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Typography", "moduleNumber": 37, "theory": "🖋️ Typography კომპოზიცია\n\nშექმენი ტექსტური კომპოზიცია:\n• სათაური — დიდი, bold, letter-spacing\n• ქვესათაური — italic, ფერადი\n• პარაგრაფი — line-height: 1.8\n• ციტატა — border-left, italic", "challengeHtml": "<div class=\"challenge-area\"><h2>Typography კომპოზიცია</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-95", "title": "სიის სტილიზაცია", "description": "ისწავლე სიის სტილების მართვა list-style თვისებით.", "type": "editor", "difficulty": "medium", "emoji": "📋", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Lists & Navigation", "moduleNumber": 38, "theory": "📋 სიის სტილიზაცია\n\nlist-style სიის მარკერს აკონტროლებს.\n\n📌 მნიშვნელობები:\n• list-style-type: disc | circle | square | none\n• list-style-position: inside | outside\n• list-style-image: url(marker.png)\n\n💡 ნავიგაციისთვის: list-style: none; padding: 0;", "starterCode": "<ul>\n<li>პირველი</li>\n<li>მეორე</li>\n</ul>", "steps": [{"instruction": "მოხსენი სიის მარკერი", "expectedCode": "<ul style=\"list-style: none; padding: 0;\">\n<li>პირველი</li>\n<li>მეორე</li>\n</ul>", "hint": "დაამატე style=\"list-style: none; padding: 0;\""}]},
  {"id": "editor-96", "title": "Breadcrumb ნავიგაცია", "description": "ისწავლე breadcrumb ნავიგაციის შექმნა.", "type": "editor", "difficulty": "medium", "emoji": "🍞", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Lists & Navigation", "moduleNumber": 38, "theory": "🍞 Breadcrumb\n\nBreadcrumb გვერდის მდებარეობას აჩვენებს.\n\n📌 სტრუქტურა:\n<nav class=\"breadcrumb\">\n  <a href=\"/\">მთავარი</a> >\n  <a href=\"/blog\">ბლოგი</a> >\n  <span>პოსტი</span>\n</nav>\n\n💡 ბოლო ელემენტი არ არის ბმული!", "starterCode": "", "steps": [{"instruction": "შექმენი breadcrumb", "expectedCode": "<nav>\n<a href=\"#\">მთავარი</a> > <a href=\"#\">ბლოგი</a> > <span>პოსტი</span>\n</nav>", "hint": "გამოიყენე <nav>, <a> და <span> ელემენტები"}]},
  {"id": "puzzle-16", "title": "ნავიგაციის ტიპები", "description": "ააწყვე ნავიგაციის ტიპები სირთულის მიხედვით.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "Lists & Navigation", "moduleNumber": 38, "theory": "🧩 ნავიგაციის ტიპები\n\n1. მარტივი ბმულები\n2. Breadcrumb\n3. Dropdown მენიუ\n4. Sidebar ნავიგაცია\n5. Mega მენიუ", "puzzlePieces": [{"id": "p1", "content": "მარტივი ბმულები", "order": 1}, {"id": "p2", "content": "Breadcrumb", "order": 2}, {"id": "p3", "content": "Dropdown მენიუ", "order": 3}, {"id": "p4", "content": "Sidebar ნავიგაცია", "order": 4}, {"id": "p5", "content": "Mega მენიუ", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>ნავიგაციის ტიპები</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "challenge-40", "title": "ნავიგაციის მენიუ II", "description": "შექმენი ვერტიკალური sidebar ნავიგაცია.", "type": "challenge", "difficulty": "medium", "emoji": "📑", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Lists & Navigation", "moduleNumber": 38, "theory": "📑 Sidebar ნავიგაცია\n\nვერტიკალური მენიუ sidebar-ისთვის:\n\n📌 ტექნიკა:\nnav { width: 250px; background: #1a1a2e; }\nnav a { display: block; padding: 12px 20px; color: white; }\nnav a:hover { background: rgba(255,255,255,0.1); }", "challengeHtml": "<div class=\"challenge-area\"><h2>ნავიგაციის მენიუ II</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-97", "title": "Child Selector", "description": "ისწავლე > (child) სელექტორის გამოყენება.", "type": "editor", "difficulty": "medium", "emoji": "👶", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Combinators", "moduleNumber": 39, "theory": "👶 Child Selector (>)\n\n> მხოლოდ პირდაპირ შვილებს არჩევს.\n\n📌 მაგალითი:\ndiv > p { color: red; }\n\nეს არჩევს მხოლოდ div-ის პირდაპირ p ელემენტებს, არა ჩაბუდებულებს.\n\n💡 div p (space) — ყველა შვილს, > — მხოლოდ პირდაპირს.", "starterCode": "<div>\n<p>პირდაპირი</p>\n<span><p>ჩაბუდებული</p></span>\n</div>", "steps": [{"instruction": "გამოიყენე child selector", "expectedCode": "<div>\n<p style=\"color: red;\">პირდაპირი</p>\n<span><p>ჩაბუდებული</p></span>\n</div>", "hint": "პირდაპირ p-ს მიეცი color: red;"}]},
  {"id": "editor-98", "title": "Sibling Selectors", "description": "ისწავლე + და ~ (sibling) სელექტორები.", "type": "editor", "difficulty": "medium", "emoji": "👫", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Combinators", "moduleNumber": 39, "theory": "👫 Sibling Selectors\n\n+ (adjacent sibling) — პირდაპირ შემდეგს.\n~ (general sibling) — ყველა შემდეგს.\n\n📌 მაგალითი:\nh2 + p { font-weight: bold; }\n— h2-ის შემდეგ პირველ p-ს bold აქვს.\n\nh2 ~ p { color: gray; }\n— h2-ის შემდეგ ყველა p ნაცრისფერია.", "starterCode": "<h2>სათაური</h2>\n<p>პირველი</p>\n<p>მეორე</p>", "steps": [{"instruction": "გახადე პირველი p bold", "expectedCode": "<h2>სათაური</h2>\n<p style=\"font-weight: bold;\">პირველი</p>\n<p>მეორე</p>", "hint": "პირველ p-ს დაამატე font-weight: bold;"}]},
  {"id": "editor-99", "title": "Attribute Selectors", "description": "ისწავლე ატრიბუტის სელექტორები [attr].", "type": "editor", "difficulty": "medium", "emoji": "🏷️", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Combinators", "moduleNumber": 39, "theory": "🏷️ Attribute Selectors\n\n[attr] — ატრიბუტის მქონე ელემენტები.\n\n📌 ტიპები:\n• [href] — href-ის მქონე\n• [type=\"text\"] — ზუსტი მნიშვნელობა\n• [class^=\"btn\"] — იწყება btn-ით\n• [src$=\".png\"] — მთავრდება .png-ით\n• [title*=\"hello\"] — შეიცავს hello-ს", "starterCode": "<input type=\"text\">\n<input type=\"email\">", "steps": [{"instruction": "მიეცი text input-ს ჩარჩო", "expectedCode": "<input type=\"text\" style=\"border: 2px solid #7c3aed;\">\n<input type=\"email\">", "hint": "პირველ input-ს დაამატე border style"}]},
  {"id": "challenge-41", "title": "სელექტორების პრაქტიკა", "description": "გამოიყენე სხვადასხვა CSS სელექტორი ელემენტების სტილიზაციისთვის.", "type": "challenge", "difficulty": "medium", "emoji": "🎯", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "CSS Combinators", "moduleNumber": 39, "theory": "🎯 სელექტორების პრაქტიკა\n\nგამოიყენე:\n• .class სელექტორი\n• #id სელექტორი\n• child selector (>)\n• :nth-child()\n• [attribute] სელექტორი\n\nთითოეულს განსხვავებული სტილი მიეცი!", "challengeHtml": "<div class=\"challenge-area\"><h2>სელექტორების პრაქტიკა</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-100", "title": "Em და Rem ერთეულები", "description": "ისწავლე em და rem ერთეულების განსხვავება.", "type": "editor", "difficulty": "medium", "emoji": "📏", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Units", "moduleNumber": 40, "theory": "📏 Em vs Rem\n\nem — მშობლის font-size-ზე დამოკიდებული.\nrem — root (html) font-size-ზე.\n\n📌 მაგალითი:\nhtml { font-size: 16px; }\n.parent { font-size: 20px; }\n.child-em { font-size: 1.5em; } → 30px\n.child-rem { font-size: 1.5rem; } → 24px\n\n💡 rem პროგნოზირებადია, em — კასკადური.", "starterCode": "<p>Em და Rem</p>", "steps": [{"instruction": "გამოიყენე rem ზომა", "expectedCode": "<p style=\"font-size: 1.5rem;\">Em და Rem</p>", "hint": "გამოიყენე font-size: 1.5rem;"}]},
  {"id": "editor-101", "title": "Viewport ერთეულები", "description": "ისწავლე vw, vh, vmin, vmax ერთეულები.", "type": "editor", "difficulty": "medium", "emoji": "📐", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Units", "moduleNumber": 40, "theory": "📐 Viewport ერთეულები\n\n• vw — viewport width-ის %\n• vh — viewport height-ის %\n• vmin — მინიმალური მხარე\n• vmax — მაქსიმალური მხარე\n\n📌 მაგალითი:\n.hero { height: 100vh; } — სრულ ეკრანზე\n.title { font-size: 5vw; } — ეკრანთან ერთად იზრდება", "starterCode": "<div class=\"fullscreen\">VH/VW</div>", "steps": [{"instruction": "გახადე ელემენტი სრული ეკრანის სიმაღლის", "expectedCode": "<div class=\"fullscreen\" style=\"height: 100vh;\">VH/VW</div>", "hint": "გამოიყენე height: 100vh;"}]},
  {"id": "editor-102", "title": "Calc ფუნქცია", "description": "ისწავლე calc() ფუნქცია მათემატიკური გამოთვლებისთვის.", "type": "editor", "difficulty": "medium", "emoji": "🧮", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Units", "moduleNumber": 40, "theory": "🧮 CSS Calc()\n\ncalc() სხვადასხვა ერთეულს აერთიანებს.\n\n📌 სინტაქსი:\nwidth: calc(100% - 40px);\n\n💡 მაგალითები:\n• height: calc(100vh - 60px); — header-ის გარეშე\n• width: calc(50% - 20px); — ნახევარი minus padding\n• font-size: calc(1rem + 0.5vw); — responsive", "starterCode": "<div class=\"sidebar\">Sidebar</div>", "steps": [{"instruction": "გამოიყენე calc() სიგანისთვის", "expectedCode": "<div class=\"sidebar\" style=\"width: calc(100% - 250px);\">Sidebar</div>", "hint": "გამოიყენე width: calc(100% - 250px);"}]},
  {"id": "puzzle-17", "title": "CSS ერთეულები", "description": "ააწყვე CSS ერთეულები ზომის მიხედვით.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "CSS Units", "moduleNumber": 40, "theory": "🧩 CSS ერთეულები\n\nპატარადან დიდისკენ:\n1. px — ფიქსირებული პიქსელი\n2. em — მშობელთან შედარებით\n3. rem — root-თან შედარებით\n4. % — პროცენტული\n5. vw/vh — viewport-ის", "puzzlePieces": [{"id": "p1", "content": "px", "order": 1}, {"id": "p2", "content": "em", "order": 2}, {"id": "p3", "content": "rem", "order": 3}, {"id": "p4", "content": "%", "order": 4}, {"id": "p5", "content": "vw/vh", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>CSS ერთეულები</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "editor-103", "title": "Display ტიპები", "description": "ისწავლე display თვისების სხვადასხვა მნიშვნელობა.", "type": "editor", "difficulty": "medium", "emoji": "📦", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Display Property", "moduleNumber": 41, "theory": "📦 Display Property\n\ndisplay განსაზღვრავს ელემენტის ტიპს.\n\n📌 ძირითადი:\n• block — სრული სიგანე, ახალი ხაზი\n• inline — ტექსტის ნაწილი\n• inline-block — inline + block თვისებები\n• none — უჩინარი\n• flex — Flexbox კონტეინერი\n• grid — Grid კონტეინერი", "starterCode": "<span>Inline</span>\n<div>Block</div>", "steps": [{"instruction": "გახადე span ბლოკ ელემენტი", "expectedCode": "<span style=\"display: block;\">Inline</span>\n<div>Block</div>", "hint": "დაამატე display: block; span-ს"}]},
  {"id": "editor-104", "title": "Visibility vs Display", "description": "ისწავლე visibility და display: none განსხვავება.", "type": "editor", "difficulty": "medium", "emoji": "👁️", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Display Property", "moduleNumber": 41, "theory": "👁️ Visibility vs Display\n\ndisplay: none — ელემენტი მთლიანად ქრება, ადგილს არ იკავებს.\nvisibility: hidden — ელემენტი უჩინარია, მაგრამ ადგილს იკავებს.\n\n📌 opacity: 0 — გამჭვირვალე, მაგრამ click-ებს იჭერს!\n\n💡 display: none — layout-ისთვის\nvisibility: hidden — ანიმაციისთვის", "starterCode": "<div>visible</div>\n<div>hidden</div>", "steps": [{"instruction": "დამალე მეორე div", "expectedCode": "<div>visible</div>\n<div style=\"visibility: hidden;\">hidden</div>", "hint": "დაამატე visibility: hidden; მეორე div-ს"}]},
  {"id": "challenge-42", "title": "Toggle Menu", "description": "შექმენი მენიუ, რომელიც display-ით იმალება/ჩნდება.", "type": "challenge", "difficulty": "medium", "emoji": "☰", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Display Property", "moduleNumber": 41, "theory": "☰ Toggle Menu\n\nmenu display: none-ით იმალება.\n\n📌 ტექნიკა:\n.menu { display: none; }\n.menu.active { display: block; }\n\n💡 JavaScript-ით class ემატება:\nmenu.classList.toggle('active');", "challengeHtml": "<div class=\"challenge-area\"><h2>Toggle Menu</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-105", "title": "Border Styles", "description": "ისწავლე სხვადასხვა ტიპის ჩარჩოები.", "type": "editor", "difficulty": "medium", "emoji": "🔲", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Borders & Shadows", "moduleNumber": 42, "theory": "🔲 Border Styles\n\nborder-style სხვადასხვა ჩარჩოს ტიპებს გთავაზობს.\n\n📌 ტიპები:\n• solid — უწყვეტი\n• dashed — წყვეტილი\n• dotted — წერტილოვანი\n• double — ორმაგი\n• groove — 3D ღარი\n• ridge — 3D ქედი\n\n💡 border: 2px solid #333; — შემოკლება", "starterCode": "<div class=\"bordered\">Border</div>", "steps": [{"instruction": "დაამატე dashed ჩარჩო", "expectedCode": "<div class=\"bordered\" style=\"border: 2px dashed #7c3aed;\">Border</div>", "hint": "გამოიყენე border: 2px dashed #7c3aed;"}]},
  {"id": "editor-106", "title": "Box Shadow Advanced", "description": "ისწავლე box-shadow-ის გაფართოებული გამოყენება.", "type": "editor", "difficulty": "medium", "emoji": "🌑", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Borders & Shadows", "moduleNumber": 42, "theory": "🌑 Box Shadow Advanced\n\nbox-shadow რამდენიმე ჩრდილს უჭერს მხარს.\n\n📌 სინტაქსი:\nbox-shadow: x y blur spread color;\n\n💡 მაგალითები:\n• inset — შიდა ჩრდილი\n• რამდენიმე: box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1);\n• ეს 'layered shadow' ეფექტს ქმნის!", "starterCode": "<div class=\"shadow-box\">Shadow</div>", "steps": [{"instruction": "დაამატე layered shadow", "expectedCode": "<div class=\"shadow-box\" style=\"box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 8px 16px rgba(0,0,0,0.1);\">Shadow</div>", "hint": "გამოიყენე ორი shadow მძიმით გამოყოფილი"}]},
  {"id": "editor-107", "title": "Border Image", "description": "ისწავლე border-image თვისება დეკორატიული ჩარჩოსთვის.", "type": "editor", "difficulty": "medium", "emoji": "🎭", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Borders & Shadows", "moduleNumber": 42, "theory": "🎭 Border Image\n\nborder-image ჩარჩოში სურათს ან გრადიენტს ათავსებს.\n\n📌 მაგალითი:\nborder: 3px solid;\nborder-image: linear-gradient(to right, #7c3aed, #f59e0b) 1;\n\n💡 ეს ფერად ჩარჩოს ქმნის!", "starterCode": "<div class=\"gradient-border\">Fancy Border</div>", "steps": [{"instruction": "დაამატე ფერადი ჩარჩო", "expectedCode": "<div class=\"gradient-border\" style=\"border: 3px solid #7c3aed; border-radius: 8px;\">Fancy Border</div>", "hint": "გამოიყენე border: 3px solid #7c3aed;"}]},
  {"id": "challenge-43", "title": "Card Design System", "description": "შექმენი 3 სხვადასხვა სტილის ბარათი shadow-ით და border-ით.", "type": "challenge", "difficulty": "medium", "emoji": "🃏", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Borders & Shadows", "moduleNumber": 42, "theory": "🃏 Card Design System\n\n3 სხვადასხვა ბარათი:\n1. Flat — border, no shadow\n2. Elevated — box-shadow\n3. Outlined — dashed border\n\nთითოეულს hover ეფექტი!", "challengeHtml": "<div class=\"challenge-area\"><h2>Card Design System</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-108", "title": ":nth-child სელექტორი", "description": "ისწავლე :nth-child() სელექტორი.", "type": "editor", "difficulty": "medium", "emoji": "🔢", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Pseudo Classes Advanced", "moduleNumber": 43, "theory": "🔢 :nth-child()\n\n:nth-child() კონკრეტულ შვილ ელემენტს ირჩევს.\n\n📌 მაგალითები:\n• :nth-child(2) — მეორე\n• :nth-child(odd) — კენტი\n• :nth-child(even) — ლუწი\n• :nth-child(3n) — ყოველ მე-3\n• :nth-child(3n+1) — 1, 4, 7...\n\n💡 ცხრილის stripe ეფექტისთვის: tr:nth-child(even)", "starterCode": "<ul>\n<li>1</li>\n<li>2</li>\n<li>3</li>\n</ul>", "steps": [{"instruction": "გაფერადე ლუწი ელემენტები", "expectedCode": "<ul>\n<li>1</li>\n<li style=\"background: #f0f4ff;\">2</li>\n<li>3</li>\n</ul>", "hint": "მეორე li-ს მიეცი background"}]},
  {"id": "editor-109", "title": ":first-child და :last-child", "description": "ისწავლე პირველი და ბოლო ელემენტის სელექტორები.", "type": "editor", "difficulty": "medium", "emoji": "1️⃣", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Pseudo Classes Advanced", "moduleNumber": 43, "theory": "1️⃣ :first-child & :last-child\n\n:first-child — პირველ შვილს ირჩევს.\n:last-child — ბოლო შვილს.\n\n📌 მაგალითი:\nli:first-child { font-weight: bold; }\nli:last-child { border-bottom: none; }\n\n💡 :first-of-type და :last-of-type — კონკრეტული ტიპის პირველი/ბოლო.", "starterCode": "<div>\n<p>პირველი</p>\n<p>მეორე</p>\n<p>ბოლო</p>\n</div>", "steps": [{"instruction": "გახადე პირველი p bold", "expectedCode": "<div>\n<p style=\"font-weight: bold;\">პირველი</p>\n<p>მეორე</p>\n<p>ბოლო</p>\n</div>", "hint": "პირველ p-ს დაამატე font-weight: bold;"}]},
  {"id": "challenge-44", "title": "Zebra Table", "description": "შექმენი ცხრილი zebra stripe ეფექტით :nth-child-ით.", "type": "challenge", "difficulty": "medium", "emoji": "🦓", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Pseudo Classes Advanced", "moduleNumber": 43, "theory": "🦓 Zebra Table\n\ncხრილი ზოლებიანი ეფექტით:\n\ntr:nth-child(even) { background: #f5f5f5; }\ntr:nth-child(odd) { background: white; }\nth { background: #7c3aed; color: white; }\n\n💡 ეს წაკითხვას ადვილებს!", "challengeHtml": "<div class=\"challenge-area\"><h2>Zebra Table</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-110", "title": "Cursor თვისება", "description": "ისწავლე cursor თვისება მაუსის მაჩვენებლის შეცვლისთვის.", "type": "editor", "difficulty": "medium", "emoji": "👆", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Cursor & UX", "moduleNumber": 44, "theory": "👆 Cursor Property\n\ncursor მაუსის მაჩვენებელს ცვლის.\n\n📌 ტიპები:\n• pointer — ხელი (ბმულებისთვის)\n• grab / grabbing — ჩაჭიდება\n• not-allowed — აკრძალული\n• crosshair — ჯვარი\n• text — ტექსტი\n• wait — ლოდინი\n• zoom-in / zoom-out — zoom\n\n💡 cursor: pointer; — ყველა ინტერაქტიულ ელემენტზე!", "starterCode": "<button>Click me</button>", "steps": [{"instruction": "დაამატე pointer cursor", "expectedCode": "<button style=\"cursor: pointer;\">Click me</button>", "hint": "გამოიყენე cursor: pointer;"}]},
  {"id": "editor-111", "title": "User Select", "description": "ისწავლე user-select თვისება ტექსტის არჩევის მართვისთვის.", "type": "editor", "difficulty": "medium", "emoji": "✋", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Cursor & UX", "moduleNumber": 44, "theory": "✋ User Select\n\nuser-select ტექსტის მონიშვნას აკონტროლებს.\n\n📌 მნიშვნელობები:\n• none — არ მოინიშნოს\n• text — ტექსტი (default)\n• all — ყველაფერი ერთი click-ით\n\n💡 user-select: none; — ღილაკებზე და UI ელემენტებზე.", "starterCode": "<p>ტექსტი</p>", "steps": [{"instruction": "გათიშე ტექსტის მონიშვნა", "expectedCode": "<p style=\"user-select: none;\">ტექსტი</p>", "hint": "გამოიყენე user-select: none;"}]},
  {"id": "challenge-45", "title": "Interactive Button", "description": "შექმენი ღილაკი სრული UX-ით — cursor, hover, active, disabled.", "type": "challenge", "difficulty": "medium", "emoji": "🎮", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Cursor & UX", "moduleNumber": 44, "theory": "🎮 Interactive Button\n\nსრული UX ღილაკი:\n• cursor: pointer\n• :hover — ფერის ცვლა\n• :active — press ეფექტი (scale: 0.95)\n• :disabled — cursor: not-allowed, opacity: 0.5", "challengeHtml": "<div class=\"challenge-area\"><h2>Interactive Button</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-112", "title": "Aspect Ratio", "description": "ისწავლე aspect-ratio თვისება.", "type": "editor", "difficulty": "medium", "emoji": "📐", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Aspect Ratio & Object Fit", "moduleNumber": 45, "theory": "📐 Aspect Ratio\n\naspect-ratio ელემენტის პროპორციას ინარჩუნებს.\n\n📌 სინტაქსი:\naspect-ratio: 16/9;\naspect-ratio: 1; — კვადრატი\naspect-ratio: 4/3;\n\n💡 ვიდეო კონტეინერისთვის:\n.video { aspect-ratio: 16/9; width: 100%; }", "starterCode": "<div class=\"video\">16:9</div>", "steps": [{"instruction": "დაამატე aspect-ratio", "expectedCode": "<div class=\"video\" style=\"aspect-ratio: 16/9; width: 100%;\">16:9</div>", "hint": "გამოიყენე aspect-ratio: 16/9;"}]},
  {"id": "editor-113", "title": "Object Fit", "description": "ისწავლე object-fit თვისება სურათებისთვის.", "type": "editor", "difficulty": "medium", "emoji": "🖼️", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "Aspect Ratio & Object Fit", "moduleNumber": 45, "theory": "🖼️ Object Fit\n\nobject-fit სურათის მორგებას აკონტროლებს.\n\n📌 მნიშვნელობები:\n• cover — ავსებს, ჭრის\n• contain — სრულად ჩანს\n• fill — ჭიმავს (default)\n• none — ორიგინალი ზომა\n• scale-down — contain ან none (პატარა)\n\n💡 cover + object-position: center; — ყველაზე პოპულარული!", "starterCode": "<img src=\"photo.jpg\" alt=\"fit\">", "steps": [{"instruction": "დაამატე object-fit: cover", "expectedCode": "<img src=\"photo.jpg\" alt=\"fit\" style=\"width: 200px; height: 200px; object-fit: cover;\">", "hint": "მიეცი ფიქსირებული ზომა და object-fit: cover;"}]},
  {"id": "challenge-46", "title": "Image Gallery Grid", "description": "შექმენი გალერეა, სადაც ყველა სურათი ერთი ზომისაა object-fit-ით.", "type": "challenge", "difficulty": "medium", "emoji": "🏞️", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Aspect Ratio & Object Fit", "moduleNumber": 45, "theory": "🏞️ Image Gallery\n\nGrid გალერეა თანაბარი სურათებით:\n\n.gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }\n.gallery img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px; }", "challengeHtml": "<div class=\"challenge-area\"><h2>Image Gallery Grid</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-114", "title": "CSS წრე", "description": "ისწავლე წრის შექმნა border-radius-ით.", "type": "editor", "difficulty": "medium", "emoji": "⭕", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "წმინდა CSS Shapes", "moduleNumber": 46, "theory": "⭕ CSS წრე\n\nborder-radius: 50% კვადრატს წრეს ხდის.\n\n📌 მაგალითი:\n.circle {\n  width: 100px;\n  height: 100px;\n  border-radius: 50%;\n  background: #7c3aed;\n}\n\n💡 width === height აუცილებელია!", "starterCode": "<div class=\"shape\">O</div>", "steps": [{"instruction": "შექმენი წრე", "expectedCode": "<div class=\"shape\" style=\"width: 100px; height: 100px; border-radius: 50%; background: #7c3aed; color: white; display: flex; align-items: center; justify-content: center;\">O</div>", "hint": "მიეცი თანაბარი width/height და border-radius: 50%"}]},
  {"id": "editor-115", "title": "CSS სამკუთხედი", "description": "ისწავლე სამკუთხედის შექმნა border-ით.", "type": "editor", "difficulty": "medium", "emoji": "🔺", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "წმინდა CSS Shapes", "moduleNumber": 46, "theory": "🔺 CSS სამკუთხედი\n\nსამკუთხედი border-ის ტრიუკით იქმნება.\n\n📌 ტექნიკა:\n.triangle {\n  width: 0;\n  height: 0;\n  border-left: 50px solid transparent;\n  border-right: 50px solid transparent;\n  border-bottom: 80px solid #f59e0b;\n}\n\n💡 border-ის მიმართულება სამკუთხედის მიმართულებას განსაზღვრავს.", "starterCode": "<div class=\"triangle\"></div>", "steps": [{"instruction": "შექმენი სამკუთხედი", "expectedCode": "<div class=\"triangle\" style=\"width: 0; height: 0; border-left: 40px solid transparent; border-right: 40px solid transparent; border-bottom: 60px solid #f59e0b;\"></div>", "hint": "გამოიყენე border-ის ტექნიკა width: 0; height: 0;"}]},
  {"id": "challenge-47", "title": "CSS Art", "description": "შექმენი მარტივი CSS ხატულა წრეებითა და კვადრატებით.", "type": "challenge", "difficulty": "medium", "emoji": "🎨", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "წმინდა CSS Shapes", "moduleNumber": 46, "theory": "🎨 CSS Art\n\nშექმენი emoji-ს მსგავსი სახე:\n• დიდი წრე — სახე\n• 2 პატარა წრე — თვალები\n• ოვალი — პირი\n\nგამოიყენე position: absolute განლაგებისთვის!", "challengeHtml": "<div class=\"challenge-area\"><h2>CSS Art</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-116", "title": "CSS Counter", "description": "ისწავლე CSS counter-ით ავტომატური ნუმერაცია.", "type": "editor", "difficulty": "medium", "emoji": "🔢", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Counters", "moduleNumber": 47, "theory": "🔢 CSS Counters\n\nCSS counter ავტომატურად ნომრავს ელემენტებს.\n\n📌 სინტაქსი:\nbody { counter-reset: section; }\nh2::before {\n  counter-increment: section;\n  content: counter(section) '. ';\n}\n\n💡 ეს ავტომატურად ანომრებს ყველა h2-ს: 1. 2. 3. ...", "starterCode": "<h2>პირველი</h2>\n<h2>მეორე</h2>", "steps": [{"instruction": "დაანომრე სათაურები", "expectedCode": "<h2>1. პირველი</h2>\n<h2>2. მეორე</h2>", "hint": "ხელით დაამატე ნომრები სათაურებში"}]},
  {"id": "editor-117", "title": "Ordered List Customization", "description": "ისწავლე სიის ნუმერაციის სტილის ცვლა.", "type": "editor", "difficulty": "medium", "emoji": "📝", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "CSS Counters", "moduleNumber": 47, "theory": "📝 List Counter Style\n\nlist-style-type ნუმერაციის სტილს ცვლის.\n\n📌 ტიპები:\n• decimal — 1, 2, 3\n• lower-alpha — a, b, c\n• upper-roman — I, II, III\n• georgian — ქართული\n• none — მოხსნა\n\n💡 list-style-type: georgian; — ქართული ნუმერაცია!", "starterCode": "<ol>\n<li>პირველი</li>\n<li>მეორე</li>\n</ol>", "steps": [{"instruction": "შეცვალე ნუმერაციის სტილი", "expectedCode": "<ol style=\"list-style-type: upper-roman;\">\n<li>პირველი</li>\n<li>მეორე</li>\n</ol>", "hint": "გამოიყენე list-style-type: upper-roman;"}]},
  {"id": "puzzle-18", "title": "CSS თვისებების კატეგორიები", "description": "ააწყვე CSS თვისებები კატეგორიების მიხედვით.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "CSS Counters", "moduleNumber": 47, "theory": "🧩 CSS კატეგორიები\n\n1. Layout — display, position, flex, grid\n2. Box Model — margin, padding, border\n3. Typography — font, text, letter-spacing\n4. Visual — color, background, shadow\n5. Animation — transition, animation, transform", "puzzlePieces": [{"id": "p1", "content": "Layout", "order": 1}, {"id": "p2", "content": "Box Model", "order": 2}, {"id": "p3", "content": "Typography", "order": 3}, {"id": "p4", "content": "Visual", "order": 4}, {"id": "p5", "content": "Animation", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>CSS თვისებების კატეგორიები</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "editor-118", "title": "Portfolio Header", "description": "შექმენი portfolio-ს header ნავიგაციით.", "type": "editor", "difficulty": "medium", "emoji": "🏠", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "პროექტი: Portfolio", "moduleNumber": 48, "theory": "🏠 Portfolio Header\n\nProfessional header:\n• ლოგო მარცხნივ\n• ნავიგაცია მარჯვნივ\n• Sticky position\n\n📌 სტრუქტურა:\n<header>\n  <h1>ჩემი სახელი</h1>\n  <nav>\n    <a href=\"#about\">ჩემ შესახებ</a>\n    <a href=\"#projects\">პროექტები</a>\n  </nav>\n</header>", "starterCode": "", "steps": [{"instruction": "შექმენი header ნავიგაციით", "expectedCode": "<header style=\"display: flex; justify-content: space-between; align-items: center; padding: 20px;\">\n<h1>ჩემი სახელი</h1>\n<nav>\n<a href=\"#about\">ჩემ შესახებ</a>\n<a href=\"#projects\">პროექტები</a>\n</nav>\n</header>", "hint": "გამოიყენე <header> flexbox-ით"}]},
  {"id": "editor-119", "title": "Portfolio Hero", "description": "შექმენი portfolio-ს hero სექცია.", "type": "editor", "difficulty": "medium", "emoji": "🦸", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "პროექტი: Portfolio", "moduleNumber": 48, "theory": "🦸 Portfolio Hero\n\nHero სექცია:\n• სახელი და პროფესია\n• CTA ღილაკი\n• სრული ეკრანის სიმაღლე\n\n📌 CSS:\n.hero {\n  height: 100vh;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n}", "starterCode": "", "steps": [{"instruction": "შექმენი hero სექცია", "expectedCode": "<section style=\"height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center;\">\n<h1>გამარჯობა, მე ვარ კოდერი</h1>\n<p>Front-end Developer</p>\n</section>", "hint": "გამოიყენე height: 100vh და flexbox ცენტრირებისთვის"}]},
  {"id": "editor-120", "title": "Portfolio Projects Grid", "description": "შექმენი პროექტების Grid სექცია.", "type": "editor", "difficulty": "medium", "emoji": "📂", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "პროექტი: Portfolio", "moduleNumber": 48, "theory": "📂 Projects Grid\n\nპროექტების ბარათების Grid:\n\n📌 CSS:\n.projects {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));\n  gap: 20px;\n  padding: 40px;\n}\n\n💡 auto-fill + minmax = responsive grid!", "starterCode": "", "steps": [{"instruction": "შექმენი projects grid", "expectedCode": "<section style=\"display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 20px;\">\n<div style=\"border: 1px solid #ddd; padding: 20px; border-radius: 8px;\">პროექტი 1</div>\n<div style=\"border: 1px solid #ddd; padding: 20px; border-radius: 8px;\">პროექტი 2</div>\n</section>", "hint": "გამოიყენე CSS Grid repeat(2, 1fr)-ით"}]},
  {"id": "challenge-48", "title": "სრული Portfolio", "description": "შექმენი სრული portfolio გვერდი header, hero, projects, footer.", "type": "challenge", "difficulty": "medium", "emoji": "💼", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "პროექტი: Portfolio", "moduleNumber": 48, "theory": "💼 სრული Portfolio\n\nგააერთიანე ყველაფერი:\n1. Sticky Header + Nav\n2. Hero (100vh)\n3. About Section\n4. Projects Grid\n5. Contact Form\n6. Footer\n\nეს შენი ფინალური პროექტია!", "challengeHtml": "<div class=\"challenge-area\"><h2>სრული Portfolio</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-121", "title": "Blog Post Layout", "description": "შექმენი ბლოგ პოსტის layout.", "type": "editor", "difficulty": "medium", "emoji": "📰", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "პროექტი: Blog", "moduleNumber": 49, "theory": "📰 Blog Post Layout\n\nბლოგ პოსტი:\n• სათაური (h1)\n• თარიღი და ავტორი\n• სურათი\n• პარაგრაფები\n• ტეგები\n\n📌 max-width: 700px; margin: 0 auto; — წაკითხვისთვის იდეალური სიგანე!", "starterCode": "", "steps": [{"instruction": "შექმენი blog post", "expectedCode": "<article style=\"max-width: 700px; margin: 0 auto; padding: 20px;\">\n<h1>ბლოგ პოსტი</h1>\n<p style=\"color: gray;\">2024-01-15 • ავტორი</p>\n<p>ტექსტი...</p>\n</article>", "hint": "გამოიყენე <article> max-width: 700px-ით"}]},
  {"id": "editor-122", "title": "Blog Sidebar", "description": "შექმენი ბლოგის გვერდითი ბარი.", "type": "editor", "difficulty": "medium", "emoji": "📌", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "პროექტი: Blog", "moduleNumber": 49, "theory": "📌 Blog Sidebar\n\nSidebar შეიცავს:\n• ძებნა\n• კატეგორიები\n• პოპულარული პოსტები\n• ტეგების ღრუბელი\n\n📌 Layout:\n.blog { display: grid; grid-template-columns: 1fr 300px; gap: 30px; }", "starterCode": "", "steps": [{"instruction": "შექმენი sidebar", "expectedCode": "<aside style=\"width: 300px; padding: 20px; border-left: 1px solid #ddd;\">\n<h3>კატეგორიები</h3>\n<ul style=\"list-style: none; padding: 0;\">\n<li>HTML</li>\n<li>CSS</li>\n</ul>\n</aside>", "hint": "გამოიყენე <aside> ელემენტი"}]},
  {"id": "challenge-49", "title": "Blog Page", "description": "შექმენი სრული ბლოგის გვერდი პოსტებით და sidebar-ით.", "type": "challenge", "difficulty": "medium", "emoji": "📝", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "პროექტი: Blog", "moduleNumber": 49, "theory": "📝 Blog Page\n\n2-სვეტიანი layout:\n• მარცხნივ: პოსტების სია (article)\n• მარჯვნივ: sidebar (aside)\n• header + footer\n\nCSS Grid + სემანტიკური HTML!", "challengeHtml": "<div class=\"challenge-area\"><h2>Blog Page</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "editor-123", "title": "Product Card", "description": "შექმენი პროდუქტის ბარათი hover ეფექტებით.", "type": "editor", "difficulty": "medium", "emoji": "🛒", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "პროექტი: E-commerce", "moduleNumber": 50, "theory": "🛒 Product Card\n\nპროდუქტის ბარათი:\n• სურათი (hover zoom)\n• სახელი, ფასი\n• ვარსკვლავები (rating)\n• ღილაკი 'კალათაში'\n\n📌 ტრანსფორმაცია:\n.card img:hover { transform: scale(1.05); }", "starterCode": "", "steps": [{"instruction": "შექმენი product card", "expectedCode": "<div style=\"border: 1px solid #ddd; border-radius: 12px; overflow: hidden; width: 250px;\">\n<div style=\"height: 200px; background: #f0f0f0;\"></div>\n<div style=\"padding: 16px;\">\n<h3>პროდუქტი</h3>\n<p style=\"color: #7c3aed; font-weight: bold;\">₾29.99</p>\n<button style=\"width: 100%; padding: 10px; background: #7c3aed; color: white; border: none; border-radius: 8px; cursor: pointer;\">კალათაში</button>\n</div>\n</div>", "hint": "შექმენი div ჩარჩოთი, შიგნით სურათი, სახელი, ფასი და ღილაკი"}]},
  {"id": "editor-124", "title": "Shopping Cart", "description": "შექმენი კალათის მარტივი UI.", "type": "editor", "difficulty": "medium", "emoji": "🛍️", "color": "from-purple-400 to-indigo-500", "xpReward": 15, "module": "პროექტი: E-commerce", "moduleNumber": 50, "theory": "🛍️ Shopping Cart UI\n\nკალათის ელემენტი:\n• პროდუქტის სახელი\n• რაოდენობა (+ -)\n• ფასი\n• წაშლის ღილაკი\n• ჯამი ქვემოთ\n\n📌 Flexbox ყველა ხაზისთვის!", "starterCode": "", "steps": [{"instruction": "შექმენი cart item", "expectedCode": "<div style=\"display: flex; align-items: center; justify-content: space-between; padding: 16px; border-bottom: 1px solid #ddd;\">\n<span>პროდუქტი</span>\n<span>x2</span>\n<span style=\"font-weight: bold;\">₾59.98</span>\n<button style=\"background: none; border: none; color: red; cursor: pointer;\">✕</button>\n</div>", "hint": "გამოიყენე flexbox space-between-ით"}]},
  {"id": "puzzle-19", "title": "E-commerce Flow", "description": "ააწყვე ონლაინ მაღაზიის ეტაპები სწორი თანმიმდევრობით.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "პროექტი: E-commerce", "moduleNumber": 50, "theory": "🧩 E-commerce Flow\n\nონლაინ შოპინგი:\n1. პროდუქტების ნახვა\n2. კალათაში დამატება\n3. კალათის შემოწმება\n4. გადახდა\n5. შეკვეთის დადასტურება", "puzzlePieces": [{"id": "p1", "content": "პროდუქტების ნახვა", "order": 1}, {"id": "p2", "content": "კალათაში დამატება", "order": 2}, {"id": "p3", "content": "კალათის შემოწმება", "order": 3}, {"id": "p4", "content": "გადახდა", "order": 4}, {"id": "p5", "content": "შეკვეთის დადასტურება", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>E-commerce Flow</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "challenge-50", "title": "Product Page", "description": "შექმენი პროდუქტის სრული გვერდი — სურათი, აღწერა, ფასი, ღილაკი.", "type": "challenge", "difficulty": "medium", "emoji": "🏪", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "პროექტი: E-commerce", "moduleNumber": 50, "theory": "🏪 Product Page\n\nსრული პროდუქტის გვერდი:\n• სურათი მარცხნივ (50%)\n• ინფო მარჯვნივ (50%)\n• სახელი, ფასი, აღწერა\n• ზომის არჩევა\n• 'კალათაში' ღილაკი\n\nCSS Grid 2 სვეტით!", "challengeHtml": "<div class=\"challenge-area\"><h2>Product Page</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "puzzle-20", "title": "Web Development Stack", "description": "ააწყვე ვებ ტექნოლოგიები სწორი თანმიმდევრობით.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "Final Projects", "moduleNumber": 51, "theory": "🧩 Web Dev Stack\n\n1. HTML — სტრუქტურა\n2. CSS — დიზაინი\n3. JavaScript — ინტერაქცია\n4. Framework — React/Vue\n5. Backend — სერვერი", "puzzlePieces": [{"id": "p1", "content": "HTML", "order": 1}, {"id": "p2", "content": "CSS", "order": 2}, {"id": "p3", "content": "JavaScript", "order": 3}, {"id": "p4", "content": "Framework", "order": 4}, {"id": "p5", "content": "Backend", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>Web Development Stack</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "puzzle-21", "title": "CSS Layout Evolution", "description": "ააწყვე CSS layout-ის ევოლუცია.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "Final Projects", "moduleNumber": 51, "theory": "🧩 Layout Evolution\n\n1. Tables (1990s)\n2. Float (2000s)\n3. Inline-block\n4. Flexbox (2012)\n5. CSS Grid (2017)", "puzzlePieces": [{"id": "p1", "content": "Tables (1990s)", "order": 1}, {"id": "p2", "content": "Float (2000s)", "order": 2}, {"id": "p3", "content": "Inline-block", "order": 3}, {"id": "p4", "content": "Flexbox (2012)", "order": 4}, {"id": "p5", "content": "CSS Grid (2017)", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>CSS Layout Evolution</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "challenge-51", "title": "Weather Widget", "description": "შექმენი ამინდის ვიჯეტი CSS-ით.", "type": "challenge", "difficulty": "medium", "emoji": "🌤️", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Final Projects", "moduleNumber": 51, "theory": "🌤️ Weather Widget\n\nამინდის ბარათი:\n• ტემპერატურა (დიდი ტექსტი)\n• ქალაქი\n• ამინდის აიქონი\n• მაქს/მინ ტემპერატურა\n• ჰარის ჩრდილი", "challengeHtml": "<div class=\"challenge-area\"><h2>Weather Widget</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "challenge-52", "title": "Social Media Card", "description": "შექმენი social media პოსტის ბარათი.", "type": "challenge", "difficulty": "medium", "emoji": "📱", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Final Projects", "moduleNumber": 51, "theory": "📱 Social Card\n\nსოციალური მედიის პოსტი:\n• ავატარი + სახელი\n• პოსტის ტექსტი\n• სურათი\n• Like, Comment, Share ღილაკები\n• ქრონოლოგია", "challengeHtml": "<div class=\"challenge-area\"><h2>Social Media Card</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "challenge-53", "title": "Login Page", "description": "შექმენი ლამაზი Login/Register გვერდი.", "type": "challenge", "difficulty": "medium", "emoji": "🔐", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Final Projects", "moduleNumber": 51, "theory": "🔐 Login Page\n\nLogin ფორმა ცენტრში:\n• ლოგო\n• Email input\n• Password input\n• 'Login' ღილაკი\n• 'არ ხარ დარეგისტრირებული?' ბმული\n\nheight: 100vh + flexbox centering!", "challengeHtml": "<div class=\"challenge-area\"><h2>Login Page</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "challenge-54", "title": "Newsletter Section", "description": "შექმენი newsletter-ის subscription სექცია.", "type": "challenge", "difficulty": "medium", "emoji": "📧", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Final Projects", "moduleNumber": 51, "theory": "📧 Newsletter\n\nSubscription სექცია:\n• სათაური\n• აღწერა\n• Email input + Subscribe ღილაკი (inline)\n• ფონის ფერი\n\nFlexbox inline ფორმისთვის!", "challengeHtml": "<div class=\"challenge-area\"><h2>Newsletter Section</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "challenge-55", "title": "Footer Design", "description": "შექმენი პროფესიონალური footer 4 სვეტით.", "type": "challenge", "difficulty": "medium", "emoji": "🦶", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Final Projects", "moduleNumber": 51, "theory": "🦶 Footer Design\n\n4-სვეტიანი footer:\n• About\n• Quick Links\n• Services\n• Contact\n• Copyright ქვემოთ\n\nCSS Grid + border-top!", "challengeHtml": "<div class=\"challenge-area\"><h2>Footer Design</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "challenge-56", "title": "ფინალური პროექტი", "description": "შექმენი სრული ვებ-გვერდი ყველა ნასწავლი ტექნიკით!", "type": "challenge", "difficulty": "medium", "emoji": "🏆", "color": "from-purple-400 to-indigo-500", "xpReward": 25, "module": "Final Projects", "moduleNumber": 51, "theory": "🏆 ფინალური პროექტი\n\nშექმენი სრული ვებ-გვერდი:\n• Responsive Header + Nav\n• Hero Section\n• Features Grid\n• Testimonials\n• Pricing Table\n• Contact Form\n• Footer\n\nეს შენი საუკეთესო პროექტია — გამოიყენე ყველაფერი, რაც ისწავლე! 🎉", "challengeHtml": "<div class=\"challenge-area\"><h2>ფინალური პროექტი</h2><p>ტექსტი</p></div>", "targetCss": ".challenge-area { padding: 20px; border-radius: 12px; font-family: sans-serif; }", "starterCss": ".challenge-area {\n  /* შენი სტილები აქ */\n\n}", "hints": ["გამოიყენე padding ელემენტების დაშორებისთვის.", "დაამატე border-radius მომრგვალებისთვის.", "გამოიყენე font-family: sans-serif;"]},
  {"id": "puzzle-22", "title": "HTML თეგების იერარქია", "description": "ააწყვე HTML თეგები ბუდობრიობის მიხედვით.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "Final Projects", "moduleNumber": 51, "theory": "🧩 HTML იერარქია\n\n1. <!DOCTYPE html>\n2. <html>\n3. <head> / <body>\n4. <header> / <main> / <footer>\n5. <div> / <p> / <h1>", "puzzlePieces": [{"id": "p1", "content": "<!DOCTYPE html>", "order": 1}, {"id": "p2", "content": "<html>", "order": 2}, {"id": "p3", "content": "<head> / <body>", "order": 3}, {"id": "p4", "content": "<header> / <main> / <footer>", "order": 4}, {"id": "p5", "content": "<div> / <p> / <h1>", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>HTML თეგების იერარქია</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "puzzle-23", "title": "CSS Specificity Scale", "description": "ააწყვე CSS პრიორიტეტები სწორი წონით.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "Final Projects", "moduleNumber": 51, "theory": "🧩 Specificity\n\n1. !important (∞)\n2. inline style (1000)\n3. #id (100)\n4. .class (10)\n5. element (1)", "puzzlePieces": [{"id": "p1", "content": "!important (∞)", "order": 1}, {"id": "p2", "content": "inline style (1000)", "order": 2}, {"id": "p3", "content": "#id (100)", "order": 3}, {"id": "p4", "content": ".class (10)", "order": 4}, {"id": "p5", "content": "element (1)", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>CSS Specificity Scale</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "puzzle-24", "title": "Responsive Breakpoints", "description": "ააწყვე breakpoints პატარადან დიდისკენ.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "Final Projects", "moduleNumber": 51, "theory": "🧩 Breakpoints\n\n1. 320px — Small phone\n2. 480px — Phone\n3. 768px — Tablet\n4. 1024px — Laptop\n5. 1440px — Desktop", "puzzlePieces": [{"id": "p1", "content": "320px", "order": 1}, {"id": "p2", "content": "480px", "order": 2}, {"id": "p3", "content": "768px", "order": 3}, {"id": "p4", "content": "1024px", "order": 4}, {"id": "p5", "content": "1440px", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>Responsive Breakpoints</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "puzzle-25", "title": "CSS Box Model Layers", "description": "ააწყვე Box Model-ის ფენები შიგნიდან გარეთ.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "from-purple-400 to-indigo-500", "xpReward": 20, "module": "Final Projects", "moduleNumber": 51, "theory": "🧩 Box Model\n\n1. Content\n2. Padding\n3. Border\n4. Margin\n5. Outline", "puzzlePieces": [{"id": "p1", "content": "Content", "order": 1}, {"id": "p2", "content": "Padding", "order": 2}, {"id": "p3", "content": "Border", "order": 3}, {"id": "p4", "content": "Margin", "order": 4}, {"id": "p5", "content": "Outline", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>CSS Box Model Layers</h3><p>პაზლი სწორად აიწყო! ✅</p></div>"},
  {"id": "editor-213", "title": "clip-path: circle()", "description": "ელემენტს წრიული ფორმა მიეცი.", "type": "editor", "difficulty": "medium", "emoji": "⭕", "color": "#7c3aed", "xpReward": 15, "module": "CSS Clipping", "moduleNumber": 52, "theory": "⭕ clip-path\n\nclip-path ელემენტს ჭრის ფორმით.\n\n📌 მნიშვნელობები:\n• circle() — წრე\n• ellipse() — ოვალი\n• polygon() — მრავალკუთხედი\n• inset() — მართკუთხედი\n\n💡 მაგალითი:\n`clip-path: circle(50%);`", "steps": [{"instruction": "შექმენი div clip-path-ით", "hint": "clip-path: circle(50%)", "expectedCode": "<style>.shape{width:200px;height:200px;background:#7c3aed;clip-path:circle(50%);}</style>\n<div class=\"shape\"></div>"}]},
  {"id": "editor-214", "title": "clip-path: polygon()", "description": "მრავალკუთხედი ფორმა polygon()-ით.", "type": "editor", "difficulty": "medium", "emoji": "🔷", "color": "#6366f1", "xpReward": 15, "module": "CSS Clipping", "moduleNumber": 52, "theory": "🔷 polygon()\n\npolygon() ნებისმიერ ფორმას ქმნის.\n\n📌 სამკუთხედი:\n`polygon(50% 0%, 0% 100%, 100% 100%)`\n\n💡 ექვსკუთხედი:\n`polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)`", "steps": [{"instruction": "შექმენი სამკუთხედი polygon-ით", "hint": "clip-path: polygon(50% 0%, 0% 100%, 100% 100%)", "expectedCode": "<style>.poly{width:200px;height:200px;background:#6366f1;clip-path:polygon(50% 0%, 0% 100%, 100% 100%);}</style>\n<div class=\"poly\"></div>"}]},
  {"id": "challenge-215", "title": "ვარსკვლავი clip-path-ით", "description": "შექმენი ვარსკვლავის ფორმა.", "type": "challenge", "difficulty": "hard", "emoji": "🏆", "color": "#f59e0b", "xpReward": 25, "module": "CSS Clipping", "moduleNumber": 52, "theory": "⭐ ვარსკვლავი\n\npolygon()-ით 10 წერტილიანი ვარსკვლავი:\n`polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)`", "targetHtml": "<div style='width:200px;height:200px;background:#f59e0b;clip-path:polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);'></div>", "starterCss": ".star{width:200px;height:200px;background:#f59e0b;}", "targetCss": "clip-path", "hints": ["clip-path: polygon() 10 წერტილით"]},
  {"id": "puzzle-216", "title": "Clip-path ფუნქციები", "description": "ააწყვე clip-path ფუნქციები.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "#a78bfa", "xpReward": 20, "module": "CSS Clipping", "moduleNumber": 52, "theory": "✂ Clip-path\n\n1. circle()\n2. ellipse()\n3. polygon()\n4. inset()\n5. path()", "puzzlePieces": [{"id": "p1", "content": "circle()", "order": 1}, {"id": "p2", "content": "ellipse()", "order": 2}, {"id": "p3", "content": "polygon()", "order": 3}, {"id": "p4", "content": "inset()", "order": 4}, {"id": "p5", "content": "path()", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>Clip-path ფუნქციები</h3><p>სწორად აიწყო!</p></div>"},
  {"id": "editor-217", "title": "mix-blend-mode", "description": "ტექსტს blend mode მიეცი.", "type": "editor", "difficulty": "medium", "emoji": "🎨", "color": "#ec4899", "xpReward": 15, "module": "CSS Blend Modes", "moduleNumber": 53, "theory": "🎨 mix-blend-mode\n\nBlend modes ელემენტებს ურევს.\n\n📌 მნიშვნელობები:\n• multiply — გამუქება\n• screen — გაღიავება\n• overlay — კონტრასტი\n• difference — განსხვავება", "steps": [{"instruction": "დაამატე mix-blend-mode: difference", "hint": "mix-blend-mode: difference", "expectedCode": "<style>.bg{background:#7c3aed;padding:40px;}.text{color:#f59e0b;font-size:3rem;mix-blend-mode:difference;}</style>\n<div class=\"bg\"><h1 class=\"text\">Blend</h1></div>"}]},
  {"id": "editor-218", "title": "background-blend-mode", "description": "ფონის ფერი და სურათი შეურიე.", "type": "editor", "difficulty": "medium", "emoji": "🖌", "color": "#8b5cf6", "xpReward": 15, "module": "CSS Blend Modes", "moduleNumber": 53, "theory": "🖌 background-blend-mode\n\nbackground-color და background-image ერთად ურევს.\n\n📌 სინტაქსი:\n`background-blend-mode: multiply;`", "steps": [{"instruction": "დაამატე background-blend-mode", "hint": "background-blend-mode: screen", "expectedCode": "<style>.box{width:300px;height:200px;background-color:#7c3aed;background-blend-mode:screen;}</style>\n<div class=\"box\"></div>"}]},
  {"id": "challenge-219", "title": "Blend Mode ეფექტი", "description": "გამოიყენე blend mode ფოტო ეფექტისთვის.", "type": "challenge", "difficulty": "hard", "emoji": "🏆", "color": "#f59e0b", "xpReward": 25, "module": "CSS Blend Modes", "moduleNumber": 53, "theory": "🎨 Blend Effect\n\nmix-blend-mode ან background-blend-mode", "targetHtml": "<div style='width:300px;height:200px;background:#7c3aed;display:flex;align-items:center;justify-content:center;'><h1 style='color:white;mix-blend-mode:overlay;font-size:3rem;'>BLEND</h1></div>", "starterCss": ".text{color:white;font-size:3rem;}", "targetCss": "blend-mode", "hints": ["mix-blend-mode: overlay"]},
  {"id": "editor-220", "title": "scroll-behavior: smooth", "description": "გლუვი სქროლი დაამატე.", "type": "editor", "difficulty": "easy", "emoji": "🔄", "color": "#34d399", "xpReward": 10, "module": "CSS Scroll Effects", "moduleNumber": 54, "theory": "🔄 scroll-behavior\n\n`html { scroll-behavior: smooth; }`\n\nანკორ ლინკებთან მუშაობს.", "steps": [{"instruction": "დაამატე smooth scroll", "hint": "scroll-behavior: smooth", "expectedCode": "<style>html{scroll-behavior:smooth;}</style>\n<a href=\"#end\">ქვემოთ</a>\n<div style='height:600px;'></div>\n<div id=\"end\">ბოლო!</div>"}]},
  {"id": "editor-221", "title": "scroll-snap", "description": "სქროლის snap ეფექტი.", "type": "editor", "difficulty": "medium", "emoji": "📸", "color": "#3b82f6", "xpReward": 15, "module": "CSS Scroll Effects", "moduleNumber": 54, "theory": "📸 scroll-snap\n\n📌 კონტეინერზე:\n`scroll-snap-type: y mandatory;`\n\n📌 შვილებზე:\n`scroll-snap-align: start;`", "steps": [{"instruction": "დაამატე scroll-snap", "hint": "scroll-snap-type: y mandatory", "expectedCode": "<style>.snap{height:200px;overflow-y:scroll;scroll-snap-type:y mandatory;}.item{height:200px;display:flex;align-items:center;justify-content:center;color:white;font-size:2rem;scroll-snap-align:start;}</style>\n<div class=\"snap\"><div class=\"item\" style='background:#7c3aed;'>1</div><div class=\"item\" style='background:#3b82f6;'>2</div><div class=\"item\" style='background:#34d399;'>3</div></div>"}]},
  {"id": "editor-222", "title": "Scrollbar სტილი", "description": "scrollbar-ს custom სტილი მიეცი.", "type": "editor", "difficulty": "medium", "emoji": "📜", "color": "#a78bfa", "xpReward": 15, "module": "CSS Scroll Effects", "moduleNumber": 54, "theory": "📜 Scrollbar\n\n`::-webkit-scrollbar { width: 8px; }`\n`::-webkit-scrollbar-thumb { background: #7c3aed; border-radius: 4px; }`", "steps": [{"instruction": "Custom scrollbar", "hint": "::-webkit-scrollbar", "expectedCode": "<style>.box{height:200px;overflow-y:scroll;background:#1a1a2e;color:white;padding:20px;}.box::-webkit-scrollbar{width:8px;}.box::-webkit-scrollbar-track{background:#1a1a2e;}.box::-webkit-scrollbar-thumb{background:#7c3aed;border-radius:4px;}</style>\n<div class=\"box\"><p>ტექსტი</p><p>კიდევ</p><p>ბევრი</p><p>ტექსტი</p><p>...</p><p>...</p><p>...</p><p>ბოლო</p></div>"}]},
  {"id": "editor-223", "title": "container-type", "description": "კონტეინერ კვერი ისწავლე.", "type": "editor", "difficulty": "hard", "emoji": "📦", "color": "#6366f1", "xpReward": 20, "module": "Container Queries", "moduleNumber": 55, "theory": "📦 Container Queries\n\n📌 კონტეინერი:\n`container-type: inline-size;`\n\n📌 კვერი:\n`@container (min-width: 400px) { ... }`", "steps": [{"instruction": "container query-ის მაგალითი", "hint": "container-type: inline-size", "expectedCode": "<style>.wrapper{container-type:inline-size;width:100%;}.card{background:#1a1a2e;color:white;padding:20px;}@container (min-width:400px){.card{display:flex;gap:20px;}}</style>\n<div class=\"wrapper\"><div class=\"card\"><h3>Title</h3><p>Content</p></div></div>"}]},
  {"id": "challenge-224", "title": "Container Query Challenge", "description": "კომპონენტი კონტეინერ კვერით ადაპტირე.", "type": "challenge", "difficulty": "hard", "emoji": "🏆", "color": "#f59e0b", "xpReward": 30, "module": "Container Queries", "moduleNumber": 55, "theory": "📦 Container Query\n\nკონტეინერის ზომაზე დამოკიდებული სტილები.", "targetHtml": "<style>.w{container-type:inline-size;width:100%;}.c{background:#1a1a2e;color:white;padding:20px;border-radius:12px;}@container(min-width:400px){.c{display:flex;gap:16px;}}</style><div class='w'><div class='c'><h3>Title</h3><p>Responsive to container!</p></div></div>", "starterCss": ".wrapper{container-type:inline-size;}", "targetCss": "container", "hints": ["container-type: inline-size", "@container (min-width: 400px)"]},
  {"id": "editor-225", "title": "margin-inline & padding-block", "description": "ლოგიკური თვისებები ისწავლე.", "type": "editor", "difficulty": "medium", "emoji": "↔", "color": "#14b8a6", "xpReward": 15, "module": "Logical Properties", "moduleNumber": 56, "theory": "↔ Logical Properties\n\n• margin-inline = margin-left/right\n• padding-block = padding-top/bottom\n• inline-size = width\n• block-size = height", "steps": [{"instruction": "გამოიყენე logical properties", "hint": "margin-inline: auto; padding-block: 20px", "expectedCode": "<style>.box{margin-inline:auto;padding-block:20px;inline-size:300px;background:#14b8a6;color:white;text-align:center;border-radius:8px;}</style>\n<div class=\"box\">Logical Properties</div>"}]},
  {"id": "editor-226", "title": "border-inline", "description": "ლოგიკური border თვისებები.", "type": "editor", "difficulty": "medium", "emoji": "🔲", "color": "#0ea5e9", "xpReward": 15, "module": "Logical Properties", "moduleNumber": 56, "theory": "🔲 ლოგიკური Borders\n\n• border-inline-start — მარცხენა (LTR)\n• border-inline-end — მარჯვენა (LTR)\n• border-block-start — ზედა\n• border-block-end — ქვედა", "steps": [{"instruction": "border-inline-start", "hint": "border-inline-start: 4px solid", "expectedCode": "<style>.box{padding:20px;border-inline-start:4px solid #7c3aed;background:#1a1a2e;color:white;margin:20px;}</style>\n<div class=\"box\">Border Inline</div>"}]},
  {"id": "editor-227", "title": "CSS Nesting (&)", "description": "Native CSS nesting ისწავლე.", "type": "editor", "difficulty": "medium", "emoji": "🪺", "color": "#a78bfa", "xpReward": 15, "module": "CSS Nesting", "moduleNumber": 57, "theory": "🪺 CSS Nesting\n\n`.card {\n  background: #1a1a2e;\n  & h2 { color: #7c3aed; }\n  &:hover { background: #2a2a3e; }\n}`", "steps": [{"instruction": "შექმენი card nesting-ით", "hint": "& h2, &:hover", "expectedCode": "<style>.card{background:#1a1a2e;padding:24px;border-radius:12px;cursor:pointer;transition:0.3s;& h2{color:#7c3aed;margin:0 0 8px;}& p{color:#94a3b8;margin:0;}&:hover{background:#2a2a3e;}}</style>\n<div class=\"card\"><h2>CSS Nesting</h2><p>Native CSS-ში!</p></div>"}]},
  {"id": "editor-228", "title": "ღრმა Nesting", "description": "რამდენიმე დონის nesting.", "type": "editor", "difficulty": "medium", "emoji": "🔄", "color": "#6366f1", "xpReward": 15, "module": "CSS Nesting", "moduleNumber": 57, "theory": "🔄 ღრმა Nesting\n\n`.nav { & ul { & li { & a { color: white; } } } }`\n\n⚠ 3 დონე მაქსიმუმი!", "steps": [{"instruction": "ნავიგაცია nested სტილებით", "hint": "& ul, & li, & a", "expectedCode": "<style>.nav{background:#1a1a2e;padding:16px;border-radius:8px;& ul{list-style:none;padding:0;display:flex;gap:16px;& li{& a{color:#94a3b8;text-decoration:none;&:hover{color:#7c3aed;}}}}}</style>\n<nav class=\"nav\"><ul><li><a href=\"#\">მთავარი</a></li><li><a href=\"#\">შესახებ</a></li></ul></nav>"}]},
  {"id": "challenge-229", "title": "Nesting Challenge", "description": "მთლიანი კომპონენტი nesting-ით სტილიზე.", "type": "challenge", "difficulty": "hard", "emoji": "🏆", "color": "#f59e0b", "xpReward": 25, "module": "CSS Nesting", "moduleNumber": 57, "theory": "🪺 Nesting Challenge\n\n& ოპერატორით ყველა სტილი ერთ ბლოკში.", "targetHtml": "<style>.card{background:#1a1a2e;padding:24px;border-radius:12px;& h2{color:#7c3aed;}& p{color:#94a3b8;}&:hover{transform:translateY(-2px);}}</style><div class='card'><h2>Title</h2><p>Text</p></div>", "starterCss": ".card{background:#1a1a2e;padding:24px;}", "targetCss": "&", "hints": ["& h2 { color: #7c3aed; }", "&:hover { transform: translateY(-2px) }"]},
  {"id": "editor-230", "title": ":is() სელექტორი", "description": "რამდენიმე სელექტორი :is()-ში გააერთიანე.", "type": "editor", "difficulty": "medium", "emoji": "🎯", "color": "#34d399", "xpReward": 15, "module": ":has() & :is()", "moduleNumber": 58, "theory": "🎯 :is()\n\n`:is(h1, h2, h3) { color: purple; }`\n\nრამდენიმე სელექტორს ერთში აერთიანებ.", "steps": [{"instruction": "გამოიყენე :is()", "hint": ":is(h1, h2, h3)", "expectedCode": "<style>:is(h1,h2,h3){color:#7c3aed;font-family:sans-serif;}p{color:#94a3b8;}</style>\n<h1>სათაური 1</h1><h2>სათაური 2</h2><p>პარაგრაფი</p><h3>სათაური 3</h3>"}]},
  {"id": "editor-231", "title": ":has() სელექტორი", "description": "მშობელი შვილის მიხედვით სტილიზე.", "type": "editor", "difficulty": "hard", "emoji": "🔍", "color": "#f59e0b", "xpReward": 20, "module": ":has() & :is()", "moduleNumber": 58, "theory": "🔍 :has()\n\nCSS parent selector!\n\n`.card:has(img) { padding: 0; }`\n`div:has(> h2) { background: purple; }`", "steps": [{"instruction": "სტილიზე card რომელსაც img აქვს", "hint": ".card:has(img)", "expectedCode": "<style>.card{background:#1a1a2e;padding:20px;border-radius:12px;color:white;margin:10px 0;}.card:has(img){border:2px solid #7c3aed;padding:0;overflow:hidden;}img{width:100%;display:block;}</style>\n<div class=\"card\"><h3>ტექსტური</h3></div>\n<div class=\"card\"><img src=\"https://picsum.photos/300/150\" alt=\"photo\"><h3 style='padding:12px;'>სურათიანი</h3></div>"}]},
  {"id": "challenge-232", "title": ":has() + :is()", "description": "ორივე სელექტორი ერთად გამოიყენე.", "type": "challenge", "difficulty": "hard", "emoji": "🏆", "color": "#f59e0b", "xpReward": 30, "module": ":has() & :is()", "moduleNumber": 58, "theory": "🧠 :has() + :is()\n\n`.card:has(:is(h2, h3)) { border-left: 4px solid purple; }`", "targetHtml": "<style>.card{background:#1a1a2e;padding:16px;margin:8px 0;border-radius:8px;color:white;}.card:has(:is(h2,h3)){border-left:4px solid #7c3aed;}</style><div class=\"card\"><h2>სათაური</h2><p>ტექსტი</p></div><div class=\"card\"><p>მხოლოდ ტექსტი</p></div>", "starterCss": ".card{background:#1a1a2e;padding:16px;}", "targetCss": ":has", "hints": ["გამოიყენე .card:has(:is(h2, h3))"]},
  {"id": "editor-233", "title": "accent-color", "description": "ფორმის ელემენტების ფერი შეცვალე.", "type": "editor", "difficulty": "easy", "emoji": "🎨", "color": "#7c3aed", "xpReward": 10, "module": "CSS Accent & Scheme", "moduleNumber": 59, "theory": "🎨 accent-color\n\n`accent-color: #7c3aed;`\n\ncheckbox, radio, range, progress ფერს ცვლის!", "steps": [{"instruction": "accent-color გამოიყენე", "hint": "accent-color: #7c3aed", "expectedCode": "<style>body{background:#1a1a2e;color:white;padding:20px;font-family:sans-serif;}input{accent-color:#7c3aed;margin:8px;}</style>\n<label><input type=\"checkbox\" checked> Checkbox</label><br>\n<label><input type=\"radio\" name=\"r\" checked> Radio</label><br>\n<input type=\"range\" value=\"60\">"}]},
  {"id": "editor-234", "title": "color-scheme", "description": "dark/light სქემა CSS-ით.", "type": "editor", "difficulty": "easy", "emoji": "🌓", "color": "#64748b", "xpReward": 10, "module": "CSS Accent & Scheme", "moduleNumber": 59, "theory": "🌓 color-scheme\n\n`:root { color-scheme: dark; }`\n\nბრაუზერის default ელემენტები dark გახდება.", "steps": [{"instruction": "color-scheme: dark", "hint": "color-scheme: dark", "expectedCode": "<style>:root{color-scheme:dark;}body{padding:20px;font-family:sans-serif;}</style>\n<h2>Dark Scheme</h2>\n<input type=\"text\" placeholder=\"Input...\"><br><br>\n<select><option>Option 1</option></select>"}]},
  {"id": "editor-235", "title": "writing-mode: vertical", "description": "ტექსტი ვერტიკალურად.", "type": "editor", "difficulty": "medium", "emoji": "📝", "color": "#f97316", "xpReward": 15, "module": "CSS Writing Modes", "moduleNumber": 60, "theory": "📝 writing-mode\n\n• horizontal-tb — ჩვეულებრივი\n• vertical-rl — ვერტიკალური, მარჯვნიდან\n• vertical-lr — ვერტიკალური, მარცხნიდან", "steps": [{"instruction": "ვერტიკალური ტექსტი", "hint": "writing-mode: vertical-rl", "expectedCode": "<style>.vert{writing-mode:vertical-rl;background:#1a1a2e;color:white;padding:20px;font-size:1.2rem;border-radius:8px;height:200px;}</style>\n<div class=\"vert\">ვერტიკალური ტექსტი</div>"}]},
  {"id": "editor-236", "title": "text-orientation", "description": "სიმბოლოების ორიენტაცია.", "type": "editor", "difficulty": "medium", "emoji": "🔤", "color": "#ef4444", "xpReward": 15, "module": "CSS Writing Modes", "moduleNumber": 60, "theory": "🔤 text-orientation\n\n• mixed — default\n• upright — ვერტიკალურად\n• sideways — გვერდულად", "steps": [{"instruction": "text-orientation: upright", "hint": "text-orientation: upright", "expectedCode": "<style>.vert{writing-mode:vertical-rl;text-orientation:upright;background:#1a1a2e;color:white;padding:20px;font-size:1.5rem;letter-spacing:8px;}</style>\n<div class=\"vert\">ABC123</div>"}]},
  {"id": "editor-237", "title": "min(), max(), clamp()", "description": "CSS მათემატიკური ფუნქციები.", "type": "editor", "difficulty": "medium", "emoji": "🔢", "color": "#8b5cf6", "xpReward": 15, "module": "CSS Math Functions", "moduleNumber": 61, "theory": "🔢 CSS Math\n\n• min() — პატარას ირჩევს\n• max() — დიდს ირჩევს\n• clamp(min, preferred, max)", "steps": [{"instruction": "clamp() font-size-ისთვის", "hint": "clamp(1rem, 3vw, 2.5rem)", "expectedCode": "<style>body{background:#0d0d14;padding:20px;}h1{font-size:clamp(1rem,4vw,3rem);color:#7c3aed;}.box{width:min(90%,600px);margin:0 auto;background:#1a1a2e;padding:20px;border-radius:12px;color:white;}</style>\n<div class=\"box\"><h1>Clamp!</h1><p>ზომა ადაპტირდება</p></div>"}]},
  {"id": "editor-238", "title": "calc() Advanced", "description": "calc()-ის რთული გამოყენება.", "type": "editor", "difficulty": "medium", "emoji": "🧮", "color": "#f59e0b", "xpReward": 15, "module": "CSS Math Functions", "moduleNumber": 61, "theory": "🧮 calc() Advanced\n\n• `width: calc(100% - 40px);`\n• `height: calc(100vh - 60px);`\n• ბუდებრივი: `calc(calc(100%/3) - 20px);`", "steps": [{"instruction": "calc() layout-ისთვის", "hint": "height: calc(100vh - 60px)", "expectedCode": "<style>body{margin:0;background:#0d0d14;}.header{height:60px;background:#7c3aed;display:flex;align-items:center;padding:0 20px;color:white;font-weight:bold;}.main{height:calc(100vh - 60px);padding:20px;color:white;}</style>\n<div class=\"header\">Header</div>\n<div class=\"main\"><p>calc(100vh - 60px)</p></div>"}]},
  {"id": "challenge-239", "title": "Math Functions Challenge", "description": "min, max, clamp ერთად გამოიყენე.", "type": "challenge", "difficulty": "hard", "emoji": "🏆", "color": "#f59e0b", "xpReward": 25, "module": "CSS Math Functions", "moduleNumber": 61, "theory": "🔢 Math Challenge\n\nclamp + min + calc ერთად.", "targetHtml": "<style>body{background:#0d0d14;padding:20px;}.card{width:min(90%,500px);margin:0 auto;background:#1a1a2e;padding:clamp(16px,3vw,40px);border-radius:12px;color:white;}h2{font-size:clamp(1.2rem,3vw,2rem);color:#7c3aed;}</style><div class='card'><h2>Responsive</h2><p>Math functions!</p></div>", "starterCss": ".card{/* width: min()? padding: clamp()? */}", "targetCss": "clamp", "hints": ["width: min(90%, 500px)", "padding: clamp(16px, 3vw, 40px)"]},
  {"id": "editor-240", "title": "hsl() & hsla()", "description": "HSL ფერები ისწავლე.", "type": "editor", "difficulty": "easy", "emoji": "🌈", "color": "#ec4899", "xpReward": 10, "module": "CSS Color Functions", "moduleNumber": 62, "theory": "🌈 HSL\n\nHSL = Hue, Saturation, Lightness\n\n• 0=წითელი, 120=მწვანე, 240=ლურჯი\n• `hsl(270, 80%, 50%)` = იისფერი", "steps": [{"instruction": "hsl() ფერები", "hint": "hsl(hue, saturation, lightness)", "expectedCode": "<style>body{background:#0d0d14;padding:20px;display:flex;gap:10px;}.box{width:80px;height:80px;border-radius:12px;}</style>\n<div class=\"box\" style='background:hsl(0,80%,50%)'></div>\n<div class=\"box\" style='background:hsl(120,80%,40%)'></div>\n<div class=\"box\" style='background:hsl(240,80%,50%)'></div>\n<div class=\"box\" style='background:hsl(270,80%,50%)'></div>"}]},
  {"id": "editor-241", "title": "currentColor", "description": "currentColor keyword.", "type": "editor", "difficulty": "easy", "emoji": "🔵", "color": "#3b82f6", "xpReward": 10, "module": "CSS Color Functions", "moduleNumber": 62, "theory": "🔵 currentColor\n\nელემენტის color-ს იმეორებს.\n\n`.btn { color: #7c3aed; border: 2px solid currentColor; }`", "steps": [{"instruction": "currentColor გამოიყენე", "hint": "border: 2px solid currentColor", "expectedCode": "<style>body{background:#0d0d14;padding:40px;display:flex;gap:16px;}.btn{border:2px solid currentColor;background:transparent;padding:12px 24px;border-radius:8px;font-size:1rem;cursor:pointer;}.btn:nth-child(1){color:#7c3aed;}.btn:nth-child(2){color:#34d399;}.btn:nth-child(3){color:#f59e0b;}</style>\n<button class=\"btn\">Purple</button><button class=\"btn\">Green</button><button class=\"btn\">Gold</button>"}]},
  {"id": "challenge-242", "title": "Color Palette", "description": "hsl()-ით 5 ფერის პალიტრა შექმენი.", "type": "challenge", "difficulty": "medium", "emoji": "🏆", "color": "#f59e0b", "xpReward": 20, "module": "CSS Color Functions", "moduleNumber": 62, "theory": "🌈 Color Palette\n\nერთი hue, სხვადასხვა lightness.", "targetHtml": "<style>body{background:#0d0d14;padding:20px;display:flex;gap:8px;}.swatch{width:60px;height:80px;border-radius:8px;}</style><div class='swatch' style='background:hsl(270,80%,20%)'></div><div class='swatch' style='background:hsl(270,80%,35%)'></div><div class='swatch' style='background:hsl(270,80%,50%)'></div><div class='swatch' style='background:hsl(270,80%,65%)'></div><div class='swatch' style='background:hsl(270,80%,80%)'></div>", "starterCss": ".swatch{width:60px;height:80px;}", "targetCss": "hsl", "hints": ["hsl(270, 80%, X%) - lightness-ს ცვლი"]},
  {"id": "editor-243", "title": "<dialog> ელემენტი", "description": "HTML dialog მოდალი.", "type": "editor", "difficulty": "medium", "emoji": "💬", "color": "#6366f1", "xpReward": 15, "module": "HTML Dialog", "moduleNumber": 63, "theory": "💬 HTML Dialog\n\n`<dialog>` native მოდალია.\n\n`dialog.showModal()` — გახსნა\n`dialog.close()` — დახურვა\n`dialog::backdrop` — ფონი", "steps": [{"instruction": "dialog მოდალი", "hint": "<dialog>", "expectedCode": "<style>dialog{background:#1a1a2e;color:white;border:1px solid #7c3aed;border-radius:12px;padding:24px;}dialog::backdrop{background:rgba(0,0,0,0.7);}button{background:#7c3aed;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;}</style>\n<button onclick=\"document.getElementById('d').showModal()\">გახსენი</button>\n<dialog id=\"d\"><h2>მოდალი!</h2><p>Native HTML dialog</p><button onclick=\"document.getElementById('d').close()\">დახურვა</button></dialog>"}]},
  {"id": "challenge-244", "title": "Dialog სტილიზაცია", "description": "Custom dialog სტილით მოდალი.", "type": "challenge", "difficulty": "hard", "emoji": "🏆", "color": "#f59e0b", "xpReward": 25, "module": "HTML Dialog", "moduleNumber": 63, "theory": "💬 Dialog\n\n::backdrop + border-radius + animation.", "targetHtml": "<style>dialog{background:#1a1a2e;color:white;border:2px solid #7c3aed;border-radius:16px;padding:32px;max-width:400px;}dialog::backdrop{background:rgba(0,0,0,0.8);}</style><dialog open><h2 style='color:#7c3aed;'>Styled Dialog</h2><p>Custom styled!</p></dialog>", "starterCss": "dialog{/* სტილი */}", "targetCss": "backdrop", "hints": ["dialog::backdrop { background: rgba() }", "border-radius: 16px"]},
  {"id": "editor-245", "title": "<details> & <summary>", "description": "აკორდეონი HTML-ით.", "type": "editor", "difficulty": "easy", "emoji": "📋", "color": "#34d399", "xpReward": 10, "module": "Details & Summary", "moduleNumber": 64, "theory": "📋 Details & Summary\n\n`<details><summary>Title</summary><p>Content</p></details>`\n\nJavaScript არ სჭირდება!", "steps": [{"instruction": "FAQ აკორდეონი", "hint": "<details> <summary>", "expectedCode": "<style>body{background:#0d0d14;padding:20px;color:white;font-family:sans-serif;}details{background:#1a1a2e;border:1px solid #333;border-radius:8px;margin:8px 0;padding:16px;}summary{cursor:pointer;font-weight:bold;color:#7c3aed;}details[open] summary{margin-bottom:12px;}</style>\n<details open><summary>რა არის HTML?</summary><p>ვებ-გვერდების ენა.</p></details>\n<details><summary>რა არის CSS?</summary><p>სტილების ენა.</p></details>"}]},
  {"id": "editor-246", "title": "Details სტილიზაცია", "description": "Custom marker სტილი.", "type": "editor", "difficulty": "medium", "emoji": "🎭", "color": "#f97316", "xpReward": 15, "module": "Details & Summary", "moduleNumber": 64, "theory": "🎭 Details სტილიზაცია\n\n`summary { list-style: none; }`\n`summary::after { content: '+'; }`\n`details[open] summary::after { content: '-'; }`", "steps": [{"instruction": "Custom marker", "hint": "summary::after", "expectedCode": "<style>body{background:#0d0d14;padding:20px;font-family:sans-serif;}details{background:#1a1a2e;border-radius:12px;margin:8px 0;}summary{padding:16px 20px;cursor:pointer;color:white;font-weight:600;list-style:none;display:flex;justify-content:space-between;}summary::after{content:'+';color:#7c3aed;font-size:1.4rem;}details[open] summary::after{content:'-';}details p{padding:0 20px 16px;color:#94a3b8;margin:0;}</style>\n<details><summary>HTML ტეგები</summary><p>ელემენტებს აღწერს.</p></details>\n<details><summary>CSS სელექტორები</summary><p>ელემენტებს ირჩევს.</p></details>"}]},
  {"id": "editor-247", "title": "<progress> & <meter>", "description": "პროგრესი HTML ელემენტებით.", "type": "editor", "difficulty": "easy", "emoji": "📊", "color": "#7c3aed", "xpReward": 10, "module": "Meter & Progress", "moduleNumber": 65, "theory": "📊 Progress & Meter\n\n`<progress value=\"70\" max=\"100\">70%</progress>`\n`<meter value=\"0.7\" min=\"0\" max=\"1\">70%</meter>`", "steps": [{"instruction": "progress და meter", "hint": "<progress> <meter>", "expectedCode": "<style>body{background:#0d0d14;padding:20px;color:white;font-family:sans-serif;}label{display:block;margin:12px 0 4px;color:#94a3b8;}progress,meter{width:100%;height:24px;}</style>\n<label>Loading (70%)</label>\n<progress value=\"70\" max=\"100\">70%</progress>\n<label>Storage (2.5/5GB)</label>\n<meter value=\"2.5\" min=\"0\" max=\"5\" low=\"1\" high=\"4\" optimum=\"2\">2.5GB</meter>"}]},
  {"id": "challenge-248", "title": "Custom Progress Bar", "description": "CSS-ით progress bar სტილიზე.", "type": "challenge", "difficulty": "medium", "emoji": "🏆", "color": "#f59e0b", "xpReward": 20, "module": "Meter & Progress", "moduleNumber": 65, "theory": "📊 Custom Progress\n\nprogress::-webkit-progress-bar\nprogress::-webkit-progress-value", "targetHtml": "<style>progress{width:100%;height:20px;border-radius:10px;overflow:hidden;border:none;}progress::-webkit-progress-bar{background:#1a1a2e;}progress::-webkit-progress-value{background:#7c3aed;border-radius:10px;}</style><div style='background:#0d0d14;padding:30px;'><progress value='65' max='100'>65%</progress></div>", "starterCss": "progress{/* custom styles */}", "targetCss": "webkit-progress", "hints": ["progress::-webkit-progress-bar", "progress::-webkit-progress-value"]},
  {"id": "editor-249", "title": "data-* ატრიბუტები", "description": "Custom data ატრიბუტები CSS-ში.", "type": "editor", "difficulty": "medium", "emoji": "🏷", "color": "#0ea5e9", "xpReward": 15, "module": "Data Attributes", "moduleNumber": 66, "theory": "🏷 Data Attributes\n\n`<div data-theme='dark'>`\n\nCSS: `[data-theme='dark'] { ... }`\nJS: `element.dataset.theme`", "steps": [{"instruction": "data-* სტილებისთვის", "hint": "[data-theme='dark']", "expectedCode": "<style>[data-theme='dark']{background:#1a1a2e;color:white;}[data-theme='light']{background:#f0f0f0;color:#1a1a2e;}[data-size='lg']{padding:16px 24px;font-size:1.2rem;}.card{border-radius:12px;margin:8px 0;padding:12px;}</style>\n<div class=\"card\" data-theme=\"dark\" data-size=\"lg\">Dark Large</div>\n<div class=\"card\" data-theme=\"light\">Light</div>"}]},
  {"id": "editor-250", "title": "attr() CSS", "description": "attr() ფუნქცია tooltip-ისთვის.", "type": "editor", "difficulty": "medium", "emoji": "📌", "color": "#f59e0b", "xpReward": 15, "module": "Data Attributes", "moduleNumber": 66, "theory": "📌 attr()\n\n`content: attr(data-tooltip);`\n\n::before/::after-ში გამოიყენება.", "steps": [{"instruction": "attr() tooltip", "hint": "content: attr(data-tooltip)", "expectedCode": "<style>body{background:#0d0d14;padding:40px;font-family:sans-serif;}.tip{position:relative;display:inline-block;background:#7c3aed;color:white;padding:10px 20px;border-radius:8px;cursor:pointer;margin:10px;}.tip:hover::after{content:attr(data-tooltip);position:absolute;bottom:110%;left:50%;transform:translateX(-50%);background:#1a1a2e;color:white;padding:6px 12px;border-radius:6px;font-size:0.8rem;white-space:nowrap;}</style>\n<span class=\"tip\" data-tooltip=\"HTML!\">HTML</span>\n<span class=\"tip\" data-tooltip=\"CSS!\">CSS</span>"}]},
  {"id": "editor-251", "title": "outline vs border", "description": "outline-ისა და border-ის განსხვავება.", "type": "editor", "difficulty": "easy", "emoji": "🔲", "color": "#3b82f6", "xpReward": 10, "module": "Outline & Focus", "moduleNumber": 67, "theory": "🔲 Outline vs Border\n\n• border — Box Model-ის ნაწილი\n• outline — Box Model-ის გარეთ\n\n`outline: 2px solid #7c3aed;`\n`outline-offset: 4px;`", "steps": [{"instruction": "outline vs border", "hint": "outline, border", "expectedCode": "<style>body{background:#0d0d14;padding:40px;display:flex;gap:20px;}.box{width:120px;height:120px;background:#1a1a2e;display:flex;align-items:center;justify-content:center;color:white;border-radius:8px;}.b{border:3px solid #7c3aed;}.o{outline:3px solid #34d399;outline-offset:4px;}</style>\n<div class=\"box b\">Border</div>\n<div class=\"box o\">Outline</div>"}]},
  {"id": "editor-252", "title": ":focus-visible", "description": "კლავიატურის focus სტილი.", "type": "editor", "difficulty": "medium", "emoji": "⌨", "color": "#7c3aed", "xpReward": 15, "module": "Outline & Focus", "moduleNumber": 67, "theory": "⌨ :focus-visible\n\nმხოლოდ კლავიატურის ფოკუსზე ჩანს.\n\n`button:focus-visible { outline: 3px solid #34d399; }`", "steps": [{"instruction": ":focus-visible სტილი", "hint": "button:focus-visible", "expectedCode": "<style>body{background:#0d0d14;padding:40px;}button{background:#7c3aed;color:white;border:none;padding:12px 24px;border-radius:8px;font-size:1rem;cursor:pointer;margin:8px;}button:focus-visible{outline:3px solid #34d399;outline-offset:3px;}</style>\n<p style='color:#94a3b8;'>Tab-ით გადაადგილდი:</p>\n<button>ღილაკი 1</button><button>ღილაკი 2</button>"}]},
  {"id": "editor-253", "title": "Dashboard Header", "description": "Dashboard ჰედერი.", "type": "editor", "difficulty": "medium", "emoji": "📊", "color": "#6366f1", "xpReward": 15, "module": "Mini: Dashboard", "moduleNumber": 68, "theory": "📊 Dashboard Header\n\n• Logo (მარცხნივ)\n• Search (შუაში)\n• User (მარჯვნივ)\n\nFlexbox-ით!", "steps": [{"instruction": "Dashboard header", "hint": "display:flex; justify-content:space-between", "expectedCode": "<style>body{margin:0;background:#0d0d14;font-family:sans-serif;}.header{display:flex;align-items:center;justify-content:space-between;padding:12px 24px;background:#1a1a2e;border-bottom:1px solid #2a2a3e;}.logo{color:#7c3aed;font-weight:800;font-size:1.2rem;}.search{background:#2a2a3e;border:1px solid #333;color:white;padding:8px 16px;border-radius:8px;width:300px;}.avatar{width:32px;height:32px;background:#7c3aed;border-radius:50%;}</style>\n<div class=\"header\"><span class=\"logo\">Dashboard</span><input class=\"search\" placeholder=\"ძიება...\"><div class=\"avatar\"></div></div>"}]},
  {"id": "editor-254", "title": "Dashboard Sidebar", "description": "Sidebar ნავიგაცია.", "type": "editor", "difficulty": "medium", "emoji": "📋", "color": "#8b5cf6", "xpReward": 15, "module": "Mini: Dashboard", "moduleNumber": 68, "theory": "📋 Sidebar\n\n• position: fixed\n• width: 240px\n• height: 100vh", "steps": [{"instruction": "Sidebar ნავიგაცია", "hint": "width:240px; height:100vh", "expectedCode": "<style>body{margin:0;background:#0d0d14;font-family:sans-serif;}.sidebar{width:240px;height:100vh;background:#1a1a2e;padding:20px 0;}.brand{padding:0 20px 20px;color:#7c3aed;font-weight:800;border-bottom:1px solid #2a2a3e;}.nav-item{padding:10px 20px;color:#94a3b8;text-decoration:none;display:block;font-size:0.9rem;}.nav-item:hover{background:#2a2a3e;color:white;}.nav-item.active{color:#7c3aed;background:rgba(124,58,237,0.1);border-right:3px solid #7c3aed;}</style>\n<div class=\"sidebar\"><div class=\"brand\">📊 Dashboard</div><a class=\"nav-item active\" href=\"#\">🏠 მთავარი</a><a class=\"nav-item\" href=\"#\">📈 ანალიტიკა</a><a class=\"nav-item\" href=\"#\">👤 მომხმარებლები</a></div>"}]},
  {"id": "editor-255", "title": "Stats Cards", "description": "სტატისტიკის ბარათები.", "type": "editor", "difficulty": "medium", "emoji": "📈", "color": "#34d399", "xpReward": 15, "module": "Mini: Dashboard", "moduleNumber": 68, "theory": "📈 Stats Cards\n\nGrid-ით 4 ბარათი ერთ რიგში.\n\nყოველ ბარათზე: აიკონი, რიცხვი, ლეიბელი, ცვლილება.", "steps": [{"instruction": "4 stats card", "hint": "grid-template-columns: repeat(4, 1fr)", "expectedCode": "<style>body{margin:0;background:#0d0d14;padding:24px;font-family:sans-serif;}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}.card{background:#1a1a2e;border-radius:12px;padding:20px;}.icon{font-size:1.5rem;margin-bottom:8px;}.val{font-size:1.8rem;font-weight:800;color:white;}.lbl{color:#94a3b8;font-size:0.85rem;margin-top:4px;}.up{color:#34d399;font-size:0.8rem;margin-top:8px;}</style>\n<div class=\"stats\"><div class=\"card\"><div class=\"icon\">👤</div><div class=\"val\">2,847</div><div class=\"lbl\">Users</div><div class=\"up\">↑ 12%</div></div><div class=\"card\"><div class=\"icon\">💰</div><div class=\"val\">15,420</div><div class=\"lbl\">Revenue</div><div class=\"up\">↑ 8%</div></div><div class=\"card\"><div class=\"icon\">📦</div><div class=\"val\">384</div><div class=\"lbl\">Orders</div><div class=\"up\">↑ 5%</div></div><div class=\"card\"><div class=\"icon\">⭐</div><div class=\"val\">4.8</div><div class=\"lbl\">Rating</div><div class=\"up\">↑ 0.2</div></div></div>"}]},
  {"id": "challenge-256", "title": "სრული Dashboard", "description": "Sidebar + Header + Content grid-ით.", "type": "challenge", "difficulty": "hard", "emoji": "🏆", "color": "#f59e0b", "xpReward": 35, "module": "Mini: Dashboard", "moduleNumber": 68, "theory": "🏆 Dashboard Layout\n\n`grid-template-columns: 240px 1fr;`\n`grid-template-rows: 60px 1fr;`", "targetHtml": "<style>body{margin:0;font-family:sans-serif;}.dash{display:grid;grid-template-columns:200px 1fr;grid-template-rows:50px 1fr;height:100vh;}.side{grid-row:1/-1;background:#1a1a2e;padding:16px;color:#7c3aed;font-weight:bold;}.head{background:#1a1a2e;border-bottom:1px solid #2a2a3e;display:flex;align-items:center;padding:0 20px;color:white;}.main{background:#0d0d14;padding:20px;color:white;}</style><div class=\"dash\"><div class=\"side\">Menu</div><div class=\"head\">Header</div><div class=\"main\"><h3>Content</h3></div></div>", "starterCss": ".dash{display:grid;height:100vh;}", "targetCss": "grid-template", "hints": ["grid-template-columns: 200px 1fr", "sidebar: grid-row: 1 / -1"]},
  {"id": "editor-257", "title": "Social Post Card", "description": "სოციალური პოსტის ბარათი.", "type": "editor", "difficulty": "medium", "emoji": "📱", "color": "#ec4899", "xpReward": 15, "module": "Mini: Social Card", "moduleNumber": 69, "theory": "📱 Social Card\n\n• Avatar + Username (header)\n• Content\n• Action buttons (like, comment, share)", "steps": [{"instruction": "Social card", "hint": "flexbox layout", "expectedCode": "<style>body{background:#0d0d14;padding:20px;font-family:sans-serif;}.card{background:#1a1a2e;border-radius:16px;max-width:400px;overflow:hidden;}.hdr{display:flex;align-items:center;gap:10px;padding:14px 16px;}.av{width:36px;height:36px;background:#7c3aed;border-radius:50%;}.name{color:white;font-weight:700;font-size:0.9rem;}.body{padding:0 16px 12px;color:#e2e8f0;font-size:0.9rem;}.actions{display:flex;gap:20px;padding:12px 16px;border-top:1px solid #2a2a3e;color:#94a3b8;font-size:0.85rem;}</style>\n<div class=\"card\"><div class=\"hdr\"><div class=\"av\"></div><div class=\"name\">@codezero</div></div><div class=\"body\">ახალი CSS ფიჩა ვისწავლე! 🚀</div><div class=\"actions\"><span>❤ 42</span><span>💬 12</span><span>🔄 5</span></div></div>"}]},
  {"id": "challenge-258", "title": "Social Card Challenge", "description": "სრული social card ააწყვე.", "type": "challenge", "difficulty": "medium", "emoji": "🏆", "color": "#f59e0b", "xpReward": 25, "module": "Mini: Social Card", "moduleNumber": 69, "theory": "📱 Social Card\n\nAvatar, name, time, text, actions.", "targetHtml": "<style>body{background:#0d0d14;padding:20px;font-family:sans-serif;}.card{background:#1a1a2e;border-radius:16px;max-width:400px;padding:16px;}.top{display:flex;align-items:center;gap:10px;margin-bottom:12px;}.av{width:40px;height:40px;background:#7c3aed;border-radius:50%;}.nm{color:white;font-weight:700;}.tm{color:#64748b;font-size:0.75rem;}.txt{color:#e2e8f0;margin-bottom:12px;}.acts{display:flex;gap:16px;color:#94a3b8;font-size:0.85rem;}</style><div class='card'><div class='top'><div class='av'></div><div><div class='nm'>@user</div><div class='tm'>2h ago</div></div></div><div class='txt'>Hello world!</div><div class='acts'><span>❤ 42</span><span>💬 12</span></div></div>", "starterCss": ".card{max-width:400px;}", "targetCss": "border-radius", "hints": ["display:flex for header", "gap for spacing"]},
  {"id": "editor-259", "title": "Pricing Cards", "description": "3 გეგმიანი ფასების ტაბლა.", "type": "editor", "difficulty": "medium", "emoji": "💳", "color": "#7c3aed", "xpReward": 15, "module": "Mini: Pricing", "moduleNumber": 70, "theory": "💳 Pricing Cards\n\n• Plan name, Price, Features, CTA\n• Popular გეგმა: scale(1.05), border-color", "steps": [{"instruction": "3 pricing card", "hint": "grid-template-columns: repeat(3, 1fr)", "expectedCode": "<style>body{background:#0d0d14;padding:30px;font-family:sans-serif;}.pricing{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;max-width:900px;margin:0 auto;}.plan{background:#1a1a2e;border-radius:16px;padding:32px 24px;text-align:center;border:1px solid #2a2a3e;}.plan.pop{border-color:#7c3aed;transform:scale(1.05);}.pname{color:#94a3b8;font-size:0.9rem;text-transform:uppercase;}.price{color:white;font-size:2.5rem;font-weight:800;margin:16px 0;}.price span{font-size:0.9rem;color:#94a3b8;}.feat{list-style:none;padding:0;margin:20px 0;}.feat li{color:#94a3b8;padding:8px 0;border-bottom:1px solid #2a2a3e;font-size:0.85rem;}.btn{width:100%;padding:12px;border:none;border-radius:8px;font-size:1rem;cursor:pointer;background:#7c3aed;color:white;font-weight:600;}</style>\n<div class=\"pricing\"><div class=\"plan\"><div class=\"pname\">Basic</div><div class=\"price\">9<span>/mo</span></div><ul class=\"feat\"><li>5 Projects</li><li>1GB</li></ul><button class=\"btn\">Select</button></div><div class=\"plan pop\"><div class=\"pname\">Pro</div><div class=\"price\">19<span>/mo</span></div><ul class=\"feat\"><li>50 Projects</li><li>10GB</li><li>Priority</li></ul><button class=\"btn\">Select</button></div><div class=\"plan\"><div class=\"pname\">Enterprise</div><div class=\"price\">49<span>/mo</span></div><ul class=\"feat\"><li>Unlimited</li><li>100GB</li></ul><button class=\"btn\">Select</button></div></div>"}]},
  {"id": "challenge-260", "title": "Pricing Table Challenge", "description": "სრული pricing table ააწყვე.", "type": "challenge", "difficulty": "hard", "emoji": "🏆", "color": "#f59e0b", "xpReward": 30, "module": "Mini: Pricing", "moduleNumber": 70, "theory": "💳 Pricing\n\n3 გეგმა, popular გამოყოფილი.", "targetHtml": "<style>body{background:#0d0d14;padding:20px;font-family:sans-serif;}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;max-width:800px;margin:0 auto;}.p{background:#1a1a2e;border-radius:12px;padding:24px;text-align:center;color:white;border:1px solid #2a2a3e;}.p.pop{border-color:#7c3aed;transform:scale(1.05);}</style><div class='grid'><div class='p'><h3>Basic</h3><p style='font-size:2rem;font-weight:800;'>$9</p></div><div class='p pop'><h3>Pro</h3><p style='font-size:2rem;font-weight:800;'>$19</p></div><div class='p'><h3>Enterprise</h3><p style='font-size:2rem;font-weight:800;'>$49</p></div></div>", "starterCss": ".grid{display:grid;gap:16px;}", "targetCss": "grid-template-columns", "hints": ["repeat(3, 1fr)", "transform: scale(1.05) for popular"]},
  {"id": "puzzle-261", "title": "CSS Display Values", "description": "ააწყვე display მნიშვნელობები.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "#a78bfa", "xpReward": 20, "module": "Review Puzzles", "moduleNumber": 71, "theory": "📐 Display\n1. none\n2. inline\n3. block\n4. inline-block\n5. flex", "puzzlePieces": [{"id": "p1", "content": "none", "order": 1}, {"id": "p2", "content": "inline", "order": 2}, {"id": "p3", "content": "block", "order": 3}, {"id": "p4", "content": "inline-block", "order": 4}, {"id": "p5", "content": "flex", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>CSS Display Values</h3><p>სწორად აიწყო!</p></div>"},
  {"id": "puzzle-262", "title": "CSS Position Values", "description": "ააწყვე position მნიშვნელობები.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "#a78bfa", "xpReward": 20, "module": "Review Puzzles", "moduleNumber": 71, "theory": "📍 Position\n1. static\n2. relative\n3. absolute\n4. fixed\n5. sticky", "puzzlePieces": [{"id": "p1", "content": "static", "order": 1}, {"id": "p2", "content": "relative", "order": 2}, {"id": "p3", "content": "absolute", "order": 3}, {"id": "p4", "content": "fixed", "order": 4}, {"id": "p5", "content": "sticky", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>CSS Position Values</h3><p>სწორად აიწყო!</p></div>"},
  {"id": "puzzle-263", "title": "HTML Document Flow", "description": "ააწყვე HTML სტრუქტურა.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "#a78bfa", "xpReward": 20, "module": "Review Puzzles", "moduleNumber": 71, "theory": "📄 Flow\n1. DOCTYPE\n2. html\n3. head\n4. body\n5. content", "puzzlePieces": [{"id": "p1", "content": "DOCTYPE", "order": 1}, {"id": "p2", "content": "html", "order": 2}, {"id": "p3", "content": "head", "order": 3}, {"id": "p4", "content": "body", "order": 4}, {"id": "p5", "content": "content", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>HTML Document Flow</h3><p>სწორად აიწყო!</p></div>"},
  {"id": "puzzle-264", "title": "Flexbox Properties", "description": "ააწყვე Flexbox თვისებები.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "#a78bfa", "xpReward": 20, "module": "Review Puzzles", "moduleNumber": 71, "theory": "📦 Flexbox\n1. display:flex\n2. flex-direction\n3. justify-content\n4. align-items\n5. flex-wrap", "puzzlePieces": [{"id": "p1", "content": "display:flex", "order": 1}, {"id": "p2", "content": "flex-direction", "order": 2}, {"id": "p3", "content": "justify-content", "order": 3}, {"id": "p4", "content": "align-items", "order": 4}, {"id": "p5", "content": "flex-wrap", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>Flexbox Properties</h3><p>სწორად აიწყო!</p></div>"},
  {"id": "puzzle-265", "title": "Grid Properties", "description": "ააწყვე Grid თვისებები.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "#a78bfa", "xpReward": 20, "module": "Review Puzzles", "moduleNumber": 71, "theory": "🔳 Grid\n1. display:grid\n2. grid-template-columns\n3. grid-template-rows\n4. gap\n5. grid-template-areas", "puzzlePieces": [{"id": "p1", "content": "display:grid", "order": 1}, {"id": "p2", "content": "grid-template-columns", "order": 2}, {"id": "p3", "content": "grid-template-rows", "order": 3}, {"id": "p4", "content": "gap", "order": 4}, {"id": "p5", "content": "grid-template-areas", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>Grid Properties</h3><p>სწორად აიწყო!</p></div>"},
  {"id": "puzzle-266", "title": "Animation Steps", "description": "ააწყვე ანიმაციის ნაბიჯები.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "#a78bfa", "xpReward": 20, "module": "Review Puzzles", "moduleNumber": 71, "theory": "🎬 Animation\n1. @keyframes\n2. animation-name\n3. animation-duration\n4. animation-timing-function\n5. iteration-count", "puzzlePieces": [{"id": "p1", "content": "@keyframes", "order": 1}, {"id": "p2", "content": "animation-name", "order": 2}, {"id": "p3", "content": "animation-duration", "order": 3}, {"id": "p4", "content": "timing-function", "order": 4}, {"id": "p5", "content": "iteration-count", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>Animation Steps</h3><p>სწორად აიწყო!</p></div>"},
  {"id": "puzzle-267", "title": "Transition Properties", "description": "ააწყვე transition თვისებები.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "#a78bfa", "xpReward": 20, "module": "Review Puzzles", "moduleNumber": 71, "theory": "🔄 Transition\n1. transition-property\n2. transition-duration\n3. timing-function\n4. transition-delay", "puzzlePieces": [{"id": "p1", "content": "property", "order": 1}, {"id": "p2", "content": "duration", "order": 2}, {"id": "p3", "content": "timing-function", "order": 3}, {"id": "p4", "content": "delay", "order": 4}], "correctOrder": ["p1", "p2", "p3", "p4"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>Transition Properties</h3><p>სწორად აიწყო!</p></div>"},
  {"id": "puzzle-268", "title": "Media Query Syntax", "description": "ააწყვე media query.", "type": "puzzle", "difficulty": "medium", "emoji": "🧩", "color": "#a78bfa", "xpReward": 20, "module": "Review Puzzles", "moduleNumber": 71, "theory": "📱 Media Query\n1. @media\n2. screen\n3. and\n4. (max-width:768px)\n5. { ... }", "puzzlePieces": [{"id": "p1", "content": "@media", "order": 1}, {"id": "p2", "content": "screen", "order": 2}, {"id": "p3", "content": "and", "order": 3}, {"id": "p4", "content": "(max-width:768px)", "order": 4}, {"id": "p5", "content": "{ ... }", "order": 5}], "correctOrder": ["p1", "p2", "p3", "p4", "p5"], "resultHtml": "<div style='padding:20px;font-family:sans-serif;'><h3>Media Query Syntax</h3><p>სწორად აიწყო!</p></div>"},
  {"id": "challenge-283", "title": "Glassmorphism Card", "description": "Glassmorphism ეფექტი შექმენი.", "type": "challenge", "difficulty": "hard", "emoji": "🏆", "color": "#f59e0b", "xpReward": 30, "module": "Advanced Challenges", "moduleNumber": 72, "theory": "🔮 Glassmorphism\n\n• backdrop-filter: blur(10px)\n• background: rgba(255,255,255,0.1)\n• border: 1px solid rgba(255,255,255,0.2)", "targetHtml": "<div style='min-height:300px;background:#7c3aed;display:flex;align-items:center;justify-content:center;'><div style='background:rgba(255,255,255,0.1);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.2);border-radius:16px;padding:32px;color:white;width:280px;'><h3>Glass Card</h3><p>Glassmorphism</p></div></div>", "starterCss": ".card{border-radius:16px;padding:32px;color:white;}", "targetCss": "backdrop-filter", "hints": ["backdrop-filter: blur(10px)", "background: rgba(255,255,255,0.1)"]},
  {"id": "challenge-284", "title": "Neumorphism Button", "description": "Neumorphism სტილის ღილაკი.", "type": "challenge", "difficulty": "hard", "emoji": "🏆", "color": "#f59e0b", "xpReward": 30, "module": "Advanced Challenges", "moduleNumber": 72, "theory": "🔘 Neumorphism\n\nbox-shadow ორი მიმართულებით:\n`box-shadow: 5px 5px 15px darker, -5px -5px 15px lighter;`", "targetHtml": "<div style='min-height:200px;background:#1a1a2e;display:flex;align-items:center;justify-content:center;'><button style='background:#1a1a2e;color:#7c3aed;border:none;padding:16px 32px;border-radius:12px;font-size:1rem;box-shadow:5px 5px 15px #0d0d14,-5px -5px 15px #2a2a3e;'>Neumorphic</button></div>", "starterCss": "button{background:#1a1a2e;color:#7c3aed;}", "targetCss": "box-shadow", "hints": ["box-shadow: 5px 5px 15px #0d0d14, -5px -5px 15px #2a2a3e"]},
  {"id": "challenge-285", "title": "Loading Spinner", "description": "CSS loading spinner.", "type": "challenge", "difficulty": "medium", "emoji": "🏆", "color": "#f59e0b", "xpReward": 25, "module": "Advanced Challenges", "moduleNumber": 72, "theory": "🔄 Spinner\n\nborder + @keyframes spin:\n`border: 4px solid rgba(124,58,237,0.2);`\n`border-top: 4px solid #7c3aed;`\n`animation: spin 1s linear infinite;`", "targetHtml": "<div style='min-height:200px;background:#0d0d14;display:flex;align-items:center;justify-content:center;'><div style='width:40px;height:40px;border:4px solid rgba(124,58,237,0.2);border-top:4px solid #7c3aed;border-radius:50%;animation:spin 1s linear infinite;'></div></div><style>@keyframes spin{to{transform:rotate(360deg);}}</style>", "starterCss": ".spinner{width:40px;height:40px;}", "targetCss": "animation", "hints": ["border-top: 4px solid #7c3aed", "@keyframes spin"]},
  {"id": "challenge-286", "title": "Toggle Switch", "description": "CSS toggle switch.", "type": "challenge", "difficulty": "hard", "emoji": "🏆", "color": "#f59e0b", "xpReward": 30, "module": "Advanced Challenges", "moduleNumber": 72, "theory": "🔘 Toggle\n\ncheckbox + label:\n`input:checked + label { background: #7c3aed; }`\n`label::after` = thumb", "targetHtml": "<style>input[type=checkbox]{display:none;}label{width:50px;height:26px;background:#2a2a3e;border-radius:13px;position:relative;cursor:pointer;display:block;}label::after{content:'';width:22px;height:22px;background:white;border-radius:50%;position:absolute;top:2px;left:2px;transition:0.3s;}input:checked+label{background:#7c3aed;}input:checked+label::after{left:26px;}</style><div style='background:#0d0d14;padding:40px;'><input type='checkbox' id='t' checked><label for='t'></label></div>", "starterCss": "label{width:50px;height:26px;}", "targetCss": "checked", "hints": ["input:checked + label", "label::after for thumb"]},
  {"id": "challenge-287", "title": "Tooltip CSS", "description": "Pure CSS tooltip.", "type": "challenge", "difficulty": "medium", "emoji": "🏆", "color": "#f59e0b", "xpReward": 25, "module": "Advanced Challenges", "moduleNumber": 72, "theory": "💬 Tooltip\n\n::after + attr(data-tip) + :hover\nposition: absolute", "targetHtml": "<style>.tip{position:relative;display:inline-block;background:#7c3aed;color:white;padding:8px 16px;border-radius:8px;cursor:pointer;}.tip:hover::after{content:attr(data-tip);position:absolute;bottom:120%;left:50%;transform:translateX(-50%);background:#1a1a2e;padding:6px 12px;border-radius:6px;font-size:0.8rem;white-space:nowrap;}</style><div style='background:#0d0d14;padding:60px 40px;'><span class='tip' data-tip='Tooltip!'>Hover</span></div>", "starterCss": ".tip{position:relative;}", "targetCss": "attr", "hints": ["content: attr(data-tip)", "position: absolute"]},
  {"id": "challenge-288", "title": "Animated Card Hover", "description": "ბარათს hover ანიმაცია დაამატე.", "type": "challenge", "difficulty": "medium", "emoji": "🏆", "color": "#f59e0b", "xpReward": 25, "module": "Advanced Challenges", "moduleNumber": 72, "theory": "✨ Card Hover\n\ntransform + box-shadow + transition:\n`:hover { transform: translateY(-8px); box-shadow: 0 12px 24px rgba(0,0,0,0.3); }`", "targetHtml": "<style>.card{background:#1a1a2e;padding:24px;border-radius:12px;color:white;max-width:300px;transition:all 0.3s;cursor:pointer;}.card:hover{transform:translateY(-8px);box-shadow:0 12px 24px rgba(0,0,0,0.3);}</style><div style='background:#0d0d14;padding:40px;'><div class='card'><h3>Hover Me</h3><p style='color:#94a3b8;'>Card with animation</p></div></div>", "starterCss": ".card{transition:all 0.3s;}", "targetCss": "translateY", "hints": ["transform: translateY(-8px)", "box-shadow on hover"]},
  {"id": "editor-289", "title": "CSS aspect-ratio Gallery", "description": "aspect-ratio-ით gallery აწყვე.", "type": "editor", "difficulty": "medium", "emoji": "📐", "color": "#14b8a6", "xpReward": 15, "module": "Aspect Ratio Gallery", "moduleNumber": 73, "theory": "📐 aspect-ratio\n\n• 1/1 — კვადრატი\n• 16/9 — ვიდეო\n• 4/3 — კლასიკური", "steps": [{"instruction": "Gallery aspect-ratio-ით", "hint": "aspect-ratio: 1/1", "expectedCode": "<style>body{background:#0d0d14;padding:20px;}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}.item{background:#7c3aed;border-radius:12px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;}.sq{aspect-ratio:1/1;}.vid{aspect-ratio:16/9;}.photo{aspect-ratio:3/2;}</style>\n<div class=\"grid\"><div class=\"item sq\">1:1</div><div class=\"item vid\">16:9</div><div class=\"item photo\">3:2</div></div>"}]},
  {"id": "editor-290", "title": "CSS contain & visibility", "description": "Performance CSS თვისებები.", "type": "editor", "difficulty": "hard", "emoji": "🏗", "color": "#0ea5e9", "xpReward": 20, "module": "CSS Performance", "moduleNumber": 74, "theory": "🏗 Performance\n\n`contain: content;` — იზოლაცია\n`content-visibility: auto;` — lazy render\n`will-change: transform;` — GPU hint", "steps": [{"instruction": "Performance თვისებები", "hint": "contain, content-visibility", "expectedCode": "<style>.section{content-visibility:auto;contain-intrinsic-size:0 200px;background:#1a1a2e;color:white;padding:30px;margin:10px 0;border-radius:8px;}</style>\n<div class=\"section\"><h3>Section 1</h3><p>Lazy rendering</p></div>\n<div class=\"section\"><h3>Section 2</h3><p>Auto visibility</p></div>"}]},
  {"id": "editor-291", "title": "CSS subgrid", "description": "Subgrid ისწავლე.", "type": "editor", "difficulty": "hard", "emoji": "🔳", "color": "#7c3aed", "xpReward": 20, "module": "CSS Subgrid", "moduleNumber": 75, "theory": "🔳 Subgrid\n\nშვილი მშობლის grid ტრეკებს იყენებს.\n\n`grid-template-columns: subgrid;`", "steps": [{"instruction": "Subgrid მაგალითი", "hint": "grid-template-columns: subgrid", "expectedCode": "<style>.parent{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}.child{grid-column:1/-1;display:grid;grid-template-columns:subgrid;}.item{background:#7c3aed;color:white;padding:15px;text-align:center;border-radius:8px;}</style>\n<div class=\"parent\"><div class=\"child\"><div class=\"item\">A</div><div class=\"item\">B</div><div class=\"item\">C</div></div></div>"}]},
  {"id": "editor-292", "title": "CSS isolation", "description": "isolation თვისება blend-ისთვის.", "type": "editor", "difficulty": "medium", "emoji": "🔒", "color": "#ef4444", "xpReward": 15, "module": "CSS Isolation", "moduleNumber": 76, "theory": "🔒 isolation\n\n`isolation: isolate;`\n\nstacking context-ს ქმნის, blend-mode იზოლირდება.", "steps": [{"instruction": "isolation: isolate", "hint": "isolation: isolate", "expectedCode": "<style>.container{isolation:isolate;background:#1a1a2e;padding:30px;border-radius:12px;position:relative;}.overlay{background:#7c3aed;mix-blend-mode:multiply;padding:20px;color:white;border-radius:8px;}</style>\n<div class=\"container\"><h2 style='color:white;'>Isolated</h2><div class=\"overlay\">Blend isolated!</div></div>"}]},
  {"id": "editor-293", "title": "CSS place-items", "description": "Grid shorthand place-items.", "type": "editor", "difficulty": "easy", "emoji": "📍", "color": "#34d399", "xpReward": 10, "module": "Grid Shortcuts", "moduleNumber": 77, "theory": "📍 place-items\n\nalign-items + justify-items ერთად:\n`place-items: center;`\n\nplace-content, place-self-იც არსებობს.", "steps": [{"instruction": "place-items: center", "hint": "place-items: center", "expectedCode": "<style>body{background:#0d0d14;margin:0;}.grid{display:grid;height:100vh;place-items:center;}.box{background:#7c3aed;color:white;padding:24px 48px;border-radius:12px;font-size:1.5rem;font-weight:bold;}</style>\n<div class=\"grid\"><div class=\"box\">Centered!</div></div>"}]},
  {"id": "editor-294", "title": "CSS gap shorthand", "description": "gap row-gap column-gap.", "type": "editor", "difficulty": "easy", "emoji": "↔", "color": "#f59e0b", "xpReward": 10, "module": "Grid Shortcuts", "moduleNumber": 77, "theory": "↔ gap\n\n`gap: 16px;` — ყველა მხარეს\n`gap: 16px 24px;` — row column\n`row-gap: 16px;`\n`column-gap: 24px;`", "steps": [{"instruction": "gap shorthand", "hint": "gap: 16px 24px", "expectedCode": "<style>body{background:#0d0d14;padding:20px;}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px 24px;}.item{background:#1a1a2e;padding:20px;border-radius:8px;color:white;text-align:center;}</style>\n<div class=\"grid\"><div class=\"item\">1</div><div class=\"item\">2</div><div class=\"item\">3</div><div class=\"item\">4</div><div class=\"item\">5</div><div class=\"item\">6</div></div>"}]},
  {"id": "editor-295", "title": "CSS inset shorthand", "description": "inset = top right bottom left.", "type": "editor", "difficulty": "easy", "emoji": "📐", "color": "#8b5cf6", "xpReward": 10, "module": "CSS Shortcuts", "moduleNumber": 78, "theory": "📐 inset\n\n`inset: 0;` = top:0; right:0; bottom:0; left:0;\n`inset: 10px 20px;` = top/bottom left/right\n\nposition: absolute/fixed-თან.", "steps": [{"instruction": "inset shorthand", "hint": "inset: 0", "expectedCode": "<style>.parent{position:relative;width:300px;height:200px;background:#1a1a2e;border-radius:12px;}.overlay{position:absolute;inset:0;background:rgba(124,58,237,0.3);border-radius:12px;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;}</style>\n<div class=\"parent\"><div class=\"overlay\">inset: 0</div></div>"}]},
  {"id": "editor-296", "title": "CSS text-wrap: balance", "description": "ტექსტის ბალანსირება.", "type": "editor", "difficulty": "easy", "emoji": "⚖", "color": "#6366f1", "xpReward": 10, "module": "CSS Text", "moduleNumber": 79, "theory": "⚖ text-wrap: balance\n\nსათაურის ხაზებს თანაბრად ანაწილებს.\n\n`text-wrap: balance;`\n\nსათაურებისთვის იდეალური.", "steps": [{"instruction": "text-wrap: balance", "hint": "text-wrap: balance", "expectedCode": "<style>body{background:#0d0d14;padding:40px;}h1{color:white;max-width:400px;text-wrap:balance;font-family:sans-serif;line-height:1.3;}p{color:#94a3b8;max-width:400px;}</style>\n<h1>ეს არის გრძელი სათაური რომელიც ბალანსირებულად ნაწილდება ხაზებზე</h1>\n<p>text-wrap: balance ტექსტს თანაბრად ანაწილებს.</p>"}]},

  // === QUIZ LESSONS ===
  {"id": "quiz-html-1", "title": "HTML სტრუქტურის ქვიზი", "description": "შეამოწმე შენი ცოდნა HTML სტრუქტურის შესახებ.", "type": "quiz", "difficulty": "easy", "emoji": "🧠", "color": "#38bdf8", "xpReward": 15, "module": "რა არის ვებ-გვერდი?", "moduleNumber": 1, "theory": "🧠 HTML სტრუქტურა\n\nHTML დოკუმენტი შედგება სამი მთავარი ნაწილისგან:\n• <html> — მთელი დოკუმენტის კონტეინერი\n• <head> — ინფორმაცია ბრაუზერისთვის\n• <body> — ყველაფერი რაც ეკრანზე ჩანს", "quizQuestions": [
    {"question": "რომელი თეგი არის HTML დოკუმენტის ყველაზე გარე კონტეინერი?", "options": ["<html>", "<head>", "<body>", "<div>"], "correctIndex": 0, "explanation": "<html> თეგი ფარავს მთელ დოკუმენტს და ყველა სხვა თეგი მის შიგნითაა."},
    {"question": "სად იწერება გვერდის სათაური, რომელიც ბრაუზერის ჩანართზე ჩანს?", "options": ["<body>-ში", "<head>-ში", "<html>-ში", "<footer>-ში"], "correctIndex": 1, "explanation": "<title> თეგი ყოველთვის <head> სექციაში იწერება."},
    {"question": "რომელი თეგი შეიცავს ყველაფერს რასაც მომხმარებელი ეკრანზე ხედავს?", "options": ["<head>", "<meta>", "<body>", "<script>"], "correctIndex": 2, "explanation": "<body> თეგის შიგნითაა ტექსტი, სურათები, ღილაკები და სხვა ვიზუალური ელემენტები."}
  ]},
  {"id": "quiz-html-2", "title": "სათაურების ქვიზი", "description": "შეამოწმე შენი ცოდნა HTML სათაურების შესახებ.", "type": "quiz", "difficulty": "easy", "emoji": "📋", "color": "#38bdf8", "xpReward": 15, "module": "სათაურები და ტექსტი", "moduleNumber": 2, "theory": "📋 სათაურები\n\nHTML-ში 6 სათაური არსებობს: <h1> - <h6>\n\n• <h1> — ყველაზე დიდი, მთავარი სათაური\n• <h6> — ყველაზე პატარა\n\nთითო გვერდზე მხოლოდ ერთი <h1> უნდა იყოს!", "quizQuestions": [
    {"question": "რამდენი სათაურის თეგი არსებობს HTML-ში?", "options": ["3", "5", "6", "10"], "correctIndex": 2, "explanation": "HTML-ში 6 სათაურის თეგია: h1, h2, h3, h4, h5, h6."},
    {"question": "რომელია ყველაზე დიდი სათაური?", "options": ["<h6>", "<h3>", "<h1>", "<h2>"], "correctIndex": 2, "explanation": "<h1> არის ყველაზე დიდი და მნიშვნელოვანი სათაური."},
    {"question": "თითო გვერდზე რამდენი <h1> უნდა იყოს?", "options": ["რამდენიც გინდა", "1", "2", "3"], "correctIndex": 1, "explanation": "SEO-სა და წვდომადობისთვის თითო გვერდზე ერთი <h1> საუკეთესო პრაქტიკაა."}
  ]},
  {"id": "quiz-css-1", "title": "ფერების ქვიზი", "description": "შეამოწმე შენი ცოდნა CSS ფერების შესახებ.", "type": "quiz", "difficulty": "easy", "emoji": "🎨", "color": "#38bdf8", "xpReward": 15, "module": "ფერები", "moduleNumber": 6, "theory": "🎨 CSS ფერები\n\n• color — ტექსტის ფერი\n• background-color — ფონის ფერი\n\nფერის მითითება შესაძლებელია:\n• სახელით: red, blue, green\n• hex-ით: #7c3aed\n• rgb-ით: rgb(124, 58, 237)", "quizQuestions": [
    {"question": "რომელი თვისება ცვლის ტექსტის ფერს?", "options": ["background-color", "color", "font-color", "text-color"], "correctIndex": 1, "explanation": "color თვისება ცვლის ტექსტის ფერს."},
    {"question": "როგორ ვუთითებთ ფერის hex ფორმატში?", "options": ["red", "#7c3aed", "rgb(255,0,0)", "hsl(0,100%,50%)"], "correctIndex": 1, "explanation": "Hex ფორმატი იწყება # სიმბოლოთ და შეიცავს 6 ციფრს/ასოს."},
    {"question": "რომელი თვისება ცვლის ელემენტის ფონს?", "options": ["color", "background-color", "border-color", "fill"], "correctIndex": 1, "explanation": "background-color თვისება ცვლის ელემენტის ფონის ფერს."}
  ]},
  {"id": "quiz-css-2", "title": "სელექტორების ქვიზი", "description": "შეამოწმე შენი ცოდნა CSS სელექტორების შესახებ.", "type": "quiz", "difficulty": "medium", "emoji": "🎯", "color": "#38bdf8", "xpReward": 20, "module": "CSS-ის შესავალი", "moduleNumber": 7, "theory": "🎯 CSS სელექტორები\n\n• ელემენტის სელექტორი: p { }\n• კლასის სელექტორი: .name { }\n• ID სელექტორი: #name { }\n• ფსევდო-კლასი: :hover, :nth-child()\n• ფსევდო-ელემენტი: ::before, ::after", "quizQuestions": [
    {"question": "როგორ ვუთითებთ კლასის სელექტორს?", "options": ["p { }", ".menu { }", "#menu { }", "menu { }"], "correctIndex": 1, "explanation": "კლასის სელექტორი იწყება წერტილით (.) — მაგალითად .menu"},
    {"question": "როგორ ვუთითებთ ID სელექტორს?", "options": [".name { }", "#name { }", "name { }", "*name { }"], "correctIndex": 1, "explanation": "ID სელექტორი იწყება დიეზით (#) — მაგალითად #name"},
    {"question": "რომელი სელექტორი ეხება ყველა ელემენტს გვერდზე?", "options": ["all { }", "* { }", "body { }", "html { }"], "correctIndex": 1, "explanation": "* სელექტორი ეხება ყველა HTML ელემენტს გვერდზე."}
  ]},

  // === FILL-IN-THE-BLANKS LESSONS ===
  {"id": "fill-html-1", "title": "HTML თეგების დასრულება", "description": "ჩააწერე დაკარგული HTML თეგები.", "type": "fillblanks", "difficulty": "easy", "emoji": "✏️", "color": "#fb7185", "xpReward": 15, "module": "რა არის ვებ-გვერდი?", "moduleNumber": 1, "theory": "✏️ HTML თეგები\n\nHTML თეგები იწყება < ნიშნით და მთავრდება > ნიშნით.\n\nმაგალითები:\n• <html> — დასაწყისი\n• </html> — დასასრული\n• <body> — სხეული\n• </body> — სხეულის დასასრული", "fillBlanks": [
    {"instruction": "დასრულე HTML დოკუმენტის სტრუქტურა.", "template": "<__1__>\n  <__2__>\n    <title>ჩემი გვერდი</title>\n  </__2__>\n  <__3__>\n    <h1>სალამი!</h1>\n  </__3__>\n</__1__>", "blanks": [
      {"id": "1", "answer": "html", "hints": ["ეს არის დოკუმენტის ყველაზე გარე თეგი", "იწყება h-ით და მთავრდება l-ით"]},
      {"id": "2", "answer": "head", "hints": ["აქ იწერება სათაური და სტილები", "იწყება h-ით და მთავრდება d-ით"]},
      {"id": "3", "answer": "body", "hints": ["აქ ჩანს ყველაფერი რასაც მომხმარებელი ხედავს", "იწყება b-ით და მთავრდება y-ით"]}
    ], "xpReward": 10},
    {"instruction": "დასრულე სათაურების თეგები.", "template": "<__1__>პირველი სათაური</__1__>\n<__2__>მეორე სათაური</__2__>\n<__3__>პარაგრაფი</__3__>", "blanks": [
      {"id": "1", "answer": "h1", "hints": ["ყველაზე დიდი სათაური", "h1"]},
      {"id": "2", "answer": "h2", "hints": ["მეორე დონის სათაური", "h2"]},
      {"id": "3", "answer": "p", "hints": ["პარაგრაფის თეგი", "p"]}
    ], "xpReward": 10}
  ]},
  {"id": "fill-css-1", "title": "CSS თვისებების დასრულება", "description": "ჩააწერე დაკარგული CSS თვისებები.", "type": "fillblanks", "difficulty": "easy", "emoji": "🖌️", "color": "#fb7185", "xpReward": 15, "module": "CSS-ის შესავალი", "moduleNumber": 7, "theory": "🖌️ CSS თვისებები\n\n• color: red; — ტექსტის ფერი\n• background-color: blue; — ფონის ფერი\n• font-size: 16px; — ტექსტის ზომა\n• text-align: center; — ტექსტის განლაგება", "fillBlanks": [
    {"instruction": "დასრულე CSS სტილები.", "template": "p {\n  __1__: blue;\n  __2__: 20px;\n  __3__: center;\n}", "blanks": [
      {"id": "1", "answer": "color", "hints": ["ეს თვისება ცვლის ტექსტის ფერს", "color"]},
      {"id": "2", "answer": "font-size", "hints": ["ეს თვისება ცვლის ტექსტის ზომას", "font-size"]},
      {"id": "3", "answer": "text-align", "hints": ["ეს თვისება ცვლის ტექსტის განლაგებას", "text-align"]}
    ], "xpReward": 10},
    {"instruction": "დასრულე კლასის სელექტორი.", "template": ".__1__ {\n  __2__: red;\n  __3__: yellow;\n}", "blanks": [
      {"id": "1", "answer": "highlight", "hints": ["კლასის სახელი", "highlight"]},
      {"id": "2", "answer": "color", "hints": ["ტექსტის ფერი", "color"]},
      {"id": "3", "answer": "background-color", "hints": ["ფონის ფერი", "background-color"]}
    ], "xpReward": 10}
  ]},
  {"id": "fill-links-1", "title": "ბმულების თეგები", "description": "დასრულე ბმულების HTML თეგები.", "type": "fillblanks", "difficulty": "medium", "emoji": "🔗", "color": "#fb7185", "xpReward": 20, "module": "სიები და ბმულები", "moduleNumber": 3, "theory": "🔗 ბმულები\n\nბმული იქმნება <a> თეგით:\n\n<a href='https://example.com'>ტექსტი</a>\n\nhref ატრიბუტში იწერება მისამართი.", "fillBlanks": [
    {"instruction": "დასრულე ბმულის თეგი.", "template": "<__1__ __2__='https://google.com'>Google-ზე გადასვლა</__1__>", "blanks": [
      {"id": "1", "answer": "a", "hints": ["ბმულის თეგი", "a"]},
      {"id": "2", "answer": "href", "hints": ["ბმულის მისამართი", "href"]}
    ], "xpReward": 10},
    {"instruction": "დასრულე სურათის თეგი.", "template": "<__1__ __2__='photo.jpg' __3__='ჩემი სურათი'>", "blanks": [
      {"id": "1", "answer": "img", "hints": ["სურათის თეგი", "img"]},
      {"id": "2", "answer": "src", "hints": ["სურათის მისამართი", "src"]},
      {"id": "3", "answer": "alt", "hints": ["ალტერნატიული ტექსტი", "alt"]}
    ], "xpReward": 10}
  ]},

  // === MEMORY GAME LESSONS ===
  {"id": "memory-html-1", "title": "HTML თეგები — შეაწყვილე", "description": "შეაწყვილე HTML თეგები მათი აღწერებით.", "type": "memory", "difficulty": "easy", "emoji": "🧠", "color": "#ec4899", "xpReward": 15, "module": "რა არის ვებ-გვერდი?", "moduleNumber": 1, "theory": "🧠 HTML თეგები\n\nშეაწყვილე თეგები მათი აღწერებით!", "puzzlePieces": [
    {"id": "pair-html", "content": "<html>", "order": 1},
    {"id": "pair-head", "content": "<head>", "order": 2},
    {"id": "pair-body", "content": "<body>", "order": 3},
    {"id": "pair-title", "content": "<title>", "order": 4},
    {"id": "pair-h1", "content": "<h1>", "order": 5},
    {"id": "pair-p", "content": "<p>", "order": 6}
  ], "correctOrder": [
    "დოკუმენტის ყველაზე გარე თეგი",
    "ბრაუზერისთვის ინფორმაცია",
    "ყველაფერი რაც ეკრანზე ჩანს",
    "გვერდის სათაური",
    "ყველაზე დიდი სათაური",
    "პარაგრაფი"
  ]},
  {"id": "memory-css-1", "title": "CSS თვისებები — შეაწყვილე", "description": "შეაწყვილე CSS თვისებები მათი მნიშვნელობებით.", "type": "memory", "difficulty": "easy", "emoji": "🎨", "color": "#ec4899", "xpReward": 15, "module": "CSS-ის შესავალი", "moduleNumber": 7, "theory": "🎨 CSS თვისებები\n\nშეაწყვილე თვისებები მათი აღწერებით!", "puzzlePieces": [
    {"id": "pair-color", "content": "color", "order": 1},
    {"id": "pair-bg", "content": "background-color", "order": 2},
    {"id": "pair-font", "content": "font-size", "order": 3},
    {"id": "pair-align", "content": "text-align", "order": 4},
    {"id": "pair-margin", "content": "margin", "order": 5},
    {"id": "pair-padding", "content": "padding", "order": 6}
  ], "correctOrder": [
    "ტექსტის ფერი",
    "ფონის ფერი",
    "ტექსტის ზომა",
    "ტექსტის განლაგება",
    "გარე დაშორება",
    "შიდა დაშორება"
  ]},
  {"id": "memory-flex-1", "title": "Flexbox ცნებები — შეაწყვილე", "description": "შეაწყვილე Flexbox ცნებები მათი აღწერებით.", "type": "memory", "difficulty": "medium", "emoji": "📦", "color": "#ec4899", "xpReward": 20, "module": "Flexbox და Grid", "moduleNumber": 12, "theory": "📦 Flexbox\n\nშეაწყვილე Flexbox ცნებები მათი აღწერებით!", "puzzlePieces": [
    {"id": "pair-flex", "content": "display: flex", "order": 1},
    {"id": "pair-row", "content": "flex-direction: row", "order": 2},
    {"id": "pair-column", "content": "flex-direction: column", "order": 3},
    {"id": "pair-center", "content": "justify-content: center", "order": 4},
    {"id": "pair-between", "content": "justify-content: space-between", "order": 5},
    {"id": "pair-align", "content": "align-items: center", "order": 6}
  ], "correctOrder": [
    "Flex კონტეინერი",
    "ჰორიზონტალური მიმართულება",
    "ვერტიკალური მიმართულება",
    "ცენტრში განლაგება",
    "გვერდებზე განაწილება",
    "ცენტრში ალინება"
  ]},

];

export const getLesson = (id: string) => kidsLessons.find(l => l.id === id);
export const getLessonsByType = (type: LessonType) => kidsLessons.filter(l => l.type === type);
export const getLessonsByDifficulty = (difficulty: DifficultyLevel) => kidsLessons.filter(l => l.difficulty === difficulty);
export const getModules = () => {
  const modules = new Map<number, string>();
  kidsLessons.forEach(l => modules.set(l.moduleNumber, l.module));
  return Array.from(modules.entries()).sort((a, b) => a[0] - b[0]).map(([num, name]) => ({ number: num, name }));
};

// Legacy localStorage helpers (kept for offline/fallback, but DB is primary)
export const getCompletedLessons = (): string[] => {
  try { return JSON.parse(localStorage.getItem('kids_completed') || '[]'); } catch { return []; }
};
export const getKidsXP = (): number => {
  try { return parseInt(localStorage.getItem('kids_xp') || '0', 10); } catch { return 0; }
};
export const addKidsXP = (amount: number) => {
  const current = getKidsXP();
  localStorage.setItem('kids_xp', String(current + amount));
  return current + amount;
};
export const markLessonComplete = (id: string): boolean => {
  const arr = getCompletedLessons();
  if (arr.includes(id)) return false;
  arr.push(id);
  localStorage.setItem('kids_completed', JSON.stringify(arr));
  const lesson = getLesson(id);
  if (lesson?.xpReward) addKidsXP(lesson.xpReward);
  return true;
};
export const getKidsLevel = (xp: number) => {
  const levels = [
    { xp: 0, title: 'დამწყები' },
    { xp: 50, title: 'მოსწავლე' },
    { xp: 150, title: 'კოდერი' },
    { xp: 300, title: 'ექსპერტი' },
    { xp: 500, title: 'ოსტატი' },
    { xp: 800, title: 'ლეგენდა' },
  ];
  let level = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xp) { level = i; break; }
  }
  const nextLevel = levels[Math.min(level + 1, levels.length - 1)];
  const currentLevelXP = levels[level].xp;
  const progress = level === levels.length - 1 ? 100 : Math.min(100, ((xp - currentLevelXP) / (nextLevel.xp - currentLevelXP)) * 100);
  return { level: level + 1, title: levels[level].title, nextLevelXP: nextLevel.xp, progress };
};
