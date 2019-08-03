// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ProviderResult } from 'vscode';
import { D4LanguageGrammar} from './languageGrammar';
import { D4DefinitionProvider} from './languageProvider';




// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "lang-4d-support"   is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
		
	});
	let langGrammar = new D4LanguageGrammar();
	let langProvider : D4DefinitionProvider = new D4DefinitionProvider(langGrammar);
	 
	context.subscriptions.push(disposable);
	context.subscriptions.push(vscode.languages.registerDefinitionProvider("4d",langProvider));
	context.subscriptions.push(vscode.languages.registerHoverProvider("4d",  langProvider));

	//symentic decoration
	const userDefinedMethodDecoration = vscode.window.createTextEditorDecorationType({
		borderWidth: '1px',
		borderStyle: 'solid',
		overviewRulerColor: 'blue',
		overviewRulerLane: vscode.OverviewRulerLane.Right,
		light: {
			// this color will be used in light color themes
			borderColor: 'darkblue'
		},
		dark: {
			// this color will be used in dark color themes
			borderColor: 'lightblue'
		}
	});
	let activeEditor = vscode.window.activeTextEditor;
	
	function updateDecorations() {
			
		if (!activeEditor) {
			return;
		}
		let tokensText  = langGrammar.getUnknownToken(activeEditor.document);

		const regEx = /\d+/g;
		const text = activeEditor.document.getText();
		const userDefinedMethod: vscode.DecorationOptions[] = [];
		
		for ( let tk of tokensText){
			const startPos =tk.start;
			const endPos = tk.end;
			const decoration = { range: new vscode.Range(startPos, endPos)};
			
			userDefinedMethod.push(decoration);
			
		}
		
		activeEditor.setDecorations(userDefinedMethodDecoration, userDefinedMethod);
	}
	
	vscode.workspace.onDidOpenTextDocument((textdocument : vscode.TextDocument)=>{
		//update decoration
		updateDecorations();
	});
	
	
	
	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			updateDecorations();
		}
	}, null, context.subscriptions);
}

// this method is called when your extension is deactivated
export function deactivate() {}

