import * as vscode from 'vscode';
import * as tm from 'vscode-textmate';
import * as fs from 'fs';
import { IRawGrammar } from 'vscode-textmate';

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
				return readFile(__dirname+'/syntaxes/4d.tmLanguage.plist').then((data: Buffer)  :tm.IRawGrammar => {
                    return tm.parseRawGrammar(data.toString());

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
    }


    getToken (document : vscode.TextDocument , position : vscode.Position ) : any{
        let gram : tm.IGrammar = this._grammar as tm.IGrammar;
        let tokens = gram.tokenizeLine(document.lineAt(position.line).text,tm.INITIAL).tokens;
        for( let entry of tokens)
        {
            if ( position.character >= entry.startIndex  && position.character <= entry.endIndex)
            {
                
                return  document.lineAt(position.line).text.substring(entry.startIndex ,entry.endIndex );
            }
        }
    }

    
    getUnknownToken( document: vscode.TextDocument): any {
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
                        end : new vscode.Position(i,startlineChar+entry.endIndex)
                    });
                }
            }
        }
        return tokenText;
    }
    

}