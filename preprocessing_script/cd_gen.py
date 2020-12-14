import operator

f = open('tmp1.csv')
l = f.readlines()
f.close()
header = l[0].strip().split(",")[:]

f1 = open('list1.txt')
r1 = f1.readlines()
f1.close()

for ind,line in enumerate(l[1:]):
    dt = line.strip().split(",")
    geos = r1[ind].strip()[1:-1].split("|")
    cords = [x.strip()[1:-1].split(",") for x in geos]
    #lang_ind = [ind for ind, x in enumerate(dt[2:]) if int(x.strip()) > 0]
    lang_ind = []
    try:
        for ind,x in enumerate(dt[:]):
            if x.strip() and int(x.strip()) > 0:
                lang_ind.append(ind)
    except:
        print(ind,x,lat, longi)
        raise 
    for x in lang_ind:
        for lat,longi in cords:
            print([lat, longi, header[x]])


