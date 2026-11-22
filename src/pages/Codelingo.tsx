import { Link } from "react-router-dom";
import SEOHead from "@/components/SEOHead";

/** Codelingo runs as its own page (own styles) and shares the CodeZero login session. */
const Codelingo = () => (
  <>
    <SEOHead path="/codelingo" description="კოდელინგო — ისწავლე HTML, CSS და JavaScript ნაბიჯ-ნაბიჯ, პრაქტიკით და საკუთარი ვებსაიტით." />
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", background: "#09070f" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 14px", borderBottom: "1px solid rgba(155,110,255,.18)" }}>
        <Link to="/" className="btn btn-ghost" style={{ padding: "6px 12px" }}>
          <span className="material-symbols-rounded">arrow_back</span> CodeZero
        </Link>
        <strong style={{ color: "var(--gold)" }}>კოდელინგო</strong>
      </div>
      <iframe title="კოდელინგო" src="/codelingo-app.html" style={{ flex: 1, width: "100%", border: 0 }} />
    </div>
  </>
);
export default Codelingo;
