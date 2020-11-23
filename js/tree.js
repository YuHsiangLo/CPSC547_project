class RadialDendrogram {

    constructor(_config) {
        this.config = {
            parentElement: _config.parentElement,
            height: _config.height || 1000,
            width: _config.width || 1000,
            margin: {top:10, botton: 10, right: 10, left: 10}
        };

        this.config.radius = this.config.width / 2;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.width)
            .attr('height', vis.config.height);

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.radius}, ${vis.config.radius})`);

        vis.tree = d3.cluster().size([2 * Math.PI, vis.config.radius - 100]);


    }

    update() {
        let vis = this;
        vis.render();
    }

    render() {
        let vis = this;

        const root = vis.tree(d3.hierarchy(vis.data)
            .sort((a, b) => d3.ascending(a.data.name, b.data.name)));

        vis.chart.append('g')
            .attr('fill', 'none')
            .attr('stroke', '#555')
            .attr('stroke-opacity', 0.4)
            .attr('stroke-width', 1.5)
            .selectAll("path")
            .data(root.links())
            .join("path")
            .attr("d", d3.linkRadial()
                .angle(d => d.x)
                .radius(d => d.y));

        vis.chart.append("g")
            .selectAll("circle")
            .data(root.descendants())
            .join("circle")
            .attr("transform", d => `
                rotate(${d.x * 180 / Math.PI - 90})
                translate(${d.y},0)`)
            .attr("fill", d => d.children ? "#555" : "#999")
            .attr("r", 2.5);

        vis.chart.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .selectAll("text")
            .data(root.descendants())
            .join("text")
            .attr("transform", d => `
        rotate(${d.x * 180 / Math.PI - 90}) 
        translate(${d.y},0) 
        rotate(${d.x >= Math.PI ? 180 : 0})
      `)
            .attr("dy", "0.31em")
            .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
            .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
            .text(d => d.data.name)
            .clone(true).lower()
            .attr("stroke", "white");

    }
}