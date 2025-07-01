/**
 * CONFIGURAÇÕES DA MATRIZ DE MÚLTIPLA ESCOLHA - VERSÃO CORRIGIDA
 * ✅ Com detecção automática de estrutura, paleta inteligente e integração completa com Template Controls
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DA MATRIZ
// ==========================================================================

const VIZ_CONFIG = {
    type: 'matrix-choice',
    name: 'Matriz de Múltipla Escolha',
    description: 'Visualização de respostas de múltipla escolha em formato de matriz com orientação flexível',
    
    // ✅ CORREÇÃO 1: Detecção automática de estrutura de dados
    dataRequirements: {
        autoDetectStructure: true,
        firstColumnAsCategory: true,
        restColumnsAsGroups: true, // Para modo comparação
        secondColumnAsValue: true, // Para modo simples
        minRows: 2,
        maxRows: 20,
        minColumns: 2,
        supportedValueTypes: ['number', 'percentage']
    },
    
    // ✅ CONTROLES ATUALIZADOS com orientação e espaçamentos separados
    specificControls: {
        shape: { 
            options: ['square', 'circle', 'bar', 'triangle'], 
            default: 'square' 
        },
        elementSize: { min: 40, max: 120, default: 70, step: 5 },
        elementSpacingH: { min: 5, max: 50, default: 20, step: 2 }, // ✅ AUMENTADO: era max: 40
        elementSpacingV: { min: 5, max: 50, default: 20, step: 2 }, // ✅ AUMENTADO: era max: 40
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
        matrixOrientation: {
            options: ['groups-top', 'categories-top'], 
            default: 'groups-top' 
        }
    },
    
    layout: {
        fixedFormat: 'rectangular',
        fixedWidth: 800,
        fixedHeight: 600,
        margins: { top: 50, right: 40, bottom: 60, left: 40 }
        // ✅ REMOVIDO: categoryLabelWidth fixo - agora é calculado dinamicamente
    },
    
    colorSettings: {
        defaultPalette: 'odd',
        defaultColors: ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'],
        supportedPalettes: ['odd', 'rainbow', 'custom']
    }
};

// ==========================================================================
// DADOS DE EXEMPLO PADRONIZADOS
// ==========================================================================

function getSampleData() {
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

function getSampleComparisonData() {
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
    // ✅ CONFIGURAÇÃO PADRÃO ATUALIZADA - SEM LARGURA FIXA
    colors: VIZ_CONFIG.colorSettings.defaultColors,
    currentPalette: 'odd',
    customColors: [],
    matrixOrientation: 'groups-top',
    elementSpacingH: 20,
    elementSpacingV: 20
    // ✅ REMOVIDO: categoryLabelWidth - agora calculado dinamicamente
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
    
    // ✅ CORREÇÃO: Detecta mudança nos dados e atualiza paleta personalizada
    if (processedData.data && Array.isArray(processedData.data)) {
        updateCustomPaletteForNewData(processedData.data);
    }
    
    if (window.MatrixChoiceVisualization?.onDataLoaded) {
        window.MatrixChoiceVisualization.onDataLoaded(processedData);
    }
}

// ==========================================================================
// CONTROLES ESPECÍFICOS DA MATRIZ
// ==========================================================================

function onMatrixControlsUpdate() {
    const matrixControls = {
        shape: document.querySelector('.shape-option.active')?.dataset.shape || VIZ_CONFIG.specificControls.shape.default,
        elementSize: parseInt(document.getElementById('element-size')?.value || VIZ_CONFIG.specificControls.elementSize.default),
        elementSpacingH: parseInt(document.getElementById('element-spacing-h')?.value || VIZ_CONFIG.specificControls.elementSpacingH.default),
        elementSpacingV: parseInt(document.getElementById('element-spacing-v')?.value || VIZ_CONFIG.specificControls.elementSpacingV.default),
        alignment: document.querySelector('.alignment-option.active')?.dataset.align || VIZ_CONFIG.specificControls.alignment.default,
        borderRadius: parseFloat(document.getElementById('border-radius')?.value || VIZ_CONFIG.specificControls.borderRadius.default),
        showAnimation: document.getElementById('show-animation')?.checked || VIZ_CONFIG.specificControls.showAnimation.default,
        backgroundShapeColor: document.getElementById('background-shape-color')?.value || VIZ_CONFIG.specificControls.backgroundShapeColor.default,
        matrixOrientation: document.querySelector('.orientation-option.active')?.dataset.orientation || VIZ_CONFIG.specificControls.matrixOrientation.default
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
// ✅ CORREÇÃO 2: SISTEMA DE PALETA INTELIGENTE
// ==========================================================================

/**
 * ✅ FUNÇÃO: Atualiza paleta personalizada quando dados mudam
 */
function updateCustomPaletteForNewData(data) {
    // Só atualiza se paleta custom estiver ativa
    if (currentMatrixConfig.currentPalette !== 'custom') {
        return;
    }
    
    console.log('🎨 Atualizando paleta personalizada para novos dados...');
    
    // Detecta quantas cores são necessárias
    const numColorsNeeded = calculateRequiredColors(data);
    
    // Se número de cores mudou, recria inputs
    const currentInputs = document.querySelectorAll('.custom-color-picker').length;
    if (currentInputs !== numColorsNeeded) {
        console.log(`🎨 Recriando inputs: ${currentInputs} → ${numColorsNeeded} cores`);
        setupCustomColorInputs();
    }
}

/**
 * ✅ FUNÇÃO: Calcula quantas cores são necessárias baseado nos dados
 */
function calculateRequiredColors(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return 4; // Mínimo padrão
    }
    
    const firstRow = data[0];
    const columns = Object.keys(firstRow);
    
    let numColors;
    if (columns.length > 2) {
        // Modo comparação: uma cor por grupo
        numColors = columns.length - 1; // Exclui coluna categoria
    } else {
        // Modo simples: uma cor por categoria
        numColors = data.length;
    }
    
    // Limita entre 4 e 12 cores
    return Math.min(12, Math.max(4, numColors));
}

// ==========================================================================
// CONFIGURAÇÃO DE CONTROLES - ATUALIZADA
// ==========================================================================

function setupMatrixControls() {
    console.log('🎛️ Configurando controles da matriz corrigidos...');
    
    // ✅ CONTROLES ATUALIZADOS com espaçamentos separados
    const matrixControls = [
        'element-size',
        'element-spacing-h',
        'element-spacing-v',
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
    
    setupOrientationControls();
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
    
    console.log('✅ Controles da matriz corrigidos configurados');
}

function setupOrientationControls() {
    console.log('🎛️ Configurando controles de orientação...');
    
    const orientationOptions = document.querySelectorAll('.orientation-option');
    orientationOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const orientation = option.dataset.orientation;
            if (orientation) {
                console.log('🔄 Orientação selecionada:', orientation);
                
                orientationOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                onOrientationChange(orientation);
                onMatrixControlsUpdate();
                
                console.log('✅ Orientação aplicada:', orientation);
            }
        });
    });
    
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
// ✅ CORREÇÃO 3: SISTEMA DE PALETA INTELIGENTE
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
            // ✅ CORREÇÃO 4: Herda cores da paleta atual ao criar custom
            setupCustomColorInputsWithInheritance();
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

/**
 * ✅ CORREÇÃO 5: Setup de cores customizadas com herança inteligente
 */
function setupCustomColorInputsWithInheritance() {
    const container = document.querySelector('.custom-color-inputs');
    if (!container) return;
    
    console.log('🎨 Configurando inputs de cores customizadas com herança...');
    
    container.innerHTML = '';
    
    // ✅ HERDA CORES DA PALETA ATUAL
    let inheritedColors = [...currentMatrixConfig.colors]; // Copia array atual
    
    // Se não há cores atuais, usa paleta padrão
    if (!inheritedColors || inheritedColors.length === 0) {
        inheritedColors = [...VIZ_CONFIG.colorSettings.defaultColors];
    }
    
    console.log('🎨 Herdando cores da paleta atual:', inheritedColors);
    
    // Determina número de cores baseado nos dados atuais
    let numColors = calculateRequiredColors(
        window.MatrixChoiceVisualization?.vizCurrentData || []
    );
    
    // Ajusta array de cores herdadas para o número necessário
    while (inheritedColors.length < numColors) {
        // Repete paleta se necessário
        const baseColors = VIZ_CONFIG.colorSettings.defaultColors;
        inheritedColors.push(baseColors[inheritedColors.length % baseColors.length]);
    }
    
    // Trunca se tiver cores demais
    inheritedColors = inheritedColors.slice(0, numColors);
    
    console.log(`🎨 Criando ${numColors} inputs com cores herdadas:`, inheritedColors);
    
    inheritedColors.forEach((color, index) => {
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
    
    // ✅ SALVA CORES HERDADAS E APLICA IMEDIATAMENTE
    currentMatrixConfig.customColors = inheritedColors;
    updateCustomColorsFromInputs();
    
    console.log('✅ Inputs de cores customizadas configurados com herança');
}

/**
 * ✅ FALLBACK: Setup básico sem herança (compatibilidade)
 */
function setupCustomColorInputs() {
    const container = document.querySelector('.custom-color-inputs');
    if (!container) return;
    
    console.log('🎨 Configurando inputs de cores customizadas (fallback)...');
    
    container.innerHTML = '';
    
    const numColors = calculateRequiredColors(
        window.MatrixChoiceVisualization?.vizCurrentData || []
    );
    
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
    onOrientationChange,
    onShowValuesChange,
    onShowCategoryLabelsChange,
    onShowGroupLabelsChange,
    onColorPaletteChange,
    updateColorPalette,
    updateCustomColors,
    setupMatrixControls,
    syncSpecificControlsIfNeeded,
    
    // ✅ NOVAS FUNÇÕES
    updateCustomPaletteForNewData,
    calculateRequiredColors,
    setupCustomColorInputsWithInheritance,
    
    // Estado atual
    get currentConfig() { return currentMatrixConfig; }
};

// Expõe funções principais globalmente
window.getSampleData = getSampleData;
window.getDataRequirements = getDataRequirements;
window.onDataLoaded = onDataLoaded;

// ==========================================================================
// CONFIGURAÇÃO INICIAL
// ==========================================================================

function initializeMatrixConfig() {
    console.log('⚙️ Inicializando configuração específica da matriz corrigida...');
    
    setTimeout(() => {
        syncSpecificControlsIfNeeded();
        setupMatrixControls();
        console.log('✅ Configuração específica da matriz corrigida concluída');
    }, 300);
}

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMatrixConfig);
} else {
    initializeMatrixConfig();
}