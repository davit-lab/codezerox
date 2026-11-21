import type {CodeFiles} from './types';
export function virtualAsset(path:string):'css'|'js'|null{const value=path.trim();if(!value||/^[a-z][a-z\d+.-]*:/i.test(value)||value.startsWith('//'))return null;const name=value.split(/[?#]/)[0].split('/').pop()?.toLowerCase();if(['style.css','styles.css','main.css','app.css'].includes(name??''))return 'css';if(['main.js','script.js','app.js','index.js'].includes(name??''))return 'js';return null;}
export const executableScript=(type:string)=>['','text/javascript','application/javascript','module'].includes(type.trim().toLowerCase());
export const sameFiles=(a:CodeFiles,b:CodeFiles)=>a.html===b.html&&a.css===b.css&&a.js===b.js;
export const cssOnlyChange=(a:CodeFiles,b:CodeFiles)=>a.html===b.html&&a.js===b.js&&a.css!==b.css;
