'use client';
import { useState, useRef } from 'react';

export default function FingerprintPage() {
  const [crimeFile, setCrimeFile] = useState(null);
  const [suspectFiles, setSuspectFiles] = useState([]);
  const [draggingCrime, setDraggingCrime] = useState(false);
  const [draggingSuspect, setDraggingSuspect] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);

  const crimeRef = useRef();
  const suspectRef = useRef();

  const handleCrimeDrop = (e) => {
    e.preventDefault();
    setDraggingCrime(false);
    const file = e.dataTransfer.files[0];
    if (file) setCrimeFile(file);
  };

  const handleSuspectDrop = (e) => {
    e.preventDefault();
    setDraggingSuspect(false);
    const files = Array.from(e.dataTransfer.files);
    setSuspectFiles((prev) => [...prev, ...files]);
  };

  const handleAnalyze = async () => {
    if (!crimeFile) return;
    setAnalyzing(true);
    try {
      const crimeForm = new FormData();
      crimeForm.append('type', 'crime');
      crimeForm.append('files', crimeFile);
      await fetch('/api/upload/fingerprint', { method: 'POST', body: crimeForm });

      if (suspectFiles.length > 0) {
        const suspectForm = new FormData();
        suspectForm.append('type', 'suspect');
        suspectFiles.forEach((f) => suspectForm.append('files', f));
        await fetch('/api/upload/fingerprint', { method: 'POST', body: suspectForm });
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setAnalyzing(false);
    setDone(true);
  };

  const removeFile = (i) => setSuspectFiles((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className="page-container" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
      {/* Ambient */}

      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1
          className="font-orbitron"
          style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 900, margin: 0, color: '#f0f0f0' }}
        >
          🦄 fingerprint{' '}
            scanner
          
        </h1>
        <p
          style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '16px',
            color: '#ffffff',
            marginTop: '8px',
            maxWidth: '520px',
            lineHeight: 1.6,
          }}
        >
          Upload fingerprints and find the killer
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        {/* Crime scene upload */}
        <div className="card-neon" style={{ padding: '28px' }}>
          <div
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '9px',
              letterSpacing: '0.15em',
              color: 'rgba(245,200,0,0.45)',
              marginBottom: '16px',
            }}
          >
            CRIME SCENE EVIDENCE
          </div>
          <h3
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '12px',
              color: '#f0f0f0',
              margin: '0 0 16px 0',
            }}
          >
            CrimeScene_Fingerprint.BMP
          </h3>

          <div
            className={`upload-zone ${draggingCrime ? 'dragging' : ''}`}
            style={{
              borderRadius: '4px',
              padding: '40px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              textAlign: 'center',
            }}
            onDragOver={(e) => { e.preventDefault(); setDraggingCrime(true); }}
            onDragLeave={() => setDraggingCrime(false)}
            onDrop={handleCrimeDrop}
            onClick={() => crimeRef.current.click()}
          >
            <input
              ref={crimeRef}
              type="file"
              accept=".bmp,.BMP"
              style={{ display: 'none' }}
              onChange={(e) => setCrimeFile(e.target.files[0])}
            />
            {crimeFile ? (
              <>
                <div
                  style={{
                    fontFamily: 'Share Tech Mono, monospace',
                    fontSize: '11px',
                    color: '#f5c800',
                    letterSpacing: '0.05em',
                  }}
                >
                  {crimeFile.name}
                </div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'rgba(245,200,0,0.4)' }}>
                  {(crimeFile.size / 1024).toFixed(1)} KB // LOADED
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '40px', color: 'rgba(245,200,0,0.2)' }}>⊕</div>
                <div
                  style={{
                    fontFamily: 'Rajdhani, sans-serif',
                    fontSize: '14px',
                    color: '#555555',
                  }}
                >
                  Drag & drop or click to upload
                </div>
                <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'rgba(245,200,0,0.25)' }}>
                  ACCEPTS .BMP FILES
                </div>
              </>
            )}
          </div>
          <div className="corner-br" />
        </div>

        {/* Suspect fingerprints */}
        <div className="card-neon" style={{ padding: '28px' }}>
          <div
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '9px',
              letterSpacing: '0.15em',
              color: 'rgba(245,200,0,0.45)',
              marginBottom: '16px',
            }}
          >
            SUSPECT DATABASE
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            <h3
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '12px',
                color: '#f0f0f0',
                margin: 0,
              }}
            >
              Suspect_Fingerprints/
            </h3>
            <span
              style={{
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: '10px',
                color: '#f5c800',
                background: 'rgba(245,200,0,0.08)',
                border: '1px solid rgba(245,200,0,0.2)',
                padding: '2px 8px',
              }}
            >
              {suspectFiles.length} FILES
            </span>
          </div>

          <div
            className={`upload-zone ${draggingSuspect ? 'dragging' : ''}`}
            style={{
              borderRadius: '4px',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              textAlign: 'center',
              marginBottom: '12px',
            }}
            onDragOver={(e) => { e.preventDefault(); setDraggingSuspect(true); }}
            onDragLeave={() => setDraggingSuspect(false)}
            onDrop={handleSuspectDrop}
            onClick={() => suspectRef.current.click()}
          >
            <input
              ref={suspectRef}
              type="file"
              accept=".bmp,.BMP"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => setSuspectFiles((prev) => [...prev, ...Array.from(e.target.files)])}
            />
            <div style={{ fontSize: '28px', color: 'rgba(245,200,0,0.2)' }}>⊕</div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '13px', color: '#555555' }}>
              Add suspect fingerprint BMP files
            </div>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'rgba(245,200,0,0.25)' }}>
              MULTIPLE FILES ACCEPTED
            </div>
          </div>

          {/* File list */}
          {suspectFiles.length > 0 && (
            <div
              style={{
                maxHeight: '140px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              {suspectFiles.map((f, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 10px',
                    background: 'rgba(245,200,0,0.04)',
                    border: '1px solid rgba(245,200,0,0.08)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Share Tech Mono, monospace',
                      fontSize: '10px',
                      color: 'rgba(245,200,0,0.6)',
                    }}
                  >
                    {f.name}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e66386',
                      cursor: 'pointer',
                      fontSize: '14px',
                      lineHeight: 1,
                      padding: '0 4px',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="corner-br" />
        </div>
      </div>

      
      {/* Analyze button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          className="btn-primary"
          onClick={handleAnalyze}
          disabled={!crimeFile || analyzing}
          style={{
            opacity: crimeFile ? 1 : 0.4,
            cursor: crimeFile ? 'pointer' : 'not-allowed',
            fontSize: '11px',
          }}
        >
          {analyzing ? '◌ PROCESSING...' : '🦄 RUN FINGERPRINT ANALYSIS'}
        </button>
        {done && (
          <div
            style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '10px',
              color: '#e66386',
              letterSpacing: '0.1em',
            }}
          >
            <a href="/dna" style={{ color: '#e66386' }}>🦄 Proceed to dna analysis.</a>
          </div>
        )}
      </div>

      {/* Processing animation */}
      {analyzing && (
        <div
          style={{
            marginTop: '32px',
            padding: '24px',
            background: 'rgba(0,5,3,0.8)',
            border: '1px solid rgba(245,200,0,0.15)',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '11px',
            color: 'rgba(245,200,0,0.6)',
            lineHeight: 2.2,
          }}
        >
          <div>{'> EXTRACTING RIDGE PATTERNS FROM CRIME SCENE SAMPLE...'}</div>
          <div>{'> NORMALIZING IMAGE RESOLUTION AND ORIENTATION...'}</div>
          <div>{'> COMPARING AGAINST SUSPECT DATABASE...'}</div>
          <span className="animate-blink" style={{ color: '#f5c800' }}>█</span>
        </div>
      )}
    </div>
  );
}