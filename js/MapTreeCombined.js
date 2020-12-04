class MapTreeCombined {

    constructor(_config, DAData, cityData, treeData) {
        this.config = {
            mapParentElement: _config.mapParentElement,
            treeParentElement: _config.treeParentElement,

            mapHeight: _config.mapHeight || 500,
            mapWidth: _config.mapWidth || 500,
            treeHeight: _config.treeHeight || 500,
            treeWidth: _config.treeWidth || 1500,

            mapMargin: {top:10, bottom: 10, right: 10, left: 10},
            treeMargin: {top:10, bottom: 10, right: 10, left: 125},

            mapLegendWidth: 250,
            mapLegendHeight: 26,
        };

        this.config.dx = 25;
        this.config.dy = this.config.treeWidth / 6;

        this.DAData = DAData;
        this.cityData = cityData;

        this.root = d3.hierarchy(treeData);
        this.root.x0 = this.config.dy / 2;
        this.root.y0 = 0;
        this.root.descendants().forEach((d, i) => {
            d.id = i;
            d._children = d.children;
            //if (d.depth && d.depth > 1) d.children = null;
        });

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.mapSVG = d3.select(vis.config.mapParentElement)
            .attr('width', vis.config.mapWidth)
            .attr('height', vis.config.mapHeight)
            .on('click', reset);

        vis.mapChart = vis.mapSVG.append('g')
        //.attr('transform', `translate(-500, -500) scale(2)`);
        //.attr('transform', `translate(${
        //    vis.config.margin.left
        //}, ${
        //    vis.config.margin.top
        //})`);

        vis.treeChart = d3.select(vis.config.treeParentElement) //vis.svg.append('g')
            //.attr('width', vis.config.width)
            //.attr('height', vis.config.height)
            .attr("viewBox", [-vis.config.treeMargin.left, -vis.config.treeMargin.top, vis.config.treeWidth, vis.config.dx])
            //.style("font", "10px sans-serif")
            .style("user-select", "none");
        //.attr('transform', `translate(${vis.config.left}, ${vis.config.top})`);

        vis.tree = d3.tree().nodeSize([vis.config.dx, vis.config.dy])
        vis.diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x)

        //accessor
        vis.ldiAccessor = d => +d.properties['LDI']

        vis.projection = d3.geoMercator()
            .fitSize([vis.config.mapWidth, vis.config.mapHeight], vis.DAData);

        vis.pathGenerator = d3.geoPath(vis.projection);

        // scale
        vis.colorScale = d3.scaleSequential()
            .domain(d3.extent(vis.DAData.features, vis.ldiAccessor))
            .interpolator(d3.interpolateBlues);

        function zoomed({transform}) {
            vis.mapChart
                .attr('transform', transform)
                .attr('stroke-width', 1/transform.k);
        }

        vis.zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on('zoom', zoomed)

        function reset() {
            vis.mapSVG.transition().duration(750)
                .call(
                    vis.zoom.transform,
                    d3.zoomIdentity.translate(-660, -450).scale(2)
                );
        }

        vis.clicked = function(event, d) {
            vis.root.each(node => {
                if (!node.children) {
                    node.numSpeakers = +d.properties[node.data.name];
                }
            })
            vis.root.eachAfter(node => {
                if (node.children) {
                    let num = 0;
                    node.children.forEach(child => {
                        num += child.numSpeakers;
                    })

                    node.numSpeakers = num;
                }
            })

            const [[x0, y0], [x1, y1]] = vis.pathGenerator.bounds(d);
            event.stopPropagation();
            //states.transition().style("fill", null);
            //d3.select(this).transition().style("fill", "red");
            vis.mapSVG.transition().duration(750).call(
                vis.zoom.transform,
                d3.zoomIdentity
                    .translate(vis.config.mapWidth / 2, vis.config.mapHeight / 2)
                    .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / vis.config.mapWidth, (y1 - y0) / vis.config.mapHeight)))
                    .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                d3.pointer(event, vis.mapSVG.node())
            );

            vis.update(vis.root);
        }

    }

    update() {
        let vis = this;
        vis.render();
    }

    render() {
        let vis = this;

        vis.DAs = vis.mapChart.append('g')
            .attr('cursor', 'pointer')
            .selectAll('.da')
            .data(vis.DAData.features)
            .join('path').attr('class', 'da')
            .attr('d', vis.pathGenerator)
            .attr('fill', d => vis.colorScale(vis.ldiAccessor(d)))
            //.attr("stroke", "white")
            .attr("stroke-linejoin", "round")
            .on('click', vis.clicked)

        vis.cities = vis.mapChart.append('g')
            .attr('cursor', 'pointer')
            .selectAll('.neighbor')
            .data(vis.cityData.features)
            .join('path').attr('class', 'neighbor')
            .attr('d', vis.pathGenerator)
            .attr("stroke-linejoin", "round")
            .on('click', vis.clicked);

        const legendGroup = vis.mapChart.append("g")
            .attr("transform", `translate(${
                vis.config.mapWidth - vis.config.mapLegendWidth - 500
            },${
                vis.config.mapHeight - 200
            })`)

        const defs = vis.mapSVG.append("defs")

        const numberOfGradientStops = 10
        const stops = d3.range(numberOfGradientStops).map(i => (
            i / (numberOfGradientStops - 1)
        ))
        const legendGradientId = "legend-gradient"
        const gradient = defs.append("linearGradient")
            .attr("id", legendGradientId)
            .selectAll("stop")
            .data(stops)
            .enter().append("stop")
            .attr("stop-color", d => d3.interpolateRainbow(-d))
            .attr("offset", d => `${d * 100}%`)

        //const legendGradient = legendGroup.append("rect")
        //    .attr("height", vis.config.mapLegendHeight)
        //    .attr("width", vis.config.mapLegendWidth)
        //    .style("fill", `url(#${legendGradientId})`)

        // const tickValues = [
        //     d3.timeParse("%m/%d/%Y")(`4/1/${colorScaleYear}`),
        //     d3.timeParse("%m/%d/%Y")(`7/1/${colorScaleYear}`),
        //     d3.timeParse("%m/%d/%Y")(`10/1/${colorScaleYear}`),
        // ]
        // const legendTickScale = d3.scaleLinear()
        //     .domain(colorScale.domain())
        //     .range([0, dimensions.legendWidth])
        //
        // const legendValues = legendGroup.selectAll(".legend-value")
        //     .data(tickValues)
        //     .enter().append("text")
        //     .attr("class", "legend-value")
        //     .attr("x", legendTickScale)
        //     .attr("y", -6)
        //     .text(d3.timeFormat("%b"))
        //
        // const legendValueTicks = legendGroup.selectAll(".legend-tick")
        //     .data(tickValues)
        //     .enter().append("line")
        //     .attr("class", "legend-tick")
        //     .attr("x1", legendTickScale)
        //     .attr("x2", legendTickScale)
        //     .attr("y1", 6)


        //const zoom = d3.zoom()
        //    .scaleExtent([1, 8])
        //    .on('zoom', zoomed)

        //https://stackoverflow.com/questions/16178366/d3-js-set-initial-zoom-level
        vis.mapSVG.call(vis.zoom)
            .call(vis.zoom.transform, d3.zoomIdentity.translate(-660, -450).scale(2));

        //function zoomed({transform}) {
        //    vis.chart
        //        .attr('transform', transform)
        //}

        // tree
        const gLink = vis.treeChart.append("g")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", 1.5);

        const gNode = vis.treeChart.append("g")
            .attr("cursor", "pointer")
            .attr("pointer-events", "all");

        vis.update = function (source) {
            const duration = d3.event && d3.event.altKey ? 2500 : 250;
            console.log(vis.root)
            const nodes = vis.root.descendants().reverse();
            const links = vis.root.links();
            console.log(links)

            // Compute the new tree layout.
            vis.tree = d3.tree().nodeSize([vis.config.dx, vis.config.dy])
                .separation((a, b) => {
                    if (a.numSpeakers && b.numSpeakers) {
                        return (Math.log(a.numSpeakers) + Math.log(b.numSpeakers)) / 10
                    } else {
                        return 1;
                    }
                })
            vis.tree(vis.root);

            let left = vis.root;
            let right = vis.root;
            vis.root.eachBefore(node => {
                if (node.x < left.x) left = node;
                if (node.x > right.x) right = node;
            });

            const height = right.x - left.x + vis.config.treeMargin.top + vis.config.treeMargin.bottom;

            const transition = vis.treeChart.transition()
                .duration(duration)
                .attr("viewBox", [-vis.config.treeMargin.left, left.x - vis.config.treeMargin.top, vis.config.treeWidth, height])
                .tween("resize", window.ResizeObserver ? null : () => () => vis.treeChart.dispatch("toggle"));

            // Update the nodes…
            const node = gNode.selectAll("g")
                .data(nodes, d => d.id);

            // Enter any new nodes at the parent's previous position.
            const nodeEnter = node.enter().append("g")
                .attr("transform", d => `translate(${source.y0}, ${source.x0})`)
                .attr("fill-opacity", 0)
                .attr("stroke-opacity", 0)
                .on("click", (event, d) => {
                    d.children = d.children ? null : d._children;
                    vis.update(d);
                });

            nodeEnter.append("circle")
                .attr("r", d => Math.log(d.numSpeakers/1000))
                .attr("fill", d => d._children ? "#555" : "#999")
                .attr("stroke-width", 10);

            nodeEnter.append("text")
                .attr("dy", "0.31em")
                .attr("x", d => d._children ? -6 : 6)
                .attr("text-anchor", d => d._children ? "end" : "start")
                .text(d => d.data.name)
                .clone(true).lower()
                .attr("stroke-linejoin", "round")
                .attr("stroke-width", 3)
                .attr("stroke", "white");

            // Transition nodes to their new position.
            const nodeUpdate = node.merge(nodeEnter).transition(transition)
                .attr("transform", d => `translate(${d.y},${d.x})`)
                .attr("fill-opacity", 1)
                .attr("stroke-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            const nodeExit = node.exit().transition(transition).remove()
                .attr("transform", d => `translate(${source.y},${source.x})`)
                .attr("fill-opacity", 0)
                .attr("stroke-opacity", 0);

            // Update the links…
            const link = gLink.selectAll("path")
                .data(links, d => d.target.id);

            // Enter any new links at the parent's previous position.
            const linkEnter = link.enter().append("path")
                .attr("stroke-width", d => Math.log(d.target.numSpeakers/1000))
                .attr("d", d => {
                    const o = {x: source.x0, y: source.y0};
                    return vis.diagonal({source: o, target: o});
                });

            // Transition links to their new position.
            link.merge(linkEnter).transition(transition)
                .attr("d", vis.diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition(transition).remove()
                .attr("d", d => {
                    const o = {x: source.x, y: source.y};
                    return vis.diagonal({source: o, target: o});
                });

            // Stash the old positions for transition.
            vis.root.eachBefore(d => {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        vis.update(vis.root);
    }
}
