// Description: This is the main entry point for the application.

console.log('app.js loading...');

const navBar = document.getElementById('navbar');
const footer = document.getElementById('footer');
const appHeader = document.getElementById('app-header');
const appBody = document.getElementById('app-body');
const appFooter = document.getElementById('app-footer');

function msgHeader(msg) {
  appHeader.children[0].innerText = msg;
  resizeBody();
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

function resizeBody() {
  const appHeaderHeight = appHeader.offsetHeight;
  const appFooterHeight = appFooter.offsetHeight;
  const navBarHeight = navBar.offsetHeight;
  const footerHeight = footer.offsetHeight;
  const appBodyHeight = window.innerHeight - appHeaderHeight - appFooterHeight - navBarHeight - footerHeight;
  appBody.style.minHeight = appBodyHeight + 'px';
}

function addLaunchButton() {
  console.log('button');
  launchButton = document.createElement('button');
  launchButton.id = 'launch-button';
  launchButton.innerText = 'Launch';
  launchButton.onclick = launchApp;
  clearBody();
  appendBody(launchButton);
}

console.log('app.js loaded!');
