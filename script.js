const boutons = document.querySelectorAll('#seats-grid button');
const pleinDiv = document.getElementById('bus-full-banner');

const libresSpan = document.getElementById('stat-available');
const occupesSpan = document.getElementById('stat-occupied');
const prixSpan = document.getElementById('stat-revenue');

const formRes = document.getElementById('reserve-form');
const nomRes = document.getElementById('reserve-name');
const placeRes = document.getElementById('reserve-seat');
const msgRes = document.getElementById('reserve-notification');

const formMod = document.getElementById('modify-form');
const choixMod = document.getElementById('modify-passenger');
const nomMod = document.getElementById('modify-name');
const placeMod = document.getElementById('modify-seat');
const msgMod = document.getElementById('modify-notification');

const formAnn = document.getElementById('cancel-form');
const choixAnn = document.getElementById('cancel-passenger');
const infoAnn = document.getElementById('cancel-details');
const msgAnn = document.getElementById('cancel-notification');

// les 20 places : on lit le localStorage, sinon vide
let tabPlaces = [];
for (let i = 1; i <= 20; i++) {
    let nom = localStorage.getItem("place" + i);
    if (nom === null) {
        tabPlaces[i] = "";
    } else {
        tabPlaces[i] = nom;
    }
}

// met à jour tout l'affichage + sauvegarde
function actualiser() {
    let total = 0;
    let code = '<option value="">Select a passenger…</option>';

    for (let i = 1; i <= 20; i++) {
        // bouton de la place
        if (tabPlaces[i] === "") {
            boutons[i - 1].style.background = "white";
            boutons[i - 1].style.color = "black";
            boutons[i - 1].innerHTML = "<span>" + i + "</span><span>Libre</span>";
        } else {
            boutons[i - 1].style.background = "#0d9488";
            boutons[i - 1].style.color = "white";
            boutons[i - 1].innerHTML = "<span>" + i + "</span><span>" + tabPlaces[i] + "</span>";
            total = total + 1;
            code = code + '<option value="' + i + '">' + tabPlaces[i] + ' (Seat ' + i + ')</option>';
        }

        // sauvegarde
        localStorage.setItem("place" + i, tabPlaces[i]);
    }

    // statistiques
    occupesSpan.textContent = total;
    libresSpan.textContent = 20 - total;
    prixSpan.textContent = total * 80 + " DH";

    if (total === 20) {
        pleinDiv.style.display = "block";
    } else {
        pleinDiv.style.display = "none";
    }

    // listes des passagers
    choixMod.innerHTML = code;
    choixAnn.innerHTML = code;
}

// Réserver une place
formRes.onsubmit = function () {
    let nom = nomRes.value;
    let place = placeRes.value;

    if (nom === "") {
        msgRes.textContent = "Please enter a name!";
        return false;
    }

    // "automatique" : première place libre
    if (place === "#") {
        for (let i = 1; i <= 20; i++) {
            if (tabPlaces[i] === "") {
                place = i;
                break;
            }
        }
    }

    if (place === "#") {
        msgRes.textContent = "Bus is full!";
        return false;
    }

    if (tabPlaces[place] !== "") {
        msgRes.textContent = "This seat is already occupied!";
        return false;
    }

    tabPlaces[place] = nom;
    actualiser();
    msgRes.textContent = "Reservation successful! Seat " + place;
    formRes.reset();
    return false;
};

// Modifier une réservation
choixMod.onchange = function () {
    let place = choixMod.value;

    if (place === "") {
        nomMod.value = "";
        placeMod.innerHTML = '<option value="">No reservation selected</option>';
        return;
    }

    nomMod.value = tabPlaces[place];

    let code = '<option value="' + place + '">Seat ' + place + ' (Current)</option>';
    for (let i = 1; i <= 20; i++) {
        if (tabPlaces[i] === "") {
            code = code + '<option value="' + i + '">Seat ' + i + '</option>';
        }
    }
    placeMod.innerHTML = code;
};

formMod.onsubmit = function () {
    let anciennePlace = choixMod.value;
    let nouvellePlace = placeMod.value;
    let nouveauNom = nomMod.value;

    if (anciennePlace === "") {
        msgMod.textContent = "Please select a passenger!";
        return false;
    }
    if (nouveauNom === "") {
        msgMod.textContent = "Name can't be empty!";
        return false;
    }

    tabPlaces[anciennePlace] = "";
    tabPlaces[nouvellePlace] = nouveauNom;
    actualiser();

    msgMod.textContent = "Updated successfully!";
    formMod.reset();
    placeMod.innerHTML = '<option value="">No reservation selected</option>';
    return false;
};

// Supprimer une réservation
choixAnn.onchange = function () {
    let place = choixAnn.value;

    if (place === "") {
        infoAnn.style.display = "none";
        return;
    }

    infoAnn.textContent = tabPlaces[place] + " — Seat " + place + " — 80 DH";
    infoAnn.style.display = "block";
};

formAnn.onsubmit = function () {
    let place = choixAnn.value;

    if (place === "") {
        msgAnn.textContent = "Please select a passenger!";
        return false;
    }

    tabPlaces[place] = "";
    actualiser();
    infoAnn.style.display = "none";
    msgAnn.textContent = "Reservation cancelled. Seat " + place + " is free.";
    return false;
};

actualiser();