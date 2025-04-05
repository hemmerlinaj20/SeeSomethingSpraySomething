import { RiCloseLine } from "react-icons/ri";
import { AuthFailedProps } from "./ModalInterfaces";

export const LoginFailed = ({isOpen, setIsOpen, setParentOpen}: AuthFailedProps) => {
  if (!isOpen){ return null}
  return (
    <div className="darkBG">
        <div className= "auth-message-modal centered modal">
            <button className= "closeBtn" onClick={() => {setIsOpen(false); setParentOpen(true);}}>
                <RiCloseLine style={{ marginBottom: "-3px" }} />
            </button>
            <h1>Login Failed</h1>
            <p>Invalid username and password combination</p>
        </div>
    </div>
  );  
};