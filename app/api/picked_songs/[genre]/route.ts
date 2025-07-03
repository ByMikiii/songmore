import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';


interface Params {
  params: {
    genre: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  const now = Math.floor(Date.now() / 1000);
  const genre = (await params).genre

  const { connection } = await connectToDatabase();

  const rawSong = await connection.db
    .collection('picked_songs')
    .findOne({
      song_genre: genre,
      valid_from: { $lte: now.toString() },
      valid_to: { $gte: now.toString() },
    });


  return NextResponse.json(rawSong || {});
}
