import { useState, useEffect} from "react";
import { RiCloseLine } from "react-icons/ri";
import { saveProject, deleteProject } from "../utility/ProjectUtilities";
import { Models, UtilityInterfaces } from "../utility/models";
import { listUserProjects} from "../utility/ProjectUtilities";
import { createProjectMap} from "../utility/ProjectUtilities";
import { SaveLoadProps } from "./ModalInterfaces";
import { getLatestProjectID } from "../utility/ProjectUtilities";
import { TextBox } from "./TextBoxModal";
import '../styles/Modals.css';


  export const SaveLoad = ({ isOpen, setIsOpen, setIsWizardOpen, setIsLoading, projectState, parameterMap, onLoad, userIDstate}: SaveLoadProps) => {
    const [selectedButton, setSelectedButton] = useState(-1);
    const [projects, setProjects] = projectState;
    const [projectList, setProjectList] = useState(constructProjectList());
    const [userID] = userIDstate;
    const [isTextBoxOpen, setTextBoxOpen] = useState(false);
    const [isDescriptionTextBoxOpen, setDescriptionTextBoxOpen] = useState(false);

    useEffect(() => {
      if(userID == 1){
        for(const e of document.getElementsByClassName("saves_save_button")){
          e.setAttribute("hidden", "active");
        }
        document.getElementById("saves_save_button_copy")?.setAttribute("hidden", "active");
        document.getElementById("saves_sign_in_message")?.removeAttribute("hidden");
        document.getElementById("delete_project_button")?.setAttribute("hidden", "active");
        document.getElementById("saves_save_button_description")?.setAttribute("hidden", "active");
      }
      const projectButtons = document.getElementsByClassName("saves_project_button");
      for(const button of projectButtons){
        button.addEventListener("blur", (e) =>  {deselectProjectButton(e as MouseEvent)});
      }
      const currentElement = "pb_" + parameterMap.get("project_id")?.value;
      const curProjButton = document.getElementById(currentElement);
      if(curProjButton != null){
        const currentProjectButton = curProjButton;
        currentProjectButton.textContent = currentProjectButton.textContent + " (Currently Open)";
        currentProjectButton.style.backgroundColor ="rgb(233, 236, 222)";
      }     
    }, []);
    
    async function duplicateAndOpen(){
      setIsLoading(true);
      if(selectedButton === -1){
        setIsLoading(false);
        return;
      }
      parameterMap = await createProjectMap(userID, selectedButton);
      const nameParam: UtilityInterfaces.Parameter = {
        name: "project_name",
        type: UtilityInterfaces.types.STRING,
        value: "Copy of " + parameterMap.get("project_name")?.value
      }
      parameterMap.set("project_name", nameParam);
      await saveProject(userID, parameterMap, true); 
      const id = await getLatestProjectID(userID);
        if(id){
          const parameter: UtilityInterfaces.Parameter = {
            name:"id",
            type: UtilityInterfaces.types.INT,
            value: id
        }
          parameterMap.set("project_id", parameter);
        }       
      setProjects(await listUserProjects(userID));
      setProjectList(constructProjectList());
      loadProject(Number(parameterMap.get("project_id")?.value));
      setIsLoading(false);
      setIsOpen(false);   
    }
    
    async function save(){
      setIsLoading(true);
      let copy = false;
      if(parameterMap.get("project_id")?.value == 0){
        copy = true;
      }     
      await saveProject(userID, parameterMap, copy);
      console.log("Finished Saving Project");
      setProjects(await listUserProjects(userID));
      setProjectList(constructProjectList()); 
      if(copy){
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
      setIsLoading(false);
      setIsOpen(false);   
    }
    async function loadProject(id=selectedButton){
      if(selectedButton === -1){
        return;
      }
      setIsLoading(true);
      console.log("Loading Project " + id);
      parameterMap = await createProjectMap(userID, id);
      console.log(parameterMap);
      onLoad(parameterMap);
      setIsLoading(false);
      setIsOpen(false);
    }
    async function tryToDelete(){
      if(selectedButton === -1){
        return;
      }
      setIsLoading(true);
      await deleteProject(userID, selectedButton);
      setProjects(await listUserProjects(userID));
      setIsLoading(false);
      setIsOpen(false);
    }
    function clickedProjectButton(project_id: number){
      document.getElementById("open_project_button")?.removeAttribute("disabled");
      document.getElementById("open_project_button")?.classList.remove("saves_open_inactive");
      document.getElementById("delete_project_button")?.removeAttribute("disabled");
      document.getElementById("delete_project_button")?.classList.remove("saves_delete_inactive");
      document.getElementById("saves_save_button_copy")?.removeAttribute("disabled");
      document.getElementById("saves_save_button_copy")?.classList.remove("saves_open_inactive");
      document.getElementById("saves_save_button_description")?.removeAttribute("disabled");
      document.getElementById("saves_save_button_description")?.classList.remove("saves_open_inactive");
      for(const e of document.getElementsByClassName("saves_project_button")){
        e.classList.remove("saves_selected_project");
      }
      setSelectedButton(project_id);
      document.getElementById("pb_" + project_id)?.classList.add("saves_selected_project");
    }

    function deselectProjectButton(event: MouseEvent){
      const button = document.getElementById("open_project_button");
      const button2 = document.getElementById("delete_project_button");
      const button3 = document.getElementById("saves_save_button_copy");
      const button4 = document.getElementById("saves_save_button_description");
      if(event.relatedTarget !== button && event.relatedTarget !== button2 && event.relatedTarget !== button3 && event.relatedTarget !== button4){
        document.getElementById("open_project_button")?.setAttribute("disabled", "active");
        document.getElementById("open_project_button")?.classList.add("saves_open_inactive");
        document.getElementById("delete_project_button")?.setAttribute("disabled", "active");
        document.getElementById("delete_project_button")?.classList.add("saves_delete_inactive");
        document.getElementById("saves_save_button_copy")?.setAttribute("disabled", "active");
        document.getElementById("saves_save_button_copy")?.classList.add("saves_open_inactive");
        document.getElementById("saves_save_button_description")?.setAttribute("disabled", "active");
        document.getElementById("saves_save_button_description")?.classList.add("saves_open_inactive");
      for(const e of document.getElementsByClassName("saves_project_button")){
        e.classList.remove("saves_selected_project");
      }
      setSelectedButton(-1);
      }   
    }

    function tryChangeDescription(){
      if(selectedButton != -1){
        setDescriptionTextBoxOpen(true)
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
    
    let projectName = parameterMap.get("project_name")?.value;
    if(typeof(projectName) != "string"){
      projectName = "Default Name";
    }

    if(isTextBoxOpen){
      const currentName = String(parameterMap.get("project_name")?.value);
      return(
        <div className="textbox">
          <TextBox isOpen={isTextBoxOpen} setIsOpen={setTextBoxOpen} title={"rename"} current={currentName} setIsParentOpen={setIsOpen} parameterMap={parameterMap} userID={userID} selectedButton={selectedButton}/>
        </div>
      );
    }
    else if(isDescriptionTextBoxOpen){
      return(
        <div className="textbox">
          <TextBox isOpen={isDescriptionTextBoxOpen} setIsOpen={setDescriptionTextBoxOpen} title={"description"} current = {"Default Description"}setIsParentOpen={setIsOpen} parameterMap={parameterMap} userID={userID} selectedButton={selectedButton}/>
        </div>
      );
    }

    
    else if(!isOpen){ return null}
    return (
      <>
        <div className= "darkBG" onClick={() => setIsOpen(false)} />
        <div className= "centered">
          <div className= "modal saveLoad">
            <div className= "save_load_header">
              <h2 className= "heading">Currently Open: {projectName}</h2>
              <button id="rename_project" className="saves_save_button" onClick={() => {setTextBoxOpen(true)}}>Rename</button>
            </div>
            <button className= "closeBtn" onClick={() => setIsOpen(false)}>
              <RiCloseLine style={{ marginBottom: "-3px" }} />
            </button>    
            <div id="save_modal_content" className= "modalContent">              
            <button id = "saves_save_button_save" className = "saves_save_button" onClick={() => save()}>Save Current Project</button>
            <button id = "saves_save_button_new" className = "saves_save_button" onClick={() => setIsWizardOpen(true)}>Create New Project</button>
            <p id = "saves_sign_in_message" hidden>Please Sign in to Save Projects!</p>
              <div id = 'saves_container'>
                <h3>My Saved Projects:</h3>
                {projectList}
              </div>
            </div>
            <div className= "modalActions">
              <div className= "actionsContainer save_actions_container">
                <button id="delete_project_button" className= "deleteBtn saves_delete_inactive" onClick={() => {tryToDelete()}}>
                  Delete
                </button>
                <button id="open_project_button" className= "saveBtn saves_open_inactive" onClick={() => loadProject()}>
                  Open
                </button>
                <button id = "saves_save_button_copy" className = "saveBtn saves_duplicate_button saves_open_inactive" onClick={() => duplicateAndOpen()}>Duplicate and Open</button>
                <button id = "saves_save_button_description" className = "saveBtn saves_open_inactive" onClick={() => {tryChangeDescription()}}>View Description</button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
    
  };