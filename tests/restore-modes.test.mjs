import test from 'node:test';
import assert from 'node:assert/strict';
import {planRestore} from '../app/db.js';
const time='2026-10-10T00:00:00Z';
const memory=id=>({id,title:'Title '+id,body:'body',tags:[],createdAt:time,updatedAt:time});
const object=(id,slot)=>({id,roomId:'it',slot,title:id,description:'',createdAt:time,updatedAt:time});
const link=(id,mid)=>({id:id+'::'+mid,objectId:id,memoryId:mid});
const empty=()=>({memories:[],links:[],objects:[],reviews:[]});
test('fusión estricta sigue rechazando colisiones',()=>{
 const existing={...empty(),memories:[memory('old')]};
 assert.throws(()=>planRestore(existing,{...empty(),memories:[memory('old')]},'merge'),/Conflictos/);
});
test('omitir duplicados es idempotente y no sobrescribe una memoria',()=>{
 const original=memory('old'),updated={...memory('old'),body:'No debe reemplazar'};
 const existing={...empty(),memories:[original]};
 const plan=planRestore(existing,{...empty(),memories:[updated,memory('new')]},'skip');
 assert.deepEqual(plan.data.memories.map(m=>m.id),['new']);
 assert.equal(original.body,'body');
 assert.equal(plan.skipped.memories,1);
 const next={...existing,memories:existing.memories.concat(plan.data.memories)};
 assert.deepEqual(planRestore(next,{...empty(),memories:[updated,memory('new')]},'skip').data.memories,[]);
});
test('omitir posición ocupada rechaza sus vínculos y mantiene memorias sin pérdida',()=>{
 const existing={...empty(),objects:[object('it/custom-current',0)]};
 const incoming={...empty(),memories:[memory('m')],objects:[object('it/custom-other',0)],links:[link('it/custom-other','m')]};
 const plan=planRestore(existing,incoming,'skip');
 assert.deepEqual(plan.data.objects,[]);
 assert.deepEqual(plan.data.links,[]);
 assert.equal(plan.data.memories.length,1);
 assert.equal(plan.skipped.objects,1);
 assert.equal(plan.skipped.links,1);
});
test('vínculo a objeto integrado y memoria existente se conserva',()=>{
 const existing={...empty(),memories:[memory('m')]};
 const plan=planRestore(existing,{...empty(),links:[link('it/server','m')]},'skip');
 assert.equal(plan.data.links.length,1);
});
test('no duplica repaso ni vínculo; acepta un segundo objeto válido',()=>{
 const r={memoryId:'m',intervalDays:1,repetitions:1,lastGrade:0,dueAt:time,lastReviewedAt:time};
 const existing={...empty(),memories:[memory('m')],reviews:[r],links:[link('it/server','m')]};
 const plan=planRestore(existing,{...empty(),objects:[object('it/custom-new',2)],links:[link('it/server','m'),link('it/custom-new','m')],reviews:[r]},'skip');
 assert.equal(plan.data.links.length,1);assert.equal(plan.data.reviews.length,0);
 assert.equal(plan.data.objects.length,1);assert.equal(plan.skipped.links,1);
});
test('sustitución devuelve exclusivamente los datos entrantes',()=>{
 const incoming={...empty(),memories:[memory('fresh')]};
 assert.deepEqual(planRestore({memories:[memory('old')]},incoming,'replace').data,incoming);
});
test('modo de restauración desconocido se rechaza',()=>assert.throws(()=>planRestore(empty(),empty(),'unsafe'),/Modo inválido/));
