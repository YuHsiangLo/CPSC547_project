
// Initialize chart
let radialDendrogram = new RadialDendrogram({ parentElement: '#radial' });

// Load data
d3.json('data/lang_fam.json').then(data => {
    radialDendrogram.data = data;
    radialDendrogram.update();
});