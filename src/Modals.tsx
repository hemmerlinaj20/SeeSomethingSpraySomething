import React, { useState, useEffect } from "react";
import './styles/Modals.css';
import { RiCloseLine } from "react-icons/ri";
import { Models, UtilityInterfaces } from "./utility/models";
import { login, logout, UserInfoResponse } from "./utility/auth_requests";
import { saveProject, deleteProject, resetPassword} from "./utility/ProjectUtilities";
import { createProjectMap} from "./utility/ProjectUtilities";
import { createNozzleArray, createControllerArray, listUserProjects} from "./utility/ProjectUtilities";
import "./App.tsx";
import { AccountModalProps } from "./Modals/ModalInterfaces.tsx";

let paraNames: string[] = [
  "Duty Cycle", "Fluid Pressure", "Last Modified", "Line Speed", "Line Width", 
  "Nozzle Count", "Nozzle Height", "Nozzle Spacing", "Owner ID", 
  "Product Height", "Product Length", "Product Width", 
  "Project Description", "Project ID", "Project Name",
  "Sensor Distance", "Spray Duration", "Start Delay", "Stop Delay", "Angle", "Flow Rate",
  "Nozz Doc Link",  "Nozzle ID", "Nozzle Name", "Spray Angle", "Allignment",
  "Controller Doc Link", "Controller ID", "Controller Name", "Gun Id", "Gun Name", "Max Frequency", "Overlap Distance"
]

const paramDesc: string[] = [
  "The percentage of Open time to Close time during a single cycle of the nozzle.",
  "The force applied on the liquid as it exits the nozzle", 
  "Last Time changes were made and saved in this proeject",
  "In feet per second the rate at which the conveyor belt turns",
  "In inches the width of the conveyor belt",
  "Number of nozzles present above current project",
  "In inches the distance a nozzle lies above the conveyor belt",
  "In inches the distance between a nozzle and another nozzle above the conveyor belt",
  "The numerical representation of a user account",
  "In inches, the sprayed products height",
  "In inches, the sprayed products length",
  "In inches, the sprayed products width",
  "Textual Representation of a projects purpose",
  "The numerical representation of a created project",
  "Text identifier of the project",
  "In inches the distance between the product sensor and the nozzle array",
  "In seconds, the amount of time liquid flows out of the nozzle",
  "In seconds, the time from when the product is sensed, and when the nozzle starts spraying",
  "In Seconds The time the nozzles remain spraying after the product is no longer detected by the sensor",
  "In degrees the angle of liquid spray exiting a nozzle",
  "In gallons per minutes the amount of liquid exiting a nozzle",
  "A link to the Spraying Systems catalog containing information on this nozzle", 
  "The numerical representation of a nozzle",
  "Text identifier of the nozzle",
  "In degrees the angle of liquid spray exiting a nozzle",
  "In degrees the amount of tilt the nozzle head has in comparison to the conveyor belt",
  "A link to the Spraying Systems catalog containing information on this controller",
  "The numerical representation of a controller",
  "Text identifier of the controller",
  "The numerical representation of a spray gun",
  "Text identifier of the spray gun",
  "In number of cycles per minute, the amount of open and close sequences a nozzle makes",
  "The percentage of product sprayed with fluid from at least two nozzles"
]

interface ModalProps{
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
}

interface ProfileModalProps extends ModalProps{
  setUserInfo: (arg: Promise<UserInfoResponse>) => void;
  username: string;
  email: string;
}

interface ResetPasswordModalProps extends ModalProps{
  setUserInfo: (arg: Promise<UserInfoResponse>) => void;
}

interface PasswordModalProps extends ModalProps{
  setIsFSOpen: (arg0: boolean) => void;
  setIsCAOpen: (arg0: boolean) => void;
  setIsLIOpen: (arg0: boolean) => void;
}

interface SaveLoadProps{
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
  projectState : [Models.ProjectBase[], React.Dispatch<React.SetStateAction<Models.ProjectBase[]>>];
  parameterMap: Map<string, UtilityInterfaces.Parameter>;
  onLoad: (arg0: Map<string, UtilityInterfaces.Parameter>) => void;
  userIDstate : [number, React.Dispatch<React.SetStateAction<number>>];
}

interface InfoModalProps{
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
  selectedId: number | null;
}

interface TextFieldProps {
  value?: string;
  onChange: (val: string) => void;
}

interface Option {
  value: string;
  label: string;
}

interface DropdownProps {
  options: Option[];
  onChange: (value: string) => void;
}

export const TextField = ({ value, onChange }: TextFieldProps) => {
  return (
    <input value={value} onChange={({ target: { value } }) => onChange(value)}/>
  );
};

export const Dropdown: React.FC<DropdownProps> = ({ options, onChange}) => {
  const [selectedValue, setSelectedValue] = useState<string>(options.length > 0 ? options[0].value : "");
  useEffect(() => {
    if (options.length > 0){
      setSelectedValue(options[0].value);
    }
  }, [options])

const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  const value = event.target.value;
  setSelectedValue(value);
  onChange(value);
  console.log(`changing dropdown value to: ${value}`);
};

return (
  <select value={selectedValue} onChange={handleChange}>
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);
};

//const [myBoolean, setMyBoolean] = useState(false);
//
//  const handleClick = () => {
//    setMyBoolean(!myBoolean);
//  };



export const SignIn = ({ isOpen, setIsLIOpen, setIsCAOpen, setIsFPOpen, setUserInfo, setFailedOpen }: AccountModalProps) => {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const handleUnChange = (newUn:string) => {
    setUserName(newUn);}

  const handlePwChange = (newPw:string) => {
    setPassword(newPw);}

  if (!isOpen){ return null}
  return (
    <>
      <div className= "darkBG" onClick={() => setIsLIOpen(false)} />
      <div className= "centered">
        <div className= "modal">
          <button className= "closeBtn" onClick={() => setIsLIOpen(false)}>
            <RiCloseLine style={{ marginBottom: "-3px" }} />
          </button>
          <div className="button-container">
          <button className= "onLoginSwitchBtn">
                Log In
          </button>
          <button className= "createSwitchBtn" onClick={() => {setIsLIOpen(false); setIsCAOpen(true)}}>
                Create Account
          </button>
          </div>
          <div>
            <div>
                <p>Username</p>
                <TextField value={username} onChange={handleUnChange} ></TextField>
            </div>
            <div>
                <p>Password</p>
            </div>
                <input type="password" value={password} onChange={(e)=>{handlePwChange(e.target.value)}} ></input>
            &nbsp;
            <div>
              <button className= "forgetBtn" onClick={() => setIsFPOpen(true)}>
                Forgot Password
              </button>
            </div>
              <div>
              <button className= "loginBtn" onClick={() => {setUserInfo(login(username, password)); setIsLIOpen(false)}}>
                Login
              </button>
              </div>
            </div>
          </div>
        </div>
    </>
  );
};

export const ResetPassword = ({isOpen, setIsOpen, setIsFSOpen, setIsCAOpen, setIsLIOpen }: PasswordModalProps) => {
    const [email, setEmail] = useState('');
    const handleEmChange = (newEm:string) => {
        setEmail(newEm);}

    async function tryToReset(){
      await resetPassword(email);
      setIsOpen(false);
    }
if (!isOpen){ return null}
  return (
    <>
      <div className= "darkBG" onClick={() => setIsOpen(false)} />
      <div className= "centered">
        <div className= "modal">
            <h3>Please Enter Your Email So That We Can Send You A Password Recovery Link</h3>
          <button className= "closeBtn" onClick={() => setIsOpen(false)}>
            <RiCloseLine style={{ marginBottom: "-3px" }} />
          </button>
          <div className= "modalActions">
            <div className= "actionsContainer">
              <div>
                  <p>Email</p>
                  <TextField value={email} onChange={handleEmChange} ></TextField>
              </div>
             </div>
           </div>
           <button className= "forgetBtn" onClick={() => {tryToReset; setIsOpen(false); setIsFSOpen(true); setIsCAOpen(false); setIsLIOpen(false)}}>
                  Recover Password
            </button>

         </div>
       </div>
     </>
  );  
};

export const ResetPasswordConfirm = ({isOpen, setIsOpen }: ModalProps) => {
if (!isOpen){ return null}
return (
  <>
    <div className= "darkBG" onClick={() => setIsOpen(false)} />
    <div className= "centered">
      <div className= "modal">
        <button className= "closeBtn" onClick={() => setIsOpen(false)}>
          <RiCloseLine style={{ marginBottom: "-3px" }} />
        </button>
        <div className= "modalActions">
          <div className= "actionsContainer">
            <div>
                <p>An Email has been sent to your account to recover your password</p>
                <p>Please use the link within the next hour to reset your password</p>
            </div>
           </div>
         </div>
       </div>
     </div>
   </>
);  
};

export const ResetPasswordPostLink = ({isOpen, setIsOpen, setUserInfo }: ResetPasswordModalProps) => {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const handleUnChange = (newUn:string) => {
    setUserName(newUn);}
  const handlePwChange = (newPw:string) => {
    setPassword(newPw);}
  if (!isOpen){ return null}
  return (
    <>
      <div className= "darkBG" onClick={() => setIsOpen(false)} />
      <div className= "centered">
        <div className= "modal">
            <h5>Please Enter Your New Password</h5>
          <button className= "closeBtn" onClick={() => setIsOpen(false)}>
            <RiCloseLine style={{ marginBottom: "-3px" }} />
          </button>
          <div className= "modalActions">
            <div className= "actionsContainer">
              <div>
              <div>
              <p>Username</p>
              <TextField value={username} onChange={handleUnChange} ></TextField>
              </div>
              <p>Password</p>
              <TextField value={password} onChange={ handlePwChange} ></TextField>

              <p>Confirm Password</p>
              <TextField value={password} onChange={ handlePwChange} ></TextField>
              </div>
             </div>
             <button className= "loginBtn" onClick={() => {setUserInfo(login(username, password)); setIsOpen(false)}}>
                  Change Password
             </button>
           </div>
         </div>
       </div>
     </>
  );  
  };
  

export const Info = ({isOpen, setIsOpen, selectedId }: InfoModalProps) => {
if (!isOpen){ return null}
return (
  <>
    <div className= "infodarkBG" onClick={() => setIsOpen(false)} />
    <div className= "infocentered">
      <div className= "infomodal">
        <h5>{selectedId !== null ? paraNames[selectedId] : "No Information Available"}</h5>
        <button className= "closeBtn" onClick={() => setIsOpen(false)}>
          <RiCloseLine style={{ marginBottom: "-3px" }} />
        </button>
        <div className= "modalActions">
          <div className= "actionsContainer">
            {selectedId !== null ? paramDesc[selectedId] : ""}
            </div>
           </div>
         </div>
       </div>
   </>
);  
};

export const Profile = ({isOpen, setIsOpen, setUserInfo, username, email}: ProfileModalProps) => {
  // const [username, setUserName] = useState('');
  // const [password, setPassword] = useState('');
  // const [email, setEmail] = useState('');
  // const handleUnChange = (newUn:string) => {
  //   setUserName(newUn);}

  // const handlePwChange = (newPw:string) => {
  //   setPassword(newPw);}

  // const handleEmChange = (newEm:string) => {
  //     setEmail(newEm);}
  if (!isOpen){ return null}
  return (
  <>
    <div className= "darkBG" onClick={() => setIsOpen(false)} />
      <div className= "centered">
        <div className= "modal">
          <h2>Profile</h2>
          <button className= "closeBtn" onClick={() => setIsOpen(false)}>
            <RiCloseLine style={{ marginBottom: "-3px" }} />
          </button>
            <div className= "modalContent">
              <p>Username: {username}</p>
              <p>Email: {email}</p>
              {/* <button className = "forgetBtn" onClick={ () => setIsOpen(false)}>
                    Delete Account
              </button> */}
            </div>
          <div className= "modalActions">
              {/*<div className= "actionsContainer">
                <div>
                    <p>Change Username</p>
                    <TextField value={username} onChange={handleUnChange} ></TextField>
                    <button className = "forgetBtn" onClick={ () =>handleUnChange}>
                      →
                    </button>
                </div>
                <div>
                    <p>Change Email</p>
                    <TextField value={email} onChange={handleEmChange} ></TextField>
                    <button className = "forgetBtn" onClick={ () =>handleEmChange}>
                      →
                    </button>
                </div>
                <div>
                    <p>Change Password</p>
                    <TextField value={password} onChange={ handlePwChange} ></TextField>
                    <button className = "forgetBtn" onClick={ () =>handlePwChange}>
                      →
                    </button>
                </div>
              <div>
              */}
              <button onClick={() => {setUserInfo(logout()); setIsOpen(false)}}>
                  Log Out
                </button>
        </div>
      </div>
    </div>
  </>
  );  
};

  export const Documentation = ({ isOpen, setIsOpen }: ModalProps) => {
    const [selectedNozzle, setSelectedNozzle] = useState<string>("");
    const [selectedController, setSelectedController] = useState<string>("");
    const [nozzleOptions, setNozzleOptions] = useState<Option[]>([]);
    const [controllerOptions, setControllerOptions] = useState<Option[]>([]);

    const handleNozzleClick = () => {
      const baseUrl = "https://portal.spray.com/en-us/products/"
      if (selectedNozzle) {
        window.open(`${baseUrl}${selectedNozzle.replace("/", "-")}`, "_blank")
      }
    }

    const handleControllerClick = () => {
      const baseUrl = "https://www.spray.com/products/spray-control-options/autojet-model-"
      const endUrl = "-spray-controller"
      if (selectedController) {
        window.open(`${baseUrl}${selectedController.replace("E", "").replace("+", "")}${endUrl}`, "_blank")
      }
    }

    async function loadNozzleOptions() {
      try {
      const nozzleNames = await createNozzleArray();
      nozzleNames.map(name => ({ value: name, label: name}))
      if (nozzleNames.length > 0) {
        setNozzleOptions(nozzleNames.map(name => ({ value: name, label: name})))
      }
    } catch (error) {
      console.error("Error Loading Nozzles", error)
    }
  }

    async function loadControllerOptions() {
      try {
      const controllerNames = await createControllerArray();
      if (controllerNames.length > 0) {
        setControllerOptions(controllerNames.map(name => ({ value: name, label: name})))
      }
    } catch (error) {
      console.error("Error Loading Controllers", error)
    }
  }
  useEffect(() => {
    if (isOpen){
      loadNozzleOptions()
      loadControllerOptions()
    }
  }, [isOpen])

    if (!isOpen){ return null}
    return (
      <>
        <div className= "darkBG" onClick={() => setIsOpen(false)} />
        <div className= "centered">
          <div className= "modal">
              <h2>Documentation</h2>
            <button className= "closeBtn" onClick={() => setIsOpen(false)}>
              <RiCloseLine style={{ marginBottom: "-3px" }} />
            </button>
              <div>
              <Dropdown options={nozzleOptions} onChange={(value) => setSelectedNozzle(value)}/>
                <button className= "docBtn" onClick={handleNozzleClick}>
                →
                </button>
              </div>
              <div>
              <Dropdown options={controllerOptions} onChange={(value) => setSelectedController(value)}/>
                <button className= "docBtn" onClick={handleControllerClick}>
                →
                </button>
              </div>
          </div>
        </div>
      </>
    );
  };


  export const SaveLoad = ({ isOpen, setIsOpen, projectState, parameterMap, onLoad, userIDstate}: SaveLoadProps) => {
    const [selectedButton, setSelectedButton] = useState(-1);
    const [projects, setProjects] = projectState;
    const [projectList, setProjectList] = useState(constructProjectList());
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
      await saveProject(userID, parameterMap);
      setProjects(await listUserProjects(userID));
      setProjectList(constructProjectList());    
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
            <button className = "cancelBtn" onClick={save}>Save Project</button>
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
              </div>
            </div>
          </div>
        </div>
      </>
    );
    
  };