// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { D4LanguageGrammar} from './languageGrammar';
import { D4DefinitionProvider} from './languageProvider';
import {content} from './templating';
import { mkdir,copyFile} from 'fs';
import {resolve,basename, dirname} from 'path';
import {promisify} from "util";

interface IFileTemplating {
	readonly source : string;
	readonly target : string;
	readonly changeName? : boolean;
}
export function activate(context: vscode.ExtensionContext) {
	
	async function _openDialogForFolder(): Promise<vscode.Uri | undefined> {
		const options: vscode.OpenDialogOptions = {
		  canSelectFiles: false,
		  canSelectFolders: true,
		  canSelectMany: false,
		};
	  
		const result: vscode.Uri[] | undefined = await vscode.window.showOpenDialog(options);
		if (result) {
		  return Promise.resolve(result[0]);
		}
		return Promise.resolve(undefined);
	  }
	let disp_create_project = vscode.commands.registerCommand('extension.create_4d_project',async () => {
		const result = await _openDialogForFolder();
		if ( result && result.fsPath){
			await vscode.commands.executeCommand('vscode.openFolder',result);

			//folder
			content.dir.forEach(async (elm:string) => {
				try{
					await promisify(mkdir)(resolve(result.fsPath,elm));
				}catch(err)
				{
					console.error(err);
				}
			});

			//files
			content.files.forEach(async(elm : IFileTemplating) => {
				try{
					let name :string= elm.target;
					if( elm.changeName )
					{
						let bname = basename(result.fsPath)
						name = name.replace("<name>",bname);
					}
					let copyFile$ = promisify(copyFile);
					let sourcePath = resolve(__dirname,"template",elm.source);
					let targetPath = resolve(result.fsPath,name);
					await copyFile$(sourcePath,targetPath);
				}
				catch(err)
				{
					console.error(err);
				}
			});

		}
		

	});
	let langGrammar = new D4LanguageGrammar();
	let langProvider : D4DefinitionProvider = new D4DefinitionProvider(langGrammar);
	 
	context.subscriptions.push(disp_create_project);
	context.subscriptions.push(vscode.languages.registerDefinitionProvider("4d",langProvider));
	context.subscriptions.push(vscode.languages.registerHoverProvider("4d",  langProvider));
	context.subscriptions.push(vscode.languages.registerDocumentSymbolProvider("4d",  langProvider));
	context.subscriptions.push(vscode.languages.registerDocumentHighlightProvider("4d",  langProvider));
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider("4d",  langProvider));
	context.subscriptions.push(vscode.languages.registerSignatureHelpProvider("4d",  langProvider,'(', ';'));
	
	
	//linter
	let diagnosticCollection = vscode.languages.createDiagnosticCollection();
	function do4DLint(textdocument: vscode.TextDocument){

		function isEmpty(str : string) {
			return str.replace(/^\s+|\s+$/gm,'').length === 0;
		}
		if ( textdocument.languageId !== '4d') {
			return;
		}
		let diagnostics: vscode.Diagnostic[] = [];
		let tokensText  = langGrammar.getUnknownToken(textdocument);
		
		if ( tokensText.length > 0)
		{
			for(let  item of tokensText){
				let severity = vscode.DiagnosticSeverity.Error;
				let range = new vscode.Range(item.start, item.end);
				let msg = 'unknown symbol';
				let s = textdocument.getText(range);
				s= typeof s === 'string' ? s.trim() : " ";
				if (isEmpty(s)) 
				{
					severity =vscode.DiagnosticSeverity.Warning;
					msg = "Too much whitespace";
				}
				else if (!langGrammar.isTokenAMethod(item.token , s)){
					let diagnostic = new vscode.Diagnostic(range, msg, severity);
					diagnostics.push(diagnostic);
				}
				
			}
			diagnosticCollection.set(textdocument.uri, diagnostics);	
		}	
	}

		
	vscode.workspace.onDidOpenTextDocument((textdocument : vscode.TextDocument)=>{
		do4DLint(textdocument);
		let method = langGrammar.tokenizeMethod(textdocument);
		let a= 0;
	}, null, context.subscriptions);
	
	 
	
	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			do4DLint(editor.document);
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidCloseTextDocument((textDocument)=> {
		diagnosticCollection.delete(textDocument.uri);
	}, null, context.subscriptions);

	vscode.workspace.onDidSaveTextDocument((textDocument)=> {
		do4DLint(textDocument);
	}, null, context.subscriptions);

}

// this method is called when your extension is deactivated
export function deactivate() {}

