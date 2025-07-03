import random
import os
from datetime import datetime, time
import glob
import pymongo
import yt_dlp
from pydub import AudioSegment
from pydub.silence import detect_nonsilent
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from dotenv import load_dotenv

load_dotenv()

playlists = {
    "pop": os.getenv("POP_PLAYLIST"),
    "rap": os.getenv("RAP_PLAYLIST"),
    "rock": os.getenv("ROCK_PLAYLIST"),
}
myclient = pymongo.MongoClient(
    os.getenv("DB_URL"),
    username=os.getenv("DB_USERNAME"),
    password=os.getenv("DB_PASSWORD"),
)
mydb = myclient["songmore"]


def get_song_by_genre(genre):
    client_credentials_manager = SpotifyClientCredentials(
        client_id=os.getenv("SPOTIFY_CLIENT_ID"),
        client_secret=os.getenv("SPOTIFY_CLIENT_SECRET"),
    )
    sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

    results = sp.playlist_items(
        playlist_id=playlists[genre],
        limit=100,
    )
    tracks = results["items"]
    return tracks


def download_song_as_mp3(query):
    if not os.path.exists("temp"):
        os.mkdir("temp")
    for filename in os.listdir("temp"):
        file_path = os.path.join("temp", filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f"Failed to delete {file_path}. Reason: {e}")

    ydl_opts = {
        "format": "bestaudio/best",
        "noplaylist": True,
        "default_search": "ytsearch",
        "outtmpl": os.path.join("temp", "%(title)s.%(ext)s"),
        "source_address": "0.0.0.0",
        "user_agent": "Mozilla/5.0",
        "quiet": False,
        "no_warnings": True,
        "ignoreerrors": True,
        "extractor_args": {"youtube": ["player_client=web"]},
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }
        ],
    }

    search_term = f"ytsearch1:{query}"
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([search_term])

    mp3_files = glob.glob(os.path.join("temp", "*.mp3"))
    if not mp3_files:
        return None
    return os.path.basename(sorted(mp3_files)[0])


def auto_trim_silence(input_path, output_path, silence_thresh=-40, min_silence_len=500):
    print(f"Loading audio from: {input_path}")
    audio = AudioSegment.from_mp3(input_path)
    print(f"Audio duration: {len(audio) / 1000:.2f}s")

    print("Detecting nonsilent parts...")
    nonsilent_ranges = detect_nonsilent(
        audio, min_silence_len=min_silence_len, silence_thresh=silence_thresh
    )

    if not nonsilent_ranges:
        print("No nonsilent parts detected")
        return

    print(f"Found {len(nonsilent_ranges)} nonsilent segment")
    start_trim = nonsilent_ranges[0][0]
    print(f"Trimming from {start_trim / 1000:.2f}s")

    trimmed_audio = audio[start_trim:]

    print(f"Exporting trimmed audio to: {output_path}")
    trimmed_audio.export(output_path, format="mp3")
    print("trim done")
    files = glob.glob(os.path.join("temp", "*"))
    for file in files:
        os.remove(file)
    print("temp deleted")


def select_todays_songs(genre, current_hour):
    picked_songs = []
    tracks = get_song_by_genre(genre)
    current_track = {"track_name": "", "track_artist": ""}
    for hour in range(24):
        while True:
            random_item = random.choice(tracks)
            track = random_item["track"]
            track_name = track["name"]
            track_artist = track["artists"][0]["name"]
            if track_name not in picked_songs:
                picked_songs.append(track_name)
                break
        if hour == current_hour:
            current_track["track_name"] = track_name
            current_track["track_artist"] = track_artist
        mycol = mydb["picked_songs"]
        today = datetime.today().date()
        timedate = datetime.combine(today, time(hour=hour, minute=0))
        timestamp = int(timedate.timestamp())
        mydict = {
            "song_genre": f"{genre}",
            "artist_name": f"{track_artist}",
            "song_name": f"{track_name}",
            "valid_from": f"{timestamp}",
            "valid_to": f"{timestamp+60*60}",
        }
        mycol.insert_one(mydict)
        print(f"new song inserted {hour+1}/24")
    return current_track


def fill_db():
    for genre, playlist in playlists.items():
        if playlist:
            tracks = get_song_by_genre(genre)

            for track in tracks:
                track_name = track["track"]["name"]
                artist_name = track["track"]["artists"][0]["name"]
                print(f"{genre} {artist_name} - {track_name}")
                mycol = mydb["songs"]
                mydict = {
                    "song_genre": f"{genre}",
                    "artist_name": f"{artist_name}",
                    "song_name": f"{track_name}",
                }
                existing = mycol.find_one(mydict)

                if not existing:
                    mycol.insert_one(mydict)
            print(len(tracks))
        else:
            print("playlist not found")


def download_song(genre, track_artist, track_name):
    filename = download_song_as_mp3(f"{track_artist} - {track_name} official audio")

    if not os.path.exists(f"../public/{genre}"):
        os.mkdir(f"../public/{genre}")
    auto_trim_silence(f"temp/{filename}", f"../public/{genre}/song.mp3")


def drop_db():
    collection = mydb["picked_songs"]
    collection.delete_many({})


def __main():
    now = datetime.now()
    print(f"start at: {now.hour}:{now.minute}:{now.second}")

    drop_db()

    for genre, playlist in playlists.items():
        if playlist:
            print(f"Creating todays list for genre '{genre}'")
            first_track = select_todays_songs(genre, now.hour)
            download_song(genre, first_track["track_artist"], first_track["track_name"])
    print("All songs for today inserted")

    while True:
        now = datetime.now()
        if (
            now.hour == 23
            and now.minute == 59
            and now.second == 40
            and now.microsecond == 0
        ):
            for genre, playlist in playlists.items():
                if playlist:
                    no_error = False
                    while no_error == False:
                        print(f"Creating todays list for genre '{genre}'")
                        first_track = select_todays_songs(genre, 0)
                        download_song(
                            genre,
                            first_track["track_artist"],
                            first_track["track_name"],
                        )
                        no_error = True
            print("All songs for today inserted")

        elif (
            now.hour > 0
            and now.minute == 0
            and now.second == 0
            and now.microsecond == 0
        ):
            for genre, playlist in playlists.items():
                if playlist:
                    print(f"{now.hour}:{now.minute} downloading genre '{genre}'")

                    mycol = mydb["picked_songs"]

                    current_hour = now.replace(minute=0, second=0, microsecond=0)
                    current_ts = int(current_hour.timestamp())
                    print(str(current_ts))
                    doc = mycol.find_one(
                        {"song_genre": genre, "valid_from": str(current_ts)}
                    )
                    print(f"{doc} found")
                    no_error = False
                    while no_error == False:
                        download_song(genre, doc["artist_name"], doc["song_name"])
                        no_error = True


fill_db()
__main()
