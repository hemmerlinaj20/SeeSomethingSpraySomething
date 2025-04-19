import { useState, useEffect } from "react";
import { RiCloseLine } from "react-icons/ri";
import { saveProject } from "../utility/ProjectUtilities";
import { UtilityInterfaces } from "../utility/models";
import { listUserProjects} from "../utility/ProjectUtilities";
import { createProjectMap} from "../utility/ProjectUtilities";
import { WizardProps } from "./ModalInterfaces";
import { Dropdown } from './ModalUtil.tsx';
import { sprayAngleOptions, nozzleNumberOptions } from '../Parameter.tsx';
import '../styles/Modals.css';
import { updateParamsAndRerender } from "../utility/updateParamsAndRerender.ts";

  export const Wizard = ({ isOpen, setIsOpen, setIsSaveLoadOpen, setIsLoading, updateMap, projectState, parameterMap, userIDstate}: WizardProps) => {
    const [selectedNozzleNum, setSelectedNozzleNum] = useState<string>("1");
    const [selectedSprayAngle, setSelectedSprayAngle] = useState<string>("110");
    const [_projects, setProjects] = projectState;
    const [userID] = userIDstate;
    const [imagesrc, setImageSrc] = useState<string>("");

    useEffect(() => {
      if(selectedNozzleNum && selectedSprayAngle){
        setImageSrc(`src/assets/wizard/${selectedNozzleNum}-${selectedSprayAngle}.png`)
      }
      else if (selectedNozzleNum){
        setImageSrc(`src/assets/wizard/${selectedNozzleNum}-110.png`)
      } 
      else if (selectedSprayAngle){
        setImageSrc(`src/assets/wizard/1-${selectedSprayAngle}.png`)
      }
      else {
        setImageSrc(`src/assets/wizard/1-110.png`)
      }
    })

    async function wizardSave(){
      setIsLoading(true);
      setIsSaveLoadOpen(false);
      const parameterMap = await createProjectMap(1,0)
      const renameProjectInput: HTMLInputElement|null = document.querySelector("#name_new_proj");
      if(renameProjectInput && renameProjectInput.value != ""){
        const nameParam: UtilityInterfaces.Parameter = {
          name: "project_name",
          type: UtilityInterfaces.types.STRING,
          value: renameProjectInput.value
        }
        parameterMap.set("project_name", nameParam)
      }
      const NOZZLENUM: UtilityInterfaces.Parameter = {
        name: "nozzle_count",
        type: UtilityInterfaces.types.INT,
        value: selectedNozzleNum
    }
      parameterMap.set("nozzle_count", NOZZLENUM);
      const SPRAYANGLE: UtilityInterfaces.Parameter = {
        name: "spray_angle",
        type: UtilityInterfaces.types.INT,
        value: selectedSprayAngle
    }
      parameterMap.set("spray_angle", SPRAYANGLE);
      await saveProject(userID, parameterMap, true); 
      setProjects(await listUserProjects(userID));
      updateParamsAndRerender(parameterMap, updateMap)
      setIsOpen(false);
      setIsLoading(false);
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
                  <input id="name_new_proj" type="text" placeholder={projectName}></input>
                    <button onClick={() => wizardSave() }>Open project</button>
              </div>
                <div className= "modalActions">
                  <div className= "actionsContainer">
                    Number of Nozzles
                      <Dropdown options={nozzleNumberOptions} currentSelected={"1"} onChange={(value) => setSelectedNozzleNum(value)}/>
                  </div>
                  <div className= "actionsContainer">
                    Spray Angle
                      <Dropdown options={sprayAngleOptions} currentSelected={"110"} onChange={(value) => setSelectedSprayAngle(value)}/>
                  </div>
                  {imagesrc && <img src = {imagesrc} alt = "ProjectConfiguration" width = "" height = ""/>}
              </div>
            </div>
          </div>
      </>
       );
    };