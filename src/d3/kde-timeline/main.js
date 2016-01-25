import kdeTemplate from './template.html!text';

var kde = angular.module('kdeTimeline', []);

kde.directive('d3KdeTimeline', kdeTimelineDirective);

kdeTimelineDirective.$inject = ['lodash'];
function kdeTimelineDirective(_) {
    return {
        restrict: 'E',
        scope: {
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
            left: 80
        }

        let explosions = scope.explosions();

        // get list of countries
        let sortedCountries;
        {
            let countries = _.uniq(_.map(explosions, function(d) { return d.country }));
            let countryDate = [];
            _.forEach(countries, function(country) {
                let first = _.find(explosions, function(explosion) { return explosion.country === country; });
                countryDate.push({ country: country, date: first.date });
            });
            sortedCountries = _.pluck(_.sortBy(countryDate, 'date'), 'country');
        }

        // TODO set width of element, this is 100% of that width
        // watch for window resize changes to rescale
        let width = 960 - margin.left - margin.right;
        let height = 200 - margin.top - margin.bottom;

        let tMin = new Date('1940 Jan 1');
        let tMax = new Date('2010 Jan 1');
        let year = tMax - new Date('2009 Jan 1');

        let x = d3.time.scale()
            .domain([tMin, tMax])
            .range([0, width]);

        let y = d3.scale.linear()
            .domain([0, 100])
            .range([height, 0]);

        let xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom');

        let yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

        let line = d3.svg.line()
            .x(function(d) { return x(d[0]); })
            .y(function(d) { return y(d[1]); });

        let histogram = d3.layout.histogram()
            .bins(x.ticks(70));

        let histDataAll = [];
        _.forEach(sortedCountries, function(country) {
            let dates = _.map(_.pluck(_.where(explosions, { 'country': country}), 'date'), function(d) { return d.valueOf(); });
            histDataAll.push(_.remove(histogram(dates), function(d) { return d.y > 0; }));
        });

        let svg = d3.select('body').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
        .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis)
        .append('text')
            .attr('class', 'label')
            .attr('x', width)
            .attr('y', -6)
            .style('text-anchor', 'end')
            .text('Time between Eruptions (min.)');

        svg.append('g')
            .attr('class', 'y axis')
            .call(yAxis);

//        svg.selectAll('.bar')
//            .data(histData)
//            .enter().insert('rect', '.axis')
//            .attr('class', 'land')
//            .attr('x', function(d) { return x(d.x) + 1; })
//            .attr('y', function(d) { return y(d.y); })
//            .attr('width', function(d) { return x(d.dx + d.x.valueOf()) - x(d.x.valueOf()) - 1; })
//            .attr('height', function(d) { return height - y(d.y); });

        _.forEach(sortedCountries, function(country, idx) {
            let histData = histDataAll[idx];
            console.log(country, histData)
            svg.selectAll('.kde-explosion2.' + country)
                .data(histData)
                .enter().append('circle')
                .attr('cx', function(d) { return x(d.x.valueOf() + 0.5*year); } )
                .attr('cy', function(d) { return y(100 - idx*12); } )
                .attr('r', function(d) { return 1.0*Math.sqrt(d.y) + 'px'; })
                .attr('class', 'kde-explosion2 ' + country);
        });

//        let kdeData;
//        _.forEach(sortedCountries, function(country, idx) {
//            let bandwidth = year;
//            let dates = _.map(_.pluck(_.where(explosions, { 'country': country}), 'date'), function(d) { return d.valueOf(); })
//            let histData = histDataAll[idx];
//            let kde = kernelDensityEstimator(epanechnikovKernel(bandwidth), x.ticks(400), bandwidth / histData[0].dx);
//            kdeData = kde(dates);
//
//            svg.selectAll('.kde-explosion.' + country)
//                .data(dates)
//                .enter().append('circle')
//                .attr('cx', function(d) { return x(d); } )
//                .attr('cy', function(d) { return y(100 - idx*12); } )
//                .attr('r', function(d) { return getCloudRadius(d) + 'px'; })
//                .attr('class', 'kde-explosion ' + country);
//        });

//        let bandwidth = year;
//        let kde = kernelDensityEstimator(epanechnikovKernel(bandwidth), x.ticks(400), bandwidth / histData[0].dx);
//        let kdeData = kde(dates);
//
//        svg.append('path')
//            .datum(kdeData)
//            .attr('class', 'stroke')
//            .attr('d', line);
//
//        svg.selectAll('.kde-explosion')
//            .data(dates)
//            .enter().append('circle')
//            .attr('cx', function(d) { return x(d); } )
//            .attr('cy', function(d) { return y(90); } )
//            .attr('r', function(d) { return getCloudRadius(d) + 'px'; })
//            .attr('class', 'kde-explosion');
//
        function getCloudRadius(date) {
            //let kde = kernelDensityEstimator(epanechnikovKernel(bandwidth), [date], bandwidth / histData[0].dx);
            //console.log(kde(dates)[0][1])
            let idx = _.findIndex(kdeData, function(kdeDatum) {
                return kdeDatum[0] > date;
            });
            let yDiff = (kdeData[idx][1] - kdeData[idx - 1][1]);
            let xFrac = (date - kdeData[idx - 1][0]) / (kdeData[idx][0] - kdeData[idx - 1][0]);
            let kde = kdeData[idx-1][1] + yDiff * xFrac;
            return 2*Math.sqrt(kde);
        }

        // http://bl.ocks.org/mbostock/4341954
        function kernelDensityEstimator(kernel, x, norm) {
            return function(sample) {
                return x.map(function(x) {
                    return [x, d3.mean(sample, function(v) { return kernel(x - v); }) / norm * sample.length];
                });
            };
        }

        // http://bl.ocks.org/mbostock/4341954
        function epanechnikovKernel(scale) {
            return function(u) {
                return Math.abs(u /= scale) <= 1 ? .75 * (1 - u * u) : 0;
            };
        }
    }
}

export default kde;
