import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Heart, UserRound, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/artists", label: "Find Artists" },
  { href: "/states", label: "Explore States" },
  { href: "/about", label: "How it works" },
];

const Header = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const artist = user?.role === "artist";

  return <header className="if-header">
    <div className="if-container if-nav">
      <Link to="/" className="if-brand" onClick={() => setOpen(false)}><span className="if-brand-mark">I</span><span>Indi<span>Folks</span></span></Link>
      <nav className="if-nav-links">
        <Link to="/" className={cn(location.pathname === "/" && "active")}>Home</Link>
        {links.map(link => <Link key={link.href} to={link.href} className={cn(location.pathname.startsWith(link.href) && "active")}>{link.label}</Link>)}
        <Link to="/artists" className="if-nav-dropdown">Art forms <ChevronDown size={14}/></Link>
        {artist && <Link to="/artist/dashboard" className={cn(location.pathname.startsWith("/artist/dashboard") && "active")}>Artist Dashboard</Link>}
      </nav>
      <div className="if-nav-actions">
        {!artist && <Link to="/profile" aria-label="Wishlist" className="if-icon-button"><Heart size={19}/></Link>}
        {isAuthenticated ? <>{(user?.role === "customer" || artist) && <Link to="/bookings" className="if-profile-link">My bookings</Link>}<Link to="/profile" className="if-profile-link"><UserRound size={17}/> {artist ? "My Profile" : "Profile"}</Link><button onClick={logout} className="if-outline-button">Logout</button></> : <><Link to="/login" className="if-login">Log in</Link><Link to="/register" className="if-primary-button if-small">Get started</Link></>}
      </div>
      <button className="if-mobile-toggle" onClick={() => setOpen(v => !v)} aria-label="Open menu">{open ? <X/> : <Menu/>}</button>
    </div>
    {open && <div className="if-mobile-menu"><div className="if-container">
      <Link onClick={() => setOpen(false)} to="/">Home</Link>
      {links.map(link => <Link onClick={() => setOpen(false)} key={link.href} to={link.href}>{link.label}</Link>)}
      <Link onClick={() => setOpen(false)} to="/artists">Art forms</Link>
      {artist && <Link onClick={() => setOpen(false)} to="/artist/dashboard">Artist Dashboard</Link>}
      <div className="if-mobile-divider"/>
      {isAuthenticated ? <>
        {(user?.role === "customer" || artist) && <Link onClick={() => setOpen(false)} to="/bookings">My bookings</Link>}
        <Link onClick={() => setOpen(false)} to="/profile">{artist ? "My Profile" : "Profile"}</Link>
        <button onClick={() => { setOpen(false); logout(); }}>Logout</button>
      </> : <>
        <Link onClick={() => setOpen(false)} to="/login">Log in</Link>
        <Link onClick={() => setOpen(false)} to="/register" className="if-primary-button">Get started</Link>
      </>}
    </div></div>}
  </header>;
};
export default Header;
