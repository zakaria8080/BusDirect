document.getElementById('reserve-form').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('reserve-name').value.trim();
    const seat = document.getElementById('reserve-seat').value;
    const note = document.getElementById('reserve-notification');

    if (!name || seat === '#') {
        note.className = "mt-3 text-sm p-2.5 rounded-lg bg-rose-50 text-rose-600 ";
        note.textContent = "Please enter a name and choose a seat.";
    } else {
        note.className = "mt-3 text-sm p-2.5 rounded-lg bg-teal-50 text-teal-700 font-medium border border-teal-200";
        note.textContent = `Reservation successful for ${name} on Seat ${seat}!`;
        e.target.reset();
    }

    setTimeout(() => {
        note.textContent = "";
        note.className = "mt-3";
    }, 2000);
});