import {useEffect,useRef,useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {parseProgress} from '../lib/progress';
import type {Progress} from '../lib/types';

const db=supabase as any;

/** Loads the learner's saved progress from their CodeZero account, then auto-saves every change. */
export function useCloudProgress(userId:string|undefined,progress:Progress|null,setProgress:(p:Progress)=>void){
 const [synced,setSynced]=useState(false);const [status,setStatus]=useState<'idle'|'saving'|'saved'|'error'>('idle');
 const timer=useRef<number>();const lastSaved=useRef('');
 useEffect(()=>{setSynced(false);if(!userId||!progress)return;let cancelled=false;(async()=>{
  try{const {data}=await db.from('learner_state').select('state,updated_at').eq('user_id',userId).maybeSingle();
   if(cancelled)return;
   if(data?.state){const cloud=parseProgress(JSON.stringify(data.state));const cloudTime=Date.parse(cloud.updated||data.updated_at)||0;const localTime=Date.parse(progress.updated||'')||0;
    if(cloudTime>=localTime||!progress.profile.onboarded){lastSaved.current=JSON.stringify(cloud);setProgress(cloud);}}
  }catch(e){console.warn('codelingo cloud load failed',e);}
  if(!cancelled)setSynced(true);
 })();return()=>{cancelled=true;};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[userId,!!progress]);
 useEffect(()=>{if(!userId||!progress||!synced)return;const json=JSON.stringify(progress);if(json===lastSaved.current)return;window.clearTimeout(timer.current);timer.current=window.setTimeout(async()=>{setStatus('saving');const {error}=await db.rpc('save_learner_state',{new_state:progress,expected_revision:null});if(error){setStatus('error');console.warn('codelingo save failed',error);}else{lastSaved.current=json;setStatus('saved');}},1500);return()=>window.clearTimeout(timer.current);},[userId,progress,synced]);
 return {synced,status};
}

/** Server-side Pro entitlement (paid through Flitt). */
export function useProEntitlement(userId:string|undefined){
 const [state,setState]=useState<{loaded:boolean;expiresAt?:string}>({loaded:false});
 useEffect(()=>{if(!userId){setState({loaded:true});return;}let c=false;db.from('codelingo_subscriptions').select('status,expires_at').eq('user_id',userId).maybeSingle().then(({data}:any)=>{if(c)return;const ok=data&&data.status==='active'&&Date.parse(data.expires_at)>Date.now();setState({loaded:true,expiresAt:ok?data.expires_at:undefined});});return()=>{c=true;};},[userId]);
 return state;
}

export function useProPrice(){
 const [price,setPrice]=useState(30);
 useEffect(()=>{db.from('pricing_config').select('amount_gel').eq('key','codelingo_pro').maybeSingle().then(({data}:any)=>{if(data?.amount_gel)setPrice(Number(data.amount_gel));});},[]);
 return price;
}

export async function startProCheckout(){
 const {data,error}=await supabase.functions.invoke('flitt-payment',{body:{action:'initiate',items:[{type:'codelingo_pro',title:'კოდელინგო Pro — 30 დღე',price:0}]}});
 if(error||!data?.payment_url)throw new Error((data as any)?.error||'გადახდის გვერდი ვერ გაიხსნა. სცადე ხელახლა.');
 (window.top||window).location.href=data.payment_url;
}
