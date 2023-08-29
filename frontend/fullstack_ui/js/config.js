console.log('config.js loading...');

var API_URL = '';
var context = '';

var launchApp = launchDataManager;

if (window.location.hostname === 'localhost') {
  API_URL = 'http://localhost:5000/';
  context = 'local';
  console.log('Running locally...');
} else if (window.location.hostname.includes('test')) {
  API_URL = 'https://fullstackfullstack.pythonanywhere.com/';
  context = 'test';
  console.log('Running on test server...');
}
else {
  API_URL = 'https://fullstackbackendapi.pythonanywhere.com/';
  context = 'prod';
  console.log('Running on production server...');
}

console.log('config.js loaded!');
