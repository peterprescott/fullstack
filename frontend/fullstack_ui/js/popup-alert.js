// Replace the built-in alert() function with a pop-up message

console.log("popup-alert.js loading...");

const overlay = document.getElementById("overlay");
const popupMessage = document.getElementById("popup-message");
const popupButton = document.getElementById("popup-button");

overlay.style.display = "none";

function alert(message) {
  popUp(message);
  msgFooter(message);
  if (context === "local") {
    // rickRoll();
  }
}

function popUp(message) {
    mapDiv.style.zIndex = "-1";
    popupMessage.innerText = message;
    overlay.style.display = "flex";
    popupButton.focus();
}

function closePopUp() {
    mapDiv.style.zIndex = "1";
    overlay.style.display = "none";
}

console.log("popup-alert.js loaded!");
