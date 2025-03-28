import { useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import { UserInfoResponse, login } from "../utility/auth_requests";
import { resetPassword, encodeHTML } from "../utility/ProjectUtilities";
import { ModalProps, ResetPasswordModalProps, PasswordModalProps } from "./ModalInterfaces";
import { TextField } from "./ModalUtil.tsx";
import '../styles/Modals.css';

export const ResetPassword = ({isOpen, setIsOpen, setIsFSOpen, setIsCAOpen, setIsLIOpen }: PasswordModalProps) => {
    const [email, setEmail] = useState('');
    const handleEmChange = (newEm:string) => {
        setEmail(newEm);}

    async function tryToReset(){
      resetPassword(email);
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
           <button className= "forgetBtn" onClick={() => {tryToReset(); setIsOpen(false); setIsFSOpen(true); setIsCAOpen(false); setIsLIOpen(false)}}>
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