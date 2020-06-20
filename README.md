# react-native-azure-cosmos
This package provide query and insert against azure cosmos db 

# Install
```
npm i react-native-azure-cosmos --save
```


## Usage

Import library

```javascript
import { azurefetch, initAzureCosmos } from 'react-native-azure-cosmos/azurecosmos'
```

Init cosmos auth 


```javascript
class App extends React.Component {
  constructor(props) {
    super(props);
    initAzureCosmos({ masterKey: ${YOUR COSMOS DB MASTER KEY}, version: "2017-02-22" });
    ...
  }
```


Run a query 

```javascript
azure = async () => {
    var response = await azurefetch({
      uri: `https://${COSMOS-DB-URL}/dbs/${YOUR-DATABASE-NAME}/colls/${YOUR-COLL-NAME}/docs`,
      body: {
        "query": "SELECT c.id FROM ${YPUR-COLL-NAME} c WHERE c.id = @id",
        "parameters": [
          { "name": "@id", "value": "1" }
        ]
      },
      type : 'Query',
      partitionKey: `{PARTION VALUE YOU WANT TO QUERY}`
    });
    console.log(response)
    const res =await response.json();
    console.log(res)

  }
```



Add Docs

```javascript

azure = async () => {
    var response = await azurefetch({
       uri: `https://${COSMOS-DB-URL}/dbs/${YOUR-DATABASE-NAME}/colls/${YOUR-COLL-NAME}/docs`,
      body: {
        "id": "testpackage",
        "code": "098",
        "name": "blazer",
     
      },
      type: 'Docs',
      partitionKey: '098'
    });
    console.log(response)
    const res = await response.json();
    console.log(res)

  }
```
