class Choropleth {

    constructor(_config, data, data_neighborhood, tree) {
        this.config = {
            parentElement: _config.parentElement,
            height: _config.height || 500,
            width: _config.width || 500,
            margin: {top:10, botton: 10, right: 10, left: 10}
        };

        this.data = data;
        this.neighbor = data_neighborhood;
        this.tree = d3.hierarchy(tree);

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.width)
            .attr('height', vis.config.height)
            .on('click', reset);

        vis.chart = vis.svg.append('g')
            //.attr('transform', `translate(-500, -500) scale(2)`);
            //.attr('transform', `translate(${
            //    vis.config.margin.left
            //}, ${
            //    vis.config.margin.top
            //})`);

        //accessor
        vis.ldiAccessor = d => +d.properties['LDI']

        vis.projection = d3.geoMercator()
            .fitSize([vis.config.width, vis.config.height], vis.data);

        vis.pathGenerator = d3.geoPath(vis.projection);

        // scale
        vis.colorScale = d3.scaleSequential()
            .domain(d3.extent(vis.data.features, vis.ldiAccessor))
            .interpolator(d3.interpolateBlues);

        function zoomed({transform}) {
            vis.chart
                .attr('transform', transform)
                .attr('stroke-width', 1/transform.k);
        }

        vis.zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on('zoom', zoomed)

        function reset() {
            vis.svg.transition().duration(750).call(
                vis.zoom.transform,
                d3.zoomIdentity.translate(-660, -450).scale(2)
            );
        }

        vis.clicked = function(event, d) {
            vis.tree.each(node => {
                if (!node.children) {
                    console.log(node.data.name)
                    node.numSpeakers = +d.properties[node.data.name];
                }
            })
            vis.tree.eachAfter(node => {
                if (node.children) {
                    let num = 0;
                    node.children.forEach(child => {
                        num += child.numSpeakers;
                    })

                    node.numSpeakers = num;
                }
            })
            console.log(vis.tree)

            const [[x0, y0], [x1, y1]] = vis.pathGenerator.bounds(d);
            event.stopPropagation();
            //states.transition().style("fill", null);
            //d3.select(this).transition().style("fill", "red");
            vis.svg.transition().duration(750).call(
                vis.zoom.transform,
                d3.zoomIdentity
                    .translate(vis.config.width / 2, vis.config.height / 2)
                    .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / vis.config.width, (y1 - y0) / vis.config.height)))
                    .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                d3.pointer(event, vis.svg.node())
            );
        }

    }

    update() {
        let vis = this;
        vis.render();
    }

    render() {
        let vis = this;

        vis.DAs = vis.chart.append('g')
                .attr('cursor', 'pointer')
            .selectAll('.da')
            .data(vis.data.features)
            .join('path').attr('class', 'da')
                .attr('d', vis.pathGenerator)
                .attr('fill', d => vis.colorScale(vis.ldiAccessor(d)))
                //.attr("stroke", "white")
                .attr("stroke-linejoin", "round")
            .on('click', vis.clicked)

        vis.neighbors = vis.chart.append('g')
            .attr('cursor', 'pointer')
            .selectAll('.neighbor')
            .data(vis.neighbor.features)
            .join('path').attr('class', 'neighbor')
            .attr('d', vis.pathGenerator)
            .attr("stroke-linejoin", "round")
            .on('click', vis.clicked)


        //const zoom = d3.zoom()
        //    .scaleExtent([1, 8])
        //    .on('zoom', zoomed)

        //https://stackoverflow.com/questions/16178366/d3-js-set-initial-zoom-level
        vis.svg.call(vis.zoom)
            .call(vis.zoom.transform, d3.zoomIdentity.translate(-660, -450).scale(2));

        //function zoomed({transform}) {
        //    vis.chart
        //        .attr('transform', transform)
        //}

    }
}
