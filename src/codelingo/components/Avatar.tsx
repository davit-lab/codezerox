import {defaultAvatar,avatarColor,type AvatarConfig} from '../lib/learner';
export default function Avatar({value=defaultAvatar(),label='შენი ავატარი',className=''}:{value?:AvatarConfig;label?:string;className?:string}){
 const skin=avatarColor('skin',value.skin),hair=avatarColor('hairColor',value.hairColor),shirt=avatarColor('shirt',value.shirt),ink='#303834';
 const faces={oval:{rx:30,ry:36},round:{rx:33,ry:32},square:{rx:31,ry:31},soft:{rx:27,ry:38}};const face=faces[value.face];
 return <svg viewBox="0 0 120 150" className={'learner-avatar '+className} role="img" aria-label={label}>
 <rect width="120" height="150" rx="26" fill={avatarColor('background',value.background)}/>
 {value.hair==='long'&&<path d="M24 60Q18 12 60 13q43 0 37 51l7 64H17z" fill={hair}/>}{value.hair==='bob'&&<path d="M25 55Q18 14 60 15q42-1 36 44l2 36q-35 15-76-1z" fill={hair}/>}{value.hair==='bun'&&<circle cx="83" cy="20" r="15" fill={hair}/>}
 <path d="M12 150v-19q1-31 48-31t48 31v19" fill={shirt}/><path d="M47 93v17q13 14 26 0V93" fill={skin}/><path d="m39 108 21 15 21-15" fill="none" stroke={ink} strokeOpacity=".18" strokeWidth="3"/>
 <ellipse cx="28" cy="63" rx="7" ry="10" fill={skin}/><ellipse cx="92" cy="63" rx="7" ry="10" fill={skin}/>
 {value.face==='square'?<rect x="29" y="26" width="62" height="75" rx="22" fill={skin}/>:<ellipse cx="60" cy="63" rx={face.rx} ry={face.ry} fill={skin}/>}
 {value.hair==='crop'&&<path d="M29 55V37Q31 16 60 17q30 0 32 24v13l-9-16q-26 7-44 0z" fill={hair}/>}
 {value.hair==='sweep'&&<path d="M28 58V39Q27 13 61 14q33 0 33 29l-7 18-6-27q-23 19-45 8l-1 19z" fill={hair}/>}
 {value.hair==='curls'&&<g fill={hair}>{[[32,35],[43,24],[59,22],[76,26],[88,38],[28,49],[92,50]].map(([x,y])=><circle key={x+':'+y} cx={x} cy={y} r="12"/>)}</g>}
 {(value.hair==='bob'||value.hair==='long')&&<path d="M28 59V39q3-24 32-24t33 26v22l-10-25q-20 15-44 2z" fill={hair}/>}
 {value.hair==='bun'&&<path d="M28 58V41q1-25 32-25t33 26v19l-10-24q-26 15-45 0z" fill={hair}/>}
 {value.hair==='spikes'&&<path d="m28 58 1-25 11-2 1-17 16 9 13-17 8 17 17 2-1 35-10-23-45 1z" fill={hair}/>}
 <g stroke={ink} strokeWidth="2.5" strokeLinecap="round" fill="none"><path d="m40 52 10-1m20 0 10 1" opacity=".65"/>
 {value.eyes==='smile'?<path d="M39 63q6-7 12 0m18 0q6-7 12 0"/>:value.eyes==='calm'?<path d="M40 62h10m20 0h10"/>:value.eyes==='almond'?<><path d="M38 62q7-6 14 0-7 6-14 0m30 0q7-6 14 0-7 6-14 0"/><circle cx="45" cy="62" r="1.5" fill={ink}/><circle cx="75" cy="62" r="1.5" fill={ink}/></>:<g fill={ink} stroke="none"><ellipse cx="45" cy="62" rx={value.eyes==='bright'?5:3} ry={value.eyes==='bright'?6:4}/><ellipse cx="75" cy="62" rx={value.eyes==='bright'?5:3} ry={value.eyes==='bright'?6:4}/>{value.eyes==='bright'&&<g fill="white"><circle cx="46" cy="60" r="1.6"/><circle cx="76" cy="60" r="1.6"/></g>}</g>}
 {value.eyes==='lashes'&&<path d="m39 59-2-3m7 2-1-4m25 5-2-3m7 2 1-4"/>}<path d="m59 66-2 9h5" strokeOpacity=".3"/>
 {value.mouth==='smile'?<path d="M49 82q11 11 22 0"/>:value.mouth==='calm'?<path d="M51 85h18"/>:value.mouth==='grin'?<path d="M48 81h24q-12 20-24 0" fill="white"/>:<ellipse cx="60" cy="85" rx="7" ry="8" fill={ink}/>}
 </g>
 {value.accessory==='glasses'&&<g fill="none" stroke={ink} strokeWidth="3"><circle cx="44" cy="63" r="13"/><circle cx="76" cy="63" r="13"/><path d="M57 62h6m-35-3 4 2m56 0 4-2"/></g>}
 {value.accessory==='square'&&<g fill="none" stroke={ink} strokeWidth="3"><rect x="31" y="53" width="26" height="20" rx="5"/><rect x="63" y="53" width="26" height="20" rx="5"/><path d="M57 60h6"/></g>}
 {value.accessory==='freckles'&&<g fill="#a66d4e">{[[36,74],[41,76],[45,73],[75,73],[80,76],[84,74]].map(([x,y])=><circle key={x+':'+y} cx={x} cy={y} r="1.4"/>)}</g>}
 {value.accessory==='earrings'&&<g fill="none" stroke="#9d7c29" strokeWidth="3"><circle cx="27" cy="77" r="5"/><circle cx="93" cy="77" r="5"/></g>}
 </svg>
}
