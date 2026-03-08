'use client';
import { useState, useRef } from 'react';

export default function DNAPage() {
  const [crimeFile, setCrimeFile] = useState(null);
  const [suspectFile, setSuspectFile] = useState(null);
  const [draggingCrime, setDraggingCrime] = useState(false);
  const [draggingSuspect, setDraggingSuspect] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const [logLines, setLogLines] = useState([]);

  const crimeRef = useRef();
  const suspectRef = useRef();

  const handleAnalyze = async () => {
    if (!crimeFile) return;
    setAnalyzing(true);
    setLogLines([]);

    const lines = [
      '> PARSING FASTA FORMAT — CRIME SCENE SEQUENCE...',
      '> IDENTIFYING STR LOCI IN SAMPLE...',
      '> LOADING SUSPECT DNA DATABASE...',
      '> RUNNING SEQUENCE ALIGNMENT (SMITH-WATERMAN)...',
      '> CALCULATING MATCH PROBABILITY SCORES...',
      '> GENERATING FORENSIC ANALYSIS REPORT...',
    ];

    // Show log lines while uploading
    let i = 0;
    const interval = setInterval(() => {
      if (i < lines.length) {
        setLogLines((prev) => [...prev, lines[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 480);

    try {
      const crimeForm = new FormData();
      crimeForm.append('type', 'crime');
      crimeForm.append('files', crimeFile);
      await fetch('/api/upload/dna', { method: 'POST', body: crimeForm });

      if (suspectFile) {
        const suspectForm = new FormData();
        suspectForm.append('type', 'suspect');
        suspectForm.append('files', suspectFile);
        await fetch('/api/upload/dna', { method: 'POST', body: suspectForm });
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }

    setAnalyzing(false);
    setDone(true);
  };

  const UploadCard = ({
    title,
    subtitle,
    filename,
    file,
    setFile,
    dragging,
    setDragging,
    inputRef,
    note,
    noteColor = '#555555',
    borderColor = 'rgba(245,200,0,0.1)',
  }) => (
    <div
      className="card-neon"
      style={{ padding: '28px', borderColor }}
    >
      <div
        style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '9px',
          letterSpacing: '0.15em',
          color: '#e66386',
          marginBottom: '6px',
        }}
      >
        {subtitle}
      </div>
      <h3
        style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '12px',
          color: '#f0f0f0',
          margin: '0 0 18px 0',
        }}
      >
        {filename}
      </h3>

      <div
        className={`upload-zone ${dragging ? 'dragging' : ''}`}
        style={{
          borderRadius: '4px',
          padding: '36px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          textAlign: 'center',
          cursor: 'pointer',
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const f = e.dataTransfer.files[0];
          if (f) setFile(f);
        }}
        onClick={() => inputRef.current.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".fasta,.fa,.FASTA"
          style={{ display: 'none' }}
          onChange={(e) => e.target.files[0] && setFile(e.target.files[0])}
        />

        {file ? (
          <>
            {/* DNA helix icon */}
            <div
              style={{
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: '28px',
                color: '#f5c800',
                lineHeight: 1,
              }}
            >
              ◉
            </div>
            <div
              style={{
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: '11px',
                color: '#f5c800',
                letterSpacing: '0.05em',
              }}
            >
              {file.name}
            </div>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'rgba(245,200,0,0.4)' }}>
              {(file.size / 1024).toFixed(1)} KB // LOADED
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '36px', color: 'rgba(245,200,0,0.15)', lineHeight: 1 }}>⊕</div>
            <div style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '14px', color: '#555555' }}>
              Drag & drop or click to upload
            </div>
            <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '9px', color: 'rgba(245,200,0,0.25)' }}>
              ACCEPTS .FASTA / .FA FILES
            </div>
          </>
        )}
      </div>

      {note && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            background: 'rgba(245,200,0,0.03)',
            border: '1px solid rgba(245,200,0,0.1)',
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '12px',
            color: noteColor,
            lineHeight: 1.5,
          }}
        >
          {note}
        </div>
      )}

      <div className="corner-br" />
    </div>
  );

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
        <h1
          className="font-orbitron"
          style={{ fontSize: 'clamp(24px, 4vw, 44px)', fontWeight: 900, margin: 0, color: '#f0f0f0' }}
        >
          🦄 dna{' '}
            analysis
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
          Upload FASTA DNA information to find the killer
        </p>
      </div>

      {/* Upload cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
          marginBottom: '28px',
        }}
      >
        <UploadCard
          title="Crime Scene DNA"
          subtitle="CRIME SCENE EVIDENCE"
          filename="CrimeScene_DNA.fasta"
          file={crimeFile}
          setFile={setCrimeFile}
          dragging={draggingCrime}
          setDragging={setDraggingCrime}
          inputRef={crimeRef}
        />

        <UploadCard
          title="Suspect DNA"
          subtitle="SUSPECT SEQUENCES"
          filename="Suspect_DNA.fasta"
          file={suspectFile}
          setFile={setSuspectFile}
          dragging={draggingSuspect}
          setDragging={setDraggingSuspect}
          inputRef={suspectRef}
          noteColor="#777777"
        />
      </div>

      {/* DNA sequence preview */}
      {crimeFile && (
        <div
          style={{
            marginBottom: '28px',
            padding: '20px',
            background: 'rgba(0,5,3,0.8)',
            border: '1px solid rgba(245,200,0,0.1)',
          }}
        >
          <div
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '9px',
              letterSpacing: '0.15em',
              color: 'rgba(245,200,0,0.4)',
              marginBottom: '12px',
            }}
          >
            SEQUENCE PREVIEW // {crimeFile.name}
          </div>
          <div
            style={{
              fontFamily: 'Share Tech Mono, monospace',
              fontSize: '11px',
              color: 'rgba(245,200,0,0.5)',
              lineHeight: 1.8,
              letterSpacing: '0.08em',
              overflowX: 'auto',
            }}
          >
            <span style={{ color: 'rgba(245,200,0,0.3)' }}>{'>crime_scene_sample_001'}</span>
            <br />
            {'ATCGATCGATCG TAGCTAGCTAG CGATCGATCGA TCGTAGCTAG'}
            <br />
            {'CGATCGATCGAT CGTAGCTAGCT AGCGATCGATC GATCGTAGCTA'}
            <br />
            <span className="animate-blink" style={{ color: '#f5c800' }}>█</span>
          </div>
        </div>
      )}

      {/* Run button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <button
          className="btn-primary"
          onClick={handleAnalyze}
          disabled={!crimeFile || analyzing}
          style={{ opacity: crimeFile ? 1 : 0.4, cursor: crimeFile ? 'pointer' : 'not-allowed' }}
        >
          {analyzing ? '◌ SEQUENCING...' : '◉ RUN DNA ANALYSIS'}
        </button>
        {done && (
          <div style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: '10px', color: '#f5c800', letterSpacing: '0.1em' }}>
             <a href="/results" style={{ color: '#f5c800' }}>🦄 Proceed to results.</a>
          </div>
        )}
      </div>

      {/* Log output */}
      {logLines.length > 0 && (
        <div
          style={{
            padding: '20px 24px',
            background: 'rgba(0,5,3,0.8)',
            border: '1px solid rgba(245,200,0,0.12)',
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: '11px',
            color: 'rgba(245,200,0,0.6)',
            lineHeight: 2.2,
          }}
        >
          {logLines.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
          {analyzing && (
            <span className="animate-blink" style={{ color: '#f5c800' }}>█</span>
          )}
          {done && (
            <div style={{ color: '#f5c800', marginTop: '4px' }}>
              {'> ANALYSIS COMPLETE. RESULTS READY FOR REVIEW.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}