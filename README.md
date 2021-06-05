# react-native-azure-cosmos-epg
This package provide query and insert against azure cosmos db 

# Install
```
npm i react-native-azure-cosmos-epg --save
```


# Usage

## Import library

```javascript
import { azurefetch, initAzureCosmos } from 'react-native-azure-cosmos-epg/azurecosmos'
```

## Init Cosmos Authentication 

### Using Master Key
```javascript
class App extends React.Component {
  constructor(props) {
    super(props);
    initAzureCosmos(
    {
      masterKey:${YOUR COSMOS DB MASTER KEY},
      version: "2018-12-31",
      dbUri: ${YOUR COSMOS DB URL},
      dbname: ${YOUR COSMOS DB NAME},

    }
    ...
  }
```
### Using Resource Tokens
```javascript
class App extends React.Component {
  constructor(props) {
    super(props);
    initAzureCosmos(
    {
      masterKey:'',
      version: "2018-12-31",
      dbUri: ${YOUR COSMOS DB URL},
      dbname: ${YOUR COSMOS DB NAME},
      resourcesTokens: ${USER RESOURCE TOKENS FROM BROKER SERVICE}
    }
    ...
  }
```
Broker should append the collection (container) name to the resource token ID, example for a collection called 'Countries': 
```text
 ...
 "id": "SOMEIDHERE_Countries",
 ...
```
Notice the underscore. 

## Run a Query 

```javascript
azure = async () => {
   const response = await azurefetch({
            dbname : "", //optional parameter if you want to quiry agiants another DB
            col: ${COL NAME},
            body: {
                "query": "SELECT c.id FROM ${COL NAME} c WHERE c.uid = @email",
                "parameters": [
                    { "name": "@email", "value": email }
                ]
            },
            type: 'Query',
            partitionKey: ${PARTITION VALUE}
        });

  }
```

## Insert New Documents

```javascript

azure = async () => {
    const response = await azurefetch({
              col: ${COL NAME},
              body: {
                  "id": username,
                  "code": code,
                  "name": name,
                  "photoUri": photoURL,
              },
              type: 'Insert',
              partitionKey:  ${PARTITION VALUE}
          });
```

## Execute Stored Procedure

```javascript

azure = async () => {
   const response = await azurefetch({
        spname: ${SP NAME},
        col: ${COL NAME},
        body: [id, { "photoUri": photoURL }],
        type: 'Sp',
        partitionKey: code
    });
```
