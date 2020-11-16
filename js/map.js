class Choropleth {

    constructor(_config, data) {
        this.config = {
            parentElement: _config.parentElement,
            height: _config.height || 1000,
            width: _config.width || 1000,
            margin: {top:10, botton: 10, right: 10, left: 10}
        };

        this.data = data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.width)
            .attr('height', vis.config.height);

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${
                vis.config.margin.left
            }, ${
                vis.config.margin.top
            })`);

        //accessor
        vis.ldiAccessor = d => +d.properties['ldi']

        vis.projection = d3.geoMercator()
            .fitSize([vis.config.width, vis.config.height], vis.data);
        vis.pathGenerator = d3.geoPath(vis.projection);

        // scale
        vis.colorScale = d3.scaleSequential()
            .domain(d3.extent(vis.data.features, vis.ldiAccessor))
            .interpolator(d3.interpolateBlues);

    }

    update() {
        let vis = this;
        vis.render();
    }

    render() {
        let vis = this;

        const DAs = vis.chart.selectAll('.DA')
            .data(vis.data.features)
            .enter().append('path')
            .attr('class', 'DA')
            .attr('d', vis.pathGenerator)
            .attr('fill', d => vis.colorScale(vis.ldiAccessor(d)))

    }
}
