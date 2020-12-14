## Visualizing Linguistic Diversity in Vancouver

CPSC 547 Information Visualization Final Project

Authors: Roger Yu-Hsiang Lo, Namratha Rao, and Anika Sayara

### Content

This repository contains implementation for the choropleth map and the collapsible tree.

- Entry point: `index.html`
- Data for the choropleth map: `data/Vancouver_LDI.geojson` and `data/Vancouver_LDI_agg.geojson`
- Scripts for data extraction and preprocessing are in `preprocessing_script`
- `d3` folder has all the existing d3 modules
- Implementation code: `js/MapTreeCombined.js`
    - The implementation code for zooming and panning is adopted from [here](https://observablehq.com/@d3/zoom-to-bounding-box).
    - The code for the collapsible tree is based on [this Observable notebook](https://observablehq.com/@d3/collapsible-tree). However, we tweak the code so that the radius of nodes and the width of links are dynamically set. Also, we use many tree-traversal functions in `d3-hierarchy` to preprocess the tree further.
    - The code for constructing the legend is modified from [here](https://bl.ocks.org/HarryStevens/6eb89487fc99ad016723b901cbd57fde).

### Usage

To install dependencies:

```bash
npm install
```

To run the project:

```bash
npm start
```