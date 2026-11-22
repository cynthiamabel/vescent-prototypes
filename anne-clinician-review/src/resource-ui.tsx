import React from 'react';
import {BookOpen,Play,ExternalLink} from 'lucide-react';
import {Card,CardContent} from '../source/apps/web/src/components/ui/card';
import {Button} from '../source/apps/web/src/components/ui/button';
import {sampleResourceById,type SampleResource} from './sample-resources';

export function ResourceMeta({resource}:{resource:SampleResource}) {
  const Icon=resource.format==='Video'?Play:BookOpen;
  return <div className="resource-meta"><span><Icon size={14}/>{resource.format}</span><span>{resource.provider.replace(' (fictional)','')}</span><span>{resource.length}</span></div>;
}
export function SponsorDisclosure({resource}:{resource:SampleResource}) {
  return resource.sponsoredExample?<div className="resource-sponsorship"><strong>Sponsored content</strong></div>:null;
}
export function ResourceCard({resource,onRemove,openable=true}:{resource:SampleResource;onRemove?:()=>void;openable?:boolean}) {
  const destination=location.pathname+location.search+'#/demo/resource-provider/'+resource.id;
  return <Card className="resource-attachment"><div className="resource-cover" aria-hidden="true"><BookOpen size={52}/><span>{resource.format==='Video'?'▶':'↗'}</span></div><CardContent className="p-4 space-y-3"><p className="resource-provider-name">{resource.provider.replace(' (fictional)','')}</p><ResourceMeta resource={resource}/><h3 className="font-semibold">{resource.title}</h3><p className="text-sm text-muted-foreground">{resource.description}</p><SponsorDisclosure resource={resource}/>{openable?<a href={destination} target="_blank" rel="noopener noreferrer" className="resource-provider-link">Open on {resource.provider.replace(' (fictional)','')} website <ExternalLink size={14}/></a>:null}<p className="resource-destination">{resource.destination}</p>{onRemove?<Button size="sm" variant="ghost" onClick={onRemove}>Remove resource</Button>:null}</CardContent></Card>;
}
export function ProviderDestination({id}:{id:string}) {
  const resource=sampleResourceById(id);
  if(!resource)return null;
  return <main className="provider-simulation"><div className="provider-address">{resource.destination}</div><Card><CardContent className="p-6 space-y-5"><ResourceMeta resource={resource}/><h1 className="text-3xl">{resource.title}</h1><SponsorDisclosure resource={resource}/><p>{resource.description}</p><Button onClick={()=>window.close()}>Back to Circle</Button></CardContent></Card></main>;
}
