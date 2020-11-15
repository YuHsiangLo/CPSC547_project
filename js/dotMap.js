import {mapBorder} from './mapBorder.js';
import {context} from './mapCanvas.js';
import {projection,path} from './mapProjection.js';
import {createPoints,poissonDiscSampler,drawPoints} from './utilsdotMap.js';

//loading message
var loadingText = d3.select("body").append("div")
.text("Loading...");

//draw mapBorder
//new mapBorder();


//-------------------------------------------------------------------------------
d3.csv('data/fdata.csv')
    .then(row => {
        
        var langData, features;
        d3.json('data/geos.json')
            .then(data => {
                features = topojson.feature(data, data.objects.geos).features;
                
                features
                    .forEach(function(feature) {
                        
                        feature.properties.area = path.area(feature);
                        feature.properties.bounds = path.bounds(feature);

                        langData = row.filter(ob => {
                            return ob.GeoUID == feature.properties.id;
                        })
                        
                        feature.properties.officialLang = +langData[0].OfficialLanguage;
                        feature.properties.aboriginalLang = +langData[0].AboriginalLanguages;
                        feature.properties.nonAboriginalLang = +langData[0].NonAboriginalLanguages;     
                });
                
                
                features
                    .forEach(function(feature) {
                        context.save();
                        context.beginPath();
                        path(feature);
                        context.clip();  // set clip path to the feature's polygon
                                
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
                context.beginPath();
                
                context.fillStyle = "#66c2a5";
          
                context.fillRect(x + d[0], y + d[1], 1, 1); 
                });

            }

            if(!isNaN(feature.properties.nonAboriginalLang))
            {
                var points = createPoints(width, height, p, feature.properties.nonAboriginalLang/10);
                points.forEach(function(d) {
                context.beginPath();
                
                context.fillStyle = "rgba(255, 255, 179, 0.5)";
          
                context.fillRect(x + d[0], y + d[1], 1, 1); 
                });
            }

            if(!isNaN(feature.properties.aboriginalLang))
            {
                var points = createPoints(width, height, p, feature.properties.aboriginalLang/10);
                points.forEach(function(d) {
                context.beginPath();
                
                context.fillStyle = "red";
          
                context.fillRect(x + d[0], y + d[1], 1, 1); 
                });
            }
            
            
            
            context.restore();  // removes the clip path
          });
        
        loadingText.remove();
        
    
      });     
});

