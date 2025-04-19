/* eslint-disable @typescript-eslint/no-explicit-any */
import './styles/App.css';
import { NozzleDrawer, LineDrawer, ControllerDrawer } from './Drawers.tsx';
import { Parameter, paraUnits} from'./Parameter.tsx';
import { nozzleIndex, lineIndex } from './Parameter.tsx';
import { sprayAngleOptions } from './Parameter.tsx';
import { SignIn } from './Modals/SignInModal.tsx'
import { Documentation } from './Modals/DocumentationModal.tsx'
import { SaveLoad } from './Modals/SaveLoadModal.tsx'
import { Loading } from './Modals/LoadingModal.tsx'
import { Wizard } from './Modals/WizardModal.tsx'
import { Profile } from './Modals/ProfileModal.tsx'
import { ResetPassword, ResetPasswordConfirm } from './Modals/ResetPasswordModal.tsx'
import { Info } from './Modals/InfoModal.tsx'
import { UserInfoResponse } from './utility/auth_requests.ts';
import { useState, useEffect, ChangeEvent } from "react";
import { Models } from './utility/models';
import { useNavigate} from 'react-router';
import { Dropdown } from "./Modals/ModalUtil.tsx";
import { UtilityInterfaces } from "./utility/models";
import { pushRunToDatabase } from './utility/ProjectUtilities.ts';
import MainScreenVisual from './MainScreenVisual';
import './utility/auth_requests.ts';
import { getOrException, listUserProjects} from "./utility/ProjectUtilities.ts";
import { flowRateEstimate, overlapPercentage } from './utility/Simulation/MathFunctions.ts';
import { updateParamsAndRerender } from './utility/updateParamsAndRerender.ts';
import { LoginFailed } from './Modals/FailedLoginModal.tsx';
import { CreateAccount } from './Modals/CreateAccountModal.tsx';
import { AccountCreationFailed } from './Modals/FailedCreationModal.tsx';
import overlapInfo from "./assets/Overlap Info.png";
import estimatedFlowrateInfo from "./assets/EstimatedFlowrateInfo.png";
import timingModeHelp from "./assets/TimingModeInfo.png";
import { ImageModal } from './Modals/ImageModal.tsx';

interface AppProps{
  parameters: [Map<string, UtilityInterfaces.Parameter>, React.Dispatch<React.SetStateAction<Map<string, UtilityInterfaces.Parameter>>>];
  projectState: [Models.ProjectBase[], React.Dispatch<React.SetStateAction<Models.ProjectBase[]>>]
  userState : {idState:[number, React.Dispatch<React.SetStateAction<number>>],
    unState:[string, React.Dispatch<React.SetStateAction<string>>],
    emailState:[string, React.Dispatch<React.SetStateAction<string>>]
  }
}

//Props: Render the app with a specific set of parameters that are determined beforehand
//This keeps it from resetting them when navigating react router, and it will
//be easier to work in loading saved projects
export default function App({parameters, projectState, userState}: AppProps) {
  const [isNozzleDrawerOpen, setIsNozzleDrawerOpen] = useState(false);
  const [isControllerDrawerOpen, setIsControllerDrawerOpen] = useState(false);
  const [isLineDrawerOpen, setIsLineDrawerOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isForgetSuccessOpen, setIsForgetSuccessOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginFailedOpen, setLoginFailedOpen] = useState(false);
  const [isCreationFailedOpen, setCreationFailedOpen] = useState(false);
  const [isDocumentationOpen, setIsDocumentationOpen] = useState(false);
  const [isSaveLoadOpen, setIsSaveLoadOpen] = useState(false);
  const [isOverlapOpen, setIsOverlapOpen] = useState(false);
  const [isFlowRateOpen, setIsFlowRateOpen] = useState(false);
  const [isTimingModeOpen, setIsTimingModeOpen] = useState(false);  
  const [isLoading, setIsLoading] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedNozzle, setSelectedNozzle] = useState<string>("");

  //store email and username in a way that will persist across renders
  const [userID, setUserID] = userState.idState;
  const [username, setUsername] = userState.unState;
  const [email, setEmail] = userState.emailState;

  //Method for transfering info abour selectedId to the Modal
  const handleOpenInfo = (id: number) => {
    setSelectedId(id);
    setIsInfoOpen(true);
  }
  //These are states that were passed down from main
  const [projectList, setProjectList] = projectState;
  const [parameterMap, setParameterMap] = parameters;
  const [timingMode, setTimingMode] = useState(parameterMap.get("timing_mode") != undefined ? parameterMap.get("timing_mode")?.value : "auto");

  //When someone logs in, set the userID state and reload the project list
  async function awaitAndSetUserInfo(newInfo : Promise<UserInfoResponse>) {
    setIsSignInOpen(false);
    setIsLoading(true);
    try{
      const responseData = await newInfo;
      const IDToSet = responseData.uid;
      setUserID(IDToSet);
      setProjectList(await listUserProjects(IDToSet));
      const usernameToSet = responseData.username;
      if(typeof usernameToSet === "string"){
        setUsername(usernameToSet);
      }
      const emailToSet = responseData.email;
      if(typeof emailToSet === "string"){
        setEmail(emailToSet);
      }
    }
    catch (error){
      console.log(error);
    }
    setIsLoading(false);        
  }
  useEffect(() => {
    async function loadMap(){
      if(parameterMap.get("timing_mode") != undefined){
        setTimingMode(String(parameterMap.get("timing_mode")?.value));
      }
      else{
        setTimingMode("auto");
        updateTimingModeHelper("auto");
      }  
      for(const [key, value] of parameterMap){
        const inputElement: HTMLInputElement|null = document.querySelector("#" + key + "_input");
        if(inputElement){
          inputElement.defaultValue = String(value.value);
        }   
      }
      setSelectedNozzle(String(parameterMap.get("spray_angle")?.value));
    }
    loadMap();
  })

  //On loading project, set the parameter map and change all of the parameter input elements
  async function loadProject(params: Map<string, UtilityInterfaces.Parameter>){
    for(const [key, value] of params){
      const inputElement: HTMLInputElement|null = document.querySelector("#" + key + "_input");
      if(inputElement){
        inputElement.value = String(value.value);
        const event = new Event('change');
        inputElement.dispatchEvent(event);
      }   
    }
    await setParameterMap(params);   
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
  useEffect(() => {
    for(const parameterInput of parameterInputs){
      parameterInput.addEventListener("change", eventListenerStuff);
    }
  });    

  function eventListenerStuff(event: Event){
    if(event.target instanceof (HTMLInputElement)){
      const parameterInput: HTMLInputElement = event.target;
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
        parameterMap.set(key, currentParameter);
        for(const parameterInput of parameterInputs){
          parameterInput.removeEventListener("change", eventListenerStuff);
        }
        updateParamsAndRerender(parameterMap, setParameterMap);
        parameterInput.value = String(newVal);

        if(timingMode === "auto" && (currentParameter.name === "sensor_distance" || currentParameter.name === "product_length" || currentParameter.name === "line_speed")){
          autoCalculateTiming();  
        }
      }
    }
    
  }
  
  
  //Create all of the HTML elements for the input fields in the left side drawers
  function constructParameterInputList(){
    parameterList = [];
    for(const [key, value] of parameterMap){
      //Make a text input field for string parameters
      if(value.min!=null && value.max!=null){
        parameterList.push(
          <li id={key + "_list"} key={key}>
            <p>{key.replace("_", " ").replace("_", " ").toUpperCase()}</p>
            <input className="parameter_input" id={key + "_input"} type="number" min={value.min} max={value.max}></input>
          </li>
        );
      }
      else{
        parameterList.push(
          <li id={key + "_list"} key={key}>
            <p>{key.replace("_", " ").replace("_", " ").toUpperCase()}</p>
            <input className="parameter_input" id={key + "_input"} type={value.type==UtilityInterfaces.types.STRING ? "text" : "number"}></input>
          </li>
        );
      }
    }
      // New Parameter for containing the dropdown
        parameterList.push(
          <li id={"ANGLEARRAY_list"} key={"ANGLEARRAY"}>
              <p>{"SPRAY ANGLE"}</p>
        <Dropdown options={sprayAngleOptions} currentSelected={selectedNozzle} onChange={(value) => {setSelectedNozzle(value); 
          const SprayAngleParam = parameterMap.get("spray_angle");
          if (typeof SprayAngleParam !== "undefined"){
          SprayAngleParam.value = value;
          setParameterMap(parameterMap.set("spray_angle", SprayAngleParam))}}}/>
          </li>)

  }

  //this function has to be inside the app component because it needs access to the parametermap
  //possible timing modes are
  //vt = variable time, ft = fixed time, auto

  function autoCalculateTiming() : void {
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
    const parameter: UtilityInterfaces.Parameter = {
      name:"timing_mode",
      type: UtilityInterfaces.types.STRING,
      value: newTimeMode
    }
    parameterMap.set('timing_mode', parameter);
    setTimingMode(newTimeMode);
    updateParamsAndRerender(parameterMap, setParameterMap);
  }

  function updateTimingMode(e:ChangeEvent<HTMLSelectElement>) : void{
    updateTimingModeHelper(e.target.value);
  }
  
  //ensure the necessary fields are grayed out 
  let startDelayGrayed = "";
  let stopDelayGrayed = "";
  let sprayDurationGrayed = "";
  if(timingMode === "vt"){
    sprayDurationGrayed = "hidden-timing-mode";
  }
  else if(timingMode === "ft"){
    stopDelayGrayed = "hidden-timing-mode";
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
  //Stupid legacy code that is there in case the project has the old names for these.
  //Should be removed for production
  //Names SHOULD be "alignment" and "spray_angle"
  let twist_angle = 5;
  let nozzle_angle = 110;
  if(parameterMap.get('alignment') === undefined){
    twist_angle = Number(getOrException(parameterMap, "twist_angle").value);
  }
  else{
    twist_angle = Number(getOrException(parameterMap, "alignment").value);
  }
  if(parameterMap.get('spray_angle') === undefined){
    nozzle_angle = Number(getOrException(parameterMap, "angle").value);
  }
  else{
    nozzle_angle = Number(getOrException(parameterMap, "spray_angle").value);
  } 

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
// 32 = ANGLE DROPDOWN, 33 = CONTROLLER DROPDOWN

// Reset Password Modal and Forget Password Modal are for testing purposes only, and will be removed once links work correctly
  return (    
    // THIS IS THE PARENT DIV TO CONTAIN EVERYTHING
    <div id='pageContainer'>
      {isLoading && <Loading isOpen={isLoading} setIsOpen={setIsLoading} setBG={true}/>}     
      {/* THIS DIV IS FOR THE DRAWERS */}
      <div id='drawers'>
        {/* NOZZLE DRAWER */}
        <button onClick={() => setIsNozzleDrawerOpen(true)}
        aria-expanded={isNozzleDrawerOpen}
        aria-controls="nozzleDrawer">Nozzle</button>
        <NozzleDrawer isOpen={isNozzleDrawerOpen} onClose={() => setIsNozzleDrawerOpen(false)}>

        <div className="" style = {{display: "flex", alignItems: "center"}}>
          {parameterList[33]} <span className="units">{paraUnits[33]}</span> <button className='info-btn' onClick={() => {handleOpenInfo(24)}}                    
                    aria-expanded={isInfoOpen}
                    aria-controls="Spray Angle"></button></div>
        <div>
          {nozzleIndex.map((_) => (
            <Parameter key = {_} parameterList= {parameterList} paramUnits = {paraUnits} 
            isInfoOpen = {isInfoOpen} handleOpenInfo = {handleOpenInfo} index = {_} 
            />
          ))}
          </div>
                      
          <p>
            NOZZLE OVERLAP PERCENTAGE: {(nozzleCount > 1) ? `${overlap.toFixed(0)}%` : "N/A"}
            <span className="right-align special-align"><button className='info-btn' onClick={() => {setIsOverlapOpen(true)}}/></span>
          </p>

          <p>
            PROJECTED FLOW RATE: {estimatedFlowrate.toFixed(3)} gal/min
            <span className="right-align special-align"><button className='info-btn' onClick={() => {setIsFlowRateOpen(true)}}/></span>
          </p>
        
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
        <ControllerDrawer isOpen={isControllerDrawerOpen} onClose={() => setIsControllerDrawerOpen(false)}>
          
          <div>
            Timing Mode: 
            <select value={timingMode} onChange={updateTimingMode}>
              <option key="auto" value="auto">Auto-Calculate</option> 
              <option key="ft" value="ft">Fixed Time</option>
              <option key="vt" value="vt">Variable Time</option>
            </select> 
            <button className='info-btn right-align' onClick={() => {setIsTimingModeOpen(true);}}/>
          </div>

          <div id="start-delay-div" className={`visible-timing-mode ${startDelayGrayed}`} style = {{display: "flex", alignItems: "center"}}>
          {parameterList[17]} <span className="units">{paraUnits[17]}</span> <button className='info-btn' onClick={() => {handleOpenInfo(17)}}                    
                    aria-expanded={isInfoOpen}
                    aria-controls="Start Delay"></button></div>

          <div id="stop-delay-div" className={`visible-timing-mode ${stopDelayGrayed}`} style = {{display: "flex", alignItems: "center"}}>
          {parameterList[18]} <span className="units">{paraUnits[18]}</span> <button className='info-btn' onClick={() => {handleOpenInfo(18)}}                    
                    aria-expanded={isInfoOpen}
                    aria-controls="Stop Delay"></button></div>

          <div id="spray-duration-div" className= {`visible-timing-mode ${sprayDurationGrayed}`} style = {{display: "flex", alignItems: "center"}}>
          {parameterList[16]} <span className="units">{paraUnits[16]}</span> <button className='info-btn' onClick={() => {handleOpenInfo(16)}}                    
                    aria-expanded={isInfoOpen}
                    aria-controls="Spray Duration"></button></div>
          
          {/*controller name: */}
          {/*<Parameter key = {28} parameterList= {parameterList} paramUnits = {paraUnits} 
          isInfoOpen = {isInfoOpen} handleOpenInfo = {handleOpenInfo} index = {28} />*/}

          <Parameter key = {31} parameterList= {parameterList} paramUnits = {paraUnits} 
          isInfoOpen = {isInfoOpen} handleOpenInfo = {handleOpenInfo} index = {31} />

          <Parameter key = {0} parameterList= {parameterList} paramUnits = {paraUnits} 
          isInfoOpen = {isInfoOpen} handleOpenInfo = {handleOpenInfo} index = {0} />

          <Parameter key = {15} parameterList= {parameterList} paramUnits = {paraUnits} 
          isInfoOpen = {isInfoOpen} handleOpenInfo = {handleOpenInfo} index = {15} />
        
        


        </ControllerDrawer>
        <Info isOpen = {isInfoOpen} setIsOpen={setIsInfoOpen} selectedId={selectedId}/>

      </div>

      {/* THIS DIV IS FOR THE MODALS ON THE RIGHT SIDE */}
      <div id='navigation'>
        {/* SIGN IN / PROFILE */}

        <ProfileButton userID={userID} setIsProfileOpen={setIsProfileOpen} setIsSignInOpen={setIsSignInOpen}/>
        <SignIn isOpen = {isSignInOpen} setIsLIOpen={setIsSignInOpen} setIsCAOpen={setIsCreateAccountOpen} setIsFPOpen={setIsResetPasswordOpen} setUserInfo={awaitAndSetUserInfo} setFailedOpen={setLoginFailedOpen}/>
        <CreateAccount isOpen = {isCreateAccountOpen} setIsCAOpen={setIsCreateAccountOpen} setIsLIOpen={setIsSignInOpen} setIsFPOpen={setIsResetPasswordOpen} setUserInfo={awaitAndSetUserInfo} setFailedOpen={setCreationFailedOpen}/>
        <ResetPassword isOpen={isResetPasswordOpen} setIsOpen={setIsResetPasswordOpen} setIsFSOpen={setIsForgetSuccessOpen} setIsCAOpen={setIsCreateAccountOpen} setIsLIOpen={setIsSignInOpen}/>
        <ResetPasswordConfirm isOpen={isForgetSuccessOpen} setIsOpen={setIsForgetSuccessOpen}/>
        <Profile isOpen={isProfileOpen} setIsOpen={setIsProfileOpen} setUserInfo={awaitAndSetUserInfo} username={username} email={email} userID={userID}/>


        <LoginFailed isOpen={isLoginFailedOpen} setIsOpen={setLoginFailedOpen} setParentOpen={setIsSignInOpen}/>
        <AccountCreationFailed isOpen={isCreationFailedOpen} setIsOpen={setCreationFailedOpen} setParentOpen={setIsCreateAccountOpen}/>
    
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
        {isSaveLoadOpen && <SaveLoad setIsLoading={setIsLoading} isOpen = {isSaveLoadOpen} setIsOpen={setIsSaveLoadOpen} setIsWizardOpen={setIsWizardOpen} projectState={[projectList, setProjectList]} parameterMap={parameterMap} onLoad={loadProject} userIDstate={[userID, setUserID]}/>}
        {isWizardOpen && <Wizard setIsLoading={setIsLoading} updateMap={setParameterMap} setIsSaveLoadOpen={setIsSaveLoadOpen} isOpen = {isWizardOpen} setIsOpen={setIsWizardOpen} projectState={[projectList, setProjectList]} parameterMap={parameterMap} userIDstate={[userID, setUserID]}/>}
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
          <button onClick={() => {setIsLoading(true);navigateResults();}}> See Results </button>
      </div>  

      <ImageModal isOpen={isOverlapOpen} setIsOpen={setIsOverlapOpen} imagePath={overlapInfo}/>
      <ImageModal isOpen={isTimingModeOpen} setIsOpen={setIsTimingModeOpen} imagePath={timingModeHelp}/>
      <ImageModal isOpen={isFlowRateOpen} setIsOpen={setIsFlowRateOpen} imagePath={estimatedFlowrateInfo}/>  
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