var width = window.outerWidth,
    height = window.outerHeight;

var container = d3.select("body")
    .append("div")
    .attr("width", width)
    .attr("height", height);

var canvas = container.append("canvas")
    .attr("width", width)
    .attr("height", height);

var context = canvas.node().getContext("2d");


var svg = container.append("svg") 
    .attr("width", width)
    .attr("height", height)
    .attr("class","mapBorder");


export {width,height,canvas,context, svg};