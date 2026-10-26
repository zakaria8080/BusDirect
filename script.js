const buttons = document.querySelectorAll('#seats-grid button');
const fullDiv = document.getElementById('bus-full-banner');

const availableSpan = document.getElementById('stat-available');
const occupiedSpan = document.getElementById('stat-occupied');
const revenueSpan = document.getElementById('stat-revenue');

const reserveForm = document.getElementById('reserve-form');
const reserveInput = document.getElementById('reserve-name');
const reserveSelect = document.getElementById('reserve-seat');
const reserveP = document.getElementById('reserve-notification');

const modifyForm = document.getElementById('modify-form');
const modifySelect = document.getElementById('modify-passenger');
const modifyInput = document.getElementById('modify-name');
const modifySeatSelect = document.getElementById('modify-seat');
const modifyP = document.getElementById('modify-notification');

const cancelForm = document.getElementById('cancel-form');
const cancelSelect = document.getElementById('cancel-passenger');
const cancelDiv = document.getElementById('cancel-details');
const cancelP = document.getElementById('cancel-notification');

let seats = [];
for (let i = 1; i <= 20; i++) {
    seats[i] = "";
}

function save() {
    try {
        localStorage.setItem("busSeats", JSON.stringify(seats));
    } catch (error) {
        console.log("Sauvegarde impossible :", error);
    }
}

function load() {
    try {
        const text = localStorage.getItem("busSeats");
        if (text !== null) {
            const list = JSON.parse(text);
            for (let i = 1; i <= 20; i++) {
                if (list[i]) {
                    seats[i] = list[i];
                }
            }
        }
    } catch (error) {
        console.log("Chargement impossible :", error);
    }
}

function showSeats() {
    for (let i = 0; i < buttons.length; i++) {
        const number = i + 1;
        if (seats[number] === "") {
            buttons[i].style.background = "white";
            buttons[i].style.color = "black";
            buttons[i].innerHTML = "<span>" + number + "</span><span>Libre</span>";
        } else {
            buttons[i].style.background = "#0d9488";
            buttons[i].style.color = "white";
            buttons[i].innerHTML = "<span>" + number + "</span><span>" + seats[number] + "</span>";
        }
    }
}

function showStats() {
    let count = 0;
    for (let i = 1; i <= 20; i++) {
        if (seats[i] !== "") {
            count++;
        }
    }
    occupiedSpan.textContent = count;
    availableSpan.textContent = 20 - count;
    revenueSpan.textContent = count * 80 + " DH";

    if (count === 20) {
        fullDiv.classList.remove('hidden');
    } else {
        fullDiv.classList.add('hidden');
    }
}

function showOptions() {
    let html = '<option value="">Select a passenger…</option>';
    for (let i = 1; i <= 20; i++) {
        if (seats[i] !== "") {
            html += '<option value="' + i + '">' + seats[i] + ' (Seat ' + i + ')</option>';
        }
    }
    modifySelect.innerHTML = html;
    cancelSelect.innerHTML = html;
}

function refresh() {
    showSeats();
    showStats();
    showOptions();
    save();
}

// Réserver une place
reserveForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = reserveInput.value.trim();
    let seat = reserveSelect.value;

    if (name === "") {
        reserveP.textContent = "Please enter a name!";
        return;
    }

    if (seat === "#") {
        for (let i = 1; i <= 20; i++) {
            if (seats[i] === "") {
                seat = i;
                break;
            }
        }
    }

    if (seat === "#") {
        reserveP.textContent = "Bus is full!";
        return;
    }

    if (seats[seat] !== "") {
        reserveP.textContent = "This seat is already occupied!";
        return;
    }

    seats[seat] = name;
    refresh();
    reserveP.textContent = "Reservation successful! Seat " + seat;
    reserveForm.reset();
});

// Modifier une réservation
modifySelect.addEventListener('change', function () {
    const seat = modifySelect.value;

    if (seat === "") {
        modifyInput.value = "";
        modifySeatSelect.innerHTML = '<option value="">No reservation selected</option>';
        return;
    }

    modifyInput.value = seats[seat];

    let html = '<option value="' + seat + '">Seat ' + seat + ' (Current)</option>';
    for (let i = 1; i <= 20; i++) {
        if (seats[i] === "") {
            html += '<option value="' + i + '">Seat ' + i + '</option>';
        }
    }
    modifySeatSelect.innerHTML = html;
});

modifyForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const oldSeat = modifySelect.value;
    const newSeat = modifySeatSelect.value;
    const newName = modifyInput.value.trim();

    if (oldSeat === "") {
        modifyP.textContent = "Please select a passenger!";
        return;
    }
    if (newName === "") {
        modifyP.textContent = "Name can't be empty!";
        return;
    }

    seats[oldSeat] = "";
    seats[newSeat] = newName;
    refresh();

    modifyP.textContent = "Updated successfully!";
    modifyForm.reset();
    modifySeatSelect.innerHTML = '<option value="">No reservation selected</option>';
});

// Supprimer une réservation
cancelSelect.addEventListener('change', function () {
    const seat = cancelSelect.value;

    if (seat === "") {
        cancelDiv.classList.add('hidden');
        return;
    }

    cancelDiv.textContent = seats[seat] + " — Seat " + seat + " — 80 DH";
    cancelDiv.classList.remove('hidden');
});

cancelForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const seat = cancelSelect.value;

    if (seat === "") {
        cancelP.textContent = "Please select a passenger!";
        return;
    }

    seats[seat] = "";
    refresh();
    cancelDiv.classList.add('hidden');
    cancelP.textContent = "Reservation cancelled. Seat " + seat + " is free.";
});

load();
refresh();