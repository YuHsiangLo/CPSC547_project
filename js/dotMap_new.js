import {createPoints,poissonDiscSampler,drawPoints} from './utilsdotMap.js';

export class DotMap {

    constructor(_config, data) {
        this.config = {
            parentElement: _config.parentElement,
            height: _config.height || 500,
            width: _config.width || 500,
            margin: {top:10, bottom: 10, right: 10, left: 10}
        };

        this.row = data[0];
        this.data = data[1];
        this.geo = data[2];

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.chart = d3.select(vis.config.parentElement)
            .attr('width', vis.config.width)
            .attr('height', vis.config.height)
            .node()
            .getContext('2d');

        vis.projection = d3.geoMercator()
            .fitSize([vis.config.width, vis.config.height], vis.geo);

        console.log(vis.projection)

        vis.pathGenerator = d3.geoPath()
            .projection(vis.projection)
            .context(vis.chart);

        let langData, features;
        vis.features = topojson.feature(vis.data, vis.data.objects.geos).features;

        vis.features.forEach(function(feature) {

            feature.properties.area = vis.pathGenerator.area(feature);
            feature.properties.bounds = vis.pathGenerator.bounds(feature);

            langData = vis.row.filter(ob => {
                return ob.GeoUID == feature.properties.id;
            })

            feature.properties.officialLang = +langData[0].OfficialLanguage;
            feature.properties.aboriginalLang = +langData[0].AboriginalLanguages;
            feature.properties.nonAboriginalLang = +langData[0].NonAboriginalLanguages;
        });

        console.log(vis.features)
    }

    update() {
        let vis = this;
        vis.render();
    }

    render() {
        let vis = this;

        vis.features
            .forEach(function(feature) {
                vis.chart.save();
                vis.chart.scale(2, 2);
                vis.chart.translate(-300, -250);
                vis.chart.beginPath();
                vis.pathGenerator(feature);
                vis.chart.clip();  // set clip path to the feature's polygon

                var bounds = feature.properties.bounds,
                    x = bounds[0][0],
                    y = bounds[0][1],
                    width = bounds[1][0] - x,
                    height = bounds[1][1] - y;

                // officialLanguage
                /*var area = feature.properties.a;
                var points = createPoints(width, height, area, feature.properties.officialLang/10);
                drawPoints(points, 'red', context, x, y);

                points = createPoints(width, height, area, feature.properties.nonAboriginalLang/10);
                drawPoints(points, 'black', context, x, y);

                points = createPoints(width, height, area, feature.properties.aboriginalLang/10);
                drawPoints(points, 'yellow', context, x, y);*/
                var p = feature.properties.area / (width * height);

                // desired number of pixels to draw in polygon (only approximates)
                var n = feature.properties.pop / 10;


                if(!isNaN(feature.properties.officialLang))
                {
                    var points = createPoints(width, height, p, feature.properties.officialLang/10);
                    points.forEach(function(d) {
                        vis.chart.beginPath();

                        vis.chart.fillStyle = "#66c2a5";

                        vis.chart.fillRect(x + d[0], y + d[1], 1, 1);
                    });

                }

                if(!isNaN(feature.properties.nonAboriginalLang))
                {
                    var points = createPoints(width, height, p, feature.properties.nonAboriginalLang/10);
                    points.forEach(function(d) {
                        vis.chart.beginPath();

                        vis.chart.fillStyle = "rgba(255, 255, 179, 0.5)";

                        vis.chart.fillRect(x + d[0], y + d[1], 1, 1);
                    });
                }

                if(!isNaN(feature.properties.aboriginalLang))
                {
                    var points = createPoints(width, height, p, feature.properties.aboriginalLang/10);
                    points.forEach(function(d) {
                        vis.chart.beginPath();

                        vis.chart.fillStyle = "red";

                        vis.chart.fillRect(x + d[0], y + d[1], 1, 1);
                    });
                }



                vis.chart.restore();  // removes the clip path
            });
    }
}

