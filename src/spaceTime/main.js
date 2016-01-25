var spaceTime = angular.module('spaceTime', []);

spaceTime.controller('SpaceTimeCtrl', SpaceTimeController);
SpaceTimeController.$inject = ['blastData', 'worldData'];
function SpaceTimeController(blastData, worldData) {
    var _this = this;
    this.ui = {
        blastData: blastData,
        worldData: worldData
    };

}

export default spaceTime;