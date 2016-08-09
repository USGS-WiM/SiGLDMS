(function () {
    'use strict';

    var siGLControllers = angular.module('siGLControllers');

    siGLControllers.controller('projContactCtrl', ['$scope', '$cookies', '$http', '$filter', '$uibModal', 'PROJECT', 'CONTACT', 'ORGANIZATION_SYSTEM', 'projContacts', 'thisProject', 'orgResources', 'allOrgList', 'allDivisionList', 'allSectionList',
        function ($scope, $cookies, $http, $filter, $uibModal, PROJECT, CONTACT, ORGANIZATION_SYSTEM, projContacts, thisProject, orgResources, allOrgList, allDivisionList, allSectionList) {
            $scope.ProjContacts = projContacts;

            //make sure phone is formatted
            for (var p = 0; p < $scope.ProjContacts.length; p++) {
                var theI = p;
                if ($scope.ProjContacts[theI].phone !== null && !$scope.ProjContacts[theI].phone.startsWith("(")) {
                    //not formatted..remove any spaces, dashes or parenthesis to then do it properly
                    var phNo = $scope.ProjContacts[theI].phone.replace("[()\\s-]+", "");
                    if (phNo.length >= 10) {
                        //format it
                        $scope.ProjContacts[theI].phone = "(" + phNo.substring(0, 3) + ") " + phNo.substring(3, 6) + "-" + phNo.substring(6);
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        CONTACT.update({ id: $scope.ProjContacts[theI].contact_id }, $scope.ProjContacts[theI]).$promise;
                    }
                }
            }
            $scope.allOrgResources = orgResources; 
            $scope.allOrganizations = allOrgList; 
            $scope.allDivisions = allDivisionList;
            $scope.allSections = allSectionList; 
            $scope.selectedOrgID = "";
            $scope.selectedDivID = "";
            $scope.selectedSecID = "";
            $scope.alldivs = {};
            $scope.allsecs = {};
            $scope.newContact = {}; //holder for the new contact being added to the project
            $scope.isEditing = false; //flag so that when editing, can't also add a new one below
            $scope.updatedContactOrg = false; //set flag to check on saveEdits to update the org

            //format contacts for display with org parts (if there is one.. all should have one, but a few don't..)
            for (var x = 0; x < $scope.ProjContacts.length; x++) {
                if ($scope.ProjContacts[x].organization_system_id !== null) {
                    var thisOrgRes = $scope.allOrgResources.filter(function (or) { return or.organization_system_id == $scope.ProjContacts[x].organization_system_id; })[0];
                    if (thisOrgRes !== undefined) {
                        $scope.ProjContacts[x].OrgName = thisOrgRes.OrganizationName;
                        if (thisOrgRes.div_id > 0)
                            $scope.ProjContacts[x].DivName = thisOrgRes.DivisionName;
                        if (thisOrgRes.sec_id > 0)
                            $scope.ProjContacts[x].SecName = thisOrgRes.SectionName;
                    }
                }
            }

            //org was chosen, go get the divs
            $scope.getDivs = function (orgID) {
                $scope.alldivs = {}; $scope.selectedDivID = ""; $scope.selectedSecID = "";
                $scope.alldivs = $scope.allDivisions.filter(function (d) { return d.org_id == orgID; });
                $scope.allsecs = {};
            };

            //div was chosen, go get the secs
            $scope.getSecs = function (divID) {
                $scope.selectedSecID = "";
                $scope.allsecs = $scope.allSections.filter(function (s) {
                    return s.div_id == divID;
                });
            };

            //post this contact to the project and then format the list of projContacts with org info
            function postProjContact(orgSys) {
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                PROJECT.addProjContact({ id: thisProject.project_id }, $scope.newContact, function success(response) {
                    $scope.ProjContacts = response;
                    for (var pc = 0; pc < $scope.ProjContacts.length; pc++) {
                        var thisOrgSysRes = $scope.allOrgResources.filter(function (allOrgRe) { return allOrgRe.organization_system_id == $scope.ProjContacts[pc].organization_system_id; })[0];
                        $scope.ProjContacts[pc].OrgName = thisOrgSysRes.OrganizationName;
                        if (orgSys.div_id > 0)
                            $scope.ProjContacts[pc].DivName = thisOrgSysRes.DivisionName;
                        if (orgSys.sec_id > 0)
                            $scope.ProjContacts[pc].SecName = thisOrgSysRes.SectionName;
                    }
                    $scope.contactCount.total = $scope.contactCount.total + 1;
                    //clear inputs
                    $scope.newContact = {};
                    $scope.alldivs = {}; $scope.selectedDivID = "";
                    $scope.allsecs = {}; $scope.selectedSecID = "";
                    $scope.selectedOrgID = "";
                    $scope.projectForm.Contact.$setPristine(true);
                    toastr.success("Contact Added");
                }, function error(errorResponse) {
                    toasstr.error("Error: " + errorResponse.statusText);
                });
            }

            //add this contact to the project
            $scope.AddContact = function (valid) {
                if (valid) {
                    //make sure the org_sys exists -- did they create a new one?
                    var secID = $scope.selectedSecID !== "" ? $scope.selectedSecID : "0";
                    var divID = $scope.selectedDivID !== "" ? $scope.selectedDivID : "0";
                    var orgID = $scope.selectedOrgID !== "" ? $scope.selectedOrgID : "0";
                    var chosenOrg = $scope.allOrgResources.filter(function (orgS) { return orgS.sec_id == secID && orgS.div_id == divID && orgS.org_id == orgID; })[0];
                    if (chosenOrg !== undefined) {
                        $scope.newContact.organization_system_id = chosenOrg.organization_system_id;
                        postProjContact(chosenOrg);
                    } else {
                        //need to post the organization_system first
                        var newORG_SYS = { org_id: orgID, div_id: divID, sec_id: secID };
                        ORGANIZATION_SYSTEM.save(newORG_SYS, function success(responseOS) {
                            $scope.newContact.organization_system_id = responseOS.organization_system_id;
                            var org = $scope.allOrganizations.filter(function (o) { return o.organization_id == responseOS.org_id; })[0];
                            var div = responseOS.div_id > 0 ? $scope.allDivisions.filter(function (d) { return d.division_id == responseOS.div_id; })[0] : null;
                            var sec = responseOS.sec_id > 0 ? $scope.allSections.filter(function (s) { return s.section_id == responseOS.sec_id; })[0] : null;
                            var newOrgRes = {
                                organization_system_id: responseOS.organization_system_id,
                                org_id: org.organization_id,
                                OrganizationName: org.organization_name,
                                div_id: div !== null ? div.division_id : 0,
                                DivisionName: div !== null ? div.division_name : null,
                                sec_id: sec !== null ? sec.section_id : 0,
                                SectionName: sec !== null ? sec.section_name : null
                            };
                            $scope.allOrgResources.push(newOrgRes);
                            postProjContact(newOrgRes);
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    }
                } else {
                    toastr.error("Contact not added");
                }
            };

            $scope.EditRowClicked = function (i) {
                //editing: only show (add org button) for this row, and disable inputs for new contact below
                $scope.projectForm.Contact.$pristine = false;
                var showAtag = document.getElementsByClassName("showHide")[this.$index];
                showAtag.style.display = "block";
                $scope.isEditing = true;
            };
            $scope.CancelEditRowClick = function () {
                //done editing: hide (add org button) for this row, and re-enable inputs for new contact below
                var showAtag = document.getElementsByClassName("showHide")[this.$index];
                showAtag.style.display = "none";
                $scope.isEditing = false;
                $scope.projectForm.Contact.$setPristine(true);
            };
            $scope.checkRequiredFields = function (which, data) {
                //            if null -- you must populate, else if which== email .. valid email
                if (data === null) {
                    return "You must populate all required fields";
                } else {
                    if (which == "email") {
                        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                        if (!re.test(data))
                            return "You must provide a valid email address";
                    }
                }
            };

            //edit contact done, save clicked
            $scope.saveContact = function (contact, id) {
                //hide the add org button for this row
                var showAtag = document.getElementsByClassName("showHide")[this.$index];
                showAtag.style.display = "none";
                if ($scope.updatedContactOrg) {
                    //they updated the org for this contact
                    var projContactBeingUpdated = $scope.ProjContacts.filter(function (pc) { return pc.contact_id == contact.contact_id; })[0];
                    var thisOrgRes = $scope.allOrgResources.filter(function (or) { return or.OrganizationName == projContactBeingUpdated.OrgName && or.DivisionName == (projContactBeingUpdated.DivName !== "" ? projContactBeingUpdated.DivName : null) && or.SectionName == (projContactBeingUpdated.SecName !== "" ? projContactBeingUpdated.SecName : null); })[0];
                    if (thisOrgRes !== undefined) {
                        //they didn't create a new one, just add the orgsysid to hidden input
                        contact.organization_system_id = thisOrgRes.organization_system_id;
                        PUTcontact(contact, id);
                        //do a put now
                    } else {
                        //create the org_sys then add the id then put
                        var orgId = $scope.allOrganizations.filter(function (aorg) { return aorg.organization_name == projContactBeingUpdated.OrgName; })[0].organization_id;
                        var divId = projContactBeingUpdated.DivName !== "" ? $scope.allDivisions.filter(function (adiv) { return adiv.division_name == projContactBeingUpdated.DivName; })[0].division_id : 0;
                        var secID = projContactBeingUpdated.SecName !== "" ? $scope.allSections.filter(function (asec) { return asec.section_name == projContactBeingUpdated.SecName; })[0].section_id : 0;
                        var newORGSYS = { org_id: orgId, div_id: divId, sec_id: secID };
                        ORGANIZATION_SYSTEM.save(newORGSYS, function success(response) {
                            contact.organization_system_id = response.organization_system_id;
                            PUTcontact(contact, id);
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    } //end else (thisOrgRes == undefined)
                } //end updateContactOrg
                else {
                    //contactOrg wasn't updated.. putContact
                    PUTcontact(contact, id);
                }
            };

            function PUTcontact(contactToUpdate, id) {
                //PUT
                var retur = false;
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                CONTACT.update({ id: id }, contactToUpdate, function success(response) {
                    var projContact = response;
                    var thisOrgRes = $scope.allOrgResources.filter(function (or) { return or.organization_system_id == response.organization_system_id; })[0];
                    projContacts.OrgName = thisOrgRes.OrganizationName;
                    projContacts.DivName = thisOrgRes.DivisionName;
                    projContacts.SecName = thisOrgRes.SectionName;
                    retur = projContacts;
                    $scope.projectForm.Contact.$setPristine(true);
                    toastr.success("Contact Updated");                    
                }, function error(errorResponse) {
                    toastr.error("Error: " + errorResponse.statusText);
                });
                return retur;
            }
            
            //ADD ORG MODAL CONTENT (Add New ORG NAME, DIVISION, OR SECTION)
            $scope.addNewOrg = function () {
                //modal
                var editingContact = null;
                if (this.c !== null) {
                    editingContact = this.c;
                }
                //pass array of chosen org/div so they will be prepopulated in modal
                var chosenparts = [];
                if ($scope.isEditing) {
                    //editing contact's org, pass their org id's to the modal for prepopulating
                    var orgId = editingContact.OrgName !== undefined ? $scope.allOrganizations.filter(function (o) { return o.organization_name == editingContact.OrgName; })[0].organization_id : 0;
                    var divId = editingContact.DivName !== undefined && editingContact.DivName !== "" ? $scope.allDivisions.filter(function (d) { return d.division_name == editingContact.DivName; })[0].division_id : 0;
                    var secId = editingContact.SecName !== undefined && editingContact.SecName !== "" ? $scope.allSections.filter(function (s) { return s.section_name == editingContact.SecName; })[0].section_id : 0;
                    chosenparts.push(orgId);
                    chosenparts.push(divId);
                    chosenparts.push(secId);
                } else {
                    chosenparts.push($scope.selectedOrgID);
                    chosenparts.push($scope.selectedDivID);
                    chosenparts.push($scope.selectedSecID);
                }

                var modalInstance = $uibModal.open({
                    templateUrl: 'AddOrganizationModal.html',
                    controller: 'AddOrgModalCtrl',
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false,
                    resolve: {
                        chosenParts: function () { return chosenparts; },
                        allOrgs: function () { return $scope.allOrganizations; },
                        allDivs: function () { return $scope.allDivisions; },
                        allSecs: function () { return $scope.allSections; }
                    }
                });
                modalInstance.result.then(function (updatedOrgDivSec) {
                    //make sure parent. are all updated
                    $scope.allOrganizations = updatedOrgDivSec[0]; //allOrgs updated
                    $scope.allDivisions = updatedOrgDivSec[1]; //allDivs updated
                    $scope.allSections = updatedOrgDivSec[2]; //allSecs updated

                    if ($scope.isEditing) {
                        //this is updating the existing contact's organization
                        var chosenOrgID = updatedOrgDivSec[3];
                        var chosenDivID = updatedOrgDivSec[4] !== "" ? updatedOrgDivSec[4] : 0;
                        var chosenSecID = updatedOrgDivSec[5] !== "" ? updatedOrgDivSec[5] : 0;

                        var thisContact = editingContact;
                        $scope.updatedContactOrg = true;

                        var i = $scope.ProjContacts.indexOf(thisContact);
                        //update this contact's binded org info
                        $scope.ProjContacts[i].OrgName = $scope.allOrganizations.filter(function (o) { return o.organization_id == chosenOrgID; })[0].organization_name;
                        $scope.ProjContacts[i].DivName = chosenDivID > 0 ? $scope.allDivisions.filter(function (o) { return o.division_id == chosenDivID; })[0].division_name : "";
                        $scope.ProjContacts[i].SecName = chosenSecID > 0 ? $scope.allSections.filter(function (o) { return o.section_id == chosenSecID; })[0].section_name : "";
                        var thisOrgRes = $scope.allOrgResources.filter(function (or) { return or.org_id == chosenOrgID && or.div_id == chosenDivID && or.sec_id == chosenSecID; })[0];
                        if (thisOrgRes !== undefined) {
                            //they didn't create a new one, just add the orgsysid to hidden input
                            $scope.ProjContacts[i].organization_system_id = thisOrgRes.organization_system_id;
                        } else {
                            //post the orgSys and then apply the id to hidden input
                            var newORGSYS = { org_id: chosenOrgID, div_id: chosenDivID, sec_id: chosenSecID };
                            ORGANIZATION_SYSTEM.save(newORGSYS, function success(response) {
                                var test;
                                //update the orgResourceList
                                var orgResToAdd = {
                                    organization_system_id: response.organization_system_id,
                                    org_id: response.org_id,
                                    OrganizationName: $scope.ProjContacts[i].OrgName,
                                    div_id: response.div_id,
                                    DivisionName: $scope.ProjContacts[i].DivName,
                                    sec_id: response.sec_id,
                                    SectionName: $scope.ProjContacts[i].SecName
                                };
                                $scope.allOrgResources.push(orgResToAdd);
                                $scope.ProjContacts[i].organization_system_id = response.organization_system_id;
                            }, function error(errorResponse) { toastr.error(errorResponse.statusText); }).$promise;

                        }

                    } else {
                        //new contact section
                        //set selected choices
                        $scope.selectedOrgID = updatedOrgDivSec[3];
                        //need to populate all divs before making one selected
                        if ($scope.selectedOrgID !== "")
                            $scope.alldivs = $scope.allDivisions.filter(function (d) { return d.org_id == $scope.selectedOrgID; });

                        $scope.selectedDivID = updatedOrgDivSec[4];

                        //need to populate all secs before making one selected
                        if ($scope.selectedDivID !== "")
                            $scope.allsecs = $scope.allSections.filter(function (s) { return s.div_id == $scope.selectedDivID; });

                        $scope.selectedSecID = updatedOrgDivSec[5];
                    }//end else (new contact)
                }, function () {
                    //logic to do on cancel
                });
                //end modal
            }; //end AddNewOrg

            $scope.RemoveContact = function (con) {
                //modal
                var modalInstance = $uibModal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        keyToRemove: function () {
                            return con;
                        },
                        what: function () {
                            return "Contact";
                        }
                    }
                });
                modalInstance.result.then(function (keyToRemove) {
                    //yes, remove this keyword
                    var index = $scope.ProjContacts.indexOf(con);
                    //put it back to a CONTACT
                    var aCONTACT = {
                        contact_id: con.contact_id,
                        name: con.name,
                        email: con.email,
                        phone: con.phone,
                        organization_system_id: con.organization_system_id,
                        science_base_id: con.science_base_id
                    };
                    //DELETE it
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('siGLCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                   // $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';

                    PROJECT.deleteProjContact({ id: thisProject.project_id, ContactId: aCONTACT.contact_id }, function success(response) {
                        $scope.ProjContacts.splice(index, 1);
                        $scope.contactCount.total = $scope.contactCount.total - 1;
                        //TODO: Make sure services are removing the organizationsystem object
                        toastr.success("Contact Removed");
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                   // delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                }, function () {
                    //logic for cancel
                });
                //end modal
            };

        }]);
})();
