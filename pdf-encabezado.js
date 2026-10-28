// Encabezado PDF único de CPE: cambiar logo/estructura aquí actualiza todos los formatos.
const DEFAULTS={codigo:'SA-014-F',version:'7',fecha:'Marzo/2025',titulo:'CHECK LIST TRANSPORTE'};
const HEADER_SIZE=116;
function header(meta,page,total){
 return `<div class="cpe-pdf-head"><img src="assets/logo-cpe.png" alt="Computadores para Educar"><strong>${meta.titulo}</strong><table class="cpe-meta"><tbody><tr><td>Código:<br><b>${meta.codigo}</b></td><td>Versión:<br><b>${meta.version}</b></td></tr><tr><td>Fecha:<br><b>${meta.fecha}</b></td><td>Página ${page} de ${total}</td></tr></tbody></table></div>`;
}
// Browser print pages are assembled explicitly, so the total is recalculated on each generation.
export function renderPagedPdf(markup,meta=DEFAULTS){
 const target=document.getElementById('printSurface');
 const temp=document.createElement('div'); temp.innerHTML=markup;
 const paper=temp.querySelector('.paper')||temp;
 const blocks=[];
 // Split long tables into rows, retaining the preceding section heading once per page.
 let title='';
 for(const el of [...paper.children]){
   if(el.tagName==='HEADER') continue;
   if(el.tagName==='H2'){title=el.outerHTML;continue}
   if(el.tagName==='TABLE'){
     for(const row of el.querySelectorAll('tr')) blocks.push({html:`${title}<table><tbody>${row.outerHTML}</tbody></table>`,label:title});
   }else blocks.push({html:(title?title:'')+el.outerHTML,label:title});
   title='';
 }
 // Measure in a hidden A4-width container using actual print typography.
 const ruler=document.createElement('div');ruler.className='pdf-measure paper';
 document.body.append(ruler);
 const groups=[[]];let used=0;
 const max=975; // A4 @ 96dpi minus print margins and header; conservative for browser printers.
 for(const block of blocks){
   ruler.innerHTML=block.html;
   let height=Math.ceil(ruler.getBoundingClientRect().height)+5;
   if(used+height>max && groups.at(-1).length){groups.push([]);used=0}
   groups.at(-1).push(block.html);used+=height;
 }
 ruler.remove();
 target.innerHTML=groups.map((parts,i)=>`<section class="cpe-print-page">${header(meta,i+1,groups.length)}<div class="paper cpe-page-body">${parts.join('')}</div></section>`).join('');
}
