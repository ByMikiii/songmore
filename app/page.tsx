"use client";
import './globals.css'
import { useState, useContext, useEffect } from "react";
import AudioPlayer from './AudioPlayer';
import GuessBox from './GuessBox';
import Result from './Result';

export default function Home() {
  const [selectedGenre, setSelectedGenre] = useState<string>('Rap');
  const genres: string[] = [
    'Rap',
    'Pop',
    'Rock'
  ]

  type Guess = {
    song_name: string;
    artist_name: string;
  };

  type StateItem = {
    time: number;
    guess: Guess;
  };



  const defaultState: StateItem[] = [
    { time: 0.1, guess: {song_name: "", artist_name: ""} },
    { time: 0.5, guess: {song_name: "", artist_name: ""} },
    { time: 2, guess: {song_name: "", artist_name: ""} },
    { time: 5, guess: {song_name: "", artist_name: ""} },
    { time: 10, guess: {song_name: "", artist_name: ""} },
    { time: 15, guess: {song_name: "", artist_name: ""} },
    { time: 30, guess: {song_name: "", artist_name: ""} },
  ];

  let [states, setStates] = useState<StateItem[]>(defaultState);
  const [currentState, setCurrentState] = useState<number>(0);
  const [rightGuess, setRightGuess] = useState<boolean>(false);

  const handleGenreSave = (genre: string) => {
    let now  = new Date();
    const till_hour  = now.getHours() + 1;
    now.setHours(till_hour);
    now.setMinutes(0);
    now.setSeconds(0);
    localStorage.setItem(genre, JSON.stringify({
      stateNum: currentState,
      currentState: states,
      rightGuess: rightGuess,
      validTill: now.getTime()
    }));
  }

  const handleGenreLoad = (genre: string) => {
    const saved = localStorage.getItem(genre);
    if(saved){
      const parsed = JSON.parse(saved);
      if(parsed.validTill > new Date().getTime()){
        setStates(parsed.currentState)
        setCurrentState(parsed.stateNum)
        setRightGuess(parsed.rightGuess)
      }
      return;
    }
    setStates(defaultState);
    setCurrentState(0);
    setRightGuess(false)
  }


  useEffect(() => {
    console.log("new", currentState, states, rightGuess)
    if(currentState !== 0){
      handleGenreSave(selectedGenre)
    }
  }, [currentState, states, rightGuess])

  const handleGenreChange = (newGenre: string) => {
    console.log(`genre change ${selectedGenre} -> ${newGenre}`)
    // save to local
    handleGenreSave(selectedGenre);
    // load from local
    handleGenreLoad(newGenre)
    // if not found set to 0
    setSelectedGenre(newGenre)
  }

  useEffect(() => {
    handleGenreLoad(selectedGenre)
  }, [])


  return (
    <html>
      <body className='h-[100vh] flex flex-col items-center text-center'>
        <ul className='flex justify-between mx-auto border-white border-2 rounded-3xl mt-24'>
          {genres.map((genre) => (
            <li key={`li-${genre}`} className={`px-8 py-1 rounded-2xl transition-colors ease-in duration-200 ${selectedGenre === genre ? "bg-white text-black" : ""}`}><button className='cursor-pointer' onClick={() => handleGenreChange(genre)}>{genre}</button></li>
          ))}
        </ul>

        <section className="w-2/3 mx-auto text-center mt-36 flex flex-col justify-center">
          <h1 className="font-bold text-3xl mb-2">Guess the song!</h1>
          <h2 className="font-medium text-2xl mb-6">{`${currentState+1}/${states.length} - ${states[currentState].time} seconds`}</h2>
          <AudioPlayer currentState={states[currentState]} genre={selectedGenre} rightGuess={rightGuess}/>
          {rightGuess || (currentState === 6 && states[6].guess.song_name !== "") ? <Result rightGuess={rightGuess}/> : <GuessBox currentState={currentState} setCurrentState={setCurrentState} states={states} setStates={setStates} rightGuess={rightGuess} setRightGuess={setRightGuess} genre={selectedGenre} handleGenreSave={handleGenreSave}/>}
        </section>
      </body>
    </html>
  );
}
