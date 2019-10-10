const { promisify } = require('util');
const { resolve } = require('path');
const { copyFile, existsSync, mkdirSync,readdir } = require('fs');

const copyFile$ = promisify(copyFile);
const readdir$  = promisify(readdir);
(async () => {
    if (!existsSync( resolve(__dirname, '../out/syntaxes'))){
        mkdirSync(resolve(__dirname, '../out/syntaxes'));
    }
    if (!existsSync( resolve(__dirname, '../out/support'))){
        mkdirSync(resolve(__dirname, '../out/support'));
    }
    await copyFile$(
        resolve(__dirname, '../syntaxes/4d.tmLanguage.json'),
        resolve(__dirname, '../out/syntaxes/4d.tmLanguage.json'),
    );
    await copyFile$(
        resolve(__dirname, '../support/commands.txt'),
        resolve(__dirname, '../out/support/commands.txt'),
    );
    
    let source_path = resolve(__dirname, '../template/')
    let files = await readdir$(source_path);
    if (!existsSync( resolve(__dirname, '../out/template'))){
        mkdirSync(resolve(__dirname, '../out/template'));
    }
    files.forEach(async (elm)=>{
        await copyFile$(resolve(source_path,elm), resolve(__dirname,'../out/template/',elm));
    });
    
})();
