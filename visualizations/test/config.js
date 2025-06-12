/**
 * Gera dados de exemplo para esta visualização
 */
function getSampleData() {
    const sampleData = {
        data: [
            { categoria: 'Categoria A', valor: 35 },
            { categoria: 'Categoria B', valor: 28 },
            { categoria: 'Categoria C', valor: 22 },
            { categoria: 'Categoria D', valor: 10 },
            { categoria: 'Categoria E', valor: 5 }
        ],
        columns: ['categoria', 'valor'],
        columnTypes: { categoria: 'string', valor: 'number' },
        rowCount: 5,
        source: 'example'
    };
    
    console.log('Generated sample data:', sampleData);
    return sampleData;
}
