import {rooms} from './rooms.js';
const VS=`attribute vec3 position;attribute vec3 color;uniform mat4 projection;uniform mat4 view;varying vec3 vcolor;void main(){vcolor=color;gl_Position=projection*view*vec4(position,1.0);}`;
const FS=`precision mediump float;varying vec3 vcolor;void main(){gl_FragColor=vec4(vcolor,1.0);}`;
function compile(gl,type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
function perspective(fov,aspect,near,far){const f=1/Math.tan(fov/2),r=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*r,-1,0,0,2*far*near*r,0]);}
function viewMatrix(yaw,pitch,distance){const cp=Math.cos(pitch),sp=Math.sin(pitch),cy=Math.cos(yaw),sy=Math.sin(yaw);const eye=[distance*cp*sy,distance*sp,distance*cp*cy];const z=norm(eye),x=norm([z[2],0,-z[0]]),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
function cameraView(x,z,heading){
 const eye=[x,1.4,z],toward=[Math.sin(heading),-.16,Math.cos(heading)];
 const backward=norm(toward.map(n=>-n)),right=norm(cross([0,1,0],backward)),up=cross(backward,right);
 return new Float32Array([right[0],up[0],backward[0],0,right[1],up[1],backward[1],0,right[2],up[2],backward[2],0,-dot(right,eye),-dot(up,eye),-dot(backward,eye),1]);
}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]}function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]}function norm(v){const l=Math.hypot(...v)||1;return v.map(n=>n/l)}
function cube(vertices,colors,x,y,z,w,h,d,c){const corners=[[x-w/2,y-h/2,z-d/2],[x+w/2,y-h/2,z-d/2],[x+w/2,y+h/2,z-d/2],[x-w/2,y+h/2,z-d/2],[x-w/2,y-h/2,z+d/2],[x+w/2,y-h/2,z+d/2],[x+w/2,y+h/2,z+d/2],[x-w/2,y+h/2,z+d/2]];const faces=[[0,1,2,3,.75],[5,4,7,6,.62],[4,0,3,7,.57],[1,5,6,2,.8],[3,2,6,7,1],[4,5,1,0,.42]];for(const [a,b,q,d2,shade] of faces){for(const idx of [a,b,q,a,q,d2]){vertices.push(...corners[idx]);colors.push(...c.map(v=>v*shade));}}}
function mult(m,v){return [m[0]*v[0]+m[4]*v[1]+m[8]*v[2]+m[12]*v[3],m[1]*v[0]+m[5]*v[1]+m[9]*v[2]+m[13]*v[3],m[2]*v[0]+m[6]*v[1]+m[10]*v[2]+m[14]*v[3],m[3]*v[0]+m[7]*v[1]+m[11]*v[2]+m[15]*v[3]]}
export function createScene(canvas,onSelect){const gl=canvas.getContext('webgl',{antialias:true,alpha:false});if(!gl)throw Error('WebGL no disponible');const p=gl.createProgram();gl.attachShader(p,compile(gl,gl.VERTEX_SHADER,VS));gl.attachShader(p,compile(gl,gl.FRAGMENT_SHADER,FS));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));gl.useProgram(p);const v=[],c=[];
cube(v,c,0,-.36,0,11,.25,10,[.10,.21,.29]);
for(let n=-4;n<=4;n+=2){
 cube(v,c,n,-.20,0,.026,.012,9.6,[.22,.42,.49]);
 cube(v,c,0,-.20,n,.026,.012,9.6,[.22,.42,.49]);
}
for(const room of rooms){
 const accent=room.color.map(n=>Math.min(1,n*1.2));
 cube(v,c,room.x,.05,room.z,3.5,.27,3.05,room.color);
 cube(v,c,room.x,.23,room.z,2.5,.08,2.2,[.09,.18,.26]);
 cube(v,c,room.x,.49,room.z,.85,.54,.85,accent);
 cube(v,c,room.x,.82,room.z,.38,.17,.38,[.76,.87,.94]);
 for(const sx of [-1,1]){
  cube(v,c,room.x+sx*1.53,.53,room.z,.14,.85,3.12,[.18,.30,.40]);
  for(const sz of [-1,1]){
   cube(v,c,room.x+sx*1.48,.66,room.z+sz*1.37,.22,1.12,.22,[.24,.39,.50]);
   cube(v,c,room.x+sx*1.48,1.28,room.z+sz*1.37,.39,.13,.39,accent);
  }
 }
}

let vert=new Float32Array(v),col=new Float32Array(c);function buffer(attr,data){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);const loc=gl.getAttribLocation(p,attr);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);}const baseVertices=v.slice(),baseColors=c.slice();let buffers=[];function updateObjects(objects=[]){const vertices=baseVertices.slice(),colors=baseColors.slice();for(const o of objects){const room=rooms.find(r=>r.id===o.roomId);if(!room)continue;const colr=room.color.map(k=>Math.min(1,k*1.25));const dx=(o.slot%4-1.5)*.65,dz=(Math.floor(o.slot/4)-1)*.65;cube(vertices,colors,room.x+dx,.68,room.z+dz,.3,.46,.3,colr);}vert=new Float32Array(vertices);col=new Float32Array(colors);for(const b of buffers)gl.deleteBuffer(b);buffers=[];buffer('position',vert);buffer('color',col);render();}buffer=function(attr,data){const b=gl.createBuffer();buffers.push(b);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);const loc=gl.getAttribLocation(p,attr);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,3,gl.FLOAT,false,0,0);};buffer('position',vert);buffer('color',col);gl.enable(gl.DEPTH_TEST);const uP=gl.getUniformLocation(p,'projection'),uV=gl.getUniformLocation(p,'view');let yaw=.7,pitch=.85,distance=14,selection=null,walk=false,walkX=0,walkZ=4.4,heading=Math.PI,quality='high';
function nearestRoom(){return rooms.reduce((best,room)=>{const distance=Math.hypot(room.x-walkX,room.z-walkZ);return !best||distance<best.distance?{room,distance}:best;},null);}
function moveWalk(action){
 if(!walk)return;
 if(action==='left')heading-=.16;
 if(action==='right')heading+=.16;
 const amount=action==='forward'?.31:action==='backward'?-.31:0;
 const side=action==='strafe-left'?-.31:action==='strafe-right'?.31:0;
 walkX=Math.max(-5,Math.min(5,walkX+Math.sin(heading)*amount+Math.cos(heading)*side));
 walkZ=Math.max(-4.8,Math.min(4.8,walkZ+Math.cos(heading)*amount-Math.sin(heading)*side));
 if(action==='interact'){const selected=nearestRoom();if(selected&&selected.distance<3)onSelect(selected.room.id);}
 render();
}let projection,view;function render(){const rect=canvas.getBoundingClientRect();if(rect.width<1||rect.height<1)return;const w=Math.min(2400,Math.round(rect.width*Math.min(window.devicePixelRatio||1,quality==='high'?2:1))),h=Math.min(1600,Math.round(rect.height*Math.min(window.devicePixelRatio||1,quality==='high'?2:1)));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);const palettes={cyber:[.045,.085,.145],classic:[.12,.085,.055],noir:[.045,.044,.085],minimal:[.065,.115,.105]};gl.clearColor(...(palettes[document.documentElement.dataset.theme]||palettes.cyber),1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);projection=perspective(Math.PI/3,w/h,.1,100);view=walk?cameraView(walkX,walkZ,heading):viewMatrix(yaw,pitch,distance);gl.uniformMatrix4fv(uP,false,projection);gl.uniformMatrix4fv(uV,false,view);gl.drawArrays(gl.TRIANGLES,0,vert.length/3);}
function project(point){const a=mult(projection,mult(view,[...point,1]));return [(a[0]/a[3]+1)*canvas.clientWidth/2,(1-a[1]/a[3])*canvas.clientHeight/2];}
let down=null;canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();down=null;canvas.dispatchEvent(new CustomEvent('mnemosyne:webgl-lost',{bubbles:true}));});canvas.addEventListener('pointercancel',()=>{down=null;});canvas.addEventListener('lostpointercapture',()=>{down=null;});canvas.tabIndex=0;canvas.addEventListener('pointerdown',e=>{canvas.focus();down={x:e.clientX,y:e.clientY,yaw:walk?heading:yaw,pitch};canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;if(walk){heading=down.yaw-dx*.006;}else{yaw=down.yaw-dx*.006;pitch=Math.max(.28,Math.min(1.48,down.pitch+dy*.005));}render()});canvas.addEventListener('pointerup',e=>{if(!down)return;const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y);down=null;if(moved>8)return;if(walk){moveWalk('interact');return;}const r=canvas.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;let best=null,min=1e9;for(const room of rooms){const [x,y]=project([room.x,.3,room.z]);const dist=Math.hypot(mx-x,my-y);if(dist<min){best=room;min=dist;}}if(min<Math.max(70,canvas.clientWidth*.12))onSelect(best.id);});canvas.addEventListener('wheel',e=>{e.preventDefault();if(walk)return;distance=Math.max(8,Math.min(25,distance+Math.sign(e.deltaY)*1.2));render()},{passive:false});canvas.addEventListener('keydown',e=>{
 if(!walk||e.altKey||e.ctrlKey||e.metaKey)return;
 const map={w:'forward',ArrowUp:'forward',s:'backward',ArrowDown:'backward',a:'strafe-left',d:'strafe-right',ArrowLeft:'left',ArrowRight:'right',e:'interact',Enter:'interact'};
 const key=map[e.key]||map[e.key.toLowerCase()];
 if(key){e.preventDefault();moveWalk(key);}
});
const observer=new ResizeObserver(render);observer.observe(canvas);const refreshTheme=()=>render();window.addEventListener('mnemosyne:theme',refreshTheme);render();return {render,updateObjects,setWalk(value){walk=Boolean(value);if(walk){walkX=0;walkZ=4.4;heading=Math.PI;canvas.focus();}render();return walk;},moveWalk,setQuality(value){quality=value==='low'?'low':'high';render();},reset(){walk=false;yaw=.7;pitch=.85;distance=14;render()},destroy(){observer.disconnect();window.removeEventListener('mnemosyne:theme',refreshTheme);}}}
