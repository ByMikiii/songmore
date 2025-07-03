"use client";

import { useState, useEffect } from "react";

  type Guess = {
    song_name: string;
    artist_name: string;
  };

  type StateItem = {
    time: number;
    guess: Guess;
  };

type GuessBoxProps = {
  currentState: number;
  setCurrentState: React.Dispatch<React.SetStateAction<number>>;
  states: StateItem[];
  setStates: React.Dispatch<React.SetStateAction<StateItem[]>>;
  rightGuess: boolean;
  setRightGuess: React.Dispatch<React.SetStateAction<boolean>>;
  genre: string;
  handleGenreSave: (genre: string) => void;
};

type Song = {
  genre: string;
  song_name: string;
  artist_name: string;
}

export default function GuessBox({ currentState, setCurrentState, states, setStates, rightGuess, setRightGuess, genre, handleGenreSave}: GuessBoxProps) {

  const [search, setSearch] = useState("");
  const [defaultList, setDefaultList] = useState<Song[]>([]);
  const [list, setList] = useState<Song[]>(defaultList);
  const [searchList, setSearchList] = useState<Song[]>(list);

  useEffect(() => {
    fetch("/api/songs").then(
      response => {
        if(!response.ok){
          throw new Error("Error while fetching songs.");
        }
        return response.json();
      }).then(data =>{
        let tempList: Song[] = [];
        (data as Song[]).forEach((song) => {
          tempList.push(song);
        });
        setDefaultList(tempList);
        setList(tempList);
        setSearchList(tempList);
      }
    )
  }, [])


useEffect(() => {
  if (list.length === 0 || states.length === 0) return;

  let updatedList = defaultList;
  let updatedSearchList = defaultList;

  for (let i = 0; i < currentState; i++) {
    const guess = states[i].guess;
    if (guess.song_name !== "") {
      const result = removeFromLists(updatedList, updatedSearchList, guess.song_name, guess.artist_name);
      updatedList = result.filteredList;
      updatedSearchList = result.filteredSearchList;
    }
  }

  setSearch("")
  setList(updatedList);
  setSearchList(updatedSearchList);
}, [states, list.length, currentState]);


  useEffect(() => {
    if(search === ""){
      setSearchList(list);
    }else{
      const lowerSearch = search.toLowerCase();
      const filtered = list.filter(
        item =>
          item.artist_name.toLowerCase().includes(lowerSearch) ||
          item.song_name.toLowerCase().includes(lowerSearch)
      );
      setSearchList(filtered);
    }
  }, [search])



const removeFromLists = (
  currentList: Song[],
  currentSearchList: Song[],
  songName: string,
  artistName: string
) => {
  const filteredList = currentList.filter(
    item => !(item.song_name === songName && item.artist_name === artistName)
  );
  const filteredSearchList = currentSearchList.filter(
    item => !(item.song_name === songName && item.artist_name === artistName)
  );

  return { filteredList, filteredSearchList };
};

  const handleSumbit = async (songName: string, artistName: string) => {

const { filteredList, filteredSearchList } = removeFromLists(
  list,
  searchList,
  songName,
  artistName
);

setList(filteredList);
setSearchList(filteredSearchList);

    try{
      const response = await fetch(`/api/picked_songs/${genre.toLowerCase()}`);
      if (!response.ok) {
        throw new Error("Error while fetching songs.");
      }

      const data = await response.json();
      const correctSong: Song = {
          song_name: data.song_name,
          artist_name: data.artist_name,
          genre: data.song_genre
      };
      setStates(prev => {
          const newStates = [...prev];
          newStates[currentState] = {
            ...newStates[currentState],
            guess: {
              song_name: songName,
              artist_name: artistName
            }
          };
          return newStates;
        })

      if(correctSong.song_name === songName && correctSong.artist_name === artistName){
        console.log("correct!!")
        setRightGuess(true);
        if(currentState !== 6){
          setCurrentState(prev => prev + 1);
        }
      }else{
        console.log("incorrect")
        if(currentState !== 6){
          setCurrentState(prev => prev + 1);
        }
      }
    }
    catch(e){
      console.error(e);
    }
  }


  const handleSkip = () => {
    if(currentState === 6){
      return;
    }
    setCurrentState(prev => prev + 1);
  }


  return(
    <div className="dropdown bg-white w-72 mx-auto text-black">
      <input type="text" placeholder="Name of the song:" value={search} onChange={(e) => setSearch(e.target.value)}/>
      <ul className="h-24 overflow-auto">
        {searchList.map((item) => (
          <li key={`${item.artist_name}-${item.song_name}`} onClick={() => handleSumbit(item.song_name, item.artist_name)} className="cursor-pointer hover:scale-105">{item.song_name} - {item.artist_name}</li>
        ))}
      </ul>
      <button onClick={handleSkip} className="cursor-pointer">Skip</button>
    </div>
  );
}
