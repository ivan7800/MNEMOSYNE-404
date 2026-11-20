import {rooms} from './rooms.js';
import {createScene} from './scene.js';
import {openDatabase,listMemories,saveMemory,saveMemoryWithLink,deleteMemory,listLinks,addLink,removeLink,restoreBackup,inspectRestore,listObjects,saveObject,deleteObject,listReviews,saveReview,readSnapshot} from './db.js';
import {nextReview,due,routeForRoom,learningStats} from './learning.js';
import {createBackup,validateBackup,downloadBackup} from './backup.js';
import {exportKnowledge,parseKnowledgeJSON,parseMarkdown,prepareEntries} from './interchange.js';
import {searchMemories,collectionNames,tagNames,backlinksFor,resolveWiki,renderMarkdownSafe,wikiTargets} from './knowledge.js';
const $=id=>document.getElementById(id);let selected=null,selectedObject=null,mode='3d',scene=null,db=null,memories=[],links=[],editing=null,customObjects=[],objectEditing=null,reviews=[],learnQueue=[],learnIndex=0,learnMode="review";const PAGE_SIZE=60;let visibleCount=PAGE_SIZE,searchTimer=null,walkMode=false;
const objectsFor=room=>[...room.objects.map(o=>({...o,custom:false,slot:-1})),...customObjects.filter(o=>o.roomId===room.id).map(o=>({...o,custom:true}))];
function el(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;}
function status(message){$('data-status').textContent=message;}
function objectKey(roomId,objectId){return `${roomId}/${objectId}`;}
function showRoom(id){const room=rooms.find(r=>r.id===id);selected=room?.id??null;selectedObject=null;$('room-title').textContent=room?.title??'Tu palacio está abierto.';$('room-desc').textContent=room?.description??'Selecciona una sala y después un objeto para asociar conocimientos.';$('status').textContent=room?`Explorando ${room.title}`:'Selecciona una sala para comenzar';const holder=$('object-list');holder.replaceChildren();if(room){for(const obj of objectsFor(room)){const b=el('button','object');b.type='button';const t=el('span','txt');t.append(el('strong','',obj.title),el('small','',obj.description));b.append(t);b.addEventListener('click',()=>{selectedObject=obj.custom?obj.id:objectKey(room.id,obj.id);$('status').textContent=`${room.title} · ${obj.title}`;$('room-desc').textContent=obj.description;holder.querySelectorAll('button').forEach(n=>n.classList.toggle('selected',n===b));renderMemories();renderReviewStats();});if(obj.custom){const actions=el('span','object-actions');for(const [label,act] of [['Editar',()=>openObjectEditor(obj)],['Eliminar',()=>removeObject(obj)]]){const edit=el('button','',label);edit.type='button';edit.addEventListener('click',e=>{e.stopPropagation();act();});actions.append(edit);}const row=el('div','object-row');row.append(b,actions);holder.append(row);}else holder.append(b);}}else holder.append(el('p','muted','Elige una estancia.'));document.querySelectorAll('[data-room]').forEach(node=>{const active=node.dataset.room===selected;node.classList.toggle('selected',active);node.setAttribute('aria-pressed',String(active));});$('new-object').disabled=!room||!db;renderMemories();}
for(const [i,room] of rooms.entries()){const b=el('button','room');b.type='button';b.dataset.room=room.id;const t=el('span','txt');t.append(el('strong','',room.title),el('small','',room.subtitle));b.append(el('span','index',String(i+1).padStart(2,'0')),t);b.addEventListener('click',()=>showRoom(room.id));$('room-list').append(b);const tile=el('button','tile');tile.type='button';tile.dataset.room=room.id;tile.append(el('span','number',String(i+1).padStart(2,'0')+' / ESTANCIA'),el('span','name',room.title),el('span','hint',room.subtitle));tile.addEventListener('click',()=>showRoom(room.id));$('map2d').append(tile);}
function setMode(next){mode=next;$('scene').hidden=mode==='2d';$('map2d').hidden=mode!=='2d';$('mode').textContent=mode==='3d'?'Modo 2D':'Modo 3D';$('mode').setAttribute('aria-label',mode==='3d'?'Cambiar al mapa 2D':'Cambiar al palacio 3D');$('engine').textContent=mode==='3d'?'WebGL · Motor 3D':'Mapa accesible · 2D';$('instructions').textContent=mode==='3d'?'Arrastra para girar · Rueda para zoom · Pulsa una sala para explorar':'Selecciona una sala; usa Tab y Enter para navegar';$('walk').disabled=mode!=='3d'||!scene;$('walk-controls').hidden=mode!=='3d'||!walkMode;if(mode==='3d')scene?.render();}
$('mode').addEventListener('click',()=>setMode(mode==='3d'?'2d':'3d'));
$('reset').addEventListener('click',()=>{walkMode=false;$('walk').textContent='Explorar a pie';$('walk-controls').hidden=true;scene?.reset();showRoom(null);$('status').textContent='Vista centrada · Vestíbulo';});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('dialog[open]')){showRoom(null);$('status').textContent='De vuelta al vestíbulo';}});
$('scene').addEventListener('mnemosyne:webgl-lost',()=>{setMode('2d');$('mode').disabled=true;$('mode').title='El contexto WebGL se ha perdido; recarga para reintentar';$('status').textContent='Se ha perdido el contexto WebGL: modo 2D disponible. Recarga para reintentar.';});
try{scene=createScene($('scene'),showRoom);setMode('3d');}catch(err){console.warn('WebGL no disponible:',err);setMode('2d');$('mode').disabled=true;$('mode').title='WebGL no está disponible';$('status').textContent='WebGL no disponible: modo 2D activado';}
function renderMemories(){
 const holder=$('memory-list');holder.replaceChildren();
 const query=$('search').value.trim(),collection=$('collection-filter').value,tag=$('tag-filter').value;
 const associated=selectedObject?new Set(links.filter(l=>l.objectId===selectedObject).map(l=>l.memoryId)):null;
 let filtered=searchMemories(memories,{query,collection,tag,sort:$('sort-filter').value});
 if(associated&&!query)filtered=filtered.filter(m=>associated.has(m.id));
 $('library-stats').textContent=memories.length+' memorias · '+links.length+' vínculos · '+filtered.length+' resultados';
 $('link-memory').disabled=!selectedObject||!db;$('new-memory').disabled=!db;
 $('more-memories').hidden=filtered.length<=visibleCount;
 if(!filtered.length){holder.append(el('p','muted',selectedObject&&!query?'Este objeto todavía no tiene memorias vinculadas.':'No hay memorias que mostrar.'));return;}
 for(const m of filtered.slice(0,visibleCount)){
  const card=el('article','memory-card');
  const meta=[m.collection||'Sin colección',m.tags.join(' · ')||'Sin etiquetas'];
  card.append(el('strong','',m.title),el('small','',meta.join(' · ')),el('p','',m.body.length>320?m.body.slice(0,320)+'…':m.body));
  const actions=el('div','actions'),open=el('button','','Leer'),edit=el('button','','Editar'),del=el('button','','Eliminar');
  open.type=edit.type=del.type='button';
  open.addEventListener('click',()=>openReader(m));
  edit.addEventListener('click',()=>openEditor(m));del.addEventListener('click',()=>remove(m));actions.append(open,edit,del);
  if(selectedObject){
   const linked=associated.has(m.id),toggle=el('button','',linked?'Desvincular':'Vincular');
   toggle.type='button';toggle.addEventListener('click',async()=>{
    try{if(linked)await removeLink(db,selectedObject,m.id);else await addLink(db,selectedObject,m.id);
     await refresh();status(linked?'Memoria desvinculada.':'Memoria vinculada al objeto.');
    }catch(e){status('Error de vinculación: '+e.message);}
   });actions.append(toggle);
  }
  card.append(actions);holder.append(card);
 }
}
function updateFilterOptions(){
 for(const [id,values,caption] of [['collection-filter',collectionNames(memories),'Todas las colecciones'],['tag-filter',tagNames(memories),'Todas las etiquetas']]){
  const select=$(id),previous=select.value;select.replaceChildren();
  const option=el('option','',caption);option.value='';select.append(option);
  for(const name of values){const opt=el('option','',name);opt.value=name;select.append(opt);}
  select.value=values.includes(previous)?previous:'';
 }
}
for(const id of ['collection-filter','tag-filter','sort-filter'])$(id).addEventListener('change',()=>{visibleCount=PAGE_SIZE;renderMemories();});
function openReader(memory){
 $('reader-title').textContent=memory.title;
 $('reader-meta').textContent=(memory.collection||'Sin colección')+' · '+memory.tags.join(', ');
 const holder=$('reader-content');holder.replaceChildren(renderMarkdownSafe(memory.body,name=>{
  const target=resolveWiki(name,memories);
  if(!target){status('No existe ninguna memoria titulada '+name);return;}
  openReader(target);
 }));
 const relations=$('reader-relations');relations.replaceChildren();
 const outgoing=wikiTargets(memory.body),incoming=backlinksFor(memory,memories);
 for(const target of outgoing){const b=el('button','',target);b.type='button';b.addEventListener('click',()=>{const m=resolveWiki(target,memories);if(m)openReader(m);else status('Referencia sin destino: '+target);});relations.append(b);}
 for(const source of incoming){const b=el('button','', '← '+source.title);b.type='button';b.addEventListener('click',()=>openReader(source));relations.append(b);}
 if(!relations.children.length)relations.append(el('p','muted','Todavía no hay referencias a esta memoria.'));
 if(!$('reader').open)$('reader').showModal();
}
$('reader-close').addEventListener('click',()=>$('reader').close());
function previewMemory(){
 const holder=$('memory-preview');holder.replaceChildren(renderMarkdownSafe($('memory-body').value,name=>{
  const match=resolveWiki(name,memories);if(match){$('editor').close();openReader(match);}else $('editor-error').textContent='Referencia sin destino: '+name;
 }));
}
$('preview-memory').addEventListener('click',()=>{
 const target=$('memory-preview');target.hidden=!target.hidden;
 $('preview-memory').textContent=target.hidden?'Vista previa Markdown':'Ocultar vista previa';
 if(!target.hidden)previewMemory();
});
$('memory-body').addEventListener('input',()=>{if(!$('memory-preview').hidden)previewMemory();});

$('more-memories').addEventListener('click',()=>{visibleCount+=PAGE_SIZE;renderMemories();});

async function refresh(){[memories,links,customObjects,reviews]=await Promise.all([listMemories(db),listLinks(db),listObjects(db),listReviews(db)]);updateFilterOptions();renderReviewStats();if(selected)showRoomPreservingSelection();else renderMemories();scene?.updateObjects(customObjects);}
function showRoomPreservingSelection(){const old=selectedObject;showRoom(selected);if(old){const buttons=[...$('object-list').querySelectorAll('button.object')];const room=rooms.find(r=>r.id===selected);const idx=objectsFor(room).findIndex(o=>objectKey(room.id,o.id)===old||o.id===old);if(idx>=0)buttons[idx].click();}}
function openObjectEditor(obj=null){if(!db||!selected)return;const room=rooms.find(r=>r.id===selected);const used=new Set(customObjects.filter(o=>o.roomId===room.id&&o.id!==obj?.id).map(o=>o.slot));const slots=$('object-slot');slots.replaceChildren();for(let i=0;i<12;i++){if(used.has(i))continue;const option=el('option','',`Posición ${i+1}`);option.value=String(i);slots.append(option);}if(!slots.options.length){status('Esta sala ya tiene el máximo de 12 objetos personalizados.');return;}objectEditing=obj?.id||null;$('object-editor-title').textContent=obj?'Editar objeto':'Nuevo objeto';$('object-name').value=obj?.title||'';$('object-description').value=obj?.description||'';slots.value=String(obj?.slot??Number(slots.options[0].value));$('object-error').textContent='';$('object-editor').showModal();$('object-name').focus();}
$('new-object').addEventListener('click',()=>openObjectEditor());$('cancel-object').addEventListener('click',()=>$('object-editor').close());
$('object-form').addEventListener('submit',async e=>{e.preventDefault();if(!db||!selected)return;const title=$('object-name').value.trim(),description=$('object-description').value.trim(),slot=Number($('object-slot').value);if(!title||title.length>80||description.length>500||!Number.isInteger(slot)||slot<0||slot>11){$('object-error').textContent='Nombre o posición inválidos.';return;}if(customObjects.some(o=>o.roomId===selected&&o.slot===slot&&o.id!==objectEditing)){$('object-error').textContent='La posición ya está ocupada.';return;}const old=customObjects.find(o=>o.id===objectEditing),now=new Date().toISOString();const obj={id:old?.id||`${selected}/custom-${crypto.randomUUID()}`,roomId:selected,title,description,slot,createdAt:old?.createdAt||now,updatedAt:now};try{await saveObject(db,obj);await refresh();$('object-editor').close();status(old?'Objeto actualizado.':'Objeto creado y guardado.');}catch(err){$('object-error').textContent=err.message;}});
async function removeObject(obj){if(!confirm(`¿Eliminar «${obj.title}»? Se eliminarán sus vínculos, pero no las memorias.`))return;try{await deleteObject(db,obj.id);selectedObject=null;await refresh();status('Objeto eliminado. Sus memorias se han conservado.');}catch(e){status(`Error al eliminar: ${e.message}`);}}
function openEditor(memory=null){if(!db){status('Almacenamiento no disponible.');return;}editing=memory?.id||null;$('editor-title').textContent=memory?'Editar memoria':'Nueva memoria';$('memory-title').value=memory?.title||'';$('memory-body').value=memory?.body||'';$('memory-tags').value=memory?.tags.join(', ')||'';$('memory-collection').value=memory?.collection||'';$('memory-preview').hidden=true;$('preview-memory').textContent='Vista previa Markdown';$('editor-error').textContent='';$('editor').showModal();$('memory-title').focus();}
$('new-memory').addEventListener('click',()=>openEditor());$('cancel-edit').addEventListener('click',()=>$('editor').close());$('search').addEventListener('input',()=>{clearTimeout(searchTimer);visibleCount=PAGE_SIZE;searchTimer=setTimeout(renderMemories,150);});
$('memory-form').addEventListener('submit',async e=>{e.preventDefault();if(!db)return;const title=$('memory-title').value.trim(),body=$('memory-body').value.trim(),tags=[...new Set($('memory-tags').value.split(',').map(v=>v.trim()).filter(Boolean))];if(!title||!body){$('editor-error').textContent='Introduce título y contenido.';return;}if(title.length>120||body.length>40000||tags.length>20||tags.some(t=>t.length>100)){$('editor-error').textContent='Máximo 120 caracteres de título, 40.000 de contenido, 20 etiquetas y 100 caracteres por etiqueta.';return;}const collection=$('memory-collection').value.trim();
 if(collection.length>80){$('editor-error').textContent='La colección admite un máximo de 80 caracteres.';return;}
 const old=memories.find(m=>m.id===editing);const now=new Date().toISOString();
 const memory={id:old?.id||crypto.randomUUID(),title,body,tags,...(collection?{collection}:{}),createdAt:old?.createdAt||now,updatedAt:now};try{if(selectedObject&&!old)await saveMemoryWithLink(db,memory,selectedObject);else await saveMemory(db,memory);await refresh();$('editor').close();status(old?'Memoria actualizada y guardada.':'Memoria creada y guardada.');}catch(err){$('editor-error').textContent=`No se ha podido guardar: ${err.message}`;}});
async function remove(memory){if(!confirm(`¿Eliminar definitivamente «${memory.title}» y sus vínculos?`))return;try{await deleteMemory(db,memory.id);await refresh();status('Memoria eliminada.');}catch(e){status(`No se ha podido eliminar: ${e.message}`);}}
$('link-memory').addEventListener('click',()=>{if(!selectedObject)return;$('search').value='';renderMemories();const names=memories.filter(m=>!links.some(l=>l.objectId===selectedObject&&l.memoryId===m.id));if(!names.length){status('Crea una memoria nueva para vincularla, o desvincula una existente.');return;}const holder=$('memory-list');holder.replaceChildren();$('more-memories').hidden=true;holder.append(el('p','muted','Elige una memoria existente para vincular:'));for(const m of names){const b=el('button','object',m.title);b.type='button';b.addEventListener('click',async()=>{try{await addLink(db,selectedObject,m.id);await refresh();status('Memoria vinculada correctamente.');}catch(e){status(`Error: ${e.message}`);}});holder.append(b);}});
showRoom(null);(async()=>{try{db=await openDatabase();await refresh();status('Biblioteca local preparada · IndexedDB');}catch(e){console.error(e);status(`No se ha podido abrir IndexedDB: ${e.message}`);$('new-memory').disabled=true;$('link-memory').disabled=true;}})();


// Copias coherentes: leer IndexedDB de nuevo, no exportar vistas que puedan estar obsoletas.
async function exportFreshBackup(){
 const snapshot=await readSnapshot(db);
 downloadBackup(createBackup(snapshot.memories,snapshot.links,snapshot.objects,snapshot.reviews));
}
$('export-backup').addEventListener('click',async()=>{
 if(!db){status('IndexedDB no disponible.');return;}
 try{await exportFreshBackup();status('Copia JSON generada con los datos actuales. Guárdala fuera del navegador.');}
 catch(e){status('Exportación fallida: '+e.message);}
});
$('import-backup').addEventListener('click',()=>{if(!db){status('IndexedDB no disponible.');return;}$('backup-file').value='';$('backup-file').click();});
function chooseRestore(audit,data){
 const total=Object.values(audit.collisions).reduce((sum,n)=>sum+n,0);
 const dialog=$('restore-dialog');
 $('restore-summary').textContent='Copia validada: '+data.memories.length+' memorias, '+data.links.length+' vínculos, '+data.objects.length+' objetos y '+data.reviews.length+' repasos.';
 $('restore-warnings').textContent=total+' IDs repetidos, '+audit.slotConflicts+' posiciones ocupadas y '+audit.invalidLinks+' vínculos sin destino. "Omitir" no sobrescribe; "Sustituir" elimina los datos actuales.';
 $('restore-merge').disabled=Boolean(total||audit.slotConflicts||audit.invalidLinks);
 return new Promise(resolve=>{
  dialog.addEventListener('close',()=>resolve(dialog.returnValue||'cancel'),{once:true});
  dialog.showModal();
 });
}
$('backup-file').addEventListener('change',async()=>{
 const file=$('backup-file').files?.[0];if(!file)return;
 try{
  if(file.size>64*1024*1024)throw Error('El archivo supera 64 MB.');
  const data=validateBackup(await file.text());
  const audit=await inspectRestore(db,data);
  const mode=await chooseRestore(audit,data);
  if(!['merge','skip','replace'].includes(mode)){status('Importación cancelada; no se han modificado datos.');return;}
  if(mode==='replace'){
   // Ofrecer la copia ANTES de solicitar el consentimiento destructivo.
   await exportFreshBackup();
   if(prompt('Se ha ofrecido la descarga de una copia de tu biblioteca actual. Comprueba que está guardada antes de continuar. Esta operación borrará los datos existentes. Escribe RESTAURAR para confirmar:')!=='RESTAURAR'){
    status('Sustitución cancelada; la biblioteca no se ha modificado.');return;
   }
  }
  const report=await restoreBackup(db,data,mode);await refresh();
  const skipped=Object.values(report?.skipped||{}).reduce((sum,n)=>sum+n,0);
  status('Restauración completada ('+mode+'): '+report.data.memories.length+' memorias añadidas; '+skipped+' registros omitidos. '+(mode==='replace'?'La biblioteca anterior ha sido sustituida.':'Los registros existentes se han conservado.'));
 }catch(e){status('Importación rechazada: '+e.message);}
});

function renderReviewStats(){
 const stats=learningStats(memories,reviews);
 const goal=Math.max(1,Math.min(100,Number($('daily-goal').value)||10));
 $('review-stats').textContent=stats.due+' pendientes · '+stats.learned+' con seguimiento · '+stats.successRate+'% aciertos · '+stats.streak+' días de racha';
 $('goal-progress').value=Math.min(goal,stats.doneToday);$('goal-progress').max=goal;
 $('goal-label').textContent=stats.doneToday+' / '+goal+' repasos hoy';
 $('start-review').disabled=!db||!stats.due;
 $('start-route').disabled=!db||!selected||!routeForRoom(selected,links,memories).length;
}
$('daily-goal').addEventListener('change',()=>{try{localStorage.setItem('mnemosyne.goal',$('daily-goal').value);}catch{}renderReviewStats();});
try{$('daily-goal').value=localStorage.getItem('mnemosyne.goal')||'10';}catch{}
function beginLearning(kind){if(!db)return;learnMode=kind;learnQueue=kind==='route'?routeForRoom(selected,links,memories):due(memories,reviews);learnIndex=0;if(!learnQueue.length){status('No hay memorias disponibles para este recorrido.');return;}$('learn-dialog').showModal();showLearnCard();}
function showLearnCard(){const m=learnQueue[learnIndex];if(!m){$('learn-dialog').close();status('Sesión de aprendizaje completada.');renderReviewStats();return;}$('learn-heading').textContent=learnMode==='route'?'Ruta de aprendizaje':'Repaso espaciado';$('learn-progress').textContent=`Memoria ${learnIndex+1} de ${learnQueue.length}`;$('learn-question').textContent=m.title;$('learn-answer').replaceChildren(renderMarkdownSafe(m.body,name=>{const match=resolveWiki(name,memories);if(match){$('learn-dialog').close();openReader(match);}}));$('learn-answer').hidden=true;$('learn-error').textContent='Intenta recordar su contenido antes de mostrarlo.';$('learn-reveal').hidden=false;for(const id of ['learn-again','learn-hard','learn-good'])$(id).hidden=true;}
$('start-route').addEventListener('click',()=>beginLearning('route'));
$('start-review').addEventListener('click',()=>beginLearning('review'));
$('learn-reveal').addEventListener('click',()=>{$('learn-answer').hidden=false;$('learn-reveal').hidden=true;$('learn-error').textContent='Califica cuánto recordabas.';for(const id of ['learn-again','learn-hard','learn-good'])$(id).hidden=false;});
for(const [id,grade] of [['learn-again',0],['learn-hard',1],['learn-good',2]])$(id).addEventListener('click',async()=>{const m=learnQueue[learnIndex];try{const old=reviews.find(r=>r.memoryId===m.id);const next={memoryId:m.id,...nextReview(old,grade)};await saveReview(db,next);reviews=reviews.filter(r=>r.memoryId!==m.id).concat(next);learnIndex++;renderReviewStats();showLearnCard();}catch(err){$('learn-error').textContent=`No se guardó el repaso: ${err.message}`;}});
$('learn-close').addEventListener('click',()=>{$('learn-dialog').close();renderReviewStats();});
$('learn-dialog').addEventListener('close',renderReviewStats);

// Intercambio optativo: entradas importadas con IDs nuevos para evitar sobrescrituras.
$('export-knowledge').addEventListener('click',()=>{
 if(!db){status('IndexedDB no disponible.');return;}
 const blob=new Blob([JSON.stringify(exportKnowledge(memories),null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='MNEMOSYNE-404-knowledge.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 status('Archivo de intercambio exportado. Para respaldo completo usa Exportar JSON.');
});
$('import-knowledge').addEventListener('click',()=>{if(!db){status('IndexedDB no disponible.');return;}$('knowledge-file').value='';$('knowledge-file').click();});
$('knowledge-file').addEventListener('change',async()=>{
 const files=[...$('knowledge-file').files];if(!files.length)return;
 try{
  if(files.length>50)throw Error('Máximo 50 archivos por importación.');
  let entries=[];
  for(const f of files){if(f.size>8*1024*1024)throw Error(`Archivo demasiado grande: ${f.name}`);
   const raw=await f.text();
   if(/\.md$/i.test(f.name))entries.push(parseMarkdown(f.name,raw));
   else if(/\.json$/i.test(f.name))entries.push(...parseKnowledgeJSON(raw));
   else throw Error(`Extensión no admitida: ${f.name}`);
  }
  if(entries.length>2000)throw Error('Máximo 2000 memorias por importación.');
  if(!entries.length){status('No hay conocimientos para importar.');return;}
  if(!confirm(`Se crearán ${entries.length} memorias nuevas${selectedObject?' vinculadas al objeto elegido':''}. No se sustituirán memorias existentes. ¿Continuar?`)){status('Importación cancelada.');return;}
  const data=prepareEntries(entries,selectedObject);
  await restoreBackup(db,data,'merge');await refresh();status(`Importadas ${entries.length} memorias sin sobrescribir las existentes.`);
 }catch(e){status(`Importación de conocimiento rechazada: ${e.message}`);}
});


// Immersive tour is optional; the complete sidebar and 2D map remain accessible.
$('walk').addEventListener('click',()=>{
 if(!scene||mode!=='3d')return;
 walkMode=scene.setWalk(!walkMode);
 $('walk').textContent=walkMode?'Salir del recorrido':'Explorar a pie';
 $('walk-controls').hidden=!walkMode;
 $('instructions').textContent=walkMode?'WASD: avanzar y moverse · Flechas: orientar · E: abrir sala · Arrastrar: mirar':'Arrastra para girar · Rueda para zoom · Pulsa una sala';
});
for(const button of document.querySelectorAll('[data-walk]')){
 button.addEventListener('click',()=>scene?.moveWalk(button.dataset.walk));
}
$('quality-select').addEventListener('change',()=>{scene?.setQuality($('quality-select').value);try{localStorage.setItem('mnemosyne.quality',$('quality-select').value);}catch{}});
try{$('quality-select').value=localStorage.getItem('mnemosyne.quality')||'high';}catch{}
scene?.setQuality($('quality-select').value);
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
 window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(e=>console.warn('PWA sin registrar:',e)));
}
