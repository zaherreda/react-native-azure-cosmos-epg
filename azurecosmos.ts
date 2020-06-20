import { AzureToken, AzureQuieryHeader, AzureDocHeader } from './headers'
import {IResolverElement,Resolver} from './resolver'

type RequestType =
    | 'Query'
    | 'Col'
    | 'Docs'
    ;



interface AzureConfig {
    masterKey: string;
    version: string
}
interface AzureCosmosElementResolver extends IResolverElement<RequestType> {
    azurFetch(param: FetchParam): Promise<Response>;
}

class AzureCosmosLocator extends Resolver<RequestType, AzureCosmosElementResolver> {
    static myInstance: AzureCosmosLocator = null;
    static config: AzureConfig;

    static getInstance() {
        if (AzureCosmosLocator.myInstance == null) {
            AzureCosmosLocator.myInstance = new AzureCosmosLocator();
        }

        return this.myInstance;
    }

    constructor() {
        super();
        super.Add(new AzureQuiry())
        super.Add(new AzureAddDocs())
    }
}


export const initAzureCosmos = (config: AzureConfig) => {
    AzureCosmosLocator.config = config;
}

interface FetchParam {
    uri: string,
    body: any,
    type: RequestType,
    partitionKey: string
}


class AzureQuiry implements AzureCosmosElementResolver {
    Key: RequestType = 'Query';
    constructor() {
    }
    async azurFetch(param: FetchParam) {
        const { auth, date } = AzureToken(param.uri, 'POST')
        const header = AzureQuieryHeader(auth, date, param.partitionKey);
        return fetch(param.uri, {
            method: 'POST',
            headers: header,
            body: JSON.stringify(param.body)
        })
    }
}


class AzureAddDocs implements AzureCosmosElementResolver {
    Key: RequestType = 'Docs';
    constructor() {
    }
    async azurFetch(param: FetchParam) {
        const { auth, date } = AzureToken(param.uri, 'POST')
        const header = AzureDocHeader(auth, date, param.partitionKey);
        return await fetch(param.uri, {
            method: 'POST',
            headers: header,
            body: JSON.stringify(param.body)
        })
    }
}



export const azurefetch = async (param: FetchParam) => {
    let loctor = AzureCosmosLocator.getInstance();
    const reducer = loctor.Find(param.type);
    return reducer.azurFetch(param)
}
