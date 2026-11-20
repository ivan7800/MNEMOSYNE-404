import test from 'node:test';
import assert from 'node:assert/strict';
import {wikiTargets,backlinksFor,resolveWiki,searchMemories,collectionNames,tagNames} from '../app/knowledge.js';
const time='2026-01-01T00:00:00Z';
const notes=[{id:'a',title:'DNS',body:'# Redes\nServidor [[TCP]]',tags:['redes'],collection:'IT',updatedAt:time},{id:'b',title:'TCP',body:'Protocolo y [[DNS]]',tags:['redes','protocolo'],collection:'IT',updatedAt:'2026-02-01T00:00:00Z'},{id:'c',title:'Literatura',body:'Un libro',tags:['lectura'],collection:'Libros',updatedAt:time}];
test('wikilinks se extraen y eliminan duplicados',()=>assert.deepEqual(wikiTargets('[[DNS]] y [[DNS]] + [[ TCP ]]'),['DNS','TCP']));
test('resuelve título e ID sin crear enlaces externos',()=>{assert.equal(resolveWiki('dns',notes).id,'a');assert.equal(resolveWiki('b',notes).title,'TCP');});
test('backlinks buscan títulos completos',()=>assert.deepEqual(backlinksFor(notes[0],notes).map(x=>x.id),['b']));
test('búsqueda combina términos, colección y etiqueta',()=>assert.deepEqual(searchMemories(notes,{query:'servidor redes',collection:'IT',tag:'redes'}).map(x=>x.id),['a']));
test('orden por título y filtros',()=>{assert.deepEqual(searchMemories(notes,{sort:'title'}).map(x=>x.id),['a','c','b']);assert.deepEqual(collectionNames(notes),['IT','Libros']);assert.deepEqual(tagNames(notes),['lectura','protocolo','redes']);});
test('búsqueda de 10 000 memorias evita repintar o exigir DOM',()=>{
 const many=Array.from({length:10000},(_,i)=>({...notes[0],id:'note-'+i,title:'Archivo '+i,body:i===9999?'caso único DNS':'regular'}));
 const start=performance.now(),results=searchMemories(many,{query:'único'});
 assert.equal(results.length,1);assert.ok(performance.now()-start<5000,'Búsqueda superior a 5 segundos');
});
