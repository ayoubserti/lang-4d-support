import * as xml from "fast-xml-parser";
import { readFile } from 'fs';
import * as vscode from "vscode";
import {promisify} from 'util';
/**
 * catalog Definition.
 * Provide the catalog definition
 */

const readFile$ = promisify(readFile);
export interface D4Table {
    _name: string;
    _field_list: Array<string>;

}
class Catalog {

    _filename: string;
    _table_list: Array<D4Table> = [];

    constructor(catalogPath: string) {
        this._filename = catalogPath;

    }

    public refresh(): Promise<Array<D4Table>> {

        return new Promise((resolve, reject) => {
            readFile$(this._filename).then((data: Buffer) => {
                var options = {
                    attributeNamePrefix: "@_",
                    attrNodeName: "attr", //default is 'false'
                    textNodeName: "#text",
                    ignoreAttributes: false,
                    ignoreNameSpace: false,
                    allowBooleanAttributes: true,
                    parseNodeValue: true,
                    parseAttributeValue: false,
                    trimValues: true,
                    cdataTagName: "__cdata", //default is 'false'
                    cdataPositionChar: "\\c",
                    localeRange: "", //To support non english character in tag/attribute values.
                    parseTrueNumberOnly: false
                };
                let jsonObj = xml.parse(data.toString(), options);
                this._table_list = [];
                if (jsonObj.base.table !== undefined) {
                    for (let t of jsonObj.base.table) {
                        let name: string = t.attr["@_name"];
                        let fields = [];
                        for (let f of t.field) {
                            fields.push(f.attr["@_name"]);
                        }
                        this._table_list.push({
                            _name: name,
                            _field_list: fields
                        });
                    }
                }
                resolve(this._table_list);
            });
        });
    }

}

export const catalog = new Catalog(vscode.workspace.rootPath + '/Project/Sources/catalog.4DCatalog');