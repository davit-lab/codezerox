import {lessons} from './curriculum';
import {isTheoryId,validTheoryDrafts} from './theory-progress';
import {validLearner} from './learner';
import {terms} from './terms';
import {cyberLessons,cyberSimulations} from './cybersecurity';
import {cyberCourseLessons} from './cyber-course';
const termIds=new Set(terms.map(term=>term.id));
const cyberCourseIds=new Set(cyberCourseLessons.map(l=>l.id));
import type { Progress, Attempt, LearningPreferences, StudioProgress, CyberCourseProgress, CyberCourseAttempt } from './types';
import {defaultPlan,isPro,FREE_PER_SECTION} from './plan';
export const defaultLearning:LearningPreferences={mode:'guided',editorSize:14,autoPreview:true,lineNumbers:true,focus:false,weeklyGoal:4,track:'mixed'};
export const emptyStudio=():StudioProgress=>({completed:[],drafts:{},notes:{},activity:{}});
const emptyCyber=()=>({completed:[] as string[],simulations:[] as string[],terminalHistory:[] as string[],terminalDone:false});
export const emptyCyberCourse=():CyberCourseProgress=>({completed:[],attempts:[],reviews:[]});
export const KEY = 'codezero:progress:v1';
export const initialProgress = ():Progress => ({version:1,curriculum:'2026.1',profile:{name:'',experience:'brand-new',goal:'personal',minutes:10,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC',theme:'light',reducedMotion:false,fontSize:16,onboarded:false,learning:{...defaultLearning},plan:defaultPlan()},studio:emptyStudio(),cyber:emptyCyber(),cyberCourse:emptyCyberCourse(),completed:[],attempts:[],daily:{},reviews:[],drafts:{},project:{},milestones:[],updated:new Date().toISOString()});
export function dayKey(date:Date,timezone:string){return new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
export function canOpen(id:number,p:Progress){const valid=Number.isInteger(id)&&id>=1&&id<=lessons.length; return valid && (isPro(p)||id<=FREE_PER_SECTION);}
export function isLessonLockedByPlan(id:number,p:Progress){return Number.isInteger(id)&&id>FREE_PER_SECTION&&!isPro(p);}
export function cyberCourseXp(p:Progress){return new Set(p.cyberCourse?.completed??[]).size*15;}
export function xp(p:Progress){return new Set(p.completed).size*30+new Set(p.studio?.completed??[]).size*20+(p.cyber?.completed.length??0)*15+(p.cyber?.simulations.length??0)*25+(p.cyber?.terminalDone?30:0)+cyberCourseXp(p);}
export function complete(p:Progress,id:number,now=new Date()):Progress{
  if(p.completed.includes(id)||!canOpen(id,p)) return p;
  const day=dayKey(now,p.profile.timezone);
  return {...p,completed:[...p.completed,id].sort((a,b)=>a-b),daily:{...p.daily,[day]:[...new Set([...(p.daily[day]??[]),id])]},reviews:[...p.reviews.filter(r=>r.lesson!==id),{lesson:id,due:new Date(now.getTime()+3*86400000).toISOString(),successes:1}],updated:now.toISOString()};
}
export function recordAttempt(p:Progress,lesson:number,exercise:string,correct:boolean):Progress{
 const at=new Date().toISOString();const attempt:Attempt={lesson,exercise,correct,at};const old=p.reviews.find(r=>r.lesson===lesson);const successes=correct?(old?.successes??0)+1:0;
 return {...p,attempts:[...p.attempts,attempt].slice(-2000),reviews:[...p.reviews.filter(r=>r.lesson!==lesson),{lesson,successes,due:new Date(Date.now()+(correct?Math.min(30,Math.pow(2,successes)):0)*86400000).toISOString()}],updated:at};
}
export function finishReview(p:Progress,id:number,now=new Date()):Progress{const reviewed=recordAttempt(p,id,"კოდი",true);const day=dayKey(now,p.profile.timezone);return {...reviewed,daily:{...reviewed.daily,[day]:[...new Set([...(reviewed.daily[day]??[]),id])]}};}
export function streak(p:Progress,now=new Date()){
 const ccDays=(p.cyberCourse?.attempts??[]).filter(a=>a.correct).map(a=>dayKey(new Date(a.at),p.profile.timezone));
 const days=[...new Set([...Object.keys(p.daily).filter(k=>p.daily[k].length),...Object.keys(p.studio?.activity??{}).filter(k=>p.studio?.activity[k]?.length),...ccDays])].sort().reverse();if(!days.length)return 0;
 const today=dayKey(now,p.profile.timezone); const prior=(s:string)=>{const d=new Date(s+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-1);return d.toISOString().slice(0,10)};
 let cursor=days.includes(today)?today:prior(today),count=0;while(days.includes(cursor)){count++;cursor=prior(cursor)}return count;
}
export function parseProgress(text:string):Progress{
 if(text.length>3_000_000) throw new Error("ასლი მეტისმეტად დიდია. მაქსიმალური ზომაა 3 მბ.");
 let p:Progress;try{p=JSON.parse(text) as Progress;}catch{throw new Error('ასლი გამართული JSON ფაილი არ არის.');}const proto=(x:unknown)=>x&&typeof x==='object'&&!Array.isArray(x);
 if(!proto(p)||p.version!==1||p.curriculum!=='2026.1'||!proto(p.profile)||!Array.isArray(p.completed)||!p.completed.every(n=>Number.isInteger(n)&&n>=1&&n<=48)||new Set(p.completed).size!==p.completed.length)throw new Error("ეს CodeZero-ის მხარდაჭერილი პროგრესის ასლი არ არის.");
 const pr=p.profile;if(pr.learner!==undefined&&!validLearner(pr.learner))throw new Error('მოსწავლის პროფილის ან ავატარის მონაცემები არასწორია.');if(typeof pr.name!=='string'||pr.name.length>80||!['brand-new','some-html','some-code'].includes(pr.experience)||!['personal','career','curiosity'].includes(pr.goal)||![5,10,20].includes(pr.minutes)||!['light','dark','system'].includes(pr.theme)||typeof pr.reducedMotion!=='boolean'||typeof pr.onboarded!=='boolean'||![16,18,20].includes(pr.fontSize))throw new Error("პროფილის ზოგი პარამეტრი არასწორია.");
 try{dayKey(new Date(),pr.timezone)}catch{throw new Error("ასლში დროის სარტყელი არასწორია.")}
 if(!proto(p.project)||!proto(p.drafts)||!proto(p.daily)||!Array.isArray(p.attempts)||!Array.isArray(p.reviews)||!Array.isArray(p.milestones)||typeof p.updated!=='string'||!Number.isFinite(Date.parse(p.updated)))throw new Error("შენახული სასწავლო მონაცემები არასრულია.");
 const allowed=['index.html','about.html','services.html','projects.html','contact.html','css/styles.css','js/main.js','assets/studio.svg','assets/project.svg','README.md'];
 for(const [k,v] of Object.entries(p.project)){if(!allowed.includes(k)||typeof v!=='string'||v.length>250000)throw new Error("პროექტი მიუღებელ ფაილს შეიცავს.");}
 for(const [k,v] of Object.entries(p.drafts)){if(!/^\d+(:practice)?$/.test(k)||!proto(v)||!['html','css','js'].every(t=>typeof v[t as keyof typeof v]==='string'&&v[t as keyof typeof v].length<250000))throw new Error("სავარჯიშოს მონახაზი არასწორია.");}
 for(const [k,v]of Object.entries(p.daily)){if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||!Array.isArray(v)||!v.every(n=>Number.isInteger(n)&&n>=1&&n<=48))throw new Error("ყოველდღიური აქტივობის მონაცემები არასწორია.");}
 if(p.attempts.length>2000||!p.attempts.every(a=>Number.isInteger(a.lesson)&&a.lesson>=1&&a.lesson<=48&&['quiz','order',"კოდი"].includes(a.exercise)&&typeof a.correct==='boolean'&&Number.isFinite(Date.parse(a.at))))throw new Error("სავარჯიშოს მცდელობების მონაცემები არასწორია.");
 if(!p.reviews.every(r=>Number.isInteger(r.lesson)&&r.lesson>=1&&r.lesson<=48&&Number.isInteger(r.successes)&&r.successes>=0&&Number.isFinite(Date.parse(r.due))))throw new Error("გამეორების განრიგი არასწორია.");
 if(!p.milestones.every(x=>['structure','styles','responsive','interactive','ready'].includes(x)))throw new Error("უცნობი ეტაპია მითითებული.");
 const pref=pr.learning;
 if(pref!==undefined&&(!proto(pref)||!['guided','challenge'].includes(pref.mode)||![14,16,18].includes(pref.editorSize)||!['mixed','foundations','projects'].includes(pref.track)||![2,4,6].includes(pref.weeklyGoal)||!['autoPreview','lineNumbers','focus'].every(k=>typeof pref[k as keyof typeof pref]==='boolean')))throw new Error('სასწავლო პარამეტრები არასწორია.');
 const plan=pr.plan; if(plan!==undefined&&(!proto(plan)||!['free','pro'].includes(plan.tier)||!['active','inactive'].includes(plan.status)||(plan.expiresAt!==undefined&&(typeof plan.expiresAt!=='string'||!Number.isFinite(Date.parse(plan.expiresAt))))))throw new Error('გეგმის მონაცემები არასწორია.');
 if(p.theoryDrafts!==undefined&&!validTheoryDrafts(p.theoryDrafts))throw new Error('თეორიის საცდელი კოდი არასწორია.');
 if(p.theoryMastered!==undefined&&(!Array.isArray(p.theoryMastered)||p.theoryMastered.length>88||new Set(p.theoryMastered).size!==p.theoryMastered.length||!p.theoryMastered.every(id=>typeof id==='string'&&isTheoryId(id))))throw new Error('თეორიის დასრულების მონაცემები არასწორია.');
 for(const field of ['theoryBookmarks','theoryRecent'] as const){const values=p[field];if(values!==undefined&&(!Array.isArray(values)||values.length>(field==='theoryRecent'?8:88)||new Set(values).size!==values.length||!values.every(id=>typeof id==='string'&&isTheoryId(id))))throw new Error('თეორიის ნავიგაციის მონაცემები არასწორია.');}
 const guide=p.websiteGuide;const guideIds=['purpose','browser','pages','structure','navigation','layout','responsive','files','forms','interaction','quality','publish'];
 if(guide!==undefined&&(!proto(guide)||!Array.isArray(guide.completed)||guide.completed.length>12||new Set(guide.completed).size!==guide.completed.length||!guide.completed.every(id=>guideIds.includes(id))||!proto(guide.notes)||!Object.entries(guide.notes).every(([id,note])=>guideIds.includes(id)&&typeof note==='string'&&note.length<=5000)))throw new Error('საიტის გეგმის მონაცემები არასწორია.');
 const vocabulary=p.vocabulary;
 if(vocabulary!==undefined&&(!proto(vocabulary)||!['saved','known'].every(field=>{const entries=vocabulary[field as 'saved'|'known'];return Array.isArray(entries)&&entries.length<=termIds.size&&new Set(entries).size===entries.length&&entries.every(id=>typeof id==='string'&&termIds.has(id));})))throw new Error('ტერმინების პროგრესი არასწორია.');
 const cyber=p.cyber;const validCyberLessons=new Set(cyberLessons.map(item=>item.id));const validCyberSims=new Set(cyberSimulations.map(item=>item.id));
 if(cyber!==undefined&&(!proto(cyber)||!Array.isArray(cyber.completed)||cyber.completed.length>cyberLessons.length||new Set(cyber.completed).size!==cyber.completed.length||!cyber.completed.every(id=>typeof id==='string'&&validCyberLessons.has(id))||!Array.isArray(cyber.simulations)||cyber.simulations.length>cyberSimulations.length||new Set(cyber.simulations).size!==cyber.simulations.length||!cyber.simulations.every(id=>typeof id==='string'&&validCyberSims.has(id))||!Array.isArray(cyber.terminalHistory)||cyber.terminalHistory.length>40||!cyber.terminalHistory.every(value=>typeof value==='string'&&value.length<=240&&!/[;|&<>$\x60]/.test(value))||typeof cyber.terminalDone!=='boolean'))throw new Error('კიბერუსაფრთხოების პროგრესის მონაცემები არასწორია.');
 const studio=p.studio;
 const validKey=(key:string)=>/^(?:(solis|bloom|forma|atlas|tempo|orbit):(?:[1-6]|v2:(?:[1-9]|1[0-8]))|(branon|health):v3:(?:[1-9]|1[0-9]|2[0-5])|lab:v1:(?:[1-9]|1[0-8]))$/.test(key);
 if(studio!==undefined){
  if(!proto(studio)||!Array.isArray(studio.completed)||studio.completed.length>212||!studio.completed.every(validKey)||new Set(studio.completed).size!==studio.completed.length||!proto(studio.drafts)||!proto(studio.notes)||!proto(studio.activity))throw new Error('პროექტების პროგრესი არასწორია.');
  for(const [key,v]of Object.entries(studio.drafts))if(!validKey(key)||!proto(v)||!['html','css','js'].every(t=>typeof v[t as keyof typeof v]==='string'&&v[t as keyof typeof v].length<250000))throw new Error('პროექტის მონახაზი არასწორია.');
  for(const [key,v]of Object.entries(studio.notes))if(!validKey(key)||typeof v!=='string'||v.length>10000)throw new Error('პროექტის ჩანაწერი არასწორია.');
  for(const [day,v]of Object.entries(studio.activity))if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Array.isArray(v)||!v.every(validKey))throw new Error('პროექტების აქტივობა არასწორია.');
 }
 const cc=p.cyberCourse; let cyberCourse=emptyCyberCourse();
 if(cc!==undefined){
  if(!proto(cc)||!Array.isArray(cc.completed)||cc.completed.length>cyberCourseLessons.length||new Set(cc.completed).size!==cc.completed.length||!cc.completed.every(id=>typeof id==='string'&&cyberCourseIds.has(id)))throw new Error('კიბერუსაფრთხოების მეორე კურსის პროგრესი არასწორია.');
  if(!Array.isArray(cc.attempts)||cc.attempts.length>2000||!cc.attempts.every(a=>proto(a)&&typeof a.lesson==='string'&&cyberCourseIds.has(a.lesson)&&typeof a.exercise==='string'&&a.exercise.length<=40&&typeof a.correct==='boolean'&&typeof a.at==='string'&&Number.isFinite(Date.parse(a.at))))throw new Error('კიბერუსაფრთხოების მეორე კურსის მცდელობები არასწორია.');
  if(!Array.isArray(cc.reviews)||cc.reviews.length>cyberCourseLessons.length||!cc.reviews.every(r=>proto(r)&&typeof r.lesson==='string'&&cyberCourseIds.has(r.lesson)&&Number.isInteger(r.successes)&&r.successes>=0&&typeof r.due==='string'&&Number.isFinite(Date.parse(r.due))))throw new Error('კიბერუსაფრთხოების მეორე კურსის გამეორებები არასწორია.');
  cyberCourse={completed:[...cc.completed],attempts:cc.attempts.map(a=>({lesson:a.lesson,exercise:a.exercise,correct:a.correct,at:a.at})),reviews:cc.reviews.map(r=>({lesson:r.lesson,due:r.due,successes:r.successes}))};
 }
 return {...p,profile:{...pr,learning:{...defaultLearning,...pref},plan:plan?{tier:plan.tier,status:plan.status,...(plan.expiresAt?{expiresAt:plan.expiresAt}:{})}:defaultPlan()},studio:studio??emptyStudio(),cyber:cyber??emptyCyber(),cyberCourse};
}
export function mergeProgress(local:Progress,cloud:Progress,useCloudProfile=false):Progress{
 const completed=[...new Set([...local.completed,...cloud.completed])].sort((a,b)=>a-b);const daily={...cloud.daily};for(const [k,v]of Object.entries(local.daily))daily[k]=[...new Set([...(daily[k]??[]),...v])];
 const studioLocal=local.studio??emptyStudio(),studioCloud=cloud.studio??emptyStudio();
 const activity={...studioCloud.activity};for(const [day,keys]of Object.entries(studioLocal.activity))activity[day]=[...new Set([...(activity[day]??[]),...keys])];
 const studio={completed:[...new Set([...studioCloud.completed,...studioLocal.completed])],drafts:{...studioCloud.drafts,...studioLocal.drafts},notes:{...studioCloud.notes,...studioLocal.notes},activity};
 const cyberLocal=local.cyber??emptyCyber(),cyberCloud=cloud.cyber??emptyCyber();const cyber={completed:[...new Set([...cyberCloud.completed,...cyberLocal.completed])],simulations:[...new Set([...cyberCloud.simulations,...cyberLocal.simulations])],terminalHistory:[...new Set([...cyberCloud.terminalHistory,...cyberLocal.terminalHistory])].slice(-40),terminalDone:cyberCloud.terminalDone||cyberLocal.terminalDone};
 const ccLocal=local.cyberCourse??emptyCyberCourse(),ccCloud=cloud.cyberCourse??emptyCyberCourse();
 const ccAttempts=[...ccCloud.attempts,...ccLocal.attempts].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at)).slice(-2000);
 const ccReviews=new Map<string,{lesson:string;due:string;successes:number}>();
 for(const r of [...ccCloud.reviews,...ccLocal.reviews]){
  const prev=ccReviews.get(r.lesson);
  if(!prev||r.successes>prev.successes||Date.parse(r.due)>Date.parse(prev.due)) ccReviews.set(r.lesson,r);
 }
 const cyberCourse={completed:[...new Set([...ccCloud.completed,...ccLocal.completed])].filter(id=>cyberCourseIds.has(id)),attempts:ccAttempts,reviews:[...ccReviews.values()]};
 const localPlan=local.profile.plan??defaultPlan(), cloudPlan=cloud.profile.plan??defaultPlan(); const plan=(cloudPlan.tier==='pro'||localPlan.tier!=='pro')?cloudPlan:localPlan;
 return {...local,...(local.theoryDrafts||cloud.theoryDrafts?{theoryDrafts:{...cloud.theoryDrafts,...local.theoryDrafts}}:{}),...(local.theoryMastered||cloud.theoryMastered?{theoryMastered:[...new Set([...(cloud.theoryMastered??[]),...(local.theoryMastered??[])])].filter(isTheoryId)}:{}),...(local.theoryBookmarks||cloud.theoryBookmarks?{theoryBookmarks:[...new Set([...(cloud.theoryBookmarks??[]),...(local.theoryBookmarks??[])])].filter(isTheoryId)}:{}),...(local.theoryRecent||cloud.theoryRecent?{theoryRecent:[...new Set([...(local.theoryRecent??[]),...(cloud.theoryRecent??[])])].filter(isTheoryId).slice(0,8)}:{}),profile:{...(useCloudProfile?cloud.profile:local.profile),plan},...(local.websiteGuide||cloud.websiteGuide?{websiteGuide:{completed:[...new Set([...(cloud.websiteGuide?.completed??[]),...(local.websiteGuide?.completed??[])])],notes:{...cloud.websiteGuide?.notes,...local.websiteGuide?.notes}}}:{}),...(local.vocabulary||cloud.vocabulary?{vocabulary:{saved:[...new Set([...(cloud.vocabulary?.saved??[]),...(local.vocabulary?.saved??[])])],known:[...new Set([...(cloud.vocabulary?.known??[]),...(local.vocabulary?.known??[])])]}}:{}),studio,cyber,cyberCourse,completed,daily,reviews:[...new Map([...cloud.reviews,...local.reviews].map(r=>[r.lesson,r])).values()],attempts:[...cloud.attempts,...local.attempts].slice(-2000),project:{...cloud.project,...local.project},drafts:{...cloud.drafts,...local.drafts},milestones:[...new Set([...cloud.milestones,...local.milestones])],updated:new Date().toISOString()};
}
export function loadProgress():Progress{const raw=localStorage.getItem(KEY);if(!raw)return initialProgress();return parseProgress(raw);}
export function saveProgress(p:Progress){localStorage.setItem(KEY,JSON.stringify(p));}

export function finishStudio(p:Progress,key:string,now=new Date()):Progress {
 if(!/^(branon|health):v3:(?:[1-9]|1[0-9]|2[0-5])$/.test(key))return p;
 const studio=p.studio??emptyStudio();if(studio.completed.includes(key))return p;
 const [project,,number]=key.split(':');if(+number>1&&!studio.completed.includes(`${project}:v3:${+number-1}`))return p;
 const day=dayKey(now,p.profile.timezone);
 return {...p,studio:{...studio,completed:[...studio.completed,key],activity:{...studio.activity,[day]:[...new Set([...(studio.activity[day]??[]),key])]}},updated:now.toISOString()};
}

export function canOpenCyberCourse(id:string,p:Progress){
 const idx=cyberCourseLessons.findIndex(l=>l.id===id); if(idx<=0) return true;
 const prev=cyberCourseLessons[idx-1]; return (p.cyberCourse?.completed??[]).includes(prev.id);
}
export function completeCyberCourse(p:Progress,id:string,now=new Date()):Progress{
 const cc=p.cyberCourse??emptyCyberCourse();
 if(cc.completed.includes(id)||!canOpenCyberCourse(id,p)) return p;
 const day=dayKey(now,p.profile.timezone);
 return {...p,cyberCourse:{...cc,completed:[...cc.completed,id],reviews:[...cc.reviews.filter(r=>r.lesson!==id),{lesson:id,due:new Date(now.getTime()+3*86400000).toISOString(),successes:1}]},daily:{...p.daily,[day]:[...new Set([...(p.daily[day]??[])])]},updated:now.toISOString()};
}
export function recordCyberCourseAttempt(p:Progress,lesson:string,exercise:string,correct:boolean):Progress{
 const cc=p.cyberCourse??emptyCyberCourse(); const at=new Date().toISOString();
 const attempt:CyberCourseAttempt={lesson,exercise,correct,at};
 const old=cc.reviews.find(r=>r.lesson===lesson); const successes=correct?(old?.successes??0)+1:0;
 return {...p,cyberCourse:{...cc,attempts:[...cc.attempts,attempt].slice(-2000),reviews:[...cc.reviews.filter(r=>r.lesson!==lesson),{lesson,successes,due:new Date(Date.now()+(correct?Math.min(30,Math.pow(2,successes)):0)*86400000).toISOString()}]},updated:at};
}
export function finishCyberCourseReview(p:Progress,id:string,now=new Date()):Progress{
 const reviewed=recordCyberCourseAttempt(p,id,'review',true); const day=dayKey(now,p.profile.timezone);
 return {...reviewed,daily:{...reviewed.daily,[day]:[...new Set([...(reviewed.daily[day]??[])]) ]},updated:now.toISOString()};
}
