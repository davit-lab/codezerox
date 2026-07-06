# გეგმა: Public გვერდების ვიზუალური განახლება

**მიზანი:** მთავარი public გვერდები გამოიყურებოდეს როგორც პროფესიონალური programming learning პლატფორმა (მაგ. Scrimba, Codecademy, freeCodeCamp) — არა AI-generated ტემპლეიტი. იგივე ფერები (Purple #5F13CA + Gold), იგივე ფონტები. ცვლილება — layout, composition, hierarchy, programming-native ელემენტები.

---

## 1. Home (`src/pages/Index.tsx`)

### Hero — გადაწყობა
- მარცხნივ: სათაური + subtitle + CTA (როგორც არის, უფრო კომპაქტური).
- მარჯვნივ: **animated code editor mock** (macOS-style traffic lights, tab "hello.tsx", ცოცხალი typing animation ქართული კომენტარებით + React/Python snippet). ცვლის ამჟამინდელ hero-card-stack-ს.
- ქვემოთ: მკაფიო stats bar (Books / Categories / Students / Lessons — 4 კოლონა mono-ციფრებით, JetBrains Mono).

### ახალი სექცია: Tech Stack Marquee
- Hero-ს ქვემოთ ჰორიზონტალური scrolling ლენტი: React, TypeScript, Python, Node.js, JavaScript, HTML, CSS, SQL, Go, Rust ლოგოებით (SVG, monochrome + hover-ზე ორიგინალი ფერი).
- ტექსტი: „ისწავლი ტექნოლოგიებს, რომლებსაც იყენებს ინდუსტრია".

### ახალი სექცია: Learning Path / Roadmap
- 4-ნაბიჯიანი ვიზუალური roadmap (Beginner → Intermediate → Advanced → Pro), თითოეული ბარათი: ხატულა, სახელი, მოკლე აღწერა, „X წიგნი / Y კურსი" ბეჯი.
- Connecting line dashed პრინციპით (SVG), gold accent progress dots.

### ახალი სექცია: Achievement Stats Band
- Full-width მუქი ბანდი 4 დიდი მეტრიკით (Students / Lessons / Certificates / Success rate) — animated count-up ეფექტით (`react-countup` ან მარტივი hook).

### Featured Books — kept, refined
- იგივე grid, მაგრამ სექციის header ცვლის სტილს: მარცხნივ label + title, მარჯვნივ „View all →" ღილაკი (editorial magazine style, არა centered).

### CTA — refined
- ცოცხალი კოდის ბლოკი ფონად (blurred), foreground-ზე თეთრი CTA copy + ორი ღილაკი.

### წაშლა
- Categories სექცია — მოძრავია Books-ის ქვედა ნაწილში ან ცალკე გვერდზე.

---

## 2. BookCard (`src/components/books/BookCard.tsx`) და Books გვერდი

- BookCard: metadata-ს ხაზზე მცირე **file-type badge** (მაგ. `.pdf`, ან ტექნოლოგიის ტეგი — React, Python) mono-ფონტით, პატარა monospace ბრეკეტებში `[React]`.
- Hover: cover-ს ზემოთ overlay „Read preview →" gold accent-ით (glow-ის გარეშე, subtle underline).
- Books გვერდი: filter bar გახდება sticky, ცოტა უფრო compact chip სტილში.

## 3. Courses / VideoCourses გვერდები

- Header hero: მოკლე editorial title + monospace subtitle (მაგ. `// 12 კურსი • 4 კატეგორია`).
- ბარათებზე დაემატება „duration • lessons • level" ხაზი mono ფონტით.
- Level badge (Beginner/Intermediate/Advanced) ფერადი წერტილით.

---

## Technical section

**ფაილები:**
- `src/pages/Index.tsx` — hero rewrite, სამი ახალი სექცია, Categories წაშლა.
- `src/components/home/CodeEditorMock.tsx` **(new)** — hero-ს code preview typing animation-ით (setInterval-based, dependency-ის გარეშე).
- `src/components/home/TechStackMarquee.tsx` **(new)** — CSS keyframe scroll, inline SVG ლოგოებით.
- `src/components/home/LearningRoadmap.tsx` **(new)** — 4 ბარათი + SVG connector.
- `src/components/home/AchievementStats.tsx` **(new)** — count-up (custom hook, no lib).
- `src/components/books/BookCard.tsx` — badge და hover overlay.
- `src/pages/Courses.tsx`, `src/pages/VideoCourses.tsx` — hero + card meta-line.
- `src/index.css` — ახალი utility class-ები (`.code-mock`, `.marquee`, `.roadmap-step`, `.stat-counter`). ფერები `--gold`, `--primary` ტოკენებიდან.

**Constraints:**
- ბიზნეს-ლოგიკა, routing, backend გამოძახებები არ იცვლება.
- ფერები იგივე (Purple #5F13CA + Gold + neutrals). არა glow, არა gradient overload.
- ფონტები: Noto Sans Georgian (body), DM Sans (display), JetBrains Mono (code/stats) — უკვე ჩართული.
- ახალი npm dependency-ები არ ემატება.
- Mobile responsive: hero მუშავდება column-ად, marquee იტოვებს scroll-ს, roadmap ერთი კოლონა.
