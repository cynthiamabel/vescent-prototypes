import React from 'react';
import {Users} from 'lucide-react';
import {GroupCard as AppGroupCard} from '../source/apps/web/src/components/groups/group-card';
import {Card,CardContent} from '../source/apps/web/src/components/ui/card';
import {Button} from '../source/apps/web/src/components/ui/button';
import {Avatar} from '../source/apps/web/src/components/ui/avatar';
import {Badge} from '../source/apps/web/src/components/ui/badge';
import {navigate} from './runtime';
export function GroupCard({group}:any){
 if(group.groupType!=='general')return <AppGroupCard group={group}/>;
 return <Card><Button variant="ghost" className="h-auto w-full justify-start p-0 text-left whitespace-normal" onClick={()=>navigate(`/app/groups/${group.id}`)}><CardContent className="pt-4 w-full"><div className="flex items-start gap-3"><Avatar username={group.name} size="md"/><div className="min-w-0 flex-1"><div className="flex items-center gap-2 flex-wrap mb-1"><span className="font-semibold text-sm">{group.name}</span><Badge variant="secondary" className="text-xs">{group.memberCount} Members</Badge></div><div className="flex items-center gap-1 text-xs text-muted-foreground mb-2"><Users className="h-3 w-3"/><span>All members</span></div><p className="text-xs font-normal text-muted-foreground">A shared space for everyone on Vescent.</p></div></div></CardContent></Button></Card>;
}
