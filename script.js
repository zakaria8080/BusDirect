const reserveForm = document.getElementById('reserve-form');
const nameInput = document.getElementById('reserve-name');
const seatSelect = document.getElementById('reserve-seat');
const note = document.getElementById('reserve-notification');

const modifyForm = document.getElementById('modify-form');
const modifyPassenger = document.getElementById('modify-passenger');
const modifyName = document.getElementById('modify-name');
const modifySeat = document.getElementById('modify-seat');
const modifyNote = document.getElementById('modify-notification');

function updateStats() {
    const occCount = document.querySelectorAll('button[data-occupied="true"]').length;
    document.getElementById('stat-occupied').textContent = occCount;
    document.getElementById('stat-available').textContent = 20 - occCount;
    document.getElementById('stat-revenue').textContent = (occCount * 80) + " DH";
}

function updatePassengerDropdowns() {
    const occupiedBtns = Array.from(document.querySelectorAll('button[data-occupied="true"]'));
    const optionsHtml = '<option value="">Select a passenger…</option>' + 
        occupiedBtns.map(b => `<option value="${b.dataset.seat}">${b.querySelector('.seat-name').textContent} (Seat ${b.dataset.seat})</option>`).join('');
    
    modifyPassenger.innerHTML = optionsHtml;
}

function showNote(element, msg, isError) {
    if (!msg) {
        element.textContent = "";
        element.style.cssText = "";
        return;
    }
    element.style.cssText = `margin-top: 10px; padding: 10px; border-radius: 8px; font-size: 14px; background: ${isError ? '#fff1f2' : '#f0fdf4'}; color: ${isError ? '#be123c' : '#15803d'}; border: 1px solid ${isError ? '#fecdd3' : '#bbf7d0'};`;
    element.textContent = msg;
    setTimeout(() => showNote(element, "", false), 1000);
}

reserveForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    let seat = seatSelect.value;

    if (!name) return showNote(note, "Enter a name!", true);

    if (seat === '') {
        const free = document.querySelector('button[data-seat]:not([data-occupied])');
        if (!free) return showNote(note, "Bus is full!", true);
        seat = free.dataset.seat;
    }

    const btn = document.querySelector(`button[data-seat="${seat}"]`);
    if (btn.dataset.occupied) return showNote(note, `Seat ${seat} is busy!`, true);

    btn.dataset.occupied = "true";
    btn.style.cssText = "display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px; background: #0d9488; border: 1px solid #0f766e; border-radius: 12px; color: white;";
    btn.innerHTML = `<span style="font-size: 16px; font-weight: bold;">${seat}</span><span style="font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70px;" class="seat-name">${name}</span>`;

    updateStats();
    updatePassengerDropdowns();
    showNote(note, `Reserved seat ${seat} for ${name}!`, false);
    e.target.reset();
});

modifyPassenger.addEventListener('change', () => {
    const seatNum = modifyPassenger.value;
    if (!seatNum) {
        modifyName.value = "";
        modifySeat.innerHTML = '<option value="">No reservation selected</option>';
        return;
    }
    const btn = document.querySelector(`button[data-seat="${seatNum}"]`);
    const passengerName = btn.querySelector('.seat-name').textContent;
    
    modifyName.value = passengerName;
    
    let options = '<option value="#">Choose new seat (optional)</option>';
    for (let i = 1; i <= 20; i++) {
        const b = document.querySelector(`button[data-seat="${i}"]`);
        if (!b.dataset.occupied || i == seatNum) {
            options += `<option value="${i}">Seat ${i}${i == seatNum ? ' (Current)' : ''}</option>`;
        }
    }
    modifySeat.innerHTML = options;
});

modifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const oldSeatNum = modifyPassenger.value;
    let newSeatNum = modifySeat.value;
    const name = modifyName.value.trim();

    if (!oldSeatNum) return showNote(modifyNote, "Select a passenger first!", true);

    const oldBtn = document.querySelector(`button[data-seat="${oldSeatNum}"]`);

    if (newSeatNum === '' || !newSeatNum) {
        newSeatNum = oldSeatNum;
    }

    const newBtn = document.querySelector(`button[data-seat="${newSeatNum}"]`);
    if (newBtn.dataset.occupied && newBtn !== oldBtn) {
        return showNote(modifyNote, `Seat ${newSeatNum} is occupied!`, true);
    }

    if (newBtn !== oldBtn) {
        oldBtn.removeAttribute('data-occupied');
        oldBtn.style.cssText = "display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px; background: white; border: 1px solid #e5e7eb; border-radius: 12px;";
        oldBtn.innerHTML = `<span style="font-size: 16px; font-weight: bold; color: #334155;">${oldSeatNum}</span><span style="font-size: 12px; color: #94a3b8;">Libre</span>`;
    }

    newBtn.dataset.occupied = "true";
    newBtn.style.cssText = "display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px; background: #0d9488; border: 1px solid #0f766e; border-radius: 12px; color: white;";
    newBtn.innerHTML = `<span style="font-size: 16px; font-weight: bold;">${newSeatNum}</span><span style="font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70px;" class="seat-name">${name}</span>`;

    updateStats();
    updatePassengerDropdowns();
    showNote(modifyNote, `Updated successfully for ${name}!`, false);
    modifyForm.reset();
    modifySeat.innerHTML = '<option value="">No reservation selected</option>';
});