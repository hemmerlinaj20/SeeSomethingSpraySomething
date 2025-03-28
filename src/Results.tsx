import { Link, useNavigate} from "react-router";
import { computeSprayPattern, updateParams, getPatternDimensions } from "./utility/Simulation/FullConveyorSimulation.ts";
import {UtilityInterfaces} from "./utility/models.ts"
import "./styles/Results.css"
import * as htmlToImage from "html-to-image";
import { useRef } from "react";
import { getOrException } from "./utility/ProjectUtilities.ts";
interface ResultsProps{
    params: [Map<string, UtilityInterfaces.Parameter>, React.Dispatch<React.SetStateAction<Map<string, UtilityInterfaces.Parameter>>>];
    timingMode: string
}

const LENGTH_GRANULARITY = 100;
const SIM_TIME_STEP = 0.001;
const ANTI_ALIASING_RADIUS = 2;
const IMAGE_SCREEN_FRACTION = 0.6;

const Results = ({params, timingMode}:ResultsProps) => {
    const [parameterMap] = params;

    //pass the parametermap to the simulation
    updateParams(parameterMap, timingMode);

    //get the spray pattern dimensions in inches
    const [patternLength, patternWidth] = getPatternDimensions(); 

    const widthToLengthRatio = patternWidth / patternLength;
   
    //determine granularity
    let widthElements = LENGTH_GRANULARITY;
    let lengthElements = Math.ceil( widthElements * (1 / widthToLengthRatio) );

    if(widthToLengthRatio > 1){
        //if width is greater than length, 
        lengthElements = LENGTH_GRANULARITY;
        widthElements = Math.ceil( lengthElements * widthToLengthRatio);
    }

    //determine the width and height of each displayed element as a percentage
    const elemHeight = 100 / widthElements;
    const elemWidth = 100 / lengthElements;

    //calculate the spray pattern
    const sprayPattern = computeSprayPattern(lengthElements, widthElements, SIM_TIME_STEP, ANTI_ALIASING_RADIUS)
    const productAspray = sprayPattern.pattern;

    //find the most dense part of the spray pattern
    let maxSpray = 0;

    let totalSprayGallons = 0;
    const patternArea = patternLength * patternWidth;
    const pixelAreaInches = patternArea / (widthElements * lengthElements)

    for (let col of productAspray){
        for(let element of col){
            const thisDensity = element.getElementSprayDensity();
            totalSprayGallons = totalSprayGallons + (thisDensity * pixelAreaInches);
            if (thisDensity > maxSpray){
                maxSpray = thisDensity;
            }
        }
    }
    console.log(`total volume applied was ${totalSprayGallons}`);

    //detect product edges
    for(let colI = 1; colI < productAspray.length-1; colI++ ){
        for(let rowI = 1; rowI < productAspray[colI].length; rowI++){
            for(let colOffset = -1; colOffset < 2; colOffset+=2){
                for(let rowOffset = -1; rowOffset < 2; rowOffset+=2){
                    if( productAspray[colI][rowI].isProduct && !productAspray[colI+colOffset][rowI+rowOffset].isProduct){
                        productAspray[colI+colOffset][rowI+rowOffset].isProductBorder = true;
                    }
                }
            }
        }
    }

//////////// code to export a screenshot ////////////////////////////////////////////////////////////////


    const screenshotArea = useRef(null);
    async function takeScreenshot(){
        if(!screenshotArea.current) return;
        htmlToImage.toPng(screenshotArea.current, {cacheBust: true})
            .then((dataUrl) => {
                navigatePrint(dataUrl);
            })
    }

    const navigate = useNavigate();
    function navigatePrint(dataURL: string){
        //const img = new Image();
        //img.src = dataURL;
        //navigate('/print/', {state:{img:dataURL}});
        const link = document.createElement('a')
        link.download = 'my-image-name.png'
        link.href = dataURL;
        link.click()
    }

//////////////////// prepare to draw the spray manifold ///////////////////////////////////////////

    //// determine display dimensions ////
    const desiredProductDisplayLengthPX = IMAGE_SCREEN_FRACTION * window.innerWidth;
    const desiredProductDisplayWidthPX = IMAGE_SCREEN_FRACTION * window.innerHeight;

    //assume screen height is the limiting factor
    let productImageHeight = desiredProductDisplayWidthPX;
    let productImageWidth = desiredProductDisplayWidthPX / widthToLengthRatio;

    if(desiredProductDisplayWidthPX / desiredProductDisplayLengthPX >= widthToLengthRatio){
        //the screen width is actually the limiting factor
        productImageWidth = desiredProductDisplayLengthPX;
        productImageHeight = desiredProductDisplayLengthPX * widthToLengthRatio;
    } 

    //get the ratio of pixels to inches
    const PixelsPerInch = productImageWidth / patternLength; 

    const numNozzles = Number(getOrException(parameterMap, "nozzle_count").value);
    const nozzleSpacing = Number(getOrException(parameterMap, "nozzle_spacing").value);

    const nozzleOffsets = [];
    for(let i = 0; i < numNozzles; i++){
        const inchesOffset = nozzleSpacing * (i - (numNozzles - 1)/2);
        const pixelsOffset = PixelsPerInch * inchesOffset;
        nozzleOffsets.push(pixelsOffset);
    }

//////////////////// return your html //////////////////////////////////////////////////////////
    return (
        <div id="results-container" className="centered" role="region" aria-description="A gradient representing the spray density on the product's surface" aria-label="spray pattern">
            <div id="images">    
                <div id="manifold-image" style={{height:`${productImageHeight*1.2}px`, width:`${productImageWidth*0.02}px`, overflow:"visible"}}>
                    {nozzleOffsets.map((offset, index) => <div key={index} className="nozzle-rect" 
                    style={{
                        position:"absolute", 
                        transform:`translate(-${productImageWidth*0.0125}px, ${offset}px)`,
                        height:`${productImageWidth*0.05}px`,
                        width: `${productImageWidth*0.05}px`
                    }}></div>)}
                </div>
                <div id="conveyor-image" style={{width:productImageWidth, height:productImageHeight}} ref={screenshotArea}>
                    {productAspray.map((col, colIndex) => 
                        <div className="spray-column" key={colIndex} style={{width:`${elemWidth}%`}}>
                            {col.map((element, rowIndex) => 
                                <div className='spray-element' style={
                                    {height:`${elemHeight}%`,
                                        backgroundColor:!element.isProductBorder ? 
                                            `rgb(${255 - (element.getElementSprayDensity()/maxSpray * 235 + 20)},${255 - (element.getElementSprayDensity()/maxSpray * 235 + 20)},255)`
                                            : 'rgb(0,0,0)'}
                                }
                                key={rowIndex}
                                >
                                    <div className="tooltiptext">
                                        <p className="tooltipP">{(128 * element.getElementSprayDensity()).toFixed(5)}</p>
                                        <p className="tooltipP">oz per square inch</p>
                                    </div>
                                </div>)}
                        </div>)
                    }
                </div>
            </div>
            <div>
                <Link to={"/"}>
                    <button> Back </button>
                </Link>
                <button onClick={takeScreenshot}> Export as PDF/Print </button>
            </div>
        </div>
    );
};
  
export default Results;
  