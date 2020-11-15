 // Creates a bound set of points with a specific density
 function createPoints(width, height, p, n) {
    // width and height are the dimensions of the bounding rectangle
    // p is the percentage of this rectangle's area covered by polygon
    // n is the desired number of points within the polygon
  
    var area = width * height * p; // area of the polygon
    
    // radius needed to get roughly the correct dot density in the polygon
    var radius = Math.sqrt(area / (1.62*n));
    // (took some playing around to get this ratio, probably could work out 
    //  the math to get a closer approximation but it wouldn't be noticable
    //  visually)
    
    // repeatedly sample until you fill the bounding box
    var sample = poissonDiscSampler(width, height, radius);
    for (var data = [], d; d = sample();) { data.push(d); }
    
    return data;
  }

  // From https://bl.ocks.org/mbostock/19168c663618b7f07158
  // Based on https://www.jasondavies.com/poisson-disc/
  function poissonDiscSampler(width, height, radius) {
    var k = 30, // maximum number of samples before rejection
        radius2 = radius * radius,
        R = 3 * radius2,
        cellSize = radius * Math.SQRT1_2,
        gridWidth = Math.ceil(width / cellSize),
        gridHeight = Math.ceil(height / cellSize),
        grid = new Array(gridWidth * gridHeight),
        queue = [],
        queueSize = 0,
        sampleSize = 0;

    return function() {
      if (!sampleSize) return sample(Math.random() * width, Math.random() * height);

      // Pick a random existing sample and remove it from the queue.
      while (queueSize) {
        var i = Math.random() * queueSize | 0,
            s = queue[i];

        // Make a new candidate between [radius, 2 * radius] from the existing sample.
        for (var j = 0; j < k; ++j) {
          var a = 2 * Math.PI * Math.random(),
              r = Math.sqrt(Math.random() * R + radius2),
              x = s[0] + r * Math.cos(a),
              y = s[1] + r * Math.sin(a);

          // Reject candidates that are outside the allowed extent,
          // or closer than 2 * radius to any existing sample.
          if (0 <= x && x < width && 0 <= y && y < height && far(x, y)) return sample(x, y);
        }

        queue[i] = queue[--queueSize];
        queue.length = queueSize;
      }
    };

    function far(x, y) {
      var i = x / cellSize | 0,
          j = y / cellSize | 0,
          i0 = Math.max(i - 2, 0),
          j0 = Math.max(j - 2, 0),
          i1 = Math.min(i + 3, gridWidth),
          j1 = Math.min(j + 3, gridHeight);

      for (j = j0; j < j1; ++j) {
        var o = j * gridWidth;
        for (i = i0; i < i1; ++i) {
          if (s = grid[o + i]) {
            var s,
                dx = s[0] - x,
                dy = s[1] - y;
            if (dx * dx + dy * dy < radius2) return false;
          }
        }
      }

      return true;
    }

    function sample(x, y) {
      var s = [x, y];
      queue.push(s);
      grid[gridWidth * (y / cellSize | 0) + (x / cellSize | 0)] = s;
      ++sampleSize;
      ++queueSize;
      return s;
    }
  }

  function drawPoints(points, color, context, x, y)
  {
        points.forEach(function(d) {
        context.beginPath();
              
        context.fillStyle = color;          
            context.fillRect(x + d[0], y + d[1], 1, 1); 
        });
            
        context.restore();  // removes the clip path
  }

  export{createPoints,poissonDiscSampler,drawPoints};