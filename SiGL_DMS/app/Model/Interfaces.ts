interface IAppCookies {
    username: string;
}
interface IUser {
    username: string;
    password: string;
}

interface IContact {
    contactID: number;
    name: string;
    email: string;
    phone: string;
    organization: IOrganization;
    scienceBaseID: string;

}
interface IDataHost {
    dataHoseID: number;
    hostName: string;
    portalURL: string;
    project: IProject;
    description: string;
}
interface IDataHostList {
    dataHostList: Array<IDataHost>;
}
interface IDataManager {
    dataManagerID: number;
    username: string;
    fName: string;
    lName: string;
    organization: IOrganization;
    phone: string;
    email: string;
    role: IRole;
}
interface IFrequencyType {
    frequencyTypeID: number;
    frequency: string;
}
interface IFrequencyTypeList {
    frequencyList: Array<IFrequencyType>;
}
interface IKeyword {
    keywordID: number;
    term: string;
}
interface IKeywordList {
    keywordList: Array<IKeyword>;
}
interface ILakeType {
    lakeTypeID: number;
    lake: string;
}
interface ILakeTypeList {
    lakeList: Array<ILakeType>;
}
interface IMediaType {
    mediaTypeID: number;
    media: string;
}
interface IMediaTypeList {
    mediaList: Array<IMediaType>;
}
interface IObjectiveType {
    objectiveTypeID: number;
    objective: string;
}
interface IOrganization {
    organizationID: number;
    name: string;
    shortname: string;
    division: string;
    section: string;
    scienceBaseID: string;
}
interface IOrganizationList {
    organizationList: Array<IOrganization>;
}
interface IParameterType {
    parameterTypeID: number;
    parameter: string;
    parameterGroup: string;
}
interface IParameterTypeList {
    parameterList: Array<IParameterType>;
}
interface IProjDuration {
    projDurationID: number;
    durationValue: string;
}
interface IProjDurationList {
    projDurationList: Array<IProjDuration>;
}
interface IProjStatus {
    projStatusID: number;   
    statusValue: string;
}
interface IProjStatusList {
    projStatusList: Array<IProjStatus>;
}
interface IProject {
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
}
interface IProjectList {
    projectList: Array<IProject>;
}
interface IProjectCooperator {
    projectCooperatorID: number;
    project: IProject;
    organization: IOrganization;
}
interface IProjectKeyword {
    projectKeywordID: number;
    project: IProject;
    keyword: IKeyword;
}
interface IProjectObjective {
    projectObjectiveID: number;
    project: IProject;
    objective: IObjectiveType;
}
interface IProjectPublication {
    projectPublicationID: number;
    project: IProject;
    publication: IPublication;
}
interface IPublication {
    publicationID: number;
    title: string;
    url: string;
    citation: string;
    scienceBaseID: string;
    description: string;
}
interface IResourceType {
    resourceTypeID: number;
    resourceName: string;
}
interface IRole {
    roleID: number;
    roleName: string;
    roleDescription: string;
}
interface ISite {
    siteID: number;
    startDate: Date;
    endDate: Date;
    project: IProject;
    samplePlatform: string;
    additionalInfo: string;
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    waterbody: string;
    lakeType: ILakeType;
    country: string;
    state: string;
    watershed: string;
    url: string;
}
interface ISiteList {
    siteList: Array<ISite>;
}
interface ISiteFrequency {
    siteFrequencyID: number;
    site: ISite;
    frequencyType: IFrequencyType;
}
interface ISiteFrequencyList {
    siteFrequencyList: Array<ISiteFrequency>;
}
interface ISiteMedia {
    siteMediaID: number;
    site: ISite;
    mediaType: IMediaType;
}
interface ISiteMediaList {
    siteMediaList: Array<ISiteMedia>;
}
interface ISiteParameter {
    siteParameterID: number;
    site: ISite;
    parameterType: IParameterType;
}
interface ISiteParameterList {
    siteParameterList: Array<ISiteParameter>;
}
interface ISiteResource {
    siteResourceID: number;
    site: ISite;
    resourceType: IResourceType;
}
interface ISiteResourceList {
    siteResourceList: Array<ISiteResource>;
}
interface IStatusType {
    statusID: number;
    status: string;
}
