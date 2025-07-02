"use client";
import { useState, useRef, useEffect } from "react";

type StateType = {
  time: number,
  guess: string
}

type AudioPlayerProps = {
  currentState: StateType;
  genre: string;
};

export default function AudioPlayer({ currentState, genre}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    console.log(currentState.time)
    if (!audio) return;
    const handleAudioChange = () => {
      if (audio.currentTime >= currentState.time) {
        audio.currentTime = 0;
        audio.pause();
      }
    };

    audio.addEventListener("timeupdate", handleAudioChange);

    return () => {
      audio.removeEventListener("timeupdate", handleAudioChange);
    };
  }, [currentState.time]);


  return(
    <audio ref={audioRef} id="audioId" controls className="mb-12">
        <source src={`/${genre}/song.mp3`} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
  );
}
