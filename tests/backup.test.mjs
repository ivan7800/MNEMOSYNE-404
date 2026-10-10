import test from 'node:test';import assert from 'node:assert/strict';import {createBackup,validateBackup} from '../app/backup.js';
const memory={id:'m1',title:'Test',body:'Contenido',tags:['IT'],createdAt:'2026-10-10T00:00:00Z',updatedAt:'2026-10-10T00:00:00Z'};
const link={id:'it/server::m1',objectId:'it/server',memoryId:'m1'};
test('exportar y validar',()=>{const result=validateBackup(JSON.stringify(createBackup([memory],[link])));assert.equal(result.memories[0].title,'Test');assert.equal(result.links[0].id,link.id);});
test('formato inválido',()=>assert.throws(()=>validateBackup('{xxx')));
test('versión desconocida',()=>assert.throws(()=>validateBackup(JSON.stringify({...createBackup([],[]),schemaVersion:99}))));
test('id duplicado',()=>assert.throws(()=>validateBackup(JSON.stringify(createBackup([memory,memory],[])))));
test('enlace huérfano',()=>assert.throws(()=>validateBackup(JSON.stringify(createBackup([],[link])))));
test('campos no válidos',()=>assert.throws(()=>validateBackup(JSON.stringify(createBackup([{...memory,title:''}],[])))));
test('carga vacía',()=>assert.deepEqual(validateBackup(JSON.stringify(createBackup([],[]))),{memories:[],links:[],objects:[],reviews:[]}));
test('contenido HTML se mantiene como datos',()=>assert.equal(validateBackup(JSON.stringify(createBackup([{...memory,body:'<script>alert(1)</script>'}],[]))).memories[0].body,'<script>alert(1)</script>'));

const object={id:'it/custom-abcdef',roomId:'it',title:'Router',description:'Laboratorio',slot:0,createdAt:'2026-10-10T00:00:00Z',updatedAt:'2026-10-10T00:00:00Z'};
test('copia con objetos',()=>{const r=validateBackup(JSON.stringify(createBackup([memory],[{id:'it/custom-abcdef::m1',objectId:object.id,memoryId:'m1'}],[object])));assert.equal(r.objects[0].title,'Router');});
test('objeto duplicado',()=>assert.throws(()=>validateBackup(JSON.stringify(createBackup([],[],[object,object])))));
test('ubicación duplicada',()=>assert.throws(()=>validateBackup(JSON.stringify(createBackup([],[],[object,{...object,id:'it/custom-second'}])))));
test('objeto en sala inexistente',()=>assert.throws(()=>validateBackup(JSON.stringify(createBackup([],[],[{...object,roomId:'other'}])))));
test('importación compatible con respaldo v1',()=>{const old={...createBackup([memory],[link]),schemaVersion:1};delete old.objects;assert.equal(validateBackup(JSON.stringify(old)).objects.length,0);});

test('respaldo v2 mantiene compatibilidad',()=>{const old={...createBackup([memory],[link]),schemaVersion:2};delete old.reviews;assert.equal(validateBackup(JSON.stringify(old)).reviews.length,0);});
test('rechaza repaso sin memoria',()=>assert.throws(()=>validateBackup(JSON.stringify(createBackup([],[],[],[{memoryId:'bad',intervalDays:1,repetitions:1,lastGrade:0,dueAt:memory.createdAt,lastReviewedAt:memory.createdAt}])))));
test('conserva repaso válido',()=>{const r={memoryId:'m1',intervalDays:3,repetitions:1,lastGrade:2,dueAt:'2026-10-13T00:00:00Z',lastReviewedAt:memory.createdAt};assert.deepEqual(validateBackup(JSON.stringify(createBackup([memory],[],[],[r]))).reviews[0],r);});
