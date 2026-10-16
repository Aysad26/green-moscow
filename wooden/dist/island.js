import * as THREE from './vendor/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

export const PALETTE={wood:0xd2b78e,woodLight:0xddc9a6,woodDark:0xb99c71,sage:0x90a080,moss:0x6c825f,pine:0x4f6a53,lightGreen:0xafbb98,clay:0xb27862,clayLight:0xc68c73,cream:0xe3d6b9,ochre:0xba9b61,water:0x9bb6b6,waterLight:0xb3c8c3,clock:0x435b4b};
const boxCache=new Map();
export function boxGeometry(w,h,d,r=.035){
  const radius=Math.min(r,w/4,h/4,d/4),key=[w,h,d,radius].join(',');
  if(!boxCache.has(key))boxCache.set(key,new RoundedBoxGeometry(w,h,d,2,radius));
  return boxCache.get(key);
}

export function archGeometry(width,height,depth,thickness=.18){
  const s=new THREE.Shape(),r=width/2;
  s.moveTo(-r,0);s.lineTo(-r,height-r);s.absarc(0,height-r,r,Math.PI,0,true);s.lineTo(r,0);
  s.lineTo(r-thickness,0);s.lineTo(r-thickness,height-r);
  s.absarc(0,height-r,r-thickness,0,Math.PI,false);s.lineTo(-r+thickness,0);s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth,steps:1,bevelEnabled:true,bevelThickness:.018,bevelSize:.018,bevelSegments:2,curveSegments:18});
  g.translate(0,0,-depth/2);return g;
}

function crownGeometry(w,h,d){
  const s=new THREE.Shape(),r=w/2;
  s.moveTo(-r,-h/2);s.lineTo(-r,h/2-r);s.absarc(0,h/2-r,r,Math.PI,0,true);s.lineTo(r,-h/2);s.closePath();
  const g=new THREE.ExtrudeGeometry(s,{depth:d,steps:1,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,curveSegments:18});
  g.translate(0,0,-d/2);return g;
}

function starGeometry(){
  const shape=new THREE.Shape();
  for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?.082:.19,x=Math.cos(a)*r,y=Math.sin(a)*r;i?shape.lineTo(x,y):shape.moveTo(x,y)}
  shape.closePath();const g=new THREE.ExtrudeGeometry(shape,{depth:.075,bevelEnabled:true,bevelThickness:.012,bevelSize:.008,bevelSegments:1});g.translate(0,0,-.0375);return g;
}

export function createIsland(materialFactory){
  const root=new THREE.Group();root.name='Деревянная Москва';
  const parts=[],mats={};
  for(const [key,color]of Object.entries(PALETTE))mats[key]=materialFactory?materialFactory(color,key):new THREE.MeshStandardMaterial({color,roughness:.78,metalness:0});
  let serial=0;
  function mesh(geometry,mat,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,typeof mat==='string'?mats[mat]:mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
  function block(parent,w,h,d,mat,x=0,y=0,z=0,r=.035){return mesh(boxGeometry(w,h,d,r),mat,parent,x,y,z)}
  function part(name,delay,position=[0,0,0],mode='drop'){
    const p=new THREE.Group();p.name=name;p.position.fromArray(position);root.add(p);
    const idx=serial++;p.userData={delay,duration:mode==='base'?.82:1.02,target:p.position.clone(),mode,index:idx};parts.push(p);return p;
  }
  const step=1.025;
  const tiles=[];
  for(let row=-2;row<=2;row++){
    const half=Math.abs(row)===2?2:3;
    for(let col=-half;col<=half;col++){
      const x=col*step,z=row*step;
      const delay=.08+Math.hypot(col*.25,row*.28)*.3+((col-row+8)%3)*.035;
      const tile=part('Модуль основания '+col+':'+row,delay,[x,0,z],'base');
      block(tile,1.01,.35,1.01,(col+row+7)%4===0?'woodLight':'wood',0,.175,0,.07);
      const river=row===1||(row===0&&col===3);
      const natural=(row===2&&(col===-2||col===2))||(row===-2&&col===-2);
      block(tile,.996,.065,.996,river?((col%2===0)?'water':'waterLight'):natural?'woodLight':((col-row+8)%4===0?'lightGreen':'sage'),0,.369,0,.032);
      tiles.push({x,z,river});
    }
  }
  const ground=.411;

  // The Kremlin is deliberately built from large toy blocks rather than small architectural details.
  const wall=part('Кремлёвская стена',1.02,[-1.23,ground,-.64]);
  block(wall,3.14,.54,.47,'clay',0,.27,0,.045);
  for(let i=0;i<6;i++)block(wall,.24,.18,.47,'clay',-1.38+i*.55,.62,0,.025);
  const base=part('Башня · нижний куб',1.27,[-1.12,ground,-.63]);
  block(base,.92,1.22,.89,'clay',0,.61,0,.055);
  const arch=mesh(archGeometry(.32,.51,.045,.09),'woodLight',base,0,0,.47);
  const cornice=part('Башня · деревянный пояс',1.70,[-1.12,ground+1.25,-.63]);
  block(cornice,1.04,.14,1.01,'woodLight');
  const clockBody=part('Башня · часы',1.96,[-1.12,ground+1.79,-.63]);
  block(clockBody,.77,.91,.77,'clay',0,0,0,.04);
  const dial=mesh(new THREE.CylinderGeometry(.259,.259,.035,40),'woodLight',clockBody,0,.03,.403);dial.rotation.x=Math.PI/2;
  const face=mesh(new THREE.CylinderGeometry(.216,.216,.04,40),'clock',clockBody,0,.03,.425);face.rotation.x=Math.PI/2;
  for(let i=0;i<4;i++){const a=i*Math.PI/2;const marker=block(clockBody,.022,.045,.012,'woodLight',Math.sin(a)*.175,.03+Math.cos(a)*.175,.451,.004);marker.rotation.z=-a}
  const handA=block(clockBody,.025,.131,.014,'woodLight',.034,.069,.464,.004);handA.rotation.z=-.69;
  const handB=block(clockBody,.019,.173,.014,'woodLight',-.043,.09,.466,.004);handB.rotation.z=.62;
  const upper=part('Башня · верхний куб',2.27,[-1.12,ground+2.43,-.63]);
  block(upper,.86,.13,.86,'woodLight',0,-.14,0,.025);
  block(upper,.57,.44,.57,'clay',0,.11,0,.025);
  for(const x of [-.3,.3])for(const z of [-.3,.3])block(upper,.13,.23,.13,'woodLight',x,-.01,z,.015);
  const roof=part('Башня · зелёная пирамида',2.58,[-1.12,ground+3.39,-.63]);
  const pyramid=mesh(new THREE.ConeGeometry(.57,1.26,4,1),'pine',roof);pyramid.rotation.y=Math.PI/4;
  const star=part('Башня · звезда',3.39,[-1.12,ground+4.15,-.63],'accent');mesh(starGeometry(),'clay',star);

  for(const [i,x]of [-2.62,.28].entries()){
    const b=part('Малая башня '+i,1.43+i*.22,[x,ground,-.64]);
    block(b,.57,.86,.59,'clay',0,.43,0,.04);
    block(b,.65,.10,.66,'woodLight',0,.88,0,.02);
    const p=part('Малая башня · крыша '+i,2.18+i*.23,[x,ground+1.24,-.64]);
    const c=mesh(new THREE.ConeGeometry(.44,.66,4),'pine',p);c.rotation.y=Math.PI/4;
  }

  // Three quiet, primitive volumes suggest the cathedral skyline.
  const churchBase=part('Светлый городской квартал',1.61,[1.05,ground,-1.16]);
  block(churchBase,1.39,.59,1.04,'cream',0,.295,0,.05);
  for(const [i,x,z,h,color]of [[0,-.45,.12,.97,'clayLight'],[1,.17,-.1,1.52,'cream'],[2,.63,.12,.79,'clay']]){
    const drum=part('Храм · цилиндр '+i,2.04+i*.17,[1.05+x,ground+.59,-1.16+z]);
    mesh(new THREE.CylinderGeometry(.235,.235,h,32),'woodLight',drum,0,h/2,0);
    block(drum,.37,h*.76,.39,color,0,h*.45,0,.02);
    const dome=part('Храм · конус '+i,2.87+i*.17,[1.05+x,ground+.59+h,-1.16+z]);
    mesh(new THREE.ConeGeometry(.335,.52,32),'ochre',dome,0,.24,0);
    mesh(new THREE.SphereGeometry(.072,12,8),'woodDark',dome,0,.545,0);
  }

  // Trees: cubes, semicircular blocks and simple cones, all with a visible wooden trunk.
  const trees=[
    [-2.75,-1.47,'arch',1.03,'moss'],[-1.93,-1.79,'cone',1.2,'pine'],[.0,-1.95,'cube',.90,'moss'],
    [2.29,-1.38,'arch',1.23,'moss'],[2.64,-.46,'cone',1.37,'pine'],[1.91,-.25,'cube',.92,'lightGreen'],
    [2.62,.38,'arch',1.08,'sage'],[2.25,1.98,'cube',.88,'moss'],[1.36,2.08,'arch',.80,'lightGreen'],
    [-2.56,.12,'cube',1.02,'moss'],[-2.05,2.0,'cone',.95,'pine'],[-1.14,2.10,'arch',.81,'sage'],[-.52,-1.93,'cone',.84,'moss']
  ];
  trees.forEach(([x,z,type,h,color],i)=>{
    const tree=part('Рощица · '+type+' '+i,2.10+(i%5)*.18+Math.floor(i/5)*.09,[x,ground,z]);
    block(tree,.17,.33,.18,'woodLight',0,.165,0,.02);
    if(type==='cube'){const crown=block(tree,.65,h-.22,.61,color,0,(h+.22)/2,0,.07);crown.rotation.y=(i%3-1)*.11}
    else if(type==='cone')mesh(new THREE.ConeGeometry(.40,h-.21,32),color,tree,0,(h+.21)/2,0);
    else{const crown=mesh(crownGeometry(.62,h-.22,.42),color,tree,0,(h+.22)/2,0);crown.rotation.y=-.12+(i%3)*.11}
  });

  const bridge=part('Арочный деревянный мост',2.92,[.34,ground,1.03]);
  const bridgeArc=mesh(archGeometry(1.89,.97,.68,.22),'woodLight',bridge,0,0,0);bridgeArc.rotation.y=Math.PI/2;
  for(const x of [-.43,.43])block(bridge,.16,.17,1.90,'wood',x,.96,0,.025);
  const deck=block(bridge,1.01,.13,1.95,'woodLight',0,.90,0,.03);
  const boat=part('Маленькая лодка',3.50,[-1.76,ground+.06,1.05],'accent');
  const boatShape=new THREE.Shape();boatShape.moveTo(-.37,0);boatShape.lineTo(-.19,-.14);boatShape.lineTo(.28,-.14);boatShape.lineTo(.4,0);boatShape.lineTo(.2,.14);boatShape.lineTo(-.19,.14);boatShape.closePath();
  const hull=new THREE.ExtrudeGeometry(boatShape,{depth:.1,bevelSize:.025,bevelThickness:.02,bevelSegments:2,steps:1});hull.rotateX(-Math.PI/2);mesh(hull,'cream',boat);
  block(boat,.21,.14,.19,'clayLight',.02,.17,0,.018);
  const rock=part('Природный кубик',3.14,[-.35,ground,2.12]);block(rock,.42,.24,.42,'woodLight',0,.12,0,.06);rock.rotation.y=.12;

  root.updateMatrixWorld(true);
  const bounds=new THREE.Box3().setFromObject(root);
  const duration=Math.max(...parts.map(p=>p.userData.delay+p.userData.duration));
  return{root,parts,mats,bounds,duration,tiles};
}

export function setAssembly(parts,seconds,reduced=false){
  let assembled=0;
  for(const p of parts){
    const u=p.userData,t=reduced?1:THREE.MathUtils.clamp((seconds-u.delay)/u.duration,0,1);
    p.visible=t>0;
    if(t===1){p.position.copy(u.target);p.rotation.set(0,0,0);p.scale.setScalar(1);assembled++;continue}
    const ease=1-Math.pow(1-t,3),settle=t<.7?0:Math.sin((t-.7)/.3*Math.PI)*.035*(1-t);
    p.position.copy(u.target);
    if(u.mode==='base'){
      p.position.y-=1.10*(1-ease);p.position.x+=(u.target.x*.12)*(1-ease);p.position.z+=(u.target.z*.12)*(1-ease);
      p.rotation.y=(u.index%2?.07:-.07)*(1-ease);p.scale.setScalar(.88+.12*ease);
    }else{
      p.position.y+=(u.mode==='accent'?2.7:4.4)*(1-ease)-settle;
      p.rotation.x=(u.index%2?.18:-.18)*(1-ease);p.rotation.z=(u.index%2?-.10:.10)*(1-ease);p.scale.setScalar(.94+.06*ease);
    }
  }
  return assembled;
}

export function createCamera(aspect=1){
  const halfH=4.35,halfW=halfH*aspect;
  const camera=new THREE.OrthographicCamera(-halfW,halfW,halfH,-halfH,.1,100);
  camera.position.set(10,8.4,13);camera.lookAt(0,1.50,0);camera.updateMatrixWorld();return camera;
}

export function fitCamera(camera,aspect){
  const halfH=Math.max(3.64,4.49/aspect);
  camera.left=-halfH*aspect;camera.right=halfH*aspect;camera.top=halfH;camera.bottom=-halfH;camera.updateProjectionMatrix();return halfH;
}
