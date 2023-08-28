console.log('config.js loading...');

if (window.location.hostname === 'localhost') {
  const apiURL = 'http://localhost:5000/';
} else if (window.location.hostname.includes('test')) {
  const apiURL = 'https://testbackendapi.pythonanywhere.com/';
}
else {
  const apiURL = 'https://fullstackbackendapi.pythonanywhere.com/';
}

console.log('config.js loaded!');
