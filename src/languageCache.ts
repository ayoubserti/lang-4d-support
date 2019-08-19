import * as d4lang from './languageDefinition';

class Cache{

    private  _methods : Map<string ,d4lang.Method4D> = new Map;

    constructor(){

    }

    public addMethod (method: d4lang.Method4D) {
        /**
         * add or refresh
         */
        if (method._name !== ""){
            this._methods.set(method._name,method);
        }
    }

    public getMethods() : Map<string, d4lang.Method4D> {
        return this._methods;
    }

}

export  const LangCache = new Cache();