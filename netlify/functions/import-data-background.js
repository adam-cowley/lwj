import { schedule }  from '@netlify/functions'
import fetch from 'node-fetch'
import neo4j from 'neo4j-driver'

const handler = async function(event, context) {
    const URL = 'https://www.learnwithjason.dev/episodes?_data=routes%2Fepisodes'

    const res = await fetch(URL)
    const episodes = await res.json()

    const {
        NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD
    } = process.env

    const driver = neo4j.driver(
        NEO4J_URI,
        neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD)
    )

    const session = driver.session()

    try {
        const res = await session.executeWrite(
            tx => tx.run(`
                UNWIND $episodes AS episode
                MERGE (e:Episode {id: episode._id})
                SET e += episode { .title, .description, .demo, .repo, .youtubeID },
                    e.date = datetime(episode.date),
                    e.slug = episode.slug.current

                // Host
                MERGE (h:Person {name: episode.host.name})
                SET h:Host, h += episode.host
                MERGE (e)-[:HOSTED_BY]->(h)

                // Teacher
                MERGE (t:Person {name: episode.host.name})
                SET t:Teacher, h += episode.host
                MERGE (e)-[:TAUGHT_BY]->(t)

                // Guests
                FOREACH (guest in episode.guests |
                    MERGE (g:Person {name: guest.name})
                    SET g += guest

                    MERGE (e)-[:HAS_GUEST]->(g)
                )

                // Tags
                FOREACH (tag IN episode.tags |
                    MERGE (t:Tag {slug: tag.slug})
                    SET t.name = tag.slug

                    MERGE (e)-[:HAS_TAG]->(t)
                )

                // Links
                FOREACH (url IN episode.links |
                    MERGE (l:Link {url: url})

                    MERGE (e)-[:HAS_LINK]->(l)
                )

                RETURN count(*) AS count
            `, { episodes })
        )

        const count = res.records[0].get('count').toNumber()

        return {
            statusCode: 200,
            body: JSON.stringify({ episodes: episodes.length, count, })
        }
    }
    catch (e) {
        console.log('e', e.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: e.message, })
        };
    }
    finally {
        await session.close()
        await driver.close()
    }
};

exports.handler = schedule("@daily", handler);