console.log('maps.js loading...');

async function getPostcodeCoords() {
  const postcode = document.getElementById('postcode-input').value;
  r = await get(API_URL + 'postcode/' + postcode);
  churches = await get(API_URL + 'churches/' + postcode);
  count_churches = churches.length;
  church_msg = 'There are ' + count_churches + ' churches in ' +
		churches[0].postcode.split(' ')[0] + '.';
  msgFooter(church_msg)

  churches.forEach(c => markChurch(c));

  centerMap(r);
}

function markChurch(c) {
	console.log(c);
	let marker = L.marker([c.latitude, c.longitude],
	).addTo(map);
	marker.bindPopup(c.church_name).openPopup();
}

function centerMap(r) {
	if (r.success) {
	let marker = L.marker([r.latitude, r.longitude]).addTo(map);
	marker.bindPopup(r.postcode).openPopup();

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
