import {useEffect,useRef} from 'react';
export const useDialogFocus=(open:boolean,onClose?:()=>void)=>{
  const ref=useRef<HTMLDivElement>(null),close=useRef(onClose);close.current=onClose;
  useEffect(()=>{
    if(!open)return;
    const previous=document.activeElement as HTMLElement;
    const frame=requestAnimationFrame(()=>ref.current?.focus());
    const key=(e:KeyboardEvent)=>{
      if(!ref.current)return;
      // Nested dialogs handle their own keyboard controls.
      const dialogs=document.querySelectorAll('[role="dialog"][aria-modal="true"]');
      if(dialogs.length&&dialogs[dialogs.length-1]!==ref.current)return;
      if(e.key==='Escape'&&close.current){e.preventDefault();close.current();}
      if(e.key==='Tab'){
        const items=Array.from(ref.current.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]')).filter(el=>el.getClientRects().length);
        const first=items[0],last=items.at(-1);
        if(!first){e.preventDefault();return;}
        if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last?.focus();}
        else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===ref.current)){e.preventDefault();first.focus();}
      }
    };
    document.addEventListener('keydown',key);return()=>{cancelAnimationFrame(frame);document.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus();};
  },[open]);
  return ref;
};