/**
 * CONFIGURAÇÕES DA MATRIZ DE MÚLTIPLA ESCOLHA - SINCRONIZADO COM TEMPLATE CONTROLS
 * Versão que trabalha harmoniosamente com o sistema focado
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

const VIZ_CONFIG = {
    type: 'matrix-choice',
    name: 'Matriz de Múltipla Escolha',
    description: 'Visualização de respostas de múltipla escolha em formato de matriz',
    
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
    
    // ✅ APENAS controles específicos da matriz
    specificControls: {
        shape: { 
            options: ['square', 'circle', 'bar', 'triangle'], 
            default: 'square' 
        },
        elementSize: { min: 40, max: 120, default: 80, step: 5 },
        elementSpacing: { min: 5, max: 40, default: 20, step: 2 },
        alignment: { 
            options: [
                'top-left', 'top-center', 'top-right',
                'middle-left', 'center', 'middle-right',
                'bottom-left', 'bottom-center', 'bottom-right'
            ], 
            default: 'center' 
        },
        borderRadius: { min: 0, max: 20, default: 4, step: 1 },
        showAnimation: { default: false },
        backgroundShapeColor: { default: '#E8E8E8' },
        showValues: { default: true },
        showCategoryLabels: { default: true },
        showGroupLabels: { default: true }
    },
    
    layout: {
        fixedFormat: 'rectangular',
        fixedWidth: 800,
        fixedHeight: 600,
        margins: { top: 60, right: 60, bottom: 80, left: 60 }
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
            { categoria: 'Categoria A', grupo_1: 75, grupo_2: 68, grupo_3: 82 },
            { categoria: 'Categoria B', grupo_1: 45, grupo_2: 52, grupo_3: 38 },
            { categoria: 'Categoria C', grupo_1: 82, grupo_2: 79, grupo_3: 85 }
        ],
        columns: ['categoria', 'grupo_1', 'grupo_2', 'grupo_3'],
        columnTypes: { categoria: 'string', grupo_1: 'number', grupo_2: 'number', grupo_3: 'number' },
        rowCount: 3,
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
    customColors: []
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
// CONTROLES ESPECÍFICOS DA MATRIZ
// ==========================================================================

function onMatrixControlsUpdate() {
    const matrixControls = {
        shape: document.querySelector('.shape-option.active')?.dataset.shape || VIZ_CONFIG.specificControls.shape.default,
        elementSize: parseInt(document.getElementById('element-size')?.value || VIZ_CONFIG.specificControls.elementSize.default),
        elementSpacing: parseInt(document.getElementById('element-spacing')?.value || VIZ_CONFIG.specificControls.elementSpacing.default),
        alignment: document.querySelector('.alignment-option.active')?.dataset.align || VIZ_CONFIG.specificControls.alignment.default,
        borderRadius: parseFloat(document.getElementById('border-radius')?.value || VIZ_CONFIG.specificControls.borderRadius.default),
        showAnimation: document.getElementById('show-animation')?.checked || VIZ_CONFIG.specificControls.showAnimation.default,
        backgroundShapeColor: document.getElementById('background-shape-color')?.value || VIZ_CONFIG.specificControls.backgroundShapeColor.default
    };
    
    if (window.MatrixChoiceVisualization?.onMatrixControlUpdate) {
        window.MatrixChoiceVisualization.onMatrixControlUpdate(matrixControls);
    }
}

function onShapeChange(shape) {
    // ✅ INTEGRAÇÃO COM TEMPLATE CONTROLS: Mescla com configuração do template
    if (window.MatrixChoiceVisualization?.onUpdate) {
        const templateConfig = window.OddVizTemplateControls?.getState() || {};
        templateConfig.shape = shape;
        window.MatrixChoiceVisualization.onUpdate(templateConfig);
    }
}

function onAlignmentChange(alignment) {
    if (window.MatrixChoiceVisualization?.onUpdate) {
        const templateConfig = window.OddVizTemplateControls?.getState() || {};
        templateConfig.alignment = alignment;
        window.MatrixChoiceVisualization.onUpdate(templateConfig);
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
// CONFIGURAÇÃO DE CONTROLES - CORRIGIDA
// ==========================================================================

function setupMatrixControls() {
    console.log('🎛️ Configurando controles da matriz...');
    
    // ✅ APENAS controles específicos da matriz
    const matrixControls = [
        'element-size',
        'element-spacing', 
        'border-radius',
        'show-animation'
    ];
    
    matrixControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            const eventType = element.type === 'checkbox' ? 'change' : 'input';
            element.addEventListener(eventType, onMatrixControlsUpdate);
            
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
    
    // ✅ Controles de forma
    setupShapeControls();
    
    // ✅ Controles de alinhamento
    setupAlignmentControls();
    
    // ✅ Sistema de paletas de cores
    setupColorPaletteSystem();
    
    // Controle de cor de fundo das formas
    const backgroundShapeColor = document.getElementById('background-shape-color');
    const backgroundShapeColorText = document.getElementById('background-shape-color-text');
    
    if (backgroundShapeColor && backgroundShapeColorText) {
        // ✅ SINCRONIZA COM VALORES PADRÃO APENAS SE NECESSÁRIO
        if (!backgroundShapeColor.value) {
            backgroundShapeColor.value = VIZ_CONFIG.specificControls.backgroundShapeColor.default;
        }
        if (!backgroundShapeColorText.value) {
            backgroundShapeColorText.value = VIZ_CONFIG.specificControls.backgroundShapeColor.default;
        }
        
        backgroundShapeColor.addEventListener('input', (e) => {
            backgroundShapeColorText.value = e.target.value;
            onMatrixControlsUpdate();
        });
        
        backgroundShapeColorText.addEventListener('input', (e) => {
            if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                backgroundShapeColor.value = e.target.value;
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
                handler(e.target.checked);
            });
        }
    });
    
    console.log('✅ Controles da matriz configurados');
}

function setupShapeControls() {
    const shapeOptions = document.querySelectorAll('.shape-option');
    shapeOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const shape = option.dataset.shape;
            if (shape) {
                // Atualiza classes ativas
                shapeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Chama função de atualização
                onShapeChange(shape);
                onMatrixControlsUpdate();
            }
        });
    });
    
    // ✅ DEFINE FORMA PADRÃO SE NENHUMA ESTIVER ATIVA
    const activeShape = document.querySelector('.shape-option.active');
    if (!activeShape) {
        const defaultShape = document.querySelector('.shape-option[data-shape="square"]');
        if (defaultShape) defaultShape.classList.add('active');
    }
}

function setupAlignmentControls() {
    const alignmentOptions = document.querySelectorAll('.alignment-option');
    alignmentOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const alignment = option.dataset.align;
            if (alignment) {
                // Atualiza classes ativas
                alignmentOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                // Chama função de atualização
                onAlignmentChange(alignment);
                onMatrixControlsUpdate();
            }
        });
    });
    
    // ✅ DEFINE ALINHAMENTO PADRÃO SE NENHUM ESTIVER ATIVO
    const activeAlignment = document.querySelector('.alignment-option.active');
    if (!activeAlignment) {
        const defaultAlignment = document.querySelector('.alignment-option[data-align="center"]');
        if (defaultAlignment) defaultAlignment.classList.add('active');
    }
}

// ==========================================================================
// SISTEMA DE PALETA DE CORES CORRIGIDO
// ==========================================================================

function setupColorPaletteSystem() {
    console.log('🎨 Configurando sistema de paletas da matriz...');
    
    // Event listeners para paletas de cores
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
    
    // ✅ DEFINE PALETA PADRÃO SE NENHUMA ESTIVER ATIVA
    const activePalette = document.querySelector('.color-option.active');
    if (!activePalette) {
        const oddPalette = document.querySelector('.color-option[data-palette="odd"]');
        if (oddPalette) oddPalette.classList.add('active');
    }
    
    console.log('✅ Sistema de paletas da matriz configurado');
}

function onColorPaletteChange(paletteType) {
    console.log('🎨 Mudando paleta para:', paletteType);
    
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
        }
    }
    
    // Atualiza estado local
    currentMatrixConfig.currentPalette = paletteType;
    
    // Aplica a nova paleta
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
        // Usa cores customizadas se disponíveis
        newColors = currentMatrixConfig.customColors.length > 0 ? 
                   currentMatrixConfig.customColors : 
                   VIZ_CONFIG.colorSettings.defaultColors;
    } else {
        newColors = VIZ_CONFIG.colorSettings.defaultColors;
    }
    
    // Atualiza estado local
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
    
    // Limpa inputs existentes
    container.innerHTML = '';
    
    // Cria inputs de cor (começa com cores padrão da Odd)
    const defaultColors = VIZ_CONFIG.colorSettings.defaultColors.slice(0, 4); // Primeiras 4 cores
    
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
        
        // Event listeners para sincronizar cor e texto
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
    
    // Salva cores iniciais
    currentMatrixConfig.customColors = defaultColors;
    
    // Aplica cores iniciais
    updateCustomColorsFromInputs();
}

function updateCustomColorsFromInputs() {
    const colors = [];
    document.querySelectorAll('.custom-color-picker').forEach(input => {
        colors.push(input.value);
    });
    
    console.log('🎨 Cores customizadas atualizadas:', colors);
    
    // Atualiza estado local
    currentMatrixConfig.customColors = colors;
    
    // Aplica na visualização
    updateCustomColors(colors);
}

function updateCustomColors(customColors) {
    console.log('🎨 Aplicando cores customizadas:', customColors);
    
    // Atualiza estado local
    currentMatrixConfig.colors = customColors;
    
    if (window.MatrixChoiceVisualization?.updateCustomColors) {
        window.MatrixChoiceVisualization.updateCustomColors(customColors);
    }
}

// ==========================================================================
// SINCRONIZAÇÃO INICIAL COM TEMPLATE CONTROLS
// ==========================================================================

/**
 * ✅ NOVA FUNÇÃO: Sincroniza valores específicos APENAS se necessário
 */
function syncSpecificControlsIfNeeded() {
    console.log('🔄 Verificando se sincronização específica da matriz é necessária...');
    
    // ✅ APENAS sincroniza se controles estiverem com valores padrão vazios
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
// CONFIGURAÇÃO INICIAL
// ==========================================================================

function initializeMatrixConfig() {
    console.log('⚙️ Inicializando configuração específica da matriz...');
    
    // ✅ AGUARDA TEMPLATE CONTROLS ESTAR PRONTO
    setTimeout(() => {
        syncSpecificControlsIfNeeded(); // Sincronização não-intrusiva
        setupMatrixControls();
        console.log('✅ Configuração específica da matriz concluída');
    }, 300); // Delay maior para garantir Template Controls carregado
}

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMatrixConfig);
} else {
    initializeMatrixConfig();
}
