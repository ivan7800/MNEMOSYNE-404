const NAME='mnemosyne404', VERSION=3;
export function openDatabase(){return new Promise((resolve,reject)=>{const req=indexedDB.open(NAME,VERSION);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains('memories')){const memories=db.createObjectStore('memories',{keyPath:'id'});memories.createIndex('updatedAt','updatedAt');}if(!db.objectStoreNames.contains('links')){const links=db.createObjectStore('links',{keyPath:'id'});links.createIndex('objectId','objectId');links.createIndex('memoryId','memoryId');}if(!db.objectStoreNames.contains('reviews'))db.createObjectStore('reviews',{keyPath:'memoryId'});if(!db.objectStoreNames.contains('objects')){const objects=db.createObjectStore('objects',{keyPath:'id'});objects.createIndex('roomId','roomId');}};req.onsuccess=()=>{const connection=req.result;connection.onversionchange=()=>connection.close();resolve(connection);};req.onerror=()=>reject(req.error);req.onblocked=()=>reject(new Error('Base de datos bloqueada por otra pestaña.'));});}
function request(req){return new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
export function listMemories(db){return request(db.transaction('memories','readonly').objectStore('memories').getAll());}
export async function saveMemory(db,memory){await tx(db,'memories','readwrite',t=>t.objectStore('memories').put(memory));}
export async function deleteMemory(db,id){await tx(db,['memories','links','reviews'],'readwrite',t=>{t.objectStore('memories').delete(id);t.objectStore('reviews').delete(id);t.objectStore('links').index('memoryId').openCursor(IDBKeyRange.only(id)).onsuccess=e=>{const c=e.target.result;if(c){c.delete();c.continue();}};});}
export function listLinks(db){return request(db.transaction('links','readonly').objectStore('links').getAll());}
// Guardado atómico: si la vinculación falla, la memoria nueva tampoco se crea.
export function saveMemoryWithLink(db,memory,objectId){
 return tx(db,['memories','links'],'readwrite',t=>{
  t.objectStore('memories').put(memory);
  if(objectId)t.objectStore('links').put({id:`${objectId}::${memory.id}`,objectId,memoryId:memory.id});
 });
}
export function addLink(db,objectId,memoryId){return tx(db,'links','readwrite',t=>t.objectStore('links').put({id:`${objectId}::${memoryId}`,objectId,memoryId}));}
export function removeLink(db,objectId,memoryId){return tx(db,'links','readwrite',t=>t.objectStore('links').delete(`${objectId}::${memoryId}`));}
function tx(db,names,mode,write){return new Promise((resolve,reject)=>{const t=db.transaction(names,mode);t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error||new Error('Transacción cancelada'));write(t);});}
// Auditoría pura: permite comprobar conflictos sin modificar el almacenamiento.
const BUILTIN_IDS = new Set(['it/server','it/terminal','library/shelf','library/desk','nexus/network','archive/cabinet']);
export function analyzeRestore(existing,data){
 const collisions={memories:0,links:0,objects:0,reviews:0};
 for(const key of Object.keys(collisions)){
  const ids=new Set((existing[key]||[]).map(v=>key==='reviews'?v.memoryId:v.id));
  collisions[key]=(data[key]||[]).filter(v=>ids.has(key==='reviews'?v.memoryId:v.id)).length;
 }
 const objects=new Map((existing.objects||[]).map(o=>[o.id,o]));
 for(const o of data.objects||[]) objects.set(o.id,o);
 const validObjects=new Set([...BUILTIN_IDS,...objects.keys()]);
 const validMemories=new Set([...(existing.memories||[]),...(data.memories||[])].map(m=>m.id));
 const invalidLinks=(data.links||[]).filter(l=>!validObjects.has(l.objectId)||!validMemories.has(l.memoryId)).length;
 const occupied=new Set((existing.objects||[]).map(o=>`${o.roomId}/${o.slot}`));
 const incomingSlots=new Set();
 const slotConflicts=(data.objects||[]).filter(o=>{const key=`${o.roomId}/${o.slot}`;const conflict=occupied.has(key)||incomingSlots.has(key);incomingSlots.add(key);return conflict;}).length;
 return {collisions,invalidLinks,slotConflicts};
}
export async function inspectRestore(db,data){
 const [memories,links,objects,reviews]=await Promise.all([listMemories(db),listLinks(db),listObjects(db),listReviews(db)]);
 return analyzeRestore({memories,links,objects,reviews},data);
}
// Fusión protegida en una sola transacción, incluso si cambia la BD tras la inspección.
export function restoreBackup(db,data,mode='merge'){
 if(!['merge','replace'].includes(mode))return Promise.reject(new Error('Modo inválido'));
 return new Promise((resolve,reject)=>{
  const t=db.transaction(['memories','links','objects','reviews'],'readwrite');
  const stores={memories:t.objectStore('memories'),links:t.objectStore('links'),objects:t.objectStore('objects'),reviews:t.objectStore('reviews')};
  let failure=null;
  const fail=message=>{if(!failure){failure=new Error(message);try{t.abort();}catch{}}};
  t.oncomplete=()=>resolve();
  t.onerror=()=>{if(!failure)failure=t.error||new Error('Error transaccional');};
  t.onabort=()=>reject(failure||t.error||new Error('Importación cancelada'));
  const run=()=>{
   if(mode==='replace'){
    for(const store of Object.values(stores))store.clear();
   }
   for(const [key,store] of Object.entries(stores))for(const item of (data[key]||[]))store.add(item);
  };
  if(mode==='replace'){
   // Reemplazar se reserva para copias válidas y debe confirmarse en la interfaz que lo invoque.
   run();return;
  }
  const snapshots={};let remaining=4;
  for(const [key,store] of Object.entries(stores)){
   const req=store.getAll();
   req.onerror=()=>fail(`No se pudo inspeccionar ${key}`);
   req.onsuccess=()=>{
    if(failure)return;
    snapshots[key]=req.result;
    if(--remaining===0){
     const audit=analyzeRestore(snapshots,data);
     if(Object.values(audit.collisions).some(Boolean)||audit.invalidLinks||audit.slotConflicts){
      fail(`Conflictos de importación: ${JSON.stringify(audit)}`);return;
     }
     try{run();}catch(e){fail(e.message);}
    }
   };
  }
 });
}

export function listObjects(db){return request(db.transaction('objects','readonly').objectStore('objects').getAll());}
export function saveObject(db,object){return tx(db,'objects','readwrite',t=>t.objectStore('objects').put(object));}
export function deleteObject(db,id){return tx(db,['objects','links'],'readwrite',t=>{t.objectStore('objects').delete(id);t.objectStore('links').index('objectId').openCursor(IDBKeyRange.only(id)).onsuccess=e=>{const c=e.target.result;if(c){c.delete();c.continue();}};});}

export function listReviews(db){return request(db.transaction('reviews','readonly').objectStore('reviews').getAll());}
export function saveReview(db,review){return tx(db,'reviews','readwrite',t=>t.objectStore('reviews').put(review));}
