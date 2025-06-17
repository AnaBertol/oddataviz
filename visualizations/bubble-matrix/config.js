/**
 * CONFIGURAÇÕES DA MATRIZ DE BOLHAS - VERSÃO INICIAL
 * Matriz onde cada célula é um círculo com área proporcional ao valor
 * Normalização por coluna permite comparar métricas com diferentes unidades
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

const VIZ_CONFIG = {
    type: 'bubble-matrix',
    name: 'Matriz de Bolhas',
    description: 'Matriz onde células são círculos com área proporcional ao valor, normalizada por coluna',
    
    dataRequirements: {
        // Sistema flexível - aceita qualquer estrutura com:
        // - Primeira coluna: categoria (string)
        // - Demais colunas: métricas numéricas (mínimo 2)
        minRows: 3,
        maxRows: 15,
        minColumns: 3, // 1 categoria + pelo menos 2 métricas
        maxColumns: 8, // 1 categoria + até 7 métricas
        
        // Validação automática
        autoDetectStructure: true,
        firstColumnAsCategory: true,
        remainingColumnsAsMetrics: true
    },
    
    // Controles específicos da matriz de bolhas
    specificControls: {
        // Tamanhos das bolhas
        minBubbleSize: { min: 8, max: 25, default: 12, step: 1 },
        maxBubbleSize: { min: 30, max: 80, default: 50, step: 2 },
        
        // Espaçamento
        cellWidth: { min: 80, max: 150, default: 120, step: 5 },
        cellHeight: { min: 60, max: 120, default: 80, step: 5 },
        
        // Ordenação
        sortBy: { default: 'original' }, // 'original' ou nome da coluna
        sortOrder: { default: 'desc' }, // 'asc' ou 'desc'
        
        // Cores
        colorMode: { 
            options: ['by-column', 'by-row', 'single'], 
            default: 'by-column' 
        },
        
        // Exibição
        showColumnHeaders: { default: true },
        showRowLabels: { default: true },
        showValues: { default: true },
        showUnits: { default: true }, // Mostra unidades (R$, %, etc.)
        
        // Estilo das bolhas
        bubbleOpacity: { min: 0.6, max: 1.0, default: 0.9, step: 0.05 },
        bubbleStroke: { default: true },
        strokeWidth: { min: 0.5, max: 3, default: 1, step: 0.5 }
    },
    
    layout: {
        fixedFormat: 'wide', // Formato panorâmico para acomodar múltiplas colunas
        fixedWidth: 1000,
        fixedHeight: 600,
        margins: { top: 80, right: 60, bottom: 60, left: 150 } // Margem esquerda maior para rótulos
    },
    
    colorSettings: {
        defaultPalette: 'odd',
        byColumnColors: ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165', '#FF6B6B'],
        byRowColors: ['#6F02FD', '#2C0165', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8'],
        singleColor: '#6F02FD'
    }
};

// ==========================================================================
// DADOS DE EXEMPLO GENÉRICOS E FLEXÍVEIS
// ==========================================================================

function getSampleData() {
    return {
        data: [
            {
                categoria: 'Categoria A',
                metrica_1: 89.5,
                metrica_2: 67.2,
                metrica_3: 234.8,
                metrica_4: 45.1
            },
            {
                categoria: 'Categoria B',
                metrica_1: 72.3,
                metrica_2: 89.1,
                metrica_3: 156.4,
                metrica_4: 67.8
            },
            {
                categoria: 'Categoria C',
                metrica_1: 156.7,
                metrica_2: 34.5,
                metrica_3: 98.2,
                metrica_4: 23.9
            },
            {
                categoria: 'Categoria D',
                metrica_1: 45.2,
                metrica_2: 78.9,
                metrica_3: 67.1,
                metrica_4: 34.5
            },
            {
                categoria: 'Categoria E',
                metrica_1: 123.4,
                metrica_2: 45.6,
                metrica_3: 189.3,
                metrica_4: 12.7
            },
            {
                categoria: 'Categoria F',
                metrica_1: 67.8,
                metrica_2: 92.3,
                metrica_3: 78.5,
                metrica_4: 56.2
            }
        ],
        // Estrutura será detectada automaticamente
        columns: ['categoria', 'metrica_1', 'metrica_2', 'metrica_3', 'metrica_4'],
        columnTypes: {
            categoria: 'string',
            metrica_1: 'number',
            metrica_2: 'number',
            metrica_3: 'number',
            metrica_4: 'number'
        },
        // Metadados opcionais - se não fornecidos, usa nomes das colunas
        columnMetadata: {
            metrica_1: {
                name: 'Métrica Alpha',
                unit: 'un',
                format: 'number',
                description: 'Primeira métrica de exemplo'
            },
            metrica_2: {
                name: 'Métrica Beta',
                unit: '%',
                format: 'percentage',
                description: 'Segunda métrica de exemplo'
            },
            metrica_3: {
                name: 'Métrica Gamma',
                unit: 'k',
                format: 'number',
                description: 'Terceira métrica de exemplo'
            },
            metrica_4: {
                name: 'Métrica Delta',
                unit: 'pts',
                format: 'number',
                description: 'Quarta métrica de exemplo'
            }
        },
        rowCount: 6,
        source: 'example',
        mode: 'bubble-matrix'
    };
}

// ==========================================================================
// FUNÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

function getDataRequirements() {
    return VIZ_CONFIG.dataRequirements;
}

function onDataLoaded(processedData) {
    // Validação automática da estrutura
    const validationResult = validateDataStructure(processedData);
    
    if (!validationResult.isValid) {
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(validationResult.message, 'error');
        }
        return;
    }
    
    // Avisos para datasets muito grandes
    if (processedData.data && processedData.data.length > 15) {
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(
                'Dataset grande! Recomendamos até 15 categorias para melhor visualização.', 
                'warn'
            );
        }
    }
    
    if (window.BubbleMatrixVisualization?.onDataLoaded) {
        window.BubbleMatrixVisualization.onDataLoaded(processedData);
    }
}

/**
 * Valida se os dados têm a estrutura mínima necessária
 */
function validateDataStructure(processedData) {
    if (!processedData || !processedData.data || !Array.isArray(processedData.data)) {
        return { isValid: false, message: 'Dados não encontrados ou formato inválido.' };
    }
    
    const data = processedData.data;
    if (data.length < 3) {
        return { isValid: false, message: 'São necessárias pelo menos 3 linhas de dados.' };
    }
    
    // Analisa primeira linha para detectar estrutura
    const firstRow = data[0];
    const columns = Object.keys(firstRow);
    
    if (columns.length < 3) {
        return { isValid: false, message: 'São necessárias pelo menos 3 colunas (1 categoria + 2 métricas).' };
    }
    
    if (columns.length > 8) {
        return { isValid: false, message: 'Máximo de 8 colunas suportadas (1 categoria + 7 métricas).' };
    }
    
    // Primeira coluna deve ser string (categoria)
    const categoryColumn = columns[0];
    const categoryValue = firstRow[categoryColumn];
    if (typeof categoryValue !== 'string') {
        return { isValid: false, message: 'Primeira coluna deve conter categorias (texto).' };
    }
    
    // Demais colunas devem ser numéricas
    for (let i = 1; i < columns.length; i++) {
        const metricColumn = columns[i];
        const metricValue = firstRow[metricColumn];
        if (typeof metricValue !== 'number' || isNaN(metricValue)) {
            return { 
                isValid: false, 
                message: `Coluna '${metricColumn}' deve conter valores numéricos.` 
            };
        }
    }
    
    return { isValid: true, message: 'Estrutura de dados válida.' };
}

// ==========================================================================
// CONTROLES ESPECÍFICOS DA MATRIZ DE BOLHAS
// ==========================================================================

function onBubbleMatrixControlsUpdate() {
    const bubbleControls = {
        minBubbleSize: parseInt(document.getElementById('min-bubble-size')?.value || VIZ_CONFIG.specificControls.minBubbleSize.default),
        maxBubbleSize: parseInt(document.getElementById('max-bubble-size')?.value || VIZ_CONFIG.specificControls.maxBubbleSize.default),
        cellWidth: parseInt(document.getElementById('cell-width')?.value || VIZ_CONFIG.specificControls.cellWidth.default),
        cellHeight: parseInt(document.getElementById('cell-height')?.value || VIZ_CONFIG.specificControls.cellHeight.default),
        bubbleOpacity: parseFloat(document.getElementById('bubble-opacity')?.value || VIZ_CONFIG.specificControls.bubbleOpacity.default),
        strokeWidth: parseFloat(document.getElementById('stroke-width')?.value || VIZ_CONFIG.specificControls.strokeWidth.default),
        bubbleStroke: document.getElementById('bubble-stroke')?.checked !== false
    };
    
    if (window.BubbleMatrixVisualization?.onBubbleMatrixControlUpdate) {
        window.BubbleMatrixVisualization.onBubbleMatrixControlUpdate(bubbleControls);
    }
}

function onSortingChange() {
    const sortBy = document.getElementById('sort-by')?.value || 'original';
    const sortOrder = document.getElementById('sort-order')?.value || 'desc';
    
    if (window.BubbleMatrixVisualization?.onSortingChange) {
        window.BubbleMatrixVisualization.onSortingChange(sortBy, sortOrder);
    }
}

function onColorModeChange(colorMode) {
    if (window.BubbleMatrixVisualization?.onColorModeChange) {
        window.BubbleMatrixVisualization.onColorModeChange(colorMode);
    }
}

function onShowControlsChange() {
    const showControls = {
        showColumnHeaders: document.getElementById('show-column-headers')?.checked !== false,
        showRowLabels: document.getElementById('show-row-labels')?.checked !== false,
        showValues: document.getElementById('show-values')?.checked !== false,
        showUnits: document.getElementById('show-units')?.checked !== false
    };
    
    if (window.BubbleMatrixVisualization?.onShowControlsChange) {
        window.BubbleMatrixVisualization.onShowControlsChange(showControls);
    }
}

// ==========================================================================
// CONFIGURAÇÃO DE CONTROLES
// ==========================================================================

function setupBubbleMatrixControls() {
    console.log('🫧 Configurando controles da matriz de bolhas...');
    
    // Controles de tamanho e espaçamento
    const rangeControls = [
        'min-bubble-size',
        'max-bubble-size',
        'cell-width',
        'cell-height',
        'bubble-opacity',
        'stroke-width'
    ];
    
    rangeControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            element.addEventListener('input', onBubbleMatrixControlsUpdate);
            
            // Atualiza display de valores
            const valueDisplay = document.getElementById(controlId + '-value');
            if (valueDisplay) {
                element.addEventListener('input', (e) => {
                    let unit = 'px';
                    if (controlId.includes('opacity')) unit = '';
                    valueDisplay.textContent = e.target.value + unit;
                });
            }
        }
    });
    
    // Controle de contorno
    const strokeControl = document.getElementById('bubble-stroke');
    if (strokeControl) {
        strokeControl.addEventListener('change', onBubbleMatrixControlsUpdate);
    }
    
    // Controles de ordenação
    const sortControls = ['sort-by', 'sort-order'];
    sortControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            element.addEventListener('change', onSortingChange);
        }
    });
    
    // Controles de modo de cor
    const colorModeRadios = document.querySelectorAll('input[name="color-mode"]');
    colorModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                onColorModeChange(e.target.value);
            }
        });
    });
    
    // Controles de exibição
    const showControls = [
        'show-column-headers',
        'show-row-labels', 
        'show-values',
        'show-units'
    ];
    
    showControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            element.addEventListener('change', onShowControlsChange);
        }
    });
    
    console.log('✅ Controles da matriz de bolhas configurados');
}

// ==========================================================================
// SISTEMA DE CORES
// ==========================================================================

function setupBubbleMatrixColors() {
    // Sistema de paletas padrão
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const paletteType = e.currentTarget.dataset.palette;
            if (paletteType) {
                onColorPaletteChange(paletteType);
            }
        });
    });
}

function onColorPaletteChange(paletteType) {
    console.log('🎨 Mudando paleta da matriz de bolhas:', paletteType);
    
    // Atualiza classes ativas
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
    });
    
    const selectedOption = document.querySelector(`.color-option[data-palette="${paletteType}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    if (window.BubbleMatrixVisualization?.updateColorPalette) {
        window.BubbleMatrixVisualization.updateColorPalette(paletteType);
    }
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

window.BubbleMatrixVizConfig = {
    config: VIZ_CONFIG,
    getSampleData,
    getDataRequirements,
    onDataLoaded,
    onBubbleMatrixControlsUpdate,
    onSortingChange,
    onColorModeChange,
    onShowControlsChange,
    onColorPaletteChange,
    setupBubbleMatrixControls,
    setupBubbleMatrixColors
};

// Expõe funções principais globalmente
window.getSampleData = getSampleData;
window.getDataRequirements = getDataRequirements;
window.onDataLoaded = onDataLoaded;

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================

function initializeBubbleMatrixConfig() {
    console.log('⚙️ Inicializando configuração da matriz de bolhas...');
    
    setTimeout(() => {
        setupBubbleMatrixControls();
        setupBubbleMatrixColors();
        console.log('✅ Configuração da matriz de bolhas concluída');
    }, 300);
}

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBubbleMatrixConfig);
} else {
    initializeBubbleMatrixConfig();
}
