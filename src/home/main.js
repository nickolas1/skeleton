var home = angular.module('home', []);

home.controller('HomeCtrl', HomeController);
HomeController.$inject = ['$scope', '$state', '$document', 'lodash'];
function HomeController($scope, $state, $document, _) {
    var _this = this;
    
    let tabs = [
        {
            name: 'space and time',
            select: function() { $state.go('spaceTime'); }
        },
        {
            name: 'two',
            select: function() { $state.go('two'); }
        }
    ];
    
    this.ui = {
        tabs: tabs,
        goOne : function() { $state.go('spaceTime'); },
        goTwo : function() { $state.go('two'); }
    };
    
    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, formParams) {
        if (!_.isNull($document[0].activeElement)) $document[0].activeElement.blur();
        let idx = _.findIndex(_this.ui.tabs, function(tab) {
            return tab.name === toState.name;
        });
        _this.ui.tabs[idx].active = true
    }); 
}

export default home;