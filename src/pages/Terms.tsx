import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          უკან დაბრუნება
        </button>

        <h1 className="text-3xl font-bold mb-2">წესები და პირობები</h1>
        <p className="text-muted-foreground mb-8">ბოლო განახლება: 2026 წლის 1მაისი</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. ზოგადი პირობები</h2>
            <p>
              CodeZero Academy (შემდგომში „პლატფორმა") არის ქართული საგანმანათლებლო ვებ-პლატფორმა, რომელიც მომხმარებლებს სთავაზობს პროგრამირების წიგნებს, ონლაინ კურსებს, AI მენტორს, კოდის რედაქტორს და დეველოპერთა საზოგადოებას. პლატფორმაზე რეგისტრაციით თქვენ ეთანხმებით ქვემოთ მოცემულ წესებსა და პირობებს.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. ანგარიშის შექმნა</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>რეგისტრაციისთვის საჭიროა მოქმედი ელფოსტის მისამართი და პაროლი (მინიმუმ 6 სიმბოლო).</li>
              <li>თქვენ ვალდებული ხართ შეინარჩუნოთ თქვენი ანგარიშის უსაფრთხოება და არ გაუზიაროთ წვდომა მესამე პირებს.</li>
              <li>დროებითი (disposable) ელფოსტის მისამართებით რეგისტრაცია აკრძალულია.</li>
              <li>პლატფორმა იტოვებს უფლებას შეაჩეროს ან წაშალოს ანგარიში წესების დარღვევის შემთხვევაში.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. შინაარსი და ინტელექტუალური საკუთრება</h2>
            <ul className="list-disc pl-5 space-y-2">
              
              <li>შეძენილი წიგნები და კურსები განკუთვნილია მხოლოდ პირადი სარგებლობისთვის.</li>
              <li>აკრძალულია შეძენილი მასალის გადაცემა, კოპირება, გავრცელება ან გაყიდვა მესამე პირებისთვის.</li>
              <li>PDF ფაილების ჩამოტვირთვა, სკრინშოტინგი ან ბეჭდვა პლატფორმის გარეთ აკრძალულია.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. შეძენა და გადახდა</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>წიგნებისა და კურსების ფასები მითითებულია ქართულ ლარში (₾).</li>
              <li>გადახდა ხორციელდება flitit-ის მეშვეობით.</li>
              <li>შეძენის შემდეგ თანხის დაბრუნება არ ხორციელდება, გარდა ტექნიკური შეცდომების შემთხვევისა.</li>
              <li>უფასო წიგნები და კურსები ხელმისაწვდომია ყველა რეგისტრირებული მომხმარებლისთვის.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5.ლეგალური ინფორმაცია</h2>
            <li>მეწარმის დასახელება: ინდივიდუალური მეწარმე კოდეზერო</li>
            <li> ტელეფონის ნომერი : 555003040 </li>
            <li> მისამართი :ონლაინ  </li>
            <li> პირადი ნომერი:01007011758 </li>
          
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. AI მენტორი და კრედიტები</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>AI მენტორის გამოყენება მოითხოვს კრედიტებს.</li>
              <li>კრედიტების შეძენა შესაძლებელია პლატფორმაზე არსებული პაკეტებიდან.</li>
              <li>გამოყენებული კრედიტების დაბრუნება არ ხორციელდება.</li>
              <li>AI მენტორის პასუხები საინფორმაციო ხასიათისაა და არ წარმოადგენს პროფესიულ კონსულტაციას.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. საზოგადოება და კომუნიკაცია</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>ჰაბში (საზოგადოების ჩატში) აკრძალულია შეურაცხმყოფელი, დისკრიმინაციული ან სპამ-შეტყობინებების გაგზავნა.</li>
              <li>ადმინისტრაცია იტოვებს უფლებას წაშალოს შეუსაბამო შეტყობინებები.</li>
              <li>ფრილანსერთა პროფილებში მოცემული ინფორმაციის სიზუსტეზე პლატფორმა პასუხისმგებლობას არ იღებს.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. ვაკანსიები</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>პლატფორმაზე ვაკანსიების განთავსება შეუძლია ნებისმიერ რეგისტრირებულ მომხმარებელს.</li>
              <li>პლატფორმა არ არის პასუხისმგებელი დამსაქმებელსა და კანდიდატს შორის ურთიერთობაზე.</li>
              <li>ყალბი ვაკანსიების განთავსება აკრძალულია და გამოიწვევს ანგარიშის შეჩერებას.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. პასუხისმგებლობის შეზღუდვა</h2>
            <p>
              პლატფორმა მოწოდებულია „როგორც არის" პრინციპით. ჩვენ ვცდილობთ უზრუნველვყოთ სერვისის უწყვეტი მუშაობა, თუმცა არ ვიღებთ პასუხისმგებლობას ტექნიკური შეფერხებების, მონაცემთა დაკარგვის ან სერვისის მიუწვდომლობის შემთხვევაში.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. ცვლილებები</h2>
            <p>
              პლატფორმა იტოვებს უფლებას ნებისმიერ დროს შეცვალოს წესები და პირობები. მნიშვნელოვანი ცვლილებების შემთხვევაში მომხმარებლები ეცნობებათ ელფოსტით ან პლატფორმაზე შეტყობინებით.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. საკონტაქტო ინფორმაცია</h2>
            <p>
              კითხვების ან პრობლემების შემთხვევაში დაგვიკავშირდით პლატფორმაზე არსებული ჩატის მეშვეობით ან ელფოსტით.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
