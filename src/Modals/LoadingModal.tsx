import { LoadingProps } from "./ModalInterfaces"
import '../styles/Modals.css'

export const Loading = ({isOpen, setIsOpen, setBG}: LoadingProps) => {
    if(!isOpen){return null};
    return (
        <>
        {setBG == true &&
        <div className= "loadingdarkBG"/>
        }
            <div className="loadingCentered centered">
                <div className="loader"></div>
                <h4>Loading....</h4>
            </div>
        </>
    );
};