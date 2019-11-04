import * as xml from "fast-xml-parser";
import { readFile,writeFile } from 'fs';
import * as vscode from "vscode";
import {promisify} from 'util';
import * as uuid from 'uuid/v1';

/**
 * catalog Definition.
 * Provide the catalog definition
 */

const readFile$ = promisify(readFile);
const writeFile$ = promisify(writeFile);
export interface D4Table {
    _name: string;
    _field_list: Array<string>;

}

export enum D4FieldType{
    eBoolean  = 1,
    eInteger = 3,
    eLongInteger = 4,
    eLong64 = 5,
    eReal = 6,
    eDate = 8,
    eTime = 9,
    eText = 10,
    ePicture = 12,
    eBlob = 18,
    eObject = 21
}

export const D4Types = ["Alpha", "Text", "Date", "Time", "Boolean", "Integer", "Long Integer" ,"Integer 64 bits", "Real", "Blob", "Picture", "Object"];
export interface D4Field{
    _name : string;
    _type : D4FieldType;
    _options :any;
}
export interface D4Table2 {
    _name: string;
    _field_list: Array<D4Field>;
}

const  options = {
    attributeNamePrefix: "",
    attrNodeName: "attr", //default is 'false'
    textNodeName: "#text",
    ignoreAttributes: false,
    ignoreNameSpace: false,
    allowBooleanAttributes: true,
    parseNodeValue: true,
    parseAttributeValue: true,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    localeRange: "", //To support non english character in tag/attribute values.
    parseTrueNumberOnly: false
};

function generate_uuid(){
    const arr = new Array();
    uuid(null, arr, 0);
    return Buffer.from(arr).toString("hex").toUpperCase();
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
                let jsonObj = xml.parse(data.toString(), options);
                this._table_list = [];
                if (jsonObj.base.table !== undefined) {
                    if ( Array.isArray( jsonObj.base.table)){
                        for (let t of jsonObj.base.table) {
                            let name: string = t.attr["name"];
                            let fields = [];
                            for (let f of t.field) {
                                fields.push(f.attr["name"]);
                            }
                            this._table_list.push({
                                _name: name,
                                _field_list: fields
                            });
                        }
                    }
                    else{
                        //one single table
                        let t = jsonObj.base.table;
                        let name: string = t.attr["name"];
                            let fields = [];
                            for (let f of t.field) {
                                fields.push(f.attr["name"]);
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

    public async AddTable( name : string, table_def? : D4Table2) {
        
        return new Promise(async (resolve) => {
        
            let Parser = xml.j2xParser;  //xml to json
            let buf = await readFile$(this._filename);
            var  jsonObj =  xml.parse(buf.toString(),options);
            let table =   { attr : {} , field:[]};
            table.attr={
                "id" : "1",
                "name" : name,
                "uuid" : generate_uuid()
            };
            if ( table_def !== undefined)
            {
                let i = 1;
                for( let f of table_def._field_list)
                {
                    let field = {
                        attr : {
                            "autosequence" : f._options.autosequence,
                            "name" :f._name,
                            "not_null" : f._options.not_null,
                            "unique" : f._options.unique,
                            "type" : f._type,
                            "uuid" : generate_uuid(),
                            "id" : i+""
                        }
                    };
                    table.field.push(field);
                }
            }

            if (jsonObj.base.table === undefined)
            {
                //create table obj
                jsonObj.base.table = table;
            }
            else if ( Array.isArray(table_def))
            {
                //compute table id
                let i = 1;
                for (let t of jsonObj.base.table)
                {
                    let val =parseInt(t.attr["id"]); 
                    if ( i < val ){
                        i = val;
                    }
                }
                i+=1;
                table.attr["id"] = i;
                jsonObj.base.table.push(table);
            }
            else{
                //one single Object
                let tables = [];
                table.attr['id']= "2";
                tables.push(jsonObj.base.table);
                tables.push(table);
                jsonObj.base.table= tables;
            }

            let parser = new Parser(options);
            let xml_str =  parser.parse(jsonObj);
            await writeFile$(this._filename, xml_str);
        });
    }
}

export const catalog = new Catalog(vscode.workspace.rootPath + '/Project/Sources/catalog.4DCatalog');