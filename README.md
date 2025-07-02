# Songmore
A fun web application inspired by  [Songless](https://lessgames.com/songless), where players try to guess songs from short audio clips.

## Features
You can simply choose a music genre and then guess the current song. There is a new song available for each genre every 1 hour. You also have to set playlist_id for each genre.

## Tech stack

- **Frontend:** Next.js (React + TypeScript)
- **Backend:** Next.js API + MongoDB
- **Scripts:** Python script using `spotify-api` and `yt-dlp` for downloading songs and updating database.

## Getting Started
1. Clone repo
2. Set up .env files
    - /.env
    - /scripts/.env
3. Run the app
    ```bash
    npm install
    npm run dev

## Disclaimer
This app was created purely for fun and educational purposes only. App also does not hold any license for the music.
