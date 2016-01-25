import home from './home/main';
import homeTemplate from './home/template.html!text';
import spaceTime from './spaceTime/main';
import spaceTimeTemplate from './spaceTime/template.html!text';
import two from './two/main';
import twoTemplate from './two/template.html!text';

import geoTile from './d3/utils/geo-tile';
import zoomMap from './d3/zoomable-map/main';
import staticMap from './d3/static-map/main';
import kdeTimeline from './d3/kde-timeline/main';

console.log(angular)

var nb = angular.module('nb', [
    home.name,
    spaceTime.name,
    two.name,
    geoTile.name,
    zoomMap.name,
    staticMap.name,
    kdeTimeline.name,
    'ui.router',
    'ui.bootstrap',
    'ngLodash'
]);

nb.config(ConfigBlock);
nb.run(RunBlock);

ConfigBlock.$inject = ['$stateProvider', '$urlRouterProvider'];
function ConfigBlock($stateProvider, $urlRouterProvider) {
    console.log('config');

    $urlRouterProvider.otherwise('/one');

    let states = [
        {
            name: 'home',
            url: '',
            controller: 'HomeCtrl as ctrl',
            template: homeTemplate,
            params: {},
            resolve: {
                blastData: ['$q', function($q) {
                    let deferred = $q.defer();
                    d3.csv('./static/blast-data.csv',
                        function(d) {
                            return {
                                country: d.country,
                                date: new Date(d.date),
                                pos: [+d.lng, +d.lat],
                                type: d.type,
                                purpose: d.purpose,
                                yield: d.yield
                            }
                        }, function(d) {
                                deferred.resolve(d);
                        }
                    );
                    return deferred.promise;
                }],
                worldData: ['$http', '$q', function($http, $q) {
                    let deferred = $q.defer();
                    $http.get('./static/world-110m.json').then(function(response) {
                        deferred.resolve(response.data);
                    });
                    return deferred.promise;
                }]
            }
        },
        {
            name: 'spaceTime',
            parent: 'home',
            url: '/spaceTime',
            data: {
                selectedTab: 0
            },
            views: {
                'tabView': {
                    template: spaceTimeTemplate,
                    controller: 'SpaceTimeCtrl as ctrl'
                }
            },
            params: {},
            resolve: {}
        },
        {
            name: 'two',
            parent: 'home',
            url: '/two',
            data: {
                selectedTab: 1
            },
            views: {
                'tabView': {
                    template: twoTemplate,
                    controller: 'TwoCtrl as ctrl'
                }
            },
            params: {},
            resolve: {}
        }
    ];

    states.forEach( function(state) {
        $stateProvider.state(state.name, state);
    });

    console.log(states)
}

RunBlock.$inject = ['$state', 'geoTile'];
function RunBlock($state, geoTile) {
    geoTile.geoTileInit();
    console.log('run');
}

export default nb;
