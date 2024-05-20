const express = require('express');

// Constants
const neo4j = require('neo4j-driver');
const URI = 'bolt://localhost:7687';
const USER = 'neo4j';
const PASSWORD = 'node@123456';
const DATABASE = 'neo4j';
const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD))

const app = express();

app.use(express.json());

// GET
app.get('/', async (req, res) => {

    const session = driver.session({ DATABASE });
    try {
        
        const result = await session.executeRead(tx =>
            tx.run(`
                    MATCH (c:Cidade)-[:TEM_ATIVIDADE]->(a:Atividade)
                    MATCH (c)-[:CIDADE_PERTENCE_ESTADO]->(e:Estado)
                    WHERE a.descricaoAtividade = 'Agricultura'
                    RETURN (c.nomeCidade + '-'+ e.sigla) as nomeCidade
                    ORDER BY nomeCidade
                     `, {}
                )
            );

        let formattedResult = result.records.map(item => item.get('nomeCidade'));

        res.status(200).json(formattedResult);


    } catch (error) {
        res.status(500).send({ error: error.message });
    } finally {
        await session.close()
    }
});

// POST
app.post('/', async (req, res) => {

    const session = driver.session({ DATABASE });
    try {        
        const result = await session.executeWrite(tx =>
            tx.run(
                `
                    MATCH (c:Cidade)-[:CIDADE_PERTENCE_ESTADO]->(e:Estado)
                    WHERE c.nomeCidade = $cidade AND e.sigla = $estado
                    SET c.novoAtributo = $novoAtributo
                    RETURN c as result
                `,
                { cidade: req.body.cidade, estado: req.body.estado, novoAtributo: req.body.novoAtributo }
            )
        );

        const formattedResult = result.records.map(item => item.get('result'));

        res.status(200).json(formattedResult);

    } catch (error) {
        res.status(500).json({ error: error.message });
    } finally {
        await session.close()
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${ PORT } `);
});