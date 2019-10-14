'use strict';

export namespace content {

    // ".vscode/tasks.json"
    export const tasks: any = {
        version: "2.0.0", tasks: [
            {
                // See https://go.microsoft.com/fwlink/?LinkId=733558
                // for the documentation about the tasks.json format
                "version": "2.0.0",
                "tasks": [
                    {
                        "label": "Build",
                        "type": "shell",
                        "group": "build",
                        "osx": {
                            "command": "/Users/mac/Desktop/tool4d.app/Contents/MacOS/4D", //TODO: to be changed
                            "args": [
                                "--headless",
                                "-s",
                                "${workspaceFolder}/Project/builder.4DProject",
                                "--data-less",
                                "--user-data",
                                "{\"makeFile\":\"${workspaceFolder}/make.json\",\"verbose\":true,\"config\":\"release\"}"
                            ]
                        },
                        "problemMatcher": []
                    }
                ]
            }

        ]
    };

    // ".vscode/launch.json"
    export const launch: any = {
        version: '0.2.0',
        configuration: [
            {
                name: "Compile Project",
                type: "4d",
                request: "launch",
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
        { source: "catalog.4DCatalog.tmpl", target: 'Project/Sources/catalog.4DCatalog' },
        { source: "folders.json.tmpl", target:  'Project/Sources/folders.json' },
        { source: "menus.json.tmpl", target:  'Project/Sources/menus.json' },
        { source: "directory.json.tmpl", target:  'Settings/directory.json' }
        ];
}
