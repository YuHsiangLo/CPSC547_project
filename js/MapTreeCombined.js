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

            mapLegendWidth: 5,
            mapLegendHeight: 50,
        };

        this.config.dx = 25;
        this.config.dy = this.config.treeWidth / 7.5;

        this.DAData = DAData;
        this.cityData = cityData;

        this.root = d3.hierarchy(treeData);
        this.rootCopy = this.root.copy();
        this.root.x0 = this.config.dy / 2;
        this.root.y0 = 0;
        this.root.descendants().forEach((d, i) => {
            d.id = i;
        });

        this.root.each(node => {
            if (!node.children) {
                node.numSpeakers = d3.sum(this.cityData.features, d => d.properties[node.data.name]);
            }
        });

        this.root.eachAfter(node => {
            if (node.children) {
                node.numSpeakers = d3.sum(node.children, d => d.numSpeakers);
            }
        });

        this.root.each(d => {
            if (d.children) {
                const kept_children = [];
                for (let child of d.children) {
                    if (child.numSpeakers !== 0) {
                        kept_children.push(child);
                    }
                }
                d.children = kept_children;
            }
        });

        this.root.descendants().forEach((d, i) => {
            d._children = d.children;
        });

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.mapSVG = d3.select(vis.config.mapParentElement)
            .attr('width', vis.config.mapWidth)
            .attr('height', vis.config.mapHeight)
            .on('click', reset);

        vis.mapChart = vis.mapSVG.append('g');

        vis.treeChart = d3.select(vis.config.treeParentElement)
            .attr('width', vis.config.treeWidth)
            .attr('height', vis.config.treeHeight)
            .attr('viewBox', [-vis.config.treeMargin.left, -vis.config.treeMargin.top, vis.config.treeWidth, vis.config.dx]);

        vis.tree = d3.tree().nodeSize([vis.config.dx, vis.config.dy]);
        vis.diagonal = d3.linkHorizontal().x(d => d.y).y(d => d.x);

        //accessor
        vis.ldiAccessor = d => +d.properties['LDI'];

        vis.projection = d3.geoMercator()
            .fitSize([vis.config.mapWidth, vis.config.mapHeight], vis.DAData);

        vis.pathGenerator = d3.geoPath(vis.projection);

        //preprocess data
        vis.cityData.features.forEach(d => {
            d.properties.centroid = vis.projection(d3.geoCentroid(d.geometry));
        });

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
            .on('zoom', zoomed);

        function reset() {
            vis.mapSVG.transition().duration(750)
                .call(
                    vis.zoom.transform,
                    d3.zoomIdentity.translate(-550, -450).scale(2)
                );

            vis.root = vis.rootCopy.copy();
            vis.root.x0 = vis.config.dy / 2;
            vis.root.y0 = 0;
            vis.root.descendants().forEach((d, i) => {
                d.id = i;
            });

            vis.root.each(node => {
                if (!node.children) {
                    node.numSpeakers = d3.sum(vis.cityData.features, d => d.properties[node.data.name]);
                }
            });

            vis.root.eachAfter(node => {
                if (node.children) {
                    node.numSpeakers = d3.sum(node.children, d => d.numSpeakers);
                }
            });

            vis.root.each(d => {
                if (d.children) {
                    const kept_children = [];
                    for (let child of d.children) {
                        if (child.numSpeakers !== 0) {
                            kept_children.push(child);
                        }
                    }
                    d.children = kept_children;
                }
            });

            vis.root.descendants().forEach(d => {
                d._children = d.children;
            });

            vis.update_tree(vis.root);
        }

        vis.clicked = function(event, d) {
            vis.root = vis.rootCopy.copy();

            vis.root.x0 = vis.config.dy / 2;
            vis.root.y0 = 0;

            vis.root.descendants().forEach((d, i) => {
                d.id = i;
            });

            vis.root.each(node => {
                if (!node.children) {
                    node.numSpeakers = +d.properties[node.data.name];
                }
            });

            vis.root.eachAfter(node => {
                if (node.children) {
                    node.numSpeakers = d3.sum(node.children, d => d.numSpeakers);
                }
            });

            vis.root.each(d => {
                if (d.children) {
                    const kept_children = [];
                    for (let child of d.children) {
                        if (child.numSpeakers !== 0) {
                            kept_children.push(child);
                        }
                    }
                    d.children = kept_children;
                }
            });

            vis.root.descendants().forEach(d => {
                d._children = d.children;
                if (d.depth && d.depth >= 3) d.children = null;
            });

            const [[x0, y0], [x1, y1]] = vis.pathGenerator.bounds(d);
            event.stopPropagation();
            vis.mapSVG.transition().duration(750).call(
                vis.zoom.transform,
                d3.zoomIdentity
                    .translate(vis.config.mapWidth / 2, vis.config.mapHeight / 2)
                    .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / vis.config.mapWidth, (y1 - y0) / vis.config.mapHeight)))
                    .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
                d3.pointer(event, vis.mapSVG.node())
            );

            vis.update_tree(vis.root);
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
            .attr('stroke-linejoin', 'round')
            .on('click', vis.clicked);

        const cityGroup = vis.mapChart.selectAll('.neighborhood').data(vis.cityData.features);
        const cityGroupEnter = cityGroup.enter().append('g')
            .attr('cursor', 'pointer')
            .on('click', vis.clicked);

        const path = cityGroupEnter.append('path').merge(cityGroup.select('path'))
            .attr('class', 'neighborhood')
            .attr('d', vis.pathGenerator)
            .attr("stroke-linejoin", "round");

        const cityText = cityGroupEnter.append('text').merge(cityGroup.select('text'))
            .attr('text-anchor', 'middle')
            .attr('font-size', '8pt')
            .attr('font-weight', 'bold')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-width', 0.5)
            .attr('stroke', 'white')
            .attr('x', d => d.properties.centroid[0])
            .attr('y', d => d.properties.centroid[1])
            .text(d => d.properties.REGION);

        const legendGroup = vis.mapChart.append('g')
            .attr('transform', `translate(290, 490)`);

        // legend for choropleth
        const defs = vis.mapSVG.append('defs');

        const numberOfGradientStops = 11;
        const stops = d3.range(numberOfGradientStops).map(i => i / (numberOfGradientStops - 1));
        const gradient = defs.append('linearGradient')
            .attr('id', 'legend-gradient')
            .attr('x1', '0%')
            .attr('y1', '100%')
            .attr('x2', '0%')
            .attr('y2', '0%')
            .selectAll('stop')
            .data(stops)
            .enter().append('stop')
            .attr('stop-color', d => vis.colorScale(d))
            .attr('offset', d => `${d * 100}%`);

        const legendGradient = legendGroup.append('rect')
            .attr('height', vis.config.mapLegendHeight)
            .attr('width', vis.config.mapLegendWidth)
            .style('fill', `url(#legend-gradient)`);

        const legendScale = d3.scaleLinear()
            .domain([1, 0])
            .range([0, vis.config.mapLegendHeight]);

        const legendAxisGenerator = d3.axisRight()
            .scale(legendScale)
            .ticks(5);

        legendGroup.append('g')
            .call(legendAxisGenerator)
            .select('.domain').remove();

        legendGroup.append('text')
            .attr('transform', `translate(0, -5)`)
            .attr('font-weight', 'bold')
            .attr('font-size', '5pt')
            .text('Language Diversity Index');

        //https://stackoverflow.com/questions/16178366/d3-js-set-initial-zoom-level
        vis.mapSVG.call(vis.zoom)
            .call(vis.zoom.transform, d3.zoomIdentity.translate(-550, -450).scale(2));

        // tree
        const gLink = vis.treeChart.append('g')
            .attr('fill', 'none')
            .attr('stroke', '#555')
            .attr('stroke-opacity', 0.4)
            .attr('stroke-width', 1.5);

        const gNode = vis.treeChart.append('g')
            .attr('cursor', 'pointer')
            .attr('pointer-events', 'all');

        vis.update_tree = function (source) {
            const duration = d3.event && d3.event.altKey ? 2500 : 250;
            const nodes = vis.root.descendants().reverse();
            const links = vis.root.links();

            // Compute the new tree layout.
            vis.tree = d3.tree().nodeSize([vis.config.dx, vis.config.dy])
                .separation((a, b) => {
                    if (a.numSpeakers && b.numSpeakers) {
                        if (a.numSpeakers >= 50 || b.numSpeakers >= 50) {
                            return (Math.log(a.numSpeakers + b.numSpeakers)) / 7.5;
                        } else {
                            return 1;
                        }
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
                .attr('height', height)
                .attr('viewBox', [-vis.config.treeMargin.left, left.x - vis.config.treeMargin.top, vis.config.treeWidth, height])
                .tween('resize', window.ResizeObserver ? null : () => () => vis.treeChart.dispatch('toggle'));

            // Update the nodes…
            const node = gNode.selectAll('g')
                .data(nodes, d => d.id);

            // Enter any new nodes at the parent's previous position.
            const nodeEnter = node.enter().append('g')
                .attr('transform', d => `translate(${source.y0}, ${source.x0})`)
                .attr('fill-opacity', 0)
                .attr('stroke-opacity', 0)
                .on('click', (event, d) => {
                    d.children = d.children ? null : d._children;
                    vis.update_tree(d);
                });

            nodeEnter.append('title').merge(node.select('title'))
                .text(d => 'Number of speakers: ' + d.numSpeakers);

            nodeEnter.append('circle').merge(node.select('circle'))
                .attr('r', d => d.numSpeakers? Math.log(d.numSpeakers) : 1)
                .attr('fill', d => d._children ? '#555' : '#999')
                .attr('stroke-width', 10);

            nodeEnter.append('text')
                .attr('dy', '0.31em')
                .attr('x', d => d._children ? -6 : 6)
                .attr('text-anchor', d => d._children ? 'end' : 'start')
                .text(d => d.data.name)
                .clone(true).lower()
                .attr('stroke-linejoin', 'round')
                .attr('stroke-width', 3)
                .attr('stroke', 'white');

            // Transition nodes to their new position.
            const nodeUpdate = node.merge(nodeEnter).transition(transition)
                .attr('transform', d => `translate(${d.y},${d.x})`)
                .attr('fill-opacity', 1)
                .attr('stroke-opacity', 1);

            // Transition exiting nodes to the parent's new position.
            const nodeExit = node.exit().transition(transition).remove()
                .attr('transform', d => `translate(${source.y},${source.x})`)
                .attr('fill-opacity', 0)
                .attr('stroke-opacity', 0);

            // Update the links…
            const link = gLink.selectAll('path')
                .data(links, d => d.target.id);

            // Enter any new links at the parent's previous position.
            const linkEnter = link.enter().append('path')
                .attr('stroke-width', d => d.target.numSpeakers? Math.log(d.target.numSpeakers) : 1)
                .attr('d', d => {
                    const o = {x: source.x0, y: source.y0};
                    return vis.diagonal({source: o, target: o});
                });

            // Transition links to their new position.
            link.merge(linkEnter).transition(transition)
                .attr('stroke-width', d => d.target.numSpeakers? Math.log(d.target.numSpeakers) : 1)
                .attr('d', vis.diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition(transition).remove()
                .attr('d', d => {
                    const o = {x: source.x, y: source.y};
                    return vis.diagonal({source: o, target: o});
                });

            // Stash the old positions for transition.
            vis.root.eachBefore(d => {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        }

        vis.update_tree(vis.root);
    }
}
