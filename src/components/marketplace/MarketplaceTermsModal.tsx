import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "marketplace_terms_v1";

interface Props {
  onAccepted: () => void;
}

const style = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=Unbounded:wght@700;900&family=IBM+Plex+Sans+Georgian:wght@300;400;500;600&display=swap');

  .mkt-root {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    background: rgba(6, 6, 8, 0.92);
    backdrop-filter: blur(6px) saturate(0.6);
    font-family: 'IBM Plex Sans Georgian', sans-serif;
    transition: opacity 0.3s ease;
  }

  .mkt-panel {
    width: 100%;
    max-width: 640px;
    max-height: 92vh;
    display: flex;
    flex-direction: column;
    background: #0a0a0d;
    border: 1px solid #1e1e28;
    outline: 1px solid rgba(255,255,255,0.04);
    outline-offset: 3px;
    position: relative;
    overflow: hidden;
  }

  /* Corner brackets */
  .mkt-panel::before,
  .mkt-panel::after {
    content: '';
    position: absolute;
    width: 18px;
    height: 18px;
    z-index: 10;
    pointer-events: none;
  }
  .mkt-panel::before {
    top: -1px; left: -1px;
    border-top: 2px solid #c8a84b;
    border-left: 2px solid #c8a84b;
  }
  .mkt-panel::after {
    bottom: -1px; right: -1px;
    border-bottom: 2px solid #c8a84b;
    border-right: 2px solid #c8a84b;
  }

  .corner-tr, .corner-bl {
    position: absolute;
    width: 18px;
    height: 18px;
    z-index: 10;
    pointer-events: none;
  }
  .corner-tr {
    top: -1px; right: -1px;
    border-top: 2px solid #c8a84b;
    border-right: 2px solid #c8a84b;
  }
  .corner-bl {
    bottom: -1px; left: -1px;
    border-bottom: 2px solid #c8a84b;
    border-left: 2px solid #c8a84b;
  }

  .mkt-header {
    padding: 24px 28px 0;
    flex-shrink: 0;
    border-bottom: 1px solid #141420;
    padding-bottom: 20px;
  }

  .mkt-tagline {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.65rem;
    letter-spacing: 0.18em;
    color: #c8a84b;
    text-transform: uppercase;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .mkt-tagline::before {
    content: '';
    display: inline-block;
    width: 20px;
    height: 1px;
    background: #c8a84b;
  }

  .mkt-title {
    font-family: 'Unbounded', sans-serif;
    font-size: 1.15rem;
    font-weight: 900;
    color: #f0ece0;
    line-height: 1.25;
    letter-spacing: -0.02em;
  }

  .mkt-scroll-hint {
    margin-top: 14px;
    padding: 8px 12px;
    border: 1px solid #1e1e28;
    border-left: 2px solid #c8a84b;
    background: rgba(200, 168, 75, 0.04);
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .mkt-scroll-hint span {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.72rem;
    color: rgba(200,168,75,0.7);
    letter-spacing: 0.04em;
  }

  .mkt-body {
    overflow-y: auto;
    flex: 1;
    padding: 24px 28px;
    scrollbar-width: thin;
    scrollbar-color: #1e1e28 transparent;
  }
  .mkt-body::-webkit-scrollbar { width: 4px; }
  .mkt-body::-webkit-scrollbar-track { background: transparent; }
  .mkt-body::-webkit-scrollbar-thumb { background: #1e1e28; }

  .terms-item {
    margin-bottom: 20px;
    display: grid;
    grid-template-columns: 38px 1fr;
    gap: 0 12px;
    align-items: start;
  }

  .terms-num {
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.65rem;
    font-weight: 700;
    color: #c8a84b;
    letter-spacing: 0.06em;
    padding-top: 2px;
    text-align: right;
    user-select: none;
  }

  .terms-content {
    border-top: 1px solid #141420;
    padding-top: 8px;
  }

  .terms-heading {
    font-weight: 600;
    font-size: 0.82rem;
    color: #e8e4d4;
    margin-bottom: 6px;
    letter-spacing: 0.01em;
  }

  .terms-text {
    font-size: 0.8rem;
    color: rgba(255,255,255,0.38);
    line-height: 1.75;
    font-weight: 300;
  }

  .terms-text ul {
    padding-left: 14px;
    margin: 6px 0 0;
  }
  .terms-text li {
    margin-bottom: 3px;
  }
  .terms-text li::marker {
    color: #c8a84b;
    content: '— ';
  }

  .terms-text strong {
    color: rgba(255,255,255,0.7);
    font-weight: 500;
  }

  .terms-warn {
    color: rgba(200,168,75,0.75);
    font-weight: 500;
  }

  .mkt-disclaimer {
    margin-top: 4px;
    padding: 12px 14px;
    background: transparent;
    border: 1px dashed rgba(255,255,255,0.08);
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.7rem;
    color: rgba(255,255,255,0.25);
    line-height: 1.7;
    letter-spacing: 0.02em;
  }

  .mkt-footer {
    padding: 18px 28px;
    border-top: 1px solid #141420;
    flex-shrink: 0;
    display: flex;
    gap: 10px;
  }

  .btn-decline {
    flex: 0 0 auto;
    padding: 11px 20px;
    background: transparent;
    border: 1px solid #1e1e28;
    color: rgba(255,255,255,0.3);
    cursor: pointer;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: all 0.15s ease;
  }
  .btn-decline:hover {
    border-color: rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.5);
  }

  .btn-accept {
    flex: 1;
    padding: 11px 20px;
    border: none;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 700;
    cursor: not-allowed;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    position: relative;
    overflow: hidden;
  }
  .btn-accept.locked {
    background: #0f0f16;
    border: 1px solid #1e1e28;
    color: rgba(255,255,255,0.18);
  }
  .btn-accept.unlocked {
    background: linear-gradient(135deg, #7c3aed, #6d28d9);
    color: #fff;
    cursor: pointer;
    box-shadow: 0 0 24px rgba(124,58,237,0.35);
  }
  .btn-accept.unlocked::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%);
    animation: sheen 2.5s ease 0.3s;
  }
  @keyframes sheen {
    0% { transform: translateX(-120%); }
    100% { transform: translateX(120%); }
  }

  .btn-icon {
    font-size: 16px;
  }

  .mkt-panel {
    animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1);
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(16px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

const terms = [
  {
    num: "01",
    heading: "პლატფორმის სტატუსი და შუამავლობა",
    content: (
      <>
        CodeZeroX Marketplace წარმოადგენს ელექტრონულ სავაჭრო პლატფორმას, რომელიც ფუნქციონირებს
        ექსკლუზიურად შუამავლის სახით. პლატფორმა უზრუნველყოფს ტექნიკურ გარემოს გამყიდველებსა
        და მყიდველებს შორის ურთიერთობისთვის, თუმცა{" "}
        <strong>არ არის და ვერ იქნება მხარე რომელიმე გარიგებაში</strong>. CodeZeroX-ი
        არ წარმოადგენს გამყიდველს, ბროკერს, აგენტს ან გარანტს ნებისმიერ ტრანზაქციასთან
        მიმართებით.
      </>
    ),
  },
  {
    num: "02",
    heading: "პასუხისმგებლობის სრული გამორიცხვა",
    content: (
      <>
        <span className="terms-warn">
          CodeZeroX-ი, მისი დირექტორები, თანამშრომლები, პარტნიორები და სერვისის
          მომწოდებლები კატეგორიულად და სრულად გათავისუფლებულნი არიან ნებისმიერი
          პასუხისმგებლობისაგან, მათ შორის:
        </span>
        <ul>
          <li>
            პლატფორმაზე განთავსებული კოდის, სკრიპტის ან ციფრული პროდუქტის
            ხარისხის, ფუნქციონალობის, უსაფრთხოებისა და სიზუსტის გამო
          </li>
          <li>
            მხარეებს შორის წარმოქმნილი ნებისმიერი ფინანსური დავის, თაღლითობის,
            ზარალის ან დანაკარგის გამო — პირდაპირი თუ არაპირდაპირი
          </li>
          <li>
            გადაცემული კოდის ინტელექტუალური საკუთრების უფლებათა შესაძლო
            დარღვევის, სხვის ნამუშევრის მითვისების ან ლიცენზიის პირობების
            შეუსრულებლობის გამო
          </li>
          <li>
            ნასყიდობის, მომსახურების ან სხვა ნებისმიერი ხელშეკრულებით
            ნაკისრი ვალდებულების ნებისმიერი მხარის მიერ შეუსრულებლობის გამო
          </li>
          <li>
            გადახდის განხორციელების შემდგომ შეუსაბამო, მოდიფიცირებული ან
            არაფუნქციური პროდუქტის მიწოდების გამო
          </li>
          <li>
            ციფრული პროდუქტის გამოყენებით მომხმარებლის ან მესამე პირის
            სისტემისთვის მიყენებული ნებისმიერი ზიანის გამო
          </li>
        </ul>
        <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderLeft: "2px solid rgba(255,255,255,0.08)", fontSize: "0.78rem", color: "rgba(255,255,255,0.28)", lineHeight: 1.7 }}>
          ზემოაღნიშნული შეზღუდვები მოქმედებს გამოყენებული სამართლის ნებადართული
          მაქსიმალური ფარგლებით და ძალაშია პასუხისმგებლობის სახის (სახელშეკრულებო,
          დელიქტური, კანონისმიერი ან სხვ.) მიუხედავად.
        </div>
      </>
    ),
  },
  {
    num: "03",
    heading: "მომხმარებლის პირადი პასუხისმგებლობა",
    content: (
      <>
        პლატფორმაზე რეგისტრაციით და მარკეტის გამოყენებით მომხმარებელი უპირობოდ
        აღიარებს და იღებს:
        <ul>
          <li>
            <strong>სრულ და განუყოფელ პასუხისმგებლობას</strong> ნებისმიერ
            გარიგებაზე, რომელსაც ახორციელებს პლატფორმის მეშვეობით
          </li>
          <li>
            ვალდებულებას განახორციელოს გამყიდველის სათანადო შემოწმება
            (Due Diligence) — რეიტინგის, პორტფოლიოს, გამოხმაურებების
            საფუძველზე — გარიგებამდე
          </li>
          <li>
            გარიგებამდე ლაივ-პრევიუს ან კოდის ნიმუშის მოთხოვნის
            შესაძლებლობის სრულ გამოყენებას
          </li>
          <li>
            Chat-ში მიმოწერის შენახვას — ყველა შეთანხმება ფიქსირდება
            სისტემაში და, საჭიროების შემთხვევაში, გამოიყენება სადავო
            სიტუაციის გასარჩევად
          </li>
        </ul>
      </>
    ),
  },
  {
    num: "04",
    heading: "გარიგების სიფრთხილის სტანდარტი",
    content: (
      <>
        CodeZeroX-ი კატეგორიულად განმარტავს და მოუწოდებს მომხმარებლებს
        დაიცვან შემდეგი სტანდარტები:
        <ul>
          <li>
            გადახდა განხორციელდეს მხოლოდ ლაივ-პრევიუს ან სამუშაო დემო-ვერსიის
            სრული გადამოწმების შემდეგ — წინასწარი გადახდა დაუშვებელია
          </li>
          <li>
            ყველა პირობა, ვალდებულება და შეთანხმება ასახული უნდა იყოს
            პლატფორმის Chat-ში; პლატფორმის გარეთ დადებული ზეპირი ან
            წერილობითი შეთანხმება პლატფორმის მიმართ სამართლებრივ ძალას
            მოკლებულია
          </li>
          <li>
            ჩამოტვირთული პროდუქტი სრულად გადამოწმდეს „მიღების" დადასტურებამდე;
            დადასტურების შემდეგ ადმინისტრაცია ვერ ჩაერევა
          </li>
          <li>
            ნებისმიერი სადავო სიტუაციის შემთხვევაში მომხმარებელი
            მიმართავს მხარდაჭერის სამსახურს: Chat → Admin
          </li>
        </ul>
      </>
    ),
  },
  {
    num: "05",
    heading: "გამყიდველის სამართლებრივი ვალდებულებები",
    content: (
      <>
        პლატფორმაზე პროდუქტის განთავსებით გამყიდველი კისრულობს სრულ
        სამართლებრივ პასუხისმგებლობას შემდეგ ვალდებულებებზე:
        <ul>
          <li>
            განთავსებული კოდი ან ციფრული პროდუქტი წარმოადგენს{" "}
            <strong>ექსკლუზიურად გამყიდველის ორიგინალ ნამუშევარს</strong>,
            თავისუფალია მესამე პირების ინტელექტუალური საკუთრების
            უფლებათა ნებისმიერი სახის ხელყოფისაგან
          </li>
          <li>
            სხვის ნამუშევრის ავტორობის მითვისება და გასხვისება
            გამოიწვევს ანგარიშის სამუდამო დეაქტივაციას და, საჭიროების
            შემთხვევაში, შესაბამის ორგანოებთან მიმართვას
          </li>
          <li>
            პრევიუ URL ინახება სამუშაო მდგომარეობაში განცხადების
            გამოქვეყნებიდან გაყიდვის დასრულებამდე
          </li>
          <li>
            პროდუქტის ფასი ან „შეთანხმებით" ნიშნული მკაფიოდ
            მითითებულია განცხადებაში
          </li>
        </ul>
      </>
    ),
  },
  {
    num: "06",
    heading: "კატეგორიულად აკრძალული ქმედებები",
    content: (
      <>
        <div style={{ marginBottom: 8, color: "rgba(255,255,255,0.35)", fontSize: "0.79rem", lineHeight: 1.6 }}>
          შემდეგი ქმედებები წარმოადგენს წინამდებარე წესების არსებით დარღვევას
          და გამოიწვევს სანქციებს ადმინისტრაციული გადაწყვეტილებით:
        </div>
        <ul>
          <li>
            მოტყუება, შეცდომაში შეყვანა ან ყალბი ინფორმაციის
            გავრცელება პროდუქტის, ფუნქციონალობის ან ფასის შესახებ
          </li>
          <li>
            Malware-ის, სპივეარის, ბექდორის ან სხვა მავნე კოდის
            განთავსება ან გავრცელება
          </li>
          <li>
            სხვა მომხმარებლის შევიწროება, სპამი ან
            არასასურველი კომერციული კომუნიკაცია
          </li>
          <li>
            პლატფორმის გვერდის ავლით გარიგების განხორციელების
            ან ასეთის მცდელობის ნებისმიერი ფორმა
          </li>
        </ul>
        <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(255,255,255,0.03)", borderLeft: "2px solid rgba(255,255,255,0.08)", fontSize: "0.78rem", color: "rgba(255,255,255,0.28)", lineHeight: 1.7 }}>
          ადმინისტრაციას უფლება აქვს ნებისმიერი ანგარიში და განცხადება
          დაბლოკოს ან სამუდამოდ წაშალოს ნებისმიერ დროს, გაფრთხილების
          გარეშე, ყოველგვარი კომპენსაციის ვალდებულების გარეშე.
        </div>
      </>
    ),
  },
  {
    num: "07",
    heading: "ინტელექტუალური საკუთრება",
    content: (
      <>
        CodeZeroX-ი არ იძენს, არ ფლობს და არ მართავს პლატფორმაზე
        განთავსებული კოდის ან ციფრული პროდუქტის ინტელექტუალური
        საკუთრების უფლებებს. ყველა შინაარსი გამყიდველის
        ექსკლუზიური საკუთრებაა — ან ისეთი, რომელზეც მას ლეგიტიმური
        განკარგვის უფლება გააჩნია. ნებისმიერი სამართლებრივი
        დავა საავტორო უფლებებთან დაკავშირებით{" "}
        <strong>მხოლოდ შესაბამის სასამართლო ინსტანციებში</strong> გადაიჭრება
        — CodeZeroX-ი ასეთ დავებში მხარე არ არის.
      </>
    ),
  },
  {
    num: "08",
    heading: "პირობების ცვლილება და მოქმედების ვადა",
    content: (
      <>
        CodeZeroX-ი იტოვებს უფლებას ნებისმიერ დროს, ცალმხრივად
        განაახლოს ან შეცვალოს წინამდებარე წესები. განახლებული პირობები
        ძალაში შედის გამოქვეყნებიდან <strong>48 საათის</strong> შემდეგ.
        მომხმარებელი ვალდებულია პერიოდულად გაეცნოს პირობებს; პლატფორმის
        შემდგომი გამოყენება განახლებულ პირობებთან თანხმობად ჩაითვლება.
      </>
    ),
  },
];

const MarketplaceTermsModal = ({ onAccepted }: Props) => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
    setTimeout(onAccepted, 220);
  };

  const handleDecline = () => {
    setVisible(false);
    setTimeout(() => navigate("/"), 220);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
      setScrolled(true);
    }
  };

  return (
    <>
      <style>{style}</style>
      <div
        className="mkt-root"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className="mkt-panel">
          <div className="corner-tr" />
          <div className="corner-bl" />

          {/* Header */}
          <div className="mkt-header">
            <div className="mkt-tagline">CODEZEROХ · MARKETPLACE</div>
            <div className="mkt-title">
              გამოყენების წესები
              <br />
              და პირობები
            </div>
            {!scrolled && (
              <div className="mkt-scroll-hint">
                <span className="material-symbols-rounded" style={{ fontSize: 14, color: "#c8a84b" }}>
                 
                </span>
                <span>ბოლომდე ჩამოსქროლეთ, შემდეგ ხელი მოაწერეთ</span>
              </div>
            )}
          </div>

          {/* Body */}
          <div className="mkt-body" onScroll={handleScroll}>
            {terms.map((t) => (
              <div key={t.num} className="terms-item">
                <div className="terms-num">{t.num}</div>
                <div className="terms-content">
                  <div className="terms-heading">{t.heading}</div>
                  <div className="terms-text">{t.content}</div>
                </div>
              </div>
            ))}

            <div className="mkt-disclaimer">
              წინამდებარე დოკუმენტი წარმოადგენს CodeZeroX Marketplace-ის გამოყენების
              სავალდებულო წესებს. პლატფორმით სარგებლობა ნიშნავს ყველა ზემოაღნიშნული
              დებულების უპირობო, სრულ და გამოუხმობ მიღებას.
              <br />
              CodeZeroX არ არის სახელშეკრულებო მხარე მომხმარებლებს შორის
              ნებისმიერ გარიგებაში და არ ეკისრება მასთან დაკავშირებული
              ვალდებულებები კანონით ნებადართული მაქსიმალური ფარგლებით.
              <br /><br />
              CODEZEROХ MARKETPLACE · REV 2026-01 · გამოქვეყნება: 01.01.2026
            </div>
          </div>

          {/* Footer */}
          <div className="mkt-footer">
            <button className="btn-decline" onClick={handleDecline}>
              უარვყოფ
            </button>
            <button
              className={`btn-accept ${scrolled ? "unlocked" : "locked"}`}
              onClick={scrolled ? handleAccept : undefined}
              disabled={!scrolled}
            >
              <span className="material-symbols-rounded btn-icon">
                {scrolled ? "stylus_note" : "lock"}
              </span>
              {scrolled ? "ვეთანხმები — შესვლა" : "ჩამოსქროლეთ ბოლომდე"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export const useMarketplaceTerms = () => {
  const [accepted, setAccepted] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setAccepted(stored === "accepted");
  }, []);

  return { accepted, needsModal: accepted === false };
};

export default MarketplaceTermsModal;
