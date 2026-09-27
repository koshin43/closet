import { NavLink, Outlet } from 'react-router';
import './theme.css';

const SECTIONS = [
  { to: '/closet', label: 'Closet', icon: 'M12 5a2 2 0 1 1 2 2c-1 0-2 .6-2 1.6V9l8 4.6c1.2.7.7 2.4-.7 2.4H4.7c-1.4 0-1.9-1.7-.7-2.4L12 9' },
  { to: '/wishlist', label: 'Wishlist', icon: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z' },
  { to: '/style', label: 'Style', icon: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6' },
  { to: '/outfits', label: 'Outfits', icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' },
];

export function Shell() {
  return (
    <div className="shell">
      <nav className="sections" aria-label="Sections">
        <span className="brand">Closet</span>
        {SECTIONS.map((section) => (
          <NavLink key={section.to} to={section.to}>
            <svg className="section-icon" viewBox="0 0 24 24" aria-hidden>
              <path d={section.icon} />
            </svg>
            {section.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
