import mapTemplate from './template.html!text';

var map = angular.module('staticMap', []);

map.directive('d3StaticMap', staticMapDirective);

staticMapDirective.$inject = [];
function staticMapDirective() {
    return {
        restrict: 'E',
        scope: {
            world: '&world',
            explosions: '&explosions'
        },
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

        let world = scope.world();
        let explosions = scope.explosions();

        // TODO set width of element, this is 100% of that width
        // watch for window resize changes to rescale
        let width = 960 - margin.left - margin.right;
        let height = 500 - margin.top - margin.bottom;

        let projection = d3.geo.hammer()
            .scale(150)
            .rotate([210, 0 , 0])
            .translate([width / 2 + margin.left, height / 2 + margin.top])
            .precision(0.1);

        let path = d3.geo.path()
            .projection(projection);

        let graticule = d3.geo.graticule();

        let svg = d3.select(element[0])
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom);

        let map = svg.append('g');

        let sites = svg.append('g');

        let defs = svg.append('defs');
        {
            let filter = defs
                .append('filter')
                .attr('id', 'blur-land')
                .attr('x', '-40%')
                .attr('y', '-40%')
                .attr('width', '180%')
                .attr('height', '180%');
            filter.append('feGaussianBlur')
                .attr('in', 'SourceGraphic')
                .attr('stdDeviation', 30)
                .attr('result', 'landblur');

            let feMerge = filter.append('feMerge');
            feMerge.append('feMergeNode')
                .attr('in', 'landblur')
            feMerge.append('feMergeNode')
                .attr('in', 'SourceGraphic');
        }

        {
            let filter = defs
                .append('filter')
                .attr('id', 'blur-explosion')
                .attr('x', '-40%')
                .attr('y', '-40%')
                .attr('width', '180%')
                .attr('height', '180%')
            .append('feGaussianBlur')
                .attr('in', 'SourceGraphic')
                .attr('stdDeviation', 3);
        }



        defs.append('path')
            .datum( { type: 'Sphere' } )
            .attr('id', 'sphere')
            .attr('d', path);

        defs.append('clipPath')
            .attr('id', 'clip')
            .append('use')
            .attr('xlink:href', '#sphere');

        map.append('use')
            .attr('class', 'stroke')
            .attr('xlink:href', '#sphere');

        map.append('use')
            .attr('class', 'fill')
            .attr('xlink:href', '#sphere');

        map.append('path')
            .datum(graticule)
            .attr('class', 'graticule')
            .attr('clip-path', 'url(#clip)')
            .attr('d', path);

        map.insert('path', '.graticule')
            .datum(topojson.feature(world, world.objects.land))
            .attr('class', 'land')
            .attr('clip-path', 'url(#clip)')
            .attr('d', path)
            .style('filter', 'url(#blur-land)');

//        map.insert('path', '.graticule')
//            .datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
//            .attr('class', 'boundary')
//            .attr('clip-path', 'url(#clip)')
//            .attr('d', path);

        sites.selectAll('.explosion')
            .data(explosions)
            .enter().append('circle')
            .attr('cx', function(d) { return projection(d.pos)[0]; } )
            .attr('cy', function(d) { return projection(d.pos)[1]; } )
            .attr('r', '4px')
            .attr('class', 'explosion')
            .style('filter', 'url(#blur-explosion)');
    }
}

export default map;
