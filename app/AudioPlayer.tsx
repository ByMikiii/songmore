"use client";
import { useState, useRef, useEffect } from "react";

type Guess = {
  song_name: string;
  artist_name: string;
};

type StateItem = {
  time: number;
  guess: Guess;
};

type AudioPlayerProps = {
  currentState: StateItem;
  genre: string;
  rightGuess: boolean;
};

export default function AudioPlayer({ currentState, genre, rightGuess }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  useEffect(() => {
    const audio = audioRef.current;
    console.log(currentState.time)
    if (!audio) return;
    const handleAudioChange = () => {
      const time = rightGuess ? 300 : currentState.time;
      console.log(time,"xdf")
      if (audio.currentTime >= time) {
        audio.currentTime = 0;
        audio.pause();
      }
    };

    audio.addEventListener("timeupdate", handleAudioChange);

    return () => {
      audio.removeEventListener("timeupdate", handleAudioChange);
    };
  }, [currentState.time, rightGuess]);

  useEffect(() => {
    console.log("novy", rightGuess)
    if(rightGuess){
      audioRef.current?.play();
    }
  }, [rightGuess])

  useEffect(() => {
    audioRef.current?.load();
  }, [genre])



  return(
    <audio ref={audioRef} id="audioId" controls className="mb-12">
        <source src={`/${genre}/song.mp3`} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
  );
}
