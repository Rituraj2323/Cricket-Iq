'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logout, isLoggedIn, getUser } from '../lib/auth';
import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { href: '/dashboard', label: '📊 Dashboard' },
  { href: '/cric-select', label: '🎯 CRIC-SELECT' },
  { href: '/matchup', label: '🤖 Match-Up AI Chat' },
  { href: '/similar-players', label: '🔍 Similar' },
  { href: '/team-builder', label: '👥 Final 11' },
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
        background: 'rgba(5,11,18,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(27,42,61,0.9)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 60,
        }}
      >
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(0,242,254,0.15)',
              border: '1px solid rgba(0,242,254,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            🏏
          </div>
          <div>
            <span style={{ fontSize: 17, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
              Cricket<span style={{ color: '#00f2fe' }}>IQ</span>
            </span>
            <div
              style={{
                fontSize: 9,
                color: '#22c55e',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginTop: -2,
              }}
            >
              AI Analytics
            </div>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  textDecoration: 'none',
                  padding: '6px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  transition: 'all 0.15s',
                  background: isActive ? 'rgba(0,242,254,0.12)' : 'transparent',
                  color: isActive ? '#00f2fe' : '#94a3b8',
                  border: `1px solid ${isActive ? 'rgba(0,242,254,0.35)' : 'transparent'}`,
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && (
            <div style={{ fontSize: 12, color: '#475569' }}>
              👤 <span style={{ color: '#94a3b8', fontWeight: 600 }}>{user}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
