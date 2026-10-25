export const ROOMS=Object.freeze({
  nook:{name:'The Cosy Nook',price:45,capacity:1,image:'assets/room-nook.jpg',description:'A snug private space for one.'},
  garden:{name:'The Garden Room',price:65,capacity:1,image:'assets/room-garden.jpg',description:'Sunshine, garden views, and room to stretch.'},
  suite:{name:'The Snuggle Suite',price:85,capacity:2,image:'assets/room-suite.jpg',description:'A roomy retreat for one or two best friends.'}
});
export function parseDate(value){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return null;
  const stamp=Date.parse(value+'T00:00:00Z');
  return Number.isFinite(stamp)&&new Date(stamp).toISOString().slice(0,10)===value?stamp:null;
}
export function nightsBetween(arrival,departure){
  const a=parseDate(arrival),b=parseDate(departure);
  return a!==null&&b!==null&&b>a?(b-a)/86400000:0;
}
export function quoteStay({room,checkIn,checkOut,dogs=1},today){
  if(!ROOMS[room])throw new Error('Please choose a room.');
  if(![1,2].includes(dogs))throw new Error('Choose one or two dogs.');
  if(ROOMS[room].capacity<dogs)throw new Error('Two dogs need the Snuggle Suite.');
  const nights=nightsBetween(checkIn,checkOut);
  if(!nights)throw new Error('Choose a check-out date after check-in.');
  if(today&&parseDate(checkIn)<parseDate(today))throw new Error('Choose a check-in date from today onwards.');
  return {room:ROOMS[room],nights,nightly:ROOMS[room].price,total:nights*ROOMS[room].price,dogs};
}
export const localISO=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function dayAfter(value){const stamp=parseDate(value);return stamp===null?'':new Date(stamp+86400000).toISOString().slice(0,10);}
