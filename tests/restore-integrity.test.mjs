import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeRestore,inspectRestore,restoreBackup} from '../app/db.js';
const ts='2026-10-10T00:00:00Z';
const mem=id=>({id,title:id,body:'body',tags:[],createdAt:ts,updatedAt:ts});
const obj=(id,slot)=>({id,roomId:'it',slot,title:'Objeto',description:'',createdAt:ts,updatedAt:ts});
const empty={memories:[],links:[],objects:[],reviews:[]};
test('inspectRestore está exportada (import del módulo principal)',()=>assert.equal(typeof inspectRestore,'function'));
test('detecta colisión de memoria sin mutar los datos',()=>{
 const existing={...empty,memories:[mem('a')]},data={...empty,memories:[mem('a')]};
 assert.equal(analyzeRestore(existing,data).collisions.memories,1);
 assert.equal(existing.memories.length,1);
});
test('detecta posiciones ocupadas',()=>assert.equal(analyzeRestore({...empty,objects:[obj('it/custom-old',2)]},{...empty,objects:[obj('it/custom-new',2)]}).slotConflicts,1));
test('acepta objeto integrado sin objeto personalizado',()=>assert.equal(analyzeRestore(empty,{...empty,memories:[mem('m')],links:[{id:'it/server::m',objectId:'it/server',memoryId:'m'}]}).invalidLinks,0));
test('rechaza vínculo con objeto inexistente',()=>assert.equal(analyzeRestore(empty,{...empty,links:[{id:'it/missing::m',objectId:'it/missing',memoryId:'m'}]}).invalidLinks,1));
test('rechaza vínculos que apuntan a objeto eliminado',()=>assert.equal(analyzeRestore(empty,{...empty,links:[{id:'it/custom-unknown::m',objectId:'it/custom-unknown',memoryId:'m'}]}).invalidLinks,1));
test('restauración expone API sin exigir navegadores',()=>assert.equal(typeof restoreBackup,'function'));

test('rechaza vínculo con memoria inexistente',()=>assert.equal(analyzeRestore(empty,{...empty,links:[{id:'it/server::missing',objectId:'it/server',memoryId:'missing'}]}).invalidLinks,1));
test('acepta vínculo con memoria presente en copia',()=>assert.equal(analyzeRestore(empty,{...empty,memories:[mem('valid')],links:[{id:'it/server::valid',objectId:'it/server',memoryId:'valid'}]}).invalidLinks,0));
test('rechaza dos objetos entrantes que ocupan la misma posición',()=>assert.equal(analyzeRestore(empty,{...empty,objects:[obj('it/custom-a',3),obj('it/custom-b',3)]}).slotConflicts,1));
