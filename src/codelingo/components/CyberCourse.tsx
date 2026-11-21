import {useMemo,useState} from 'react';
import {ArrowLeft,ArrowRight,BookOpen,Check,CheckCircle2,ChevronRight,LockKeyhole,Play,RotateCcw,ShieldCheck,Trophy} from 'lucide-react';
import type {Progress} from '../lib/types';
import {cyberCourseLessons,cyberCourseModules} from '../lib/cyber-course';
import {canOpenCyberCourse,completeCyberCourse,finishCyberCourseReview,recordCyberCourseAttempt,cyberCourseXp} from '../lib/progress';

type Props={p:Progress;update:(fn:(p:Progress)=>Progress)=>void;notify:(m:string)=>void};

export default function CyberCourse({p,update,notify}:Props){
 const [active,setActive]=useState<string|null>(null);
 const [part,setPart]=useState(0);
 const [answer,setAnswer]=useState<number|null>(null);
 const [quizPass,setQuizPass]=useState(false);
 const [feedback,setFeedback]=useState('');
 const [order,setOrder]=useState<number[]>([]);
 const [orderPass,setOrderPass]=useState(false);
 const [orderMsg,setOrderMsg]=useState('');
 const progress=p.cyberCourse??{completed:[],attempts:[],reviews:[]};
 const done=new Set(progress.completed);
 const lesson=active?cyberCourseLessons.find(l=>l.id===active):undefined;

 const openLesson=(id:string)=>{
  const l=cyberCourseLessons.find(x=>x.id===id); if(!l) return;
  setActive(id); setPart(0); setAnswer(null); setQuizPass(false); setFeedback('');
  setOrder(l.order.lines.map((_,i)=>i).slice().reverse()); setOrderPass(false); setOrderMsg('');
 };
 const close=()=>{setActive(null);};

 const total=cyberCourseLessons.length;
 const completedCount=progress.completed.length;
 const xp=cyberCourseXp(p);

 if(lesson){
  const quizCorrect=answer===lesson.quiz.correct;
  const module=cyberCourseModules[lesson.module];
  const lessonDone=done.has(lesson.id);
  return <div className="course-page cyber-course-page">
    <button className="text-button back-link" onClick={close}><ArrowLeft size={16}/> კურსზე დაბრუნება</button>
    <div className="page-heading"><div><p className="eyebrow">{module?.title} · {lesson.minutes} წთ</p><h1>{lesson.title}</h1><p>{lesson.practice}</p></div><span className="badge">{lessonDone?'დასრულებულია':'სასწავლო გაკვეთილი'}</span></div>
    <div className="lesson-stepper" role="tablist" aria-label="გაკვეთილის ნაბიჯები">
      {[['შესავალი',BookOpen],['თანმიმდევრობა',RotateCcw],['შემოწმება',ShieldCheck]].map(([label,Icon],i)=>(
        <button key={String(label)} role="tab" aria-selected={part===i} className={part===i?'active':i<part?'done':''} onClick={()=>setPart(i)}><Icon size={16}/>{label as string}{(i===0?quizPass:i===1?orderPass:lessonDone)?<Check size={14}/>:null}</button>
      ))}
    </div>

    {part===0&&<div className="reading-panel"><div className="lesson-reading"><article><p className="lesson-explanation">{lesson.concept}</p><div className="example-code"><strong>მაგალითი</strong><p>{lesson.example}</p></div><div className="example-code"><strong>დაცვა</strong><p>{lesson.defense}</p></div></article><aside className="learning-note"><p className="eyebrow">მოკლე შემოწმება</p><h3>{lesson.quiz.question}</h3><div className="knowledge-check" role="radiogroup" aria-label="ქვიზი">
      {lesson.quiz.choices.map((c,i)=><button key={c} className={'quiz-choice '+(answer===i?(quizCorrect?'correct':'wrong'):'')+(quizPass&&i===lesson.quiz.correct?' correct':'')} onClick={()=>{setAnswer(i);setQuizPass(false);setFeedback('');}}>
        <span className="choice-letter">{String.fromCharCode(65+i)}</span><span>{c}</span>
      </button>)}
    </div>
    {answer!==null&&!quizPass&&<p className={"feedback "+(quizCorrect?'good':'bad')}>{quizCorrect?'სწორია. '+lesson.quiz.reason:'ჯერ არა. '+lesson.quiz.reason}</p>}
    {quizPass&&<p className="feedback good">სწორია! შეგიძლია შემდეგ ნაბიჯზე გადასვლა.</p>}
    <div className="lesson-next"><button className="button" onClick={()=>{
      if(answer===null) return;
      const ok=answer===lesson.quiz.correct;
      setQuizPass(ok); setFeedback(ok?lesson.quiz.reason:'სცადე კიდევ');
      update(prev=>recordCyberCourseAttempt(prev,lesson.id,'quiz',ok));
      if(ok) notify('სწორი პასუხი');
    }}>შეამოწმე</button>{quizPass&&<button className="button" onClick={()=>setPart(1)}>შემდეგი <ArrowRight size={16}/></button>}</div>
    </aside></div></div>}

    {part===1&&<div className="reading-panel"><p className="eyebrow">ლოგიკური თანმიმდევრობა</p><h2>{lesson.order.prompt}</h2>
      <div className="order-list">{order.map((idx,pos)=>{ const correctPos=idx===pos; return <div key={idx} className={'order-row '+(orderPass?'correct':orderMsg&&!correctPos?'wrong':'')}>
        <span>{pos+1}</span><code>{lesson.order.lines[idx]}</code>
        <div><button className="icon-button" aria-label="ზემოთ" onClick={()=>{if(pos===0)return; const n=[...order]; [n[pos-1],n[pos]]=[n[pos],n[pos-1]]; setOrder(n); setOrderPass(false); setOrderMsg('');}}>↑</button>
        <button className="icon-button" aria-label="ქვემოთ" onClick={()=>{if(pos===order.length-1)return; const n=[...order]; [n[pos+1],n[pos]]=[n[pos],n[pos+1]]; setOrder(n); setOrderPass(false); setOrderMsg('');}}>↓</button></div>
      </div>;})}</div>
      {orderMsg&&<p className={"feedback "+(orderPass?'good':'bad')}>{orderMsg}</p>}
      <div className="lesson-next"><button className="button" onClick={()=>{
        const ok=order.every((v,i)=>v===i);
        setOrderPass(ok); setOrderMsg(ok?'სწორი თანმიმდევრობაა!':'ჯერ არასწორია, სცადე ხელახლა.');
        update(prev=>recordCyberCourseAttempt(prev,lesson.id,'order',ok));
        if(ok) notify('თანმიმდევრობა სწორია');
      }}>შეამოწმე</button>{orderPass&&<button className="button" onClick={()=>setPart(2)}>შემდეგი <ArrowRight size={16}/></button>}</div>
    </div>}

    {part===2&&<div className="reading-panel lesson-finished"><p className="eyebrow">გაკვეთილის შეჯამება</p><h2>{lessonDone?'კარგია, გამეორება დასრულდა':'შესანიშნავია!'}</h2><p>{lesson.recap}</p>
      <div className="completion-recap"><span><strong>+15</strong> XP</span><span><strong>{lesson.minutes}</strong> წთ</span><span><strong>{completedCount+(lessonDone?0:1)}/{total}</strong> პროგრესი</span></div>
      <div className="finished-actions">
        {!lessonDone ? <button className="button" onClick={()=>{ update(prev=>completeCyberCourse(prev,lesson.id)); notify('გაკვეთილი დასრულდა'); }}>დაასრულე გაკვეთილი <CheckCircle2 size={16}/></button>
        : <button className="button" onClick={()=>{ update(prev=>finishCyberCourseReview(prev,lesson.id)); notify('გამეორება შენახულია'); }}>შეინახე გამეორება <CheckCircle2 size={16}/></button>}
        <button className="outline-button" onClick={close}>კურსზე დაბრუნება</button>
      </div>
    </div>}
  </div>;
 }

 return <div className="course-page cyber-course-page">
  <div className="page-heading"><div><p className="eyebrow">მეორე კურსი · ქართული</p><h1>კიბერუსაფრთხოება ყოველდღიურობაში</h1><p>პრაქტიკული მეორე კურსი: პაროლები, ფიშინგი, უსაფრთხო ვებქცევა და ინციდენტზე რეაგირება.</p></div><span className="badge"><ShieldCheck size={14}/> {completedCount}/{total}</span></div>
  <div className="practice-banner"><div><p className="eyebrow">პროგრესი</p><h2>{xp} XP · {completedCount} დასრულებული გაკვეთილი</h2><p>ყოველი გაკვეთილი: მოკლე ახსნა, ქვიზი, თანმიმდევრობა და შეჯამება.</p></div><div className="progress-track" aria-label="კურსის პროგრესი"><span style={{width:`${(completedCount/total)*100}%`}}/></div></div>
  <div className="course-path">{cyberCourseModules.map((m,mi)=>{
    const modLessons=cyberCourseLessons.filter(l=>l.module===mi);
    const modDone=modLessons.filter(l=>done.has(l.id)).length;
    return <section key={m.id} className="path-module">
      <div className="path-module-heading"><div><p className="eyebrow">მოდული {mi+1}</p><strong>{m.title}</strong><p>{m.description}</p></div><span className="module-count">{modDone}/{modLessons.length}</span></div>
      <div className="path-lessons">{modLessons.map((l,li)=>{
        const locked=!canOpenCyberCourse(l.id,p);
        const isDone=done.has(l.id);
        return <button key={l.id} className={'path-lesson '+(isDone?'done':locked?'locked':'')} disabled={locked} onClick={()=>openLesson(l.id)}>
          <span className="path-node">{isDone?<CheckCircle2 size={18}/>:locked?<LockKeyhole size={18}/>:<Play size={18}/>}</span>
          <div><strong>{l.title}</strong><span>{l.minutes} წთ · {l.recap}</span></div>
          <span className="review-label">{isDone?'გაიმეორე':locked?'ჩაკეტილი':'დაწყება'}</span>
          <ChevronRight size={16}/>
        </button>;
      })}</div>
    </section>;
  })}</div>
  {completedCount===total&&<div className="module-achievement"><Trophy size={20}/> <div><strong>კურსი დასრულებულია!</strong><p>შენ გაიარე კიბერუსაფრთხოების ყოველდღიური საფუძვლები.</p></div></div>}
 </div>;
}
