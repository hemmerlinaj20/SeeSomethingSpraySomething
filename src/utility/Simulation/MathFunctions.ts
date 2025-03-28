//take an angle in degrees and return it in radians
export function toRadians(angleInDegrees : number) : number{
    return angleInDegrees * Math.PI / 180;
}

//find the cartesian distance between two points
export function distance(x1:number, y1:number, x2:number, y2:number) : number{
    return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1))
}

export function flowRateEstimate(oldFlowrate:number, oldPressure:number, newPressure:number) : number{
    return oldFlowrate * Math.sqrt(newPressure) / Math.sqrt(oldPressure);
}

//returns the percentage out of 100 of the spray width AT PRODUCT SURFACE that is shared by one adjacent nozzle
//product_to_nozzle is the vertical distance in inches from the top of the product to the spray manifold
//nozzle spacing is the distance in inches between to nozzles
//spray angle is the width of the spray in degrees
//twist angle is the alignment of the nozzles in degrees
export function overlapPercentage(product_to_nozzle:number, nozzle_spacing:number, spray_angle:number, twist_angle:number) : number{
    const spray_angle_radians = toRadians(spray_angle);
    const twist_angle_radians = toRadians(twist_angle);

    const widthAtProduct = 2 * product_to_nozzle * Math.tan( spray_angle_radians / 2 );
    const widthAfterTwist = widthAtProduct * Math.cos(twist_angle_radians);

    const overlap = (widthAfterTwist - nozzle_spacing) / widthAfterTwist;

    if(overlap < 0){
        return 0;
    }

    return overlap * 100;
}