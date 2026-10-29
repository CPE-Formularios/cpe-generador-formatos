// Componente reusable de anexos y firmas. Datos exclusivamente en memoria.
const style=document.createElement('style');style.textContent=`.capture-list{display:grid;gap:12px;margin:12px 0}.capture-entry{padding:12px;border:1px solid #c6dce7;border-radius:10px;background:#fff}.capture-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.capture-entry input{max-width:100%}.capture-entry img{max-width:240px;max-height:160px;object-fit:contain;display:block;margin-top:9px}.capture-entry canvas{width:100%;max-width:520px;height:100px;display:block;border:1px dashed #8eb5c8;touch-action:none;background:white;margin:8px 0;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;cursor:crosshair}.capture-entry .field{margin:8px 0}.capture-signing-area{user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}.capture-camera-panel video{display:block;width:min(100%,480px);max-height:360px;margin-top:10px;border-radius:8px;background:#102f43}.capture-button{border:0;border-radius:8px;padding:9px 13px;cursor:pointer;background:#e3f2f8;color:#00517e;font-weight:700}@media print{.capture-entry{display:none}}`;document.head.append(style);
let counter=0;
export function createGallery(container,{label='Fotografía'}={}){
 const list=document.createElement('div');list.className='capture-list';container.append(list);
 const btn=document.createElement('button');btn.type='button';btn.className='capture-button';btn.textContent='＋ Agregar fotografía';container.append(btn);
 const items=new Map();
 function add(){
  const id=++counter,row=document.createElement('div');row.className='capture-entry';
  const title=document.createElement('strong');title.textContent=label+' '+(items.size+1);
  const cameraInput=document.createElement('input');cameraInput.type='file';cameraInput.accept='image/*';cameraInput.setAttribute('capture','environment');cameraInput.hidden=true;
  const galleryInput=document.createElement('input');galleryInput.type='file';galleryInput.accept='image/*';galleryInput.hidden=true;
  const take=document.createElement('button');take.type='button';take.className='capture-button';take.textContent='📷 Tomar foto';
  const pick=document.createElement('button');pick.type='button';pick.className='capture-button';pick.textContent='🖼 Elegir de galería';
  const actions=document.createElement('div');actions.className='capture-actions';actions.append(take,pick);
  const img=new Image();img.hidden=true;img.alt='Vista previa de la fotografía';
  const rem=document.createElement('button');rem.type='button';rem.className='capture-button';rem.textContent='Eliminar fotografía';
  let data=null,stopCamera=()=>{};
  async function loadInput(input){const file=input.files?.[0];if(!file)return;if(!file.type.startsWith('image/')){alert('Selecciona una imagen');input.value='';return}try{data=await imageData(file);img.src=data;img.hidden=false}catch{alert('No se pudo leer la imagen')}input.value='';}
  cameraInput.addEventListener('change',()=>loadInput(cameraInput));galleryInput.addEventListener('change',()=>loadInput(galleryInput));
  pick.onclick=()=>galleryInput.click();
  take.onclick=async()=>{
   // En móviles, el selector con capture invoca la cámara nativa de forma habitual.
   if(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)){cameraInput.click();return;}
   if(!navigator.mediaDevices?.getUserMedia){cameraInput.click();return;}
   const panel=document.createElement('div');panel.className='capture-camera-panel';
   const video=document.createElement('video');video.autoplay=true;video.playsInline=true;video.muted=true;
   const shot=document.createElement('button');shot.type='button';shot.className='capture-button';shot.textContent='Capturar imagen';
   const cancel=document.createElement('button');cancel.type='button';cancel.className='capture-button';cancel.textContent='Cancelar cámara';
   const controls=document.createElement('div');controls.className='capture-actions';controls.append(shot,cancel);panel.append(video,controls);row.append(panel);
   let stream;const close=()=>{stream?.getTracks().forEach(t=>t.stop());panel.remove();stopCamera=()=>{}};
   stopCamera=close;cancel.onclick=close;
   try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});video.srcObject=stream;await video.play();}
   catch(e){close();alert('No se pudo abrir la cámara. Revisa los permisos del navegador o utiliza Elegir de galería.');return;}
   shot.onclick=()=>{if(!video.videoWidth)return;const cv=document.createElement('canvas');const scale=Math.min(1,1600/Math.max(video.videoWidth,video.videoHeight));cv.width=Math.round(video.videoWidth*scale);cv.height=Math.round(video.videoHeight*scale);cv.getContext('2d').drawImage(video,0,0,cv.width,cv.height);data=cv.toDataURL('image/jpeg',.85);img.src=data;img.hidden=false;close()};
  };
 rem.onclick=()=>{
  stopCamera();
  data=null;
  img.removeAttribute('src');
  img.hidden=true;
  cameraInput.value='';
  galleryInput.value='';
};
  row.append(title,actions,cameraInput,galleryInput,img,rem);list.append(row);
  items.set(id,{get data(){return data},stopCamera});
 }
 btn.onclick=add;
 return {getAll:()=>[...items.values()].map(x=>x.data).filter(Boolean),clear:()=>{items.forEach(x=>x.stopCamera());items.clear();list.replaceChildren()}};
}
function imageData(file){return new Promise((res,rej)=>{const url=URL.createObjectURL(file),im=new Image();im.onload=()=>{try{const scale=Math.min(1,1600/Math.max(im.width,im.height));const cv=document.createElement('canvas');cv.width=Math.round(im.width*scale);cv.height=Math.round(im.height*scale);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);res(cv.toDataURL('image/jpeg',.85))}catch(e){rej(e)}finally{URL.revokeObjectURL(url)}};im.onerror=()=>{URL.revokeObjectURL(url);rej(Error('Imagen inválida'))};im.src=url})}
export function createAdditionalSigners(container){const list=document.createElement('div');list.className='capture-list';container.append(list);const btn=document.createElement('button');btn.className='capture-button';btn.type='button';btn.textContent='＋ Agregar firmante';container.append(btn);const items=new Map();btn.onclick=()=>{const id=++counter,row=document.createElement('div');row.className='capture-entry';row.innerHTML='<strong>Firmante adicional</strong><label class="field">Nombre <input data-key="nombre"></label><label class="field">Cédula <input data-key="cedula"></label><label class="field">Cargo <input data-key="cargo"></label>';const canvas=document.createElement('canvas');canvas.width=700;canvas.height=170;canvas.setAttribute('aria-label','Área para dibujar la firma');canvas.style.touchAction='none';const clear=document.createElement('button'),remove=document.createElement('button');clear.type=remove.type='button';clear.className=remove.className='capture-button';clear.textContent='Borrar firma';remove.textContent='Eliminar firmante';row.classList.add('capture-signing-area');row.append(canvas,clear,remove);list.append(row);let signed=false,active=false,last=null;const ctx=canvas.getContext('2d');ctx.lineWidth=3;ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle='#153f60';const point=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};canvas.addEventListener('pointerdown',e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);active=true;last=point(e);signed=true;ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(last.x+.1,last.y+.1);ctx.stroke()});canvas.addEventListener('pointermove',e=>{if(!active)return;e.preventDefault();const p=point(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p});canvas.addEventListener('pointerup',()=>active=false);canvas.addEventListener('pointercancel',()=>active=false);clear.onclick=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);signed=false};remove.onclick=()=>{items.delete(id);row.remove()};items.set(id,()=>({nombre:row.querySelector('[data-key=nombre]').value,cedula:row.querySelector('[data-key=cedula]').value,cargo:row.querySelector('[data-key=cargo]').value,firma:signed?signatureImage(canvas):null}))};return {getAll:()=>[...items.values()].map(fn=>fn()),clear:()=>{items.clear();list.replaceChildren()}}}

// Recorta el espacio blanco alrededor del trazo para alinear la firma a la línea oficial.
export function signatureImage(canvas){
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 const {width:w,height:h}=canvas;const pixels=ctx.getImageData(0,0,w,h).data;
 let left=w,top=h,right=-1,bottom=-1;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){if(pixels[(y*w+x)*4+3]>24){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}}
 if(right<0)return null;
 const pad=8;left=Math.max(0,left-pad);top=Math.max(0,top-pad);right=Math.min(w-1,right+pad);bottom=Math.min(h-1,bottom+pad);
 const out=document.createElement('canvas');out.width=right-left+1;out.height=bottom-top+1;
 out.getContext('2d').drawImage(canvas,left,top,out.width,out.height,0,0,out.width,out.height);
 return out.toDataURL('image/png');
}
