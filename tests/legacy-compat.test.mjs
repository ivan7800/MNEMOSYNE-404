import test from 'node:test';
import assert from 'node:assert/strict';
import {validateBackup,createBackup} from '../app/backup.js';
import {nextReview,due,routeForRoom} from '../app/learning.js';
const time='2026-10-10T10:00:00.000Z';
const memory={id:'legacy-1',title:'Memoria antigua',body:'Persistir',tags:[],createdAt:time,updatedAt:time};
for(const version of [1,2])test(`copia heredada v${version}: mantiene memoria y normaliza colecciones`,()=>{
 const payload=createBackup([memory],[]);payload.schemaVersion=version;
 if(version===1)delete payload.objects;
 delete payload.reviews;
 const restored=validateBackup(JSON.stringify(payload));
 assert.equal(restored.memories[0].body,'Persistir');
 assert.deepEqual(restored.reviews,[]);
 assert.deepEqual(restored.objects,[]);
});
test('repetición espaciada: fecha de siguiente repaso determinista',()=>{
 const result=nextReview(null,2,new Date(time));
 assert.equal(result.dueAt,'2026-10-13T10:00:00.000Z');
 assert.equal(due([memory],[{memoryId:memory.id,...result}],new Date(time)).length,0);
 assert.equal(due([memory],[{memoryId:memory.id,...result}],new Date(result.dueAt)).length,1);
});
test('ruta de aprendizaje ignora enlaces de salas diferentes',()=>{
 const links=[{objectId:'it/server',memoryId:'legacy-1'},{objectId:'library/desk',memoryId:'other'}];
 assert.deepEqual(routeForRoom('it',links,[memory]).map(m=>m.id),['legacy-1']);
});
