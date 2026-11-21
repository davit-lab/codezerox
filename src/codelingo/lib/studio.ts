import type { CodeFiles, Check, Progress } from './types';
import {isPro,FREE_PER_SECTION} from './plan';
import { importedProjectSpecs } from './imported-projects';
export type StudioStage = { id:number; title:string; concept:string; explanation:string; task:string; snippet:string; hints:string[]; checks:Check[]; review:string[]; starter:CodeFiles; solution:CodeFiles; transfer:boolean; resetStarter?:boolean; source?:{file:string;detail:string;original?:string} };
export type StudioProject = { id:string; title:string; subtitle:string; kind:string; level:number; minutes:number; skills:string[]; lessons:number[]; accent:string; paper:string; ink:string; brief:string; audience:string; reuse:string; preview:CodeFiles; stages:StudioStage[]; cover?:string; sourceArchive?:string };
type Patch={at:number;remove:number;insert:string};
type StageSpec=Omit<StudioStage,'starter'|'solution'>&{starter?:CodeFiles;patches:Partial<Record<keyof CodeFiles,Patch>>};
export type ProjectSpec=Omit<StudioProject,'stages'|'preview'>&{stages:StageSpec[]};
export const studioProjects:StudioProject[]=[...importedProjectSpecs.map(project=>{
 let files:CodeFiles={html:'',css:'',js:''};
 const stages:StudioStage[]=project.stages.map(spec=>{
  if(spec.id===1)files={...spec.starter!};
  const starter={...(spec.starter??files)};const solution={...files};
  for(const language of ['html','css','js'] as const){const patch=spec.patches[language];if(patch)solution[language]=files[language].slice(0,patch.at)+patch.insert+files[language].slice(patch.at+patch.remove);}
  files=solution;const {patches,...stage}=spec;void patches;
  return {...stage,starter,solution:{...solution}};
 });
 return {...project,stages,preview:stages[22].solution};
})];
export const studioTotal=studioProjects.reduce((sum,project)=>sum+project.stages.length,0);
export const stageKey=(project:string,stage:number)=>`${project}:v3:${stage}`;
export function studioStageIndex(project:string,stage:number){let i=0;for(const pr of studioProjects){for(const st of pr.stages){i++; if(pr.id===project&&st.id===stage) return i;}}return 9999;}
export function studioCanOpen(project:string,stage:number,p:Progress){const found=studioProjects.find(item=>item.id===project);const key=stageKey(project,stage);const seq=!!found&&Number.isInteger(stage)&&stage>=1&&stage<=found.stages.length&&(stage===1||!!p.studio?.completed.includes(stageKey(project,stage-1))||!!p.studio?.completed.includes(key)); return seq && (isPro(p)||studioStageIndex(project,stage)<=FREE_PER_SECTION||!!p.studio?.completed.includes(key));}
export function isStudioLockedByPlan(project:string,stage:number,p:Progress){const key=stageKey(project,stage);return studioStageIndex(project,stage)>FREE_PER_SECTION&&!isPro(p)&&!p.studio?.completed.includes(key);}
export function studioCount(p:Progress){return studioProjects.reduce((sum,project)=>sum+project.stages.filter(stage=>p.studio?.completed.includes(stageKey(project.id,stage.id))).length,0);}
export function studioNext(p:Progress){const recent=p.studio?.completed.at(-1)?.split(':')[0];const ordered=[...studioProjects].sort((a,b)=>Number(b.id===recent)-Number(a.id===recent));for(const project of ordered)for(const stage of project.stages)if(!p.studio?.completed.includes(stageKey(project.id,stage.id)))return {project,stage};return null;}
export function studioDocument(files:CodeFiles){return `<!doctype html><html lang="ka"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: https: http:; script-src 'none'"><style>${files.css.replace(/<\/style/gi,'<\\/style')}</style></head><body>${files.html}</body></html>`;}

export const isCurrentStudioKey=(key:string)=>studioProjects.some(project=>project.stages.some(stage=>stageKey(project.id,stage.id)===key));
