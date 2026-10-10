import test from 'node:test';import assert from 'node:assert/strict';
import {exportKnowledge,parseKnowledgeJSON,parseMarkdown,prepareEntries} from '../app/interchange.js';
const m={title:'DNS',body:'Registro A',tags:['redes']};
test('roundtrip formato portable',()=>{const raw=JSON.stringify(exportKnowledge([m]));assert.deepEqual(parseKnowledgeJSON(raw),[m]);});
test('rechaza JSON genérico desconocido',()=>assert.throws(()=>parseKnowledgeJSON('{"notes":[]}')));
test('rechaza entradas inválidas sin importar parcialmente',()=>assert.throws(()=>parseKnowledgeJSON(JSON.stringify({...exportKnowledge([m]),entries:[m,{title:'',content:'x',tags:[]}]}))));
test('Markdown obtiene título de heading',()=>assert.equal(parseMarkdown('test.md','# Mi título\nTexto').title,'Mi título'));
test('Markdown sin heading usa nombre',()=>assert.equal(parseMarkdown('Mi nota.md','Texto').title,'Mi nota'));
test('Markdown no se interpreta como HTML',()=>assert.equal(parseMarkdown('x.md','<script>alert(1)</script>').body,'<script>alert(1)</script>'));
test('crea IDs propios y asociación opcional',()=>{const d=prepareEntries([m],'it/server',()=> 'id-1',()=> '2026-01-01T00:00:00Z');assert.equal(d.links[0].objectId,'it/server');assert.equal(d.memories[0].id,'id-1');});
test('sin objeto no se crean vínculos',()=>assert.equal(prepareEntries([m]).links.length,0));
test('rechaza markdown demasiado grande',()=>assert.throws(()=>parseMarkdown('x.md','a'.repeat(100001))));

test('Markdown superior a 40.000 caracteres no se trunca silenciosamente',()=>assert.throws(()=>parseMarkdown('largo.md','# T\n'+'x'.repeat(40000)),/40\.000 caracteres/));
test('Markdown en límite conserva el contenido íntegro',()=>{const raw='# T\n'+'x'.repeat(39996);assert.equal(parseMarkdown('largo.md',raw).body,raw);});
