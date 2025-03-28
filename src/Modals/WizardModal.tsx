import { useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import { saveProject, deleteProject } from "../utility/ProjectUtilities";
import { Models, UtilityInterfaces } from "../utility/models";
import { listUserProjects} from "../utility/ProjectUtilities";
import { createProjectMap} from "../utility/ProjectUtilities";
import { SaveLoadProps, Option } from "./ModalInterfaces";
import { TextField, Dropdown } from './ModalUtil.tsx';
import { NozzleNumber } from "../Parameter.tsx";
import '../styles/Modals.css';

  export const Wizard = ({ isOpen, setIsOpen, projectState, parameterMap, onLoad, userIDstate}: SaveLoadProps) => {
    const [selectedController, setSelectedController] = useState<string>("");
    const [controllerOptions, setControllerOptions] = useState<Option[]>([]);
    const [selectedNozzleNum, setSelectedNozzleNum] = useState<string>("");
    const [nozzleNumOptions, setNozzleNumOptions] = useState<Option[]>([]);
    const [selectedSprayAngle, setSelectedSprayAngle] = useState<string>("");
    const [sprayAngleOptions, setSprayAngleOptions] = useState<Option[]>([]);
    const [selectedButton, setSelectedButton] = useState(-1);
    const [projects, setProjects] = projectState;
    const [userID] = userIDstate;
    console.log("Projects: " + projects);
    async function save(){
      const renameProjectInput: HTMLInputElement|null = document.querySelector("#rename_project");
      if(renameProjectInput){
        const nameParam: UtilityInterfaces.Parameter = {
          name: "project_name",
          type: UtilityInterfaces.types.STRING,
          value: renameProjectInput.value
        }
        parameterMap.set("project_name", nameParam)
      }
      setIsOpen(false);
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
                <h2 className= "heading">Project Template</h2>
              </div>
                <button className= "closeBtn" onClick={() => setIsOpen(false)}>
                  <RiCloseLine style={{ marginBottom: "-3px" }} />
                </button>
              <div id="save_modal_content" className= "modalContent">
                  <input id="rename_project" type="text" placeholder={projectName}></input>
                    <button onClick={save}>Open project</button>
              </div>
                <div className= "modalActions">
                  <div className= "actionsContainer">
                    Number of Nozzles
                      <Dropdown options={nozzleNumOptions} onChange={(value) => setSelectedNozzleNum(value)}/>
                    Spray Angle
                      <Dropdown options={sprayAngleOptions} onChange={(value) => setSelectedSprayAngle(value)}/>
                    Controller
                      <Dropdown options={controllerOptions} onChange={(value) => setSelectedController(value)}/>
                    </div>
              </div>
            </div>
          </div>
      </>
       );
    };