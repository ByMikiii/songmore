"use client";
import './globals.css'
import { useState, useContext, useEffect } from "react";

export default function Home() {
  const [selectedGenre, setSelectedGenre] = useState<string>('Rap');
  const genres: string[] = [
    'Rap',
    'Pop',
    'Rock'
  ]
  return (
    <html>
      <body className='h-[100vh] flex flex-col items-center text-center'>
        <h1 className='mb-8'>Select song genre:</h1>
        <ul className='flex gap-5 justify-between mx-auto border-white border-2 rounded-3xl'>
          <li className='bg-white text-black px-8 py-1 rounded-2xl'><a href="/genre/pop">Pop</a></li>
          <li className='px-8 py-1'><a href="/genre/rap">Rap</a></li>
          <li className='px-8 py-1'><a href="/genre/rock">Rock </a></li>
        </ul>
      </body>
    </html>
  );
}
