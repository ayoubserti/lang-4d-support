import * as vscode from "vscode";
import { ProviderResult ,TextDocument, Position, Location} from "vscode";
import {D4LanguageGrammar } from "./languageGrammar"
export class D4DefinitionProvider implements vscode.DefinitionProvider , vscode.HoverProvider
{
    private _langGrammar : D4LanguageGrammar;

	constructor(langGrammar?: D4LanguageGrammar){
        this._langGrammar = langGrammar || new D4LanguageGrammar();
	}
	
	public provideDefinition(document: TextDocument, position: Position, token: vscode.CancellationToken): Thenable<Location>
	{
		//console.log();
		return new Promise((resolve, reject)=>{
            
			return resolve(new Location(vscode.Uri.parse("file://Users/mac/Desktop/vs-extension/lang-4d-support/extension.ts"), new Position(23,43)));
		});
	}

	public provideHover(document: TextDocument, position: Position, token: vscode.CancellationToken): ProviderResult<vscode.Hover>
	{
		
		return new Promise((resolve,reject)=>{

			resolve(new vscode.Hover(this._langGrammar.getToken(document,position)));
		});
		
	}
}