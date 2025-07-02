import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ISong extends Document {
  song_genre: string;
  artist_name: string;
  song_name: string;
}

const SongSchema = new Schema<ISong>({
  song_genre: { type: String, required: true },
  artist_name: { type: String, required: true },
  song_name: { type: String, required: true },
});

export const Song = models.Song || model<ISong>('Song', SongSchema);
