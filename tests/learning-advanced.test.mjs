import test from 'node:test';
import assert from 'node:assert/strict';
import {nextReview,learningStats} from '../app/learning.js';
import {createBackup,validateBackup} from '../app/backup.js';
const at=new Date('2026-11-21T09:00:00Z'),iso=at.toISOString();
const mem={id:'m',title:'Redes',body:'[[DNS]]',tags:['IT'],collection:'Trabajo',createdAt:iso,updatedAt:iso};
test('repaso conserva ease y registra historia',()=>{
 const a=nextReview(null,2,at);const b=nextReview(a,1,new Date('2026-11-22T09:00:00Z'));
 assert.ok(b.ease<a.ease);assert.equal(b.history.length,2);assert.equal(b.history[0].grade,2);
});
test('historial del aprendizaje y colección viajan en backup v3',()=>{
 const r={memoryId:'m',...nextReview(null,2,at)};
 const backup=createBackup([mem],[],[],[r]);const result=validateBackup(JSON.stringify(backup));
 assert.equal(result.memories[0].collection,'Trabajo');assert.deepEqual(result.reviews[0].history,r.history);assert.equal(result.reviews[0].ease,r.ease);
});
test('rechaza historial malicioso o inválido',()=>{
 const review={memoryId:'m',...nextReview(null,2,at),history:[{at:'bad',grade:5}]};
 assert.throws(()=>validateBackup(JSON.stringify(createBackup([mem],[],[],[review]))));
});
test('estadísticas cuentan sesiones y logro diario',()=>{
 const review={memoryId:'m',...nextReview(null,2,at)};
 const stats=learningStats([mem],[review],at);
 assert.equal(stats.doneToday,1);assert.equal(stats.total,1);assert.equal(stats.successRate,100);assert.equal(stats.streak,1);
});
test('compatibilidad de registros legacy sin factor o historial',()=>{
 const review={memoryId:'m',intervalDays:3,repetitions:1,lastGrade:2,dueAt:'2026-11-24T09:00:00Z',lastReviewedAt:iso};
 const result=validateBackup(JSON.stringify(createBackup([mem],[],[],[review])));
 assert.deepEqual(result.reviews[0],review);
});
