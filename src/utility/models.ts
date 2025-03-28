/* eslint-disable @typescript-eslint/no-namespace */
export namespace Models{
    export interface Controller{
        controller_id: number,
        controller_name:string,
        controller_doc_link:string
    }
    export interface Nozzle{
        nozzle_id: number,
        nozzle_name:string,
        nozzle_doc_link:string,
        flow_rate:number,
        spray_angle:number,
        spray_shape:string,
        alignment:number
    }
    export interface Gun{
        gun_id:number,
        gun_name:string,
        max_frequency:number
    }
    export interface User{
        user_id: number,
        username:string,
        role:string,
        projects:Array<Models.Project>
    }

    export interface ProjectBase{
        project_id:number,
        owner_id:number,
        project_name:string,
        last_modified_date:Date
    }
    export interface Project{
        project_id:number,
        owner_id:number,
        project_name:string,
        project_description:string,
        last_modified_date:Date,
        line_speed:number,
        line_width:number,
        sensor_distance:number,
        product_width:number,
        product_length:number,
        product_height:number,
        nozzle_count:number,
        nozzle_spacing:number,
        nozzle_height:number,
        fluid_pressure:number,
        duty_cycle:number,
        start_delay:number,
        stop_delay:number,
        spray_duration:number,
        nozzle:Models.Nozzle,
        controller:Models.Controller,
        gun:Models.Gun,
    }
}

export namespace UtilityInterfaces{
    export enum types{
        INT,
        FLOAT,
        STRING
    }
    export interface Parameter{
        name: string,
        type: types,
        min?: number,
        max?: number
        value: string|number,
    }
}

interface IUser extends Document {
    email: string;
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
  }
