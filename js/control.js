let combined;

// Load data
Promise.all([
    d3.json('data/Vancouver_LDI.geojson'),
    d3.json('data/Vancouver_LDI_agg.geojson'),
    d3.json('data/lang_fam.json')
]).then(files => {
    combined = new MapTreeCombined(
        {
            mapParentElement: '#choropleth',
            treeParentElement: '#tree',

            mapWidth: window.outerWidth,
            mapHeight: window.outerHeight - 56},
        files[0], files[1], files[2]);
    combined.update();
});