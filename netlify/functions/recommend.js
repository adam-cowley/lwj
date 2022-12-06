import neo4j from 'neo4j-driver'

const handler = async function(event, context) {
    const {
        NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD
    } = process.env

    const driver = neo4j.driver(
        NEO4J_URI,
        neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
    )

    const session = driver.session()

    try {
        const res = await session.executeRead(
            tx => tx.run(`
                MATCH (:Episode {slug: $slug})-[:HAS_TAG|HAS_GUEST|HAS_LINK]->(t)<-[]-(e)
                WITH e, collect(distinct t) AS tags
                RETURN e {
                    .*,
                    date: toString(e.date),
                    tags: [ t in tags | { labels: labels(t), url: t.url, name: t.name } ]
                } AS episode
                ORDER BY size(tags) DESC
                LIMIT 10
            `, { slug: event.queryStringParameters.slug })
        )

        const data = res.records.map(
            record => record.get('episode')
        )

        return {
            statusCode: 200,
            body: JSON.stringify({ data, query: event.queryStringParameters })
        }
    }
    catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: e.message, })
        };
    }
    finally {
        await session.close()
        await driver.close()
    }
}

exports.handler = handler
