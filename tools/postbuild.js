const { promisify } = require('util');
const { resolve } = require('path');
const { copyFile, existsSync, mkdirSync } = require('fs');

const copyFile$ = promisify(copyFile);

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
})();
