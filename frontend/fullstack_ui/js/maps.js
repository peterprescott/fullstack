console.log('maps.js loading...');

async function getPostcodeCoords() {
  const postcode = document.getElementById('postcode-input').value;
  r = await get(API_URL + 'postcode/' + postcode);
  centerMap(r);
  churches = await get(API_URL + 'churches/' + postcode);

  churches.forEach(c => markChurch(c));
}

function markChurch(c) {
	console.log(c);
	// let icon = L.divIcon(
	// 	{html: c.church_name}
	// )
	let marker = L.marker([c.latitude, c.longitude],
		// {icon: icon}
	).addTo(map);
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

// Define a boundary for the map to restrict panning
var ukBounds = L.latLngBounds(
    L.latLng(58.635, -13.687), // Northeast corner of the UK
    L.latLng(49.866, 2.684)    // Southwest corner of the UK
);

map.setMaxBounds(ukBounds); // Restrict panning to the UK boundaries
map.on('drag', function() {
    map.panInsideBounds(ukBounds, { animate: false });
});
