"use client";
import { useEffect, useState } from 'react';

export default function DarkModeToggle(){
  const [dark,setDark] = useState(false);
  // load preference
  useEffect(()=>{ const pref = localStorage.getItem('theme'); if(pref==='dark'){ setDark(true); } },[]);
  useEffect(()=>{ 
    const root = document.documentElement; 
    if(dark){ root.classList.add('dark'); localStorage.setItem('theme','dark'); } 
    else { root.classList.remove('dark'); localStorage.setItem('theme','light'); }
  },[dark]);
  return (
    <button onClick={()=>setDark(d=>!d)} aria-label="Toggle theme" className="text-xs px-3 py-1.5 rounded-full border bg-white/80 backdrop-blur hover:bg-white dark:bg-sky-900 dark:text-sky-100 dark:border-sky-700 dark:hover:bg-sky-800 transition">
      {dark? '🌞':'🌙'}
    </button>
  );
}
