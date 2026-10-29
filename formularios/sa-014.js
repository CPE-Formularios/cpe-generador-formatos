import {createGallery,createAdditionalSigners,signatureImage} from '../js/componentes-captura.js';
import {renderDocument,blockSection,blockTable,blockPhoto,blockSigner} from '../js/pdf.js';
const groups={fisico:['REVISIÓN TÉCNICO MECÁNICA Y DE GASES VIGENTE','EQUIPO DE CARRETERA','LAS ESTACAS SE ENCUENTRAN EN BUEN ESTADO (si aplica)','LAS COMPUERTAS CIERRAN BIEN','EL PISO SE ENCUENTRA EN BUEN ESTADO','SISTEMA DE COMUNICACIÓN (teléfono celular, radioteléfono, radio, entre otros)','EL SISTEMA ELÉCTRICO FUNCIONA CORRECTAMENTE','Encendido','Estacionarias','Pito','Luces','Sonido de reversas'],seguridad:['ELEMENTOS DE PROTECCIÓN PERSONAL EPP (guantes protectores, monogafas, calzado de seguridad)','BOTIQUÍN DE PRIMEROS AUXILIOS','UN EXTINTOR (Mínimo uno, con fecha de vencimiento no mayor a 1 año)','DOCUMENTOS VIGENTES SEGÚN NORMAS DE TRÁNSITO Y TRANSPORTE','Licencia de Conducción (Pase)','Tarjeta Propiedad','SOAT'],almacenamiento:['ACOMODADA','ESTIBADA','APILADA','SUJETA','CUBIERTA'],senalizacion:['Placa naranja con UN (Número de Naciones Unidas) en todas las caras visibles (incluyendo la parte delantera de la cabina)','Señalización en forma de diamante (clase 6 y/o 9)'],peligrosas:['CERTIFICADO DE CURSO OBLIGATORIO DE CAPACITACIÓN PARA TRANSPORTAR ELEMENTOS PELIGROSOS (CONDUCTOR)','COPIA HOJAS DE SEGURIDAD DE LOS RESPEL A TRANSPORTAR','COPIA DE TARJETAS DE EMERGENCIA DE LOS RESPEL','COPIA DE PLAN DE CONTINGENCIA PARA ATENDER ACCIDENTES','2 EXTINTORES UNO EN CABINA Y OTRO CON LA CARGA','EL VEHÍCULO SÓLO TRANSPORTA RESPEL (NO Alimentos, Animales, Medicamentos, etc.)','EQUIPO PARA RECOLECCIÓN Y LIMPIEZA EN CASO DE EMERGENCIA','RESIDUOS DEBIDAMENTE EMBALADOS Y ETIQUETADOS (Según Norma NTC1692)']};
const form=document.getElementById('form');
// Normaliza el campo Centro aunque GitHub Pages haya servido un HTML anterior.
const centroAnterior=form.elements.namedItem('centro');
if (centroAnterior && centroAnterior.tagName !== 'SELECT') {
  const selector=document.createElement('select');
  selector.name='centro';
  selector.id=centroAnterior.id || 'centro';
  selector.required=centroAnterior.required;
  [['','Selecciona el centro'],['CST','CST'],['SC','SC'],['CENARE','CENARE']].forEach(([value,label])=>{
    const option=document.createElement('option');option.value=value;option.textContent=label;selector.appendChild(option);
  });
  const valorAnterior=(centroAnterior.value||'').trim().toUpperCase();
  if (['CST','SC','CENARE'].includes(valorAnterior)) selector.value=valorAnterior;
  centroAnterior.replaceWith(selector);
}
const val=n=>form.elements.namedItem(n)?.value||'';const fmtDate=v=>v?`${v.slice(8,10)}/${v.slice(5,7)}/${v.slice(0,4)}`:'';
for(const [id,items] of Object.entries(groups)){const box=document.getElementById(id);items.forEach((txt,i)=>{const label=document.createElement('label');label.className='check';if((id==='fisico'&&i>=7)||(id==='seguridad'&&i>=4))label.classList.add('sa-check-sub');if((id==='fisico'&&i===6)||(id==='seguridad'&&i===3))label.classList.add('sa-check-parent');const c=document.createElement('input');c.type='checkbox';c.name=id+'_'+i;label.append(c,document.createTextNode(txt));box.append(label)})}
function conditional(){const m=val('material');document.getElementById('respelCard').hidden=m!=='RESPEL';document.getElementById('retoma').hidden=!['RESPEL','RETOMA','RAEE/CORRIENTE LIMPIA'].includes(m);document.getElementById('rechazoField').hidden=val('resultado')!=='Rechazado';document.getElementById('otroTransporteField').hidden=val('transporte')!=='OTRO';document.getElementById('otroMaterialField').hidden=m!=='OTRO'}
['material','resultado','transporte'].forEach(n=>form.elements.namedItem(n).addEventListener('change',conditional));
conditional();
// Distribución estable de los campos del vehículo: cada "OTRO" al lado de su selector.
// Se reutilizan las etiquetas y controles existentes, sin duplicar datos.
{
  const placa = form.elements.namedItem('placa');
  const seccion = placa?.closest('section');
  const cuadriculaOriginal = placa?.closest('.grid');
  if (seccion && cuadriculaOriginal) {
    const contenedor = document.createElement('div');
    contenedor.className = 'sa-vehiculo-formulario';
    const filas = [
      ['placa'],
      ['transporte', 'otroTransporte'],
      ['material', 'otroMaterial'],
      ['combustible']
    ];
    filas.forEach(nombres => {
      const fila = document.createElement('div');
      fila.className = 'sa-vehiculo-fila';
      nombres.forEach(nombre => {
        const campo = form.elements.namedItem(nombre);
        const etiqueta = campo?.closest('label');
        if (etiqueta) fila.appendChild(etiqueta);
      });
      contenedor.appendChild(fila);
    });
    cuadriculaOriginal.replaceWith(contenedor);
    const estilos = document.createElement('style');
    estilos.textContent = `
      .sa-vehiculo-formulario { display: grid; gap: 16px; }
      .sa-vehiculo-fila { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
      .sa-vehiculo-fila > .field { min-width: 0; }
      .sa-vehiculo-fila > .field[hidden] { display: none !important; }
      @media (max-width: 720px) { .sa-vehiculo-fila { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(estilos);
    conditional();
  }
}
const photos=createGallery(document.getElementById('vehiculoGaleria'),{label:'Foto del vehículo'}),supports=createGallery(document.getElementById('soporteGaleria'),{label:'Documento soporte'}),additional=createAdditionalSigners(document.getElementById('firmantesAdicionales'));
// Exactamente cuatro posiciones de fotografía y dos de soporte, sin botones para agregar otras.
const fixedSlots=(id,count,names)=>{const holder=document.getElementById(id);const button=[...holder.querySelectorAll('button')].find(b=>b.textContent.includes('Agregar fotografía'));if(!button)throw Error('No se pudo preparar la captura de fotos en '+id);for(let i=0;i<count;i++)button.click();button.hidden=true;const titles=holder.querySelectorAll('.capture-entry > strong');titles.forEach((title,i)=>{title.textContent=names[i]||'Fotografía '+(i+1)});return ()=>{for(let i=0;i<count;i++)button.click();holder.querySelectorAll('.capture-entry > strong').forEach((title,i)=>{title.textContent=names[i]||'Fotografía '+(i+1)})}};
const resetVehicleSlots=fixedSlots('vehiculoGaleria',4,['Vehículo — fotografía 1 (obligatoria)','Vehículo — fotografía 2 (obligatoria)','Vehículo — fotografía 3 (opcional)','Vehículo — fotografía 4 (opcional)']);
const resetSupportSlots=fixedSlots('soporteGaleria',2,['Tecnomecánica o carta de propiedad','Certificado curso de transporte elementos peligrosos (solo RESPEL)']);
function signing(canvas){canvas.style.touchAction='none';canvas.style.userSelect='none';canvas.style.border='2px dashed #1782b2';canvas.style.background='#fff';const ctx=canvas.getContext('2d');ctx.lineWidth=3;ctx.lineCap='round';ctx.strokeStyle='#153f60';let drawing=false,last;const point=e=>{const r=canvas.getBoundingClientRect();return {x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};canvas.addEventListener('pointerdown',e=>{e.preventDefault();canvas.setPointerCapture(e.pointerId);drawing=true;last=point(e);canvas.dataset.signed='yes';ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(last.x+.1,last.y+.1);ctx.stroke()});canvas.addEventListener('pointermove',e=>{if(!drawing)return;e.preventDefault();const p=point(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p});canvas.addEventListener('pointerup',()=>drawing=false);canvas.addEventListener('pointercancel',()=>drawing=false)}
document.querySelectorAll('.signature-canvas').forEach(signing);document.querySelectorAll('.clear-sign').forEach(b=>b.onclick=()=>{const canvas=document.getElementById(b.dataset.sign);canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);canvas.dataset.signed='no'});
form.addEventListener('reset',()=>setTimeout(()=>{conditional();photos.clear();supports.clear();resetVehicleSlots();resetSupportSlots();additional.clear();document.querySelectorAll('.signature-canvas').forEach(c=>{c.getContext('2d').clearRect(0,0,c.width,c.height);c.dataset.signed='no'})},0));
function section(title){return blockSection(title)}
function el(tag,cls='',text=''){const n=document.createElement(tag);if(cls)n.className=cls;if(text)n.textContent=text;return n;}
function cell(label,value){const d=el('div','sa-field');d.append(el('span','sa-field-name',label),el('span','sa-field-value',value||' '));return d;}
function basicRows(){const root=el('div','sa-basics');[
  [cell('Fecha:',fmtDate(val('fecha'))),cell('Centro:',val('centro'))],
  [cell('Empresa transportadora:',val('transportadora'))],
  [cell('Fecha Subasta/Inicio Contrato:',fmtDate(val('fechaContrato'))),cell('No. Acta /Contrato:',val('contrato'))],
  [cell('Nombre del conductor:',val('conductor')),cell('EPS/ARL:',val('eps'))]
 ].forEach(cs=>{const line=el('div','sa-basic-row');cs.forEach(c=>line.append(c));root.append(line)});return root;}
function vehicle(){const root=el('div','sa-vehicle');const kinds=[
 ['No. Placa:',val('placa'),[]],
 ['Tipo de transporte:',val('transporte')==='OTRO'?val('otroTransporte'):val('transporte'),['VAN CARGO','CAMIONETA','FURGÓN PACHA SENCILLA','FURGÓN DOBLE PACHA','CAMIÓN','TRACTOCAMIÓN','OTRO']],
 ['Tipo de combustible:',val('combustible'),['DIESEL','GASOLINA','GAS','GAS Y GASOLINA']],
 ['Material transportado:',val('material')==='OTRO'?val('otroMaterial'):val('material'),['RESPEL','RETOMA','RAEE/CORRIENTE LIMPIA','EQUIPOS DE COMPUTO','LABORATORIOS DE INNOVACIÓN','KIT MAKER','OTRO']]
 ];kinds.forEach(([label,v,opts],idx)=>{const c=el('div','sa-vehicle-cell');c.append(el('strong','',label));if(idx===0)c.append(el('div','sa-plate',v));else{opts.forEach(t=>{const chosen= t==='OTRO' ? (val(idx===1?'transporte':'material')==='OTRO') : t===v;const label=t==='OTRO'?'OTRO ¿CUÁL?':t;c.append(el('div','sa-option',`${chosen?'◉':'○'} ${label}`));if(t==='OTRO' && chosen && v)c.append(el('div','sa-option sa-other-value',v))});if(v&&!opts.includes(v) && val(idx===1?'transporte':'material')!=='OTRO')c.append(el('div','sa-option','◉ '+v))}root.append(c)});return root;}
function listCheck(key,start=0,end=null){const root=el('div','sa-checks');const entries=groups[key].slice(start,end??undefined);entries.forEach((txt,i)=>{let c=el('div','sa-check-row');const checked=document.querySelector(`[name="${key}_${start+i}"]`)?.checked;c.append(el('span','sa-tick',checked?'☑':'☐'),el('span','sa-check-txt',txt));if((key==='fisico' && start+i>=7)||(key==='seguridad' && start+i>=4))c.classList.add('sa-check-sub');if((key==='fisico' && start+i===6)||(key==='seguridad' && start+i===3))c.classList.add('sa-check-parent');root.append(c)});return root;}
function inspectionResult(){const root=el('div','sa-result');const result=val('resultado');root.append(el('span','',`${result==='Aprobado'?'☑':'☐'} Aprobado`),el('span','',`${result==='Rechazado'?'☑':'☐'} Rechazado`),cell('Causal de rechazo:',val('causal')));return root;}
function storage(){const root=el('div','sa-storage');const left=listCheck('almacenamiento');const right=el('div','sa-storage-right');right.append(el('strong','','DILIGENCIAR SOLO PARA: RETOMA/RESPEL/RAEE/CORRIENTE LIMPIA'));[['Riesgo de accidente y/o riesgo al ambiente',val('riesgo')],['El cargue de material se hace dentro de la bodega',val('cargueBodega')]].forEach(([txt,v])=>right.append(el('div','sa-check-row',`${v==='Si'?'☑':'☐'} Sí   ${v==='No'?'☑':'☐'} No     ${txt}`)));root.append(left,right);return root;}
function signRow(signers){const root=el('div','sa-signers');signers.forEach(p=>root.append(blockSigner(p)));return root;}
function photoSlots(images,descriptions){const result=[];const count=Math.max(images.length,descriptions.length);for(let i=0;i<count;i+=2){const row=el('div','sa-photo-row');for(let j=i;j<Math.min(i+2,count);j++){const card=el('div','sa-photo-slot');if(images[j]){const img=new Image();img.src=images[j];img.alt=descriptions[j]||'Anexo';card.append(img)}else card.append(el('span','sa-photo-placeholder',descriptions[j]||'FOTOGRAFÍA'));row.append(card)}result.push(row)}return result;}
const capture=id=>{const c=document.getElementById(id);return c?.dataset.signed==='yes'?signatureImage(c):null};
function build(){const b=[];
 b.push(section('DATOS BÁSICOS'),basicRows(),section('DESCRIPCIÓN DEL VEHÍCULO'),vehicle());
 b.push(section('ASPECTO FÍSICO'));
 b.push(el('div','sa-description','La revisión aplica para todos los vehículos que ingresan a las bodegas en las operaciones de cargue y descargue de material. Si un vehículo ingresa más de una vez en el día, registrar la novedad en observaciones y realizar una nueva inspección visual.'));
 b.push(listCheck('fisico'),section('SEGURIDAD INDUSTRIAL'),listCheck('seguridad'),section('ALMACENAMIENTO DENTRO DEL VEHÍCULO'),storage());
 b.push(section('SEÑALIZACIÓN DEL VEHÍCULO (Aplica solo para RESPEL)'),listCheck('senalizacion'),section('TRANSPORTE DE MERCANCÍAS PELIGROSAS (Aplica solo para RESPEL)'),listCheck('peligrosas'));
 b.push(section('RESULTADO DE LA INSPECCIÓN'),inspectionResult(),section('OBSERVACIONES'),el('div','sa-observaciones',val('observaciones')));
 b.push(el('div','sa-legal','Nota: Si el vehículo no cumple con los requisitos establecidos en el presente formato, abstenerse de autorizar el correspondiente descargue y/o cargue. Si el vehículo no cumple con lo requerido, escanear el registro firmado por ambas partes y enviarlo al responsable de la empresa o contratista.'));
 b.push(el('div','sa-legal','En cumplimiento del Decreto 1079/15 Ministerio Transporte / FICHA No. 5: Programa Manejo de Emisiones Atmosféricas en Etapas de Adecuación, Operación y Desmantelamiento.'));
 const required=[{role:'DILIGENCIADO POR:',nombre:val('diligenciaNombre'),cedula:val('diligenciaCedula'),extra:val('diligenciaCargo'),extraLabel:'Cargo',firma:capture('firmaDiligencia')},{role:'FIRMA CONDUCTOR:',nombre:val('conductor'),cedula:val('firmaConductorCedula'),extra:val('firmaConductorTelefono'),extraLabel:'Teléfono',firma:capture('firmaConductor')},{role:'APROBADO POR:',nombre:val('apruebaNombre'),cedula:val('apruebaCedula'),extra:val('apruebaCargo'),extraLabel:'Cargo',firma:capture('firmaAprueba')}];
 b.push(signRow(required.slice(0,2)),signRow(required.slice(2)));
 const extra=additional.getAll();if(extra.length){b.push(section('FIRMANTES ADICIONALES'));for(let i=0;i<extra.length;i+=2)b.push(signRow(extra.slice(i,i+2).map(p=>({role:'FIRMANTE ADICIONAL:',...p,extra:p.cargo,extraLabel:'Cargo'}))))}
 const imagenesVehiculo=photos.getAll();
 const tituloFotos=section('REGISTRO FOTOGRÁFICO VEHÍCULO');tituloFotos.dataset.newPage='true';
 b.push(tituloFotos,...photoSlots(imagenesVehiculo,['VEHÍCULO','VEHÍCULO','VEHÍCULO','VEHÍCULO']));
 const documentosSoporte=supports.getAll();
 const tituloSoportes=section('DOCUMENTOS SOPORTES');tituloSoportes.dataset.newPage='true';
 b.push(tituloSoportes);
 ['TECNO MECÁNICA O CARTA DE PROPIEDAD','CERTIFICADO CURSO TRANSPORTE ELEMENTOS PELIGROSOS (SOLO PARA RESPEL)'].forEach((caption,i)=>{
   const slot=el('div','sa-support-slot');
   if(documentosSoporte[i]){const img=new Image();img.src=documentosSoporte[i];img.alt=caption;slot.append(img)}
   else slot.append(el('span','sa-photo-placeholder',caption));
   b.push(slot);
 });
 return b;
}
document.getElementById('generate').onclick=async()=>{if(photos.getAll().length<2){alert('Debes adjuntar por lo menos dos fotografías del vehículo antes de generar el PDF.');return}if(!val('resultado')){alert('Selecciona el resultado de la inspección.');return}if(val('resultado')==='Rechazado'&&!val('causal').trim()){alert('Indica la causal de rechazo.');return}try{await renderDocument({title:'CHECK LIST TRANSPORTE',code:'SA-014-F',version:'7',date:'Marzo/2025'},build())}catch(e){alert('Error preparando PDF: '+e.message);console.error(e)}};
