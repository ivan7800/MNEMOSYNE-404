import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
test('shell PWA contiene solo recursos bajo subruta',()=>{
 const manifest=JSON.parse(readFileSync(new URL('manifest.webmanifest',root),'utf8'));
 assert.equal(manifest.scope,'./');assert.equal(manifest.start_url,'./');
 const worker=readFileSync(new URL('sw.js',root),'utf8');
 const match=worker.match(/const SHELL=(\[[^;]+\]);/);
 assert.ok(match);const files=JSON.parse(match[1].replaceAll("'",'"'));
 for(const file of files)assert.ok(existsSync(new URL(file,root)),file+' no existe');
 assert.match(worker,/url.origin!==self.location.origin/);
 assert.match(worker,/req.method!=='GET'/);
});
