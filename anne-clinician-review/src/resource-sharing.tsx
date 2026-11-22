import React,{useEffect,useState} from 'react';
import {ArrowLeft,BookOpen,Check,Plus,Search,Send,Users,X,ImageIcon,Clapperboard,Video} from 'lucide-react';
import {Card,CardContent} from '../source/apps/web/src/components/ui/card';
import {Button} from '../source/apps/web/src/components/ui/button';
import {Input} from '../source/apps/web/src/components/ui/input';
import {Avatar} from '../source/apps/web/src/components/ui/avatar';
import {PostCard} from '../source/apps/web/src/components/feed/post-card';
import type {AuthUser,PostResponse} from '../source/packages/shared/src/index';
import {sampleResources,samplePrefix,type SampleResource} from './sample-resources';
import {ResourceCard,ResourceMeta,SponsorDisclosure} from './resource-ui';
import {riley,jordan,maya,addDemoResourcePost} from './fixtures';
import {useAuthStore} from './runtime';

type View='circle'|'compose'|'search'|'preview'|'teen';
const mentor:AuthUser={...riley,...jordan,roles:['mentor' as any],isVerified:true};
const stamp=new Date().toISOString();
const scenePost=(id:number,author:any,content:string):PostResponse=>({id,groupId:102,groupName:'Finding our footing',content,mediaUrl:null,sharpenReference:null,createdBy:author.id,authorUsername:author.username,authorFirstName:author.firstName,authorLastName:author.lastName,authorProfilePictureUrl:null,replies:[],likesCount:0,lastLikeUsername:null,isLiked:false,createdAt:stamp,moderationStatus:'visible',moderationReason:null});
const discussion=[scenePost(8201,riley,'I keep hearing about saving for college. It feels so far away, but also like I should already have it figured out.'),scenePost(8202,maya,'Same. I would love to know what questions to ask first. It can feel awkward to bring up money.')];

export function ResourceSharingJourney(){
 const [view,setView]=useState<View>('circle');
 const [draft,setDraft]=useState('');
 const [query,setQuery]=useState('');
 const [selected,setSelected]=useState<SampleResource|null>(null);
 const [preview,setPreview]=useState<SampleResource|null>(null);
 const [teenMode,setTeenMode]=useState(false);
 const [teenDraft,setTeenDraft]=useState('');
 const [teenPosts,setTeenPosts]=useState<PostResponse[]>([]);
 const [published,setPublished]=useState<PostResponse|null>(null);
 useEffect(()=>{const previous=useAuthStore.getState().user;useAuthStore.getState().setAuth('fictional-demo-token',mentor);return()=>useAuthStore.getState().setAuth('fictional-demo-token',previous);},[]);
 useEffect(()=>{window.scrollTo({top:0});if(view==='compose')document.getElementById('resource-post-draft')?.focus();if(view==='preview')document.getElementById('resource-preview-heading')?.focus();},[view]);
 useEffect(()=>{if(view!=='compose'&&view!=='search')return;const key=(event:KeyboardEvent)=>{if(event.key==='Escape'){if(view==='search')setView('compose');else cancelPost();return;}if(event.key==='Tab'){const controls=Array.from(document.querySelectorAll<HTMLElement>(view==='search'?'.resource-picker button:not(:disabled),.resource-picker input':'.resource-sheet button:not(:disabled),.resource-sheet textarea'));const first=controls[0],last=controls[controls.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}};document.addEventListener('keydown',key);return()=>document.removeEventListener('keydown',key);},[view,teenMode]);
 const cancelPost=()=>{if(teenMode)setTeenDraft('');else{setDraft('');setSelected(null);setPreview(null);setQuery('');}setView(teenMode?'teen':'circle');};
 const go=(next:View)=>setView(next);
 const terms=query.toLowerCase().trim().split(/\s+/).filter(Boolean);
 const matches=sampleResources.filter(resource=>terms.every(term=>[resource.title,resource.description,resource.provider,...resource.tags].join(' ').toLowerCase().includes(term)));
 const publish=()=>{if(teenMode){if(!teenDraft.trim())return;const post=scenePost(Date.now(),riley,teenDraft.trim());addDemoResourcePost(post);setTeenPosts(p=>[post,...p]);setTeenDraft('');go('teen');return;}if(!draft.trim()||!selected)return;const post={...scenePost(Date.now(),jordan,draft.trim()),sharpenReference:samplePrefix+selected.id};addDemoResourcePost(post);setPublished(post);setTeenMode(true);useAuthStore.getState().setAuth('fictional-demo-token',{...riley,isVerified:true});go('teen');};

 return <section className="resource-journey">
  <header className="resource-circle-header"><ArrowLeft size={22}/><div><h1 className="text-2xl font-bold">Finding our footing</h1><p className="flex items-center gap-1 text-sm text-muted-foreground"><Users size={14}/>4 members</p></div><Button variant="outline" className="circle-icon" aria-label="Video call" disabled><Video size={20}/></Button>{view==='circle'||view==='teen'?<Button variant="outline" className="circle-icon" aria-label="New Post" onClick={()=>go('compose')}><Plus size={24}/></Button>:null}</header>
  {view==='circle'?<>{discussion.map(post=><PostCard key={post.id} post={post}/>)}</>:null}
  {view==='compose'?<div className="resource-sheet-backdrop"><div className="resource-sheet" role="dialog" aria-modal="true" aria-labelledby="new-post-heading"><div className="resource-sheet-handle"/><header className="resource-sheet-header"><Button variant="ghost" size="icon" aria-label="Close New Post" onClick={cancelPost}><X size={25}/></Button><h2 id="new-post-heading">New Post</h2><Button variant="outline" size="icon" className="circle-icon" aria-label="Publish post" disabled={teenMode?!teenDraft.trim():!draft.trim()||!selected} onClick={publish}><Send size={22}/></Button></header><div className="resource-sheet-body"><label className="sr-only" htmlFor="resource-post-draft">Your introduction or discussion question</label><textarea id="resource-post-draft" className="resource-composer" placeholder="What's on your mind?" rows={6} value={teenMode?teenDraft:draft} onChange={e=>teenMode?setTeenDraft(e.target.value):setDraft(e.target.value)}/>{!teenMode&&selected?<div className="resource-selected"><BookOpen size={32}/><div><strong>{selected.title}</strong><p>{selected.provider} · {selected.format}</p></div><Button variant="ghost" size="icon" aria-label="Remove resource" onClick={()=>setSelected(null)}><X size={20}/></Button></div>:null}</div><footer className="resource-sheet-toolbar"><Button variant="ghost" size="icon" disabled aria-label="Add photo"><ImageIcon size={25}/></Button>{!teenMode&&!selected?<Button variant="ghost" onClick={()=>go('search')}><Clapperboard size={25}/>Add a resource</Button>:null}</footer></div></div>:null}
  {view==='search'?<div className="resource-sheet-backdrop"><div className="resource-picker" role="dialog" aria-modal="true" aria-labelledby="resource-picker-title"><header className="resource-picker-header"><Button variant="ghost" size="icon" aria-label="Close resources" onClick={()=>go('compose')}><X size={24}/></Button><h2 id="resource-picker-title">Resources</h2><span/></header><div className="resource-picker-body"><label htmlFor="resource-search" className="sr-only">Search resources</label><div className="resource-picker-search"><Search size={20}/><Input id="resource-search" autoFocus placeholder="Search resources" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="resource-result-list" aria-label="Combined resource results">{matches.map(resource=><Button key={resource.id} variant="outline" className="resource-picker-row" onClick={()=>{setPreview(resource);go('preview');}}><span className="resource-picker-thumb" aria-hidden="true">{resource.format==='Video'?<Clapperboard size={30}/>:<BookOpen size={30}/>}</span><span className="resource-picker-copy"><h3>{resource.title}</h3><span className="resource-picker-meta"><span>{resource.provider.replace(' (fictional)','')}</span><span> · </span><span>{resource.format}</span>{resource.sponsoredExample?<span> · Sponsored</span>:null}</span><span className="resource-picker-description">{resource.description}</span></span></Button>)}</div></div></div></div>:null}
  {view==='preview'&&preview?<><div className="resource-page-title"><Button variant="ghost" size="sm" onClick={()=>go('search')}><ArrowLeft size={16}/>Back to search</Button><h2 id="resource-preview-heading" tabIndex={-1} className="text-xl font-bold">Resource preview</h2></div><Card><CardContent className="p-6 space-y-5"><ResourceMeta resource={preview}/><h3 className="text-2xl font-bold">{preview.title}</h3><p className="text-muted-foreground leading-6">{preview.description}</p><div><p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Destination</p><p className="resource-destination">{preview.destination}</p></div><SponsorDisclosure resource={preview}/><Button onClick={()=>{setSelected(preview);go('compose');}}><Check size={16}/>Attach resource</Button></CardContent></Card></>:null}
  {view==='teen'&&published?<>{teenPosts.map(post=><PostCard key={post.id} post={post}/>)}<PostCard post={published} commentsExpanded/></>:null}
 </section>;
}
