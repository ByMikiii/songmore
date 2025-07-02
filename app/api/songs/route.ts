import { connectToDatabase } from '../../../lib/mongodb';
import { Song } from '@/models/Song';
import { NextRequest, NextResponse } from 'next/server';


export async function GET() {
  await connectToDatabase();
  const songs = await Song.find();
  return NextResponse.json(songs);
}
