// Knowledge helpers are pure wherever possible: no network, no HTML execution.
export function wikiTargets(text){
 const matches=String(text||'').matchAll(/\[\[([^\]\r\n]{1,120})\]\]/g);
 return [...new Set([...matches].map(m=>m[1].trim()).filter(Boolean))];
}
export function backlinksFor(memory,memories){
 const title=memory.title.trim().toLocaleLowerCase('es');
 return memories.filter(m=>m.id!==memory.id&&wikiTargets(m.body).some(t=>t.toLocaleLowerCase('es')===title));
}
export function resolveWiki(target,memories){
 const value=target.trim().toLocaleLowerCase('es');
 return memories.find(m=>m.id===target)||memories.find(m=>m.title.trim().toLocaleLowerCase('es')===value)||null;
}
export function searchMemories(memories,{query='',collection='',tag='',sort='recent'}={}){
 const words=String(query).toLocaleLowerCase('es').trim().split(/\s+/).filter(Boolean);
 const filtered=memories.filter(m=>{
  if(collection&&m.collection!==collection)return false;
  if(tag&&!m.tags.some(t=>t.toLocaleLowerCase('es')===tag.toLocaleLowerCase('es')))return false;
  const body=[m.title,m.body,...m.tags,m.collection||''].join(' ').toLocaleLowerCase('es');
  return words.every(word=>body.includes(word));
 });
 if(sort==='title')return filtered.sort((a,b)=>a.title.localeCompare(b.title,'es'));
 if(sort==='oldest')return filtered.sort((a,b)=>a.updatedAt.localeCompare(b.updatedAt));
 return filtered.sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
}
export function collectionNames(memories){
 return [...new Set(memories.map(m=>m.collection||'').filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
}
export function tagNames(memories){
 return [...new Set(memories.flatMap(m=>m.tags))].sort((a,b)=>a.localeCompare(b,'es'));
}
function appendInline(parent,text,onWiki){
 const re=/\[\[([^\]\r\n]{1,120})\]\]|\*\*([^*\r\n]+)\*\*/g;let from=0;let match;
 while((match=re.exec(text))){
  if(match.index>from)parent.append(document.createTextNode(text.slice(from,match.index)));
  if(match[1]){const target=match[1];const btn=document.createElement('button');btn.type='button';btn.className='wiki-ref';btn.textContent=target;btn.title='Abrir memoria relacionada';btn.addEventListener('click',()=>onWiki(target));parent.append(btn);}
  else{const strong=document.createElement('strong');strong.textContent=match[2];parent.append(strong);}
  from=re.lastIndex;
 }
 if(from<text.length)parent.append(document.createTextNode(text.slice(from)));
}
export function renderMarkdownSafe(markdown,onWiki=()=>{}){
 const fragment=document.createDocumentFragment();let list=null,code=null;
 for(const line of String(markdown||'').split(/\r?\n/)){
  if(/^```/.test(line.trim())){if(code){fragment.append(code);code=null;}else{code=document.createElement('pre');code.className='md-code';}list=null;continue;}
  if(code){code.append(document.createTextNode(line+'\n'));continue;}
  if(!line.trim()){list=null;continue;}
  const heading=line.match(/^(#{1,3})\s+(.+)$/);
  const bullet=line.match(/^\s*[-*]\s+(.+)$/);
  if(heading){list=null;const node=document.createElement('h'+Math.min(6,heading[1].length+2));appendInline(node,heading[2],onWiki);fragment.append(node);}
  else if(bullet){if(!list){list=document.createElement('ul');fragment.append(list);}const item=document.createElement('li');appendInline(item,bullet[1],onWiki);list.append(item);}
  else{list=null;const p=document.createElement('p');appendInline(p,line,onWiki);fragment.append(p);}
 }
 if(code)fragment.append(code);
 return fragment;
}
