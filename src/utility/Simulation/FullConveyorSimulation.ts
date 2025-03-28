import {UtilityInterfaces} from "../models.ts"
import { toRadians, distance } from "./MathFunctions.ts";
/* A NOTE ON UNITS AND COORDINATES

all lengths are stored in inches, all times in seconds, and all angles in degrees

Let the direction the conveyor belt moves be the positive x direction
Let up from the conveyor belt be the positve z direction
Let to the left of the positive x direction be positive y

If you face the positive x direction, the origin is the right-most point on the conveyor belt that is directly beneath the spray manifold

t=0 at the instant the product reaches the sensor

*/

namespace GlobalParams{
    //once this is integrated into the application, these will be acquired from the drawer
    //THESE VALUES SHOULD NOT BE CHANGED OUTSIDE OF THE SETGLOBALPARAMS METHOD
    export let SENSOR_DISTANCE = 18;
    export let LINE_SPEED = 10; //50 ft/min *12in/foot * 1min/60sec = 10 in/sec

    export let LINE_WIDTH = 24;

    export let PRODUCT_WIDTH = 20;//in.
    export let PRODUCT_LENGTH = 36;
    export let PRODUCT_HEIGHT = 2;

    export let NOZZLE_HEIGHT = 6; //in.

    export const WIDTH_ANGLE = 3; //let the spray width be three degrees

    export let SPRAY_START_TIME = 1.8; //s
    export let SPRAY_END_TIME = 5.4;
    export let SPRAY_DURATION = 3.6;

    export let VIRTUAL_LINE_LENGTH = 1.2 * LINE_SPEED * SPRAY_DURATION; //in.

    export let MAX_FREQUENCY = 3000; //Hz
    export let DUTY_CYCLE = 1; // this 1 represents 100%
    export let FREQUENCY = 0; // 0 Hz means the nozzle is on for 100% of the spray duration

    export let ON_TIME = 1;
    export let OFF_TIME = 0;
    export let PERIOD = ON_TIME + OFF_TIME;

    export class Nozzle{
        readonly sprayAngle: number; //should be on the order of 60 degrees
        readonly thicknessAngle: number; //should be on the order of 3 degrees
        readonly twistAngle: number; //should be on the order of 5 degrees
        readonly flowRate: number; //stored in gallons per second
        readonly yPos: number

        constructor(spray_angle:number, thickness_angle:number, twist_angle:number, flowrate_galpermin:number, yPos:number){
            this.sprayAngle = spray_angle;
            this.thicknessAngle = thickness_angle;
            this.twistAngle = twist_angle;
            this.flowRate = flowrate_galpermin/60; //comes in as gallons/minute -> gal/min * 1min/60sec
            this.yPos = yPos;
        }
    }
    export let NOZZLE_LIST : Nozzle[] = [new Nozzle(100, 3, 5, 2, 18),
                                            new Nozzle(100, 3, 5, 2, 11)];
}

export function updateParams(parameterMap:Map<String, UtilityInterfaces.Parameter>, timingMode:string){
    const new_sensor_distance = parameterMap.get("sensor_distance");
    if(typeof new_sensor_distance !== "undefined"){
        GlobalParams.SENSOR_DISTANCE = Number(new_sensor_distance.value);
    }

    const new_line_speed = parameterMap.get("line_speed");
    if(typeof new_line_speed !== "undefined"){
        //divide by 5 to convert from ft/min to in/s (1 ft/min * 12in/ft * 1min/60s = 1in/5s)
        GlobalParams.LINE_SPEED = Number(new_line_speed.value) / 5;
    }

    const new_line_width = parameterMap.get("line_width");
    if(typeof new_line_width !== "undefined"){
        GlobalParams.LINE_WIDTH = Number(new_line_width.value);
    }

    const new_product_width = parameterMap.get("product_width");
    if(typeof new_product_width !== "undefined"){
        GlobalParams.PRODUCT_WIDTH = Number(new_product_width.value);
    }

    const new_product_length = parameterMap.get("product_length");
    if(typeof new_product_length !== "undefined"){
        GlobalParams.PRODUCT_LENGTH = Number(new_product_length.value);
    }

    const new_product_height = parameterMap.get("product_height");
    if(typeof new_product_height !== "undefined"){
        GlobalParams.PRODUCT_HEIGHT = Number(new_product_height.value);
    }

    const new_nozzle_height = parameterMap.get("nozzle_height");
    if(typeof new_nozzle_height !== "undefined"){
        GlobalParams.NOZZLE_HEIGHT = Number(new_nozzle_height.value);
    }

    const new_flow_rate = parameterMap.get("flow_rate");
    
    //Nozzles!
    let new_nozzle_count = parameterMap.get("nozzle_count");
    let new_nozzle_spacing = parameterMap.get("nozzle_spacing");
    let new_spray_angle = parameterMap.get("angle");
    let new_twist_angle = parameterMap.get("twist_angle");

    if(typeof new_nozzle_count !== "undefined" && typeof new_nozzle_spacing !== "undefined" && typeof new_spray_angle !== "undefined" && typeof new_twist_angle !== "undefined" && typeof new_flow_rate !== "undefined"){
        GlobalParams.NOZZLE_LIST = [];
        for (let i = 0; i < Number(new_nozzle_count.value); i++){
            const this_pos = 0.5 * GlobalParams.LINE_WIDTH + Number(new_nozzle_spacing.value) * (0.5 - 0.5*Number(new_nozzle_count.value) + i);
            const new_nozzle = new GlobalParams.Nozzle(Number(new_spray_angle.value),GlobalParams.WIDTH_ANGLE,Number(new_twist_angle.value),Number(new_flow_rate.value),this_pos);//read and replace parameters
            GlobalParams.NOZZLE_LIST.push(new_nozzle);
        }
    }

    //timing mode params
    //if start_delay is undefined, then that's a problem. One of the other two is allowed to be undefined
    let new_start_delay = parameterMap.get("start_delay");
    let new_stop_delay = parameterMap.get("stop_delay");
    let new_spray_duration = parameterMap.get("spray_duration");

    if(typeof new_start_delay !== "undefined"){
        //this is simple, because t=0 is when the sensor is triggered
        GlobalParams.SPRAY_START_TIME = Number(new_start_delay.value);
    }

    //we're in fixed time/distance
    if(timingMode === "ft" && typeof new_stop_delay !== "undefined" && typeof new_spray_duration !== "undefined"){
        GlobalParams.SPRAY_DURATION = Number(new_spray_duration.value);
        GlobalParams.SPRAY_END_TIME = GlobalParams.SPRAY_START_TIME + GlobalParams.SPRAY_DURATION;
    }
    //we're in variable time/distance
    else if(timingMode === "vt" && typeof new_stop_delay !== "undefined" && typeof new_spray_duration !== "undefined"){
            const falling_edge_trigger_time = GlobalParams.PRODUCT_LENGTH / GlobalParams.LINE_SPEED;
            GlobalParams.SPRAY_END_TIME = falling_edge_trigger_time + Number(new_stop_delay.value);
            GlobalParams.SPRAY_DURATION = GlobalParams.SPRAY_END_TIME - GlobalParams.SPRAY_START_TIME; 
    }

    //if there was an error receiving or setting timing modes, default to automatic timing
    if(GlobalParams.SPRAY_DURATION.toFixed(2) !== (GlobalParams.SPRAY_END_TIME - GlobalParams.SPRAY_START_TIME).toFixed(2)){
        console.error(`TIMING MODE ENTRY ERROR - given values don't match:\nstart time: ${GlobalParams.SPRAY_START_TIME}\nend time: ${GlobalParams.SPRAY_END_TIME}\nduration: ${GlobalParams.SPRAY_DURATION}\n\ndefaulting to automatic timing.`)
        GlobalParams.SPRAY_START_TIME = GlobalParams.SENSOR_DISTANCE / GlobalParams.LINE_SPEED - 0.01; //start just before the product arrives
        GlobalParams.SPRAY_DURATION = GlobalParams.PRODUCT_LENGTH / GlobalParams.LINE_SPEED;
        GlobalParams.SPRAY_END_TIME = GlobalParams.SPRAY_START_TIME + GlobalParams.SPRAY_DURATION + 0.02;
        console.log(`Auto starting at ${GlobalParams.SPRAY_START_TIME}\nAuto-ending at ${GlobalParams.SPRAY_END_TIME}`); //end just after the product passes
    }

    GlobalParams.VIRTUAL_LINE_LENGTH = 1.2 * GlobalParams.LINE_SPEED * GlobalParams.SPRAY_DURATION;

    //duty cycle and frequency
    const new_duty_cycle = parameterMap.get("duty_cycle");
    const new_max_frequency = parameterMap.get("max_frequency");

    if(typeof new_duty_cycle !== "undefined" ){
        let ndc = Number(new_duty_cycle.value)

        if(ndc > 1){ //convert from percentage to fraction if necessary
            ndc = ndc / 100;
        }

        GlobalParams.DUTY_CYCLE = ndc;
    }
    if(typeof new_max_frequency !== "undefined"){
        let nmf = Number(new_max_frequency.value);

        nmf = nmf / 60; //convert from cycles/min to Hz 

        GlobalParams.MAX_FREQUENCY = nmf;
    }

    //set on time and off time based on duty cycle and max frequency
    //this WILL cause problems if Duty Cycle isn't normalized from 0 to 1
    if(GlobalParams.DUTY_CYCLE >= 1){
        GlobalParams.ON_TIME = 1;
        GlobalParams.OFF_TIME = 0;
    }
    else if(GlobalParams.DUTY_CYCLE <= 0){
        GlobalParams.ON_TIME = 0;
        GlobalParams.OFF_TIME = 1;
    }
    else{
         if(GlobalParams.DUTY_CYCLE <= 0.5){
            GlobalParams.FREQUENCY = GlobalParams.MAX_FREQUENCY * GlobalParams.DUTY_CYCLE / 0.5;
        }
        else{
            GlobalParams.FREQUENCY = 2 * GlobalParams.MAX_FREQUENCY - GlobalParams.MAX_FREQUENCY * GlobalParams.DUTY_CYCLE / 0.5;
        }  
        const cycle_period = 1 / GlobalParams.FREQUENCY;

        GlobalParams.ON_TIME = GlobalParams.DUTY_CYCLE * cycle_period;
        GlobalParams.OFF_TIME = (1 - GlobalParams.DUTY_CYCLE) * cycle_period;
    }
    GlobalParams.PERIOD = GlobalParams.OFF_TIME + GlobalParams.ON_TIME;

    // console.log(`On time: ${GlobalParams.ON_TIME}`);
    // console.log(`off time: ${GlobalParams.OFF_TIME}`);
}

namespace LocalConstants{
    export let TIME_STEP = 0.0001; //second

    export let NUM_WIDTH_ELEMENTS = 100;
    export let ELEMENT_WIDTH = GlobalParams.LINE_WIDTH/NUM_WIDTH_ELEMENTS;

    export let NUM_LENGTH_ELEMENTS = 100;
    export let ELEMENT_LENGTH = GlobalParams.VIRTUAL_LINE_LENGTH/NUM_LENGTH_ELEMENTS;

    export let ELEMENT_AREA = ELEMENT_LENGTH*ELEMENT_WIDTH;

    export let INITIAL_X_FRONT = GlobalParams.LINE_SPEED * (0.1 * GlobalParams.SPRAY_DURATION - GlobalParams.SPRAY_START_TIME);

    export function updateSimulationDimensions(lengthElements : number, widthElements: number, timeStep:number){
        TIME_STEP = timeStep;

        NUM_LENGTH_ELEMENTS = lengthElements;
        NUM_WIDTH_ELEMENTS = widthElements;

        ELEMENT_WIDTH = GlobalParams.LINE_WIDTH/NUM_WIDTH_ELEMENTS;
        ELEMENT_LENGTH = GlobalParams.VIRTUAL_LINE_LENGTH/NUM_LENGTH_ELEMENTS;
        ELEMENT_AREA = ELEMENT_LENGTH*ELEMENT_WIDTH;

        INITIAL_X_FRONT = GlobalParams.LINE_SPEED * (0.1 * GlobalParams.SPRAY_DURATION - GlobalParams.SPRAY_START_TIME);
    }
}

class SprayedElement{
    readonly isProduct : boolean;
    readonly yPos: number;
    readonly xOffset: number;
    private totalDensityApplied: number; //stored as gal/in^2

    public isProductBorder = false;

    //xOffset is the x-position of this element's center at t=0
    //yPos is the y-value of this element's center's position. It does not change.
    constructor(xIndex:number, yIndex:number){
        this.yPos = LocalConstants.ELEMENT_WIDTH*(0.5+yIndex);
        this.xOffset = LocalConstants.INITIAL_X_FRONT - 1*LocalConstants.ELEMENT_LENGTH*(0.5+xIndex);
        this.totalDensityApplied = 0;

        const x_product_front = -1 * GlobalParams.SENSOR_DISTANCE;
        const x_product_back = x_product_front - GlobalParams.PRODUCT_LENGTH;
        const y_product_left = 0.5 * (GlobalParams.LINE_WIDTH + GlobalParams.PRODUCT_WIDTH);
        const y_product_right = 0.5 * (GlobalParams.LINE_WIDTH - GlobalParams.PRODUCT_WIDTH);

        this.isProduct = this.xOffset <= x_product_front && this.xOffset >= x_product_back && this.yPos <= y_product_left && this.yPos >= y_product_right; 
    }

    //send in the spray density that this element is receiving in units of (gallons of spray)/((square inch of product)*(second))
    //add that density to this SprayedElement for one timestep
    addSpray(sprayDensity:number){
        this.totalDensityApplied += sprayDensity * LocalConstants.TIME_STEP;
    }

    zeroSpray(){
        this.totalDensityApplied = 0;
    }

    setSpray(newDensity:number){
        this.totalDensityApplied = newDensity;
    }

    //return the spray density on this product element
    getElementSprayDensity() : number{
        return this.totalDensityApplied;
    }

    toString():string{
        return `SprayedElement:(${this.getElementSprayDensity()})`
    }
}

class NozzleFunction{
    readonly parentNozzle : GlobalParams.Nozzle;
    readonly sprayLength : number;
    readonly sprayWidth : number;
    readonly maxDensity : number;
    readonly patternOriginX : number;
    readonly patternOriginY : number;
    readonly patternTerminusX : number;
    readonly patternTerminusY : number;
    readonly patternSlope : number; 

    constructor(nozzle : GlobalParams.Nozzle, spray_height: number){
        this.parentNozzle = nozzle;

        this.sprayLength = 2*spray_height*Math.tan(toRadians(nozzle.sprayAngle/2));
        this.sprayWidth = 2*spray_height*Math.tan(toRadians(nozzle.thicknessAngle/2));

        this.maxDensity = nozzle.flowRate / (0.7*this.sprayLength*this.sprayWidth);

        this.patternOriginX = -1*this.sprayLength*Math.sin(toRadians(nozzle.twistAngle))/2;
        this.patternOriginY = nozzle.yPos - this.sprayLength*Math.cos(toRadians(nozzle.twistAngle))/2;

        this.patternTerminusX = this.patternOriginX * -1;
        this.patternTerminusY = nozzle.yPos + (nozzle.yPos - this.patternOriginY);

        this.patternSlope = (this.patternTerminusY - this.patternOriginY)/(this.patternTerminusX - this.patternOriginX);
    }

    //take in a position and output the spray density (volume/(area*time)) at that position
    //TIME-AGNOSTIC FUNCTION! DO NOT CALL IN A NOZZLE-DISABLED TIME STEP!
    density(x : number, y : number) : number{
        //in my old terminology, nearestSpine = Ps
        const nearestSpineX = ( this.patternSlope*this.patternOriginX + x/this.patternSlope - this.patternOriginY + y )/( this.patternSlope + 1/this.patternSlope)
        const nearestSpineY = this.patternSlope*(nearestSpineX - this.patternOriginX) + this.patternOriginY;

        const distOrigToNs = distance(nearestSpineX, nearestSpineY, this.patternOriginX, this.patternOriginY);

        if (distance(x,y, nearestSpineX, nearestSpineY) >= this.sprayWidth/2){
            return 0;
        }
        else if(distOrigToNs >= this.sprayLength || distance(nearestSpineX,nearestSpineY,this.patternTerminusX,this.patternTerminusY) >= this.sprayLength ){
            return 0;
        }
        else if( 0.3*this.sprayLength <= distOrigToNs && distOrigToNs <= 0.7*this.sprayLength){
            return this.maxDensity;
        }
        else if(distOrigToNs <= 0.3*this.sprayLength){
            return this.maxDensity * distOrigToNs / (0.3*this.sprayLength);
        }
        else if(distOrigToNs >= 0.7*this.sprayLength){
            return this.maxDensity * (this.sprayLength - distOrigToNs) / (0.3*this.sprayLength);
        }
        else{
            throw Error("Unreachable state: nearest spine point is neither inside nor outside the spray pattern");
        }
    }
}

function InitializeConveyorArray() : SprayedElement[][]{
    let product : SprayedElement[][] = [];

    //Based on the way we defined our coordinates, we're going to have to resort to some shenanigans to make our array look how we want.
    //x=0,y=0 is at the bottom right, so lengthIndex=0 in the array will map to the MAXIMUM x-index when instantiating the SprayedElement.
    //so x-index is #lengthElements-1-lengthIndex

    //to make matters worse, we can get serious efficiency gains by treating our inner arrays as columns rather than rows
    // so our coordinate pairs go product[y][x]

    let lengthIndex : number = 0;

    while (lengthIndex < LocalConstants.NUM_LENGTH_ELEMENTS){
        let widthIndex = 0;
        let xIndex = LocalConstants.NUM_LENGTH_ELEMENTS - 1 - lengthIndex;
        product.push([])

        while(widthIndex < LocalConstants.NUM_WIDTH_ELEMENTS){
            let yIndex = LocalConstants.NUM_WIDTH_ELEMENTS - 1 - widthIndex;

            const thisElement = new SprayedElement(xIndex, yIndex);
            product[lengthIndex].push(thisElement);

            widthIndex++
        }

        lengthIndex++;
    }

    return product
}

function getMinSprayedX(nozzleFunctions : NozzleFunction[]) : number {
    let minSprayedX = 0;
    for(let nozzleFunc of nozzleFunctions){
        const originToOutside = 0.5*nozzleFunc.sprayWidth * Math.cos(toRadians(nozzleFunc.parentNozzle.twistAngle));
        const thisNozzleMin = nozzleFunc.patternOriginX - originToOutside; //origin.x <= 0

        if( thisNozzleMin < minSprayedX){
            minSprayedX = thisNozzleMin;
        }
    }
    return minSprayedX;
}

function nextActiveTime(t: number) : number {
    const period = GlobalParams.PERIOD;

    let next_t = t + LocalConstants.TIME_STEP;

    while(next_t < GlobalParams.SPRAY_END_TIME){
        if(isActive(next_t)){
            return next_t;
        }
        else{
            const cycleNum = Math.floor(next_t / period);
            next_t = period * (cycleNum + 1) + (0.1* GlobalParams.ON_TIME);//add the factor of on_time to prevent it from getting stuck in a floating point error
        }
    }
    return next_t;
}

function isActive(t: number) : boolean {
    const cycleNum = Math.floor(t / GlobalParams.PERIOD);
    const cycleStart = cycleNum * GlobalParams.PERIOD;
    const shutoffTime = cycleStart + GlobalParams.ON_TIME;
    
    return (cycleStart <= t && t <= shutoffTime);
}

class SprayPattern{
    readonly pattern : SprayedElement[][];

    constructor(p : SprayedElement[][], aa_radius:number){
        this.pattern = this.removeFalseOverspray(p);
        if(aa_radius > 0){
            this.pattern = this.antiAliasing(this.pattern, aa_radius);
        }
        this.pattern = this.normalizeDensities(this.pattern);
    }

    private removeFalseOverspray(p : SprayedElement[][]) : SprayedElement[][]{
        for(let col of p){
            let lastSprayDensity = 0;
            let lastWasProduct = false;
            for(let elem of col){
                //if we hit the boundary of the product and the product edge has no spray
                if(lastSprayDensity > 0 && !lastWasProduct && elem.getElementSprayDensity() === 0 && elem.isProduct){
                    //let every non-product element of the column be set to zero
                    for(let elem2 of col){
                        if( !elem2.isProduct ){
                            elem2.zeroSpray();
                        }
                    }
                }
                lastSprayDensity = elem.getElementSprayDensity();
            }
        }
        return p;
    }

    //mitigate the aliasing patterns that show up on the results page  
    private antiAliasing(p: SprayedElement[][], radius:number) : SprayedElement[][] {
        //let p2 be an array with the same dimensions as p
        const p2 : SprayedElement[][] = InitializeConveyorArray();

        //loop through the display array
        for(let iCol = 0; iCol < p.length; iCol++){
            for(let iRow = 0; iRow < p[iCol].length; iRow++){
                let spraySum = 0;
                let cellCount = 0;
                //look at adjacent columns to our current element
                for(let cOffset = -1 * radius; cOffset <= radius; cOffset++){
                    //if the column index is in bounds
                    if(iCol + cOffset >= 0 && iCol + cOffset < p.length){
                        //look at adjacent rows
                        for(let rOffset = -1 * radius; rOffset <= radius; rOffset++){
                            //if the row index is in bounds
                            if(iRow + rOffset >= 0 && iRow + rOffset < p[iCol + cOffset].length){
                                //if the elements we're comparing are both on/off the product
                                if(p[iCol][iRow].isProduct === p[iCol + cOffset][iRow + rOffset].isProduct){
                                    spraySum += p[iCol + cOffset][iRow + rOffset].getElementSprayDensity();
                                    cellCount += 1;
                                }
                            }
                        }
                    }
                }
                const avgSpray = spraySum / cellCount;
                p2[iCol][iRow].setSpray(avgSpray);
            }
        }
        return p2;
    }

    //I don't know whether it's primarily floating point errors or missing time steps, but the total
    //spray output is always far less than it should be.
    //I wish I could find the root of the problem, but this method will fix it as I can.
    private normalizeDensities(p : SprayedElement[][]) : SprayedElement[][]{
        const p2 = InitializeConveyorArray();
        
        //the true total volume applied is active seconds (duration * duty cycle) * flow rate (gal/second) for each nozzle * number of nozzles
        const trueTotalGallons = GlobalParams.SPRAY_DURATION * GlobalParams.DUTY_CYCLE * GlobalParams.NOZZLE_LIST[0].flowRate * GlobalParams.NOZZLE_LIST.length;
    
        let totalDensity = 0;
        for(let row of p){
            for(let elem of row){
                totalDensity += elem.getElementSprayDensity();
            }
        }
        const patternArea = GlobalParams.VIRTUAL_LINE_LENGTH * GlobalParams.LINE_WIDTH;
        const oneElemArea = patternArea / (LocalConstants.NUM_LENGTH_ELEMENTS * LocalConstants.NUM_WIDTH_ELEMENTS);
        const calculatedTotalGallons = totalDensity * oneElemArea;

        const normalizationRatio = trueTotalGallons / calculatedTotalGallons;

        for(let colI = 0; colI < p.length; colI++){
            for(let rowI = 0; rowI < p[colI].length; rowI++){
                const calcDensity = p[colI][rowI].getElementSprayDensity();
                const trueDensity = calcDensity * normalizationRatio;
                p2[colI][rowI].setSpray( trueDensity );
            }
        }
        return p2;
    }
}

export function getPatternDimensions() : [number, number] {
    const patternLength = GlobalParams.VIRTUAL_LINE_LENGTH;
    const patternWidth = GlobalParams.LINE_WIDTH; 
    return [patternLength, patternWidth];
}

//BE SURE TO CALL UPDATE_PARAMS BEFORE CALLING THIS METHOD
export function computeSprayPattern(numLengthElements:number, numWidthElements:number, timeStep:number, anti_aliasing_radius:number) : SprayPattern{
    //update line element dimensions
    LocalConstants.updateSimulationDimensions(numLengthElements, numWidthElements, timeStep);

    //create line array
    let productASPRAY = InitializeConveyorArray();

    //find array of all nozzle functions
    let productNozzleFunctions : NozzleFunction[] = [];
    let conveyorNozzleFunctions : NozzleFunction[] = [];
    for(let nozzle of GlobalParams.NOZZLE_LIST){
        productNozzleFunctions.push(new NozzleFunction(nozzle, GlobalParams.NOZZLE_HEIGHT - GlobalParams.PRODUCT_HEIGHT));
        conveyorNozzleFunctions.push(new NozzleFunction(nozzle, GlobalParams.NOZZLE_HEIGHT))
    }

    //find the leftmost point covered by any spray nozzle
    const minSprayedX = getMinSprayedX(conveyorNozzleFunctions);
    //symmetry is handy for finding the max X value sprayed
    const maxSprayedX = -1*minSprayedX;

    //TODO: only run the simulation loop for a few periods, then copy and paste that pattern

    //begin the simulation loop!
    let t = GlobalParams.SPRAY_START_TIME;
    while(t < GlobalParams.SPRAY_END_TIME){
        let frontX = t * GlobalParams.LINE_SPEED;

        //iterate through the rows of product elements
        //checking every product element at every timestep is extremely slow! Find optimizations.
        for(let col of productASPRAY){
            const colX = frontX + col[0].xOffset;
            if(colX > minSprayedX && colX < maxSprayedX){
                for(let elem of col){
                    //apply spray from every nozzle
                    if(elem.isProduct){
                        for(let noz of productNozzleFunctions){
                            const densityToAdd = noz.density(colX, elem.yPos);
                            elem.addSpray(densityToAdd);
                        }
                    }
                    else{
                        for(let noz of conveyorNozzleFunctions){
                            const densityToAdd = noz.density(colX, elem.yPos);
                            elem.addSpray(densityToAdd);
                        }
                    }
                }
            }
        }
    
        t = nextActiveTime(t);
    }
    return new SprayPattern(productASPRAY, anti_aliasing_radius);
}