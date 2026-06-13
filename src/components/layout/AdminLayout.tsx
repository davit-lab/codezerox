import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";

const menuItems = [
  { path: "/admin", icon: "dashboard", label: "დეშბორდი" },
  { path: "/admin/books", icon: "menu_book", label: "წიგნები" },
  { path: "/admin/categories", icon: "category", label: "კატეგორიები" },
  { path: "/admin/users", icon: "group", label: "მომხმარებლები" },
  { path: "/admin/chats", icon: "chat", label: "ჩატები" },
  { path: "/admin/promo-codes", icon: "loyalty", label: "პრომო კოდები" },
  { path: "/admin/vacancies", icon: "work", label: "ვაკანსიები" },
  { path: "/admin/hub-projects", icon: "hub", label: "Hub პროექტები" },
  { path: "/admin/challenges", icon: "emoji_events", label: "ჩელენჯები" },
  { path: "/admin/freelancers", icon: "engineering", label: "ფრილანსერები" },
  { path: "/admin/reviews", icon: "reviews", label: "რევიუები" },
  { path: "/admin/blog", icon: "article", label: "ბლოგი" },
  { path: "/admin/xp", icon: "leaderboard", label: "XP მართვა" },
  { path: "/admin/payments", icon: "account_balance", label: "გადახდები" },
  { path: "/admin/manual-payments", icon: "link", label: "Manual Payment ბმულები" },
  { path: "/admin/exams", icon: "workspace_premium", label: "გამოცდები" },
  { path: "/admin/banners", icon: "image", label: "ბანერები" },
  { path: "/admin/courses", icon: "school", label: "კურსები" },
  { path: "/admin/bundles", icon: "sell", label: "ფასდაკლებები" },
  { path: "/admin/activity", icon: "timeline", label: "აქტივობა" },
  { path: "/admin/kids", icon: "child_care", label: "Kids" },
  { path: "/admin/video-courses", icon: "smart_display", label: "ვიდეო კურსები" },
  { path: "/admin/mentoring", icon: "psychology", label: "მენტორინგი" },
  { path: "/admin/pricing", icon: "payments", label: "ფასები" },
  { path: "/admin/credits", icon: "account_balance_wallet", label: "კრედიტები" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  titleIcon?: string;
  actions?: React.ReactNode;
}

const SidebarContent = ({ location, onNavigate }: { location: ReturnType<typeof useLocation>; onNavigate?: () => void }) => (
  <>
    <div className="admin-sidebar-title">ადმინ პანელი</div>
    <ul className="admin-menu">
      {menuItems.map(item => (
        <li key={item.path}>
          <Link
            to={item.path}
            onClick={onNavigate}
            className={`admin-menu-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="material-symbols-rounded">{item.icon}</span>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  </>
);

const AdminLayout = ({ children, title, titleIcon, actions }: AdminLayoutProps) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Atmosphere />
      <Header />
      <main style={{ paddingTop: isMobile ? '100px' : '140px', paddingBottom: '80px' }}>
        <div className="container">
          {/* Mobile menu button */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="admin-mobile-menu-btn"
            >
              <Menu className="w-5 h-5" />
              <span>მენიუ</span>
            </button>
          )}

          {/* Mobile sidebar sheet */}
          {isMobile && (
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetContent side="left" className="admin-mobile-sidebar p-0 w-[280px]">
                <SheetTitle className="sr-only">ადმინ მენიუ</SheetTitle>
                <div className="p-4 overflow-y-auto h-full">
                  <SidebarContent location={location} onNavigate={() => setSidebarOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          )}

          <div className="admin-layout">
            {/* Desktop sidebar */}
            {!isMobile && (
              <aside className="admin-sidebar">
                <SidebarContent location={location} />
              </aside>
            )}

            <div className="admin-content">
              {title && (
                <div className="admin-page-header">
                  <h2 className="admin-page-title">
                    {titleIcon && <span className="material-symbols-rounded">{titleIcon}</span>}
                    {title}
                  </h2>
                  {actions && <div className="admin-page-actions">{actions}</div>}
                </div>
              )}
              {children}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminLayout;
