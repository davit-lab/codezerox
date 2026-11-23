import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { Menu } from "lucide-react";
import logoImg from "@/assets/logo.png";

type MenuItem = { path: string; icon: string; label: string };

const menuGroups: { title: string; items: MenuItem[] }[] = [
  {
    title: "მიმოხილვა",
    items: [
      { path: "/admin", icon: "space_dashboard", label: "დეშბორდი" },
      { path: "/admin/activity", icon: "timeline", label: "აქტივობა" },
    ],
  },
  {
    title: "კონტენტი",
    items: [
      { path: "/admin/books", icon: "menu_book", label: "წიგნები" },
      { path: "/admin/categories", icon: "category", label: "კატეგორიები" },
      { path: "/admin/courses", icon: "school", label: "კურსები" },
      { path: "/admin/blog", icon: "article", label: "ბლოგი" },
      { path: "/admin/banners", icon: "image", label: "ბანერები" },
    ],
  },
  {
    title: "მომხმარებლები",
    items: [
      { path: "/admin/users", icon: "group", label: "მომხმარებლები" },
      { path: "/admin/chats", icon: "chat", label: "ჩატები" },
      { path: "/admin/reviews", icon: "reviews", label: "რევიუები" },
      { path: "/admin/xp", icon: "leaderboard", label: "XP მართვა" },
    ],
  },
  {
    title: "ფინანსები",
    items: [
      { path: "/admin/payments", icon: "account_balance", label: "გადახდები" },
      { path: "/admin/manual-payments", icon: "link", label: "Manual Payment ბმულები" },
      { path: "/admin/pricing", icon: "payments", label: "ფასები" },
      { path: "/admin/codelingo", icon: "school", label: "კოდელინგო" },
      { path: "/admin/bundles", icon: "sell", label: "ფასდაკლებები" },
      { path: "/admin/promo-codes", icon: "loyalty", label: "პრომო კოდები" },
      { path: "/admin/credits", icon: "account_balance_wallet", label: "კრედიტები" },
    ],
  },
];

const allItems = menuGroups.flatMap((g) => g.items);

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  titleIcon?: string;
  actions?: React.ReactNode;
}

const Sidebar = ({ pathname, onNavigate, variant }: { pathname: string; onNavigate?: () => void; variant: "desktop" | "drawer" }) => {
  const { profile, user } = useAuth();
  const name = profile?.full_name || profile?.email || user?.email || "";

  return (
    <aside className={`adm-side adm-side--${variant}`}>
      <Link to="/admin" className="adm-side__brand" onClick={onNavigate}>
        <img src={logoImg} alt="" className="w-7 h-7 rounded-md object-contain" />
        Codezero
        <small>Admin</small>
      </Link>

      <nav className="adm-side__nav" aria-label="ადმინ მენიუ">
        {menuGroups.map((group) => (
          <div key={group.title} className="adm-side__group">
            <div className="adm-side__group-title">{group.title}</div>
            {group.items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={`adm-side__link ${pathname === item.path ? "active" : ""}`}
                aria-current={pathname === item.path ? "page" : undefined}
              >
                <span className="material-symbols-rounded">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="adm-side__foot">
        <Link to="/" className="adm-side__link" onClick={onNavigate}>
          <span className="material-symbols-rounded">arrow_back</span>
          საიტზე დაბრუნება
        </Link>
        {name && (
          <div className="adm-side__user">
            <span className="adm-avatar">{name.charAt(0).toUpperCase()}</span>
            <span>{name}</span>
          </div>
        )}
      </div>
    </aside>
  );
};

const AdminLayout = ({ children, title, titleIcon, actions }: AdminLayoutProps) => {
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const current = allItems.find((i) => i.path === pathname);
  const heading = title ?? current?.label;
  const icon = titleIcon ?? current?.icon;

  return (
    <div className="adm">
      <Sidebar pathname={pathname} variant="desktop" />

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="p-0 w-[264px] bg-[#030305] border-r border-white/[0.07]">
          <SheetTitle className="sr-only">ადმინ მენიუ</SheetTitle>
          <Sidebar pathname={pathname} variant="drawer" onNavigate={() => setDrawerOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="adm-main">
        <header className="adm-top">
          <button className="adm-top__menu" onClick={() => setDrawerOpen(true)} aria-label="მენიუს გახსნა">
            <Menu className="w-4 h-4" />
          </button>
          <div>
            <div className="adm-top__crumb">ადმინ პანელი</div>
            {heading && (
              <h1 className="adm-top__title">
                {icon && <span className="material-symbols-rounded">{icon}</span>}
                {heading}
              </h1>
            )}
          </div>
          {actions && <div className="adm-top__actions">{actions}</div>}
        </header>

        <main className="adm-body">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
