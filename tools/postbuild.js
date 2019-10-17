const { promisify } = require('util');
const { resolve } = require('path');
const { copyFile, existsSync, mkdirSync,readdir } = require('fs');

const copyFile$ = promisify(copyFile);
const readdir$  = promisify(readdir);
(async () => {
    if (!existsSync( resolve(__dirname, '../dist/syntaxes'))){
        mkdirSync(resolve(__dirname, '../dist/syntaxes'));
    }
    if (!existsSync( resolve(__dirname, '../dist/support'))){
        mkdirSync(resolve(__dirname, '../dist/support'));
    }
    await copyFile$(
        resolve(__dirname, '../syntaxes/4d.tmLanguage.json'),
        resolve(__dirname, '../dist/syntaxes/4d.tmLanguage.json'),
    );
    await copyFile$(
        resolve(__dirname, '../support/commands.txt'),
        resolve(__dirname, '../dist/support/commands.txt'),
    );
    
    let source_path = resolve(__dirname, '../template/')
    let files = await readdir$(source_path);
    if (!existsSync( resolve(__dirname, '../dist/template'))){
        mkdirSync(resolve(__dirname, '../dist/template'));
    }
    files.forEach(async (elm)=>{
        await copyFile$(resolve(source_path,elm), resolve(__dirname,'../dist/template/',elm));
    });
    
})();
