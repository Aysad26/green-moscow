import * as THREE from '../dist/vendor/three.module.min.js';
import {createIsland,setAssembly,createCamera,fitCamera} from '../dist/island.js';
import {readFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';

const island=createIsland();
setAssembly(island.parts,0);assert.equal(island.parts.filter(p=>p.visible).length,0);
setAssembly(island.parts,2);const partial=island.parts.filter(p=>p.visible).length;assert(partial>0&&partial<island.parts.length);
setAssembly(island.parts,20);assert(island.parts.every(p=>p.visible));
island.root.updateMatrixWorld(true);
const final=new THREE.Box3().setFromObject(island.root);assert(final.min.distanceTo(island.bounds.min)<.001);assert(final.max.distanceTo(island.bounds.max)<.001);
let meshes=0,vertices=0;const worldPoints=[];
island.root.traverse(obj=>{if(!obj.isMesh)return;meshes++;const p=obj.geometry.attributes.position;vertices+=p.count;for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(obj.matrixWorld);assert(Number.isFinite(v.length()));worldPoints.push(v)}});
const views=[];
for(const aspect of [.72,.9,1.15,1.5,1.9,2.4])for(const angle of [-.55,0,.55]){
  const camera=createCamera(aspect);fitCamera(camera,aspect);let x=0,y=0;
  const rotation=new THREE.Matrix4().makeRotationY(angle);
  for(const v of worldPoints){const p=v.clone().applyMatrix4(rotation).project(camera);x=Math.max(x,Math.abs(p.x));y=Math.max(y,Math.abs(p.y))}
  assert(x<1,`Camera clips horizontally at ${aspect}, ${angle}: ${x}`);assert(y<1,`Camera clips vertically at ${aspect}, ${angle}: ${y}`);views.push({aspect,yaw:angle,x:+x.toFixed(3),y:+y.toFixed(3)});
}
const root=new URL('../dist/',import.meta.url).pathname,html=readFileSync(path.join(root,'index.html'),'utf8');
for(const [,asset]of html.matchAll(/(?:src|href)="([^"#]+)"/g)){if(asset==='./'||/^[a-z][a-z0-9+.-]*:/i.test(asset))continue;assert(existsSync(path.join(root,asset.split('?')[0])),`Missing asset ${asset}`)}
function checkModules(dir){for(const file of readdirSync(dir)){const p=path.join(dir,file);if(statSync(p).isDirectory()){checkModules(p);continue}if(!p.endsWith('.js'))continue;const js=readFileSync(p,'utf8').replace(/\/\*[\s\S]*?\*\//g,'');for(const [,a]of js.matchAll(/from\s*['"]([^'"]+)['"]/g))assert(a.startsWith('.')&&existsSync(path.resolve(path.dirname(p),a)),`Bad import ${a} in ${p}`)}}
checkModules(root);
assert.equal((html.match(/<main\b/g)||[]).length,1);assert.equal((html.match(/<section\b/g)||[]).length,7);
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(ids.length,new Set(ids).size,'Duplicate HTML ids');
for(const target of ['top','about','how','atlas','contacts','questionnaire','place-card','motion-toggle','motion-label'])assert(ids.includes(target),`Missing UI target ${target}`);
console.log(JSON.stringify({passed:true,assemblyParts:island.parts.length,assemblySeconds:island.duration,meshes,vertices,partialAssemblyAt2s:partial,cameraViews:views,assets:'all present',modules:'all self-hosted',scope:'full wooden atlas, seven sections'},null,2));
