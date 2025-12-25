mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: 'map', // container ID

  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: 'mapbox://styles/mapbox/streets-v12', // style URL

  center: listing.geometry.coordinates, // starting position [lng, lat]
  zoom: 9, // starting zoom
});

console.log(coordinates);

// Create a default Marker and add it to the map.
const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat(listing.geometry.coordinates)    // Listing.geometry.coordinates
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h3>${listing.location}</h3>Hellow World!!</p>`
    )
  )
  .addTo(map);  