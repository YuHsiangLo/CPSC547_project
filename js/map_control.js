
//const data = await d3.json('data/van_ldi.geojson')

// Initialize chart
let choropleth;

// Load data
d3.json('data/van_ldi.geojson').then(data => {
    choropleth = new Choropleth({ parentElement: '#map' }, data);
    choropleth.update();
});