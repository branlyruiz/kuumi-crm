import {createContext,useContext,useEffect,useLayoutEffect,useRef,useState,type ReactNode} from 'react';

export const reducedMotion=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export type Appearance='system'|'light'|'dark';
export function useAppearance(){
 const [appearance,setAppearance]=useState<Appearance>(()=>{try{const value=localStorage.getItem('kuumi-crm-appearance');return value==='dark'||value==='light'?value:'system';}catch{return 'system';}});
 useEffect(()=>{const media=window.matchMedia('(prefers-color-scheme: dark)');const apply=()=>{const dark=appearance==='dark'||appearance==='system'&&media.matches;document.documentElement.dataset.theme=dark?'dark':'light';document.querySelector('meta[name="theme-color"]')?.setAttribute('content',dark?'#17131e':'#f7f5fa');};apply();media.addEventListener('change',apply);return()=>media.removeEventListener('change',apply);},[appearance]);
 function choose(value:Appearance){setAppearance(value);try{localStorage.setItem('kuumi-crm-appearance',value);}catch{/* Appearance remains usable for this session when storage is unavailable. */}}
 return [appearance,choose] as const;
}

// Retain the dialog during its exit so native focus restoration happens after motion.
export function Presence({present,children}:{present:boolean,children:ReactNode}){
 const [mounted,setMounted]=useState(present),last=useRef(children);
 useLayoutEffect(()=>{if(present){last.current=children;setMounted(true);}},[present,children]);
 useEffect(()=>{if(!present){if(reducedMotion()){setMounted(false);return;}const timeout=setTimeout(()=>setMounted(false),280);return()=>clearTimeout(timeout);}},[present]);
 return present||mounted?<div className="overlay-presence" data-exiting={!present||undefined}>{present?children:last.current}</div>:null;
}
let modalCount=0, originalOverflow='';
export function Modal({children,onClose,label}:{children:ReactNode,onClose:()=>void,label:string}){
 const ref=useRef<HTMLDialogElement>(null),start=useRef<{x:number,y:number}|null>(null);
 useEffect(()=>{const dialog=ref.current,previous=document.activeElement as HTMLElement|null;dialog?.showModal();dialog?.querySelector<HTMLElement>('[data-initial-focus]')?.focus({preventScroll:true});if(modalCount++===0){originalOverflow=document.body.style.overflow;document.body.style.overflow='hidden';}return()=>{dialog?.close();if(--modalCount===0)document.body.style.overflow=originalOverflow;if(previous?.isConnected)previous.focus({preventScroll:true});};},[]);
 return <dialog ref={ref} className="sheet" aria-label={label} onCancel={e=>{e.preventDefault();onClose();}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><button type="button" className="sheet-handle" aria-label={'Desliza o toca para cerrar '+label.toLowerCase()} onClick={onClose} onTouchStart={e=>{start.current={x:e.touches[0].clientX,y:e.touches[0].clientY};}} onTouchEnd={e=>{if(!start.current)return;const dx=e.changedTouches[0].clientX-start.current.x,dy=e.changedTouches[0].clientY-start.current.y;start.current=null;if(dy>60&&dy>Math.abs(dx)*1.5)onClose();}}><span/></button>{children}</dialog>;
}

// FLIP moves existing records to their new positions without re-mounting their state.
export function useListMotion(){
 const ref=useRef<HTMLDivElement>(null),previous=useRef(new Map<string,{x:number,y:number}>());
 useLayoutEffect(()=>{const next=new Map<string,{x:number,y:number}>();ref.current?.querySelectorAll<HTMLElement>('[data-order-id]').forEach(el=>{const rect=el.getBoundingClientRect(),position={x:rect.left+window.scrollX,y:rect.top+window.scrollY},old=previous.current.get(el.dataset.orderId!);next.set(el.dataset.orderId!,position);if(old&&!reducedMotion()){const x=old.x-position.x,y=old.y-position.y;if(Math.abs(x)+Math.abs(y)>1)el.animate([{transform:`translate(${x}px,${y}px)`},{transform:'translate(0,0)'}],{duration:240,easing:'cubic-bezier(.2,.7,.2,1)'});}});previous.current=next;});
 return ref;
}
export function LoadingCards(){return <div className="loading-cards" role="status" aria-label="Cargando pedidos" aria-busy="true">{[0,1,2].map(i=><div className="skeleton-card" key={i}><span/><span/><span/></div>)}<span className="sr-only">Cargando pedidos…</span></div>;}


type ConfirmRequest={message:string,resolve:(value:boolean)=>void};
const ConfirmContext=createContext<(message:string)=>Promise<boolean>>(()=>Promise.resolve(false));
export const useConfirm=()=>useContext(ConfirmContext);
export function ConfirmProvider({children}:{children:ReactNode}){
 const [request,setRequest]=useState<ConfirmRequest|null>(null);
 const ask=(message:string)=>new Promise<boolean>(resolve=>setRequest({message,resolve}));
 const answer=(value:boolean)=>{request?.resolve(value);setRequest(null);};
 return <ConfirmContext.Provider value={ask}>{children}<Presence present={!!request}>{request&&<Modal label="Confirmar acción" onClose={()=>answer(false)}><div className="confirmation"><h2>¿Continuar?</h2><p>{request.message}</p><div><button className="secondary" data-initial-focus onClick={()=>answer(false)}>Volver</button><button className="primary" onClick={()=>answer(true)}>Confirmar</button></div></div></Modal>}</Presence></ConfirmContext.Provider>;
}
