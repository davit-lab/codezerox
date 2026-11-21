import {extraTerms} from './extra-terms';
export type Term={id:string;name:string;topic:string;definition:string;example:string};
export const terms:Term[]=[
  {
    "id": "t1",
    "name": "HTML",
    "topic": "HTML",
    "definition": "დოკუმენტის სტრუქტურის აღწერის ენა. ელემენტებით აღნიშნავს სათაურებს, ბმულებსა და სხვა შინაარსს.",
    "example": "<h1>გამარჯობა</h1>"
  },
  {
    "id": "t2",
    "name": "Element",
    "topic": "HTML",
    "definition": "დოკუმენტის ერთი სტრუქტურული ერთეული. ხშირად შეიცავს გამხსნელ ტეგს, შინაარსსა და დამხურავ ტეგს.",
    "example": "<p>ტექსტი</p>"
  },
  {
    "id": "t3",
    "name": "Tag",
    "topic": "HTML",
    "definition": "ნიშნული, რომლითაც HTML ელემენტის დასაწყისი ან დასასრული იწერება.",
    "example": "<p> და </p>"
  },
  {
    "id": "t4",
    "name": "Attribute",
    "topic": "HTML",
    "definition": "ელემენტის დამატებითი პარამეტრი, რომელიც გამხსნელ ტეგში იწერება.",
    "example": "<a href=\"about.html\">ჩვენ შესახებ</a>"
  },
  {
    "id": "t5",
    "name": "Semantic HTML",
    "topic": "HTML",
    "definition": "ელემენტების არჩევა შინაარსის მნიშვნელობის მიხედვით. nav ნავიგაციას აღნიშნავს, main — ძირითად შინაარსს.",
    "example": "<main><article>ამბავი</article></main>"
  },
  {
    "id": "t6",
    "name": "Heading",
    "topic": "HTML",
    "definition": "სათაური, რომელიც შინაარსის იერარქიას გამოხატავს. დონე მნიშვნელობით აირჩიე და ზომა CSS-ით მართე.",
    "example": "<h1>გვერდი</h1><h2>განყოფილება</h2>"
  },
  {
    "id": "t7",
    "name": "Link",
    "topic": "HTML",
    "definition": "ბმული, რომელიც სხვა დოკუმენტზე ან იმავე გვერდის მონაკვეთზე გადადის.",
    "example": "<a href=\"#contact\">კონტაქტი</a>"
  },
  {
    "id": "t8",
    "name": "Relative path",
    "topic": "HTML",
    "definition": "მისამართი, რომელიც მიმდინარე დოკუმენტის მდებარეობიდან განისაზღვრება.",
    "example": "<img src=\"images/photo.jpg\" alt=\"ბაღი\">"
  },
  {
    "id": "t9",
    "name": "Alt text",
    "topic": "HTML",
    "definition": "ინფორმაციული გამოსახულების ტექსტური ალტერნატივა. დეკორატიულ გამოსახულებაზე გამოიყენე ცარიელი alt.",
    "example": "<img src=\"garden.jpg\" alt=\"ბაღი გაზაფხულზე\">"
  },
  {
    "id": "t10",
    "name": "Form",
    "topic": "HTML",
    "definition": "მომხმარებლის შეყვანის ველების ჯგუფი. გაგზავნისას ბრაუზერის მოქმედების მართვა JavaScript-ითაც შეიძლება.",
    "example": "<form><input name=\"email\" type=\"email\"></form>"
  },
  {
    "id": "t11",
    "name": "Label",
    "topic": "HTML",
    "definition": "ფორმის ველის ხილული სახელწოდება, რომელიც ველს პროგრამულად უკავშირდება.",
    "example": "<label for=\"name\">სახელი</label><input id=\"name\">"
  },
  {
    "id": "t12",
    "name": "Fieldset",
    "topic": "HTML",
    "definition": "ერთმანეთთან დაკავშირებული ფორმის ველების ჯგუფი. ჯგუფის სახელს legend განსაზღვრავს.",
    "example": "<fieldset><legend>კონტაქტი</legend></fieldset>"
  },
  {
    "id": "t13",
    "name": "Button",
    "topic": "HTML",
    "definition": "ელემენტი მოქმედების შესასრულებლად. ფორმაში type=\"button\" ჩვეულებრივ გაგზავნას არ იწვევს.",
    "example": "<button type=\"button\">გახსნა</button>"
  },
  {
    "id": "t14",
    "name": "Details",
    "topic": "HTML",
    "definition": "ბრაუზერის მშობლიური გასაშლელი განყოფილება. მის სათაურს summary განსაზღვრავს.",
    "example": "<details><summary>მეტი</summary><p>პასუხი</p></details>"
  },
  {
    "id": "t15",
    "name": "Dialog",
    "topic": "HTML",
    "definition": "დიალოგის ელემენტი. showModal() მას მოდალურად ხსნის, close() კი ხურავს.",
    "example": "document.querySelector('dialog').showModal();"
  },
  {
    "id": "t16",
    "name": "Data attribute",
    "topic": "HTML",
    "definition": "მომხმარებლის მიერ განსაზღვრული ატრიბუტი ელემენტზე მონაცემის შესანახად. JavaScript-ში dataset-ით იკითხება.",
    "example": "<button data-id=\"42\">ნახვა</button>"
  },
  {
    "id": "t17",
    "name": "ARIA",
    "topic": "HTML",
    "definition": "ხელმისაწვდომობის დამატებითი სემანტიკა და მდგომარეობები. ჯერ შესაბამისი მშობლიური ელემენტი აირჩიე.",
    "example": "<button aria-expanded=\"false\">მეტი</button>"
  },
  {
    "id": "t18",
    "name": "Viewport",
    "topic": "HTML",
    "definition": "ბრაუზერში გვერდის ხილული არე. viewport მეტატეგი მობილურ განლაგებას მოწყობილობის სიგანეს უკავშირებს.",
    "example": "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
  },
  {
    "id": "t19",
    "name": "CSS",
    "topic": "CSS",
    "definition": "ენა, რომელიც შინაარსის წარმოდგენას მართავს: ფერს, ზომას, დაშორებასა და განლაგებას.",
    "example": "p { color: #333; }"
  },
  {
    "id": "t20",
    "name": "Selector",
    "topic": "CSS",
    "definition": "წესი, რომელიც სტილის მისაღებ ელემენტებს ირჩევს.",
    "example": ".card h2 { margin: 0; }"
  },
  {
    "id": "t21",
    "name": "Class",
    "topic": "CSS",
    "definition": "ელემენტის განმეორებადი სახელწოდება. ერთ კლასს მრავალი ელემენტი შეიძლება იყენებდეს.",
    "example": "<article class=\"card\">...</article>"
  },
  {
    "id": "t22",
    "name": "ID",
    "topic": "CSS",
    "definition": "დოკუმენტში ელემენტის უნიკალური იდენტიფიკატორი. ერთ გვერდზე იგივე id არ გაიმეორო.",
    "example": "#contact { padding: 24px; }"
  },
  {
    "id": "t23",
    "name": "Cascade",
    "topic": "CSS",
    "definition": "წესების შერჩევის პროცესი, როცა რამდენიმე დეკლარაცია ერთ ელემენტსა და თვისებას ეხება.",
    "example": "p { color: black; } p { color: green; }"
  },
  {
    "id": "t24",
    "name": "Specificity",
    "topic": "CSS",
    "definition": "სელექტორის წონა, რომელიც კასკადის ერთ-ერთ ეტაპზე წესების პრიორიტეტს განსაზღვრავს.",
    "example": ".card p { color: green; }"
  },
  {
    "id": "t25",
    "name": "Inheritance",
    "topic": "CSS",
    "definition": "ზოგი თვისების მშობლისგან შვილზე გადაცემა. მაგალითად, ტექსტის ფერი ხშირად მემკვიდრეობით მიიღება.",
    "example": "body { color: #333; }"
  },
  {
    "id": "t26",
    "name": "Box model",
    "topic": "CSS",
    "definition": "ელემენტის ზომის მოდელი: შინაარსი, შიდა დაშორება, საზღვარი და გარე დაშორება.",
    "example": ".card { padding: 16px; border: 1px solid; margin: 20px; }"
  },
  {
    "id": "t27",
    "name": "Padding",
    "topic": "CSS",
    "definition": "ელემენტის შინაარსსა და მის საზღვარს შორის შიდა დაშორება.",
    "example": "button { padding: 12px 20px; }"
  },
  {
    "id": "t28",
    "name": "Margin",
    "topic": "CSS",
    "definition": "ელემენტის საზღვრის გარეთ არსებული დაშორება.",
    "example": "section { margin-block: 32px; }"
  },
  {
    "id": "t29",
    "name": "Flexbox",
    "topic": "CSS",
    "definition": "განლაგების მოდელი, რომელიც ძირითადად ერთი მიმართულებით აწყობს ელემენტებს.",
    "example": "nav { display: flex; gap: 16px; }"
  },
  {
    "id": "t30",
    "name": "Grid",
    "topic": "CSS",
    "definition": "ორგანზომილებიანი განლაგება, რომელიც რიგებსა და სვეტებს მართავს.",
    "example": ".cards { display: grid; grid-template-columns: 1fr 1fr; }"
  },
  {
    "id": "t31",
    "name": "Gap",
    "topic": "CSS",
    "definition": "მანძილი Flexbox-ის ან Grid-ის ელემენტებს შორის.",
    "example": ".cards { gap: 24px; }"
  },
  {
    "id": "t32",
    "name": "Media query",
    "topic": "CSS",
    "definition": "პირობა, რომლითაც სტილი გარემოს მახასიათებლების მიხედვით გამოიყენება.",
    "example": "@media (max-width: 600px) { .cards { display: block; } }"
  },
  {
    "id": "t33",
    "name": "Custom property",
    "topic": "CSS",
    "definition": "CSS ცვლადი, რომელიც მნიშვნელობის განმეორებით გამოყენებას ამარტივებს.",
    "example": ":root { --ink: #333; } body { color: var(--ink); }"
  },
  {
    "id": "t34",
    "name": "Pseudo-class",
    "topic": "CSS",
    "definition": "სელექტორის ნაწილი, რომელიც ელემენტის მდგომარეობას ან სტრუქტურულ პირობას აღნიშნავს.",
    "example": "button:focus-visible { outline: 3px solid green; }"
  },
  {
    "id": "t35",
    "name": "Position sticky",
    "topic": "CSS",
    "definition": "პოზიციონირება, რომელიც მითითებულ ზღვარზე ელემენტს გადახვევის კონტეინერში აჩერებს.",
    "example": "header { position: sticky; top: 0; }"
  },
  {
    "id": "t36",
    "name": "Responsive design",
    "topic": "CSS",
    "definition": "დიზაინი, რომელიც სხვადასხვა ზომის ეკრანზე შინაარსსა და მოქმედებებს გამოსადეგად ინარჩუნებს.",
    "example": ".container { width: min(100% - 32px, 1100px); margin: auto; }"
  },
  {
    "id": "t37",
    "name": "JavaScript",
    "topic": "JavaScript",
    "definition": "პროგრამირების ენა, რომლითაც ბრაუზერში გვერდის ქცევასა და მონაცემებს მართავ.",
    "example": "button.addEventListener('click', () => alert('გამარჯობა'));"
  },
  {
    "id": "t38",
    "name": "Variable",
    "topic": "JavaScript",
    "definition": "სახელდებული კავშირი მნიშვნელობასთან. let-ის მნიშვნელობა შეიძლება შეიცვალოს.",
    "example": "let count = 0;"
  },
  {
    "id": "t39",
    "name": "Const",
    "topic": "JavaScript",
    "definition": "ცვლადის გამოცხადება, რომლის თავიდან მინიჭებაც დაუშვებელია. ობიექტის შიგთავსი მაინც შეიძლება შეიცვალოს.",
    "example": "const items = []; items.push('ახალი');"
  },
  {
    "id": "t40",
    "name": "String",
    "topic": "JavaScript",
    "definition": "ტექსტური მნიშვნელობა. ბრჭყალები პროგრამას ტექსტის საზღვრებს აჩვენებს.",
    "example": "const name = 'ანა';"
  },
  {
    "id": "t41",
    "name": "Number",
    "topic": "JavaScript",
    "definition": "რიცხვითი ტიპი. input.value სტრიქონია და საჭიროებისას რიცხვად უნდა გარდაქმნა.",
    "example": "const price = Number(input.value);"
  },
  {
    "id": "t42",
    "name": "Boolean",
    "topic": "JavaScript",
    "definition": "ლოგიკური ტიპი ორი მნიშვნელობით: true და false.",
    "example": "const isOpen = false;"
  },
  {
    "id": "t43",
    "name": "Array",
    "topic": "JavaScript",
    "definition": "მნიშვნელობების დალაგებული კოლექცია. პირველი ელემენტის ინდექსია 0.",
    "example": "const colors = ['მწვანე', 'თეთრი'];"
  },
  {
    "id": "t44",
    "name": "Object",
    "topic": "JavaScript",
    "definition": "გასაღებებისა და მნიშვნელობების ნაკრები, რომელიც ერთი არსების მონაცემებს აერთიანებს.",
    "example": "const item = { title: 'წიგნი', price: 20 };"
  },
  {
    "id": "t45",
    "name": "Function",
    "topic": "JavaScript",
    "definition": "პროგრამის განმეორებით გამოსაყენებელი ნაწილი, რომელსაც პარამეტრები და შედეგი შეიძლება ჰქონდეს.",
    "example": "function double(n) { return n * 2; }"
  },
  {
    "id": "t46",
    "name": "Return",
    "topic": "JavaScript",
    "definition": "ფუნქციის შესრულების დასრულება და გამომძახებლისთვის შედეგის დაბრუნება.",
    "example": "function sum(a, b) { return a + b; }"
  },
  {
    "id": "t47",
    "name": "Condition",
    "topic": "JavaScript",
    "definition": "პირობის მიხედვით სხვადასხვა კოდის შესრულება.",
    "example": "if (count > 0) { button.disabled = false; }"
  },
  {
    "id": "t48",
    "name": "Loop",
    "topic": "JavaScript",
    "definition": "კოდის განმეორებით შესრულება. დასრულების პირობა ყოველთვის გადაამოწმე.",
    "example": "for (const item of items) { console.log(item); }"
  },
  {
    "id": "t49",
    "name": "DOM",
    "topic": "JavaScript",
    "definition": "ბრაუზერის მიერ დოკუმენტის ობიექტებად წარმოდგენა, რომელთა წაკითხვა და შეცვლა შეიძლება.",
    "example": "document.querySelector('h1').textContent = 'ახალი სათაური';"
  },
  {
    "id": "t50",
    "name": "Event",
    "topic": "JavaScript",
    "definition": "მოვლენა, მაგალითად დაწკაპუნება ან შეყვანა, რომელზეც დამმუშავებელი ფუნქციით რეაგირებ.",
    "example": "input.addEventListener('input', event => console.log(event.target.value));"
  },
  {
    "id": "t51",
    "name": "Event delegation",
    "topic": "JavaScript",
    "definition": "მოვლენის საერთო მშობელზე დამუშავება. გამოსადეგია დინამიკურად დამატებული შვილებისთვისაც.",
    "example": "list.addEventListener('click', e => { const b = e.target.closest('button'); });"
  },
  {
    "id": "t52",
    "name": "Filter",
    "topic": "JavaScript",
    "definition": "მასივის მეთოდი, რომელიც პირობის შესაბამის ელემენტებს ახალ მასივში აბრუნებს.",
    "example": "const active = items.filter(item => item.active);"
  },
  {
    "id": "t53",
    "name": "Map",
    "topic": "JavaScript",
    "definition": "მასივის მეთოდი, რომელიც თითოეული ელემენტის გარდაქმნით ახალ მასივს ქმნის.",
    "example": "const names = users.map(user => user.name);"
  },
  {
    "id": "t54",
    "name": "Reduce",
    "topic": "JavaScript",
    "definition": "მასივის თანმიმდევრულად დამუშავება ერთ დაგროვილ შედეგამდე.",
    "example": "const total = prices.reduce((sum, price) => sum + price, 0);"
  },
  {
    "id": "t55",
    "name": "URL",
    "topic": "ვებ-საფუძვლები",
    "definition": "რესურსის მისამართი, რომელიც სქემას, ჰოსტს, გზასა და სხვა ნაწილებს შეიძლება შეიცავდეს.",
    "example": "https://example.com/projects?id=2"
  },
  {
    "id": "t56",
    "name": "HTTP",
    "topic": "ვებ-საფუძვლები",
    "definition": "კლიენტსა და სერვერს შორის მოთხოვნებისა და პასუხების გაცვლის პროტოკოლი.",
    "example": "GET /about.html"
  },
  {
    "id": "t57",
    "name": "HTTPS",
    "topic": "ვებ-საფუძვლები",
    "definition": "HTTP დაშიფრულ კავშირზე. საიტის შინაარსის სისწორეს თავისთავად არ ადასტურებს.",
    "example": "https://example.com"
  },
  {
    "id": "t58",
    "name": "Request",
    "topic": "ვებ-საფუძვლები",
    "definition": "კლიენტის მიერ სერვერისთვის გაგზავნილი მოთხოვნა კონკრეტული რესურსის ან მოქმედებისთვის.",
    "example": "fetch('/api/items')"
  },
  {
    "id": "t59",
    "name": "Response",
    "topic": "ვებ-საფუძვლები",
    "definition": "სერვერის პასუხი მოთხოვნაზე: სტატუსი, სათაურები და საჭიროებისას შინაარსი.",
    "example": "const data = await response.json();"
  },
  {
    "id": "t60",
    "name": "Status code",
    "topic": "ვებ-საფუძვლები",
    "definition": "პასუხის რიცხვითი სტატუსი. 404 ნიშნავს, რომ მოთხოვნილი რესურსი ვერ მოიძებნა.",
    "example": "200 OK / 404 Not Found"
  },
  {
    "id": "t61",
    "name": "JSON",
    "topic": "ვებ-საფუძვლები",
    "definition": "მონაცემების ტექსტური ფორმატი. ობიექტის გასაღებები ორმაგ ბრჭყალებში იწერება.",
    "example": "{\"name\":\"ანა\",\"active\":true}"
  },
  {
    "id": "t62",
    "name": "Local storage",
    "topic": "ვებ-საფუძვლები",
    "definition": "საიტის წარმოშობასთან დაკავშირებული ბრაუზერული საცავი. სტრიქონებს ინახავს; საიდუმლოებების საცავად არ გამოიყენო.",
    "example": "localStorage.setItem('theme', 'light');"
  },
  {
    "id": "t63",
    "name": "Session storage",
    "topic": "ვებ-საფუძვლები",
    "definition": "ბრაუზერის ჩანართისა და საიტის წარმოშობის შესაბამისი დროებითი საცავი.",
    "example": "sessionStorage.setItem('step', '2');"
  },
  {
    "id": "t64",
    "name": "API",
    "topic": "ვებ-საფუძვლები",
    "definition": "წესები და ინტერფეისი, რომლითაც პროგრამის ნაწილები ან სხვადასხვა პროგრამა ურთიერთობს.",
    "example": "const result = await fetch('/api/projects');"
  },
  {
    "id": "t65",
    "name": "Async / await",
    "topic": "ვებ-საფუძვლები",
    "definition": "Promise-ზე დაფუძნებული ასინქრონული კოდის წაკითხვადი ფორმა. await შედეგს ასინქრონულ ფუნქციაში ელოდება.",
    "example": "const response = await fetch('/api/items');"
  },
  {
    "id": "t66",
    "name": "Promise",
    "topic": "ვებ-საფუძვლები",
    "definition": "მომავალი დასრულების ან წარუმატებლობის აღმნიშვნელი ობიექტი.",
    "example": "fetch('/api/items').then(response => response.json());"
  },
  {
    "id": "t67",
    "name": "Validation",
    "topic": "ვებ-საფუძვლები",
    "definition": "მონაცემის შემოწმება წესებთან შესაბამისობაზე. კლიენტური შემოწმება სერვერულს არ ცვლის.",
    "example": "if (name.trim().length < 2) { showError(); }"
  },
  {
    "id": "t68",
    "name": "Accessibility",
    "topic": "ვებ-საფუძვლები",
    "definition": "ინტერფეისის გამოყენებადობა სხვადასხვა შესაძლებლობისა და დამხმარე ტექნოლოგიის მომხმარებლებისთვის.",
    "example": "<button aria-label=\"ფანჯრის დახურვა\">×</button>"
  },
  {
    "id": "t69",
    "name": "Focus",
    "topic": "ვებ-საფუძვლები",
    "definition": "ელემენტი, რომელიც მოცემულ მომენტში კლავიატურის შეყვანას იღებს.",
    "example": "button.focus();"
  },
  {
    "id": "t70",
    "name": "Debugging",
    "topic": "ვებ-საფუძვლები",
    "definition": "შეცდომის გამეორება, მიზეზის პოვნა, გამოსწორება და შედეგის შემოწმება.",
    "example": "console.log({ value, expected });"
  },
  {
    "id": "t71",
    "name": "Deployment",
    "topic": "ვებ-საფუძვლები",
    "definition": "პროექტის ისეთ გარემოში გამოქვეყნება, სადაც მომხმარებელს მისი გამოყენება შეუძლია.",
    "example": "build → შემოწმება → გამოქვეყნება"
  },
  {
    "id": "t72",
    "name": "Version control",
    "topic": "ვებ-საფუძვლები",
    "definition": "ფაილების ცვლილებების ისტორიის მართვა. ძველ ვერსიასთან შედარებასა და დაბრუნებას ამარტივებს.",
    "example": "git status"
  }
,...extraTerms
];
