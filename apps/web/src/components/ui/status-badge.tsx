import React from 'react';
import { Badge } from './badge';

export const StatusBadge = ({ status }: { status: string }) => {
  let variant: any = 'secondary';
  let label = status;
  
  const s = status.toLowerCase();
  if (s.includes('publish')) { 
    variant = 'success'; 
    label = 'Nashr etilgan'; 
  } else if (s.includes('review') || s === 'ready_for_review') {
    variant = 'default';
    label = 'Videoni ko\'rishga tayyor';
  } else if (s === 'awaiting_generation' || s.includes('draft') || s.includes('script_ready')) {
    variant = 'secondary';
    label = 'Generatsiyaga tayyor';
  } else if (s.includes('render') || s === 'generating' || s.includes('progress')) {
    variant = 'outline';
    label = 'Render qilinmoqda...';
  } else if (s.includes('approval') || s.includes('needs')) { 
    variant = 'destructive'; 
    label = 'Tasdiqlash kutilmoqda'; 
  } else if (s.includes('schedul')) { 
    variant = 'default'; 
    label = 'Rejalashtirilgan'; 
  } else if (s.includes('idea')) { 
    variant = 'secondary'; 
    label = 'G\'oya'; 
  }
  
  return <Badge variant={variant}>{label}</Badge>;
};
