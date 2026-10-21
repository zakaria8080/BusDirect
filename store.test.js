"use strict";
const mem = {};
global.localStorage = {
  getItem: (k) => (k in mem ? mem[k] : null),
  setItem: (k, v) => { mem[k] = String(v); },
  removeItem: (k) => { delete mem[k]; },
};
const fs = require("fs");
const code = fs.readFileSync("src/js/store.js", "utf8");
global.window = global;
eval(code);
const B = window.BusDirect;

let pass = 0, fail = 0;
function ok(cond, msg) { cond ? (pass++, console.log("PASS", msg)) : (fail++, console.log("FAIL", msg)); }

let r = [];

// Case B — auto-assign lowest seat
let res = B.create(r, "Ahmed Amine");
ok(res.ok && res.reservation.seat === 1, "auto-assign gives seat 1");
r = res.reservations;

// Case A — explicit seat 5
res = B.create(r, "Fatima Zohra", 5);
ok(res.ok && res.reservation.seat === 5, "explicit seat 5");
r = res.reservations;

// Case C — duplicate name, case-insensitive
ok(!B.create(r, "ahmed amine").ok, "duplicate name 'ahmed amine' rejected");
ok(!B.create(r, "  Ahmed   Amine  ").ok, "duplicate name with extra whitespace rejected");

// Case D — empty names
ok(!B.create(r, "   ").ok, "whitespace-only name rejected");
ok(!B.create(r, "").ok, "empty name rejected");

// Case E — occupied seat
res = B.create(r, "Karim", 5);
ok(!res.ok, "occupied seat 5 rejected");
r = B.create(r, "Karim").reservations;

// Stats with 3 passengers
let s = B.stats(r);
ok(s.occupied === 3 && s.available === 17 && s.revenue === 240, "stats 3 pax: 3/17/240");

// Cancel lifecycle
r = B.cancel(r, r.find((x) => x.name === "Karim").id).reservations;
s = B.stats(r);
ok(s.occupied === 2 && s.available === 18 && s.revenue === 160, "after cancel: 2/18/160");
ok(!B.seatMap(r)[3], "seat 3 (auto-assigned) released");

// Modify: own unchanged name not a duplicate
const f = r.find((x) => x.name === "Fatima Zohra");
res = B.update(r, f.id, "Fatima Zohra ", null);
ok(res.ok, "own unchanged name accepted (self-dup check)");
r = res.reservations;
ok(r.find((x) => x.id === f.id).seat === 5, "seat retained on name-only change");

// Modify: rename to another passenger's name
const other = r.find((x) => x.name === "Ahmed Amine");
res = B.update(r, f.id, "Ahmed Amine", null);
ok(!res.ok, "renaming to another passenger's name rejected");

// Modify: move to occupied seat
res = B.update(r, f.id, f.name, other.seat);
ok(!res.ok, "move to occupied seat rejected");

// Modify: move to free seat
res = B.update(r, f.id, f.name, 10);
ok(res.ok, "move to free seat 10");
ok(res.changed, "move reports changed");
r = res.reservations;
ok(!B.seatMap(r)[5], "previous seat 5 released");
ok(B.seatMap(r)[10] && B.seatMap(r)[10].name === "Fatima Zohra", "seat 10 now Fatima");

// Modify: no change at all -> changed false
res = B.update(r, f.id, f.name, 10);
ok(res.ok && !res.changed, "no-op modification reports no change");

// Fill the bus completely (they have 2 reservations incl. Fatima@10, Ahmed@1)
r = B.create(r, "P3").reservations; r = B.create(r, "P4").reservations;
for (let i = 5; i <= 20; i++) r = B.create(r, "Filler" + i).reservations;
s = B.stats(r);
ok(s.occupied === 20 && s.available === 0 && s.revenue === 1600, "full bus: 20/0/1600");
ok(!B.create(r, "Extra").ok, "extra reservation on full bus rejected");
ok(B.update(r, f.id, "Fatima Renamed", "").ok, "modify still allowed on full bus");
ok(B.cancel(r, f.id).ok, "cancel still allowed on full bus");

// After cancel, new reservation possible & ascending order
r = B.cancel(r, r[0].id).reservations;
res = B.create(r, "AfterFill");
ok(res.ok, "reservation allowed after freeing seat on full bus");
ok(res.reservation.seat === 1, "auto-assign ascending after fill");

// Persistence round-trip + validation
B.save(r);
let loaded = B.load();
ok(JSON.stringify(loaded.reservations) === JSON.stringify(r), "load(save(x)) == x");

// Malformed JSON
mem[B.STORAGE_KEY] = "{not json";
ok(B.load().reservations.length === 0 && !B.load().corrupt === false, "malformed JSON -> empty, flagged");

// Invalid records dropped, valid kept
mem[B.STORAGE_KEY] = JSON.stringify([
  { id: "1", name: "Valid One", seat: 1, price: 80 },
  { id: "2", name: "No seat", seat: 99, price: 80 },
  { id: "3", name: "Bad price", seat: 2, price: 999 },
  { id: "1", name: "Duplicate id", seat: 3, price: 80 },
  { id: "4", name: "valid one", seat: 4, price: 80 }, // duplicate name
  { id: "5", name: "", seat: 5, price: 80 },
  { id: "6", name: "Valid Two", seat: 2, price: 80 },
  { id: "", name: "No id", seat: 6, price: 80 },
]);
loaded = B.load();
ok(loaded.reservations.length === 2, "only 2 valid records survive load");
ok(loaded.reservations[0].id === "1" && loaded.reservations[1].seat === 2, "valid records intact");

// Storage probe failing (no shim access blocked simulation)
delete global.localStorage; global.window = global;
ok(B.probe() === false || global.localStorage === undefined, "probe safe when storage missing");

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
