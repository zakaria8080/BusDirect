// varibles needed : 
const seatsGrid = document.getElementById('seats-grid');
const busFullBanner = document.getElementById('bus-full-banner');

const statAvailable = document.getElementById('stat-available');
const statOccupied = document.getElementById('stat-occupied');
const statRevenue = document.getElementById('stat-revenue');

const reserveForm = document.getElementById('reserve-form');
const reserveName = document.getElementById('reserve-name');
const reserveSeat = document.getElementById('reserve-seat');
const reserveNotification = document.getElementById('reserve-notification');

const modifyForm = document.getElementById('modify-form');
const modifyPassenger = document.getElementById('modify-passenger');
const modifyName = document.getElementById('modify-name');
const modifySeat = document.getElementById('modify-seat');
const modifyNotification = document.getElementById('modify-notification');

const cancelForm = document.getElementById('cancel-form');
const cancelPassenger = document.getElementById('cancel-passenger');
const cancelDetails = document.getElementById('cancel-details');
const cancelNotification = document.getElementById('cancel-notification');

const TOTAL_SEATS = 20;
const SEAT_PRICE = 80;

function getSeatButton(number) {
    return seatsGrid.querySelector(`button[data-seat="${number}"]`);
}

function fillSeat(number, name) {
    const seat = getSeatButton(number);
    seat.dataset.occupied = "true";
    seat.style.background = "#0d9488";
    seat.style.color = "white";
    seat.innerHTML = `<span style="font-weight:bold;">${number}</span>
        <span class="seat-name" style="font-size:11px;">${name}</span>`;
}

function freeSeat(number) {
    const seat = getSeatButton(number);
    seat.removeAttribute('data-occupied');
    seat.style.background = "white";
    seat.style.color = "black";
    seat.innerHTML = `<span style="font-weight:bold;">${number}</span>
            <span style="font-size:11px;">Libre</span>`;
}

function updateStats() {
    const occupied = seatsGrid.querySelectorAll('button[data-occupied="true"]').length;
    statOccupied.textContent = occupied;
    statAvailable.textContent = TOTAL_SEATS - occupied;
    statRevenue.textContent = occupied * SEAT_PRICE + " DH";
    busFullBanner.classList.toggle('hidden', occupied < TOTAL_SEATS);
}

function updatePassengerLists() {
    let options = '<option value="">Select a passenger…</option>';
    seatsGrid.querySelectorAll('button[data-occupied="true"]').forEach(seat => {
        const number = seat.dataset.seat;
        const name = seat.querySelector('.seat-name').textContent;
        options += `<option value="${number}">${name} (Seat ${number})</option>`;
    });
    modifyPassenger.innerHTML = options;
    cancelPassenger.innerHTML = options;
}

// ---------- create ----------
reserveForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = reserveName.value.trim();
    let seatNumber = reserveSeat.value;

    if (name === "") {
        reserveNotification.textContent = "Please enter a name!";
        return;
    }

    if (seatNumber === "#") {
        const firstFree = seatsGrid.querySelector('button[data-seat]:not([data-occupied])');
        if (!firstFree) {
            reserveNotification.textContent = "Bus is full!";
            return;
        }
        seatNumber = firstFree.dataset.seat;
    }

    if (getSeatButton(seatNumber).dataset.occupied) {
        reserveNotification.textContent = "This seat is already occupied!";
        return;
    }

    fillSeat(seatNumber, name);
    updateStats();
    updatePassengerLists();
    reserveNotification.textContent = "Reservation successful! Seat " + seatNumber;
    reserveForm.reset();
});

// parti la modification de produits : 
modifyPassenger.addEventListener('change', function () {
    const seatNumber = modifyPassenger.value;

    if (seatNumber === "") {
        modifyName.value = "";
        modifySeat.innerHTML = '<option value="">No reservation selected</option>';
        return;
    }

    modifyName.value = getSeatButton(seatNumber).querySelector('.seat-name').textContent;

    let options = `<option value="${seatNumber}">Seat ${seatNumber} (Current)</option>`;
    for (let i = 1; i <= TOTAL_SEATS; i++) {
        if (!getSeatButton(i).dataset.occupied) {
            options += `<option value="${i}">Seat ${i}</option>`;
        }
    }
    modifySeat.innerHTML = options;
});

modifyForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const oldSeat = modifyPassenger.value;
    const newSeat = modifySeat.value;
    const newName = modifyName.value.trim();

    if (oldSeat === "") {
        modifyNotification.textContent = "Please select a passenger!";
        return;
    }
    if (newName === "") {
        modifyNotification.textContent = "Name can't be empty!";
        return;
    }

    if (newSeat !== oldSeat) {
        freeSeat(oldSeat);
    }
    fillSeat(newSeat, newName);

    updateStats();
    updatePassengerLists();
    modifyNotification.textContent = "Updated successfully!";
    modifyForm.reset();
    modifySeat.innerHTML = '<option value="">No reservation selected</option>';
});

// parti remove de place : 
cancelPassenger.addEventListener('change', function () {
    const seatNumber = cancelPassenger.value;

    if (seatNumber === "") {
        cancelDetails.classList.add('hidden');
        return;
    }

    const name = getSeatButton(seatNumber).querySelector('.seat-name').textContent;
    cancelDetails.textContent = `${name} — Seat ${seatNumber} — ${SEAT_PRICE} DH`;
    cancelDetails.classList.remove('hidden');
});

cancelForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const seatNumber = cancelPassenger.value;

    if (seatNumber === "") {
        cancelNotification.textContent = "Please select a passenger!";
        return;
    }

    freeSeat(seatNumber);
    updateStats();
    updatePassengerLists();
    cancelDetails.classList.add('hidden');
    cancelNotification.textContent = "Reservation cancelled. Seat " + seatNumber + " is free.";
});