import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
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

        <h1 className="text-3xl font-bold mb-2">კონფიდენციალურობის პოლიტიკა</h1>
        <p className="text-muted-foreground mb-8">ბოლო განახლება: 2026 წლის 8 მარტი</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. შეგროვებული მონაცემები</h2>
            <p className="mb-3">CodeZero Academy პლატფორმა აგროვებს შემდეგ მონაცემებს:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">რეგისტრაციის მონაცემები:</strong> სახელი, გვარი, ელფოსტის მისამართი, მომხმარებლის სახელი და სპეციალობა.</li>
              <li><strong className="text-foreground">პროფილის მონაცემები:</strong> ავატარის სურათი, ბიოგრაფია (ფრილანსერთათვის).</li>
              <li><strong className="text-foreground">აქტივობის მონაცემები:</strong> წიგნების წაკითხვის პროგრესი, კურსების გავლის სტატუსი, AI მენტორთან საუბრების ისტორია.</li>
              <li><strong className="text-foreground">გადახდის მონაცემები:</strong> შეძენების ისტორია და flitit ტრანზაქციის იდენტიფიკატორები (საბანკო ბარათის მონაცემები არ ინახება ჩვენს სერვერზე).</li>
              <li><strong className="text-foreground">კომუნიკაციის მონაცემები:</strong> ჩატის შეტყობინებები, საზოგადოების პოსტები, ვაკანსიებზე გაგზავნილი განაცხადები.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. მონაცემთა გამოყენების მიზნები</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>ანგარიშის შექმნა და ავტორიზაცია.</li>
              <li>შეძენილ კონტენტზე წვდომის უზრუნველყოფა.</li>
              <li>წაკითხვის პროგრესის შენახვა და აღდგენა.</li>
              <li>AI მენტორის ფუნქციონირება და პერსონალიზებული პასუხების მიწოდება.</li>
              <li>პლატფორმის გაუმჯობესება და ტექნიკური პრობლემების აღმოფხვრა.</li>
              <li>კრედიტების და შეძენების მართვა.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. მონაცემთა დაცვა</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>ყველა მონაცემი ინახება დაშიფრული სახით უსაფრთხო სერვერებზე.</li>
              <li>პაროლები ინახება ჰეშირებული სახით — ჩვენ ვერ ვხედავთ თქვენს პაროლს.</li>
              <li>მონაცემებზე წვდომა შეზღუდულია Row-Level Security (RLS) პოლიტიკებით — თითოეული მომხმარებელი ხედავს მხოლოდ საკუთარ მონაცემებს.</li>
              <li>ელფოსტის ვალიდაცია ხორციელდება რეგისტრაციისას დროებითი მისამართების დაბლოკვისთვის.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. მონაცემთა გაზიარება</h2>
            <p className="mb-3">ჩვენ <strong className="text-foreground">არ ვყიდით</strong> და <strong className="text-foreground">არ ვაზიარებთ</strong> თქვენს პერსონალურ მონაცემებს მესამე პირებთან, გარდა:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">PayPal:</strong> გადახდის დასამუშავებლად (მხოლოდ ტრანზაქციის ინფორმაცია).</li>
              <li><strong className="text-foreground">კანონმდებლობის მოთხოვნა:</strong> სამართალდამცავი ორგანოების ლეგიტიმური მოთხოვნის შემთხვევაში.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. საჯარო ინფორმაცია</h2>
            <p>შემდეგი მონაცემები შეიძლება იყოს ხილული სხვა მომხმარებლებისთვის:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>სახელი და ავატარი (საზოგადოების ჰაბში და რეცენზიებში).</li>
              <li>ფრილანსერის პროფილი (თუ შექმნილია) — უნარები, პროექტები, შეფასებები.</li>
              <li>კოდის ედიტორში საჯაროდ გამოქვეყნებული პროექტები.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">6. ქუქი-ფაილები (Cookies)</h2>
            <p>
              პლატფორმა იყენებს ტექნიკურ ქუქი-ფაილებს ავტორიზაციის სესიის შესანარჩუნებლად. ჩვენ არ ვიყენებთ თვალთვალის (tracking) ქუქი-ფაილებს ან მესამე მხარის სარეკლამო ინსტრუმენტებს.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">7. მომხმარებლის უფლებები</h2>
            <p>თქვენ გაქვთ უფლება:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>მოითხოვოთ თქვენი პერსონალური მონაცემების ასლი.</li>
              <li>შეცვალოთ ან განაახლოთ პროფილის ინფორმაცია.</li>
              <li>მოითხოვოთ ანგარიშის წაშლა (ადმინისტრაციასთან დაკავშირებით ჩატის მეშვეობით).</li>
              <li>გამოიტანოთ თქვენი მონაცემები.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">8. მონაცემთა შენახვის ვადა</h2>
            <p>
              თქვენი მონაცემები ინახება ანგარიშის აქტიურობის პერიოდში. ანგარიშის წაშლის შემთხვევაში, პერსონალური მონაცემები წაიშლება 30 დღის განმავლობაში, გარდა გადახდების ისტორიისა, რომელიც ინახება საგადასახადო მიზნებისთვის.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">9. ცვლილებები</h2>
            <p>
              კონფიდენციალურობის პოლიტიკის ცვლილებების შემთხვევაში, განახლებული ვერსია გამოქვეყნდება ამ გვერდზე განახლებული თარიღით. მნიშვნელოვანი ცვლილებებისას მომხმარებლები მიიღებენ შეტყობინებას.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">10. კონტაქტი</h2>
            <p>
              კონფიდენციალურობასთან დაკავშირებული კითხვებისთვის დაგვიკავშირდით პლატფორმის ჩატის მეშვეობით.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
