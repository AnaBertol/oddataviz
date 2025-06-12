/**
 * CONFIGURAÇÕES DO GRÁFICO DE WAFFLE
 * Define configurações específicas para o waffle chart
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

const VIZ_CONFIG = {
    // Identificação
    type: 'waffle-chart',
    name: 'Gráfico de Waffle',
    description: 'Visualização em formato de grade para mostrar proporções e distribuições',
    
    // Requisitos de dados
    dataRequirements: {
        requiredColumns: ['categoria', 'valor'],
        columnTypes: {
            categoria: 'string',
            valor: 'number'
        },
        minRows: 2,
        maxRows: 10 // Limitado para 10 categorias para funcionar bem em 10x10
    },
    
    // Configurações específicas do waffle
    waffleSettings: {
        gridSize: 10, // Grade 10x10 = 100 quadrados
        totalSquares: 100,
        defaultSquareSize: 25,
        minSquareSize: 15,
        maxSquareSize: 45,
        defaultGap: 2,
        maxGap: 10,
        defaultRoundness: 3,
        maxRoundness: 12
    },
    
    // Configurações de layout
    layout: {
        margins: { top: 60, right: 60, bottom: 120, left: 60 },
        defaultWidth: 800,
        defaultHeight: 600
    },
    
    // Configurações de cores específicas
    colorSettings: {
        colorByOptions: [
            { value: 'default', label: 'Padrão' },
            { value: 'categoria', label: 'Categoria' },
            { value: 'valor', label: 'Valor' }
        ]
    }
};

// ==========================================================================
// FUNÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

/**
 * Implementa getDataRequirements para data-utils.js
 */
function getDataRequirements() {
    return VIZ_CONFIG.dataRequirements;
}

/**
 * Gera dados de exemplo para waffle chart
 */
function getSampleData() {
    return {
        data: [
            { categoria: 'Categoria A', valor: 35 },
            { categoria: 'Categoria B', valor: 25 },
            { categoria: 'Categoria C', valor: 20 },
            { categoria: 'Categoria D', valor: 15 },
            { categoria: 'Categoria E', valor: 5 }
        ],
        columns: ['categoria', 'valor'],
        columnTypes: { categoria: 'string', valor: 'number' },
        rowCount: 5,
        source: 'example'
    };
}

/**
 * Processa dados para o formato waffle
 * Converte valores em proporções para ocupar os 100 quadrados
 */
function processWaffleData(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return [];
    }
    
    // Calcula total
    const total = data.reduce((sum, d) => sum + (d.valor || 0), 0);
    
    if (total === 0) {
        return [];
    }
    
    // Converte para proporções e calcula quadrados
    let processedData = data.map(d => {
        const proportion = d.valor / total;
        const squares = Math.round(proportion * VIZ_CONFIG.waffleSettings.totalSquares);
        return {
            ...d,
            proportion: proportion,
            squares: squares,
            percentage: Math.round(proportion * 100)
        };
    });
    
    // Ajusta para garantir exatamente 100 quadrados
    const totalSquares = processedData.reduce((sum, d) => sum + d.squares, 0);
    const diff = VIZ_CONFIG.waffleSettings.totalSquares - totalSquares;
    
    if (diff !== 0) {
        // Ajusta o maior valor
        const maxIndex = processedData.reduce((maxIdx, d, idx) => 
            d.squares > processedData[maxIdx].squares ? idx : maxIdx, 0);
        processedData[maxIndex].squares += diff;
    }
    
    return processedData;
}

/**
 * Gera array de quadrados para renderização
 */
function generateSquaresArray(processedData) {
    const squares = [];
    let currentIndex = 0;
    
    processedData.forEach((category, categoryIndex) => {
        for (let i = 0; i < category.squares; i++) {
            squares.push({
                index: currentIndex,
                row: Math.floor(currentIndex / VIZ_CONFIG.waffleSettings.gridSize),
                col: currentIndex % VIZ_CONFIG.waffleSettings.gridSize,
                category: category.categoria,
                value: category.valor,
                categoryIndex: categoryIndex,
                percentage: category.percentage
            });
            currentIndex++;
        }
    });
    
    return squares;
}

/**
 * Callback quando dados são carregados
 */
function onDataLoaded(processedData) {
    console.log('Waffle chart - Data loaded:', processedData);
    
    // Popula opções de "Aplicar Cores Por"
    if (window.OddVizTemplateControls) {
        window.OddVizTemplateControls.populateColorByOptions();
    }
    
    // Atualiza a visualização
    if (window.WaffleVisualization && window.WaffleVisualization.onDataLoaded) {
        window.WaffleVisualization.onDataLoaded(processedData);
    }
}

/**
 * Callback quando controles são atualizados
 */
function onControlsUpdate(state) {
    console.log('Waffle controls updated:', state);
    
    // Passa o estado completo para a visualização
    if (window.WaffleVisualization && window.WaffleVisualization.onUpdate) {
        window.WaffleVisualization.onUpdate(state);
    }
}

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================

/**
 * Inicializa a página do waffle chart
 */
function initWafflePage() {
    console.log('Initializing waffle chart page...');
    
    // Carrega dados de exemplo automaticamente após um pequeno delay
    setTimeout(() => {
        console.log('Auto-loading waffle sample data...');
        const sampleData = getSampleData();
        
        // Atualiza textarea com dados de exemplo
        const textarea = document.getElementById('data-text-input');
        if (textarea && window.OddVizData) {
            const csvData = window.OddVizData.convertDataToCSV(sampleData.data);
            textarea.value = csvData;
            
            // Dispara o processamento dos dados
            window.OddVizData.handleTextareaInput();
        }
    }, 1000);
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

// Torna funções disponíveis globalmente
window.WaffleVizConfig = {
    config: VIZ_CONFIG,
    getSampleData,
    getDataRequirements,
    onDataLoaded,
    onControlsUpdate,
    initWafflePage,
    processWaffleData,
    generateSquaresArray
};

// Expõe funções principais globalmente para outros módulos
window.getSampleData = getSampleData;
window.getDataRequirements = getDataRequirements;
window.onDataLoaded = onDataLoaded;

// Auto-inicialização quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWafflePage);
} else {
    setTimeout(initWafflePage, 100);
}

console.log('Waffle chart config loaded successfully');
