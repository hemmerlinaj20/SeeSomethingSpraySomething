import { useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import { logout } from "../utility/auth_requests";
import { ProfileModalProps } from "./ModalInterfaces";
import { TextField } from "./ModalUtil.tsx";
import '../styles/Modals.css';

  export const Profile = ({isOpen, setIsOpen, setUserInfo}: ProfileModalProps) => {
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
                <div>
                <button onClick={() => { setIsOpen(false)}}>
                    Log Out
                  </button>
                </div>
              </div>
            </div>
           </div>
         </div>
       </>
    );  
  };
  
