import React, { useState, useEffect } from "react";
import './styles/Modals.css';
import { RiCloseLine } from "react-icons/ri";
import { Models, UtilityInterfaces } from "./utility/models";
import { createAccount, login } from "./utility/auth_requests";
import { saveProject, listUserProjects} from "./utility/ProjectUtilities";
import { createProjectMap } from "./utility/ProjectUtilities";

interface ModalProps{
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
}
interface SaveLoadProps{
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
  projects: Models.ProjectBase[];
  parameterMap: Map<string, UtilityInterfaces.Parameter>;
  owned: boolean;
  onLoad: (arg0: Map<string, UtilityInterfaces.Parameter>) => void;
}

interface AccountModalProps{
  isOpen: boolean;
  setIsLIOpen: (arg0: boolean) => void;
  setIsCAOpen: (arg0: boolean) => void;
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
  const [selectedValue, setSelectedValue] = React.useState<string>(options[0]?.value || "");

const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  const value = event.target.value;
  setSelectedValue(value);
  onChange(value);
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

export const CreateAccount = ({ isOpen, setIsLIOpen, setIsCAOpen }: AccountModalProps) => {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleUnChange = (newUn:string) => {
    setUserName(newUn);}

  const handlePwChange = (newPw:string) => {
    setPassword(newPw);}

  const handleEmChange = (newEm:string) => {
      setEmail(newEm);}

  if (!isOpen){ return null}
  return (
    <>
      <div className= "darkBG" onClick={() => setIsCAOpen(false)} />
      <div className= "centered">
        <div className= "modal">
          <button className= "closeBtn" onClick={() => setIsCAOpen(false)}>
            <RiCloseLine style={{ marginBottom: "-3px" }} />
          </button>
          <div className="button-container">
          <button className= "loginSwitchBtn" onClick={() => {setIsLIOpen(true); setIsCAOpen(false)}}>
                Log In
          </button>
          <button className= "createSwitchBtn">
                Create Account
          </button>
          </div>
          <div>
            <div>
                <p>Username</p>
                <TextField value={username} onChange={handleUnChange} ></TextField>
            </div>
            <div>
                <p>Email</p>
                <TextField value={email} onChange={handleEmChange} ></TextField>
            </div>
            <div>
                <p>Password</p>
                <TextField value={password} onChange={ handlePwChange} ></TextField>
            </div>
            &nbsp;
            <div>
              </div>
              <div>
              <button className= "loginBtn" onClick={() => {createAccount(username, password, email); setIsCAOpen(false)}}>
                Create
              </button>
              </div>
            </div>
          </div>
        </div>
    </>
  );
};

  export const SignIn = ({ isOpen, setIsLIOpen, setIsCAOpen }: AccountModalProps) => {
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
            <button className= "loginSwitchBtn">
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
                  <TextField value={password} onChange={ handlePwChange} ></TextField>
              </div>
              &nbsp;
              <div>
                <button className= "forgetBtn" onClick={() => setIsLIOpen(false)}>
                  Forget Password
                </button>
                </div>
                <div>
                <button className= "loginBtn" onClick={() => {login(username, password); setIsLIOpen(false)}}>
                  Login
                </button>
                </div>
              </div>
            </div>
          </div>
      </>
    );
  };

export const ResetPassword = ({isOpen, setIsOpen }: ModalProps) => {
    const [email, setEmail] = useState('');
    const handleEmChange = (newEm:string) => {
        setEmail(newEm);}
if (!isOpen){ return null}
  return (
    <>
      <div className= "darkBG" onClick={() => setIsOpen(false)} />
      <div className= "centered">
        <div className= "modal">
            <h5>Please Enter Your Email So That We Can Send You A Password Recovery Link</h5>
          <button className= "closeBtn" onClick={() => setIsOpen(false)}>
            <RiCloseLine style={{ marginBottom: "-3px" }} />
          </button>
          <div className= "modalActions">
            <div className= "actionsContainer">
              <div>
                  <p>Change Email</p>
                  <TextField value={email} onChange={handleEmChange} ></TextField>
              </div>
             </div>
           </div>
           <button className= "forgetBtn" onClick={() => setIsOpen(false)}>
                  Recover Password
            </button>

         </div>
       </div>
     </>
  );  
};

export const Profile = ({isOpen, setIsOpen }: ModalProps) => {
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const handleUnChange = (newUn:string) => {
    setUserName(newUn);}

  const handlePwChange = (newPw:string) => {
    setPassword(newPw);}

  const handleEmChange = (newEm:string) => {
      setEmail(newEm);}
  if (!isOpen){ return null}
  return (
    <>
      <div className= "darkBG" onClick={() => setIsOpen(false)} />
      <div className= "centered">
        <div className= "modal">
            <h5>Profile</h5>
          <button className= "closeBtn" onClick={() => setIsOpen(false)}>
            <RiCloseLine style={{ marginBottom: "-3px" }} />
          </button>
            <div className= "modalContent">
            <button className = "forgetBtn" onClick={ () => setIsOpen(false)}>
                  Delete Account
            </button>
          </div>
          <div className= "modalActions">
            <div className= "actionsContainer">
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
             </div>
           </div>
         </div>
       </div>
     </>
  );  
};

  export const Documentation = ({ isOpen, setIsOpen }: ModalProps) => {
    const [selectedValue, setSelectedValue] = useState<string>("");
    const [nozzleData, setNozzleData] = useState<any>(null);
    const [controllerData, setConctrollerData] = useState<any>(null);

    const handleNozzleClick = (type: "nozzle") => {
      const baseUrl = "https://portal.spray.com/en-us/products/"
      let selectedValue = nozzleOptions;
      if (selectedValue) {
        window.open('${baseUrl}${selectedData.value}')
      }
    }

    const handleControllerClick = (type: "controller") => {
      const baseUrl = "https://www.spray.com/products/spray-control-options/"
      let selectedValue = controllerOptions;
      if (selectedValue) {
        window.open('${baseUrl}${selectedData.value}')
      }
    }

    const nozzleOptions: Option[] = [
      { value: "nozzle-info", label: "Nozzle Information"},
    ];
    const controllerOptions: Option[] = [
      { value: "controller-info", label: "Controller Information"},
    ];
    if (!isOpen){ return null}
    return (
      <>
        <div className= "darkBG" onClick={() => setIsOpen(false)} />
        <div className= "centered">
          <div className= "modal">
              <h5>Documentation</h5>
            <button className= "closeBtn" onClick={() => setIsOpen(false)}>
              <RiCloseLine style={{ marginBottom: "-3px" }} />
            </button>
              <div>
              <Dropdown
                options={nozzleOptions}
                onChange={(value) => setSelectedValue(value)}/>
                <button className= "CancelBtn" onClick={() => handleNozzleClick("nozzle")}>
                →
                </button>
              </div>
              <div>
              <Dropdown
                options={nozzleOptions}
                onChange={(value) => setSelectedValue(value)}/>
                <button className= "CancelBtn" onClick={() => handleControllerClick("controller")}>
                →
                </button>
              </div>
            <div>
              Direct guestions to
              Robert Spray
              spraystuff@spray.com
              555 55-SPRAY
            </div>
          </div>
        </div>
      </>
    );
  };


  export const SaveLoad = ({ isOpen, setIsOpen, parameterMap, owned, onLoad}: SaveLoadProps) => {
    const [selectedButton, setSelectedButton] = useState(-1);
    function save(){
      saveProject(1, parameterMap)
      setIsOpen(false);
    }
    async function loadProject(){
      console.log("Loading Project " + selectedButton);
      parameterMap = await createProjectMap(1, selectedButton);
      console.log(parameterMap);
      onLoad(parameterMap);
      setIsOpen(false);
    }
    function deleteProject(){

    }
    function clickedProjectButton(project_id: number){
      document.getElementById("open_project_button")?.removeAttribute("disabled");
      document.getElementById("delete_project_button")?.removeAttribute("disabled");
      setSelectedButton(project_id);
    }
    const [projects, setProjects] = useState(Array<Models.ProjectBase>())
    useEffect(() => {
      async function renderProjectList(){
        setProjects(await listUserProjects(1));
      }
      renderProjectList();
    }, [])
    console.log(projects);
    projects.sort((a:Models.ProjectBase, b:Models.ProjectBase) => 
      new Date(b.last_modified_date).getTime() - new Date(a.last_modified_date).getTime());
    const projectList = projects.map(project => <li
      key = {project.project_id}>
      <button id={"pb_" + project.project_id} onClick={() => clickedProjectButton(project.project_id)}>{project.project_name}</button>
    </li>)
    if (!isOpen){ return null}
    return (
      <>
        <div className= "darkBG" onClick={() => setIsOpen(false)} />
        <div className= "centered">
          <div className= "modal">
            <div className= "modalHeader">
              <h5 className= "heading">Projects</h5>
            </div>
            <button className= "closeBtn" onClick={() => setIsOpen(false)}>
              <RiCloseLine style={{ marginBottom: "-3px" }} />
            </button>
            <div className= "modalContent">
            <button onClick={save}>Save Project</button>
              {projectList}
            </div>
            <div className= "modalActions">
              <div className= "actionsContainer">
                <button id="delete_project_button" className= "deleteBtn" disabled onClick={() => setIsOpen(false)}>
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