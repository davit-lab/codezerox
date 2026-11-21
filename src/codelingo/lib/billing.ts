import type {PlanState} from './types';
import {defaultPlan} from './plan';

export type CheckoutRequest={plan:'pro';source:string};
export type BillingProvider={
  getPlan():Promise<PlanState>;
  startCheckout(req:CheckoutRequest):Promise<{url?:string;message:string}>;
};

export const localBillingProvider:BillingProvider={
  async getPlan(){return defaultPlan();},
  async startCheckout(){return {message:'გადახდის სისტემა მალე დაემატება. ახლა შეგიძლია დაგვიკავშირდე ან დაელოდო გააქტიურებას.'};}
};
