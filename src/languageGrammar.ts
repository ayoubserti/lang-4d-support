import * as vscode from 'vscode';
import * as tm from 'vscode-textmate';
import * as fs from 'fs';
import { IRawGrammar } from 'vscode-textmate';
import { Utils } from './utils';

import * as d4lang from './languageDefinition'; 
import {LangCache} from './languageCache';


//  function tool to retrieve a node module from vscode environnement
function getCoreNodeModule(moduleName: string) : any{
	try {
	  return require(`${vscode.env.appRoot}/node_modules.asar/${moduleName}`);
	} catch (err) { }
	
	try {
	  return require(`${vscode.env.appRoot}/node_modules/${moduleName}`);
	} catch (err) { }
	
	return null;
  }


const onigurumaModule = getCoreNodeModule('oniguruma');

//ReadFile asynchronously 
function readFile(path: string) :Thenable<any> {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (error, data) => error ? reject(error) : resolve(data));
    });
}


/**
 *  @class OnigLibImpl 
 *  @abstract Implementation of tm.IOnigLib interface 
 *              Create scanner for `4D` language 
 */
class OnigLibImpl implements tm.IOnigLib
{
	createOnigScanner(sources: string[]): tm.OnigScanner
	{
		return new onigurumaModule.OnigScanner(sources);
	}
	createOnigString(sources: string): tm.OnigString
	{
		let string = new onigurumaModule.OnigString(sources);
		string.content = sources;
		return string;
	}
}

function callback(data: Buffer) : tm.IRawGrammar{
	return tm.parseRawGrammar(data.toString());
	
}

class D4GrammerRegister implements tm.RegistryOptions
{
	public loadGrammar(scopeName: string): any{

		if (scopeName === 'source.4dm') {
				return readFile(__dirname+'/syntaxes/4d.tmLanguage.json').then((data: Buffer)  :tm.IRawGrammar => {
                    return tm.parseRawGrammar(data.toString(),__dirname+'/syntaxes/4d.tmLanguage.json');

                }).then((gram: IRawGrammar)  :Thenable<any>=> {
					return new Promise((resolve,reject) => {
							resolve(gram);
					});
				});
			}
        console.log(`Unknown scope name: ${scopeName}`);
        return;
	}
	public getOnigLib() : Thenable<tm.IOnigLib>
	{
		return new Promise((resolve ) => {
			resolve(new OnigLibImpl());
		});
	}
}

class D4Token  implements tm.IToken
{
    startIndex: number;
    readonly endIndex: number;
    readonly scopes: string[];
    constructor(startIndex : number, endIndex : number, scopes : string[]){
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.scopes = scopes;
    }
}


class D4TokenizeLineResult implements tm.ITokenizeLineResult{

    readonly tokens: D4Token[];
    readonly ruleStack: tm.StackElement;
    constructor(){
        this.tokens = [];
        this.ruleStack = tm.INITIAL;
    }
}


export class D4LanguageGrammar {

    private _registry : tm.Registry;
    private _grammarResolver : tm.Thenable<tm.IGrammar>;
    private _prevState : tm.StackElement;
    private _tokenizerResult : D4TokenizeLineResult;
    private _workspaceMethods : Array<vscode.Uri> = [];
    private _grammar: unknown; //FIXME, unknow isn't a type

    constructor()
    {
        this._prevState = tm.INITIAL;
        this._tokenizerResult = new D4TokenizeLineResult();
        
        this._registry = new tm.Registry(new D4GrammerRegister());
        this._grammarResolver = this._registry.loadGrammar("source.4dm");
		this._grammarResolver.then((grammer: tm.IGrammar) => {
            this._grammar = grammer;
        });
        Utils.getProjectMethods().then((methodList)=>{
            this._workspaceMethods= methodList;
        });
    }


   public  getTokenAtPosition (document : vscode.TextDocument , position : vscode.Position ) : any{
        if ( document.languageId !=='4d'){
            return;
        }
        let gram : tm.IGrammar = this._grammar as tm.IGrammar;
        let tokens = gram.tokenizeLine(document.lineAt(position.line).text,tm.INITIAL).tokens;
        for( let entry of tokens)
        {
            if ( position.character >= entry.startIndex  && position.character <= entry.endIndex)
            {
                return {
                    text: document.lineAt(position.line).text.substring(entry.startIndex ,entry.endIndex ),
                    token: entry
                };
            }
        }
    }

    
    public  getUnknownToken( document: vscode.TextDocument): any{
        if ( document.languageId !=='4d'){
            return;
        }
        let gram : tm.IGrammar = this._grammar as tm.IGrammar;
        let tokenText = [];
        let stack = tm.INITIAL ;
        
        for ( let i= 0; i< document.lineCount; i++)
        {
            
            let lineText = document.lineAt(i);
            if ( lineText.isEmptyOrWhitespace ) {
                continue;
            }
            let result = gram.tokenizeLine(lineText.text,stack);
            stack = result.ruleStack;
            let tokens = result.tokens;
            for( let entry of tokens)
            {
                if ( entry.scopes.length < 2 && (entry.startIndex !== entry.endIndex))
                {
                    let startlineChar = lineText.range.start.character;
                    tokenText.push( {start: new vscode.Position(i,startlineChar+ entry.startIndex),
                        end : new vscode.Position(i,startlineChar+entry.endIndex),
                        token : entry
                    });
                }
            }
        }
        return tokenText;
    }

    public  isTokenAMethod(token? : tm.IToken, text? : string ) : boolean{
        let result = false;
        //a Token is a Method if its scopes list contains ("entity.name.function.4d")
        //or a .4dm file exist in the same the same workspace
        if(token!==undefined &&  token.scopes.includes("entity.name.function.4d")) 
        {
            result = true;
        }
        else{
            if(text !== undefined ){
                this._workspaceMethods.find((elem :vscode.Uri) => {
                    if ( elem.fsPath.includes(text.trim() + ".4dm") )
                    {
                        result = true;
                    }
                },this);

            }else{
                //TODO
            }
        }
        return result;
    }
    
    public tokenizeMethod( document : vscode.TextDocument) : d4lang.Method4D {

        function mapType(stype : string) : d4lang.D4VariableType
        {
            let map : { [key : string ]: d4lang.D4VariableType } = { "longint" : d4lang.D4VariableType.eLONGINT,
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
            if ( map[stype] !== undefined)
            {
                return map[stype];
            }
            return d4lang.D4VariableType.eUNKNOWN;
        }
        let method = new  d4lang.Method4D; 
        if ( document.languageId !=='4d'){
            throw new Error("It's not a 4D Method");            
        }
        let gram : tm.IGrammar = this._grammar as tm.IGrammar;
        method._name = document.fileName;
        let line_count = document.lineCount;
        let rule_stack = tm.INITIAL;
        for (let i = 0; i< line_count; i++){

            let tokenResult = gram.tokenizeLine(document.lineAt(i).text,rule_stack);
            rule_stack = tokenResult.ruleStack;
            for( let entry of tokenResult.tokens)
            {
                let to_range = new vscode.Range(i,entry.startIndex,i,entry.endIndex);
                let token_text  = document.getText(to_range).trim();
                let matchtoken = entry.scopes.join().match(/variable\.name\.([a-z]+)\.4d/i);
                if ( matchtoken !== null && matchtoken.length > 1)
                {
                    /**
                     * TODO: check if variable is argument
                     */
                    let variable  = new  d4lang.Variable4D();
                    variable._method = method._name;
                    variable._line = i;
                    variable._column = entry.startIndex;
                    variable._name = token_text;
                    method._tokens.set(variable._name,[]);
                    //variable kind
                    if ( variable._name.startsWith("$"))
                    {
                        variable._kind = d4lang.D4VariableKind.kLocal;
                    }else if ( variable._name.startsWith("<>"))
                    {
                        variable._kind = d4lang.D4VariableKind.kInterPrecess;
                    }
                    else{
                        variable._kind = d4lang.D4VariableKind.kProcess;
                    }
                    //variable type
                    variable._type = mapType(matchtoken[1]);
                    method._variable_list.push(variable);
                }
                //tables
                if(entry.scopes.includes("support.table.name.4d") )
                {
                    if ( !method._tokens.has(token_text)){
                       method._tokens.set(token_text,[]);
                       method._table_list.push(token_text);
                    }
                }
                //declared variable by asseignement
                if (entry.scopes.includes("meta.block.affectation.4d") && entry.scopes.includes("variable.name.4d"))
                {
                    let variable = method._variable_list.find((elem)=> {
                        if ( elem._name === token_text.trim())
                        {
                            return true;
                        }
                    });
                    if ( variable === undefined)
                    {
                        //not declared, add it
                        let variable  = new  d4lang.Variable4D();
                        variable._method = method._name;
                        variable._line = i;
                        variable._column = entry.startIndex;
                        variable._name = token_text;
                        method._tokens.set(variable._name,[]);
                        //variable kind
                        if ( variable._name.startsWith("$"))
                        {
                            variable._kind = d4lang.D4VariableKind.kLocal;
                        }else if ( variable._name.startsWith("<>"))
                        {
                            variable._kind = d4lang.D4VariableKind.kInterPrecess;
                        }
                        else{
                            variable._kind = d4lang.D4VariableKind.kProcess;
                        }
                        //variable type
                        variable._type = d4lang.D4VariableType.eUNKNOWN; //unknown for now
                        method._variable_list.push(variable);
                    }
                }
                
                //store occurences
                let occurences = method._tokens.get(token_text);
                if ( occurences)
                {
                    occurences.push(new d4lang.TokenRange(entry,to_range));
                }
               
            }
        }

        LangCache.addMethod(method);
        return method;
    }
    
    


}