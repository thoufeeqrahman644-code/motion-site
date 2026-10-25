'use strict';
const eyes = [...document.querySelectorAll('.eye')].map(element => ({element,pupil:element.querySelector('.pupil'),x:0,y:0,tx:0,ty:0}));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const motionButton = document.querySelector('.motion-toggle');
let paused = false, frame = 0, lastFrame = 0, lastPointer = -Infinity, pointer = null;
let idleTimer, blinkTimer, blinkFinishTimer;
const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
function targetAt(x,y){
  eyes.forEach(eye=>{
    const r=eye.element.getBoundingClientRect(), dx=x-(r.left+r.width/2), dy=y-(r.top+r.height/2);
    // Elliptical limits are relative to each eye's size and never affect the dog artwork.
    const distance=Math.hypot(dx,dy), strength=Math.min(distance/350,1);
    const angle=Math.atan2(dy,dx);
    eye.tx=Math.cos(angle)*r.width*.12*strength;
    eye.ty=Math.sin(angle)*r.height*.085*strength;
  });
  startFrame();
}
function tick(time){
  frame=0;
  if(paused||reducedMotion.matches||document.hidden)return;
  const dt=lastFrame?Math.min(time-lastFrame,50):16.7;lastFrame=time;
  const ease=1-Math.exp(-dt/105);let moving=false;
  eyes.forEach(eye=>{
    eye.x+=(eye.tx-eye.x)*ease;eye.y+=(eye.ty-eye.y)*ease;
    if(Math.abs(eye.tx-eye.x)+Math.abs(eye.ty-eye.y)>.015)moving=true;
    eye.pupil.style.transform=`translate(${eye.x.toFixed(3)}px,${eye.y.toFixed(3)}px)`;
  });
  if(moving)frame=requestAnimationFrame(tick);else lastFrame=0;
}
function startFrame(){if(!frame&&!paused&&!reducedMotion.matches&&!document.hidden)frame=requestAnimationFrame(tick);}
function resetEyes(){
  cancelAnimationFrame(frame);frame=0;lastFrame=0;
  eyes.forEach(eye=>{eye.x=eye.y=eye.tx=eye.ty=0;eye.pupil.style.transform='translate(0px,0px)';eye.element.classList.remove('blink');});
}
function scheduleIdle(){
  clearTimeout(idleTimer);
  if(paused||reducedMotion.matches||document.hidden)return;
  idleTimer=setTimeout(()=>{
    if(performance.now()-lastPointer>3200){
      const stage=document.querySelector('.dog-stage').getBoundingClientRect();
      // A small, shared glance. No head, ear, body or paw transforms exist.
      targetAt(stage.left+stage.width*(.37+Math.random()*.26),stage.top+stage.height*(.2+Math.random()*.19));
    }
    scheduleIdle();
  },4000+Math.random()*2600);
}
function scheduleBlink(){
  clearTimeout(blinkTimer);
  if(paused||reducedMotion.matches||document.hidden)return;
  blinkTimer=setTimeout(()=>{
    const dog=Math.random()<.5?'gold':'curl';
    eyes.filter(eye=>eye.element.dataset.dog===dog).forEach(eye=>eye.element.classList.add('blink'));
    blinkFinishTimer=setTimeout(()=>eyes.forEach(eye=>eye.element.classList.remove('blink')),250);
    scheduleBlink();
  },3400+Math.random()*4600);
}
function updateMotion(){
  clearTimeout(idleTimer);clearTimeout(blinkTimer);clearTimeout(blinkFinishTimer);resetEyes();
  const disabled=paused||reducedMotion.matches;
  motionButton.setAttribute('aria-pressed',String(disabled));
  motionButton.querySelector('.motion-text').textContent=disabled?'Eyes paused':'Pause eyes';
  motionButton.title=reducedMotion.matches?'Reduced motion is enabled':'Pause or resume eye animation';
  motionButton.disabled=reducedMotion.matches;
  if(!disabled){scheduleIdle();scheduleBlink();}
}
document.addEventListener('pointermove',event=>{
  if(event.pointerType==='touch'||!finePointer.matches||paused||reducedMotion.matches)return;
  pointer={x:event.clientX,y:event.clientY};lastPointer=performance.now();targetAt(pointer.x,pointer.y);
},{passive:true});
document.documentElement.addEventListener('pointerleave',()=>{lastPointer=-Infinity;eyes.forEach(eye=>{eye.tx=eye.ty=0});startFrame();});
window.addEventListener('resize',()=>{resetEyes();if(pointer&&!paused&&!reducedMotion.matches)targetAt(pointer.x,pointer.y);},{passive:true});
document.addEventListener('visibilitychange',updateMotion);
reducedMotion.addEventListener('change',updateMotion);
motionButton.addEventListener('click',()=>{paused=!paused;updateMotion();});
updateMotion();


const mobileMenu=document.querySelector('#mobile-menu'), menuToggle=document.querySelector('.menu-toggle');
function closeMenu(){mobileMenu.hidden=true;menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Open menu');}
menuToggle.addEventListener('click',()=>{const opening=mobileMenu.hidden;mobileMenu.hidden=!opening;menuToggle.setAttribute('aria-expanded',String(opening));menuToggle.setAttribute('aria-label',opening?'Close menu':'Open menu');});
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
document.addEventListener('click',event=>{if(event.target.closest('[data-book],#mobile-menu a')||(!mobileMenu.hidden&&!mobileMenu.contains(event.target)&&!menuToggle.contains(event.target)))closeMenu();});
