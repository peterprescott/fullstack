console.log('maps.js loading...');

async function getPostcodeCoords() {
  const postcode = document.getElementById('postcode-input').value;
  r = await get(API_URL + 'postcode/' + postcode);
  centerMap(r);
}

function centerMap(r) {
	if (r.success) {
	L.marker([r.latitude, r.longitude]).addTo(map)
	map.setView([r.latitude, r.longitude], 13);
	} else {
		console.log(r);
	}
}

const map = L.map('map').setView([51.505, -0.09], 13);
const mapDiv = document.getElementById('map');

const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
}).addTo(map);
