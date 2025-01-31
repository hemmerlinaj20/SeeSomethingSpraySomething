import React, { useState } from "react";
import './styles/Modals.css';
import { listUserProjects } from "./utility/ProjectUtilities";
import { RiCloseLine } from "react-icons/ri";
import { FaHandLizard } from "react-icons/fa";
import { Models } from "./utility/models";
interface ModalProps{
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
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

  export const SignIn = ({ isOpen, setIsOpen }: ModalProps) => {
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(event.target.value);}
    if (!isOpen){ return null}
    return (
      <>
        <div className= "darkBG" onClick={() => setIsOpen(false)} />
        <div className= "centered">
          <div className= "modal">
            <button className= "closeBtn" onClick={() => setIsOpen(false)}>
              <RiCloseLine style={{ marginBottom: "-3px" }} />
            </button>
            <div className="button-container">
            <button className= "loginSwitchBtn" onClick={() => setIsOpen(false)}>
                  Log In
            </button>
            <button className= "createSwitchBtn" onClick={() => setIsOpen(false)}>
                  Create Account
            </button>
            </div>
            <div>
              <div>
                  //TextField for email
                  <TextField onChange={() => onchange} ></TextField>
              </div>
              <div>
                  //TextField for password
                  <TextField onChange={() => onchange} ></TextField>
              </div>
              &nbsp;
              <div>
                <button className= "forgetBtn" onClick={() => setIsOpen(false)}>
                  Forget Password
                </button>
                </div>
                <div>
                <button className= "loginBtn" onClick={() => setIsOpen(false)}>
                  Login
                </button>
                </div>
              </div>
            </div>
          </div>
      </>
    );
  };

export const Profile = ({isOpen, setIsOpen }: ModalProps) => {
  if (!isOpen){ return null}
  return (
    <>
      <div className= "darkBG" onClick={() => setIsOpen(false)} />
      <div className= "centered">
        <div className= "modal">
            <h5>Dialog</h5>
          <button className= "closeBtn" onClick={() => setIsOpen(false)}>
            <RiCloseLine style={{ marginBottom: "-3px" }} />
          </button>
            <div className= "modalContent">
            Are you sure you want to delete the item?
          </div>
          <div className= "modalActions">
            <div className= "actionsContainer">
              <button className= "deleteBtn" onClick={() => setIsOpen(false)}>
                 Delete
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

  export const Documentation = ({ isOpen, setIsOpen }: ModalProps) => {
    const [selectedValue, setSelectedValue] = useState<string>("");

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
                <button className= "CancelBtn" onClick={() => setIsOpen(false)}>
                  Nozzle Information
                </button>
                <Dropdown
                options={nozzleOptions}
                onChange={(value) => setSelectedValue(value)}/>
              </div>
              <div>
                <button className= "CancelBtn" onClick={() => setIsOpen(false)}>
                  Controller Manual
                </button>
                <Dropdown
                options={controllerOptions}
                onChange={(value) => setSelectedValue(value)}/>
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

  export const SaveLoad = ({ isOpen, setIsOpen }: ModalProps) => {
    const projects = listUserProjects(1);
    projects.sort((a:Models.ProjectBase, b:Models.ProjectBase) => 
      a.last_modified_date.getTime()-b.last_modified_date.getTime());
    const projectList = projects.map(project => <li>
      <button>{project.project_name}</button>
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
              {projectList}
            </div>
            <div className= "modalActions">
              <div className= "actionsContainer">
                <button className= "deleteBtn" onClick={() => setIsOpen(false)}>
                  Delete
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