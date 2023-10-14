console.log("maps.js loading...");

async function getPostcodeCoords() {
  const postcode = document.getElementById('postcode-input').value;

  if (postcode.replace(" ", "").length < 5) {
    alert("Bro, you know that ain't a postcode");
    return;
  }

  r = await get(API_URL + 'postcode/' + postcode);
  churches = await get(API_URL + 'churches/' + postcode);
  count_churches = churches.length;
  church_msg = 'There are ' + count_churches + ' churches in ' +
		churches[0].postcode.split(' ')[0] + '.';
  msgFooter(church_msg)

  churches.forEach(c => markChurch(c));

  centerMap(r);
}

async function toggleBoundaries() {
  const boundaries = document.getElementById("show-boundaries").checked;
  console.log(boundaries);
  if (boundaries) {
    loadBoundaries();
  } else {
    hideBoundaries();
  }
}

function markChurch(c) {
	console.log(c);
	let marker = L.marker([c.latitude, c.longitude],
	).addTo(map);
	marker.bindPopup(c.church_name).openPopup();
}

async function loadBoundaries() {
  const boundaries = await get(API_URL + "boundaries");

  var boundariesLayer = L.geoJSON(JSON.parse(boundaries), {
    style: (feature) => {
      return {
        color: "red",
        weight: 2,
        fillOpacity: 0.1,
      };
    },
    onEachFeature: function (feature, layer) {
      layer.bindPopup(feature.properties.name);
    },
  });

  boundariesLayer.addTo(map);
}

function hideBoundaries() {
  map.eachLayer(function (layer) {
    if (layer.feature) {
      map.removeLayer(layer);
    }
  });
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

const map = L.map("map");

const mapDiv = document.getElementById("map");

const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
}).addTo(map);

map.on("load", () => {
  const location = JSON.parse(localStorage.getItem("location"));
  const zoom = JSON.parse(localStorage.getItem("zoom"));
  map.panTo(location);
  map.setZoom(zoom);
});

var callBack = function () {
  console.log("Map successfully loaded");
  document.getElementById("show-boundaries").checked = true;

  setTimeout(function () {
    loadBoundaries();
  }, 500);
};

map.whenReady(callBack);

map.setView([51.505, -0.09], 13);

// Define a boundary for the map to restrict panning
var ukBounds = L.latLngBounds(
  L.latLng(58.635, -13.687), // Northeast corner of the UK
  L.latLng(49.866, 2.684) // Southwest corner of the UK
);

map.setMaxBounds(ukBounds); // Restrict panning to the UK boundaries
map.on("drag", (e) => {
  map.panInsideBounds(ukBounds, { animate: false });
});

map.on("moveend", (e) => {
  localStorage.setItem("location", JSON.stringify(map.getCenter()));
});
map.on("zoomend", (e) => {
  localStorage.setItem("zoom", JSON.stringify(map.getZoom()));
});
