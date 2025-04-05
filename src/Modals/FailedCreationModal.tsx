import { RiCloseLine } from "react-icons/ri";
import { AuthFailedProps, ModalProps } from "./ModalInterfaces";

export const AccountCreationFailed = ({isOpen, setIsOpen, setParentOpen}: AuthFailedProps) => {
  if (!isOpen){ return null}
  return (
    <div className="darkBG">
        <div className= "auth-message-modal centered modal">
            <button className= "closeBtn" onClick={() => {setIsOpen(false); setParentOpen(true)}}>
                <RiCloseLine style={{ marginBottom: "-3px" }} />
            </button>
            <h1>Account Creation Failed</h1>
        </div>
    </div>
  );  
};