import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
test('script de smoke HTML compila como módulo JavaScript',()=>{
 const html=readFileSync(new URL('./browser-smoke.html',import.meta.url),'utf8');
 const source=html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
 assert.ok(source,'Falta script de pruebas');
 const result=spawnSync(process.execPath,['--check','--input-type=module'],{input:source,encoding:'utf8'});
 assert.equal(result.status,0,result.stderr||'Error de sintaxis');
});
