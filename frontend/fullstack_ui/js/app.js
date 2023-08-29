// Description: This is the main entry point for the application.

console.log('app.js loading...');

const appHeader = document.getElementById('app-header');
const appBody = document.getElementById('app-body');
const appFooter = document.getElementById('app-footer');

function msgHeader(msg) {
  appHeader.children[0].innerText = msg;
}

function msgFooter(msg) {
  appFooter.children[0].innerText = msg;
}

function clearBody() {
  appBody.innerHTML = '';
}

function appendBody(element) {
  appBody.appendChild(element);
}

console.log('app.js loaded!');
