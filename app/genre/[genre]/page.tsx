'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import AudioPlayer from '@/app/AudioPlayer'
import GuessBox from '@/app/GuessBox'
import '../../globals.css'
import { useRouter } from "next/navigation";

export default function Main() {
  const params = useParams()
  const genres: string[] = ['pop', 'rap', 'rock']
  const genre: string = params?.genre as string || "";
  if(!genres.includes(genre)){
      console.log("wrong genre")
      const router = useRouter();

      useEffect(() => {
        router.replace("rap");
      }, [router]);
  }

  let [states, setStates] = useState([
    {time: 0.1, guess: ""},
    {time: 0.5, guess: ""},
    {time: 2, guess: ""},
    {time: 5, guess: ""},
    {time: 10, guess: ""},
    {time: 15, guess: ""},
    {time: 30, guess: ""},
  ]);

  const [currentState, setCurrentState] = useState(0);
  const [rightGuess, setRightGuess] = useState(false);

  return (
    <html>
      <body>
    <section className="w-2/3 mx-auto text-center mt-36 flex flex-col justify-center">
      <h1 className="font-bold text-3xl mb-2">Guess the song!</h1>
      <h2 className="font-medium text-2xl mb-6">{`${currentState+1}/${states.length} - ${states[currentState].time} seconds`}</h2>
      <AudioPlayer currentState={states[currentState]} genre={genre}/>
      {rightGuess ? <h1>You are correct!</h1> : <GuessBox currentState={currentState} setCurrentState={setCurrentState} setRightGuess={setRightGuess} genre={genre}/>}
    </section>
      </body>
    </html>
  );
}
