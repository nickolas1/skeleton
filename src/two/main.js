var two = angular.module('two', []);

two.controller('TwoCtrl', TwoController);
TwoController.$inject = [];
function TwoController() {
    console.log('two')
}

export default two;