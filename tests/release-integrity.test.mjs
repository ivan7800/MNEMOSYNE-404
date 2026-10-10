import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const db=readFileSync(resolve(root,'app/db.js'),'utf8');
const app=readFileSync(resolve(root,'app/main.js'),'utf8');
const html=readFileSync(resolve(root,'index.html'),'utf8');
test('nuevo guardado de memoria y vínculo usa transacción atómica',()=>{
 assert.match(db,/export function saveMemoryWithLink/);
 assert.match(db,/tx\(db,\['memories','links'\],'readwrite'/);
 assert.match(app,/await saveMemoryWithLink\(db,memory,selectedObject\)/);
});
test('actualización IndexedDB cierra conexión anterior para desbloquear migraciones',()=>{
 assert.match(db,/onversionchange=\(\)=>connection\.close\(\)/);
});
test('entrada de GitHub Pages sin dependencias externas',()=>{
 assert.ok(existsSync(resolve(root,'.nojekyll')));
 assert.match(html,/src="\.\/app\/main\.js"/);
 assert.doesNotMatch(html,/<script[^>]+src="https?:\/\//);
});
