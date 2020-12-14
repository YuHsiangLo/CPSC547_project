import geopandas as gpd
import shapely
import random
from shapely.geometry import Point

d = gpd.read_file('census_data.geojson')

def generate_random(number, polygon):
    points = []
    minx, miny, maxx, maxy = polygon.bounds
    while len(points) < number:
        pnt = Point(random.uniform(minx, maxx), random.uniform(miny, maxy))
        if polygon.contains(pnt):
            points.append(pnt)
    return points

header = list(d.loc[:,'v_CA16_1364': 'v_CA16_1937'].columns)

f = open('res.txt', 'w')
f.write("[")
f.write("\n")
for ind , row in d.loc[:,'v_CA16_1364': 'geometry'].iterrows():
    #Index Language gt > 0
    valid_index = [i for i, x in enumerate(list(row)[:-1]) if x>0]
    for x in valid_index:
        res = generate_random(row[header[x]] ,row['geometry'])
        for point in res:
            #print(header[x],point.x,point.y)
            f.write(f'[{point.x},{point.y},"{header[x]}"],')
            f.write("\n")
    #if ind > 2:
    #    break
f.write("]")         
f.close()   

