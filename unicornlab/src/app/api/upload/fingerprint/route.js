import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { NextResponse } from 'next/server';


export async function POST(request) {
  const formData = await request.formData();
  console.log("recieved")
  const type = formData.get('type'); // 'crime' or 'suspect'
  const files = formData.getAll('files');

  const targetDir = type === 'crime'
    ? join(process.cwd(),'..', 'uploads', 'fingerprints')
    : join(process.cwd(),'..', 'Suspect_Fingerprints');

  await mkdir(targetDir, { recursive: true });

  const saved = [];
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(targetDir, file.name);
    await writeFile(filePath, buffer);
    saved.push(file.name);
  }

  return NextResponse.json({ success: true, saved });
}