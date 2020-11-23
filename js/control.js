// Initialize chart
let radialDendrogram = new RadialDendrogram({ parentElement: '#radial' });
//let collapsibleTree = new CollapsibleTree({ parentElement: '#radial' });


// Load data
d3.json('data/lang_fam.json').then(data => {
    radialDendrogram.data = data;
    radialDendrogram.update();

    //collapsibleTree.data = data;
    //collapsibleTree.update();
});

let choropleth;

// Load data
Promise.all([
    d3.json('data/Vancouver_LDI.geojson'),
    d3.json('data/Vancouver_LDI_agg.geojson'),
    d3.json('data/lang_fam.json')
]).then(files => {
    choropleth = new Choropleth({ parentElement: '#map', width: window.outerWidth, height: window.outerHeight - 56}, files[0], files[1], files[2]);
    choropleth.update();
});