// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ProviderResult } from 'vscode';


class D4DefinitionProvider implements vscode.DefinitionProvider , vscode.HoverProvider
{
	constructor(){}
	public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.Location>
	{
		return new Promise((resolve, reject)=>{
			return resolve(new vscode.Location(vscode.Uri.parse("file://Users/mac/Desktop/vs-extension/lang-4d-support/extension.ts"), new vscode.Position(23,43)));
		});
	}

	public provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): ProviderResult<vscode.Hover>
	{

		return new Promise((resolve,reject)=>{

			resolve(new vscode.Hover("working ...."));
		});
		
	}
}


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
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World!');
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(vscode.languages.registerDefinitionProvider("4d",new D4DefinitionProvider()));
	context.subscriptions.push(vscode.languages.registerHoverProvider("4d", new D4DefinitionProvider()))
}

// this method is called when your extension is deactivated
export function deactivate() {}

