import one15 from "../assets/wizard/1-15.png"
import one25 from "../assets/wizard/1-25.png"
import one50 from "../assets/wizard/1-50.png"
import one80 from "../assets/wizard/1-80.png"
import one95 from "../assets/wizard/1-95.png"
import one110 from "../assets/wizard/1-110.png"

import two15 from "../assets/wizard/2-15.png"
import two25 from "../assets/wizard/2-25.png"
import two50 from "../assets/wizard/2-50.png"
import two80 from "../assets/wizard/2-80.png"
import two95 from "../assets/wizard/2-95.png"
import two110 from "../assets/wizard/2-110.png"

import three15 from "../assets/wizard/3-15.png"
import three25 from "../assets/wizard/3-25.png"
import three50 from "../assets/wizard/3-50.png"
import three80 from "../assets/wizard/3-80.png"
import three95 from "../assets/wizard/3-95.png"
import three110 from "../assets/wizard/3-110.png"

import four15 from "../assets/wizard/4-15.png"
import four25 from "../assets/wizard/4-25.png"
import four50 from "../assets/wizard/4-50.png"
import four80 from "../assets/wizard/4-80.png"
import four95 from "../assets/wizard/4-95.png"
import four110 from "../assets/wizard/4-110.png"

import five15 from "../assets/wizard/5-15.png"
import five25 from "../assets/wizard/5-25.png"
import five50 from "../assets/wizard/5-50.png"
import five80 from "../assets/wizard/5-80.png"
import five95 from "../assets/wizard/5-95.png"
import five110 from "../assets/wizard/5-110.png"

export interface WizardImageProps{
    nozzleNum: string;
    sprayAngle: string;
}

export const WizardImage = ({nozzleNum, sprayAngle} : WizardImageProps) => {
    let imagesrc = ""

    if(nozzleNum === "1"){
        if(sprayAngle === "15"){
            imagesrc = one15;
        }
        else if(sprayAngle === "25"){
            imagesrc = one25;
        }
        else if(sprayAngle === "50"){
            imagesrc = one50;
        }
        else if(sprayAngle === "80"){
            imagesrc = one80;
        }
        else if(sprayAngle === "95"){
            imagesrc = one95;
        }
        else if(sprayAngle === "110"){
            imagesrc = one110;
        }
    }
    else if(nozzleNum === "2"){
        if(sprayAngle === "15"){
            imagesrc = two15;
        }
        else if(sprayAngle === "25"){
            imagesrc = two25;
        }
        else if(sprayAngle === "50"){
            imagesrc = two50;
        }
        else if(sprayAngle === "80"){
            imagesrc = two80;
        }
        else if(sprayAngle === "95"){
            imagesrc = two95;
        }
        else if(sprayAngle === "110"){
            imagesrc = two110;
        }
    }
    if(nozzleNum === "3"){
        if(sprayAngle === "15"){
            imagesrc = three15;
        }
        else if(sprayAngle === "25"){
            imagesrc = three25;
        }
        else if(sprayAngle === "50"){
            imagesrc = three50;
        }
        else if(sprayAngle === "80"){
            imagesrc = three80;
        }
        else if(sprayAngle === "95"){
            imagesrc = three95;
        }
        else if(sprayAngle === "110"){
            imagesrc = three110;
        }
    }
    if(nozzleNum === "4"){
        if(sprayAngle === "15"){
            imagesrc = four15;
        }
        else if(sprayAngle === "25"){
            imagesrc = four25;
        }
        else if(sprayAngle === "50"){
            imagesrc = four50;
        }
        else if(sprayAngle === "80"){
            imagesrc = four80;
        }
        else if(sprayAngle === "95"){
            imagesrc = four95;
        }
        else if(sprayAngle === "110"){
            imagesrc = four110;
        }
    }
    if(nozzleNum === "5"){
        if(sprayAngle === "15"){
            imagesrc = five15;
        }
        else if(sprayAngle === "25"){
            imagesrc = five25;
        }
        else if(sprayAngle === "50"){
            imagesrc = five50;
        }
        else if(sprayAngle === "80"){
            imagesrc = five80;
        }
        else if(sprayAngle === "95"){
            imagesrc = five95;
        }
        else if(sprayAngle === "110"){
            imagesrc = five110;
        }
    }


    return <img src = {imagesrc} alt = "ProjectConfiguration" width = "" height = ""/>
}