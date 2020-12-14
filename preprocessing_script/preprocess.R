library(cancensus)
library(tidyverse)
library(sf)

# Based on the code from https://www.dshkol.com/2017/language-diversity-in-canada/

dataset <- "CA16"
options(cancensus.cache_path = "/Users/YuHsiangLo/Documents/CPSC547/")
options(cancensus.api_key = "CensusMapper_03e3e62e704e3a0c58244658984c74b8")

# Search for the census vector for aggregated language spoken at home
language_total <- search_census_vectors("language", dataset) %>%
  filter(vector == "v_CA16_1355")

# Select all leaf nodes of this vector. The parameter TRUE returns only the finite leaves among child nodes.
language_children <- language_total %>%
  child_census_vectors(TRUE)

# We'll need the aggregated total for our calculations so let's append them together
language_vectors <- bind_rows(language_total, language_children) %>%
  pull(vector)

regions_list10 <- list_census_regions(dataset) %>%
  filter(level=="CMA") %>%
  top_n(10,pop) %>%
  as_census_region_list

#langs_cma <- get_census(dataset, level = "CMA", regions = regions_list10, vectors = language_vectors, geo_format = NA, labels = "short")

ldi_calc <- function(df) {
  tidy_langs <- df %>%
    rename(`Language Total` = v_CA16_1355) %>%
    mutate(v_CA16_1364 = v_CA16_1364 + v_CA16_2153 + v_CA16_2150 + v_CA16_2159,
           v_CA16_1367 = v_CA16_1367 + v_CA16_2156 + v_CA16_2150 + v_CA16_2159) %>%
    select(-v_CA16_2153, -v_CA16_2150, -v_CA16_2159, -v_CA16_2156) %>%
    tidyr::gather(key = language, value = lang_count, v_CA16_1364:v_CA16_1937) %>%
    mutate(ldi_frac = ifelse(lang_count <= `Language Total`, lang_count/`Language Total`, 1)) %>%
    group_by(GeoUID) %>%
    mutate(ldi = 1 - sum((ldi_frac)^2)) %>%
    ungroup() %>%
    select(-language, -lang_count, -ldi_frac) %>%
    distinct()
  return(tidy_langs)
}

# Select region codes for the 50 largest Census Divisions in Canada by population
csd50_list <- list_census_regions(dataset) %>%
  filter(level=="CSD") %>%
  top_n(50,pop) %>%
  as_census_region_list

# Query data
langs_csd50 <- get_census(dataset, level = "CSD", regions = csd50_list, vectors = language_vectors, geo_format = NA, labels = "short")

# Calculate index
csd50_ldi <- ldi_calc(langs_csd50) %>%
  mutate(`Region Name` = as.factor(gsub(" \\(.*\\)","",`Region Name`)))

csd100_list <- list_census_regions(dataset) %>%
  filter(level=="CSD") %>%
  top_n(100,pop) %>%
  as_census_region_list

# Query data
langs_csd100 <- get_census(dataset, level = "CSD", regions = csd100_list, vectors = language_vectors, geo_format = NA, labels = "short")

# Calculate index
csd100_ldi <- ldi_calc(langs_csd100) %>%
  mutate(`Region Name` = as.factor(gsub(" \\(.*\\)","",`Region Name`)))

regions_list_van <- list_census_regions(dataset) %>%
  filter(level=="CMA", name == "Vancouver") %>%
  as_census_region_list

langs_van <- get_census(dataset, level = "DA",
                        regions = regions_list_van , vectors = language_vectors,
                        geo_format = "sf", labels = "short") %>%
  mutate(REGION = recode(`Region Name`,
                         "Burrard Inlet 3" = "Burrard Inlet",
                         "Greater Vancouver A" = "Greater Vancouver",
                         "Musqueam 2" = "Musqueam",
                         "Katzie 1" = "Katzie",
                         "Katzie 2" = "Katzie",
                         "Coquitlam 2" = "Coquitlam",
                         "Coquitlam 1" = "Coquitlam",
                         "Mission 1" = "Mission",
                         "Seymour Creek 2" = "Seymour Creek",
                         "Musqueam 4" = "Musqueam",
                         "Barnston Island 3" = "Barnston Island",
                         "Whonnock 1" = "Whonnock",
                         "Langley 5" = "Langley",
                         "McMillan Island 6" = "McMillan Island",
                         "Capilano 5" = "Capilano",
                         "Matsqui 4" = "Matsqui")) %>%
  mutate(v_CA16_1364 = v_CA16_1364 + v_CA16_2153 + v_CA16_2150 + v_CA16_2159,
         v_CA16_1367 = v_CA16_1367 + v_CA16_2156 + v_CA16_2150 + v_CA16_2159) %>%
  select(-Type, -Households, -Dwellings, -CSD_UID, -Population, -CT_UID, -CD_UID, -CMA_UID,
         -`Region Name`, -`Area (sq km)`,
         -v_CA16_1355, -v_CA16_2153, -v_CA16_2150, -v_CA16_2159, -v_CA16_2156) %>%
  rename(c("AREA" = "Shape Area",
           "Aboriginal, n.o.s." = "v_CA16_1619",
           "Afrikaans" = "v_CA16_1850",
           "Afro-Asiatic, n.i.e." = "v_CA16_1682",
           "Akan" = "v_CA16_1985",
           "Albanian" = "v_CA16_1772",
           "Algonquian, n.i.e." = "v_CA16_1439",
           "Algonquin" = "v_CA16_1427",
           "American Sign Language" = "v_CA16_2045",
           "Amharic" = "v_CA16_1655",
           "Arabic" = "v_CA16_1658",
           "Armenian" = "v_CA16_1775",
           "Assyrian Neo-Aramaic" = "v_CA16_1661",
           "Athabaskan, n.i.e." = "v_CA16_1505",
           "Atikamekw" = "v_CA16_1385",
           "Austro-Asiatic, n.i.e." = "v_CA16_1694",
           "Austronesian, n.i.e." = "v_CA16_1733",
           "Azerbaijani" = "v_CA16_2114",
           "Babine" = "v_CA16_1448",
           "Bamanankan" = "v_CA16_1988",
           "Beaver" = "v_CA16_1451",
           "Belarusian" = "v_CA16_1793",
           "Bengali" = "v_CA16_1892",
           "Berber, n.i.e." = "v_CA16_1634",
           "Bikol" = "v_CA16_1700",
           "Bilen" = "v_CA16_1640",
           "Blackfoot" = "v_CA16_1379",
           "Bosnian" = "v_CA16_1796",
           "Bulgarian" = "v_CA16_1799",
           "Burmese" = "v_CA16_2087",
           "Cantonese" = "v_CA16_2060",
           "Carrier" = "v_CA16_1454",
           "Catalan" = "v_CA16_1946",
           "Cayuga" = "v_CA16_1526",
           "Cebuano" = "v_CA16_1703",
           "Celtic, n.i.e." = "v_CA16_1844",
           "Chaldean Neo-Aramaic" = "v_CA16_1664",
           "Chilcotin" = "v_CA16_1457",
           "Chinese, n.i.e." = "v_CA16_2081",
           "Chinese, n.o.s." = "v_CA16_2078",
           "Comox" = "v_CA16_1547",
           "Cree, n.o.s." = "v_CA16_1412",
           "Creole, n.i.e." = "v_CA16_1745",
           "Creole, n.o.s." = "v_CA16_1742",
           "Croatian" = "v_CA16_1802",
           "Cushitic, n.i.e." = "v_CA16_1649",
           "Czech" = "v_CA16_1805",
           "Dakota" = "v_CA16_1577",
           "Danish" = "v_CA16_1853",
           "Dene" = "v_CA16_1460",
           "Dinka" = "v_CA16_2036",
           "Dogrib" = "v_CA16_1463",
           "Dravidian, n.i.e." = "v_CA16_1763",
           "Dutch" = "v_CA16_1856",
           "Edo" = "v_CA16_1991",
           "English" = "v_CA16_1364",
           "Estonian" = "v_CA16_2132",
           "Ewe" = "v_CA16_1994",
           "Fijian" = "v_CA16_1706",
           "Finnish" = "v_CA16_2135",
           "French" = "v_CA16_1367",
           "Frisian" = "v_CA16_1859",
           "Fulah" = "v_CA16_1997",
           "Ga" = "v_CA16_2000",
           "Ganda" = "v_CA16_2003",
           "Georgian" = "v_CA16_1970",
           "German" = "v_CA16_1862",
           "Germanic, n.i.e." = "v_CA16_1880",
           "Gitxsan" = "v_CA16_1592",
           "Greek" = "v_CA16_1883",
           "Gujarati" = "v_CA16_1895",
           "Gwich'in" = "v_CA16_1466",
           "Haida" = "v_CA16_1508",
           "Haisla" = "v_CA16_1604",
           "Haitian Creole" = "v_CA16_1739",
           "Hakka" = "v_CA16_2063",
           "Halkomelem" = "v_CA16_1550",
           "Harari" = "v_CA16_1667",
           "Hebrew" = "v_CA16_1670",
           "Heiltsuk" = "v_CA16_1607",
           "Hiligaynon" = "v_CA16_1709",
           "Hindi" = "v_CA16_1898",
           "Hmong-Mien" = "v_CA16_1766",
           "Hungarian" = "v_CA16_2138",
           "Icelandic" = "v_CA16_1865",
           "Igbo" = "v_CA16_2006",
           "Ilocano" = "v_CA16_1712",
           "Indo-Iranian, n.i.e." = "v_CA16_1940",
           "Inuinnaqtun" = "v_CA16_1514",
           "Inuit, n.i.e." = "v_CA16_1520",
           "Inuktitut" = "v_CA16_1517",
           "Iroquoian, n.i.e." = "v_CA16_1535",
           "Italian" = "v_CA16_1949",
           "Romance, n.i.e." = "v_CA16_1961",
           "Japanese" = "v_CA16_1964",
           "Kabyle" = "v_CA16_1631",
           "Kannada" = "v_CA16_1751",
           "Karenic" = "v_CA16_2090",
           "Kashmiri" = "v_CA16_1901",
           "Kaska" = "v_CA16_1490",
           "Khmer" = "v_CA16_1688",
           "Kinyarwanda" = "v_CA16_2015",
           "Konkani" = "v_CA16_1904",
           "Korean" = "v_CA16_1973",
           "Kurdish" = "v_CA16_1931",
           "Kutenai" = "v_CA16_1538",
           "Kwakiutl" = "v_CA16_1610",
           "Lao" = "v_CA16_2102",
           "Latvian" = "v_CA16_1784",
           "Lillooet" = "v_CA16_1553",
           "Lingala" = "v_CA16_2009",
           "Lithuanian" = "v_CA16_1787",
           "Macedonian" = "v_CA16_1808",
           "Malagasy" = "v_CA16_1715",
           "Malay" = "v_CA16_1718",
           "Malayalam" = "v_CA16_1754",
           "Malecite" = "v_CA16_1418",
           "Maltese" = "v_CA16_1673",
           "Mandarin" = "v_CA16_2066",
           "Marathi" = "v_CA16_1907",
           "Mi'kmaq" = "v_CA16_1421",
           "Michif" = "v_CA16_1541",
           "Min Dong" = "v_CA16_2069",
           "Min Nan" = "v_CA16_2072",
           "Mohawk" = "v_CA16_1529",
           "Mongolian" = "v_CA16_1979",
           "Montagnais" = "v_CA16_1388",
           "Moose Cree" = "v_CA16_1391",
           "Naskapi" = "v_CA16_1394",
           "Nepali" = "v_CA16_1910",
           "Niger-Congo, n.i.e." = "v_CA16_2030",
           "Nilo-Saharan, n.i.e." = "v_CA16_2039",
           "Nisga'a" = "v_CA16_1595",
           "North Slavey" = "v_CA16_1478",
           "Northern East Cree" = "v_CA16_1397",
           "Northern Tutchone" = "v_CA16_1499",
           "Norwegian" = "v_CA16_1868",
           "Nuu-chah-nulth" = "v_CA16_1613",
           "Oji-Cree" = "v_CA16_1433",
           "Ojibway" = "v_CA16_1430",
           "Okanagan" = "v_CA16_1556",
           "Oneida" = "v_CA16_1532",
           "Oriya" = "v_CA16_1913",
           "Oromo" = "v_CA16_1643",
           "Other, n.i.e." = "v_CA16_2144",
           "Ottawa" = "v_CA16_1436",
           "Pampangan" = "v_CA16_1721",
           "Pangasinan" = "v_CA16_1724",
           "Pashto" = "v_CA16_1934",
           "Persian" = "v_CA16_1937",
           "Plains Cree" = "v_CA16_1400",
           "Polish" = "v_CA16_1811",
           "Portuguese" = "v_CA16_1952",
           "Punjabi" = "v_CA16_1916",
           "Quebec Sign Language" = "v_CA16_2048",
           "Romanian" = "v_CA16_1955",
           "Rundi" = "v_CA16_2012",
           "Russian" = "v_CA16_1814",
           "Salish, n.i.e." = "v_CA16_1571",
           "Sarsi" = "v_CA16_1469",
           "Scottish Gaelic" = "v_CA16_1838",
           "Sekani" = "v_CA16_1472",
           "Semitic, n.i.e." = "v_CA16_1679",
           "Serbian" = "v_CA16_1817",
           "Serbo-Croatian" = "v_CA16_1820",
           "Shona" = "v_CA16_2018",
           "Shuswap" = "v_CA16_1559",
           "Sign languages, n.i.e." = "v_CA16_2051",
           "Sindhi" = "v_CA16_1919",
           "Sinhala" = "v_CA16_1922",
           "Siouan, n.i.e." = "v_CA16_1583",
           "Slavey, n.o.s." = "v_CA16_1484",
           "Slavic, n.i.e." = "v_CA16_1832",
           "Slovak" = "v_CA16_1823",
           "Slovene" = "v_CA16_1826",
           "Somali" = "v_CA16_1646",
           "South Slavey" = "v_CA16_1481",
           "Southern East Cree" = "v_CA16_1403",
           "Southern Tutchone" = "v_CA16_1502",
           "Spanish" = "v_CA16_1958",
           "Squamish" = "v_CA16_1562",
           "Stoney" = "v_CA16_1580",
           "Straits" = "v_CA16_1565",
           "Swahili" = "v_CA16_2021",
           "Swampy Cree" = "v_CA16_1406",
           "Swedish" = "v_CA16_1871",
           "Tagalog" = "v_CA16_1727",
           "Tahltan" = "v_CA16_1493",
           "Tai-Kadai, n.i.e." = "v_CA16_2108",
           "Tamil" = "v_CA16_1757",
           "Telugu" = "v_CA16_1760",
           "Thai" = "v_CA16_2105",
           "Thompson" = "v_CA16_1568",
           "Tibetan" = "v_CA16_2093",
           "Tibeto-Burman, n.i.e." = "v_CA16_2096",
           "Tigrigna" = "v_CA16_1676",
           "Tlingit" = "v_CA16_1586",
           "Tsimshian" = "v_CA16_1598",
           "Turkic, n.i.e." = "v_CA16_2126",
           "Turkish" = "v_CA16_2117",
           "Ukrainian" = "v_CA16_1829",
           "Uralic, n.i.e." = "v_CA16_2141",
           "Urdu" = "v_CA16_1925",
           "Uyghur" = "v_CA16_2120",
           "Uzbek" = "v_CA16_2123",
           "Vietnamese" = "v_CA16_1691",
           "Vlaams" = "v_CA16_1874",
           "Wakashan, n.i.e." = "v_CA16_1616",
           "Waray-Waray" = "v_CA16_1730",
           "Welsh" = "v_CA16_1841",
           "Wolof" = "v_CA16_2024",
           "Woods Cree" = "v_CA16_1409",
           "Wu" = "v_CA16_2075",
           "Yiddish" = "v_CA16_1877",
           "Yoruba" = "v_CA16_2027")) %>%
  rowwise() %>%
  mutate(TOTAL = sum(c_across(English:Persian), na.rm = TRUE))

ldi_calc_agg <- function(df) {
  tidy_langs <- df %>%
    tidyr::gather(key = language, value = lang_count, English:Persian) %>%
    mutate(ldi_frac = ifelse(lang_count <= TOTAL, lang_count/TOTAL, 1)) %>%
    group_by(REGION) %>%
    mutate(LDI = 1 - sum((ldi_frac)^2)) %>%
    ungroup() %>%
    select(-language, -lang_count, -ldi_frac) %>%
    distinct()
  return(tidy_langs)
}

df <- ldi_calc(langs_van)

van_ldi <- inner_join(langs_van, df) %>%
  replace(is.na(.), 0)

st_write(van_ldi, "Vancouver_LDI.geojson")

langs_van_agg <- langs_van %>%
  ungroup() %>%
  group_by(REGION) %>%
  st_as_sf(.) %>%
  summarise_if(is.numeric, sum, na.rm = TRUE)

df_agg <- langs_van_agg %>%
  st_drop_geometry() %>%
  ldi_calc_agg(.)

van_ldi_agg <- inner_join(langs_van_agg, df_agg) %>%
  replace(is.na(.), 0)

st_write(van_ldi_agg, "Vancouver_LDI_agg.geojson")

languages <- colnames(census)[14:231]
lang_detail_1 <- vector(mode = "character")
lang_detail_2 <- vector(mode = "character")

for (id in languages) {
  detail <- list_census_vectors("CA16") %>%
    filter(vector == id) %>%
    pull(details)

  detail1 <- detail %>%
    str_split(., "; ")

  lang_detail1 <- detail1[[1]][length(detail1[[1]])-1]
  lang_detail2 <- detail1[[1]][length(detail1[[1]])]

  lang_detail_1 <- c(lang_detail_1, lang_detail1)
  lang_detail_2 <- c(lang_detail_2, lang_detail2)
}

df <- data.frame(ID = languages, DETAIL1 = lang_detail_1, DETAIL2 = lang_detail_2)
write.csv(df, file = "language_detail.csv", row.names = FALSE)
