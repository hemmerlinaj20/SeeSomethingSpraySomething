import { useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import { createAccount, UserInfoResponse } from "../utility/auth_requests.ts";
import { AccountModalProps } from './ModalInterfaces';
import { TextField } from './ModalUtil.tsx';
import '../styles/Modals.css';

async function handleAccountCreation(username:string, email:string, password:string, setUserInfo:(x:Promise<UserInfoResponse>)=>void, setFailedOpen:(x:boolean)=>void){
  const response = createAccount(username, password, email);
  setUserInfo(response);

  const responseData = await response;

  //if we tried and failed to create an account, let the user know
  setFailedOpen(responseData.uid === 1);
}

export const CreateAccount = ({ isOpen, setIsLIOpen, setIsCAOpen, setUserInfo, setFailedOpen }: AccountModalProps) => {
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
          <button className= "onCreateSwitchBtn">
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
              <button className= "loginBtn" onClick={() => {handleAccountCreation(username, email, password, setUserInfo, setFailedOpen); setIsCAOpen(false)}}>
                Create
              </button>
              </div>
            </div>
          </div>
        </div>
    </>
  );
};