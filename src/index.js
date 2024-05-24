mapboxgl.accessToken = 'pk.eyJ1IjoicmFwaDU5IiwiYSI6ImNsYWY3bHRxcTA4dTEzeG83ZjB2bzkwYmUifQ.Ye2p9OAgykrdKe0fLWSN7A';
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/light-v10',
  center: [4.834277, 45.763420], // starting position
  zoom: 5, // starting zoom
  attributionControl: true,
  customAttribution: ['<b><a href="https://github.com/raphaelchalicarne/chronobuses">GitHub</a></b>'],
});

// automatically resize map to always match the window's size
const el = document.getElementById('map')
const resize = () => {
  const w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
  const h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
  el.style.width = w + 'px'
  el.style.height = h + 'px'
  map.resize()
}
resize()
window.addEventListener('resize', resize)