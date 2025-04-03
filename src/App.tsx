/* eslint-disable @typescript-eslint/no-explicit-any */
import './styles/App.css';
import { NozzleDrawer, LineDrawer, ControllerDrawer } from './Drawers.tsx';
import { Parameter, paraNames, paraUnits, paramDesc} from'./Parameter.tsx';
import { nozzleIndex, nozzleSpacing, lineIndex, lineSpacing, controllerIndex, controllerSpacing } from './Parameter.tsx';
import { SignIn } from './Modals/SignInModal.tsx'
import { Documentation } from './Modals/DocumentationModal.tsx'
import { SaveLoad } from './Modals/SaveLoadModal.tsx'
import { Wizard } from './Modals/WizardModal.tsx'
import { CreateAccount, Profile } from './Modals.tsx'
import { ResetPassword, ResetPasswordConfirm } from './Modals/ResetPasswordModal.tsx'
import { Info } from './Modals/InfoModal.tsx'
import { UserInfoResponse } from './utility/auth_requests.ts';
import { useState, useEffect, ChangeEvent } from "react";
import { Models } from './utility/models';
import { useNavigate} from 'react-router';
import { Dropdown } from "./Modals/ModalUtil.tsx";
import { Checkbox } from "./Drawers.tsx";
import { Option } from "./Modals/ModalInterfaces.tsx";
import { UtilityInterfaces } from "./utility/models";
import { pushRunToDatabase } from './utility/ProjectUtilities.ts';
import { ParameterConstraints} from './utility/ParameterConstraints.ts';
import MainScreenVisual from './MainScreenVisual';
import './utility/auth_requests.ts';

import { getOrException, listUserProjects} from "./utility/ProjectUtilities.ts";
import { flowRateEstimate, overlapPercentage } from './utility/Simulation/MathFunctions.ts';
import { getFontEmbedCSS } from 'html-to-image';
import { updateParamsAndRerender } from './utility/updateParamsAndRerender.ts';

interface AppProps{
  parameters: [Map<string, UtilityInterfaces.Parameter>, React.Dispatch<React.SetStateAction<Map<string, UtilityInterfaces.Parameter>>>];
  projectState: [Models.ProjectBase[], React.Dispatch<React.SetStateAction<Models.ProjectBase[]>>]
  userIDstate : [number, React.Dispatch<React.SetStateAction<number>>]
  timingModeState : [string, React.Dispatch<React.SetStateAction<string>>]
}

//Props: Render the app with a specific set of parameters that are determined beforehand
//This keeps it from resetting them when navigating react router, and it will
//be easier to work in loading saved projects
export default function App({parameters, projectState, userIDstate, timingModeState}: AppProps) {
  const [isNozzleDrawerOpen, setIsNozzleDrawerOpen] = useState(false);
  const [isControllerDrawerOpen, setIsControllerDrawerOpen] = useState(false);
  const [isLineDrawerOpen, setIsLineDrawerOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isForgetSuccessOpen, setIsForgetSuccessOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);
  const [isSaveLoadOpen, setIsSaveLoadOpen] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [selectedController, setSelectedController] = useState<string>("");
  const [controllerOptions, setControllerOptions] = useState<Option[]>([]);
  const [selectedNozzle, setSelectedNozzle] = useState<string>("");
  const [nozzleOptions, setNozzleOptions] = useState<Option[]>([]);
  const [isChecked, setIsChecked] = useState(false);

  //Method for transfering info abour selectedId to the Modal
  const handleOpenInfo = (id: number) => {
    setSelectedId(id);
    setIsInfoOpen(true);
  }
  //These are states that were passed down from main
  const [userID, setUserID] = userIDstate;
  const [projectList, setProjectList] = projectState;
  const [parameterMap, setParameterMap] = parameters;
  const [timingMode, setTimingMode] = timingModeState;

  //When someone logs in, set the userID state and reload the project list
  async function awaitAndSetUserInfo(newInfo : Promise<UserInfoResponse>) {
    const responseData = await newInfo;

    let IDToSet = responseData.uid;
    setUserID(IDToSet);
    setProjectList(await listUserProjects(IDToSet));

    let usernameToSet = responseData.username;
    if(typeof usernameToSet === "string"){
      setUsername(usernameToSet);
    }

    let emailToSet = responseData.email;
    if(typeof emailToSet === "string"){
      setEmail(emailToSet);
    }
  }
  
  //Funky stuff happens with defaultValue on inputs and React. I don't know why
  //this works. I wouldn't suggest touching it.
  useEffect(() => {
    async function loadMap(){
      for(const [key, value] of parameterMap){
        const inputElement: HTMLInputElement|null = document.querySelector("#" + key + "_input");
        if(inputElement){
          inputElement.defaultValue = String(value.value);
        }   
      }
    }
    loadMap();
  })

  //On loading project, set the parameter map and change all of the parameter input elements
  function loadProject(params: Map<string, UtilityInterfaces.Parameter>){
    setParameterMap(params);
    for(const [key, value] of params){
      const inputElement: HTMLInputElement|null = document.querySelector("#" + key + "_input");
      if(inputElement){
        inputElement.defaultValue = String(value.value);
      }   
    }
  }

  //Called when the results button is clicked. Not sure why this needs its own function.
  const navigate = useNavigate();
  async function navigateResults(){
    await pushRunToDatabase(userID, parameterMap)   
    navigate('/results/');
  }

  //Construct a list of the parameters and the values given
  //to App.tsx as props
  //parameterList is the list of HTML elements that are rendered in the drawers for
  //each parameter
  let parameterList: any[] = []; 
  constructParameterInputList();  
  const parameterInputs: NodeListOf<HTMLInputElement> = document.querySelectorAll(".parameter_input");
  //For every parameter input, add an event listener that updates the parameter map
  //when the value is changed
  for(const parameterInput of parameterInputs){
    parameterInput.addEventListener("change", () => {
      const key = parameterInput.id.replace("_input", "");
      const currentParameter = parameterMap.get(key);
      //Type of value can be either string or number
      let newVal: string|number;
      //Should always be true since a project should always be loaded
      if(currentParameter){
        if(currentParameter.type != UtilityInterfaces.types.STRING){
          if(currentParameter.min!=null && Number(parameterInput.value) < currentParameter.min){
            newVal = currentParameter.min;
          }
          else if(currentParameter.max!=null && Number(parameterInput.value) > currentParameter.max){
            newVal = currentParameter.max;
          }
          else{
            newVal = Number(parameterInput.value);
          }  
        }
        else{
            newVal = parameterInput.value;      
        }
        currentParameter.value = newVal;
        parameterMap.set(key, currentParameter)
        updateParamsAndRerender(parameterMap, setParameterMap);
        parameterInput.value = String(newVal);

        if(currentParameter.name === "sensor_distance" || currentParameter.name === "product_length" || currentParameter.name === "line_speed"){
          autoCalculateTiming();  
        }
      }
    });
  }
  
  //Create all of the HTML elements for the input fields in the left side drawers
  function constructParameterInputList(){
    parameterList = [];
    for(const [key, value] of parameterMap){
      //Make a text input field for string parameters
      if(value.min!=null && value.max!=null){
        // If the key is Controller Name or Spray Angle, make it a drop down
        //if(value.name == "controller_name"){
        //  console.log("Got to Controller")
        //parameterList.push(
        // <Dropdown options={controllerOptions} onChange={(value) => setSelectedController(value)}/>
         // )
        //}
        //else {
        parameterList.push(
          <li id={key + "_list"} key={key}>
            <p>{key.replace("_", " ").replace("_", " ").toUpperCase()}</p>
            <input className="parameter_input" id={key + "_input"} type="number" min={value.min} max={value.max}></input>
          </li>
        );
      }
    //}
    //if(value.name == "spray_angle"){
    //  parameterList.push(
    //    <Dropdown options={nozzleOptions} onChange={(value) => setSelectedNozzle(value)}/>
    //   )
    //}
      else{
        parameterList.push(
          <li id={key + "_list"} key={key}>
            <p>{key.replace("_", " ").replace("_", " ").toUpperCase()}</p>
            <input className="parameter_input" id={key + "_input"} type={value.type==UtilityInterfaces.types.STRING ? "text" : "number"}></input>
          </li>
        );
      }
    }
  }

  //this function has to be inside the app component because it needs access to the parametermap
  //possible timing modes are
  //vt = variable time, ft = fixed time
  //vd = variable distance, fd = fixed distance
  function updateTimingMode(e:ChangeEvent<HTMLSelectElement>) : void{
    updateTimingModeHelper(e.target.value);
  }

  function autoCalculateTiming() : void{
    const LineSpeed = Number(getOrException(parameterMap, "line_speed").value) / 5;
    const SensorDis = Number(getOrException(parameterMap, "sensor_distance").value);
    const stopDelayParam = parameterMap.get("stop_delay");
    const startDelayParam = parameterMap.get("start_delay");
    const sprayDurationParam = parameterMap.get("spray_duration");

    const startDelayField = document.getElementById("start_delay_input") as HTMLInputElement;
    const stopDelayField = document.getElementById("stop_delay_input") as HTMLInputElement;
    const sprayDurationField = document.getElementById("spray_duration_input") as HTMLInputElement;

    if (typeof startDelayParam !== "undefined"){
      const newStartDelay = Number(getOrException(parameterMap, "sensor_distance").value) / LineSpeed;
      startDelayParam.value = newStartDelay;
      parameterMap.set("start_delay", startDelayParam);
      startDelayField.value = newStartDelay.toString();
    }
    if (typeof stopDelayParam !== "undefined"){
      const newStopDelay = Number(getOrException(parameterMap, "sensor_distance").value) / LineSpeed;
      stopDelayParam.value = newStopDelay;
      parameterMap.set("stop_delay", stopDelayParam);
      stopDelayField.value = newStopDelay.toString();
    }
    if (typeof SensorDis !== "undefined" && typeof sprayDurationParam !== "undefined"){
      const newSprayDuration = Number(getOrException(parameterMap, "product_length").value) / LineSpeed;
      sprayDurationParam.value = newSprayDuration;
      parameterMap.set("spray_duration", sprayDurationParam);
      sprayDurationField.value = newSprayDuration.toString();
    }

    setParameterMap(parameterMap);
  }

  function updateTimingModeHelper(newTimeMode:string) : void{
    if(newTimeMode === "auto"){
      autoCalculateTiming();
    }
    setTimingMode(newTimeMode);
  }
  
  //ensure the necessary fields are grayed out 
  let startDelayGrayed = "";
  let stopDelayGrayed = "";
  let sprayDurationGrayed = "";
  if(timingMode === "vt"){
    sprayDurationGrayed = "grayed-timing-mode";
  }
  else if(timingMode === "ft"){
    stopDelayGrayed = "grayed-timing-mode";
  }
  else if(timingMode === "auto"){
    startDelayGrayed = "grayed-timing-mode";
    stopDelayGrayed = "grayed-timing-mode";
    sprayDurationGrayed = "grayed-timing-mode";
  }

  //calculate projected flowrate
  const flowrate = Number(getOrException(parameterMap, "flow_rate").value);
  const pressure = Number(getOrException(parameterMap, "fluid_pressure").value)
  const basePressure = 40;
  const estimatedFlowrate = flowRateEstimate(flowrate, basePressure, pressure);

  //calculate overlap %
  const product_height = Number(getOrException(parameterMap, "product_height").value);
  const nozzle_height = Number(getOrException(parameterMap, "nozzle_height").value);
  const spray_height = nozzle_height - product_height;
  
  const twist_angle = Number(getOrException(parameterMap, "twist_angle").value);
  const nozzle_angle = Number(getOrException(parameterMap, "angle").value);

  const nozzle_spacing = Number(getOrException(parameterMap, "nozzle_spacing").value);

  const overlap = overlapPercentage(spray_height, nozzle_spacing, nozzle_angle, twist_angle);

  const nozzleCount = Number(getOrException(parameterMap, "nozzle_count").value);

// ParameterList Indexes
// 0 = Duty Cycle, 1 = Fluid Pressure , 2 = Last Date Modified, 3= Line Speed, 4= Line Width, 5= Nozzle Count, 
// 6 = Nozzle Height, 7 = Nozzle Spacing, 8 = Owner ID, 9 = Product Height, 10 = Product Length,
// 11 = Product Width, 12 = Project Desc., 13 = Project ID , 14 = Project Name, 15 = Sensor Distance, 
// 16 = Spray Duration, 17 = Start Delay, 18 = Stop Delay, 19 = Spray Angle, 20 = Flow Rate,
// 21 = Nozz Doc Link, 22 = Nozzle ID, 23 = Nozzle Name, 24 = Spray Shape, 25 = Alignment, 
// 26 = Controller Doc Link, 27 = Controller ID, 28 = Controller Name, 29 = Gun ID, 30 = Gun Name , 31 = Max Frequency

// Reset Password Modal and Forget Password Modal are for testing purposes only, and will be removed once links work correctly
  return (
    // THIS IS THE PARENT DIV TO CONTAIN EVERYTHING
    <div id='pageContainer'>

      {/* THIS DIV IS FOR THE DRAWERS */}
      <div id='drawers'>
        {/* NOZZLE DRAWER */}
        <button onClick={() => setIsNozzleDrawerOpen(true)}
        aria-expanded={isNozzleDrawerOpen}
        aria-controls="nozzleDrawer">Nozzle</button>
        <NozzleDrawer isOpen={isNozzleDrawerOpen} onClose={() => setIsNozzleDrawerOpen(false)}>
        <div>
          {nozzleIndex.map((_) => (
            <Parameter key = {_} parameterList= {parameterList} paramUnits = {paraUnits} 
            isInfoOpen = {isInfoOpen} handleOpenInfo = {handleOpenInfo} index = {_} 
            />
          ))}
          </div>
          <Parameter key = {1} parameterList= {parameterList} paramUnits = {paraUnits} 
            isInfoOpen = {isInfoOpen} handleOpenInfo = {handleOpenInfo} index = {1} />

          <Parameter key = {25} parameterList= {parameterList} paramUnits = {paraUnits} 
            isInfoOpen = {isInfoOpen} handleOpenInfo = {handleOpenInfo} index = {25} />
                      
          <p>NOZZLE OVERLAP PERCENTAGE: {(nozzleCount > 1) ? `${overlap.toFixed(0)}%` : "N/A"}</p>

          <p>PROJECTED FLOW RATE: {estimatedFlowrate.toFixed(3)} gal/min</p>
        
        </NozzleDrawer>

        {/* LINE DRAWER */}
        <button onClick={() => setIsLineDrawerOpen(true)}
        aria-expanded={isLineDrawerOpen}
        aria-controls="lineDrawer">Line</button>
        <LineDrawer isOpen={isLineDrawerOpen} onClose={() => setIsLineDrawerOpen(false)}>
        <div>
          {lineIndex.map((_) => (
            <Parameter key = {_} parameterList= {parameterList} paramUnits = {paraUnits} 
            isInfoOpen = {isInfoOpen} handleOpenInfo = {handleOpenInfo} index = {_} 
            />
          ))}
          </div>
        </LineDrawer>

        {/* CONTROLLER DRAWER */}
        <button onClick={() => { setIsControllerDrawerOpen(true) }}
        aria-expanded={isControllerDrawerOpen}
        aria-controls="controllerDrawer">Controller</button>
        <ControllerDrawer isOpen={isControllerDrawerOpen} onClose={() => setIsControllerDrawerOpen(false)} timingMode={timingMode} updateTimingModeHelper={updateTimingModeHelper}>
          
          <div>
            Timing Mode: 
            <select value={timingMode} onChange={updateTimingMode}>
              <option key="auto" value="auto">Auto Calculate</option> 
              <option key="ft" value="ft">Fixed Time</option>
              <option key="vt" value="vt">Variable Time</option>
            </select>
          </div>
          
          <div id="start-delay-div" className={`visible-timing-mode ${startDelayGrayed}`} style = {{display: "flex", alignItems: "center"}}>
          {parameterList[17]} {paraUnits[17]} <button className='info-btn' onClick={() => {handleOpenInfo(17)}}                    
                    aria-expanded={isInfoOpen}
                    aria-controls="Start Delay"></button></div>
          <div id="stop-delay-div" className={`visible-timing-mode ${stopDelayGrayed}`} style = {{display: "flex", alignItems: "center"}}>
          {parameterList[18]} {paraUnits[18]} <button className='info-btn' onClick={() => {handleOpenInfo(18)}}                    
                    aria-expanded={isInfoOpen}
                    aria-controls="Stop Delay"></button></div>
          <div id="spray-duration-div" className= {`visible-timing-mode ${sprayDurationGrayed}`} style = {{display: "flex", alignItems: "center"}}>
          {parameterList[16]} {paraUnits[16]} <button className='info-btn' onClick={() => {handleOpenInfo(16)}}                    
                    aria-expanded={isInfoOpen}
                    aria-controls="Spray Duration"></button></div>
                    
          <Parameter key = {28} parameterList= {parameterList} paramUnits = {paraUnits} 
          isInfoOpen = {isInfoOpen} handleOpenInfo = {handleOpenInfo} index = {28} />

          <Parameter key = {31} parameterList= {parameterList} paramUnits = {paraUnits} 
          isInfoOpen = {isInfoOpen} handleOpenInfo = {handleOpenInfo} index = {31} />

          <Parameter key = {0} parameterList= {parameterList} paramUnits = {paraUnits} 
          isInfoOpen = {isInfoOpen} handleOpenInfo = {handleOpenInfo} index = {0} />

        </ControllerDrawer>
        {isInfoOpen && <Info isOpen = {isInfoOpen} setIsOpen={setIsInfoOpen} selectedId={selectedId}/>}
      </div>

      {/* THIS DIV IS FOR THE MODALS ON THE RIGHT SIDE */}
      <div id='navigation'>
        {/* SIGN IN / PROFILE */}

        <ProfileButton userID={userID} setIsProfileOpen={setIsProfileOpen} setIsSignInOpen={setIsSignInOpen}/>
        {isSignInOpen && <SignIn isOpen = {isSignInOpen} setIsLIOpen={setIsSignInOpen} setIsCAOpen={setIsCreateAccountOpen} setIsFPOpen={setIsResetPasswordOpen} setUserInfo={awaitAndSetUserInfo}/>}
        {isCreateAccountOpen && <CreateAccount isOpen = {isCreateAccountOpen} setIsCAOpen={setIsCreateAccountOpen} setIsLIOpen={setIsSignInOpen} setIsFPOpen={setIsResetPasswordOpen} setUserInfo={awaitAndSetUserInfo}/>}
        {isResetPasswordOpen && <ResetPassword isOpen={isResetPasswordOpen} setIsOpen={setIsResetPasswordOpen} setIsFSOpen={setIsForgetSuccessOpen} setIsCAOpen={setIsCreateAccountOpen} setIsLIOpen={setIsSignInOpen}/>}
        {isForgetSuccessOpen && <ResetPasswordConfirm isOpen={isForgetSuccessOpen} setIsOpen={setIsForgetSuccessOpen}/>}
        {isProfileOpen && <Profile isOpen={isProfileOpen} setIsOpen={setIsProfileOpen} setUserInfo={awaitAndSetUserInfo} username={username} email={email}/>}

        {/* DOCUMENTATION */}
        <button className= "primaryBtn" onClick={() => setIsDocumentationOpen(true)}
        aria-expanded={isDocumentationOpen}
        aria-controls="DocumentationModal">
          Documentation
        </button>
        {isDocumentationOpen && <Documentation isOpen = {isDocumentationOpen} setIsOpen={setIsDocumentationOpen} />}
        
        {/* SAVE/LOAD */}
        <button className= "primaryBtn" onClick={() => setIsSaveLoadOpen(true)}
        aria-expanded={isSaveLoadOpen}
        aria-controls="SaveLoadModal">
          Save Load
        </button>
        {isSaveLoadOpen && <SaveLoad isOpen = {isSaveLoadOpen} setIsOpen={setIsSaveLoadOpen} projectState={[projectList, setProjectList]} parameterMap={parameterMap} onLoad={loadProject} userIDstate={[userID, setUserID]}/>}
      </div>

      {/* THIS DIV IS FOR THE SIMULATION */}
      <div id='sprayModel'>
        {/* PROJECT NAME */}
        <h3 id='projectName'>{getOrException(parameterMap, "project_name").value}</h3>
        {/* 3D MODEL */}
        <MainScreenVisual parameterMap={parameterMap}/>
      </div>

      {/* THIS DIV IS FOR THE BUTTON TO SEE THE RESULTS */}
      <div id='results'>
        {/* RESULTS */}
          <button onClick={navigateResults}> See Results </button>
      </div>      
    </div>
  );
}

interface pbProps{
  userID: number;
  setIsSignInOpen : React.Dispatch<React.SetStateAction<boolean>>
  setIsProfileOpen : React.Dispatch<React.SetStateAction<boolean>>
}

function ProfileButton({userID, setIsSignInOpen, setIsProfileOpen} : pbProps){
  
  if(userID === 1){
  return (
    <button className= "primaryBtn" onClick={() => setIsSignInOpen(true)}>
      Sign In
    </button>)
  }
  else{
    return (
      <button className= "primaryBtn" onClick={() => setIsProfileOpen(true)}>
        Profile
      </button>)
  }
}