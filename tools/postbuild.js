const { promisify } = require('util');
const { resolve } = require('path');
const { copyFile } = require('fs');

const copyFile$ = promisify(copyFile);

(async () => {
    await copyFile$(
        resolve(__dirname, '../syntaxes/4d.tmLanguage.json'),
        resolve(__dirname, '../out/syntaxes/4d.tmLanguage.json'),
    );
    await copyFile$(
        resolve(__dirname, '../support/commands.txt'),
        resolve(__dirname, '../out/support/commands.txt'),
    );
})();
