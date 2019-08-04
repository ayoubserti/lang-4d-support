// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ProviderResult } from 'vscode';
import { D4LanguageGrammar} from './languageGrammar';
import { D4DefinitionProvider} from './languageProvider';




// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		
	});
	let langGrammar = new D4LanguageGrammar();
	let langProvider : D4DefinitionProvider = new D4DefinitionProvider(langGrammar);
	 
	context.subscriptions.push(disposable);
	context.subscriptions.push(vscode.languages.registerDefinitionProvider("4d",langProvider));
	context.subscriptions.push(vscode.languages.registerHoverProvider("4d",  langProvider));

	//linter
	let diagnosticCollection = vscode.languages.createDiagnosticCollection();
	function do4DLint(textdocument: vscode.TextDocument){
		if ( textdocument.languageId !== '4d') {
			return;
		}
		let diagnostics: vscode.Diagnostic[] = [];
		let tokensText  = langGrammar.getUnknownToken(textdocument);
		
		let severity = vscode.DiagnosticSeverity.Error;
		let msg = 'unknown symbol'
		if ( tokensText.length > 0)
		{
			for(let  item of tokensText){
				let range = new vscode.Range(item.start, item.end);
				let diagnostic = new vscode.Diagnostic(range, msg, severity);
				diagnostics.push(diagnostic);
			}
			diagnosticCollection.set(textdocument.uri, diagnostics);	
		}	
	}

		
	vscode.workspace.onDidOpenTextDocument((textdocument : vscode.TextDocument)=>{
		//update decoration
		//updateDecorations();
		do4DLint(textdocument);
	});
	
	 
	
	vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			//updateDecorations();
			do4DLint(editor.document);
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidCloseTextDocument((textDocument)=> {
		diagnosticCollection.delete(textDocument.uri);
	}, null, context.subscriptions);

}

// this method is called when your extension is deactivated
export function deactivate() {}

