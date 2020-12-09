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

l = d['geometry'].tolist()
print(l[0].bounds)

# To generate the random points
new_col = []
for v in l:
    res = generate_random(5,v)     #generate_random(n,v)
    new_col.append([(i.x,i.y) for i in res])

# csv has the lang vectors we need and list1 will have the random co-ordinates generated
d.loc[:,'v_CA16_1364': 'v_CA16_1937'].to_csv("tmp1.csv")
f = open("list1.txt", "w")
for x in new_col:
    f.write(str(x))
    f.write("\n")
    
f.close()