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

function rickRoll() {
  const rickRoll = document.createElement('iframe');
  rickRoll.setAttribute('width', '560');
  rickRoll.setAttribute('height', '315');
  rickRoll.setAttribute('src', 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1');
  rickRoll.setAttribute('frameborder', '0');
  rickRoll.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
  rickRoll.setAttribute('allowfullscreen', '');
  rickRoll.style.padding = '20px';
  rickRoll.setid = 'rick-roll';
  const removeRickRoll = document.createElement('button');
  removeRickRoll.innerText = 'Remove Rick Roll';
  removeRickRoll.addEventListener('click', function() {
    rickRoll.remove();
    removeRickRoll.remove();
  });
  appendBody(rickRoll);
  appendBody(removeRickRoll);
}

console.log('app.js loaded!');
