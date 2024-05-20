LOAD CSV WITH HEADERS FROM 'file:///BRAZIL_CITIES.csv'  as row FIELDTERMINATOR ';'
WITH row 

// Carrega cidade
MERGE (cidade:Cidade {nomeCidade:row.`CITY`, siglaEstado:row.`STATE`})
SET cidade.capital = row.`CAPITAL` = '1',
    cidade.populacao = row.`POP_GDP`,
    cidade.tipoCidade = row.`RURAL_URBAN`,
    cidade.atividade = row.`GVA_MAIN`

// Carrega estado
MERGE (estado:Estado {sigla:row.`STATE`})
MERGE (cidade)-[:CIDADE_PERTENCE_ESTADO]->(estado)

// Carrega atividades
WITH cidade,row.`GVA_MAIN` as atividades
WITH cidade,replace(atividades,' e ',',') as atividades
WITH cidade,replace(atividades,'inclusive a ','') as atividades
WITH cidade,replace(atividades,'apoio à','') as atividades
WITH cidade, split(atividades,',') as listAtividades
UNWIND listAtividades as atividade
WITH cidade,trim(atividade) as atividade
WITH cidade, apoc.text.capitalize(atividade) as atividade

MERGE (ativ:Atividade {descricaoAtividade:atividade})
MERGE (cidade)-[:TEM_ATIVIDADE]->(ativ)
