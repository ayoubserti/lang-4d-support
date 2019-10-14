import * as vscode from 'vscode';
import {content} from './templating';
import { mkdir,copyFile, writeFile,existsSync} from 'fs';
import {resolve,basename} from 'path';
import {promisify} from "util";

const writeFile$ = promisify(writeFile);
const copyFile$ = promisify(copyFile);
const mkdir$ = promisify(mkdir);


interface IFileTemplating {
	readonly source : string;
	readonly target : string;
	readonly changeName? : boolean;
}

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
export namespace Commands{

    //command create 4D Project
    export const  create_Project = vscode.commands.registerCommand('extension.create_4d_project',async () => {
        const result = await _openDialogForFolder();
        
        if ( result && result.fsPath){
            await vscode.commands.executeCommand('vscode.openFolder',result);
    
            //folder
            content.dir.forEach(async (elm:string) => {
                try{
                    await mkdir$(resolve(result.fsPath,elm));
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
                        let bname = basename(result.fsPath);
                        name = name.replace("<name>",bname);
                    }
                    let sourcePath = resolve(__dirname,"template",elm.source);
                    let targetPath = resolve(result.fsPath,name);
                    await copyFile$(sourcePath,targetPath);
                }
                catch(err)
                {
                    console.error(err);
                }
            });
    
            // .vscode folder
            mkdir$(resolve(result.fsPath,".vscode"));
           
            try{
                await writeFile$(resolve(result.fsPath,".vscode","tasks.json"),JSON.stringify(content.tasks,null,4),);
                await writeFile$(resolve(result.fsPath,".vscode","launch.json"),JSON.stringify(content.launch,null,4));
            }
            catch(err)
            {
                console.error(err);
            }
            
        }
    });

    //command new project method
    export const create_project_method = vscode.commands.registerCommand('extension.create_project_method', async() => {
        const result = await vscode.window.showInputBox({placeHolder:"Method name"});
        //TODO: install validator for method name
        try{
            let proj_path = vscode.workspace.rootPath || '';
            if ((proj_path !== '') && (result !==undefined)){
                let method_name = result.trim();
                let path = resolve(proj_path,'Project/Sources/Methods',method_name + '.4dm');
                await writeFile$(path, "//%attributes = {}"); //maybe add method header
                let document =  await vscode.workspace.openTextDocument(path);
                await vscode.window.showTextDocument(document);
            }
        }
        catch(err)
        {
            console.error(err);
        }
        
    });

     //command database method
     export const create_database_method = vscode.commands.registerCommand('extension.create_database_method', async() => {
            try{
                let proj_path = vscode.workspace.rootPath || '';
                const res = await vscode.window.showQuickPick(['onStartup','onExit','onBackupShutdown','onBackupStartup','onDrop',
                'onHostDatabaseEvent','onMobileAppAction','onMobileAppAuthentication'
                 ,'onRESTAuthentication','onServerCloseConnection','onServerOpenConnection',
                 'onServerShutdown','onServerStartup','onSqlAuthentication','onSystemEvent'
                 ,'onWebAuthentication','onWebConnection','onWebSessionSuspend']);

            if ((proj_path !== '')  && (res !== undefined)){
               
                let path = resolve(proj_path,'Project/Sources/DatabaseMethods',res + '.4dm');
                if ( !existsSync(path) ){
                    await writeFile$(path, ""); 
                }
                let document =  await vscode.workspace.openTextDocument(path);
                await vscode.window.showTextDocument(document);
            }
            }
            catch(err)
            {
                console.error(err);
            }
     });
}
