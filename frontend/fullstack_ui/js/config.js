console.log('config.js loading...');

var apiURL = '';
console.log(apiURL);

if (window.location.hostname === 'localhost') {
  apiURL = 'http://localhost:5000/';
} else if (window.location.hostname.includes('test')) {
  apiURL = 'https://testbackendapi.pythonanywhere.com/';
}
else {
  apiURL = 'https://fullstackbackendapi.pythonanywhere.com/';
}

console.log('config.js loaded!');
