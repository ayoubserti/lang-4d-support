import {workspace,Uri} from "vscode";
import * as d4lang from "./languageDefinition";

export class Utils {

    static  async getProjectMethods() : Promise<Array<Uri>> {
        let list :Array<Uri> = [];
        
        if ( workspace.rootPath )
        {
               list = await workspace.findFiles('Project/Sources/Methods/*.4dm');
        }

        return list;
    }

    static commandList : Array<String> = [];
}
const _MapTypeToCode  : { [key : string ]: d4lang.D4VariableType } = { 
        "longint" : d4lang.D4VariableType.eLONGINT,
        "real"    : d4lang.D4VariableType.eREAL,
        "text"    : d4lang.D4VariableType.eTEXT,
        "picture"    : d4lang.D4VariableType.ePICTIURE,
        "boolean"    : d4lang.D4VariableType.eBOOlEAN,
        "pointer"    : d4lang.D4VariableType.ePOINTER,
        "array_longint"    : d4lang.D4VariableType.eARRAY_LONGINT,
        "array_real"    : d4lang.D4VariableType.eARRAY_REAL,
        "array_text"    : d4lang.D4VariableType.eARRAY_TEXT,
        "array_boolean"    : d4lang.D4VariableType.eARRAY_BOOLEAN,
        "array_picture"    : d4lang.D4VariableType.eARRAY_PICTURE,
        "array_pointer"    : d4lang.D4VariableType.eARRAY_POINTER,
        "blob"    : d4lang.D4VariableType.eBLOB 
        //TODO: complete the list 
        };

export function mapType(stype : string) : d4lang.D4VariableType
{
    
    if ( _MapTypeToCode[stype] !== undefined)
    {
        return _MapTypeToCode[stype];
    }
    return d4lang.D4VariableType.eUNKNOWN;
}

export function mapString(ctype : d4lang.D4VariableType) : string{
    
    let d_ = Object.keys(_MapTypeToCode).find((elem)=>{
        if ( _MapTypeToCode[elem] === ctype){
            return true;
        }
        else {
            return false;
        }
            
    });
    if ( d_ !== undefined){
        return d_;
    }

    return "variant";
}