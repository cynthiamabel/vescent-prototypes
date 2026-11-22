// Prototype-only data adapter. No request is made to Vescent or its providers.
export * from '../source/packages/shared/src/index';
import { toast } from 'sonner';
import survey from '../source/apps/api/app/core/onboarding_questions.json';
import type { AuthUser, PostResponse, GroupResponse, TwilioMessage } from '../source/packages/shared/src/index';

export const riley: AuthUser = {id:'fictional-riley',username:'riley_demo',email:'riley@example.invalid',firstName:'Riley',lastName:'Demo',roles:['user' as any],userTier:'premium' as any,profilePictureUrl:null,grade:10,state:'KY',timezone:'America/New_York',assignedMentorUserId:'fictional-jordan',onboardingStatus:'complete',onboardingComplete:true,accountStatus:'active',suspended:false,isVerified:true};
const originalRiley={...riley};
export function setDemoProfile(profile:any){for(const k of ['firstName','lastName','username','email','grade','state','timezone','userTier'])if(profile[k]!==undefined)(riley as any)[k]=profile[k];riley.onboardingStatus=riley.userTier==='free'?'not_required':'survey_pending';groups[0].name=riley.firstName+' + Jordan';for(const g of groups)g.members=g.members.map(m=>m.id===riley.id?{...m,...riley,memberRole:'user'}:m);}
export const jordan = {id:'fictional-jordan',username:'jordan_mentor_demo',firstName:'Jordan',lastName:'Demo',profilePictureUrl:null};
export const maya = {id:'fictional-maya',username:'maya_demo',firstName:'Maya',lastName:'Demo',profilePictureUrl:null};
const stamp = new Date().toISOString();
export const support = {type:'self_harm_support',title:'You are not alone',message:'If you might hurt yourself, reach out to a parent, mentor, trusted adult, or local emergency services now.',cards:[{label:'Talk to a trusted adult',body:'Find a parent, guardian, teacher, coach, or mentor nearby and tell them plainly what is going on.'},{label:'Message your mentor',body:'Send a message to your mentor or a Vescent admin. Messaging limits do not apply to safety conversations.'},{label:'Immediate danger',body:'If there is immediate danger, call local emergency services now.'}]};
const member = (person:any, role='user') => ({...person,userTier:role==='user'?'premium':null,memberRole:role,timezone:'America/New_York'});
export const groups:GroupResponse[] = [
 {id:101,name:'Riley + Jordan',groupType:'direct_mentor',memberCount:2,members:[member(riley),member(jordan,'mentor')]},
 {id:102,name:'Finding our footing',groupType:'mentor_circle',memberCount:4,members:[member(riley),member(jordan,'mentor'),member(maya),member({...maya,id:'fictional-sam',firstName:'Sam',username:'sam_demo'})]},
 {id:103,name:'General Circle',groupType:'general',memberCount:8,members:[member(riley),member(jordan,'mentor'),member(maya)]}
].map((g:any)=>({...g,description:'Fictional demo Circle',pictureUrl:null,status:'active',isPublic:g.groupType==='general',isPredefined:true,userCount:g.memberCount-1,basicUserCount:0,premiumUserCount:g.memberCount-1,freeUserCount:0,mentorCount:1,weeklyMeetingCount:g.id===103?0:1,timezoneSpread:'America/New_York',mentorLeaders:g.id===103?[]:[jordan],meetingSchedules:g.id===103?[]:[{id:g.id,label:'Weekly check-in',recurrence:'weekly',weekdayUtc:3,startTimeUtc:'21:00:00',durationMinutes:30,status:'active',isVideoAvailable:false}],pendingMeetingRequests:[],isMember:true,isPendingMember:false,callRoomName:'simulation-only',lastActive:stamp,createdAt:stamp}));
const post = (id:number,gid:number,person:any,content:string,resource:string|null=null):PostResponse => ({id,groupId:gid,groupName:groups.find(g=>g.id===gid)!.name,content,mediaUrl:null,sharpenReference:resource,createdBy:person.id,authorUsername:person.username,authorFirstName:person.firstName,authorLastName:person.lastName,authorProfilePictureUrl:null,replies:[],likesCount:0,lastLikeUsername:null,isLiked:false,createdAt:stamp,moderationStatus:'visible',moderationReason:null});
const initialPosts = () => [post(201,101,jordan,'Hi Riley. What would you like to talk about at our next check-in? You can share as much or as little as you want.'),post(202,102,jordan,'What is one small thing that made your week feel a little easier? I liked walking outside between classes.'),post(203,102,maya,'I tried sitting with someone new at lunch. It felt awkward at first, but I am glad I said hello.'),post(204,103,maya,'My small win this week: I asked a teacher for help instead of trying to figure everything out alone.'),post(205,101,jordan,'Here is a sample resource we can discuss at our next check-in. No need to finish it before we talk.','901')];
export let posts=initialPosts();
export let blocked = new Set<string>();
export const reports:any[]=[];
const initialMessages = ():TwilioMessage[] => [{sid:'sample-1',author:jordan.id,body:'Hi Riley. How has settling into the new semester been?',dateCreated:stamp,moderationStatus:'visible',moderationReason:null},{sid:'sample-2',author:riley.id,body:'Mostly okay. Lunch is still a little awkward. I never know where to sit.',dateCreated:stamp,moderationStatus:'visible',moderationReason:null},{sid:'sample-3',author:jordan.id,body:'That sounds uncomfortable. Would you like to talk through one small step you could try, or would you rather I just listen today?',dateCreated:stamp,moderationStatus:'visible',moderationReason:null}];
export let messages=initialMessages();
export function resetFixtures(){Object.assign(riley,originalRiley);groups[0].name='Riley + Jordan';posts=initialPosts();blocked=new Set();reports.length=0;messages=initialMessages();settings={...initialSettings};}
const page=(items:any[])=>({items,page:1,pageSize:50,total:items.length,hasNextPage:false,nextPageToken:null});
const search=(items:any[],q='')=>items.filter(i=>JSON.stringify(i).toLowerCase().includes(q.toLowerCase()));
const simulated=(what:string)=>{};
export const getOnboardingSurvey=async()=>({version:'2026-09-v2',questions:survey.questions});
export const submitOnboardingSurvey=async()=>{return {...riley,isVerified:false};};
export const getHome=async()=>({newForYou:[{id:'new-message',kind:'message',title:'A new message from Jordan',summary:'Would you like to talk through one small step, or would you rather I just listen today?',meta:'direct message',groupId:101,groupName:'Jordan',postId:0,targetType:'conversation',targetId:'review-jordan',conversationSid:'review-jordan',imageUrl:null,createdAt:stamp},{id:'new-circle',kind:'post',title:'A new check-in from Jordan',summary:riley.userTier==='premium'?'Open your private mentor Circle.':'Open your shared mentor Circle.',meta:riley.userTier==='premium'?'private circle':'shared circle',groupId:riley.userTier==='premium'?101:102,groupName:riley.userTier==='premium'?groups[0].name:groups[1].name,postId:201,targetType:'group',targetId:riley.userTier==='premium'?'101':'102',conversationSid:null,imageUrl:null,createdAt:stamp},{id:'new-shared',kind:'post',title:'Small wins, together',summary:'Maya shared something that helped this week.',meta:'shared circle',groupId:102,groupName:'Finding our footing',postId:203,targetType:'post',targetId:'203',conversationSid:null,imageUrl:null,createdAt:stamp}],gratitude:{id:1,contentType:'gratitude',label:'A small moment',title:'Notice something that helped',body:'A friendly hello. A song you love. A moment to pause. Small things count, too.',ctaLabel:null,ctaAction:null},quickRead:{id:2,contentType:'quick_read',label:'Sample content',title:'Making room for a small next step',body:'Open a fictional resource shared by your mentor.',ctaLabel:'Open resource',ctaAction:{type:'route',route:'/app/posts/205'}}});
export const getMyGroups=async({search:q=''}={})=>page(search(groups.filter(g=>g.groupType==='general'||riley.userTier==='premium'||(riley.userTier==='basic'&&g.groupType==='mentor_circle')),q));
export const getMyGeneralGroup=async()=>groups[2];
export const getGroup=async(id:number)=>groups.find(g=>g.id===id);
export const getGroupMembers=async(id:number,{search:q=''}={})=>page(search((groups.find(g=>g.id===id)?.members??[]).filter(m=>!blocked.has(m.id)),q));
export const getGroupPosts=async(id:number)=>page(posts.filter(p=>p.groupId===id&&!blocked.has(p.createdBy)));
export const getPost=async(id:number)=>posts.find(p=>p.id===id&&!blocked.has(p.createdBy));
export const createPost=async(data:any)=>{const p=post(Date.now(),data.groupId||103,riley,data.content||'',data.sharpenReference);posts=[p,...posts];simulated('post added');return p;};
export const createReply=async(id:number,data:any)=>{const reply={id:Date.now(),postId:id,content:data.content,createdBy:riley.id,authorUsername:riley.username,authorFirstName:riley.firstName,authorLastName:riley.lastName,authorProfilePictureUrl:null,createdAt:new Date().toISOString(),likesCount:0,isLiked:false,moderationStatus:'visible',moderationReason:null};posts=posts.map(p=>p.id===id?{...p,replies:[...p.replies,reply]}:p);simulated('reply added');return reply;};
export const deleteReply=async(id:number)=>{posts=posts.map(p=>({...p,replies:p.replies.filter(r=>r.id!==id)}));simulated('sample reply deleted');};
export const getSafetyReportReasons=async()=>[{code:'other',label:'Other safety concern'},{code:'harassment_or_abuse',label:'Harassment or abuse'},{code:'adult_minor_boundary',label:'Boundary concern'},{code:'self_harm_risk',label:'Risk of self-harm'}];
export const createSafetyReport=async(data:any)=>{reports.push({...data,id:reports.length+1});simulated('report recorded in this demo only; no safety team notified');return {id:reports.length,safetyCaseId:reports.length};};
export const blockUser=async({blockedUserId}:any)=>{blocked.add(blockedUserId);simulated('fictional user blocked');return {blocked:true};};
export const listBlockedUsers=async()=>[jordan,maya].filter(p=>blocked.has(p.id)).map(p=>({...p,userId:p.id}));
export const unblockUser=async(id:string)=>{blocked.delete(id);simulated('fictional user unblocked');};
export const listConversations=async()=>page(blocked.has(jordan.id)?[]:[{conversationSid:'review-jordan',friendlyName:'Jordan Demo',participants:[riley,jordan],unreadCount:0,lastMessageBody:messages.at(-1)?.body,lastMessageDate:stamp,created:true,blocked:false}]);
export const searchUsers=async({search:q=''}={})=>page(search([jordan,maya].filter(p=>!blocked.has(p.id)),q));
export const createConversation=async()=>{simulated('sample conversation opened');return {conversationSid:'review-jordan',created:true};};
export const createConversationVideoRoom=async()=>({id:'simulation'});
export const createGroupVideoRoom=async()=>({id:'simulation'});
export const proposeGroupMeeting=async()=>{throw new Error('Meeting requests are outside this teen review. No request was sent.');};
export const approveMeetingRequestAsMentor=async()=>{throw new Error('Mentor approval is outside this review.');};
export const denyMeetingRequestAsMentor=approveMeetingRequestAsMentor;
export const recordUsageEvent=async()=>({tracked:false});
export const getSharpenModule=async()=>({id:901,title:'Sample reflection: a small next step',description:'Fictional sample resource for this demo.',intro:[{id:1,type:'paragraph',value:'Sometimes it helps to name what you would like to discuss. This sample shows how a mentor-shared resource opens inside Vescent.'}],body:{id:1,body:[{id:2,type:'section_heading',value:'Something to bring to your check-in'},{id:3,type:'paragraph',value:'Think of one moment from your week that you might want to talk about. You do not have to write it down or share it here.'}]},outro:[{id:4,type:'paragraph',value:'You can bring this up at your next mentor check-in.'}],bannerImage:null,videos:[]});
export const searchSharpenCatalog=async()=>({items:[]});
export const trackSharpenModuleView=async()=>({tracked:false});
export const getNotification=async()=>({id:301,title:'Your content is under review',body:'Simulated safety notice. No content was submitted and no safety case was opened.',metadataJson:{categories:['self_harm_risk'],removedContentType:'message',removalReason:'Fictional safety scenario supplied by the prototype.',intervention:support}});
const initialSettings={notificationsEnabled:true,pushNotificationsEnabled:true,notifyRepliesEnabled:true,notifyReactionsEnabled:true,notifyMessagesEnabled:true,notifyMeetingsEnabled:true,notifyCallsEnabled:true,notifyAccountEnabled:true,notifyNudgesEnabled:true};
let settings={...initialSettings};
export const getUserSettings=async()=>settings;
export const updateUserSettings=async(data:any)=>{settings={...settings,...data};simulated('settings updated');return settings;};
export const apiRequest=async(path:string,options:any={})=>{if(path==='/api/v1/user-profiles/'&&options.method==='PUT'){simulated('fictional profile updated');return {...riley,...JSON.parse(options.body)};}throw new Error('This action is outside the review. No live service was contacted.');};
export const changePassword=async()=>{throw new Error('There is no real account or password in this review.');};

// Prototype-only insertion, for the resource-sharing journey.
export function addDemoResourcePost(post:PostResponse){posts=[post,...posts];}
