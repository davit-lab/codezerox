import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useSiteCreditsBalance } from "@/hooks/useSiteCredits";
import Logo from "./Logo";
import NotificationBell from "@/components/notifications/NotificationBell";


const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  const cartItemCount = useCart((state) => state.getItemCount());
  const { data: walletBalance = 0 } = useSiteCreditsBalance();


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <nav className="navbar">
            <Logo />

            {/* Desktop Nav Menu */}
            <ul className="nav-menu desktop-only">
              <li>
                <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                  <span className="material-symbols-rounded">home</span>
                  მთავარი
                </Link>
              </li>
              
              {/* სწავლა dropdown */}
              <li className="nav-dropdown-wrapper">
                <button className="nav-link nav-dropdown-trigger">
                  <span className="material-symbols-rounded">school</span>
                  სწავლა
                  <span className="material-symbols-rounded nav-chevron">expand_more</span>
                </button>
                <div className="nav-dropdown-menu">
                  <Link to="/books" className={`nav-dropdown-item ${isActive('/books') ? 'active' : ''}`}>
                    <span className="material-symbols-rounded">menu_book</span>
                    წიგნები
                  </Link>
                  <Link to="/codelingo" className={`nav-dropdown-item ${isActive('/codelingo') ? 'active' : ''}`}>
                    <span className="material-symbols-rounded">school</span>
                    კოდელინგო
                  </Link>
                  <Link to="/playground" className={`nav-dropdown-item ${isActive('/playground') ? 'active' : ''}`}>
                    <span className="material-symbols-rounded">code_blocks</span>
                    კოდის ედიტორი
                  </Link>
                </div>
              </li>

              {/* საზოგადოება dropdown */}
              <li className="nav-dropdown-wrapper">
                <button className="nav-link nav-dropdown-trigger">
                  <span className="material-symbols-rounded">groups</span>
                  საზოგადოება
                  <span className="material-symbols-rounded nav-chevron">expand_more</span>
                </button>
                <div className="nav-dropdown-menu">
                  <Link to="/gallery" className={`nav-dropdown-item ${isActive('/gallery') ? 'active' : ''}`}>
                    <span className="material-symbols-rounded">public</span>
                    გალერეა
                  </Link>
                  <Link to="/blog" className={`nav-dropdown-item ${isActive('/blog') || location.pathname.startsWith('/blog/') ? 'active' : ''}`}>
                    <span className="material-symbols-rounded">article</span>
                    ბლოგი
                  </Link>
                </div>
              </li>
            </ul>

            <div className="header-actions">
              {/* Cart */}
              <Link to="/cart" className="icon-btn" title="კალათა" style={{ position: 'relative' }}>
                <span className="material-symbols-rounded">shopping_cart</span>
                {cartItemCount > 0 && <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--gold)',
                  color: 'var(--bg-void)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                    {cartItemCount}
                  </span>
                }
              </Link>

              {user ?
              <>
                  {/* Temporarily disabled credit balance display
                  <Link to="/profile" className="desktop-only" title="საიტის კრედიტი" style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      padding: '6px 11px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--text-primary)', textDecoration: 'none',
                    }}>
                      <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>account_balance_wallet</span>
                      {walletBalance.toFixed(2)} ₾
                    </Link>
                  */}
                  <NotificationBell />

                  <Link to="/my-books" className="desktop-only" title="ჩემი წიგნები" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 600,
                    background: 'rgba(147,51,234,1)', border: '1px solid rgba(147,51,234,1)',
                    color: 'white', textDecoration: 'none', transition: 'all 0.2s',
                    letterSpacing: '0.01em',
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>auto_stories</span>
                    ჩემი წიგნები
                  </Link>
                  
                  <Link to="/profile" className="icon-btn desktop-only" title="პროფილი">
                    {profile?.avatar_url ?
                  <img src={profile.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> :

                  <span className="material-symbols-rounded">person</span>
                  }
                  </Link>

                  {isAdmin &&
                <Link to="/admin" className="btn btn-gold desktop-only">
                      <span className="material-symbols-rounded">admin_panel_settings</span>
                      ადმინი
                    </Link>
                }
                </> :

              <Link to="/auth" className="btn btn-gold desktop-only">
                  <span className="material-symbols-rounded">login</span>
                  შესვლა
                </Link>
              }

              {/* Mobile Menu Button */}
              <button
                className="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="მენიუ">
                
                <span className="material-symbols-rounded">
                  {mobileMenuOpen ? 'close' : 'menu'}
                </span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={() => setMobileMenuOpen(false)} />
      
      {/* Mobile Menu Panel */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          {/* Mobile Nav Links */}
          <nav className="mobile-nav">
            <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}>
              <span className="material-symbols-rounded">home</span>
              მთავარი
            </Link>
            <Link to="/books" className={`mobile-nav-link ${isActive('/books') ? 'active' : ''}`}>
              <span className="material-symbols-rounded">menu_book</span>
              წიგნები
            </Link>
            <Link to="/codelingo" className={`mobile-nav-link ${isActive('/codelingo') ? 'active' : ''}`}>
              <span className="material-symbols-rounded">school</span>
              კოდელინგო
            </Link>
            <Link to="/playground" className={`mobile-nav-link ${isActive('/playground') ? 'active' : ''}`}>
              <span className="material-symbols-rounded">code_blocks</span>
              კოდის ედიტორი
            </Link>
            <Link to="/gallery" className={`mobile-nav-link ${isActive('/gallery') ? 'active' : ''}`}>
              <span className="material-symbols-rounded">public</span>
              გალერეა
            </Link>
            <Link to="/blog" className={`mobile-nav-link ${isActive('/blog') || location.pathname.startsWith('/blog/') ? 'active' : ''}`}>
              <span className="material-symbols-rounded">article</span>
              ბლოგი
            </Link>
            
            {user &&
            <>
                <div className="mobile-nav-divider" />
                <Link to="/my-books" className={`mobile-nav-link ${isActive('/my-books') ? 'active' : ''}`}>
                  <span className="material-symbols-rounded">library_books</span>
                  ჩემი წიგნები
                </Link>
                <Link to="/profile" className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`}>
                  <span className="material-symbols-rounded">person</span>
                  პროფილი
                </Link>
                <Link to="/profile" className={`mobile-nav-link ${isActive('/profile') ? 'active' : ''}`}>
                  <span className="material-symbols-rounded">account_balance_wallet</span>
                  ბალანსი — {walletBalance.toFixed(2)} ₾
                </Link>
                {isAdmin && (
                  <Link to="/admin" className={`mobile-nav-link ${isActive('/admin') ? 'active' : ''}`}>
                    <span className="material-symbols-rounded">admin_panel_settings</span>
                    ადმინი
                  </Link>
                )}
            </>
            }
          </nav>

          {/* Mobile Auth */}
          <div className="mobile-auth">
            {user ?
            <button onClick={() => {signOut();setMobileMenuOpen(false);}} className="btn btn-ghost" style={{ width: '100%' }}>
                <span className="material-symbols-rounded">logout</span>
                გასვლა
              </button> :

            <Link to="/auth" className="btn btn-gold" style={{ width: '100%' }}>
                <span className="material-symbols-rounded">login</span>
                შესვლა
              </Link>
            }
          </div>
        </div>
      </div>
    </>);

};

export default Header;