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
        console.log(regions);

        svg.selectAll(".geometry")
            .data(regions)
            .enter()
            .append('path')
            .attr("class", "DA")
            .attr('d', path);
        /*var regions = topojson.feature(data, data.objects.geos);
        svg.append('path')
            .datum(regions)
            .attr('d', path);*/
    });

loadingText.remove();

/*d3.json('data/geos.json', function(error, dc){
    if(error) throw error;

    console.log(data);

    

});*/