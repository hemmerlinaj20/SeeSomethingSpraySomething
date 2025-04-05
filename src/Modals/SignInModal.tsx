import { useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import { login, UserInfoResponse } from "../utility/auth_requests";
import { encodeHTML } from "../utility/ProjectUtilities";
import { AccountModalProps } from "./ModalInterfaces";
import { TextField } from "./ModalUtil";
import '../styles/Modals.css';

  export const SignIn = ({ isOpen, setIsLIOpen, setIsCAOpen, setIsFPOpen, setUserInfo }: AccountModalProps) => {
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
                  <input type="password" value={password} onChange={(e)=>{handlePwChange(e.target.value)}} ></input>
              </div>
              &nbsp;
              <div>
                <button className= "forgetBtn" onClick={() => setIsFPOpen(true)}>
                  Forgot Password
                </button>
              </div>
                <div>
                <button className= "loginBtn" onClick={() => {
                  setUserInfo(login(username, password)); 
                  }}>
                  Login
                </button>
                </div>
              </div>
            </div>
          </div>
      </>
    );
  };