import { useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import { saveProject, deleteProject } from "../utility/ProjectUtilities";
import { Models, UtilityInterfaces } from "../utility/models";
import { listUserProjects} from "../utility/ProjectUtilities";
import { createProjectMap} from "../utility/ProjectUtilities";
import { SaveLoadProps } from "./ModalInterfaces";
import { getLatestProjectID } from "../utility/ProjectUtilities";
import { TextField } from "./ModalUtil.tsx";
import '../styles/Modals.css';

  export const SaveLoad = ({ isOpen, setIsOpen, setIsWizardOpen, projectState, parameterMap, onLoad, userIDstate}: SaveLoadProps) => {
    const [selectedButton, setSelectedButton] = useState(-1);
    const [projects, setProjects] = projectState;
    const [projectList, setProjectList] = useState(constructProjectList());
    const [userID] = userIDstate;
    console.log("Projects: " + projects);
    async function save(){
      const renameProjectInput: HTMLInputElement|null = document.querySelector("#rename_project");
      if(renameProjectInput && renameProjectInput.value != ""){
        const nameParam: UtilityInterfaces.Parameter = {
          name: "project_name",
          type: UtilityInterfaces.types.STRING,
          value: renameProjectInput.value
        }
        parameterMap.set("project_name", nameParam)
      }     
      await saveProject(userID, parameterMap);
      console.log("Finished Saving Project");
      setProjects(await listUserProjects(userID));
      setProjectList(constructProjectList()); 
      if(parameterMap.get("project_id")?.value == 0){
        const id = await getLatestProjectID(userID);
        if(id){
          const parameter: UtilityInterfaces.Parameter = {
            name:"id",
            type: UtilityInterfaces.types.INT,
            value: id
        }
          parameterMap.set("project_id", parameter);
        }       
      }
      setIsOpen(false);   
    }
    async function loadProject(){
      console.log("Loading Project " + selectedButton);
      parameterMap = await createProjectMap(userID, selectedButton);
      console.log(parameterMap);
      onLoad(parameterMap);
      setIsOpen(false);
    }
    async function tryToDelete(){
      await deleteProject(userID, selectedButton);
      setProjects(await listUserProjects(userID));
      setIsOpen(false);
    }
    function clickedProjectButton(project_id: number){
      document.getElementById("open_project_button")?.removeAttribute("disabled");
      document.getElementById("delete_project_button")?.removeAttribute("disabled");
      setSelectedButton(project_id);
    }
    function constructProjectList(){
      projects.sort((a:Models.ProjectBase, b:Models.ProjectBase) => 
        new Date(b.last_modified_date).getTime() - new Date(a.last_modified_date).getTime());
      const projectList = projects.map(project => <li
        key = {project.project_id}>
        <button id={"pb_" + project.project_id} onClick={() => clickedProjectButton(project.project_id)}>{project.project_name}</button>
      </li>)
      return projectList;
    }
    
    if (!isOpen){ return null}
    let projectName = parameterMap.get("project_name")?.value;
    if(typeof(projectName) != "string"){
      projectName = "Default Name";
    }
    
    return (
      <>
        <div className= "darkBG" onClick={() => setIsOpen(false)} />
        <div className= "centered">
          <div className= "modal">
            <div className= "modalHeader">
              <h2 className= "heading">Projects</h2>
            </div>
            <button className= "closeBtn" onClick={() => setIsOpen(false)}>
              <RiCloseLine style={{ marginBottom: "-3px" }} />
            </button>
            <div id="save_modal_content" className= "modalContent">
              <input id="rename_project" type="text" placeholder={projectName}></input>
            <button onClick={save}>Save Project</button>
            <button onClick={() => setIsWizardOpen(true)}>
              New Project
            </button>
              <div className = 'scrollable-container'>
                {projectList}
              </div>
            </div>
            <div className= "modalActions">
              <div className= "actionsContainer">
                <button id="delete_project_button" className= "deleteBtn" onClick={() => {tryToDelete()}}>
                  Delete
                </button>
                <button id="open_project_button" className= "openBtn" onClick={() => loadProject()}>
                  Open
                </button>
                <button
                  className= "cancelBtn"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
    
  };