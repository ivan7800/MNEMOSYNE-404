// Formato portable y validación estricta antes de cualquier escritura.
export const BACKUP_VERSION=3;
const MAX_MEMORIES=10000, MAX_LINKS=50000, MAX_BYTES=8*1024*1024;
const isObj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const str=(v,max)=>typeof v==='string'&&v.length>0&&v.length<=max;
export function createBackup(memories,links,objects=[],reviews=[]){return {format:'mnemosyne404-backup',schemaVersion:BACKUP_VERSION,exportedAt:new Date().toISOString(),memories,links,objects,reviews};}
export function validateBackup(raw){
 if(typeof raw!=='string'||new Blob([raw]).size>MAX_BYTES)throw Error('Archivo demasiado grande (máximo 8 MB).');
 let obj;try{obj=JSON.parse(raw);}catch{throw Error('El archivo no contiene JSON válido.');}
 if(!isObj(obj)||obj.format!=='mnemosyne404-backup'||![1,2,BACKUP_VERSION].includes(obj.schemaVersion)||!Array.isArray(obj.memories)||!Array.isArray(obj.links))throw Error('Formato o versión de copia no compatibles.');
 if(obj.memories.length>MAX_MEMORIES||obj.links.length>MAX_LINKS)throw Error('La copia supera los límites de registros.');
 if(obj.schemaVersion>=2&&!Array.isArray(obj.objects))throw Error('Falta la colección de objetos.');
 const objectIds=new Set(),objectKeys=new Set();
 const objects=(obj.objects||[]).map((o,i)=>{if(!isObj(o)||!str(o.id,250)||!str(o.roomId,40)||!['it','library','nexus','archive'].includes(o.roomId)||!str(o.title,80)||typeof o.description!=='string'||o.description.length>500||!Number.isInteger(o.slot)||o.slot<0||o.slot>11||!str(o.createdAt,60)||!str(o.updatedAt,60)||!Number.isFinite(Date.parse(o.createdAt))||!Number.isFinite(Date.parse(o.updatedAt))||o.id!==`${o.roomId}/${o.id.split('/').slice(1).join('/')}`||!o.id.includes('/custom-'))throw Error(`Objeto ${i+1} inválido.`);if(objectIds.has(o.id)||objectKeys.has(`${o.roomId}/${o.slot}`))throw Error('Objetos o posiciones duplicadas.');objectIds.add(o.id);objectKeys.add(`${o.roomId}/${o.slot}`);return {id:o.id,roomId:o.roomId,title:o.title,description:o.description,slot:o.slot,createdAt:o.createdAt,updatedAt:o.updatedAt};});
 if(objects.length>48)throw Error('Demasiados objetos personalizados.');
 const ids=new Set(),keys=new Set();
 const memories=obj.memories.map((m,i)=>{if(!isObj(m)||!str(m.id,150)||!str(m.title,120)||!str(m.body,40000)||!Array.isArray(m.tags)||m.tags.length>20||m.tags.some(t=>typeof t!=='string'||t.length>100)||!str(m.createdAt,60)||!str(m.updatedAt,60)||!Number.isFinite(Date.parse(m.createdAt))||!Number.isFinite(Date.parse(m.updatedAt)))throw Error(`Memoria ${i+1} inválida.`);if(ids.has(m.id))throw Error('La copia contiene IDs de memoria repetidos.');ids.add(m.id);return {id:m.id,title:m.title,body:m.body,tags:[...m.tags],createdAt:m.createdAt,updatedAt:m.updatedAt};});
 const links=obj.links.map((l,i)=>{if(!isObj(l)||!str(l.memoryId,150)||!str(l.objectId,250)||!ids.has(l.memoryId))throw Error(`Vínculo ${i+1} inválido o sin memoria.`);const id=`${l.objectId}::${l.memoryId}`;if(keys.has(id))throw Error('Vínculos repetidos en la copia.');keys.add(id);return {id,objectId:l.objectId,memoryId:l.memoryId};});
 if(obj.schemaVersion===3&&!Array.isArray(obj.reviews))throw Error('Falta la colección de repasos.');
 const reviewIds=new Set();const reviews=(obj.reviews||[]).map((r,i)=>{if(!isObj(r)||!str(r.memoryId,150)||!ids.has(r.memoryId)||reviewIds.has(r.memoryId)||!Number.isInteger(r.intervalDays)||r.intervalDays<1||r.intervalDays>180||!Number.isInteger(r.repetitions)||r.repetitions<1||r.repetitions>100000||![0,1,2].includes(r.lastGrade)||!str(r.dueAt,60)||!str(r.lastReviewedAt,60)||!Number.isFinite(Date.parse(r.dueAt))||!Number.isFinite(Date.parse(r.lastReviewedAt)))throw Error(`Repaso ${i+1} inválido.`);reviewIds.add(r.memoryId);return {memoryId:r.memoryId,intervalDays:r.intervalDays,repetitions:r.repetitions,lastGrade:r.lastGrade,dueAt:r.dueAt,lastReviewedAt:r.lastReviewedAt};});
 return {memories,links,objects,reviews};
}
export function downloadBackup(data){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`MNEMOSYNE-404-backup-${new Date().toISOString().slice(0,10)}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
