// parti about add in place and 
const reserveForm = document.getElementById('reserve-form');
const nameInput = document.getElementById('reserve-name');
const seatSelect = document.getElementById('reserve-seat');
const notification = document.getElementById('reserve-notification');

function showNote(msg, isError) {
    if (!msg) {
        notification.textContent = "";
        notification.style.cssText = "";
        return;
    }

    notification.style.cssText = `margin-top: 10px; padding: 10px; border-radius: 8px; font-size: 14px; background: ${isError ? '#fff1f2' : '#f0fdf4'}; color: ${isError ? '#be123c' : '#15803d'}; border: 1px solid ${isError ? '#fecdd3' : '#bbf7d0'};`;
    notification.textContent = msg;

    setTimeout(() => {
        showNote("", false);
    }, 1000)
}

reserveForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    let seat = seatSelect.value;

    if (!name) {
        return showNote("Enter a name!", true);
    }

    if (seat === '') {
        const free = document.querySelector('button[data-seat]:not([data-occupied])');
        if (!free) return showNote("Bus is full!", true);
        seat = free.dataset.seat;
    }

    const btn = document.querySelector(`button[data-seat="${seat}"]`);
    if (btn.dataset.occupied) {
        return showNote(`Seat ${seat} is busy!`, true)
    };
    btn.dataset.occupied = "true";
    btn.style.cssText = "display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px; background: #0d9488; border: 1px solid #0f766e; border-radius: 12px; color: white;";
    btn.innerHTML = `<span style="font-size: 16px; font-weight: bold;">${seat}</span><span style="font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 70px;">${name}</span>`;

    const occ = document.getElementById('stat-occupied');
    const av = document.getElementById('stat-available');
    const rev = document.getElementById('stat-revenue');

    occ.textContent = +occ.textContent + 1;
    av.textContent = 20 - +occ.textContent;
    rev.textContent = (+occ.textContent * 80) + " DH";

    showNote(`Reserved seat ${seat} for ${name}!`, false);
    e.target.reset();
});