// Motor de impresión compartido. Cada bloque se mantiene completo al paginar.
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export {esc};
export function blockSection(title){const d=document.createElement('div');d.className='doc-section';d.textContent=title;return d;}
export function blockTable(rows,heads=null){const t=document.createElement('table');t.className='doc-table';if(heads){const tr=t.insertRow();heads.forEach(h=>{const th=document.createElement('th');th.textContent=h;tr.append(th)})}rows.forEach(row=>{const tr=t.insertRow();row.forEach(value=>{const td=tr.insertCell();td.textContent=String(value??'')})});return t;}
export function blockPhoto(src,title){const x=document.createElement('div');x.className='doc-photo';const label=document.createElement('div');label.className='doc-photo-title';label.textContent=title;const img=new Image();img.src=src;img.alt=title;x.append(label,img);return x;}
export function blockSigner(person){const box=document.createElement('div');box.className='doc-signer';box.append(Object.assign(document.createElement('strong'),{textContent:person.role}));const slot=document.createElement('div');slot.className='doc-sign-slot';if(person.firma){const im=new Image();im.src=person.firma;im.alt='Firma';im.className='doc-signature';slot.append(im)}box.append(slot);const line=document.createElement('div');line.className='doc-signline';box.append(line);[['Nombre',person.nombre],['Cédula',person.cedula],[person.extraLabel||'Cargo',person.extra]].forEach(([label,value])=>{const row=document.createElement('div');row.className='doc-signer-data';row.textContent=label+': '+(value||'');box.append(row)});return box;}
function header(meta,num,total){const box=document.createElement('div');box.className='doc-head';const logo=new Image();logo.src='assets/logo-cpe.png';logo.alt='Computadores para Educar';logo.className='doc-logo';const title=document.createElement('strong');title.textContent=meta.title;const table=document.createElement('table');table.className='doc-meta';table.innerHTML=`<tr><td><b>Código:</b><div>${esc(meta.code)}</div></td><td><b>Versión:</b><div>${esc(meta.version)}</div></td></tr><tr><td><b>Fecha:</b><div>${esc(meta.date)}</div></td><td><b>Página ${num} de ${total}</b></td></tr>`;box.append(logo,title,table);return box;}
function makePage(meta){const p=document.createElement('section');p.className='doc-page';const h=header(meta,1,1);const body=document.createElement('div');body.className='doc-page-body';p.append(h,body);return {p,h,body};}
const imageReady=im=>im.complete?Promise.resolve():new Promise(resolve=>{im.addEventListener('load',resolve,{once:true});im.addEventListener('error',resolve,{once:true})});
export async function renderDocument(meta,blocks){
 const surface=document.getElementById('printSurface');if(!surface)throw Error('No existe el área de impresión.');
 surface.replaceChildren();surface.style.cssText='display:block;position:fixed;left:-30000px;top:0;visibility:hidden;width:215.9mm;z-index:-1';
 // Medir después de que carguen las fotografías evita que la paginación cambie al imprimir.
 const staging=document.createElement('div');staging.className='doc-staging';staging.style.cssText='position:absolute;visibility:hidden;width:185mm';blocks.forEach(b=>staging.append(b.cloneNode(true)));surface.append(staging);
 await Promise.all([...staging.querySelectorAll('img')].map(imageReady));staging.remove();
 const pages=[];let current=makePage(meta);surface.append(current.p);pages.push(current);
 for(const original of blocks){
  const node=original.cloneNode(true);current.body.append(node);
  if(current.body.scrollHeight>current.body.clientHeight+1 && current.body.children.length>1){
   node.remove();current=makePage(meta);surface.append(current.p);pages.push(current);current.body.append(node);
  }
  if(current.body.scrollHeight>current.body.clientHeight+2){console.warn('Un bloque supera una página completa:',original.className)}
 }
 pages.forEach((part,i)=>{part.p.replaceChild(header(meta,i+1,pages.length),part.h)});
 await Promise.all([...surface.querySelectorAll('img')].map(imageReady));
 surface.removeAttribute('style');window.print();
}
