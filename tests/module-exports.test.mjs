import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
const root=resolve(import.meta.dirname,'..');
test('todos los imports locales de app están exportados',()=>{
 const missing=[];
 for(const name of readdirSync(resolve(root,'app')).filter(n=>n.endsWith('.js'))){
  const source=readFileSync(resolve(root,'app',name),'utf8');
  for(const match of source.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"](\.[^'"]+)['"]/g)){
   const target=readFileSync(resolve(dirname(resolve(root,'app',name)),match[2]),'utf8');
   for(const entry of match[1].split(',')){
    const symbol=entry.trim().split(/\s+as\s+/)[0].trim();
    const expression=new RegExp('export\\s+(?:async\\s+)?(?:function|const|let|class)\\s+'+symbol+'\\b');
    if(!expression.test(target))missing.push(`${name}: ${symbol} desde ${match[2]}`);
   }
  }
 }
 assert.deepEqual(missing,[]);
});
