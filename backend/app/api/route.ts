import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'Electron App Distribution Platform API',
    version: '1.0.0',
    status: 'running',
  });
}
