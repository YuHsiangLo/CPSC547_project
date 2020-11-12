var width = window.innerWidth - (window.innerWidth/3),
    height = window.innerHeight;

var loadingText = d3.select("body").append("div")
    .text("Loading...");


var svg = d3.select("body").append("svg") 
    .attr("width", width)
    .attr("height", height)
    .style("background-color", '#edfaf9');

var pi = Math.PI,
tau = 2 * pi;

var projection = d3.geoMercator()
    .scale((1 << 18) / tau)
    .translate([width/3, height/2])
    .center([-123.17, 49.26]);

var path = d3.geoPath()
    .projection(projection)
    d3.json('data/geos.json')
    .then(data => {
        var regions = topojson.feature(data, data.objects.geos).features;
        //console.log(regions);
        //console.log(data);

        svg.selectAll(".geometry")
            .data(regions)
            .enter()
            .append('path')
            .attr("class", "DA")
            .attr('d', path);
    });


d3.json('data/geosCSD.json')
    .then(data => {
        var municipalities = topojson.feature(data, data.objects.geosCSD).features;
        //console.log(regions);
        console.log(municipalities);

        svg.selectAll(".geometry")
            .data(municipalities)
            .enter()
            .append('path')
            .attr("class", "Municipalities")
            .attr('d', path);
        /*var regions = topojson.feature(data, data.objects.geos);
        svg.append('path')
            .datum(regions)
            .attr('d', path);*/
    });



loadingText.remove();

