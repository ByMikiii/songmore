import { Schema, Document, model, models } from 'mongoose';

export interface IPickedSong extends Document {
  song_genre: string;
  artist_name: string;
  song_name: string;
  valid_from: string;
  valid_to: string;
}

const PickedSongSchema = new Schema<IPickedSong>({
  song_genre: { type: String, required: true },
  artist_name: { type: String, required: true },
  song_name: { type: String, required: true },
  valid_from: { type: String, required: true },
  valid_to: { type: String, required: true }
});

export const PickedSong = models.PickedSong || model<IPickedSong>('PickedSong', PickedSongSchema, 'picked_songs');
