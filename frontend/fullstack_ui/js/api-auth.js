console.log('api-auth.js loading...');

const authIcon = document.getElementById('auth-icon');
const authForm = document.getElementById('auth-form');
const authTopButton = document.getElementById('auth-top-button');
const usernameInput = document.getElementById('username-input');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const passwordConfirmInput = document.getElementById('password-confirm-input');
const authButton = document.getElementById('auth-button');
const authFormToggle = document.getElementById('auth-form-toggle');

const authTopButtonDefaultText = 'Log In / Sign Up';




function authFormToggleHTML(mode) {
  return `<a onclick="render${mode}Form()">Switch to ${mode} Form</a>`;
}

function toggleAuthForm() { authForm.style.display = (
	authForm.style.display === 'inline-block') ? 'none' :
		'inline-block'; }

function renderLoginForm() {
	usernameInput.style.display = 'inline-block';
	passwordInput.style.display = 'inline-block';
	authFormToggle.style.display = 'inline-block';
	authFormToggle.innerHTML = authFormToggleHTML('Signup');
	authButton.innerText = 'Log In';
	authButton.onclick = authRequest;
	passwordConfirmInput.style.display = 'none';
	emailInput.style.display = 'none';
  authIcon.src = '/img/auth-icon.svg';
}

function renderSignupForm() {
	usernameInput.style.display = 'inline-block';
	emailInput.style.display = 'inline-block';
	passwordInput.style.display = 'inline-block';
	passwordConfirmInput.style.display = 'inline-block';
	authFormToggle.style.display = 'inline-block';
	authFormToggle.innerHTML = authFormToggleHTML('Login');
	authButton.innerText = 'Sign Up';
	authButton.onclick = authRequest;
	passwordConfirmInput.style.display = 'inline-block';
	emailInput.style.display = 'inline-block';
  authIcon.src = '/img/auth-icon.svg';
}

function renderSignoutForm() {
	authButton.innerText = 'Sign Out';
	authButton.onclick = signout;
	authFormToggle.style.display = 'none';
	usernameInput.style.display = 'none';
	emailInput.style.display = 'none';
	passwordInput.style.display = 'none';
	passwordConfirmInput.style.display = 'none';
  authIcon.src = '/img/user-icon.svg';
}

passwordInput.addEventListener('keyup', function(event) {
    if (event.code === 'Enter') {
      authRequest();
    }
  }
);
passwordConfirmInput.addEventListener('keyup', function(event) {
    if (event.code === 'Enter') {
      authRequest();
    }
  }
);


function welcome(username) {
  msgHeader(`Welcome, ${username}!`);
  launchButton = document.createElement('button');
  launchButton.innerText = 'Launch';
  launchButton.onclick = addDropdownMenu;
  clearBody();
  appendBody(launchButton);
}


async function authRequest() {
  if (usernameInput.value === '') {
    alert('Username cannot be blank!');
    return;
  }
  if (passwordInput.value === '') {
    alert('Password cannot be blank!');
    return;
  }
	let endpoint = authButton.innerText.replace(' ', '').toLowerCase();
	if (endpoint === 'signup') {
    if (emailInput.value === '') {
      alert('Email cannot be blank!');
      return;
    }
		if (passwordInput.value !== passwordConfirmInput.value) {
			alert('Passwords do not match!');
			return;
		}
	}
	let url = `${apiURL}${endpoint}`;
	let postingData = {
		username: usernameInput.value,
		password: passwordInput.value,
	};
	if (endpoint === 'signup') {
		postingData.email = emailInput.value;
	}
	try {
	  const response = await fetch(url, {
	    method: 'POST',
	    headers: { 'Content-Type': 'application/json' },
	    body: JSON.stringify(postingData),
	  });

	  if (response.ok) {
	    const data = await response.json();
	    localStorage.setItem('token', data.access_token);
	    localStorage.setItem('username', postingData.username);
      localStorage.setItem('user_roles', data.roles);
	    authTopButton.innerText = postingData.username;
	    toggleAuthForm();
	    renderSignoutForm();
      welcome(postingData.username);
	  } else {
	    const errorData = await response.json();
	    alert(`Authentication failed.\n\n ${response.status} ${response.statusText}`);
	  }
	} catch (error) {
	  alert(`Authentication failed.\n\n ${error}`);
  }
}

function signout() {
  msgHeader('See you soon!');
  msgFooter('');
  clearBody();
  confirmation = document.createElement('p');
  confirmation.innerText = 'You have been signed out.';
  appendBody(confirmation);
	localStorage.removeItem('token');
	localStorage.removeItem('username');
  usernameInput.value = '';
  emailInput.value = '';
  passwordInput.value = '';
  passwordConfirmInput.value = '';
	authTopButton.innerText = authTopButtonDefaultText;
	renderLoginForm();
	toggleAuthForm();
}


document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  if (token && username) {
    authTopButton.innerText = username;
    renderSignoutForm();
    welcome(username);
  } else {
    authTopButton.innerText = authTopButtonDefaultText;
    renderLoginForm();
  }
});


console.log('api-auth.js loaded!');
