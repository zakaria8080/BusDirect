"use strict";
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

let pass = 0, fail = 0;
const ok = (c, m) => { c ? (pass++, console.log("PASS", m)) : (fail++, console.log("FAIL", m)); };

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
window.localStorage.clear();

for (const f of ["store.js", "notifications.js", "seat-map.js", "app.js"]) {
  window.eval(fs.readFileSync(path.join(__dirname, "..", "src", "js", f), "utf8"));
}

const $ = (id) => document.getElementById(id);
const submit = (id) => $(id).dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
const click = (seat) => document.querySelector(`button[data-seat="${seat}"]`).dispatchEvent(new window.MouseEvent("click", { bubbles: true }));

// --- initial render
ok($("seat-map").querySelectorAll("button[data-seat]").length === 20, "20 seats rendered");
ok($("stat-available").textContent === "20", "20 available initially");

// --- reserve with explicit seat (Case A)
$("reserve-name").value = "Ahmed Amine";
$("reserve-seat").value = "5";
submit("reserve-form");
let store = JSON.parse(window.localStorage.getItem("busdirect.reservations.v1"));
ok(store.length === 1 && store[0].name === "Ahmed Amine" && store[0].seat === 5, "reserve Ahmed on explicit seat 5");
ok($("stat-occupied").textContent === "1" && $("stat-available").textContent === "19", "stats 1/19 after first reserve");
ok($("stat-revenue").textContent.trim().startsWith("80"), "revenue shows 80 DH");

// --- reserve with auto-assign (Case B) — lowest free seat is 1
$("reserve-name").value = "Fatima";
$("reserve-seat").value = "";
submit("reserve-form");
store = JSON.parse(window.localStorage.getItem("busdirect.reservations.v1"));
ok(store.some(r => r.name === "Fatima" && r.seat === 1), "auto-assign picks lowest free seat (1)");

// --- duplicate name rejected (Case C)
$("reserve-name").value = "ahmed amine";
$("reserve-seat").value = "";
submit("reserve-form");
store = JSON.parse(window.localStorage.getItem("busdirect.reservations.v1"));
ok(store.length === 2 && !store.some(r => r.name.toLowerCase() === "ahmed amine" && r.seat !== 5), "duplicate 'ahmed amine' rejected");
ok($("reserve-notification").textContent.toLowerCase().includes("already"), "duplicate error notification shown");

// --- empty name rejected (Case D)
$("reserve-name").value = "   ";
submit("reserve-form");
ok($("reserve-notification").textContent.toLowerCase().includes("required"), "empty-name rejected with message");

// --- occupied seat is not offered, so it cannot be picked (Case E)
ok(!Array.from($("reserve-seat").options).some(o => o.value === "5"), "occupied seat 5 not offered in reserve dropdown");

// --- click available seat -> switches reserve select
click(7);
ok($("reserve-seat").value === "7", "click free seat 7 switches reserve seat select");

// --- click occupied seat 5 -> switches modify form to Ahmed
click(5);
ok($("modify-passenger").value === String(store.find(r => r.name === "Ahmed Amine").id), "click occupied seat selects that passenger in modify form");
ok($("modify-name").value === "Ahmed Amine", "modify name prefilled");
const modSeatValues = Array.from($("modify-seat").options).map(o => o.value);
ok(modSeatValues.includes("5"), "own seat 5 stays selectable");
ok(!modSeatValues.includes("1"), "other occupied seat 1 excluded from destinations");

// --- switch passenger via dropdown -> name/seat update
const fatimaId = store.find(r => r.name === "Fatima").id;
$("modify-passenger").value = fatimaId;
$("modify-passenger").dispatchEvent(new window.Event("change", { bubbles: true }));
ok($("modify-name").value === "Fatima", "switching passenger prefills Fatima");

// --- modify: change seat via drag-free path (submit with new seat)
$("modify-passenger").value = String(store.find(r => r.name === "Ahmed Amine").id);
$("modify-passenger").dispatchEvent(new window.Event("change", { bubbles: true }));
$("modify-name").value = "Ahmed Amine";
$("modify-seat").value = "10";
submit("modify-form");
store = JSON.parse(window.localStorage.getItem("busdirect.reservations.v1"));
const ahmed = store.find(r => r.name === "Ahmed Amine");
ok(ahmed && ahmed.seat === 10, "modify moves Ahmed to seat 10");
ok(!store.some(r => r.seat === 5), "old seat 5 released after move");

// --- drag and drop: occupied (Fatima@1) -> free seat 3
window.eval("window.__drag = (function(){ var s=document.querySelector('button[data-seat=\"1\"]'); return s.dataset.reservationId; })()");
const draggedId = window.__drag;
ok(draggedId === String(fatimaId), "occupied seat exposes reservation id for drag");
const dt = { setData(){}, getData(){ return draggedId; }, effectAllowed:"", dropEffect:"" };
const srcBtn = document.querySelector('button[data-seat="1"]');
const dstBtn = document.querySelector('button[data-seat="3"]');
const dragStart = new window.Event("dragstart", { bubbles: true, cancelable: true });
dragStart.dataTransfer = dt; Object.defineProperty(dragStart, "target", { value: srcBtn });
srcBtn.dispatchEvent(dragStart);
const drop = new window.Event("drop", { bubbles: true, cancelable: true });
drop.dataTransfer = dt; Object.defineProperty(drop, "target", { value: dstBtn }); Object.defineProperty(drop, "preventDefault", { value(){} });
dstBtn.dispatchEvent(drop);
store = JSON.parse(window.localStorage.getItem("busdirect.reservations.v1"));
const fatima = store.find(r => r.name === "Fatima");
ok(fatima && fatima.seat === 3, "drag-and-drop moves Fatima to seat 3");

// --- cancel frees seat
$("cancel-passenger").value = String(fatimaId);
window.confirm = () => true;
submit("cancel-form");
store = JSON.parse(window.localStorage.getItem("busdirect.reservations.v1"));
ok(!store.some(r => r.name === "Fatima"), "cancel removes Fatima");
// Derive expected stats from the actual store so the assertion can't go stale.
ok(Number($("stat-occupied").textContent) === store.length && Number($("stat-available").textContent) === 20 - store.length, "occupied/available match store after cancel");
ok($("stat-revenue").textContent.trim().startsWith(String(store.length * 80)), "revenue equals occupied x 80 after cancel");

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
