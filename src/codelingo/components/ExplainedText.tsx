import {useContext,useState} from 'react';
import {plainWords} from '../lib/plain-language';
import {LearnerContext} from './LearnerPreferences';
const english=Object.keys(plainWords).filter(key=>/^[a-z]+$/.test(key)).join('|');
const georgian=Object.keys(plainWords).filter(key=>!/^[a-z]+$/.test(key)).sort((a,b)=>b.length-a.length).join('|');
const pattern=new RegExp('((?<![\\w.])(?:'+english+')(?!\\w)|'+georgian+')','gi');
export function PlainWord({word,force=false}:{word:string;force?:boolean}){const [open,setOpen]=useState(false);const learner=useContext(LearnerContext);const entry=plainWords[word.toLowerCase()];if(!entry||!learner.plainLanguage&&!force)return <>{word}</>;return <span className="plain-word"><button type="button" aria-expanded={open} onClick={()=>setOpen(!open)} title="მარტივი განმარტება">{word}</button>{open&&<span className="plain-definition"><strong>{entry.name}</strong><span>{entry.meaning}</span><code>{entry.example}</code><button type="button" onClick={()=>setOpen(false)} aria-label={word+' — განმარტების დახურვა'}>გასაგებია</button></span>}</span>}
export default function ExplainedText({text}:{text:string}){const learner=useContext(LearnerContext);if(!learner.plainLanguage)return <>{text}</>;return <>{text.split(pattern).map((part,i)=>plainWords[part.toLowerCase()]?<PlainWord word={part} key={i}/>:part)}</>}
