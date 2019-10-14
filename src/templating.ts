'use strict';
import * as vscode from 'vscode';
import {resolve} from 'path';
const config = vscode.workspace.getConfiguration("4d");


export namespace content {

    // ".vscode/tasks.json"
    export const tasks: any = {
        version: "2.0.0", tasks: [
            {
                // See https://go.microsoft.com/fwlink/?LinkId=733558
                // for the documentation about the tasks.json format
                "label": "Build",
                "type": "shell",
                "group": "build",
                "command": config.get("programPath"),
                "args": [
                    "--headless",
                    "-s",
                    config.get("builderPath"),
                    "--dataless",
                    "--user-param",
                    "{\\\"makeFile\\\":\\\"${workspaceFolder}\\make.json\\\",\\\"verbose\\\":true,\\\"config\\\":\\\"release\\\"}"
                ],
                "problemMatcher": ["$msCompile"]
            }

        ]
    };

    // ".vscode/launch.json"
    export const launch: any = {
        version: '0.2.0',
        configuration: [
            {
                "name": "Compile Project",
                "type": "4d",
                "request": "launch",
                "runtimeExecutable": "${execPath}",
                "args": [
                    "--extensionDevelopmentPath=${workspaceFolder}"
                ],
                "outFiles": [
                    "${workspaceFolder}/out/**/*.js"
                ],
                "preLaunchTask": "npm: watch"
            },
        ]
    };

    export const dir: any = ['Project', 'Resources', 'Project/Sources/', 'Project/Sources/Methods', 'Project/Sources/DatabaseMethods', 'Settings'];
    export const files: any = [
        { source: "_.4DProject.tmpl", target: 'Project/<name>.4DProject', changeName:true },
        { source: "make.json.tmpl", target:  'make.json' },
        { source: "catalog.4DCatalog.tmpl", target: 'Project/Sources/catalog.4DCatalog' },
        { source: "folders.json.tmpl", target:  'Project/Sources/folders.json' },
        { source: "menus.json.tmpl", target:  'Project/Sources/menus.json' },
        { source: "directory.json.tmpl", target:  'Settings/directory.json' }
        ];
}
