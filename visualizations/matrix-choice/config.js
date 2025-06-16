/**
 * CONFIGURAÇÕES DA MATRIZ DE MÚLTIPLA ESCOLHA - VERSÃO MELHORADA
 * Novas funcionalidades: orientação da matriz, espaçamentos separados
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DA VISUALIZAÇÃO - ATUALIZADAS
// ==========================================================================

const VIZ_CONFIG = {
    type: 'matrix-choice',
    name: 'Matriz de Múltipla Escolha',
    description: 'Visualização de respostas de múltipla escolha em formato de matriz com orientação flexível',
    
    dataRequirements: {
        requiredColumns: ['categoria'], // Categoria sempre obrigatória
        optionalColumns: ['valor', 'grupo_1', 'grupo_2', 'grupo_3'], // Modo simples ou comparação
        columnTypes: {
            categoria: 'string',
            valor: 'number' // Opcional
        },
        minRows: 2,
        maxRows: 20
    },
    
    // ✅ CONTROLES ATUALIZADOS com tamanho padrão menor
    specificControls: {
        shape: { 
            options: ['square', 'circle', 'bar', 'triangle'], 
            default: 'square' 
        },
        elementSize: { min: 40, max: 120, default: 70, step: 5 }, // ✅ MUDADO: era 80, agora 70
        elementSpacingH: { min: 5, max: 40, default: 20, step: 2 }, // ✅ NOVO: Espaçamento horizontal
        elementSpacingV: { min: 5, max: 40, default: 20, step: 2 }, // ✅ NOVO: Espaçamento vertical
        alignment: { 
            options: [
                'top-left', 'top-center', 'top-right',
                'middle-left', 'center', 'middle-right',
                'bottom-left', 'bottom-center', 'bottom-right'
            ], 
            default: 'bottom-left'
        },
        borderRadius: { min: 0, max: 20, default: 4, step: 1 },
        showAnimation: { default: false },
        backgroundShapeColor: { default: '#F5F5F5' },
        showValues: { default: true },
        showCategoryLabels: { default: true },
        showGroupLabels: { default: true },
        matrixOrientation: { // ✅ NOVO: Orientação da matriz
            options: ['groups-top', 'categories-top'], 
            default: 'groups-top' 
        }
    },
    
    layout: {
        fixedFormat: 'rectangular',
        fixedWidth: 800,
        fixedHeight: 600,
        margins: { top: 50, right: 40, bottom: 60, left: 40 },
        categoryLabelWidth: 150 // ✅ AUMENTADO: era 100
    },
    
    colorSettings: {
        defaultPalette: 'odd',
        defaultColors: ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'],
        supportedPalettes: ['odd', 'rainbow', 'custom']
    }
};

// ✅ DADOS DE EXEMPLO PADRONIZADOS - DATASET DE COMPARAÇÃO POR PADRÃO
function getSampleData() {
    // ✅ AGORA RETORNA DADOS DE COMPARAÇÃO POR PADRÃO
    return {
        data: [
            { categoria: 'API via Modelos Prontos', grupo_1: 72, grupo_2: 68, grupo_3: 82 },
            { categoria: 'Open Source Local', grupo_1: 35, grupo_2: 28, grupo_3: 22 },
            { categoria: 'Open Source via API', grupo_1: 28, grupo_2: 45, grupo_3: 38 },
            { categoria: 'Modelos Próprios', grupo_1: 22, grupo_2: 31, grupo_3: 15 }
        ],
        columns: ['categoria', 'grupo_1', 'grupo_2', 'grupo_3'],
        columnTypes: { categoria: 'string', grupo_1: 'number', grupo_2: 'number', grupo_3: 'number' },
        rowCount: 4,
        source: 'example',
        mode: 'comparison' // ✅ IMPORTANTE: Define como comparação
    };
}

function getSampleSimpleData() {
    // ✅ MANTÉM DADOS SIMPLES COMO FUNÇÃO ALTERNATIVA
    return {
        data: [
            { categoria: 'API via Modelos Prontos', valor: 72 },
            { categoria: 'Open Source Local', valor: 35 },
            { categoria: 'Open Source via API', valor: 28 },
            { categoria: 'Modelos Próprios', valor: 22 }
        ],
        columns: ['categoria', 'valor'],
        columnTypes: { categoria: 'string', valor: 'number' },
        rowCount: 4,
        source: 'example',
        mode: 'simple'
    };
}

// ==========================================================================
// VARIÁVEIS DE ESTADO ESPECÍFICAS - CORRIGIDAS
// ==========================================================================

let currentMatrixConfig = {
    colors: VIZ_CONFIG.colorSettings.defaultColors,
    currentPalette: 'odd',
    customColors: [],
    matrixOrientation: 'groups-top', // ✅ NOVO: Estado da orientação
    elementSize: 70, // ✅ NOVO: Tamanho padrão menor
    elementSpacingH: 20, // ✅ NOVO: Espaçamento horizontal
    elementSpacingV: 20  // ✅ NOVO: Espaçamento vertical
};
    return {
        data: [
            { categoria: 'API via Modelos Prontos', grupo_1: 72, grupo_2: 68, grupo_3: 82 },
            { categoria: 'Open Source Local', grupo_1: 35, grupo_2: 28, grupo_3: 22 },
            { categoria: 'Open Source via API', grupo_1: 28, grupo_2: 45, grupo_3: 38 },
            { categoria: 'Modelos Próprios', grupo_1: 22, grupo_2: 31, grupo_3: 15 }
        ],
        columns: ['categoria', 'grupo_1', 'grupo_2', 'grupo_3'],
        columnTypes: { categoria: 'string', grupo_1: 'number', grupo_2: 'number', grupo_3: 'number' },
        rowCount: 4,
        source: 'example',
        mode: 'comparison'
    };
}

// ==========================================================================
// VARIÁVEIS DE ESTADO ESPECÍFICAS
// ==========================================================================

let currentMatrixConfig = {
    colors: VIZ_CONFIG.colorSettings.defaultColors,
    currentPalette: 'odd',
    customColors: [],
    matrixOrientation: 'groups-top', // ✅ NOVO: Estado da orientação
    elementSpacingH: 20, // ✅ NOVO: Espaçamento horizontal
    elementSpacingV: 20  // ✅ NOVO: Espaçamento vertical
};

// ==========================================================================
// FUNÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

function getDataRequirements() {
    return VIZ_CONFIG.dataRequirements;
}

function onDataLoaded(processedData) {
    if (processedData.data && processedData.data.length > 20) {
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(
                'Muitas categorias! Recomendamos até 20 para melhor visualização.', 
                'warn'
            );
        }
    }
    
    if (window.MatrixChoiceVisualization?.onDataLoaded) {
        window.MatrixChoiceVisualization.onDataLoaded(processedData);
    }
}

// ==========================================================================
// CONTROLES ESPECÍFICOS DA MATRIZ - ATUALIZADOS
// ==========================================================================

function onMatrixControlsUpdate() {
    const matrixControls = {
        shape: document.querySelector('.shape-option.active')?.dataset.shape || VIZ_CONFIG.specificControls.shape.default,
        elementSize: parseInt(document.getElementById('element-size')?.value || VIZ_CONFIG.specificControls.elementSize.default),
        elementSpacingH: parseInt(document.getElementById('element-spacing-h')?.value || VIZ_CONFIG.specificControls.elementSpacingH.default), // ✅ NOVO
        elementSpacingV: parseInt(document.getElementById('element-spacing-v')?.value || VIZ_CONFIG.specificControls.elementSpacingV.default), // ✅ NOVO
        alignment: document.querySelector('.alignment-option.active')?.dataset.align || VIZ_CONFIG.specificControls.alignment.default,
        borderRadius: parseFloat(document.getElementById('border-radius')?.value || VIZ_CONFIG.specificControls.borderRadius.default),
        showAnimation: document.getElementById('show-animation')?.checked || VIZ_CONFIG.specificControls.showAnimation.default,
        backgroundShapeColor: document.getElementById('background-shape-color')?.value || VIZ_CONFIG.specificControls.backgroundShapeColor.default,
        matrixOrientation: document.querySelector('.orientation-option.active')?.dataset.orientation || VIZ_CONFIG.specificControls.matrixOrientation.default // ✅ NOVO
    };
    
    // ✅ ATUALIZA ESTADO LOCAL
    Object.assign(currentMatrixConfig, matrixControls);
    
    if (window.MatrixChoiceVisualization?.onMatrixControlUpdate) {
        window.MatrixChoiceVisualization.onMatrixControlUpdate(matrixControls);
    }
}

function onShapeChange(shape) {
    console.log('🔄 Aplicando mudança de forma:', shape);
    
    if (window.MatrixChoiceVisualization?.onUpdate) {
        const templateConfig = window.OddVizTemplateControls?.getState() || {};
        const currentMatrixConfig = window.MatrixChoiceVizConfig?.currentConfig || {};
        
        const mergedConfig = Object.assign({}, templateConfig, currentMatrixConfig, {
            shape: shape
        });
        
        console.log('📊 Aplicando configuração com nova forma:', mergedConfig);
        window.MatrixChoiceVisualization.onUpdate(mergedConfig);
    }
}

function onAlignmentChange(alignment) {
    console.log('🔄 Aplicando mudança de alinhamento:', alignment);
    
    if (window.MatrixChoiceVisualization?.onUpdate) {
        const templateConfig = window.OddVizTemplateControls?.getState() || {};
        const currentMatrixConfig = window.MatrixChoiceVizConfig?.currentConfig || {};
        
        const mergedConfig = Object.assign({}, templateConfig, currentMatrixConfig, {
            alignment: alignment
        });
        
        console.log('📊 Aplicando configuração com novo alinhamento:', mergedConfig);
        window.MatrixChoiceVisualization.onUpdate(mergedConfig);
    }
}

// ✅ NOVA FUNÇÃO: Mudança de orientação da matriz
function onOrientationChange(orientation) {
    console.log('🔄 Aplicando mudança de orientação:', orientation);
    
    // Atualiza estado local
    currentMatrixConfig.matrixOrientation = orientation;
    
    if (window.MatrixChoiceVisualization?.onUpdate) {
        const templateConfig = window.OddVizTemplateControls?.getState() || {};
        const mergedConfig = Object.assign({}, templateConfig, currentMatrixConfig, {
            matrixOrientation: orientation
        });
        
        console.log('📊 Aplicando configuração com nova orientação:', mergedConfig);
        window.MatrixChoiceVisualization.onUpdate(mergedConfig);
    }
}

function onShowValuesChange(show) {
    if (window.MatrixChoiceVisualization?.onUpdate) {
        const templateConfig = window.OddVizTemplateControls?.getState() || {};
        templateConfig.showValues = show;
        window.MatrixChoiceVisualization.onUpdate(templateConfig);
    }
}

function onShowCategoryLabelsChange(show) {
    if (window.MatrixChoiceVisualization?.onUpdate) {
        const templateConfig = window.OddVizTemplateControls?.getState() || {};
        templateConfig.showCategoryLabels = show;
        window.MatrixChoiceVisualization.onUpdate(templateConfig);
    }
}

function onShowGroupLabelsChange(show) {
    if (window.MatrixChoiceVisualization?.onUpdate) {
        const templateConfig = window.OddVizTemplateControls?.getState() || {};
        templateConfig.showGroupLabels = show;
        window.MatrixChoiceVisualization.onUpdate(templateConfig);
    }
}

// ==========================================================================
// CONFIGURAÇÃO DE CONTROLES - ATUALIZADA
// ==========================================================================

function setupMatrixControls() {
    console.log('🎛️ Configurando controles da matriz melhorados...');
    
    // ✅ CONTROLES ATUALIZADOS com espaçamentos separados
    const matrixControls = [
        'element-size',
        'element-spacing-h', // ✅ NOVO
        'element-spacing-v', // ✅ NOVO
        'border-radius',
        'show-animation'
    ];
    
    matrixControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            const eventType = element.type === 'checkbox' ? 'change' : 'input';
            element.addEventListener(eventType, () => {
                console.log(`🔄 Controle ${controlId} alterado`);
                onMatrixControlsUpdate();
            });
            
            // Atualiza display de valores para ranges
            if (element.type === 'range') {
                const valueDisplay = document.getElementById(controlId + '-value');
                if (valueDisplay) {
                    element.addEventListener('input', (e) => {
                        valueDisplay.textContent = e.target.value + 'px';
                    });
                }
            }
        }
    });
    
    // ✅ NOVO: Controles de orientação da matriz
    setupOrientationControls();
    
    // ✅ Controles existentes
    setupShapeControls();
    setupAlignmentControls();
    setupColorPaletteSystem();
    
    // Controle de cor de fundo das formas
    const backgroundShapeColor = document.getElementById('background-shape-color');
    const backgroundShapeColorText = document.getElementById('background-shape-color-text');
    
    if (backgroundShapeColor && backgroundShapeColorText) {
        if (!backgroundShapeColor.value) {
            backgroundShapeColor.value = VIZ_CONFIG.specificControls.backgroundShapeColor.default;
        }
        if (!backgroundShapeColorText.value) {
            backgroundShapeColorText.value = VIZ_CONFIG.specificControls.backgroundShapeColor.default;
        }
        
        backgroundShapeColor.addEventListener('input', (e) => {
            backgroundShapeColorText.value = e.target.value;
            console.log('🔄 Cor de fundo alterada:', e.target.value);
            onMatrixControlsUpdate();
        });
        
        backgroundShapeColorText.addEventListener('input', (e) => {
            if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                backgroundShapeColor.value = e.target.value;
                console.log('🔄 Cor de fundo alterada via texto:', e.target.value);
                onMatrixControlsUpdate();
            }
        });
    }
    
    // Controles de exibição
    const displayControls = [
        { id: 'show-values', handler: onShowValuesChange },
        { id: 'show-category-labels', handler: onShowCategoryLabelsChange },
        { id: 'show-group-labels', handler: onShowGroupLabelsChange }
    ];
    
    displayControls.forEach(({ id, handler }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', (e) => {
                console.log(`🔄 Display control ${id} alterado:`, e.target.checked);
                handler(e.target.checked);
            });
        }
    });
    
    console.log('✅ Controles da matriz melhorados configurados');
}

// ✅ NOVA FUNÇÃO: Setup dos controles de orientação
function setupOrientationControls() {
    console.log('🎛️ Configurando controles de orientação...');
    
    const orientationOptions = document.querySelectorAll('.orientation-option');
    orientationOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const orientation = option.dataset.orientation;
            if (orientation) {
                console.log('🔄 Orientação selecionada:', orientation);
                
                // Atualiza classes ativas
                orientationOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // ✅ DISPARA ATUALIZAÇÃO IMEDIATA
                onOrientationChange(orientation);
                onMatrixControlsUpdate();
                
                console.log('✅ Orientação aplicada:', orientation);
            }
        });
    });
    
    // ✅ DEFINE ORIENTAÇÃO PADRÃO SE NENHUMA ESTIVER ATIVA
    const activeOrientation = document.querySelector('.orientation-option.active');
    if (!activeOrientation) {
        const defaultOrientation = document.querySelector('.orientation-option[data-orientation="groups-top"]');
        if (defaultOrientation) {
            defaultOrientation.classList.add('active');
            console.log('✅ Orientação padrão definida: groups-top');
        }
    }
    
    console.log('✅ Controles de orientação configurados');
}

function setupShapeControls() {
    console.log('🎛️ Configurando controles de forma...');
    
    const shapeOptions = document.querySelectorAll('.shape-option');
    shapeOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const shape = option.dataset.shape;
            if (shape) {
                console.log('🔄 Forma selecionada:', shape);
                
                // Atualiza classes ativas
                shapeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                onShapeChange(shape);
                onMatrixControlsUpdate();
                
                console.log('✅ Forma aplicada:', shape);
            }
        });
    });
    
    const activeShape = document.querySelector('.shape-option.active');
    if (!activeShape) {
        const defaultShape = document.querySelector('.shape-option[data-shape="square"]');
        if (defaultShape) {
            defaultShape.classList.add('active');
            console.log('✅ Forma padrão definida: square');
        }
    }
    
    console.log('✅ Controles de forma configurados');
}

function setupAlignmentControls() {
    console.log('🎛️ Configurando controles de alinhamento...');
    
    const alignmentOptions = document.querySelectorAll('.alignment-option');
    alignmentOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const alignment = option.dataset.align;
            if (alignment) {
                console.log('🔄 Alinhamento selecionado:', alignment);
                
                // Atualiza classes ativas
                alignmentOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                onAlignmentChange(alignment);
                onMatrixControlsUpdate();
                
                console.log('✅ Alinhamento aplicado:', alignment);
            }
        });
    });
    
    const activeAlignment = document.querySelector('.alignment-option.active');
    if (!activeAlignment) {
        const defaultAlignment = document.querySelector('.alignment-option[data-align="bottom-left"]');
        if (defaultAlignment) {
            defaultAlignment.classList.add('active');
            console.log('✅ Alinhamento padrão definido: bottom-left');
        }
    }
    
    console.log('✅ Controles de alinhamento configurados');
}

// ==========================================================================
// SISTEMA DE PALETA DE CORES (MANTIDO)
// ==========================================================================

function setupColorPaletteSystem() {
    console.log('🎨 Configurando sistema de paletas da matriz...');
    
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
    
    const activePalette = document.querySelector('.color-option.active');
    if (!activePalette) {
        const oddPalette = document.querySelector('.color-option[data-palette="odd"]');
        if (oddPalette) oddPalette.classList.add('active');
    }
    
    console.log('✅ Sistema de paletas da matriz configurado');
}

function onColorPaletteChange(paletteType) {
    console.log('🎨 Mudando paleta para:', paletteType);
    
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
    });
    
    const selectedOption = document.querySelector(`.color-option[data-palette="${paletteType}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    const customColorsPanel = document.getElementById('custom-colors');
    if (customColorsPanel) {
        if (paletteType === 'custom') {
            customColorsPanel.style.display = 'block';
            // ✅ CORRIGIDO: Recria inputs com número correto de cores
            setupCustomColorInputs();
        } else {
            customColorsPanel.style.display = 'none';
        }
    }
    
    currentMatrixConfig.currentPalette = paletteType;
    updateColorPalette(paletteType);
}

function updateColorPalette(paletteType) {
    console.log('🎨 Aplicando nova paleta:', paletteType);
    
    let newColors;
    
    if (paletteType === 'odd') {
        newColors = VIZ_CONFIG.colorSettings.defaultColors;
    } else if (paletteType === 'rainbow') {
        newColors = ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#0080FF', '#8000FF'];
    } else if (paletteType === 'custom') {
        newColors = currentMatrixConfig.customColors.length > 0 ? 
                   currentMatrixConfig.customColors : 
                   VIZ_CONFIG.colorSettings.defaultColors;
    } else {
        newColors = VIZ_CONFIG.colorSettings.defaultColors;
    }
    
    currentMatrixConfig.colors = newColors;
    
    if (window.MatrixChoiceVisualization?.updateColorPalette) {
        window.MatrixChoiceVisualization.updateColorPalette(newColors);
    }
    
    console.log('✅ Nova paleta aplicada:', newColors);
}

function setupCustomColorInputs() {
    const container = document.querySelector('.custom-color-inputs');
    if (!container) return;
    
    console.log('🎨 Configurando inputs de cores customizadas');
    
    container.innerHTML = '';
    
    // ✅ CORRIGIDO: Determina número de cores baseado nos dados atuais
    let numColors = 4; // Padrão mínimo
    
    // Tenta detectar quantas cores são necessárias baseado nos dados
    if (window.MatrixChoiceVisualization?.vizCurrentData) {
        const currentData = window.MatrixChoiceVisualization.vizCurrentData;
        const dataMode = detectDataModeFromData(currentData);
        
        if (dataMode === 'comparison') {
            // Para dados de comparação, conta o número de grupos
            const firstRow = currentData[0];
            const groups = Object.keys(firstRow).filter(key => key !== 'categoria');
            numColors = Math.max(4, groups.length);
        } else {
            // Para dados simples, conta o número de categorias
            numColors = Math.max(4, currentData.length);
        }
    } else if (window.MatrixChoiceVizConfig?.currentConfig?.colors) {
        // Usa o número de cores já definidas
        numColors = Math.max(4, window.MatrixChoiceVizConfig.currentConfig.colors.length);
    }
    
    // Limita a um máximo razoável
    numColors = Math.min(numColors, 12);
    
    console.log(`🎨 Criando ${numColors} inputs de cores customizadas`);
    
    // Usa cores da paleta Odd como base, repetindo se necessário
    const defaultColors = VIZ_CONFIG.colorSettings.defaultColors;
    const colorsToUse = [];
    for (let i = 0; i < numColors; i++) {
        colorsToUse.push(defaultColors[i % defaultColors.length]);
    }
    
    colorsToUse.forEach((color, index) => {
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
    
    currentMatrixConfig.customColors = colorsToUse;
    updateCustomColorsFromInputs();
}

/**
 * ✅ NOVA FUNÇÃO AUXILIAR: Detecta modo dos dados sem depender da visualização
 */
function detectDataModeFromData(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return 'simple';
    }
    
    const firstRow = data[0];
    const keys = Object.keys(firstRow);
    
    if (keys.length > 2 && keys[0] === 'categoria') {
        return 'comparison';
    }
    
    if (keys.length === 2 && keys.includes('categoria') && keys.includes('valor')) {
        return 'simple';
    }
    
    return 'simple';
}

function updateCustomColorsFromInputs() {
    const colors = [];
    document.querySelectorAll('.custom-color-picker').forEach(input => {
        colors.push(input.value);
    });
    
    console.log('🎨 Cores customizadas atualizadas:', colors);
    
    currentMatrixConfig.customColors = colors;
    updateCustomColors(colors);
}

function updateCustomColors(customColors) {
    console.log('🎨 Aplicando cores customizadas:', customColors);
    
    currentMatrixConfig.colors = customColors;
    
    if (window.MatrixChoiceVisualization?.updateCustomColors) {
        window.MatrixChoiceVisualization.updateCustomColors(customColors);
    }
}

// ==========================================================================
// SINCRONIZAÇÃO INICIAL COM TEMPLATE CONTROLS
// ==========================================================================

function syncSpecificControlsIfNeeded() {
    console.log('🔄 Verificando se sincronização específica da matriz é necessária...');
    
    const backgroundShapeColor = document.getElementById('background-shape-color');
    const backgroundShapeColorText = document.getElementById('background-shape-color-text');
    
    if (backgroundShapeColor && !backgroundShapeColor.value) {
        backgroundShapeColor.value = VIZ_CONFIG.specificControls.backgroundShapeColor.default;
    }
    
    if (backgroundShapeColorText && !backgroundShapeColorText.value) {
        backgroundShapeColorText.value = VIZ_CONFIG.specificControls.backgroundShapeColor.default;
    }
    
    console.log('✅ Sincronização específica da matriz concluída (não-intrusiva)');
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

window.MatrixChoiceVizConfig = {
    config: VIZ_CONFIG,
    getSampleData,
    getSampleComparisonData,
    getDataRequirements,
    onDataLoaded,
    onMatrixControlsUpdate,
    onShapeChange,
    onAlignmentChange,
    onOrientationChange, // ✅ NOVO
    onShowValuesChange,
    onShowCategoryLabelsChange,
    onShowGroupLabelsChange,
    onColorPaletteChange,
    updateColorPalette,
    updateCustomColors,
    setupMatrixControls,
    syncSpecificControlsIfNeeded,
    
    // Estado atual
    get currentConfig() { return currentMatrixConfig; }
};

// Expõe funções principais globalmente
window.getSampleData = getSampleData;
window.getDataRequirements = getDataRequirements;
window.onDataLoaded = onDataLoaded;

// ==========================================================================
// CONFIGURAÇÃO INICIAL - COM CARREGAMENTO FORÇADO
// ==========================================================================

function initializeMatrixConfig() {
    console.log('⚙️ Inicializando configuração específica da matriz melhorada...');
    
    setTimeout(() => {
        syncSpecificControlsIfNeeded();
        setupMatrixControls();
        
        // ✅ NOVO: Força carregamento dos dados de comparação
        forceLoadComparisonData();
        
        console.log('✅ Configuração específica da matriz melhorada concluída');
    }, 300);
}

/**
 * ✅ NOVA FUNÇÃO: Força carregamento dos dados de comparação
 */
function forceLoadComparisonData() {
    console.log('🔄 Forçando carregamento dos dados de comparação...');
    
    // Aguarda um pouco mais para garantir que a visualização está pronta
    setTimeout(() => {
        if (window.MatrixChoiceVisualization?.onDataLoaded) {
            const comparisonData = getSampleData(); // Agora retorna dados de comparação
            console.log('📊 Carregando dados de comparação forçadamente:', comparisonData);
            
            // Simula o processamento que seria feito pelo data-utils
            const processedData = {
                data: comparisonData.data,
                columns: comparisonData.columns,
                columnTypes: comparisonData.columnTypes,
                rowCount: comparisonData.rowCount,
                source: comparisonData.source
            };
            
            window.MatrixChoiceVisualization.onDataLoaded(processedData);
            
            console.log('✅ Dados de comparação carregados com sucesso');
        } else {
            console.warn('⚠️ MatrixChoiceVisualization não está disponível para carregamento forçado');
        }
    }, 200);
}

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMatrixConfig);
} else {
    initializeMatrixConfig();
}
