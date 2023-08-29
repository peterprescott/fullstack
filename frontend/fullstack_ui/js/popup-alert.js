// Replace the built-in alert() function with a pop-up message

console.log("popup-alert.js loading...");

const overlay = document.getElementById("overlay");
const popupMessage = document.getElementById("popup-message");
const popupButton = document.getElementById("popup-button");

overlay.style.display = "none";

function alert(message) {
  popUp(message);
}

function popUp(message) {
    popupMessage.innerText = message;
    overlay.style.display = "flex";
    popupButton.focus();
}

function closePopUp() {
    overlay.style.display = "none";
}

console.log("popup-alert.js loaded!");
