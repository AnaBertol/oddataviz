/**
 * CONFIGURAÇÕES DA MATRIZ DE MÚLTIPLA ESCOLHA - SINCRONIZADO
 * Configuração para visualização de respostas de múltipla escolha
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

const VIZ_CONFIG = {
    type: 'matrix-choice',
    name: 'Matriz de Múltipla Escolha',
    description: 'Visualização de respostas de múltipla escolha em formato de matriz',
    
    dataRequirements: {
        requiredColumns: ['categoria', 'valor'], // Modo simples
        optionalColumns: ['grupo_1', 'grupo_2', 'grupo_3'], // Modo comparação
        columnTypes: {
            categoria: 'string',
            valor: 'number'
        },
        minRows: 2,
        maxRows: 20
    },
    
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
        showAnimation: { default: false }
    },
    
    // Formato retangular para matriz
    layout: {
        fixedFormat: 'rectangular',
        fixedWidth: 800,
        fixedHeight: 600,
        margins: { top: 60, right: 60, bottom: 80, left: 60 }
    },
    
    colorSettings: {
        defaultPalette: 'odd',
        backgroundShapeColor: '#E8E8E8', // Cinza claro para 100%
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
        mode: 'simple' // ou 'comparison'
    };
}

function getSampleComparisonData() {
    return {
        data: [
            { categoria: 'API via Modelos Prontos', media_empresa: 53, micro_pequena: 85, startup: 64 },
            { categoria: 'Open Source Local', media_empresa: 22, micro_pequena: 10, startup: 26 },
            { categoria: 'Open Source via API', media_empresa: 28, micro_pequena: 27, startup: 33 },
            { categoria: 'Modelos Próprios', media_empresa: 22, micro_pequena: 10, startup: 28 }
        ],
        columns: ['categoria', 'media_empresa', 'micro_pequena', 'startup'],
        columnTypes: { categoria: 'string', media_empresa: 'number', micro_pequena: 'number', startup: 'number' },
        rowCount: 4,
        source: 'example',
        mode: 'comparison'
    };
}

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

function onControlsUpdate(state) {
    if (window.MatrixChoiceVisualization?.onUpdate) {
        window.MatrixChoiceVisualization.onUpdate(state);
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
        backgroundShapeColor: document.getElementById('background-shape-color')?.value || VIZ_CONFIG.colorSettings.backgroundShapeColor
    };
    
    if (window.MatrixChoiceVisualization?.onMatrixControlUpdate) {
        window.MatrixChoiceVisualization.onMatrixControlUpdate(matrixControls);
    }
}

function onShapeChange(shape) {
    if (window.MatrixChoiceVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        currentConfig.shape = shape;
        window.MatrixChoiceVisualization.onUpdate(currentConfig);
    }
}

function onAlignmentChange(alignment) {
    if (window.MatrixChoiceVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        currentConfig.alignment = alignment;
        window.MatrixChoiceVisualization.onUpdate(currentConfig);
    }
}

function onShowValuesChange(show) {
    if (window.MatrixChoiceVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        currentConfig.showValues = show;
        window.MatrixChoiceVisualization.onUpdate(currentConfig);
    }
}

function onShowCategoryLabelsChange(show) {
    if (window.MatrixChoiceVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        currentConfig.showCategoryLabels = show;
        window.MatrixChoiceVisualization.onUpdate(currentConfig);
    }
}

function onShowGroupLabelsChange(show) {
    if (window.MatrixChoiceVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        currentConfig.showGroupLabels = show;
        window.MatrixChoiceVisualization.onUpdate(currentConfig);
    }
}

// ==========================================================================
// CONFIGURAÇÃO DE CONTROLES - CORRIGIDA
// ==========================================================================

function setupMatrixControls() {
    console.log('🎛️ Configurando controles da matriz...');
    
    // Controles de aparência da matriz
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
    
    // Controles de forma
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
    
    // Controles de alinhamento
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
    
    // Controle de cor de fundo das formas
    const backgroundShapeColor = document.getElementById('background-shape-color');
    const backgroundShapeColorText = document.getElementById('background-shape-color-text');
    
    if (backgroundShapeColor && backgroundShapeColorText) {
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

// ==========================================================================
// SISTEMA DE PALETA DE CORES - IGUAL AO WAFFLE
// ==========================================================================

function updateColorPalette(paletteType) {
    console.log('🎨 Aplicando nova paleta:', paletteType);
    
    let newColors;
    
    if (paletteType === 'odd') {
        // Paleta padrão da Odd
        newColors = ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'];
    } else if (paletteType === 'rainbow') {
        // Paleta arco-íris
        newColors = ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#0080FF', '#8000FF'];
    } else if (paletteType === 'custom') {
        // Usa cores customizadas se disponíveis
        const customColors = [];
        document.querySelectorAll('.custom-color-picker').forEach(input => {
            customColors.push(input.value);
        });
        newColors = customColors.length > 0 ? customColors : ['#6F02FD', '#6CDADE', '#3570DF'];
    } else {
        // Mantém cores atuais para outros casos
        newColors = ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'];
    }
    
    if (window.MatrixChoiceVisualization?.updateColorPalette) {
        window.MatrixChoiceVisualization.updateColorPalette(newColors);
    }
    
    console.log('✅ Nova paleta aplicada:', newColors);
}

function updateCustomColors(customColors) {
    console.log('🎨 Aplicando cores customizadas:', customColors);
    
    if (window.MatrixChoiceVisualization?.updateCustomColors) {
        window.MatrixChoiceVisualization.updateCustomColors(customColors);
    }
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
    
    // Aplica a nova paleta
    updateColorPalette(paletteType);
}

function setupCustomColorInputs() {
    const container = document.querySelector('.custom-color-inputs');
    if (!container) return;
    
    // Limpa inputs existentes
    container.innerHTML = '';
    
    // Cria inputs de cor (começa com 3, pode expandir conforme necessário)
    const defaultColors = ['#6F02FD', '#6CDADE', '#3570DF'];
    
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
    
    // Aplica cores iniciais
    updateCustomColorsFromInputs();
}

function updateCustomColorsFromInputs() {
    const colors = [];
    document.querySelectorAll('.custom-color-picker').forEach(input => {
        colors.push(input.value);
    });
    
    console.log('🎨 Cores customizadas atualizadas:', colors);
    updateCustomColors(colors);
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
    onControlsUpdate,
    onMatrixControlsUpdate,
    onShapeChange,
    onAlignmentChange,
    onShowValuesChange,
    onShowCategoryLabelsChange,
    onShowGroupLabelsChange,
    onColorPaletteChange,
    updateColorPalette,
    updateCustomColors,
    setupMatrixControls
};

// Expõe funções principais globalmente
window.getSampleData = getSampleData;
window.getDataRequirements = getDataRequirements;
window.onDataLoaded = onDataLoaded;

// ==========================================================================
// CONFIGURAÇÃO INICIAL
// ==========================================================================

function initializeMatrixConfig() {
    console.log('⚙️ Inicializando configuração da matriz...');
    
    // Aguarda um pouco para garantir que DOM está pronto
    setTimeout(() => {
        setupMatrixControls();
        console.log('✅ Configuração da matriz concluída');
    }, 100);
}

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeMatrixConfig);
} else {
    initializeMatrixConfig();
}
