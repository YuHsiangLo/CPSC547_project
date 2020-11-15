generateDensity = (feature, ethnicity_column, year, context) => {
  if (feature === undefined || feature === null) return;

  const { properties } = feature;
  const bounds = geopath.bounds(feature);
  const populationData = Math.round(
    properties[`${ethnicity_column}${censusYearMap[year]}`] / peoplePerPoint
  );

  if (!populationData) return;

  // https://github.com/d3/d3-geo#path_bounds
  const x_min = bounds[0][0];
  const x_max = bounds[1][0];
  const y_min = bounds[0][1];
  const y_max = bounds[1][1];

  let hits = 0;
  let count = 0;

  const limit = populationData * 10; // limit test to 10x the population.

  let points = [];
  while (hits < populationData - 1 && count < limit) {
    const lat = y_min + Math.random() * (y_max - y_min);
    const lng = x_min + Math.random() * (x_max - x_min);

    const randomPoint = turf.point([lng, lat], {
      color: colorScheme[ethnicity_column]
    });

    if (turf.booleanPointInPolygon(randomPoint, feature)) {
      points.push(randomPoint);
      hits++;
    }

    count++;
  }

  return turf.featureCollection(points);
}