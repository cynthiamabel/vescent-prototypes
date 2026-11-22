import React from 'react';
import {SharpenAttachment as AppSharpenAttachment} from '../source/apps/web/src/components/feed/sharpen-attachment';
import {samplePrefix,sampleResourceById} from './sample-resources';
import {ResourceCard} from './resource-ui';
// Preserve existing Sharpen rendering; adapt only explicitly tagged prototype attachments.
export function SharpenAttachment({moduleId}:{moduleId:string}) {
  if(!moduleId.startsWith(samplePrefix))return <AppSharpenAttachment moduleId={moduleId}/>;
  const resource=sampleResourceById(moduleId.slice(samplePrefix.length));
  return resource?<ResourceCard resource={resource}/>:null;
}
