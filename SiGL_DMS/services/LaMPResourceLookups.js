/*(function () {
    "use strict";

    //look up common service module, and register the new factory with that module 
    angular.module("common.services")
        .factory("laMPResourceLookups", ["$resource", laMPResourceLookups]);

    //var hashedString = btoa('troddick:CaidenMadie02');
    //var hash = "Basic: " + hashedString;
    //sets up connection

    function laMPResourceLookups($resource) {
        return {
            durations: $resource("/LaMPServices/ProjectDuration"),
            projStats: $resource("/LaMPServices/ProjectStatus"),
            objectives: $resource("/LaMPServices/objectives"),
            countries: Array("Canada", "United States of America"),
            states: $resource("/LaMPServices/states"),
            lakes: $resource("/LaMPServices/lakes"),
            siteStats: $resource("/LaMPServices/status"),
            resources: $resource("/LaMPServices/resourcetypes"),
            medias: $resource("/LaMPServices/media"),
            frequencies: $resource("/LaMPServices/frequencies"),
            parameters: $resource("/LaMPServices/parameters")
        }
    };
}());
*/