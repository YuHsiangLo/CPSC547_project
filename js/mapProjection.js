import {width, height, context} from './mapCanvas.js';

var pi = Math.PI,
tau = 2 * pi;


var projection = d3.geoMercator()
    .scale((1 << 18) / tau)
    .translate([width/6, height/3])
    .center([-123.17, 49.26]);

var path = d3.geoPath()
    .projection(projection)
    .context(context);

export {projection,path};