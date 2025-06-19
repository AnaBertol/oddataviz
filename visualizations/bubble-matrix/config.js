/**
 * CONFIGURAÇÕES DA MATRIZ DE BOLHAS - VERSÃO CORRIGIDA
 * Sistema integrado com Template Controls - cores persistentes
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

const VIZ_CONFIG = {
    type: 'bubble-matrix',
    name: 'Matriz de Bolhas',
    description: 'Matriz onde células são círculos com área proporcional ao valor, normalizada por coluna',
    
    dataRequirements: {
        autoDetectStructure: true,
        firstColumnAsCategory: true,
        remainingColumnsAsMetrics: true,
        minRows: 3,
        maxRows: 15,
        minColumns: 3, // 1 categoria + pelo menos 2 métricas
        maxColumns: 8  // 1 categoria + até 7 métricas
    },
    
    // Controles específicos da matriz de bolhas
    specificControls: {
        minBubbleSize: { min: 8, max: 25, default: 12, step: 1 },
        maxBubbleSize: { min: 30, max: 80, default: 50, step: 2 },
        cellWidth: { min: 80, max: 150, default: 120, step: 5 },
        cellHeight: { min: 60, max: 120, default: 80, step: 5 },
        bubbleOpacity: { min: 0.6, max: 1.0, default: 0.9, step: 0.05 },
        strokeWidth: { min: 0.5, max: 3, default: 1, step: 0.5 },
        bubbleStroke: { default: true },
        
        sortBy: { default: 'original' },
        sortOrder: { default: 'desc' },
        colorMode: { options: ['by-column', 'by-row', 'single'], default: 'by-column' },
        
        // Controles de exibição (integrados com Template Controls)
        showColumnHeaders: { default: true },
        showRowLabels: { default: true },
        showValues: { default: true }
    },
    
    layout: {
        fixedFormat: 'wide',
        fixedWidth: 800,
        fixedHeight: 600,
        margins: { top: 60, right: 60, bottom: 60, left: 60 }
    },
    
    colorSettings: {
        defaultPalette: 'odd',
        byColumnColors: ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'],
        byRowColors: ['#6F02FD', '#2C0165', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8'],
        singleColor: '#6F02FD'
    }
};

// ==========================================================================
// GERENCIAMENTO DE ESTADO DAS CORES - CORRIGIDO
// ==========================================================================

let currentColorState = {
    paletteType: 'odd',
    customColors: null,
    isCustomActive: false
};

// ==========================================================================
// DADOS DE EXEMPLO GENÉRICOS
// ==========================================================================

function getSampleData() {
    return {
        data: [
            { categoria: 'Categoria A', metrica_1: 89.5, metrica_2: 67.2, metrica_3: 234.8, metrica_4: 45.1 },
            { categoria: 'Categoria B', metrica_1: 72.3, metrica_2: 89.1, metrica_3: 156.4, metrica_4: 67.8 },
            { categoria: 'Categoria C', metrica_1: 156.7, metrica_2: 34.5, metrica_3: 98.2, metrica_4: 23.9 },
            { categoria: 'Categoria D', metrica_1: 45.2, metrica_2: 78.9, metrica_3: 67.1, metrica_4: 34.5 },
            { categoria: 'Categoria E', metrica_1: 123.4, metrica_2: 45.6, metrica_3: 189.3, metrica_4: 12.7 },
            { categoria: 'Categoria F', metrica_1: 67.8, metrica_2: 92.3, metrica_3: 78.5, metrica_4: 56.2 }
        ],
        columns: ['categoria', 'metrica_1', 'metrica_2', 'metrica_3', 'metrica_4'],
        columnTypes: {
            categoria: 'string',
            metrica_1: 'number',
            metrica_2: 'number', 
            metrica_3: 'number',
            metrica_4: 'number'
        },
        rowCount: 6,
        source: 'example',
        mode: 'bubble-matrix'
    };
}

// ==========================================================================
// INTEGRAÇÃO COM TEMPLATE CONTROLS
// ==========================================================================

// ✅ CORREÇÃO: Implementa função getDataRequirements CORRETAMENTE
function getDataRequirements() {
    return VIZ_CONFIG.dataRequirements;
}

function validateDataStructure(processedData) {
    if (!processedData || !processedData.data || !Array.isArray(processedData.data)) {
        return { isValid: false, message: 'Dados não encontrados ou formato inválido.' };
    }
    
    const data = processedData.data;
    if (data.length < 3) {
        return { isValid: false, message: 'São necessárias pelo menos 3 linhas de dados.' };
    }
    
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

function onDataLoaded(processedData) {
    // Validação automática
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

// ==========================================================================
// CONTROLES ESPECÍFICOS - INTEGRADOS COM TEMPLATE CONTROLS
// ==========================================================================

function onBubbleMatrixControlsUpdate() {
    // Coleta configurações específicas da matriz de bolhas
    const bubbleControls = {
        minBubbleSize: parseInt(document.getElementById('min-bubble-size')?.value || VIZ_CONFIG.specificControls.minBubbleSize.default),
        maxBubbleSize: parseInt(document.getElementById('max-bubble-size')?.value || VIZ_CONFIG.specificControls.maxBubbleSize.default),
        cellWidth: parseInt(document.getElementById('cell-width')?.value || VIZ_CONFIG.specificControls.cellWidth.default),
        cellHeight: parseInt(document.getElementById('cell-height')?.value || VIZ_CONFIG.specificControls.cellHeight.default),
        bubbleOpacity: parseFloat(document.getElementById('bubble-opacity')?.value || VIZ_CONFIG.specificControls.bubbleOpacity.default),
        strokeWidth: parseFloat(document.getElementById('stroke-width')?.value || VIZ_CONFIG.specificControls.strokeWidth.default),
        bubbleStroke: document.getElementById('bubble-stroke')?.checked !== false,
        sortBy: document.getElementById('sort-by')?.value || VIZ_CONFIG.specificControls.sortBy.default,
        sortOrder: document.getElementById('sort-order')?.value || VIZ_CONFIG.specificControls.sortOrder.default,
        colorMode: document.querySelector('input[name="color-mode"]:checked')?.value || VIZ_CONFIG.specificControls.colorMode.default
    };
    
    // ✅ CORREÇÃO: Preserva estado das cores durante atualizações
    console.log('🔄 Atualizando controles específicos, preservando cores...');
    
    // Integra com Template Controls SEM resetar cores
    if (window.BubbleMatrixVisualization?.onSpecificControlsUpdate) {
        window.BubbleMatrixVisualization.onSpecificControlsUpdate(bubbleControls);
    }
}

// Callbacks para controles de exibição - integrados com Template Controls
function onShowColumnHeadersChange(show) {
    if (window.BubbleMatrixVisualization?.onDisplayControlChange) {
        window.BubbleMatrixVisualization.onDisplayControlChange('showColumnHeaders', show);
    }
}

function onShowRowLabelsChange(show) {
    if (window.BubbleMatrixVisualization?.onDisplayControlChange) {
        window.BubbleMatrixVisualization.onDisplayControlChange('showRowLabels', show);
    }
}

function onShowValuesChange(show) {
    if (window.BubbleMatrixVisualization?.onDisplayControlChange) {
        window.BubbleMatrixVisualization.onDisplayControlChange('showValues', show);
    }
}

// ==========================================================================
// SISTEMA DE CORES - CORRIGIDO E INTEGRADO
// ==========================================================================

function onColorPaletteChange(paletteType) {
    console.log('🎨 Mudando paleta da matriz de bolhas:', paletteType);
    
    // ✅ ATUALIZA ESTADO INTERNO
    currentColorState.paletteType = paletteType;
    currentColorState.isCustomActive = (paletteType === 'custom');
    
    // Atualiza classes ativas
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
    });
    
    const selectedOption = document.querySelector(`.color-option[data-palette="${paletteType}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    // Controla visibilidade do painel custom
    const customColorsPanel = document.getElementById('custom-colors');
    if (customColorsPanel) {
        if (paletteType === 'custom') {
            customColorsPanel.style.display = 'block';
            setupCustomColorInputs();
        } else {
            customColorsPanel.style.display = 'none';
            // ✅ LIMPA cores customizadas quando sai do modo custom
            currentColorState.customColors = null;
        }
    }
    
    // ✅ INTEGRAÇÃO COM TEMPLATE CONTROLS
    if (window.OddVizTemplateControls?.updateState) {
        window.OddVizTemplateControls.updateState('colorPalette', paletteType);
    }
    
    // ✅ ATUALIZA VISUALIZAÇÃO
    if (window.BubbleMatrixVisualization?.updateColorPalette) {
        window.BubbleMatrixVisualization.updateColorPalette(paletteType);
    }
}

function setupCustomColorInputs() {
    const container = document.querySelector('.custom-color-inputs');
    if (!container) return;
    
    // Limpa inputs existentes
    container.innerHTML = '';
    
    // ✅ USA cores atuais ou padrão
    const defaultColors = currentColorState.customColors || VIZ_CONFIG.colorSettings.byColumnColors.slice(0, 6);
    
    defaultColors.forEach((color, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-color-item';
        
        wrapper.innerHTML = `
            <label class="control-label">Cor ${index + 1}</label>
            <div class="color-input-wrapper">
                <input type="color" id="custom-color-${index}" class="color-input custom-color-picker" value="${color}">
                <input type="text" id="custom-color-${index}-text" class="color-text custom-color-text" value="${color}">
            </div>
        `;
        
        container.appendChild(wrapper);
        
        // Event listeners
        const colorInput = wrapper.querySelector('.custom-color-picker');
        const textInput = wrapper.querySelector('.custom-color-text');
        
        colorInput.addEventListener('input', (e) => {
            textInput.value = e.target.value;
            updateCustomColorsFromInputs();
        });
        
        textInput.addEventListener('input', (e) => {
            if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                colorInput.value = e.target.value;
                updateCustomColorsFromInputs();
            }
        });
    });
    
    updateCustomColorsFromInputs();
}

function updateCustomColorsFromInputs() {
    const colors = [];
    document.querySelectorAll('.custom-color-picker').forEach(input => {
        colors.push(input.value);
    });
    
    // ✅ ATUALIZA ESTADO INTERNO
    currentColorState.customColors = colors;
    
    console.log('🎨 Cores personalizadas atualizadas:', colors);
    
    if (window.BubbleMatrixVisualization?.updateCustomColors) {
        window.BubbleMatrixVisualization.updateCustomColors(colors);
    }
}

// ==========================================================================
// FUNÇÕES PARA OBTER CORES ATUAIS - NOVAS
// ==========================================================================

function getCurrentColors() {
    if (currentColorState.isCustomActive && currentColorState.customColors) {
        return currentColorState.customColors;
    }
    
    // ✅ INTEGRAÇÃO COM TEMPLATE CONTROLS
    if (window.OddVizTemplateControls?.getCurrentColorPalette) {
        return window.OddVizTemplateControls.getCurrentColorPalette();
    }
    
    // Fallback para cores padrão
    switch (currentColorState.paletteType) {
        case 'rainbow':
            return ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#0080FF', '#8000FF'];
        case 'odd':
        default:
            return VIZ_CONFIG.colorSettings.byColumnColors;
    }
}

function getCurrentColorState() {
    return { ...currentColorState };
}

// ==========================================================================
// CONFIGURAÇÃO DE CONTROLES
// ==========================================================================

function setupBubbleMatrixControls() {
    console.log('🫧 Configurando controles da matriz de bolhas...');
    
    // Controles de tamanho e espaçamento
    const rangeControls = [
        'min-bubble-size', 'max-bubble-size', 'cell-width', 
        'cell-height', 'bubble-opacity', 'stroke-width'
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
            element.addEventListener('change', onBubbleMatrixControlsUpdate);
        }
    });
    
    // Controles de modo de cor
    const colorModeRadios = document.querySelectorAll('input[name="color-mode"]');
    colorModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                onBubbleMatrixControlsUpdate();
            }
        });
    });
    
    // Controles de exibição - integrados com Template Controls
    const displayControls = [
        { id: 'show-column-headers', handler: onShowColumnHeadersChange },
        { id: 'show-row-labels', handler: onShowRowLabelsChange },
        { id: 'show-values', handler: onShowValuesChange }
    ];
    
    displayControls.forEach(({ id, handler }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', (e) => {
                handler(e.target.checked);
            });
        }
    });
    
    // Sistema de paletas
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
    
    console.log('✅ Controles da matriz de bolhas configurados');
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

window.BubbleMatrixVizConfig = {
    config: VIZ_CONFIG,
    getSampleData,
    getDataRequirements,  // ✅ ADICIONADO: Exporta função de requisitos
    onDataLoaded,
    onBubbleMatrixControlsUpdate,
    onShowColumnHeadersChange,
    onShowRowLabelsChange,
    onShowValuesChange,
    onColorPaletteChange,
    setupBubbleMatrixControls,
    setupCustomColorInputs,
    updateCustomColorsFromInputs,
    // ✅ NOVAS FUNÇÕES PARA GERENCIAMENTO DE CORES
    getCurrentColors,
    getCurrentColorState
};

// Expõe funções principais globalmente
window.getSampleData = getSampleData;
window.getDataRequirements = getDataRequirements;  // ✅ ADICIONADO: Exporta globalmente
window.onDataLoaded = onDataLoaded;

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================

function initializeBubbleMatrixConfig() {
    console.log('⚙️ Inicializando configuração da matriz de bolhas...');
    
    setTimeout(() => {
        setupBubbleMatrixControls();
        console.log('✅ Configuração da matriz de bolhas concluída');
    }, 300);
}

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBubbleMatrixConfig);
} else {
    initializeBubbleMatrixConfig();
}