class Map {

    constructor(_config) {
        this.config = {
            parentElement: _config.parentElement,
            height: _config.height || 300,
            margin: {top:10, botton: 30, right: 10, left: 30
            }
        };

        this.initVis();
    }

    initVis() {
        let vis = this;

    }

    update() {
        let vis = this;
        vis.render();
    }

    render() {
        let vis = this;

    }
}
