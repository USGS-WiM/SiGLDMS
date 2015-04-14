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
module SiGL.app.Models {
    export class Project implements IProject {
        //Properties
        projectID: number;
        name: string;
        startDate: Date;
        endDate: Date;
        url: string;
        additionalInfo: string;
        dataManager: IDataManager;
        scienceBaseID: string;
        description: string;
        projectStatus: IProjStatus;
        projectDuration: IProjDuration;


        // Constructor
        constructor() {
            
        }//end constructor

    }//end class
}//end module
