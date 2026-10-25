import {ROOMS,nightsBetween,quoteStay,localISO,dayAfter} from './booking-model.js';
const form=document.querySelector('#stay-form'),arrival=document.querySelector('#check-in'),departure=document.querySelector('#check-out'),dogCount=document.querySelector('#dog-count');
const error=document.querySelector('#booking-error'),next=document.querySelector('#booking-next'),back=document.querySelector('#booking-back');
const panels=[...document.querySelectorAll('[data-booking-step]')],stepButtons=[...document.querySelectorAll('[data-step]')];
const confirmation=document.querySelector('#booking-confirmation');
let step=1,furthest=1,returnFocus;
const money=value=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(value);
const formatDate=value=>value?new Date(value+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'Add a date';
const selectedRoom=()=>form.querySelector('input[name="room"]:checked').value;
const values=()=>({room:selectedRoom(),checkIn:arrival.value,checkOut:departure.value,dogs:Number(dogCount.value)});
const text=(id,value)=>document.getElementById(id).textContent=value;
function initializeDates(){arrival.min=localISO(new Date());departure.min=dayAfter(arrival.value)||dayAfter(arrival.min);}
function updateSummary(announce=true){
  const room=ROOMS[selectedRoom()],nights=nightsBetween(arrival.value,departure.value);
  const image=document.querySelector('#summary-image');image.src=room.image;image.alt=room.name;
  text('summary-title',room.name);text('summary-subtitle',room.description);text('summary-in',formatDate(arrival.value));text('summary-out',formatDate(departure.value));
  text('night-price-label',nights?`${money(room.price)} × ${nights} night${nights===1?'':'s'}`:`${money(room.price)} per night`);
  text('night-price',nights?money(nights*room.price):'Add dates');text('stay-total',nights?money(nights*room.price):'—');
  text('mobile-stay-total',nights?money(nights*room.price):'Add dates');
  if(announce)text('price-announcement',nights?`${room.name}, ${nights} nights, total ${money(nights*room.price)}.`:`${room.name}, ${money(room.price)} per night. Add your dates for a total.`);
}
function updateCapacity(){
  const two=dogCount.value==='2';
  if(two&&selectedRoom()!=='suite')form.querySelector('[name="room"][value="suite"]').checked=true;
  form.querySelectorAll('[name="room"]').forEach(radio=>radio.disabled=two&&ROOMS[radio.value].capacity<2);
  document.querySelector('#second-dog-fields').hidden=!two;document.querySelector('#second-dog').required=two;
  text('capacity-note',two?'Two friends, one suite. The £85 nightly rate includes both dogs.':'A private room, all to themselves.');
  updateSummary();
}
function clearError(){error.hidden=true;error.textContent='';}
function showError(message){error.textContent=message;error.hidden=false;}
function showStep(value,focus=true){
  step=value;furthest=Math.max(furthest,step);clearError();
  panels.forEach(panel=>{const active=Number(panel.dataset.bookingStep)===step;panel.hidden=!active;panel.disabled=!active;});
  // Fieldset disabling is inherited; preserve the per-room capacity restriction on return.
  if(step===1)updateCapacity();
  stepButtons.forEach(button=>{const n=Number(button.dataset.step);button.disabled=n>furthest;button.classList.toggle('step-complete',n<step);if(n===step)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});
  back.hidden=step===1;
  next.innerHTML=(step===1?'Continue to their details':step===2?'Review their stay':'Confirm demo stay')+' <span aria-hidden="true">↗</span>';
  if(step===3)fillReview();
  if(focus){const heading=panels[step-1].querySelector('legend');heading.tabIndex=-1;heading.focus({preventScroll:true});document.querySelector('.booking-form-card').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
}
function validateDates(){initializeDates();return quoteStay(values(),arrival.min);}
function details(){return {name:document.querySelector('#guest-name').value.trim(),breed:document.querySelector('#guest-breed').value.trim(),age:document.querySelector('#guest-age').value,size:document.querySelector('#guest-size').value,personality:document.querySelector('#guest-personality').value,second:document.querySelector('#second-dog').value.trim(),notes:document.querySelector('#guest-notes').value.trim()};}
function validDetails(){const d=details();return d.name&&d.breed&&d.age&&d.size&&d.personality&&(dogCount.value!=='2'||d.second);}
function fillReview(){
  const d=details();text('review-room',ROOMS[selectedRoom()].name);text('review-dates',`${formatDate(arrival.value)} – ${formatDate(departure.value)}`);
  text('review-dogs',`${d.name} · ${d.breed}${dogCount.value==='2'?`\nAlso staying: ${d.second}`:''}`);text('review-age',`${d.age} · ${d.size}`);text('review-personality',d.personality);
  document.querySelector('#review-notes-row').hidden=!d.notes;text('review-notes',d.notes);updateSummary(false);
}
arrival.addEventListener('change',()=>{clearError();initializeDates();if(departure.value&&departure.value<=arrival.value)departure.value='';updateSummary();});
departure.addEventListener('change',()=>{clearError();updateSummary();});
dogCount.addEventListener('change',updateCapacity);
form.querySelectorAll('[name="room"]').forEach(radio=>radio.addEventListener('change',()=>{clearError();updateSummary();}));
back.addEventListener('click',()=>showStep(step-1));
stepButtons.forEach(button=>button.addEventListener('click',()=>{
  const target=Number(button.dataset.step);if(target===step)return;
  if(target>step){if(!form.reportValidity())return;try{validateDates();}catch(e){showError(e.message);return;}if(target===3&&!validDetails()){showStep(2);showError('Please complete your dog’s details first.');return;}}
  showStep(target);
}));
form.addEventListener('submit',event=>{
  event.preventDefault();clearError();
  try{validateDates();}catch(e){if(step!==1)showStep(1);showError(e.message);return;}
  if(step===1){showStep(2);return;}
  if(!validDetails()){if(step!==2)showStep(2);showError('Please add your dog’s name, breed, age, size, and preferred company.');return;}
  if(step===2){showStep(3);return;}
  const q=validateDates(),d=details();
  text('confirmation-title',`A happy little stay for ${d.name}${q.dogs===2?' & a friend':''}.`);
  text('confirmation-description',`${q.room.name} · ${formatDate(arrival.value)} – ${formatDate(departure.value)} · ${q.nights} night${q.nights===1?'':'s'}`);
  text('confirmation-total',`${money(q.total)} total · demo only`);returnFocus=next;confirmation.showModal();
});
document.addEventListener('click',event=>{
  const trigger=event.target.closest('[data-book],[data-room]');
  if(trigger){
    if(trigger.dataset.room){const room=trigger.dataset.room;if(ROOMS[room]){form.querySelector(`[name="room"][value="${room}"]`).checked=true;if(ROOMS[room].capacity<Number(dogCount.value))dogCount.value='1';}}
    showStep(1,false);updateCapacity();document.querySelector('#booking').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});document.querySelector('#booking-title').focus({preventScroll:true});
  }
  if(event.target.closest('.close-confirmation'))confirmation.close();
});
confirmation.addEventListener('click',event=>{if(event.target===confirmation){const r=confirmation.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)confirmation.close();}});
confirmation.addEventListener('close',()=>{if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});});
document.querySelector('#start-again').addEventListener('click',()=>{returnFocus=null;confirmation.close();form.reset();dogCount.value='1';form.querySelector('[name="room"][value="nook"]').checked=true;furthest=1;initializeDates();showStep(1);});
document.querySelector('#copyright-year').textContent=new Date().getFullYear();
initializeDates();updateCapacity();showStep(1,false);
