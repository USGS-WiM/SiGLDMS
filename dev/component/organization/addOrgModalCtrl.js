(function () {
    'use strict';

    var ModalControllers = angular.module('ModalControllers');


//org popup to add to org db
    ModalControllers.controller('AddOrgModalCtrl', ['$scope', '$cookies', '$uibModalInstance', '$http', 'chosenParts', 'allOrgs', 'allDivs', 'allSecs', 'ORGANIZATION', 'DIVISION', 'SECTION',
        function ($scope, $cookies, $uibModalInstance, $http, chosenParts, allOrgs, allDivs, allSecs, ORGANIZATION, DIVISION, SECTION) {
            //globals
            $scope.OrgName = {}; //new org name input ng-model
            $scope.divisionName = {}; //new div name input ng-model
            $scope.sectionName = {}; //new sec name input ng-model
            $scope.orgList = allOrgs;
            $scope.allDivList = allDivs;
            $scope.allSecList = allSecs;
            $scope.orgsBeenChosen = false; //flag for showing 'Add new Division' button
            $scope.divsBeenChosen = false; //flag for showing 'Add new Section' button
            $scope.showAddNAMEinput = false; //flag for ng-show on new org name input area
            $scope.showAddDIVISIONinput = false; //flag for ng-show on new div name input area
            $scope.showAddSECTIONinput = false; //flag for ng-show on new sec name input area
            $scope.disableOrgSelect = false; //disable the select dropdown while they are created a new one
            $scope.disableDivSelect = false; //disable the select dropdown while they are created a new one
            $scope.disableSecSelect = false; //disable the select dropdown while they are created a new one
            $scope.originalOrgId = chosenParts[0] !== "" ? Number(chosenParts[0]) : 0;
            $scope.originalDivId = chosenParts[1] !== "" ? Number(chosenParts[1]) : 0;
            $scope.originalSecId = chosenParts[2] !== "" ? Number(chosenParts[2]) : 0;

            //set selected parts based on what they choose from main page before hitting button to open modal
            $scope.selectedOrgID = {};
            $scope.selectedOrgID.id = chosenParts[0] !== "" ? Number(chosenParts[0]) : "";
            $scope.divList = []; //what the select uses, based on org chosen
            $scope.secList = []; //what the select uses, based on div chosen

            //if they did choose an org before opening modal, go get the divs for this org
            if ($scope.selectedOrgID.id !== "") {
                $scope.orgsBeenChosen = true;
                $scope.divList = $scope.allDivList.filter(function (d) { return d.org_id == $scope.selectedOrgID.id; });
            }
            $scope.selectedDivID = {};
            $scope.selectedDivID.id = chosenParts[1] !== "" ? Number(chosenParts[1]) : "";
            //if they did choose an div before opening modal, go get the sec for this div
            if ($scope.selectedDivID.id !== "") {
                $scope.divsBeenChosen = true;
                $scope.secList = $scope.allSecList.filter(function (s) { return s.div_id == $scope.selectedDivID.id; });
            }

            $scope.selectedSecID = {}; //not going to preset this because if they are in the modal, they will at the least be created a new section
            $scope.selectedSecID.id = chosenParts[2] !== "" ? Number(chosenParts[2]) : "";

            //ng-change event on org select: they selected an org name, get those divs
            $scope.getDivs = function (orgID) {
                $scope.selectedOrgID.id = orgID;
                $scope.selectedDivID.id = ""; $scope.selectedSecID.id = "";
                $scope.divList = [];
                $scope.divList = $scope.allDivList.filter(function (d) { return d.org_id == orgID; });

                $scope.secList = [];
                $scope.orgsBeenChosen = true;
                $scope.divsBeenChosen = false;
            };
            //ng-change event on div select: they selected an div, get those secs
            $scope.getSecs = function (divID) {
                $scope.selectedDivID.id = divID;
                $scope.selectedSecID.id = "";
                $scope.secList = $scope.allSecList.filter(function (s) { return s.div_id == divID; });
                $scope.divsBeenChosen = true;
            };

            //they clicked 'Add Organization' 
            $scope.addOrgName = function () {
                $scope.showAddNAMEinput = true;
                $scope.selectedOrgID.id = ""; $scope.selectedDivID.id = ""; $scope.selectedSecID.id = "";
                $scope.disableOrgSelect = true;

            };
            //this is the one they want to add
            $scope.addThisName = function (nameToAdd) {
                //make sure they typed something in to add
                if (nameToAdd !== "") {
                    var orgToPost = {
                        organization_name: nameToAdd
                    };
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    ORGANIZATION.save(orgToPost, function success(response) {
                        //add this new one to the lists
                        $scope.orgList.push(response);
                        //Make just added one selected
                        $scope.selectedOrgID.id = response.organization_id;
                        //they added it, so update the originalOrgID too 
                        $scope.originalOrgId = response.organization_id;
                        $scope.orgsBeenChosen = true;

                        //clear input, hide input
                        $scope.OrgName.value = "";
                        $scope.showAddNAMEinput = false;
                        $scope.disableOrgSelect = false;
                    });
                } else {
                    alert("Type in the new Organization first.");
                }
            };

            //they clicked 'Add Division' 
            $scope.addDivName = function () {
                $scope.showAddDIVISIONinput = true;
                $scope.selectedDivID.id = ""; $scope.selectedSecID.id = "";
                $scope.disableDivSelect = true;
            };
            //this is the one they want to add
            $scope.addThisDivision = function (divToAdd, orgID) {
                if (divToAdd !== "" && orgID !== "") {
                    var divToPost = { division_name: divToAdd, org_id: orgID };
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    DIVISION.save(divToPost, function success(response) {
                        $scope.allDivList.push(response);
                        $scope.divList.push(response); //push to the dropdown (these divs for this org)
                        //Make just added one selected
                        $scope.selectedDivID.id = response.division_id;
                        //they added it, so update the originalDivID with it
                        $scope.originalDivId = response.division_id;
                        $scope.divsBeenChosen = true; //show "add section" button text

                        //clear input, hide input
                        $scope.divisionName.value = "";
                        $scope.showAddDIVISIONinput = false;
                        $scope.disableDivSelect = false;
                    });
                } else {
                    alert("Choose an Organization and type in the new Division first.");
                }
            };

            //they clicked 'Add Section' 
            $scope.addSecName = function () {
                $scope.showAddSECTIONinput = true;
                $scope.selectedSecID.id = "";
                $scope.disableSecSelect = true;
            };
            //this is the one they want to add
            $scope.addThisSection = function (secToAdd, divID) {
                if (secToAdd !== "" && divID !== "") {
                    var secToPost = { section_name: secToAdd, div_id: divID };
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    SECTION.save(secToPost, function success(response) {
                        $scope.allSecList.push(response); //push to all sections 
                        $scope.secList.push(response); //push to the dropdown (these secs for this div)
                        //Make just added one selected
                        $scope.selectedSecID.id = response.section_id;
                        //they added it, so update the originalDivID with it
                        $scope.originalSecId = response.section_id;

                        //clear input, hide input
                        $scope.sectionName.value = "";
                        $scope.showAddSECTIONinput = false;
                        $scope.disableSecSelect = false;
                    });
                } else {
                    alert("Choose an Organization, Division and type in the new Section first.");
                }
            };
            //make sure the selectedSecID gets stored to pass back to the page that called this modal so it will be preselected there upon closing the modal

            $scope.setSecs = function (secID) {
                $scope.selectedSecID.id = secID;
            };

            //want to close input for adding new part
            $scope.neverMind = function (which) {
                //clear 'which' input and hide all input divs
                if (which == "org") {
                    $scope.OrgName.value = ""; $scope.showAddNAMEinput = false;
                    $scope.disableOrgSelect = false;
                    $scope.selectedOrgID.id = $scope.originalOrgId;
                }
                if (which == "div") {
                    $scope.divisionName.value = ""; $scope.showAddDIVISIONinput = false;
                    $scope.disableDivSelect = false;
                    $scope.selectedDivID.id = $scope.originalDivId;
                }
                if (which == "sec") {
                    $scope.sectionName.value = ""; $scope.showAddSECTIONinput = false;
                    $scope.disableSecSelect = false;
                    $scope.selectedSecID.id = $scope.originalSecId;
                }
            };

            $scope.ok = function () {
                var allLists = [];
                allLists.push($scope.orgList); allLists.push($scope.allDivList); allLists.push($scope.allSecList);
                allLists.push($scope.selectedOrgID.id); allLists.push($scope.selectedDivID.id); allLists.push($scope.selectedSecID.id);
                $uibModalInstance.close(allLists);
            };
        }]);

})();