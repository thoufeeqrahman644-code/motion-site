import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import assert from 'node:assert/strict';
const source=readFileSync('dist/script.js','utf8').split("const dialog=document.querySelector")[0];
function setup(reduced=false){
  const events={},timers=new Map(),frames=new Map();let id=0;
  const eyes=Array.from({length:4},(_,i)=>({dataset:{dog:i<2?'gold':'curl'},pupil:{style:{}},classList:{add(){},remove(){}},querySelector(){return this.pupil},getBoundingClientRect(){return {left:100+i*100,top:100,width:80,height:80}}}));
  const motion={disabled:false,attrs:{},text:{},setAttribute(k,v){this.attrs[k]=v},querySelector(){return this.text},addEventListener(k,v){events['button:'+k]=v}};
  const document={hidden:false,querySelectorAll(){return eyes},querySelector(selector){return selector==='.motion-toggle'?motion:{getBoundingClientRect(){return {left:0,top:0,width:800,height:600}}}},addEventListener(k,v){events[k]=v},documentElement:{addEventListener(k,v){events[k]=v}}};
  const media={matches:reduced,addEventListener(k,v){events['media:'+k]=v}};
  runInNewContext(source,{document,window:{addEventListener(){}},matchMedia:q=>q.includes('reduced')?media:{matches:true},performance:{now:()=>10000},setTimeout:fn=>{timers.set(++id,fn);return id},clearTimeout:i=>timers.delete(i),requestAnimationFrame:fn=>{frames.set(++id,fn);return id},cancelAnimationFrame:i=>frames.delete(i),Math});
  function settle(){for(let t=16;frames.size&&t<3000;t+=16){const queued=[...frames.values()];frames.clear();queued.forEach(fn=>fn(t));}assert.equal(frames.size,0,'Animation frames must stop once the eyes settle');}
  return {events,eyes,motion,media,document,timers,frames,settle};
}
const live=setup();
live.events.pointermove({pointerType:'mouse',clientX:2000,clientY:2000});live.settle();
for(const eye of live.eyes){const [x,y]=eye.pupil.style.transform.match(/-?\d+\.\d+/g).map(Number);assert.ok(Math.abs(x)<=9.6&&Math.abs(y)<=6.8,'Pupil must remain within natural eye limits');}
live.events['button:click']();assert.equal(live.motion.attrs['aria-pressed'],'true');assert.equal(live.timers.size,0);assert.ok(live.eyes.every(e=>e.pupil.style.transform==='translate(0px,0px)'));
live.events.pointermove({pointerType:'mouse',clientX:0,clientY:0});assert.equal(live.frames.size,0,'Paused eyes must not track');
const reduced=setup(true);reduced.events.pointermove({pointerType:'mouse',clientX:0,clientY:0});assert.equal(reduced.frames.size,0);assert.equal(reduced.timers.size,0);assert.equal(reduced.motion.disabled,true);
const touch=setup();touch.events.pointermove({pointerType:'touch',clientX:0,clientY:0});assert.equal(touch.frames.size,0,'Touch gestures must not drive the eyes');
touch.document.hidden=true;touch.events.visibilitychange();assert.equal(touch.timers.size,0,'Hidden pages must stop idle movement and blinks');
console.log('Passed: pupil bounds, smoothing completion, pause, reduced motion, touch, background suspension.');
