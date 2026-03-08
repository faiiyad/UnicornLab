'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/fingerprint', label: 'Fingerprint' },
  { href: '/dna', label: 'DNA Analysis' }
  
];

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(2,5,8,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(245,200,0,0.1)',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{fontSize: '10xl'}}>🦄</span>
          <div>
            <div
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                color: '#e66386',
                letterSpacing: '0.15em',
                lineHeight: 1,
              }}
            >
              UNICORN LABS
            </div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}