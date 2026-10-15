'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout, isLoggedIn, getUser } from '../lib/auth';
import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { href: '/dashboard', label: '📊 Dashboard' },
  { href: '/draft-11', label: '🎲 11-0 Dice Draft' },
  { href: '/hall-of-fame', label: '🏆 EA FC & World Cup' },
  { href: '/cric-select', label: '🎯 CRIC-SELECT' },
  { href: '/matchup', label: '🤖 Match-Up AI' },
  { href: '/team-builder', label: '👥 Final 11 AI' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState('');

  useEffect(() => {
    setUser(getUser());
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <nav
      style={{
        background: 'rgba(10,14,26,0.72)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, gap: 16 }}>
        <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span className="font-serif" style={{ fontSize: 24, color: '#fff' }}>
            Cricket<em style={{ color: '#8892a4' }}>IQ</em>
          </span>
          <span className="pill-live" style={{ padding: '3px 9px' }}><span className="dot" />Live</span>
        </Link>

        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={`nav-link${pathname === link.href ? ' active' : ''}`}>
              {link.label.replace(/^[^A-Za-z0-9]+\s*/, '')}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && <span className="mono-label" style={{ color: '#8892a4' }}>@{user}</span>}
          <button onClick={handleLogout} className="btn-solid" style={{ padding: '7px 14px' }}>Logout ↗</button>
        </div>
      </div>
    </nav>
  );
}
