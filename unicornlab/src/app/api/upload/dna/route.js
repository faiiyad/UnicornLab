import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const formData = await request.formData();
  const type = formData.get('type'); // 'crime' or 'suspect'
  const files = formData.getAll('files');

  const baseDir = join(process.cwd(), '..', 'uploads', 'dna');
  await mkdir(baseDir, { recursive: true });

  const filename = type === 'crime' ? 'CrimeScene_DNA.fasta' : 'Suspect_DNA.fasta';
  const file = files[0];
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(join(baseDir, filename), buffer);

  return NextResponse.json({ success: true, saved: filename });
}