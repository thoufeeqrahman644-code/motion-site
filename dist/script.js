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

const dialog=document.querySelector('#info-dialog'), content=document.querySelector('#dialog-content');
const mobileMenu=document.querySelector('#mobile-menu'), menuToggle=document.querySelector('.menu-toggle');
let returnFocus;
function closeMenu(){mobileMenu.hidden=true;menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Open menu');}
menuToggle.addEventListener('click',()=>{const opening=mobileMenu.hidden;mobileMenu.hidden=!opening;menuToggle.setAttribute('aria-expanded',String(opening));menuToggle.setAttribute('aria-label',opening?'Close menu':'Open menu');});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
document.addEventListener('click',event=>{if(!mobileMenu.hidden&&!mobileMenu.contains(event.target)&&!menuToggle.contains(event.target))closeMenu();});
const panels={
  stay:`<p class="dialog-eyebrow">The Pillow Paws feeling</p><h2>A little home.<br>A lovely holiday.</h2><p>Imagine a stay built around the things your dog loves: a cosy spot to curl up, time to sniff and explore, and plenty of friendly company.</p><p>Every dog has their own little rituals. Their favourite toy, familiar food and usual routine are the perfect place to start.</p><button class="button primary" data-book>Plan their stay <span aria-hidden="true">↗</span></button><p class="dialog-footer">Pillow Paws is a dog hotel concept. Stay details are illustrative.</p>`,
  care:`<p class="dialog-eyebrow">Our kind of care</p><h2>Little details.<br>Lots of love.</h2><p>We believe the best holidays begin with feeling at home.</p><ul><li>A familiar routine, from breakfast to bedtime.</li><li>Play at their pace, with time to rest in between.</li><li>A favourite blanket and toy to make settling in sweeter.</li><li>A conversation about what makes your dog feel safe and happy.</li></ul><button class="button primary" data-book>Plan their stay <span aria-hidden="true">↗</span></button><p class="dialog-footer">This is the Pillow Paws concept. Care arrangements should be confirmed before booking.</p>`,
  questions:`<p class="dialog-eyebrow">Good to know</p><h2>A few things<br>before the tail wags.</h2><details open><summary>What should I pack?</summary><p>Start with their usual food, a favourite toy and a blanket that smells like home. Share any routines or care needs when arranging the stay.</p></details><details><summary>Can I plan a first visit?</summary><p>A little hello before a first overnight stay can help everyone feel more comfortable. Ask about a visit when making your enquiry.</p></details><details><summary>How do I reserve a stay?</summary><p>This page is a design concept. The booking form lets you explore the experience; it does not send an enquiry or confirm a reservation.</p></details><button class="button primary" data-book>Explore a stay <span aria-hidden="true">↗</span></button>`
};
function openDialog(html,trigger){returnFocus=trigger||document.activeElement;closeMenu();content.innerHTML=html;content.querySelector('h2')?.setAttribute('id','dialog-title');if(!dialog.open)dialog.showModal();}
const localDate=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
function openBooking(trigger){
  const today=localDate(new Date());
  openDialog(`<p class="dialog-eyebrow">Their next little adventure</p><h2>Let’s plan a<br>happy little stay.</h2><p>Tell us a little about your favourite companion.</p><form id="booking-form"><div class="form-grid"><div class="form-wide"><label for="dog-name">Your dog’s name</label><input id="dog-name" name="dog" placeholder="The very good dog in question" autocomplete="off" maxlength="60" required></div><div><label for="arrival">Check in</label><input type="date" id="arrival" name="arrival" min="${today}" required></div><div><label for="departure">Check out</label><input type="date" id="departure" name="departure" min="${today}" required></div></div><p class="booking-note">A little preview: this demo keeps details in your browser only. No reservation or enquiry will be sent.</p><button class="button primary" type="submit">Preview their stay <span aria-hidden="true">↗</span></button></form>`,trigger);
  const arrival=content.querySelector('#arrival'),departure=content.querySelector('#departure');
  departure.addEventListener('change',()=>departure.setCustomValidity(''));
  arrival.addEventListener('change',()=>{const next=new Date(arrival.value+'T12:00:00');next.setDate(next.getDate()+1);departure.min=localDate(next);if(departure.value&&departure.value<=arrival.value)departure.value='';});
  content.querySelector('#booking-form').addEventListener('submit',event=>{
    event.preventDefault();if(departure.value<=arrival.value){departure.setCustomValidity('Choose a check-out date after check-in.');departure.reportValidity();return;}
    departure.setCustomValidity('');const name=content.querySelector('#dog-name').value.trim();
    const format=value=>new Date(value+'T12:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'});
    const dates=`${format(arrival.value)} – ${format(departure.value)}`;
    content.innerHTML='<p class="dialog-eyebrow">A little holiday in the making</p><h2 id="dialog-title"></h2><div class="form-result"><p class="stay-dates"></p><p>Cosy naps and happy days sound lovely.</p></div><p>This is a booking preview only. No stay has been reserved and your details have not been sent.</p><button class="button primary" data-close>Lovely, thank you <span aria-hidden="true">♡</span></button>';
    content.querySelector('h2').textContent=`A happy place for ${name||'your dog'}.`;
    content.querySelector('.stay-dates').textContent=dates;
    content.querySelector('[data-close]').focus();
  });
}
document.addEventListener('click',event=>{
  const book=event.target.closest('[data-book]'),panel=event.target.closest('[data-panel]');
  if(book)openBooking(book);else if(panel)openDialog(panels[panel.dataset.panel],panel);
  if(event.target.closest('.close-dialog,[data-close]'))dialog.close();
});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus();});
