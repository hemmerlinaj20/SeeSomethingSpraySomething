import { Models, UtilityInterfaces } from "../utility/models";
import { UserInfoResponse } from "../utility/auth_requests";

export interface ModalProps{
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
}

export interface ProfileModalProps extends ModalProps{
  setUserInfo: (arg: Promise<UserInfoResponse>) => void;
  username: string;
  email: string;
  userID: number;
}

export interface ResetPasswordModalProps extends ModalProps{
  setUserInfo: (arg: Promise<UserInfoResponse>) => void;
}

export interface PasswordModalProps extends ModalProps{
  setIsFSOpen: (arg0: boolean) => void;
  setIsCAOpen: (arg0: boolean) => void;
  setIsLIOpen: (arg0: boolean) => void;
}

export interface SaveLoadProps{
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
  setIsWizardOpen: (arg0: boolean) => void;
  projectState : [Models.ProjectBase[], React.Dispatch<React.SetStateAction<Models.ProjectBase[]>>];
  parameterMap: Map<string, UtilityInterfaces.Parameter>;
  onLoad: (arg0: Map<string, UtilityInterfaces.Parameter>) => void;
  userIDstate : [number, React.Dispatch<React.SetStateAction<number>>];
  setIsLoading : React.Dispatch<React.SetStateAction<boolean>>;
}

export interface WizardProps{
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
  setIsSaveLoadOpen: (arg0: boolean) => void;
  updateMap: React.Dispatch<React.SetStateAction<Map<string, UtilityInterfaces.Parameter>>>;
  projectState : [Models.ProjectBase[], React.Dispatch<React.SetStateAction<Models.ProjectBase[]>>];
  parameterMap: Map<string, UtilityInterfaces.Parameter>;
  userIDstate : [number, React.Dispatch<React.SetStateAction<number>>];
  setIsLoading : React.Dispatch<React.SetStateAction<boolean>>;
}

export interface AccountModalProps{
  isOpen: boolean;
  setIsLIOpen: (arg0: boolean) => void;
  setIsCAOpen: (arg0: boolean) => void;
  setIsFPOpen: (arg0: boolean) => void;
  setUserInfo: (arg: Promise<UserInfoResponse>) => void;
  setFailedOpen: (open:boolean)=>void;
}

export interface InfoModalProps{
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
  selectedId: number | null;
}

export interface ConfirmProps{
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
  item: string;
  setIsParentOpen: (open: boolean) => void;
  userID: number;
  setUserInfo: (arg: Promise<UserInfoResponse>) => void;
  
}

export interface TextBoxProps{
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
  title: string;
  setIsParentOpen: (open: boolean) => void;
  parameterMap: Map<string, UtilityInterfaces.Parameter>;
  current:string;
  userID: number;
  selectedButton: number;
}

export interface LoadingProps{
  isOpen: boolean;
  setIsOpen: (arg0: boolean) => void;
  setBG: boolean;
}

export interface TextFieldProps {
  value?: string;
  onChange: (val: string) => void;
}

export interface Option {
  value: string;
  label: string;
}

export interface DropdownProps {
  options: Option[];
  onChange: (value: string) => void;
  currentSelected: string;
}

export interface ImageModalProps extends ModalProps{
  imagePath : string;
}

export interface AuthFailedProps extends ModalProps{
  setParentOpen: (open: boolean) => void;
}