"""Prueba de integración local aislada. Requiere pip install playwright y navegador Chromium.
No abre ni elimina la base IndexedDB de tu perfil habitual: usa un perfil temporal.
"""
from pathlib import Path
import functools
import os
import shutil
import http.server
import tempfile
import threading
from playwright.sync_api import sync_playwright
from playwright._impl._errors import Error as PlaywrightError

ROOT = Path(__file__).resolve().parents[1]
server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}'
checks = []
def check(ok, label):
    print(('PASS' if ok else 'FAIL') + ' ' + label, flush=True)
    checks.append((label, bool(ok)))
    if not ok:
        raise AssertionError(label)
try:
    with tempfile.TemporaryDirectory(prefix='mnemosyne-e2e-') as profile:
        with sync_playwright() as pw:
            browser_path = os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or shutil.which('google-chrome')
            kwargs = {'executable_path': browser_path} if browser_path else {}
            browser = pw.chromium.launch_persistent_context(profile, headless=True, **kwargs)
            page = browser.new_page()
            page_errors = []
            page.on('pageerror', lambda exc: page_errors.append(str(exc)))
            # Perfil temporal: crear una base v1 antes de cargar el módulo v3.
            page.goto(url + '/tests/e2e-fixture.html', wait_until='domcontentloaded', timeout=20000)
            migration = page.evaluate("""async () => {
              const old = await new Promise((resolve,reject) => {
                const req = indexedDB.open('mnemosyne404',1);
                req.onupgradeneeded=()=>{
                  const db=req.result;
                  const m=db.createObjectStore('memories',{keyPath:'id'});
                  m.createIndex('updatedAt','updatedAt');
                  const l=db.createObjectStore('links',{keyPath:'id'});
                  l.createIndex('objectId','objectId');l.createIndex('memoryId','memoryId');
                };
                req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
              });
              const record={id:'migration-e2e',title:'Legado v1',body:'Dato conservado',tags:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
              await new Promise((resolve,reject)=>{const tx=old.transaction('memories','readwrite');tx.objectStore('memories').add(record);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
              old.close();
              const mod=await import('../app/db.js'); const db=await mod.openDatabase();
              const names=[...db.objectStoreNames];const persisted=(await mod.listMemories(db)).find(m=>m.id==='migration-e2e');
              const good=db.version===3 && names.includes('objects') && names.includes('reviews') && persisted?.body==='Dato conservado';
              db.close();return {good,version:3,names};
            }""")
            check(migration['good'], 'Migración v1→v3 conserva memoria y crea almacenes')
            restore = page.evaluate("""async () => {
              const mod=await import('../app/db.js');const db=await mod.openDatabase();
              const orig=(await mod.listMemories(db)).find(m=>m.id==='migration-e2e');
              const data={memories:[{...orig,title:'Intento de sobrescritura'}],links:[],objects:[],reviews:[]};
              let rejected=false;
              try {await mod.restoreBackup(db,data,'merge');}catch{rejected=true;}
              const after=(await mod.listMemories(db)).find(m=>m.id==='migration-e2e');
              db.close();return {rejected,preserved:after?.title==='Legado v1'};
            }""")
            check(restore['rejected'] and restore['preserved'], 'Fusión rechaza colisión y conserva datos')
            page.goto(url + '/tests/browser-smoke.html', wait_until='domcontentloaded', timeout=20000)
            page.wait_for_function("document.querySelector('#result').textContent.includes('ALL_PASS') || document.querySelector('#result').textContent.includes('FAIL')", timeout=20000)
            result = page.locator('#result').inner_text()
            check('ALL_PASS' in result, 'IndexedDB CRUD, vínculos y reapertura: ' + result.replace('\n', ' | '))
            page.goto(url, wait_until='domcontentloaded', timeout=20000)
            page.wait_for_function("document.querySelectorAll('#room-list button').length === 4", timeout=20000)
            check(page.locator('#room-list button').count() == 4, 'Cuatro salas generadas')
            page.locator('#mode').click()
            check(page.locator('#map2d').is_visible(), 'Mapa 2D visible al cambiar modo')
            page.locator('#room-list button').first.click()
            check(page.locator('#object-list button.object').count() > 0, 'Objetos de sala visibles')
            page.locator('#new-memory').click()
            check(page.locator('#editor').evaluate('(el) => el.open'), 'Editor de memoria abre')
            page.locator('#memory-title').fill('Prueba E2E')
            page.locator('#memory-body').fill('Contenido de la prueba')
            page.locator('#memory-form button[type=submit]').click()
            check(page.get_by_text('Prueba E2E', exact=True).count() > 0, 'Memoria creada')
            page.reload(wait_until='domcontentloaded')
            page.wait_for_function("document.querySelectorAll('#room-list button').length === 4", timeout=20000)
            page.get_by_placeholder('Título, contenido o etiquetas…').fill('Prueba E2E')
            check(page.get_by_text('Prueba E2E', exact=True).count() > 0, 'Memoria persiste tras recargar')
            check(not page_errors, 'Sin excepciones JavaScript: ' + str(page_errors))
            browser.close()
except PlaywrightError as exc:
    if 'ERR_BLOCKED_BY_ADMINISTRATOR' in str(exc):
        print('BLOCKED: política del navegador impide abrir HTTP local; ninguna comprobación E2E ejecutada.', flush=True)
        raise SystemExit(2)
    raise
finally:
    server.shutdown()
print(f'RESULTADO: {sum(x[1] for x in checks)}/{len(checks)} PASS')
