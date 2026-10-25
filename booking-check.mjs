import assert from 'node:assert/strict';
import {ROOMS,parseDate,nightsBetween,quoteStay,dayAfter} from './dist/booking-model.js';
assert.equal(parseDate('2027-02-29'),null);
assert.equal(parseDate('not-a-date'),null);
assert.equal(nightsBetween('2028-02-28','2028-03-01'),2);
assert.equal(nightsBetween('2026-10-24','2026-10-26'),2,'Daylight saving changes must not affect the number of nights');
assert.equal(nightsBetween('2026-11-04','2026-11-04'),0);
assert.equal(nightsBetween('2026-11-05','2026-11-04'),0);
assert.equal(dayAfter('2026-12-31'),'2027-01-01');
for(const [id,room] of Object.entries(ROOMS)){const q=quoteStay({room:id,checkIn:'2026-11-01',checkOut:'2026-11-04',dogs:1},'2026-10-25');assert.equal(q.nights,3);assert.equal(q.total,room.price*3);}
assert.equal(quoteStay({room:'suite',checkIn:'2026-11-01',checkOut:'2026-11-04',dogs:2}).total,255,'Suite rate includes two dogs');
assert.throws(()=>quoteStay({room:'nook',checkIn:'2026-11-01',checkOut:'2026-11-04',dogs:2}),/Suite/);
assert.throws(()=>quoteStay({room:'garden',checkIn:'2026-10-01',checkOut:'2026-10-04',dogs:1},'2026-10-25'),/today/);
assert.throws(()=>quoteStay({room:'garden',checkIn:'2026-11-01',checkOut:'2026-11-01',dogs:1}),/after/);
assert.throws(()=>quoteStay({room:'invalid',checkIn:'2026-11-01',checkOut:'2026-11-04',dogs:1}),/room/);
console.log('Passed: valid dates, leap years, daylight saving, nightly prices, two-dog capacity, past dates, and total calculation.');
