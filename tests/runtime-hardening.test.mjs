import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const scene=readFileSync(new URL('../app/scene.js',import.meta.url),'utf8');
const main=readFileSync(new URL('../app/main.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('cancelación de puntero termina arrastre 3D',()=>assert.match(scene,/pointercancel.*down=null/));
test('pérdida de contexto WebGL activa fallback 2D',()=>{assert.match(scene,/webglcontextlost/);assert.match(main,/mnemosyne:webgl-lost/);assert.match(main,/setMode\('2d'\)/);});
test('el modo 2D es accesible con controles de sala nativos',()=>{assert.match(main,/createElement\(tag\)/);assert.match(main,/dataset\.room/);assert.match(html,/id="map2d"/);});
