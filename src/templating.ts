'use strict';

//workaround. waiting for a new VSCode release that integrate:
// https://github.com/microsoft/vscode/issues/59023
//@discuss: more easy we can add new attribute to builder param to specify error format
let patternMatch ="";
if (process.platform ==="darwin"){
     patternMatch = "^(.*):(\\d*):\\s+(warning|error|note):\\s+(.*)$";
}
else
{
     patternMatch = "^(.*)\\((\\d*)\\):\\s+(warning|error|note):\\s+(.*)$";
}

export namespace content {

    // ".vscode/tasks.json"
    export const tasks: any = {
        version: "2.0.0", tasks: [
            {
                // See https://go.microsoft.com/fwlink/?LinkId=733558
                // for the documentation about the tasks.json format
                "label": "Build",
                "type": "process",
                "group": "build",
                "command": "${config:4d.programPath}",
                "args": [
                    "--headless",
                    "-s",
                    "${config:4d.builderPath}",
                    "--dataless",
                    "--user-param",
                    "{\"makeFile\":\"${workspaceFolder}/make.json\",\"verbose\":true,\"config\":\"release\"}"
                ],
                "windows" :{
                    "args" :[
                        "--headless",
                        "-s",
                        "${config:4d.builderPath}",
                        "--dataless",
                        "--user-param",
                        "{\\\"makeFile\\\":\\\"${workspaceFolder}\\make.json\\\",\\\"verbose\\\":true,\\\"config\\\":\\\"release\\\"}",
                    ]
                },
                "problemMatcher":{
                    "owner":"4d",
                     "fileLocation":"absolute",
                     "pattern": {
                         "regexp": patternMatch,
                         "file": 1,
                         "line": 2,
                         "severity": 3,
                         "message": 4
                     }
                 } 
            },
            {
                "label": "Run",
                "type": "process",
                "command": "${config:4d.programPath}",
                "args": [
                    "--headless",
                    "-s",
                    "${workspaceFolder}/Project/${workspaceFolderBasename}.4DProject"
                ],
                "windows": {
                    "args": [
                        "--headless",
                        "-s",
                        "${workspaceFolder}\\Project\\${workspaceFolderBasename}.4DProject"
                    ]
                }
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
