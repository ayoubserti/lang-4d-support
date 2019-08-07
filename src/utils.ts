import {workspace,Uri} from "vscode";
import { downloadAndUnzipVSCode } from "vscode-test";

export class Utils {

    static  async getProjectMethods() : Promise<Array<Uri>> {
        let list :Array<Uri> = [];
        
        if ( workspace.rootPath )
        {
               list = await workspace.findFiles('Project/Sources/Methods/*.4dm');
        }

        return list;
    }

}