'use client';
import { useState, useEffect } from 'react';

const suspects = [];

const getBarColor = (score) => {
  if (score >= 85) return '#ff2d55';
  if (score >= 55) return '#f5c800';
  return '#f5c800';
};

const getStatusStyle = (type) => {
  if (type === 'danger') return { color: '#ff2d55', bg: 'rgba(255,45,85,0.08)', border: 'rgba(255,45,85,0.25)' };
  if (type === 'warn') return { color: '#f5c800', bg: 'rgba(245,200,0,0.08)', border: 'rgba(245,200,0,0.25)' };
  return { color: '#f5c800', bg: 'rgba(245,200,0,0.08)', border: 'rgba(245,200,0,0.25)' };
};

export default function ResultsPage() {
  const [expanded, setExpanded] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="page-container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>

      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <div
          style={{
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '10px',
            color: 'rgba(245,200,0,0.4)',
            letterSpacing: '0.2em',
            marginBottom: '12px',
          }}
        >
          
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <h1
            className="font-orbitron"
            style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 900, margin: 0, color: '#f0f0f0' }}
          >
            🦄 suspects{' '}
              
          </h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span className="badge badge-danger">3 SUSPECTS</span>
            <span className="badge badge-active">ANALYSIS COMPLETE</span>
          </div>
        </div>
        <p
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '16px',
            color: '#ffffff',
            marginTop: '8px',
            maxWidth: '560px',
            lineHeight: 1.6,
          }}
        >
          The unicorn has found the suspect.
        </p>
      </div>

      {/* Summary bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1px',
          background: 'rgba(245,200,0,0.06)',
          border: '1px solid rgba(245,200,0,0.08)',
          marginBottom: '36px',
        }}
      >
        {[
          { label: 'PRIMARY SUSPECT', value: 'SUSPECT_004', color: '#ff2d55' },
          { label: 'FINGERPRINT MATCH', value: '94.2%', color: '#ff2d55' },
          { label: 'DNA CONFIDENCE', value: '97.8%', color: '#ff2d55' },
          { label: 'OVERALL SCORE', value: '96.3%', color: '#ff2d55' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: 'var(--bg-card)',
              padding: '20px 18px',
            }}
          >
            <div
              style={{
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: '20px',
                color: s.color,
                marginBottom: '4px',
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '8px',
                letterSpacing: '0.12em',
                color: '#555555',
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Suspect cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {suspects.map((s, idx) => {
          const style = getStatusStyle(s.statusType);
          const isOpen = expanded === idx;

          return (
            <div
              key={s.id}
              className="card-neon"
              style={{
                overflow: 'hidden',
                cursor: 'pointer',
                borderColor: isOpen ? style.border : 'rgba(245,200,0,0.08)',
                transition: 'all 0.3s ease',
              }}
              onClick={() => setExpanded(isOpen ? null : idx)}
            >
              {/* Card header */}
              <div
                style={{
                  padding: '20px 24px',
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr auto',
                  gap: '20px',
                  alignItems: 'center',
                }}
              >
                {/* Rank */}
                <div
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontSize: '22px',
                    fontWeight: 900,
                    color: idx === 0 ? '#ff2d55' : idx === 1 ? '#f5c800' : '#f5c800',
                    lineHeight: 1,
                  }}
                >
                  #{s.rank}
                </div>

                {/* Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#f0f0f0',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {s.id}
                    </span>
                    <span
                      style={{
                        fontFamily: 'Rajdhani, sans-serif',
                        fontSize: '13px',
                        color: '#555555',
                      }}
                    >
                      {s.name}
                    </span>
                    <span
                      style={{
                        background: style.bg,
                        border: `1px solid ${style.border}`,
                        color: style.color,
                        fontFamily: 'Share Tech Mono, monospace',
                        fontSize: '9px',
                        letterSpacing: '0.1em',
                        padding: '2px 8px',
                      }}
                    >
                      {s.status}
                    </span>
                  </div>

                  {/* Score bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '420px' }}>
                    {[
                      { label: 'FINGERPRINT', score: s.fingerprintScore },
                      { label: 'DNA', score: s.dnaScore },
                      { label: 'OVERALL', score: s.overallScore },
                    ].map((m) => (
                      <div key={m.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span
                          style={{
                            fontFamily: 'Share Tech Mono, monospace',
                            fontSize: '8px',
                            color: 'rgba(245,200,0,0.35)',
                            letterSpacing: '0.1em',
                            width: '72px',
                            flexShrink: 0,
                          }}
                        >
                          {m.label}
                        </span>
                        <div className="confidence-bar" style={{ flex: 1 }}>
                          <div
                            className="confidence-bar-fill"
                            style={{
                              '--target-width': `${m.score}%`,
                              width: mounted ? `${m.score}%` : '0%',
                              background: getBarColor(m.score),
                              transition: 'width 1.2s ease',
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: 'Share Tech Mono, monospace',
                            fontSize: '10px',
                            color: getBarColor(m.score),
                            width: '38px',
                            textAlign: 'right',
                            flexShrink: 0,
                          }}
                        >
                          {m.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chevron */}
                <div
                  style={{
                    fontFamily: 'Share Tech Mono, monospace',
                    fontSize: '14px',
                    color: 'rgba(245,200,0,0.4)',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s',
                  }}
                >
                  ▾
                </div>
              </div>

              {/* Expanded details */}
              {isOpen && (
                <div
                  style={{
                    borderTop: `1px solid ${style.border}`,
                    padding: '20px 24px',
                    background: `${style.bg}`,
                    animation: 'fadeIn 0.3s ease',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Orbitron, sans-serif',
                      fontSize: '9px',
                      letterSpacing: '0.15em',
                      color: style.color,
                      marginBottom: '12px',
                    }}
                  >
                    FORENSIC ANALYSIS REPORT
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                    {s.details.map((d, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          gap: '10px',
                          fontFamily: 'Rajdhani, sans-serif',
                          fontSize: '14px',
                          color: '#888888',
                          lineHeight: 1.5,
                        }}
                      >
                        <span style={{ color: style.color, flexShrink: 0 }}>›</span>
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {s.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontFamily: 'Share Tech Mono, monospace',
                          fontSize: '8px',
                          letterSpacing: '0.1em',
                          padding: '3px 8px',
                          background: 'rgba(245,200,0,0.04)',
                          border: '1px solid rgba(245,200,0,0.12)',
                          color: 'rgba(245,200,0,0.4)',
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      
    </div>
  );
}