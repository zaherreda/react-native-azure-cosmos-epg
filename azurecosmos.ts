import { AzureToken, AzureQuieryHeader, AzureDocHeader } from './headers'
import { IResolverElement, Resolver } from './resolver'

type RequestType =
    | 'Query'
    | 'Insert'
    | 'Update'
    | 'Sp'
    |'AllCols'
    |'ById'
    ;



interface AzureConfig {
    masterKey: string;
    version: string;
    dbUri: string;
    dbname: string;
}
interface AzureCosmosElementResolver extends IResolverElement<RequestType> {
    azurFetch(param: BaseFetchParam): Promise<Response>;
}

abstract class BaseAzureCosmosElementResolver<T extends BaseFetchParam> implements AzureCosmosElementResolver {

    abstract Key: RequestType;
    abstract azurFetch(param: BaseFetchParam): Promise<Response>;
    public dbname(param: T): string {
        return param.dbname ? param.dbname : AzureCosmosLocator.config.dbname;
    }
    public uri(param: T): string {
        return `${AzureCosmosLocator.config.dbUri}dbs/${this.dbname(param)}/colls/${param.col}/docs`
    }


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
        super.Add(new AzureQuiry());
        super.Add(new AzureAddDocs());
        super.Add(new AzureUpdateDocs());
        super.Add(new AzureSp());
        super.Add(new AzureAllCols());
        super.Add(new AzureById());
    }
}


export const initAzureCosmos = (config: AzureConfig) => {
    AzureCosmosLocator.config = config;
}

interface BaseFetchParam {
    dbname?: string,
    col: string,
    body: any,
    type: RequestType,
    partitionKey: string
}
interface UpdateFetchParam extends BaseFetchParam {
    id: string
}

interface SpFetchParam extends BaseFetchParam {
    spname: string
}


class AzureQuiry extends BaseAzureCosmosElementResolver<BaseFetchParam> {
    Key: RequestType = 'Query';
    constructor() {
        super()
    }
    async azurFetch(param: BaseFetchParam) {
        const uri = super.uri(param);
        const { auth, date } = AzureToken(uri, 'POST')
        const header = AzureQuieryHeader(auth, date, param.partitionKey);
        return fetch(uri, {
            method: 'POST',
            headers: header,
            body: JSON.stringify(param.body)
        }).then(response => response.json())
    }
}


class AzureAllCols extends BaseAzureCosmosElementResolver<BaseFetchParam> {
    Key: RequestType = 'AllCols';
    constructor() {
        super()
    }
    async azurFetch(param: BaseFetchParam) {
        const uri = super.uri(param);
        const { auth, date } = AzureToken(uri, 'GET')
        const header = AzureDocHeader(auth, date, param.partitionKey);
        delete header['x-ms-documentdb-partitionkey'];
        return await fetch(uri, {
            method: 'GET',
            headers: header,
        }).then(response => response.json())
    }
}



class AzureById extends BaseAzureCosmosElementResolver<UpdateFetchParam> {
    Key: RequestType = 'ById';
    constructor() {
        super()
    }

    public uri(param: UpdateFetchParam): string {
        return `${AzureCosmosLocator.config.dbUri}dbs/${this.dbname(param)}/colls/${param.col}/docs/${param.id}`
    }

    async azurFetch(param: UpdateFetchParam) {
        const uri = this.uri(param);
        const { auth, date } = AzureToken(uri, 'GET')
        console.log("AUTH"+auth);
        const header = AzureDocHeader(auth, date, param.partitionKey);
        return await fetch(uri, {
            method: 'GET',
            headers: header
        }).then(response => response.json())
    }
}

class AzureAddDocs extends BaseAzureCosmosElementResolver<BaseFetchParam> {
    Key: RequestType = 'Insert';
    constructor() {
        super()
    }
    async azurFetch(param: BaseFetchParam) {
        const uri = super.uri(param);
        console.log("URI"+uri);
        const { auth, date } = AzureToken(uri, 'POST')
        //console.log("AUTH"+auth);
        const header = AzureDocHeader(auth, date, param.partitionKey);
        console.log("HEADER: "+header.Authorization);
        const response = await fetch(uri, {
            method: 'POST',
            headers: header,
            body: JSON.stringify(param.body)
        })
        console.log(response);
        return response;
    }
}


class AzureSp extends BaseAzureCosmosElementResolver<SpFetchParam> {
    Key: RequestType = 'Sp';
    constructor() {
        super()
    }

    public uri(param: SpFetchParam): string {
        return `${AzureCosmosLocator.config.dbUri}dbs/${super.dbname(param)}/colls/${param.col}/sprocs/${param.spname}`
    }

    async azurFetch(param: SpFetchParam) {
        const uri = this.uri(param);
        const { auth, date } = AzureToken(uri, 'POST')
        const header = AzureDocHeader(auth, date, param.partitionKey);
        return await fetch(uri, {
            method: 'POST',
            headers: header,
            body: JSON.stringify(param.body)
        })
    }
}

class AzureUpdateDocs extends BaseAzureCosmosElementResolver<UpdateFetchParam> {
    Key: RequestType = 'Update';
    constructor() {
        super()
    }

    public uri(param: UpdateFetchParam): string {
        return `${AzureCosmosLocator.config.dbUri}dbs/${super.dbname(param)}/colls/${param.col}/docs/${param.id}`
    }

    async azurFetch(param: UpdateFetchParam) {
        const uri = this.uri(param);
        const { auth, date } = AzureToken(uri, 'PUT')
        const header = AzureDocHeader(auth, date, param.partitionKey);
        return await fetch(uri, {
            method: 'PUT',
            headers: header,
            body: JSON.stringify(param.body)
        })
    }
}



export const azurefetch = async (param: BaseFetchParam) => {
    let loctor = AzureCosmosLocator.getInstance();
    const reducer = loctor.Find(param.type);
    return reducer.azurFetch(param);
}