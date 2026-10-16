import * as THREE from './vendor/three.module.min.js';
import {createIsland,setAssembly,createCamera,fitCamera} from './island.js';

const canvas=document.getElementById('city-canvas');
const stage=document.getElementById('scene-stage');
const loader=document.getElementById('loader');
const status=document.getElementById('scene-state');
const fallback=document.getElementById('scene-fallback');
const replayButtons=[...document.querySelectorAll('[data-replay]')];
const reduceQuery=matchMedia('(prefers-reduced-motion: reduce)');
let reduced=reduceQuery.matches||new URLSearchParams(location.search).has('design-export');
let app=null;
function enableButtons(enabled){for(const b of replayButtons)b.disabled=!enabled}

function woodTextures(){
  const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');
  ctx.fillStyle='#f9f7f2';ctx.fillRect(0,0,256,256);
  let seed=4237;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
  for(let i=0;i<320;i++){
    const y=random()*256;ctx.beginPath();ctx.moveTo(-4,y);ctx.bezierCurveTo(70,y+(random()-.5)*10,170,y+(random()-.5)*10,260,y+(random()-.5)*5);ctx.strokeStyle=`rgba(132,106,68,${.018+random()*.055})`;ctx.lineWidth=.25+random()*.85;ctx.stroke();
  }
  for(let i=0;i<3000;i++){ctx.fillStyle=`rgba(130,110,80,${random()*.07})`;ctx.fillRect(random()*256,random()*256,random()*1.1+.25,.3)}
  const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;
  const bump=map.clone();bump.colorSpace=THREE.NoColorSpace;bump.needsUpdate=true;
  return{map,bump};
}

function floorShadow(){
  const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');
  const g=ctx.createRadialGradient(128,128,20,128,128,125);g.addColorStop(0,'rgba(73,63,40,.23)');g.addColorStop(.46,'rgba(73,63,40,.13)');g.addColorStop(1,'rgba(73,63,40,0)');ctx.fillStyle=g;ctx.fillRect(0,0,256,256);
  const mat=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false});const m=new THREE.Mesh(new THREE.PlaneGeometry(11,7.5),mat);m.rotation.x=-Math.PI/2;m.position.y=-.30;return m;
}

async function boot(){
  enableButtons(false);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'default'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<761?1.65:2));
  renderer.setClearColor(0xf4f0e7,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.14;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();
  scene.add(new THREE.AmbientLight(0xfff5e5,.55));
  scene.add(new THREE.HemisphereLight(0xfff7e7,0xa2a488,2.25));
  const key=new THREE.DirectionalLight(0xfff1dc,3.2);key.position.set(-5,11,7);key.castShadow=true;
  key.shadow.mapSize.set(innerWidth<761?1024:2048,innerWidth<761?1024:2048);key.shadow.camera.left=-6.5;key.shadow.camera.right=6.5;key.shadow.camera.top=8;key.shadow.camera.bottom=-5;key.shadow.camera.near=.5;key.shadow.camera.far=28;key.shadow.normalBias=.028;key.shadow.bias=-.0001;key.shadow.radius=3;scene.add(key);
  const fill=new THREE.DirectionalLight(0xf6f2e8,.5);fill.position.set(8,4,-4);scene.add(fill);
  const textures=woodTextures();
  const island=createIsland((color,name)=>new THREE.MeshStandardMaterial({color,map:textures.map,bumpMap:textures.bump,bumpScale:name.startsWith('wood')?.018:.007,roughness:.83,metalness:0}));
  const pivot=new THREE.Group();pivot.add(island.root);scene.add(pivot);
  const shadow=floorShadow();scene.add(shadow);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({color:0x55472e,opacity:.12}));floor.rotation.x=-Math.PI/2;floor.position.y=-.28;floor.receiveShadow=true;scene.add(floor);
  const camera=createCamera();
  let width=0,height=0;
  function resize(){
    const rect=stage.getBoundingClientRect();width=Math.max(rect.width,1);height=Math.max(rect.height,1);renderer.setSize(width,height,false);fitCamera(camera,width/height);dirty=true;
  }
  let dirty=true,raf=0,startTime=null,lastFrame=0,assemblyDone=false;
  let yaw=0,targetYaw=0,tilt=0,targetTilt=0,dragging=false,pointerId=null,startX=0,startY=0,originYaw=0;
  setAssembly(island.parts,0);resize();renderer.render(scene,camera);
  await window.woodResourcesReady;
  // Compile before the preloader gives way to the actual assembly.
  setAssembly(island.parts,island.duration,true);
  if(renderer.compileAsync)await renderer.compileAsync(scene,camera).catch(()=>{});
  renderer.render(scene,camera);setAssembly(island.parts,0,reduced);renderer.render(scene,camera);
  fallback.hidden=true;document.documentElement.classList.remove('is-loading');canvas.classList.add('is-ready');fallback.classList.add('is-hidden');loader.classList.add('is-leaving');
  setTimeout(()=>loader.hidden=true,650);
  enableButtons(true);
  startTime=performance.now()+180;
  status.textContent=reduced?'Город собран. Можно поворачивать.':'Собираем город по деталям…';

  function requestRender(){if(!raf&&!document.hidden)raf=requestAnimationFrame(frame)}
  function replay(){startTime=performance.now();assemblyDone=false;setAssembly(island.parts,0,reduced);status.textContent=reduced?'Город собран. Можно поворачивать.':'Собираем город по деталям…';enableButtons(false);dirty=true;requestRender()}
  function frame(now){
    raf=0;if(document.hidden)return;
    const dt=Math.min((now-lastFrame)/1000||.016,.06);lastFrame=now;
    const elapsed=Math.max(0,(now-startTime)/1000);
    if(!assemblyDone){
      setAssembly(island.parts,elapsed,reduced);dirty=true;
      if(reduced||elapsed>=island.duration){assemblyDone=true;enableButtons(true);status.textContent='Поверни город — он твой.'}
    }
    const ease=1-Math.exp(-dt*9);
    if(Math.abs(yaw-targetYaw)>.00005||Math.abs(tilt-targetTilt)>.00005){yaw+=(targetYaw-yaw)*ease;tilt+=(targetTilt-tilt)*ease;pivot.rotation.y=yaw;pivot.rotation.x=tilt;dirty=true}
    if(dirty){renderer.render(scene,camera);dirty=false}
    if(!assemblyDone||Math.abs(yaw-targetYaw)>.00005||Math.abs(tilt-targetTilt)>.00005)requestRender();
  }
  function endDrag(event){if(!dragging||event&&event.pointerId!==pointerId)return;dragging=false;canvas.classList.remove('is-dragging');targetTilt=0;if(pointerId!==null&&canvas.hasPointerCapture(pointerId))canvas.releasePointerCapture(pointerId);pointerId=null;requestRender()}
  canvas.addEventListener('pointerdown',event=>{if(event.button!==0||!assemblyDone)return;dragging=true;pointerId=event.pointerId;startX=event.clientX;startY=event.clientY;originYaw=targetYaw;canvas.setPointerCapture(pointerId);canvas.classList.add('is-dragging')});
  canvas.addEventListener('pointermove',event=>{if(!dragging||event.pointerId!==pointerId)return;targetYaw=THREE.MathUtils.clamp(originYaw+(event.clientX-startX)*.006,-.55,.55);targetTilt=THREE.MathUtils.clamp((event.clientY-startY)*.0015,-.07,.08);requestRender()});
  canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);canvas.addEventListener('lostpointercapture',endDrag);
  canvas.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home'].includes(event.key))return;event.preventDefault();targetYaw=event.key==='Home'?0:THREE.MathUtils.clamp(targetYaw+(event.key==='ArrowLeft'?-.12:.12),-.55,.55);requestRender()});
  const observer=new ResizeObserver(()=>{resize();requestRender()});observer.observe(stage);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0}else{dirty=true;requestRender()}});
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();fallback.hidden=false;fallback.classList.remove('is-hidden');canvas.classList.remove('is-ready');status.textContent='Деревянная Москва';enableButtons(false);if(raf)cancelAnimationFrame(raf);raf=0});
  canvas.addEventListener('webglcontextrestored',()=>location.reload());
  reduceQuery.addEventListener('change',event=>{reduced=event.matches;if(reduced){setAssembly(island.parts,island.duration,true);assemblyDone=true;enableButtons(true);status.textContent='Город собран. Можно поворачивать.';dirty=true;requestRender()}});
  app={replay,dispose(){observer.disconnect();renderer.dispose();textures.map.dispose();textures.bump.dispose();if(raf)cancelAnimationFrame(raf)}};
  for(const button of replayButtons)button.addEventListener('click',replay);
  requestRender();
}

async function failed(error){
  await window.woodResourcesReady;
  console.warn('3D city unavailable:',error?.message||error);document.documentElement.classList.remove('is-loading');loader.hidden=true;stage.classList.add('scene-has-error');fallback.hidden=false;fallback.classList.remove('is-hidden');status.textContent='Деревянная Москва';for(const b of replayButtons)b.hidden=true;
}
boot().catch(failed);
