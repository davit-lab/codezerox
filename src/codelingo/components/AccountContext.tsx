import {createContext,useContext,useEffect,useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import type {AuthSession} from '../lib/auth';

// Codelingo shares the CodeZero account: same auth session, same users.
type Account={configured:boolean;session:AuthSession|null;loading:boolean;recovery:boolean;error:string;remember:boolean;setRemember:(value:boolean)=>void;signIn:(email:string,password:string)=>Promise<void>;signUp:(email:string,password:string,name:string)=>Promise<boolean>;recover:(email:string)=>Promise<void>;resend:(email:string)=>Promise<void>;changePassword:(password:string)=>Promise<void>;logout:()=>Promise<void>;request:<T>(path:string,method?:string,body?:unknown)=>Promise<T>};
const Context=createContext<Account|null>(null);
export const useAccount=()=>{const value=useContext(Context);if(!value)throw new Error('Account provider missing');return value;};
const toSession=(s:any):AuthSession|null=>s?{access_token:s.access_token,refresh_token:s.refresh_token,expires_at:s.expires_at??0,user:{id:s.user.id,email:s.user.email}}:null;
const URL_BASE=import.meta.env.VITE_SUPABASE_URL as string;
const KEY=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
export function AccountProvider({children}:{children:React.ReactNode}){
 const [session,setSession]=useState<AuthSession|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(toSession(s)));supabase.auth.getSession().then(({data})=>{setSession(toSession(data.session));setLoading(false);});return()=>subscription.unsubscribe();},[]);
 const fail=(e:{message:string}|null)=>{if(e){setError(e.message);throw new Error(e.message);}};
 const signIn=async(email:string,password:string)=>{const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});fail(error);setError('');};
 const signUp=async(email:string,password:string,name:string)=>{const {data,error}=await supabase.auth.signUp({email:email.trim(),password,options:{data:{full_name:name.trim()},emailRedirectTo:window.location.origin+'/codelingo'}});fail(error);return !!data.session;};
 const recover=async(email:string)=>{const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+'/auth'});fail(error);};
 const resend=async(email:string)=>{const {error}=await supabase.auth.resend({type:'signup',email:email.trim()});fail(error);};
 const changePassword=async(password:string)=>{const {error}=await supabase.auth.updateUser({password});fail(error);};
 const logout=async()=>{await supabase.auth.signOut();};
 const request=async<T,>(path:string,method='GET',body?:unknown):Promise<T>=>{const {data}=await supabase.auth.getSession();if(!data.session)throw new Error('ჯერ ანგარიშში შემოდი.');const res=await fetch(URL_BASE+path,{method,headers:{apikey:KEY,Authorization:'Bearer '+data.session.access_token,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});const text=await res.text();const json=text?JSON.parse(text):null;if(!res.ok)throw new Error(json?.message||'მოთხოვნა ვერ შესრულდა.');return json as T;};
 return <Context.Provider value={{configured:true,session,loading,recovery:false,error,remember:true,setRemember:()=>{},signIn,signUp,recover,resend,changePassword,logout,request}}>{children}</Context.Provider>;
}
