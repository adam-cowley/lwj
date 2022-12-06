# LWJ


## Neo4j

Install Neo4j Driver

```
npm i --save neo4j-driver
```


## Netlify

### Install CLI

```
npm install --location=global netlify-cli
```

### Login

```
$ netlify login
Opening https://app.netlify.com/authorize?response_type=ticket&ticket=XXX

You are now logged into your Netlify account!


$ netlify status
──────────────────────┐
 Current Netlify User │
──────────────────────┘
Name:  Adam Cowley

```

### Local Dev

```
netlify link
netlify dev

netlify env:set NEO4J_URI neo4j+s://XXX.databases.neo4j.io
netlify env:set NEO4J_USERNAME neo4j
netlify env:set NEO4J_PASSWORD XXX
```

### Scheduled Functions

```
npm install --save @netlify/functions
```


#### `netlify/functions/import-data-background.js`

1. Get Episodes from `https://www.learnwithjason.dev/episodes?_data=routes%2Fepisodes`
2. Import into Neo4j
   a. `(:Episode)`
   b. `(:Episode)-[:HOSTED_BY]->(:Person & :Host)`
   c. `(:Episode)-[:TAUGHT_BY]->(:Person & :Teacher)`
   d. `(:Episode)-[:HAS_GUEST]->(:Person)`
   e. `(:Episode)-[:HAS_TAG]->(:Tag)`
   f. `(:Episode)-[:HAS_LINK]->(:Link)`


Tasks:
* [Explore in Bloom](https://bloom.neo4j.io)

#### `netlify/functions/recommend.js`

1. Take the slug from query params and use graph to recommend other lessons
