import React from 'react';
import { createControllerArray} from "./utility/ProjectUtilities";
import { useState } from 'react';
import { Option } from "./Modals/ModalInterfaces.tsx";
import './styles/Drawer.css';

export const paraNames: string[] = [
    "Duty Cycle", "Fluid Pressure", "Last Modified", "Line Speed", "Line Width", 
    "Nozzle Count", "Nozzle Height", "Nozzle Spacing", "Owner ID", 
    "Product Height", "Product Length", "Product Width", 
    "Project Description", "Project ID", "Project Name",
    "Sensor Distance", "Spray Duration", "Start Delay", "Stop Delay", "Spray Angle", "Flow Rate",
    "Nozz Doc Link",  "Nozzle ID", "Nozzle Name", "Spray Shape", "Alignment",
    "Controller Doc Link", "Controller ID", "Controller Name", "Gun Id", "Gun Name", "Max Frequency", "Overlap Distance",
    "Spray Angle Array", "Controller Array" 
  ]

  export const paraUnits: string[] = [
    "%", "psi", "", "feet/min", "inches", 
    "", "inches", "inches", "",
    "inches", "inches", "inches", 
    "", "", "", 
    "inches", "seconds", "seconds", "seconds", "degrees", "gal/min", 
    "", "", "", "", "degrees", 
    "", "", "", "", "", "cycles/min", "%", 
    "degrees", ""
  ]
  
  export const paramDesc: string[] = [
    "The percentage of Open time to Close time during a single cycle of the nozzle.",
    "The force applied on the liquid as it exits the nozzle", 
    "Last Time changes were made and saved in this proeject",
    "In feet per second the rate at which the conveyor belt turns",
    "In inches the width of the conveyor belt",
    "Number of nozzles present above current project",
    "In inches the distance a nozzle lies above the conveyor belt",
    "In inches the distance between a nozzle and another nozzle above the conveyor belt",
    "The numerical representation of a user account",
    "In inches, the sprayed products height",
    "In inches, the sprayed products length",
    "In inches, the sprayed products width",
    "Textual Representation of a projects purpose",
    "The numerical representation of a created project",
    "Text identifier of the project",
    "In inches the distance between the product sensor and the nozzle array",
    "In seconds, the amount of time liquid flows out of the nozzle",
    "In seconds, the time from when the product is sensed, and when the nozzle starts spraying",
    "In seconds The time the nozzles remain spraying after the product is no longer detected by the sensor",
    "In degrees the angle of liquid spray exiting a nozzle",
    "In gallons per minutes the amount of liquid exiting a nozzle",
    "A link to the Spraying Systems catalog containing information on this nozzle", 
    "The numerical representation of a nozzle",
    "Text identifier of the nozzle",
    "In degrees the angle of liquid spray exiting a nozzle",
    "In degrees the amount of tilt the nozzle head has in comparison to the conveyor belt",
    "A link to the Spraying Systems catalog containing information on this controller",
    "The numerical representation of a controller",
    "Text identifier of the controller",
    "The numerical representation of a spray gun",
    "Text identifier of the spray gun",
    "In number of cycles per minute, the amount of open and close sequences a nozzle makes",
    "The percentage of product sprayed with fluid from at least two nozzles",
    "In degrees the angle of liquid spray exiting a nozzle",
     "Text identifier of the controller"
  ]

  export const nozzleIndex: number[] = [
    5, 6, 7, 20, 1, 19
  ]

  export const nozzleSpacing: number[] = [
    15, 15, 50, 50, 50
  ]

  export const lineIndex: number[] = [
    3, 4, 9, 10, 11
  ]

  export const lineSpacing: number[] = [
    65, 60, 14, 12, 20
  ]

  export const controllerIndex: number[] = [
    28, 0, 31, 15, 17, 18, 16
  ]

  export const controllerSpacing: number[] = [
    37, 50, 37, 10, 43, 48, 0
  ]

  let controllers = new Map<number, string>([
    [0, "E1750+"], [1, "E2150+"]
  ])

  export const controllersOptions = Array.from(controllers.entries()).map(([value, name]) => ({
    value: value.toString(),
    label: name.toString(),
  }))

  let commonAnglesA = new Map<number, number>([
    [110, 110], [95, 95], [80, 80], [50, 50], [25, 25], [15, 15]
  ])

  export const sprayAngleOptions = Array.from(commonAnglesA.entries()).map(([angle, value]) => ({
    value: angle.toString(),
    label: value.toString(),
  }))

  let NozzleNumber = new Map<number, number>([
    [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6], [7, 7], [8, 8], 
    [9, 9], [10, 10], [11, 11], [12, 12], [13, 13], [14, 14], [15, 15], [16, 16]
  ])

  export const nozzleNumberOptions = Array.from(NozzleNumber.entries()).map(([num, value]) => ({
    value: num.toString(),
    label: value.toString(),
  }))

interface ParamProps {
    parameterList: string[];
    paramUnits: string[];
    isInfoOpen: boolean;
    handleOpenInfo: (index: number) => void;
    index: number;
}

 export const Parameter: React.FC<ParamProps> = ({ parameterList, paramUnits, isInfoOpen, handleOpenInfo, index }) => {
   return (
     <>
        <div style = {{display: "flex", alignItems: "center"}}>
            {parameterList[index]} {paramUnits[index]} 
                <button className = 'info-btn' onClick={() => {handleOpenInfo(index)}}
             aria-expanded={isInfoOpen}
             aria-controls={paraNames[index]}></button>
        </div>
     </>
   );
 };