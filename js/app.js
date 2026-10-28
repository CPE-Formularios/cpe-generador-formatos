// Único punto de entrada. Los formularios se cargan como módulos independientes.
const splash=document.getElementById('splash');
setTimeout(()=>{splash?.classList.add('splash-hide');setTimeout(()=>splash?.remove(),350)},1300);
const mount=document.getElementById('formMount');
let initialized=false;
async function openChecklist(){
  if(!initialized){
    const response=await fetch('formularios/sa-014.html');
    if(!response.ok) throw new Error('No fue posible cargar el formulario.');
    mount.innerHTML=await response.text();
    await import('../formularios/sa-014.js');
    initialized=true;
    document.getElementById('backHome').addEventListener('click',()=>{
      document.getElementById('formView').hidden=true;
      document.getElementById('homeView').hidden=false;
      window.scrollTo(0,0);
    });
  }
  document.getElementById('homeView').hidden=true;
  document.getElementById('formView').hidden=false;
  window.scrollTo(0,0);
}
document.getElementById('openChecklist').addEventListener('click',()=>openChecklist().catch(err=>alert(err.message)));
