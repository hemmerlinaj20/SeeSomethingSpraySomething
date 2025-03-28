import { useState, useEffect} from "react";
import { RiCloseLine } from "react-icons/ri";
import { saveProject, deleteProject } from "../utility/ProjectUtilities";
import { Models, UtilityInterfaces } from "../utility/models";
import { listUserProjects} from "../utility/ProjectUtilities";
import { createProjectMap} from "../utility/ProjectUtilities";
import { SaveLoadProps } from "./ModalInterfaces";
import { getLatestProjectID } from "../utility/ProjectUtilities";
import '../styles/Modals.css';


  export const SaveLoad = ({ isOpen, setIsOpen, projectState, parameterMap, onLoad, userIDstate}: SaveLoadProps) => {
    const [selectedButton, setSelectedButton] = useState(-1);
    const [projects, setProjects] = projectState;
    const [projectList, setProjectList] = useState(constructProjectList());
    const [userID] = userIDstate;

    useEffect(() => {
      if(parameterMap.get("project_id")?.value == 0){
        document.getElementById("saves_save_button_save")?.setAttribute("disabled", "active");
      }
      if(userID == 1){
        for(const e of document.getElementsByClassName("saves_save_button")){
          e.setAttribute("hidden", "active");
        }
        document.getElementById("saves_sign_in_message")?.removeAttribute("hidden");
      }
      const projectButtons = document.getElementsByClassName("saves_project_button");
      for(const button of projectButtons){
        button.addEventListener("blur", deselectProjectButton);
      }
    });      
    
    async function save(copy:boolean){
      const renameProjectInput: HTMLInputElement|null = document.querySelector("#rename_project");
      if(renameProjectInput && renameProjectInput.value != ""){
        const nameParam: UtilityInterfaces.Parameter = {
          name: "project_name",
          type: UtilityInterfaces.types.STRING,
          value: renameProjectInput.value
        }
        parameterMap.set("project_name", nameParam)
      }     
      await saveProject(userID, parameterMap, copy);
      console.log("Finished Saving Project");
      setProjects(await listUserProjects(userID));
      setProjectList(constructProjectList()); 
      if(parameterMap.get("project_id")?.value == 0 || copy){
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
      if(selectedButton === -1){
        return;
      }
      console.log("Loading Project " + selectedButton);
      parameterMap = await createProjectMap(userID, selectedButton);
      console.log(parameterMap);
      onLoad(parameterMap);
      setIsOpen(false);
    }
    async function tryToDelete(){
      if(selectedButton === -1){
        return;
      }
      await deleteProject(userID, selectedButton);
      setProjects(await listUserProjects(userID));
      setIsOpen(false);
    }
    function clickedProjectButton(project_id: number){
      document.getElementById("open_project_button")?.removeAttribute("disabled");
      document.getElementById("open_project_button")?.classList.remove("saves_open_inactive");
      document.getElementById("delete_project_button")?.removeAttribute("disabled");
      document.getElementById("delete_project_button")?.classList.remove("saves_delete_inactive");
      for(const e of document.getElementsByClassName("saves_project_button")){
        e.classList.remove("saves_selected_project");
      }
      setSelectedButton(project_id);
      document.getElementById("pb_" + project_id)?.classList.add("saves_selected_project");
    }

    function deselectProjectButton(event: MouseEvent){
      const button = document.getElementById("open_project_button");
      const button2 = document.getElementById("delete_project_button");
      if(event.relatedTarget !== button && event.relatedTarget !== button2){
        document.getElementById("open_project_button")?.setAttribute("disabled", "active");
        document.getElementById("open_project_button")?.classList.add("saves_open_inactive");
        document.getElementById("delete_project_button")?.setAttribute("disabled", "active");
        document.getElementById("delete_project_button")?.classList.add("saves_delete_inactive");
      for(const e of document.getElementsByClassName("saves_project_button")){
        e.classList.remove("saves_selected_project");
      }
      setSelectedButton(-1);
      }   
    }

    function constructProjectList(){
      projects.sort((a:Models.ProjectBase, b:Models.ProjectBase) => 
        new Date(b.last_modified_date).getTime() - new Date(a.last_modified_date).getTime());
      const projectList = projects.map(project => <li
        key = {project.project_id}>
        <button className="saves_project_button" id={"pb_" + project.project_id} onClick={() => clickedProjectButton(project.project_id)} >{project.project_name}</button>
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
            <div className= "save_load_header">
              <h2 className= "heading">Currently Editing: </h2>
              <input id="rename_project" type="text" placeholder={projectName}></input>
            </div>
            <button className= "closeBtn" onClick={() => setIsOpen(false)}>
              <RiCloseLine style={{ marginBottom: "-3px" }} />
            </button>    
            <div id="save_modal_content" className= "modalContent">              
            <button id = "saves_save_button_save" className = "saves_save_button" onClick={() => save(false)}>Save Project</button>
            <button id = "saves_save_button_copy" className = "saves_save_button" onClick={() => save(true)}>Save as Copy</button>
            <button id = "saves_save_button_new" className = "saves_save_button">Create New Project</button>
            <p id = "saves_sign_in_message" hidden>Please Sign in to Save Projects!</p>
              <div id = 'saves_container'>
                <h3>My Saved Projects:</h3>
                {projectList}
              </div>
            </div>
            <div className= "modalActions">
              <div className= "actionsContainer">
                <button id="delete_project_button" className= "deleteBtn saves_delete_inactive" onClick={() => {tryToDelete()}}>
                  Delete
                </button>
                <button id="open_project_button" className= "saveBtn saves_open_inactive" onClick={() => loadProject()}>
                  Open
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
    
  };