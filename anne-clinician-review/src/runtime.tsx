import React,{useSyncExternalStore,useState} from 'react';
import { toast } from 'sonner';
import {useMutation} from '@tanstack/react-query';
import { riley, jordan, messages } from './fixtures';
const initialRoute=()=>{const path=decodeURIComponent(location.hash.slice(1)||'/auth/login');return path.startsWith('/review/')?'/auth/register':path;};
let route=initialRoute();
let history:string[]=[];
const listeners=new Set<()=>void>();
export function navigate(to:string,replace=false){if(to==='/app/groups/102'&&user.roles.includes('mentor'))to='/demo/resources';if(to==='/app/home'&&!user.isVerified)to='/demo/matching';if(!to.startsWith('/')){toast.info('External links are disabled for this local demo.');return;}if(!replace)history.push(route);route=to;location.hash=encodeURI(to);listeners.forEach(fn=>fn());window.scrollTo({top:0});}
window.addEventListener('hashchange',()=>{route=initialRoute();listeners.forEach(fn=>fn());});
export function useRoute(){return useSyncExternalStore(fn=>{listeners.add(fn);return()=>listeners.delete(fn);},()=>route);}
const router={push:(to:string)=>navigate(to),replace:(to:string)=>navigate(to,true),back:()=>navigate(history.pop()||'/app/home',true),refresh:()=>{}};
export const useRouter=()=>router;
export const usePathname=()=>useRoute().split('?')[0];
export const useSearchParams=()=>new URLSearchParams(useRoute().split('?')[1]||'');
export const useParams=()=>({id:useRoute().split('/')[3],sid:'review-jordan',roomId:'simulation'});
export function Link({href,children,...props}:any){return <a {...props} href={'#'+href} onClick={e=>{e.preventDefault();navigate(typeof href==='string'?href:href.pathname);}}>{children}</a>;}
export function Image({fill,priority,sizes,unoptimized,...props}:any){return <img {...props}/>;}
let user:any={...riley};
const authListeners=new Set<()=>void>();
const publish=()=>authListeners.forEach(fn=>fn());
const store={get user(){return user;},token:'fictional-review-token',getToken:async()=>null,setAuth:(_token:string,next:any)=>{user=next;publish();},clearAuth:()=>{user={...riley};publish();navigate('/auth/register');}};
export function resetAuth(){user={...riley};publish();}
export function useAuthStore(selector?:any){const value=useSyncExternalStore(fn=>{authListeners.add(fn);return()=>authListeners.delete(fn);},()=>user);const s={...store,user:value};return selector?selector(s):s;}
useAuthStore.getState=()=>store;
export function useAuth(){const auth=useAuthStore();const loginMutation=useMutation({mutationFn:async(data:any)=>{if(data.portal==='mentor')return {...riley,...jordan,email:'jordan@example.invalid',roles:['mentor'],isVerified:true};return {...riley,isVerified:riley.onboardingStatus==='complete'};},onSuccess:next=>{store.setAuth('fictional-demo-token',next);navigate(next.roles.includes('mentor')?'/app/groups':next.isVerified?(riley.userTier==='free'?'/app/groups':'/app/home'):riley.userTier==='free'?'/demo/matching':'/app/onboarding-survey');},onError:(error:Error)=>toast.info(error.message)});return {...auth,isAdmin:false,logout:store.clearAuth,loginMutation};}
export function useTwilio(){return {client:null,status:'ready'};}
export function useMessages(sid:string|null){const [local,setLocal]=useState(()=>[...messages]);return {messages:local,loading:false,loadingMore:false,hasMore:false,loadMore:()=>{},sendMessage:async(body:string)=>{const message={sid:'review-'+Date.now(),author:riley.id,body,dateCreated:new Date().toISOString(),moderationStatus:'visible',moderationReason:null};messages.push(message);setLocal([...messages]);toast.info('Simulation: message stays in this browser. Jordan will not receive it.');}};}
export function useUpload(){return {uploading:false,uploadFile:async()=>{throw new Error('Uploads are outside this review.');}};}
// Extra imports are intentionally impossible: no auth provider, real-time client or API transport.
