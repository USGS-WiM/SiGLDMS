//------------------------------------------------------------------------------
//----- Project ---------------------------------------------------------------
//------------------------------------------------------------------------------
//-------1---------2---------3---------4---------5---------6---------7---------8
//       01234567890123456789012345678901234567890123456789012345678901234567890
//-------+---------+---------+---------+---------+---------+---------+---------+
// copyright:   2015 WiM - USGS
//    authors:  Jeremy K. Newson USGS Wisconsin Internet Mapping
//              Tonia Roddick USGS Wisconsin Internet Mapping
// 
//   purpose:  
//          
//discussion:
//
//Comments
//04.10.2015 tr - Created
// Interface
var SiGL;
(function (SiGL) {
    var app;
    (function (app) {
        var Models;
        (function (Models) {
            var Project = (function () {
                // Constructor
                function Project() {
                } //end constructor
                return Project;
            })();
            Models.Project = Project; //end class
        })(Models = app.Models || (app.Models = {}));
    })(app = SiGL.app || (SiGL.app = {}));
})(SiGL || (SiGL = {})); //end module
//# sourceMappingURL=Project.js.map