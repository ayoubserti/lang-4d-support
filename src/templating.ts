'use strict';

export namespace content {

    // ".vscode/tasks.json"
    export const tasks: any = {
        version: "2.0.0", tasks: [
            {
                type: "shell",
                label: "build",
                group: {
                    kind: "build",
                    isDefault: true
                },

            }

        ]
    };

    // ".vscode/launch.json"
    export const launch: any = {
        version: '0.2.0',
        configuration: [
            { name: 'launchProject' }
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
