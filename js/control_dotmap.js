import {DotMap} from './dotMap_new.js';

let dotMap;

// Load data

Promise.all([
    d3.csv('data/fdata.csv'),
    d3.json('data/geos.json'),
    d3.json('data/van_ldi.geojson')
]).then(files => {
    dotMap = new DotMap({ parentElement: '#map_canvas', width: window.outerWidth, height: window.outerHeight - 56}, files);
    dotMap.update();
});

//let radialDendrogram = new RadialDendrogram({ parentElement: '#radial' });
let collapsibleTree = new CollapsibleTree({ parentElement: '#radial' });


// Load data
d3.json('data/lang_fam.json').then(data => {
    //radialDendrogram.data = data;
    //radialDendrogram.update();

    collapsibleTree.data = data;
    collapsibleTree.update();
});