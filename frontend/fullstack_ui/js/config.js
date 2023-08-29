console.log('config.js loading...');

var apiURL = '';
var context = '';

if (window.location.hostname === 'localhost') {
  apiURL = 'http://localhost:5000/';
  context = 'local';
  console.log('Running locally...');
} else if (window.location.hostname.includes('test')) {
  apiURL = 'https://testbackendapi.pythonanywhere.com/';
  context = 'test';
  console.log('Running on test server...');
}
else {
  apiURL = 'https://fullstackbackendapi.pythonanywhere.com/';
  context = 'prod';
  console.log('Running on production server...');
}

console.log('config.js loaded!');
