// Intercambio documentado de conocimientos. No es una API privada de Second Brain.
export const INTERCHANGE_FORMAT='mnemosyne404-knowledge';
export const INTERCHANGE_VERSION=1;
const LIMIT=8*1024*1024;
const validText=(s,max)=>typeof s==='string'&&s.length>0&&s.length<=max;
export function exportKnowledge(memories){return {format:INTERCHANGE_FORMAT,schemaVersion:INTERCHANGE_VERSION,exportedAt:new Date().toISOString(),entries:memories.map(m=>({title:m.title,content:m.body,tags:[...m.tags]}))};}
export function parseKnowledgeJSON(raw){
 if(typeof raw!=='string'||new Blob([raw]).size>LIMIT)throw Error('El JSON supera 8 MB.');
 let o;try{o=JSON.parse(raw);}catch{throw Error('JSON inválido.');}
 if(!o||o.format!==INTERCHANGE_FORMAT||o.schemaVersion!==1||!Array.isArray(o.entries)||o.entries.length>2000)throw Error('Formato no compatible. Se requiere mnemosyne404-knowledge v1.');
 return o.entries.map((entry,i)=>{
  if(!entry||!validText(entry.title,120)||!validText(entry.content,40000)||!Array.isArray(entry.tags)||entry.tags.length>20||entry.tags.some(t=>typeof t!=='string'||t.length>100))throw Error(`Entrada ${i+1} no válida.`);
  return {title:entry.title,body:entry.content,tags:[...new Set(entry.tags)]};
 });
}
export function parseMarkdown(name,raw){
 if(!/\.md$/i.test(name)||typeof raw!=='string'||!raw.trim()||new Blob([raw]).size>100000)throw Error('Markdown vacío, inválido o superior a 100 KB.');
 const sanitizedName=name.replace(/\.md$/i,'').trim();
 const heading=raw.match(/^#\s+(.+)$/m)?.[1]?.trim();
 const title=(heading||sanitizedName).slice(0,120);
 if(!title)throw Error('El archivo no tiene título.');
 if(raw.length>40000)throw Error('El Markdown supera 40.000 caracteres; divide el documento antes de importarlo. No se ha recortado.');
 return {title,body:raw,tags:['markdown']};
}
export function prepareEntries(entries,objectId=null,uuid=()=>crypto.randomUUID(),now=()=>new Date().toISOString()){
 const memories=[],links=[];
 for(const e of entries){const id=uuid(),ts=now();memories.push({id,title:e.title,body:e.body,tags:e.tags,createdAt:ts,updatedAt:ts});if(objectId)links.push({id:`${objectId}::${id}`,objectId,memoryId:id});}
 return {memories,links,objects:[],reviews:[]};
}
