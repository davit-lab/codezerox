const STEPS = [
  {
    level: "01",
    tag: "beginner",
    title: "საფუძვლები",
    desc: "ცვლადები, ლოგიკა, ფუნქციები, პირველი პროექტი. HTML, CSS, JavaScript-ის საწყისები.",
    meta: "6 წიგნი · 4 კურსი",
    icon: "rocket_launch",
  },
  {
    level: "02",
    tag: "intermediate",
    title: "ფრეიმვორკები",
    desc: "React, Node.js, TypeScript. კომპონენტული აზროვნება და მდგომარეობის მართვა.",
    meta: "8 წიგნი · 6 კურსი",
    icon: "hub",
  },
  {
    level: "03",
    tag: "advanced",
    title: "სისტემები",
    desc: "მონაცემთა ბაზები, API, deployment, არქიტექტურა და ტესტირება.",
    meta: "5 წიგნი · 4 კურსი",
    icon: "dns",
  },
  {
    level: "04",
    tag: "pro",
    title: "პროფესია",
    desc: "პორტფოლიო, კარიერული გზა, freelance და კომპანიაში ინტერვიუებისთვის მზადება.",
    meta: "სერტიფიკატი · მენტორინგი",
    icon: "workspace_premium",
  },
];

const LearningRoadmap = () => {
  return (
    <section className="roadmap-section">
      <div className="container">
        <div className="roadmap-header">
          <div>
            <span className="roadmap-eyebrow">
              <span className="material-symbols-rounded text-[14px]">route</span>
              learning path
            </span>
            <h2 className="roadmap-title">
              შენი გზა კოდის მწერლიდან <span className="text-gold">დეველოპერამდე</span>
            </h2>
          </div>
          <p className="roadmap-lede">
            სტრუქტურირებული პროგრამა, სადაც ყოველი ნაბიჯი აგებულია წინაზე. არა ქაოსური სახელმძღვანელოები — რეალური სასწავლო რუკა.
          </p>
        </div>

        <div className="roadmap-grid">
          {STEPS.map((s, i) => (
            <div key={s.level} className="roadmap-card" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="roadmap-card-head">
                <span className="roadmap-level">{s.level}</span>
                <span className={`roadmap-tag roadmap-tag-${s.tag}`}>{s.tag}</span>
              </div>
              <div className="roadmap-icon">
                <span className="material-symbols-rounded">{s.icon}</span>
              </div>
              <h3 className="roadmap-card-title">{s.title}</h3>
              <p className="roadmap-card-desc">{s.desc}</p>
              <div className="roadmap-card-meta">
                <span className="material-symbols-rounded text-[14px] text-gold">bookmark</span>
                {s.meta}
              </div>
              {i < STEPS.length - 1 && (
                <div className="roadmap-connector" aria-hidden="true">
                  <span className="material-symbols-rounded">arrow_forward</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LearningRoadmap;
