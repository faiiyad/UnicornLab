'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const modules = [
  {
    href: '/fingerprint',
    icon: '◈',
    label: 'Fingerprint Analysis',
    desc: 'Upload crime scene BMP fingerprint evidence and match against the suspect database using ridge-pattern analysis.',
    tag: 'MODULE_01',
    status: 'READY',
    statusType: 'active',
    accent: '#f5c800',
  },
  {
    href: '/dna',
    icon: '◉',
    label: 'DNA Sequencing',
    desc: 'Upload FASTA DNA evidence files and compare genetic sequences against all registered suspects.',
    tag: 'MODULE_02',
    status: 'READY',
    statusType: 'active',
    accent: '#f5c800',
  },
  {
    href: '/results',
    icon: '◎',
    label: 'Suspect Results',
    desc: 'View ranked suspect list with confidence scores, forensic reasoning, and detailed analysis report.',
    tag: 'MODULE_03',
    status: 'AWAITING',
    statusType: 'warn',
    accent: '#f5c800',
  },
];

const stats = [
  { label: 'Suspects Processed', value: '—' },
  { label: 'Evidence Files', value: '—' },
  { label: 'Confidence Threshold', value: '85%' },
  { label: 'System Status', value: 'NOMINAL' },
];

export default function HomePage() {
  const [tick, setTick] = useState(0);
  const [bootLines, setBootLines] = useState([]);

  const termLines = [
    '> INITIALIZING UNICORN FORENSIC ENGINE v2.4.1...',
    '> LOADING FINGERPRINT MATCHER MODULE.......... OK',
    '> LOADING DNA SEQUENCER MODULE............... OK',
    '> CONNECTING TO SUSPECT DATABASE............. OK',
    '> ALL SYSTEMS NOMINAL. AWAITING EVIDENCE INPUT.',
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < termLines.length) {
        setBootLines((prev) => [...prev, termLines[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 420);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="page-container" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
      {/* Ambient glow blobs */}
      <div
        className="hex-bg"
        style={{ top: '10%', right: '-5%', width: '500px', height: '500px' }}
      />
      <div
        className="hex-bg"
        style={{
          bottom: '5%',
          left: '-5%',
          width: '400px',
          height: '400px',
        }}
      />

      {/* Hero */}
      <div
        style={{
          paddingTop: '10px',
          paddingBottom: '40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div
          style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '11px',
            color: 'rgba(245,200,0,0.5)',
            letterSpacing: '0.2em',
          }}
          className="animate-fadeIn"
        >
          
        </div>

        <h1
          className="font-orbitron animate-fadeInUp"
          style={{
            fontSize: 'clamp(36px, 6vw, 72px)',
            fontWeight: 900,
            lineHeight: 1.05,
            margin: 0,
            color: '#f0f0f0',
          }}
        >
          {' '}
          <span style={{ color: '#e66386' }}>
          Unicorn
          </span>
          <br />
          Labs
        </h1>

        <p
          className="animate-fadeInUp font-rajdhani"
          style={{
            fontSize: '18px',
            color: '#ffffff',
            maxWidth: '560px',
            lineHeight: 1.6,
            animationDelay: '0.15s',
            opacity: 0,
            animationFillMode: 'forwards',
          }}
        >
          Submit crime scene data to find the real killer. Powered by Unicorns 🦄
        </p>

        <div
          style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}
          className="animate-fadeInUp"
        >
          <Link href="/fingerprint" style={{ textDecoration: 'none' }}>
            <button className="btn-primary">
              ◈ Upload Evidence
            </button>
          </Link>
        </div>
      </div>

      <hr className="divider-line" />

      {/* Boot terminal */}
      <div
        style={{
          margin: '40px 0',
          padding: '20px 24px',
          background: 'rgba(0,5,3,0.8)',
          border: '1px solid rgba(245,200,0,0.1)',
          fontFamily: 'Share Tech Mono, monospace',
          fontSize: '11px',
          color: 'rgba(245,200,0,0.6)',
          lineHeight: 2,
          letterSpacing: '0.05em',
          minHeight: '130px',
        }}
      >
        {bootLines.map((line, i) => (
          <div key={i} style={{ animation: 'fadeIn 0.3s ease' }}>
            {line}
          </div>
        ))}
        {bootLines.length < termLines.length && (
          <span className="animate-blink" style={{ color: '#f5c800' }}>
            █
          </span>
        )}
      </div>

      
    </div>
  );
}