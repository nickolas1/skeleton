import mapTemplate from './template.html!text';

var map = angular.module('zoomableMap', []);

map.directive('d3ZoomableMap', zoomableMapDirective);

zoomableMapDirective.$inject = [];
function zoomableMapDirective() {
    return {
        restrict: 'E',
        link: linkFunction,
//        template: mapTemplate
    };

    function linkFunction(scope, element, attrs) {
        let margin = {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20
        }

        // TODO set width of element, this is 100% of that width
        // watch for window resize changes to rescale
        let width = 800 - margin.left - margin.right;
        let height = 800 - margin.top - margin.bottom;

        let svg = d3.select(element[0])
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        let raster = svg.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        // TODO these two need to be in a function so that it can be redone when resized
        let tile = d3.geo.tile()
            .size([width, height]);

        var projection = d3.geo.mercator()
            .scale((1 << 12) / 2 / Math.PI)
            .translate([width / 2, height / 2]);

        var center = projection([-100, 40]);

        let zoom = d3.behavior.zoom()
            .scale(projection.scale() * 2 * Math.PI)
            .scaleExtent([1 << 9, 1 << 15])
            .translate([width - center[0], height - center[1]])
            .on('zoom', zoomed);

        let abc = ['a', 'b', 'c'];

        function zoomed () {
            let tiles = tile
                .scale(zoom.scale())
                .translate(zoom.translate())
                ();

            let image = raster
                .attr('transform', 'scale(' + tiles.scale + ')translate(' + tiles.translate + ')')
            .selectAll('image')
                .data(tiles, function(d) { return d; });

            image.exit()
                .remove();

            image.enter().append('image')
                .attr('xlink:href', function(d) { return 'http://' + abc[Math.random() * 3 | 0] + '.basemaps.cartocdn.com/dark_all/' + d[2] + '/' + d[0] + '/' + d[1] + '.png'; })
                .attr('width', 1)
                .attr('height', 1)
                .attr('x', function(d) { return d[0]; })
                .attr('y', function(d) { return d[1]; });
        }

        svg.call(zoom);
        zoomed();
    }
}

export default map;
