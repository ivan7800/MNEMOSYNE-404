import test from 'node:test';import assert from 'node:assert/strict';import {nextReview,due,routeForRoom} from '../app/learning.js';
const now=new Date('2026-10-10T00:00:00Z');const ms=[{id:'a',title:'A'},{id:'b',title:'B'}];
test('repaso fácil inicia en tres días',()=>assert.equal(nextReview(null,2,now).dueAt,'2026-10-13T00:00:00.000Z'));
test('respuesta fallida vuelve al día siguiente',()=>assert.equal(nextReview({intervalDays:30,repetitions:4},0,now).intervalDays,1));
test('intervalo crece con recuerdo',()=>assert.equal(nextReview({intervalDays:3,repetitions:1},2,now).intervalDays,8));
test('no admite grados inválidos',()=>assert.throws(()=>nextReview(null,3,now)));
test('sin repaso está pendiente',()=>assert.equal(due(ms,[],now).length,2));
test('repaso futuro no está pendiente',()=>assert.deepEqual(due(ms,[{memoryId:'a',dueAt:'2026-10-11T00:00:00Z'}],now).map(x=>x.id),['b']));
test('rutas incluyen solo memorias vinculadas',()=>assert.deepEqual(routeForRoom('it',[{objectId:'it/server',memoryId:'b'},{objectId:'nexus/graph',memoryId:'a'}],ms).map(x=>x.id),['b']));
