import {width, height, svg} from './mapCanvas.js';

class mapBorder{

    constructor(){
        var pi = Math.PI,
        tau = 2 * pi;

        var projection = d3.geoMercator()
            .scale((1 << 18) / tau)
            .translate([width/4, height/2])
            .center([-123.17, 49.26]);

        var path = d3.geoPath()
            .projection(projection)

        d3.json('data/geosCSD.json')
        .then(data => {
            var municipalities = topojson.feature(data, data.objects.geosCSD).features;

            svg.selectAll(".geometry")
                .data(municipalities)
                .enter()
                .append('path')
                .attr("class", "Municipalities")
                .attr('d', path);
        
        });
    }
}

export {mapBorder};