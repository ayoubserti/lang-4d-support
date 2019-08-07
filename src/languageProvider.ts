import * as vscode from "vscode";
import { ProviderResult ,TextDocument, Position, Location} from "vscode";
import {D4LanguageGrammar } from "./languageGrammar";
import {Utils} from "./utils";

export class D4DefinitionProvider implements vscode.DefinitionProvider , vscode.HoverProvider
{
    private _langGrammar : D4LanguageGrammar;

	constructor(langGrammar?: D4LanguageGrammar){
        this._langGrammar = langGrammar || new D4LanguageGrammar();
	}
	
	public provideDefinition(document: TextDocument, position: Position, token: vscode.CancellationToken): Thenable<Location>
	{
		return new Promise((resolve, reject)=>{
            Utils.getProjectMethods().then((list: Array<vscode.Uri>)=>{
                let token = this._langGrammar.getTokenAtPosition(document,position);
                if (token.token.scopes.includes("entity.name.function.4d") && !token.token.scopes.includes("entity.command.number.4d"))
                {
                    list.find((current) => {
                        if( current.path.includes(token.text)){
                            resolve(new Location(current, new Position(0,0)));
                        }
                        
                    },this);

                }
            });     
		
		});
	}

	public provideHover(document: TextDocument, position: Position, token: vscode.CancellationToken): ProviderResult<vscode.Hover>
	{
		
		return new Promise((resolve,reject)=>{

            
            Utils.getProjectMethods().then((list: Array<vscode.Uri>)=>{
                let token = this._langGrammar.getTokenAtPosition(document,position);
                if ( !token.token.scopes.includes("entity.command.number.4d"))
                {
                    resolve(new vscode.Hover(token.text));
                }
            });
            
			
		});
		
	}
}

/**
 *  TODO:
 *     - Goto definition:
 *     - Hover symbol:
 *          * method  : find method in workspace (1)
 *          * command : have a cache of all available 4D command (2)
 *          * variable : must have a tree of definition (3)
 *          * unknown symbol: elsewhere (4)
 *    - Preparation:
 *          * list of all commands
 *          * list of constant
 *          * list of methods in workspace
 */


