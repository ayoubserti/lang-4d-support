import { IToken } from "vscode-textmate";
import { Range } from "vscode";

export enum D4VariableType
{
    eUNKNOWN = 0,
    eLONGINT,
    eREAL,
    eTEXT,
    eBOOlEAN,
    ePOINTER,
    eBLOB,
    eOBJECT,
    eDATE,
    eTIME,
    ePICTIURE,
    eARRAY_LONGINT,
    eARRAY_REAL,
    eARRAY_TEXT,
    eARRAY_OBJECT,
    eARRAY_DATE,
    eARRAY_TIME,
    eARRAY_PICTURE,
    eARRAY_POINTER,
    eARRAY_BLOB,
    eARRAY_BOOLEAN,
    eCOLLECTION,
    eVARIANT   //introduced in v18
}

export enum D4VariableKind
{
    kUnknown = 0,
    kLocal ,
    kProcess,
    kInterPrecess
}
export class Variable4D
{
    public  _name : string = "";
     _type : D4VariableType = D4VariableType.eUNKNOWN;
     _kind : D4VariableKind = D4VariableKind.kUnknown;
     _method : string  = "";
     _line : number = 0;
     _column : number =0;

}

export class Command4D
{
    _name : string = "";
    _code : number = 0;
}

export class Argument4D
{
    public _code : number = -1;
    public _type : D4VariableType = D4VariableType.eUNKNOWN;

}

export class TokenRange
{
    _token : IToken;
    _range : Range;

    constructor(token : IToken , range : Range){
        this._token = token;
        this._range = range;
    }

}
export class Method4D
{
     _name : string = "";
     _variable_list : Array<Variable4D> = [];
     _method_calls : Array<Method4D> = [];
     _command_calls : Array<Command4D> = [];
     _arguments  : Map<number ,Argument4D> = new Map();
     _tokens  : Map<string , Array<TokenRange>> = new Map();

    public isReturning() : boolean {

        if(this._arguments.has(0)){
            return true;
        }
        return false;
    } 

    public acceptArgments() : boolean {

        if (this._arguments.size === 0 ){
            return false;
        }
        else if( this._arguments.has(0) && this._arguments.size === 1)
        {
            return false;
        }
        else 
        {
            return true;
        }
    }

    public argumentMatch(pos : number, type:D4VariableType ) : boolean{

        let arg = this._arguments.get(pos);
        if ( arg === undefined){
            return false;
        }else if (arg._type === type){
            return true;
        }
        return false;
    }

}

