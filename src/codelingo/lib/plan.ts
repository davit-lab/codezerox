import type {Progress} from './types';
export type PlanTier='free'|'pro';
export type PlanState={tier:PlanTier;status:'active'|'inactive';expiresAt?:string};
export const FREE_PER_SECTION=5;
export const PRO_PRICE_GEL=30;
export const PRO_PERIOD='month';
export const defaultPlan=():PlanState=>({tier:'free',status:'active'});
export function isPro(p:Progress){
 const plan=p.profile.plan??defaultPlan();
 if(plan.tier!=='pro'||plan.status!=='active') return false;
 if(plan.expiresAt){const t=Date.parse(plan.expiresAt); if(Number.isFinite(t)&&t<Date.now()) return false;}
 return true;
}
export function planLabel(p:Progress){return isPro(p)?'Pro':'უფასო';}
export function freeRemaining(totalUnlocked:number){return Math.max(0,FREE_PER_SECTION-totalUnlocked);}


export function theoryCanOpen(index:number,p:Progress){return isPro(p)||index<FREE_PER_SECTION;}
export function isTheoryLockedByPlan(index:number,p:Progress){return !theoryCanOpen(index,p);}
