import {createGallery,createAdditionalSigners,signatureImage} from '../js/componentes-captura.js';
const groups={fisico:['REVISIÓN TÉCNICO MECÁNICA Y DE GASES VIGENTE','EQUIPO DE CARRETERA','LAS ESTACAS SE ENCUENTRAN EN BUEN ESTADO (si aplica)','LAS COMPUERTAS CIERRAN BIEN','EL PISO SE ENCUENTRA EN BUEN ESTADO','SISTEMA DE COMUNICACIÓN (teléfono celular, radioteléfono, radio, entre otros)','EL SISTEMA ELÉCTRICO FUNCIONA CORRECTAMENTE','Encendido','Estacionarias','Pito','Luces','Sonido de reversas'],seguridad:['ELEMENTOS DE PROTECCIÓN PERSONAL EPP (guantes protectores, monogafas, calzado de seguridad)','BOTIQUÍN DE PRIMEROS AUXILIOS','UN EXTINTOR (mínimo uno, con fecha de vencimiento no mayor a 1 año)','DOCUMENTOS VIGENTES SEGÚN NORMAS DE TRÁNSITO Y TRANSPORTE','Licencia de Conducción (Pase)','Tarjeta Propiedad','SOAT'],almacenamiento:['ACOMODADA','ESTIBADA','APILADA','SUJETA','CUBIERTA'],senalizacion:['Placa naranja con UN (Número de Naciones Unidas) en todas las caras visibles (incluyendo la parte delantera de la cabina)','Señalización en forma de diamante (clase 6 y/o 9)'],peligrosas:['CERTIFICADO DE CURSO OBLIGATORIO DE CAPACITACIÓN PARA TRANSPORTAR ELEMENTOS PELIGROSOS (CONDUCTOR)','COPIA HOJAS DE SEGURIDAD DE LOS RESPEL A TRANSPORTAR','COPIA DE TARJETAS DE EMERGENCIA DE LOS RESPEL','COPIA DE PLAN DE CONTINGENCIA PARA ATENDER ACCIDENTES','2 EXTINTORES UNO EN CABINA Y OTRO CON LA CARGA','EL VEHÍCULO SÓLO TRANSPORTA RESPEL (NO Alimentos, Animales, Medicamentos, etc.)','EQUIPO PARA RECOLECCIÓN Y LIMPIEZA EN CASO DE EMERGENCIA','RESIDUOS DEBIDAMENTE EMBALADOS Y ETIQUETADOS (Según Norma NTC1692)']};
for(const [id,items] of Object.entries(groups)){document.getElementById(id).replaceChildren(...items.map((txt,i)=>{const l=document.createElement('label');l.className='check';const c=document.createElement('input');c.type='checkbox';c.name=id+'_'+i;l.append(c,document.createTextNode(txt));return l}))}
const material=document.getElementById('material'),result=document.getElementById('resultado');function conditional(){const m=material.value;document.getElementById('respelCard').hidden=m!=='RESPEL';document.getElementById('retoma').hidden=!['RESPEL','RETOMA','RAEE/CORRIENTE LIMPIA'].includes(m);document.getElementById('rechazoField').hidden=result.value!=='Rechazado';document.getElementById('otroTransporteField').hidden=val('transporte')!=='OTRO';document.getElementById('otroMaterialField').hidden=m!=='OTRO'}document.querySelector('[name=transporte]').addEventListener('change',conditional);material.addEventListener('change',conditional);result.addEventListener('change',conditional);document.getElementById('form').addEventListener('reset',()=>setTimeout(conditional,0));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const val=n=>document.querySelector('[name="'+n+'"]')?.value||'';function date(v){if(!v)return '';const [y,m,d]=v.split('-');return d+'/'+m+'/'+y}function line(k,v){return `<tr><td style="width:45%"><b>${esc(k)}</b></td><td>${esc(v)||'—'}</td></tr>`}function section(title,body){return `<h2>${esc(title)}</h2>${body}`}function checkTable(id){return '<table><tbody>'+groups[id].map((x,i)=>{const c=document.querySelector(`[name="${id}_${i}"]`);return `<tr><td>${esc(x)}</td><td style="width:60px;text-align:center">${c?.checked?'☑':'☐'}</td></tr>`}).join('')+'</tbody></table>'}function signature(title,name,cedula,extra){return `<div class="sign"><b>${esc(title)}</b><div>Nombre: ${esc(val(name))||'________________'}</div><div>Cédula: ${esc(val(cedula))||'________________'}</div><div>${esc(extra)}: ${esc(val(extra==='Cargo'?(title==='DILIGENCIADO POR'?'diligenciaCargo':'apruebaCargo'):'firmaConductorTelefono'))||'________________'}</div><div>Firma: ____________________________________</div></div>`}

// Coordenadas de cada campo sobre el formato ORIGINAL, renderizado a 1190 x 1540.
// Las páginas del Word se mantienen como imágenes sin alterar su estructura.
const W=1190,H=1540;
function item(x,y,value,w=260,size=14){const d=document.createElement('div');d.className='sa014-value';Object.assign(d.style,{left:(x/W*100)+'%',top:(y/H*100)+'%',width:(w/W*100)+'%',fontSize:size+'px'});d.textContent=value||'';return d;}
function mark(x,y){const d=item(x,y,'✓',20,16);d.classList.add('sa014-mark');return d;}
function getCheck(g,n){return Boolean(document.querySelector(`[name="${g}_${n}"]`)?.checked)}
function addField(page,x,y,key,w=260,size=14,formatter){let text=val(key);if(formatter)text=formatter(text);if(text)page.append(item(x,y,text,w,size));}
const checkboxPosition={
 fisico:[[100,645],[100,666],[100,685],[100,705],[100,724],[100,744],[100,764],[129,783],[129,802],[129,821],[129,840],[129,859]],
 seguridad:[[100,914],[100,932],[100,953],[100,971],[125,992],[125,1012],[125,1032]],
 almacenamiento:[[94,1070],[94,1090],[94,1110],[94,1130],[94,1150]],
 senalizacion:[[100,1205],[100,1224]],
 peligrosas:[[100,1279],[100,1300],[100,181],[100,200],[100,220],[100,240],[100,259],[100,279]]
};
function newPage(n){let page=document.createElement('section');page.className='sa014-page';const img=new Image();img.src=`plantillas/sa-014/pagina-${n}.png`;img.alt=`Página oficial ${n} de 4`;page.append(img);return page;}
const vehicleGallery=createGallery(document.getElementById('vehiculoGaleria'),{label:'Foto del vehículo'});
const supportGallery=createGallery(document.getElementById('soporteGaleria'),{label:'Documento soporte'});
const additionalSigners=createAdditionalSigners(document.getElementById('firmantesAdicionales'));
// Las imágenes se guardan solamente en memoria hasta imprimir o cerrar la pestaña.
const photoData={};
function placeImage(page,src,x,y,w,h,fit='contain'){
 const img=new Image();img.src=src;img.className='sa014-overlay-image';img.style.left=(x/W*100)+'%';img.style.top=(y/H*100)+'%';img.style.width=(w/W*100)+'%';img.style.height=(h/H*100)+'%';img.style.objectFit=fit;page.append(img);
}
function shrinkPhoto(file){return new Promise((resolve,reject)=>{
 const src=URL.createObjectURL(file),im=new Image();im.onload=()=>{try{const scale=Math.min(1,1600/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*scale);c.height=Math.round(im.height*scale);c.getContext('2d').drawImage(im,0,0,c.width,c.height);const data=c.toDataURL('image/jpeg',.85);URL.revokeObjectURL(src);resolve(data);}catch(e){reject(e)}};im.onerror=()=>{URL.revokeObjectURL(src);reject(new Error('No se pudo leer la imagen'))};im.src=src;
})}
function setupSignature(canvas){canvas.style.touchAction='none';canvas.style.userSelect='none';canvas.style.webkitUserSelect='none';canvas.setAttribute('aria-label','Área para dibujar la firma');const ctx=canvas.getContext('2d');ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#143451';let active=false,last=null;
 const point=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};
 canvas.addEventListener('pointerdown',e=>{e.preventDefault();active=true;canvas.setPointerCapture(e.pointerId);last=point(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(last.x+.1,last.y+.1);ctx.stroke();canvas.dataset.signed='yes'});
 canvas.addEventListener('pointermove',e=>{if(!active)return;e.preventDefault();const p=point(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p});
 canvas.addEventListener('pointerup',()=>active=false);canvas.addEventListener('pointercancel',()=>active=false);
}
document.querySelectorAll('.signature-canvas').forEach(setupSignature);
// Bloquear selección de textos y gestos dentro del panel de firma.
const signatureStyles=document.createElement('style');signatureStyles.textContent='.signature-box{user-select:none!important;-webkit-user-select:none!important;-webkit-touch-callout:none}.signature-box canvas{display:block!important;touch-action:none!important;user-select:none!important;-webkit-user-select:none!important;cursor:crosshair;outline:2px solid #3377bb;outline-offset:0;border:2px solid #3377bb!important;background:#fff!important;min-height:118px!important}';document.head.append(signatureStyles);
document.querySelectorAll('.clear-sign').forEach(b=>b.addEventListener('click',()=>{const c=document.getElementById(b.dataset.sign);c.getContext('2d').clearRect(0,0,c.width,c.height);c.dataset.signed='no'}));
document.getElementById('form').addEventListener('reset',()=>{vehicleGallery.clear();supportGallery.clear();additionalSigners.clear();Object.keys(photoData).forEach(k=>delete photoData[k]);document.querySelectorAll('.photo-preview').forEach(p=>{p.hidden=true;p.removeAttribute('src')});document.querySelectorAll('.signature-canvas').forEach(c=>{c.getContext('2d').clearRect(0,0,c.width,c.height);c.dataset.signed='no'})});
function populate(){const pages=[1,2,3,4].map(newPage);const a=pages[0],b=pages[1];
 // Datos básicos
 addField(a,310,198,'fecha',250,14,date);addField(a,682,198,'centro',326);
 addField(a,310,232,'transportadora',690);addField(a,310,263,'fechaContrato',260,14,date);
 addField(a,778,263,'contrato',245);addField(a,310,294,'conductor',380);addField(a,781,294,'eps',240);
 // Placa con escritura en la zona de siete casillas
 addField(a,81,386,'placa',180,20);
 const selections=[['transporte',['VAN CARGO','CAMIONETA','FURGÓN PACHA SENCILLA','FURGÓN DOBLE PACHA','CAMIÓN','TRACTOCAMIÓN','OTRO'],305,382,20],['combustible',['DIESEL','GASOLINA','GAS','GAS Y GASOLINA'],582,388,20],['material',['RESPEL','RETOMA','RAEE/CORRIENTE LIMPIA','EQUIPOS DE COMPUTO','LABORATORIOS DE INNOVACIÓN','KIT MAKER','OTRO'],785,382,20]];
 for(const [key,options,x,y,dy] of selections){let n=options.indexOf(val(key));if(n>=0)a.append(mark(x,y+n*dy));}
 addField(a,320,509,'otroTransporte',225,12);addField(a,796,509,'otroMaterial',230,12);
 for(const [group,coords] of Object.entries(checkboxPosition)){coords.forEach(([x,y],i)=>{if(!getCheck(group,i))return;const pg=group==='peligrosas'&&i>=2?b:a;pg.append(mark(x,y));});}
 // Carga especial
 for(const [key,y] of [['riesgo',1112],['cargueBodega',1130]]){let v=val(key);if(v==='Sí'||v==='No')a.append(mark(v==='Sí'?500:531,y));}
 if(val('resultado')==='Aprobado')b.append(mark(79,339));if(val('resultado')==='Rechazado')b.append(mark(236,339));
 addField(b,510,334,'causal',515,13);
 addField(b,85,402,'observaciones',925,14);
 // Datos identificativos; líneas de firma permanecen vacías para suscribir a mano
 addField(b,135,712,'diligenciaNombre',340);addField(b,135,737,'diligenciaCedula',340);addField(b,135,776,'diligenciaCargo',340);
 addField(b,645,713,'firmaConductorNombre',350);addField(b,660,752,'firmaConductorCedula',340);addField(b,661,792,'firmaConductorTelefono',340);
 addField(b,134,926,'apruebaNombre',360);addField(b,135,966,'apruebaCedula',360);addField(b,135,1006,'apruebaCargo',360);
 // Firmas capturadas directamente en el dispositivo, sin almacenarlas.
 for(const [id,x,y,w,h] of [['firmaDiligencia',70,685,445,72],['firmaConductor',587,685,450,72],['firmaAprueba',70,914,445,72]]){
  const canvas=document.getElementById(id);if(canvas?.dataset.signed==='yes') {const signature=signatureImage(canvas);if(signature)placeImage(b,signature,x,y,w,h,'contain');}
 }
 // Las primeras tres fotografías ocupan los espacios oficiales.
 const photos=vehicleGallery.getAll(),c=pages[2],d=pages[3];
 const vehicleSlots=[[73,180,472,520],[566,180,470,520],[72,722,472,514]];
 photos.slice(0,3).forEach((src,i)=>placeImage(c,src,...vehicleSlots[i]));
 // Los primeros dos soportes ocupan los espacios originales.
 const supports=supportGallery.getAll(),supportSlots=[[75,185,962,515],[75,712,962,520]];
 supports.slice(0,2).forEach((src,i)=>placeImage(d,src,...supportSlots[i]));
 // Anexos adicionales sobre páginas nuevas con encabezado de la misma plantilla.
 const attachments=[...photos.slice(3).map(src=>({src,group:'REGISTRO FOTOGRÁFICO ADICIONAL'})),...supports.slice(2).map(src=>({src,group:'DOCUMENTOS SOPORTE ADICIONALES'}))];
 for(let i=0;i<attachments.length;i+=2){const pg=newPage(3);const cover=document.createElement('div');cover.style.cssText='position:absolute;left:4%;top:12%;width:92%;height:84%;background:white;z-index:1';pg.append(cover);const heading=item(75,183,'ANEXOS — '+attachments[i].group,950,16);heading.style.fontWeight='bold';pg.append(heading);attachments.slice(i,i+2).forEach((a,j)=>placeImage(pg,a.src,82,j?792:245,1020,490));pages.push(pg)}
 const signers=additionalSigners.getAll();
 for(let i=0;i<signers.length;i+=3){const pg=newPage(3);const cover=document.createElement('div');cover.style.cssText='position:absolute;left:4%;top:12%;width:92%;height:84%;background:white;z-index:1';pg.append(cover);const heading=item(75,185,'FIRMANTES ADICIONALES',950,17);heading.style.fontWeight='bold';pg.append(heading);signers.slice(i,i+3).forEach((person,j)=>{let y=280+j*350;pg.append(item(90,y,'Nombre: '+person.nombre,850,16));pg.append(item(90,y+38,'Cédula: '+person.cedula,850,15));pg.append(item(90,y+76,'Cargo: '+person.cargo,850,15));if(person.firma)placeImage(pg,person.firma,95,y+112,650,170)});pages.push(pg)}
 // Ajustar dinámicamente el número total de páginas del encabezado oficial.
 pages.forEach((pg,i)=>{const box=document.createElement('div');box.style.cssText='position:absolute;left:85.1%;top:5.15%;width:12.7%;height:2.6%;background:#fff;z-index:8;display:flex;align-items:center;justify-content:center;font:bold 11px Arial,sans-serif;color:#111';box.textContent=`Página ${i+1} de ${pages.length}`;pg.append(box)});
 return pages;
}
document.getElementById('generate').addEventListener('click',()=>{
 if(!val('resultado')){alert('Selecciona el resultado de la inspección.');result.focus();return;}
 if(val('resultado')==='Rechazado'&&!val('causal').trim()){alert('Indica la causal de rechazo.');document.querySelector('[name="causal"]').focus();return;}
 const target=document.getElementById('printSurface');target.replaceChildren(...populate());
 // Esperar a que se carguen todas las imágenes para imprimir.
 Promise.all([...target.querySelectorAll('img')].map(i=>i.complete?Promise.resolve():new Promise(r=>{i.onload=r;i.onerror=r}))).then(()=>window.print());
});
