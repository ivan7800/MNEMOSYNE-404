// User preferences only: small strings; no personal knowledge is stored here.
const THEMES=new Set(['cyber','classic','noir','minimal']);
const root=document.documentElement;
const safeGet=(key,fallback)=>{try{return localStorage.getItem(key)??fallback}catch{return fallback}};
const safeSet=(key,value)=>{try{localStorage.setItem(key,value)}catch{ /* private mode or quota */ }};
const picker=document.getElementById('theme-select');
const effects=document.getElementById('effects');
const saved=safeGet('mnemosyne.theme','cyber');
const theme=THEMES.has(saved)?saved:'cyber';
function applyTheme(name){if(!THEMES.has(name))return;root.dataset.theme=name;picker.value=name;safeSet('mnemosyne.theme',name);window.dispatchEvent(new Event('mnemosyne:theme'));}
applyTheme(theme);
picker.addEventListener('change',()=>applyTheme(picker.value));
function applyEffects(enabled){root.dataset.effects=enabled?'on':'off';effects.setAttribute('aria-pressed',String(enabled));effects.textContent=`Ambiente: ${enabled?'ON':'OFF'}`;effects.title=enabled?'Desactivar efectos ambientales':'Activar efectos ambientales';safeSet('mnemosyne.effects',enabled?'on':'off');}
applyEffects(safeGet('mnemosyne.effects',matchMedia('(prefers-reduced-motion: reduce)').matches?'off':'on')==='on');
effects.addEventListener('click',()=>applyEffects(root.dataset.effects!=='on'));
