import axios from "axios";
import {Models} from './models.ts'
import {UtilityInterfaces} from './models.ts'
import {ParameterConstraints} from './ParameterConstraints.ts'

//Async function that constructs a map with project data
export async function createProjectMap(userID: number, projectID: number){
    //Partial lets us use an interface without explicitly setting the values
    //Shouldn't be used if you need to use a lot of those values, but since we
    //only have to check if user.projects is occupied (which we would do anyways)
    //this is fine.
    const user: Partial<Models.User> = await getUser(userID);
    const parameterMap = new Map();

    //Make sure the project actually exists
    if(user.projects && user.projects?.length > 0 && user.projects.filter((project) => project.project_id === projectID).length > 0){
        const project = user.projects.filter((project) => project.project_id === projectID)[0];       
        //unpack all of the other interfaces(nozzle, gun, etc.) and store
        //their parameters as simple values
        Object.entries(project).map(entry => constructMapEntry(entry, parameterMap))
        const nozzle = project.nozzle;
        Object.entries(nozzle).map(entry => constructMapEntry(entry, parameterMap))
        const controller = project.controller;
        Object.entries(controller).map(entry => constructMapEntry(entry, parameterMap))
        const gun = project.gun;
        Object.entries(gun).map(entry => constructMapEntry(entry, parameterMap))
        //Remove the interface parameters since we unpacked their contents
        parameterMap.delete('controller');
        parameterMap.delete('nozzle');
        parameterMap.delete('gun');
    }
    else{
        //If the user is trying to open a project that doesn't exist, just
        //open the default one instead
        return await createProjectMap(1, 0);
    }
    return parameterMap;
}

async function getUser(userID: number){
    let user: Partial<Models.User> = {}
    await axios.get(`${__BACKEND_URL__}/api/v1/users/${userID}/`)
        .then(response => {
            user = <Models.User> response.data.user;
        })
        .catch(error => console.error(error)); 
    return user;  
}

//Construct a Parameter object with the entry from the database, 
//and append to the parameterMap
function constructMapEntry(entry:[string, string|number], parameterMap: Map<string, UtilityInterfaces.Parameter>){
    const parameterConstraints = ParameterConstraints.Instance.constraintMap;
    const key = entry[0];
    const value = entry[1];
    let type: UtilityInterfaces.types;
    let min = null;
    let max = null;
    if(typeof value === "number"){
        //Determine whether the number is an integer or decimal.
        //Currently not used for anything but we should add step values for
        //float input fields.
        if(Number.isInteger(value)){
            type = UtilityInterfaces.types.INT;
        }
        else{
            type = UtilityInterfaces.types.FLOAT;
        }
        //Set the min and the max if this parameter has them
        const constraintKey = parameterConstraints.get(key);
        if(constraintKey){
            min = constraintKey[0];
            max = constraintKey[1];
        }          
    }
    else{
        type = UtilityInterfaces.types.STRING;
    }
    //Construct parameter differently depending on if there's a min and max.
    //Probably a better way to do this lol.
    if(min!==null && max!==null){
        const parameter: UtilityInterfaces.Parameter = {
            name:key,
            type: type,
            value: value,
            min: min,
            max: max
        }
        parameterMap.set(key, parameter);
    }
    else{
        const parameter: UtilityInterfaces.Parameter = {
            name:key,
            type: type,
            value: value
        }
        parameterMap.set(key, parameter);
    }
    return parameterMap;               
}

export async function createNozzleArray(): Promise<string[]> {
    try {
    const response = await axios.get(`${__BACKEND_URL__}/api/v1/nozzles/`)
    return response.data.nozzles.map((U:Models.Nozzle) => U.nozzle_name)
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function createControllerArray(): Promise<string[]> {
    try {
    const response = await axios.get(`${__BACKEND_URL__}/api/v1/controllers/`)
    return response.data.controllers.map((U:Models.Controller) => U.controller_name)
    } catch (error) {
        console.error(error);
        return [];
    }
}

//Takes the current parameters and saves it in your projects folder
//with the first unused ID
export async function saveProject(userID: number, project: Map<string, UtilityInterfaces.Parameter>|undefined){
    await post_new_project_to_url(project, `${__BACKEND_URL__}/api/v1/users/${userID}/new`)
}

//pushes the current project into the recent_runs array
export async function pushRunToDatabase(userID: number, project: Map<string, UtilityInterfaces.Parameter>|undefined){
    post_new_project_to_url(project, `${__BACKEND_URL__}/api/v1/users/${userID}/run`)
}

async function post_new_project_to_url(project: Map<string, UtilityInterfaces.Parameter>|undefined, url:string){
    if(!project){
        return;
    }
    const newProject = createProjectFromMap(project);
    //Only going to be undefined if an exception was thrown
    if(newProject !== undefined){
        newProject.last_modified_date = new Date();
        //Backend handles determining whether we're overwriting something
        //or saving something new. Everything gets posted to the same url though.
        await axios.post(url,{
            data:newProject,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            console.log(response);
          })
          .catch(function (error) {
            console.log(error);
          });
    }
}

//For easier logging if a key of the parameterMap doesn't exist for some reason
export function getOrException(map: Map<string, UtilityInterfaces.Parameter>, key: string): UtilityInterfaces.Parameter{
    const possibleReturn = map.get(key);
    if(possibleReturn !== undefined){
        return possibleReturn;
    }
    else{
        throw new ReferenceError("Value for parameter \"" + key + "\" is undefined");
    }
}

//Literally disguisting function that creates objects containing every parameter in
//the project. Cannot iterate over Object.keys because I am dumb and made the Models
//interfaces. Should really be refactored at some point.
function createProjectFromMap(project: Map<string, UtilityInterfaces.Parameter>): Models.Project|undefined{
    try{
    const lmd: Date = new Date(getOrException(project, 'last_modified_date').value)
    const nozzle: Models.Nozzle = {
        nozzle_id: Number(getOrException(project, 'nozzle_id').value),
        nozzle_name: String(getOrException(project, "nozzle_name").value),
        nozzle_doc_link: String(getOrException(project, 'nozzle_doc_link').value),
        flow_rate: Number(getOrException(project, 'flow_rate').value),
        spray_angle: Number(getOrException(project, 'spray_angle').value),
        spray_shape: String(getOrException(project, 'spray_shape').value),
        alignment: Number(getOrException(project, 'alignment').value)
    }
    const gun: Models.Gun = {
        gun_id: Number(getOrException(project, 'gun_id').value),
        gun_name: String(getOrException(project, 'gun_name').value),
        max_frequency: Number(getOrException(project, 'max_frequency').value)  
    }
    const controller: Models.Controller = {
        controller_id: Number(getOrException(project, 'controller_id').value),
        controller_name: String(getOrException(project, 'controller_name').value),
        controller_doc_link: String(getOrException(project, 'controller_doc_link').value)
    }
    const newProject: Models.Project = {
        project_id: Number(getOrException(project, "project_id").value),
        owner_id: Number(getOrException(project, 'owner_id').value),
        project_name: String(getOrException(project, 'project_name').value),
        project_description: String(getOrException(project, 'project_description').value),
        last_modified_date: lmd,
        line_speed: Number(getOrException(project, 'line_speed').value),
        line_width: Number(getOrException(project, 'line_width').value),
        sensor_distance: Number(getOrException(project, 'sensor_distance').value),
        product_width: Number(getOrException(project, 'product_width').value),
        product_length: Number(getOrException(project, 'product_length').value),
        product_height: Number(getOrException(project, 'product_height').value),
        nozzle_count: Number(getOrException(project, 'nozzle_count').value),
        nozzle_spacing: Number(getOrException(project, 'nozzle_spacing').value),
        nozzle_height: Number(getOrException(project, 'nozzle_height').value),
        fluid_pressure: Number(getOrException(project, 'fluid_pressure').value),
        duty_cycle: Number(getOrException(project, 'duty_cycle').value),
        start_delay: Number(getOrException(project, 'start_delay').value),
        stop_delay: Number(getOrException(project, 'stop_delay').value),
        spray_duration: Number(getOrException(project, 'spray_duration').value),
        nozzle: nozzle,
        gun: gun,
        controller: controller
    }
    return newProject;
    } catch(error){
        console.log("One or more parameters was undefined");
        console.log(error);
    }
}

//Get a list of basic info of projects for the Save/Load Modal
export async function listUserProjects(userID: number){
    const user: Partial<Models.User> = await getUser(userID);
    //projectList contains an array of only the project info we need for the S/L Modal
    const projectList = Array<Models.ProjectBase>();
    if(user.projects){
        for(const project of user.projects){
            const partProject: Models.ProjectBase = {
                project_id: project['project_id'],
                owner_id: userID,
                project_name: project['project_name'],
                last_modified_date: project['last_modified_date']
            }
            projectList.push(partProject);
        }
    }
    return projectList;
}

export async function deleteProject(user_id: number, project_id: number){
    await axios.post(`${__BACKEND_URL__}/api/v1/users/${user_id}/${project_id}/delete`)
        .catch(error => console.error(error));
}

export async function resetPassword(user_id: string){
    await axios.post(`${__BACKEND_URL__}/api/v1/users/${user_id}/reset`)
        .catch(error => console.error(error));
}

export async function getLatestProjectID(userID : number){
    let user: Partial<Models.User> = {};
    await axios.get(`${__BACKEND_URL__}/api/v1/users/${userID}/`)
        .then(response => {
            user = <Models.User> response.data.user;
        })
        .catch(error => console.error(error));
    if(user.projects){
        return user.projects[user.projects.length-1].project_id;
    }
}



export function encodeHTML(str: string): string{
    return str.replace(/[&<>"']/g, (match) => {
        switch (match) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return match;
        }
    });
}


