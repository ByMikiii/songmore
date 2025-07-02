"use client";

import { useState, useEffect } from "react";
type GuessBoxProps = {
  currentState: number;
  setCurrentState: React.Dispatch<React.SetStateAction<number>>;
  setRightGuess: React.Dispatch<React.SetStateAction<boolean>>;
  genre: string;
};

type Song = {
  genre: string;
  song_name: string;
  artist_name: string;
}

export default function GuessBox({ currentState, setCurrentState, setRightGuess, genre }: GuessBoxProps) {

  const [search, setSearch] = useState("");
  const [list, setList] = useState<Song[]>([]);
  const [searchList, setSearchList] = useState(list);

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
        setList(tempList);
        setSearchList(tempList);
      }
    )
  }, [])



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

  const handleSumbit = async (songName: string, artistName: string) => {
    console.log(songName, artistName);
    const filteredList = list.filter(
      item => !(item.song_name === songName && item.artist_name === artistName)
    );
    setList(filteredList);
    const filteredSearchList = searchList.filter(
      item => !(item.song_name === songName && item.artist_name === artistName)
    )
    setSearchList(filteredSearchList);

    try{
      console.log(`fetching current ${genre} song`)
      const response = await fetch(`/api/picked_songs/${genre}`);
      if (!response.ok) {
        throw new Error("Error while fetching songs.");
      }

      const data = await response.json();
      const correctSong: Song = {
          song_name: data.song_name,
          artist_name: data.artist_name,
          genre: data.song_genre
      };

      if(correctSong.song_name === songName && correctSong.artist_name === artistName){
        console.log("correct!!")
        setRightGuess(true);
      }else{
        console.log("incorrect")
        setCurrentState(prev => prev + 1);
      }
    }
    catch(e){
      console.error(e);
    }
}
  const handleSkip = () => {
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
