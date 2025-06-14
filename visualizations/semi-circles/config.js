/**
 * CONFIGURAÇÕES DO GRÁFICO DE MEIO CÍRCULOS - SINCRONIZADO
 * Configuração para comparação entre duas categorias
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

const VIZ_CONFIG = {
    type: 'semi-circles',
    name: 'Gráfico de Meio Círculos',
    description: 'Comparação entre duas categorias usando meio círculos sobrepostos',
    
    dataRequirements: {
        requiredColumns: ['parametro', 'categoria_1', 'categoria_2'],
        columnTypes: {
            parametro: 'string',
            categoria_1: 'number',
            categoria_2: 'number'
        },
        minRows: 2,
        maxRows: 8
    },
    
    specificControls: {
        circleSize: { min: 40, max: 120, default: 80, step: 5 },
        circleSpacing: { min: 10, max: 60, default: 30, step: 5 },
        strokeWidth: { min: 0, max: 8, default: 2, step: 0.5 },
        showAxisLine: { default: true },
        showAnimation: { default: true }
    },
    
    // Formato retangular para meio círculos
    layout: {
        fixedFormat: 'rectangular',
        fixedWidth: 800,
        fixedHeight: 600,
        margins: { top: 60, right: 60, bottom: 80, left: 60 }
    },
    
    colorSettings: {
        defaultCategory1Color: '#FF1493', // Deep Pink
        defaultCategory2Color: '#00CED1', // Dark Turquoise
        supportedPalettes: ['odd', 'rainbow', 'custom']
    }
};

// ==========================================================================
// DADOS DE EXEMPLO PADRONIZADOS
// ==========================================================================

function getSampleData() {
    return {
        data: [
            { parametro: 'Engajamento', categoria_1: 79, categoria_2: 41 },
            { parametro: 'Satisfação', categoria_1: 54, categoria_2: 48 },
            { parametro: 'Retenção', categoria_1: 8, categoria_2: 25 }
        ],
        columns: ['parametro', 'categoria_1', 'categoria_2'],
        columnTypes: { parametro: 'string', categoria_1: 'number', categoria_2: 'number' },
        rowCount: 3,
        source: 'example'
    };
}

// ==========================================================================
// FUNÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

function getDataRequirements() {
    return VIZ_CONFIG.dataRequirements;
}

function onDataLoaded(processedData) {
    if (processedData.data && processedData.data.length > 8) {
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(
                'Muitos parâmetros! Recomendamos até 8 para melhor visualização.', 
                'warn'
            );
        }
    }
    
    if (window.SemiCirclesVisualization?.onDataLoaded) {
        window.SemiCirclesVisualization.onDataLoaded(processedData);
    }
}

function onControlsUpdate(state) {
    if (window.SemiCirclesVisualization?.onUpdate) {
        window.SemiCirclesVisualization.onUpdate(state);
    }
}

// ==========================================================================
// CONTROLES ESPECÍFICOS DOS MEIO CÍRCULOS
// ==========================================================================

function onSemiCirclesControlsUpdate() {
    const semiCirclesControls = {
        circleSize: parseInt(document.getElementById('circle-size')?.value || VIZ_CONFIG.specificControls.circleSize.default),
        circleSpacing: parseInt(document.getElementById('circle-spacing')?.value || VIZ_CONFIG.specificControls.circleSpacing.default),
        strokeWidth: parseFloat(document.getElementById('stroke-width')?.value || VIZ_CONFIG.specificControls.strokeWidth.default),
        showAxisLine: document.getElementById('show-axis-line')?.checked !== false,
        showAnimation: document.getElementById('show-animation')?.checked !== false
    };
    
    if (window.SemiCirclesVisualization?.onSemiCirclesControlUpdate) {
        window.SemiCirclesVisualization.onSemiCirclesControlUpdate(semiCirclesControls);
    }
}

function onCategoryNamesUpdate() {
    const categoryNames = {
        category1: document.getElementById('category-1-name')?.value || 'Categoria 1',
        category2: document.getElementById('category-2-name')?.value || 'Categoria 2'
    };
    
    if (window.SemiCirclesVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        Object.assign(currentConfig, categoryNames);
        window.SemiCirclesVisualization.onUpdate(currentConfig);
    }
}

function onShowValuesChange(showValues) {
    if (window.SemiCirclesVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        currentConfig.showValues = showValues;
        window.SemiCirclesVisualization.onUpdate(currentConfig);
    }
}

function onShowPercentagesChange(showPercentages) {
    if (window.SemiCirclesVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        currentConfig.showPercentages = showPercentages;
        window.SemiCirclesVisualization.onUpdate(currentConfig);
    }
}

function onShowCategoryLabelsChange(show) {
    if (window.SemiCirclesVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        currentConfig.showCategoryLabels = show;
        window.SemiCirclesVisualization.onUpdate(currentConfig);
    }
}

function onShowParameterLabelsChange(show) {
    if (window.SemiCirclesVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        currentConfig.showParameterLabels = show;
        window.SemiCirclesVisualization.onUpdate(currentConfig);
    }
}

// ==========================================================================
// CONFIGURAÇÃO DE CONTROLES - CORRIGIDA
// ==========================================================================

function setupSemiCirclesControls() {
    console.log('🎛️ Configurando controles dos meio círculos...');
    
    // Controles de aparência dos meio círculos
    const semiCirclesControls = [
        'circle-size',
        'circle-spacing', 
        'stroke-width',
        'show-axis-line',
        'show-animation'
    ];
    
    semiCirclesControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            const eventType = element.type === 'checkbox' ? 'change' : 'input';
            element.addEventListener(eventType, onSemiCirclesControlsUpdate);
            
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
    
    // Controles de nomes das categorias
    const categoryNameInputs = ['category-1-name', 'category-2-name'];
    categoryNameInputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', onCategoryNamesUpdate);
        }
    });
    
    // Controles de paletas de cores
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
    
    // Controles de cores das categorias
    setupCategoryColorControls();
    
    // Controles de exibição
    const displayControls = [
        { id: 'show-values', handler: onShowValuesChange },
        { id: 'show-percentages', handler: onShowPercentagesChange },
        { id: 'show-category-labels', handler: onShowCategoryLabelsChange },
        { id: 'show-parameter-labels', handler: onShowParameterLabelsChange }
    ];
    
    displayControls.forEach(({ id, handler }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', (e) => {
                handler(e.target.checked);
            });
        }
    });
    
    console.log('✅ Controles dos meio círculos configurados');
}

// ==========================================================================
// SISTEMA DE CORES PARA DUAS CATEGORIAS
// ==========================================================================

function setupCategoryColorControls() {
    // Controles para categoria 1
    const cat1Color = document.getElementById('category-1-color');
    const cat1ColorText = document.getElementById('category-1-color-text');
    const cat1Preview = document.getElementById('category-1-preview');
    
    if (cat1Color && cat1ColorText && cat1Preview) {
        cat1Color.addEventListener('input', (e) => {
            cat1ColorText.value = e.target.value;
            cat1Preview.style.background = e.target.value;
            updateCategoryColors();
        });
        
        cat1ColorText.addEventListener('input', (e) => {
            if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                cat1Color.value = e.target.value;
                cat1Preview.style.background = e.target.value;
                updateCategoryColors();
            }
        });
    }
    
    // Controles para categoria 2
    const cat2Color = document.getElementById('category-2-color');
    const cat2ColorText = document.getElementById('category-2-color-text');
    const cat2Preview = document.getElementById('category-2-preview');
    
    if (cat2Color && cat2ColorText && cat2Preview) {
        cat2Color.addEventListener('input', (e) => {
            cat2ColorText.value = e.target.value;
            cat2Preview.style.background = e.target.value;
            updateCategoryColors();
        });
        
        cat2ColorText.addEventListener('input', (e) => {
            if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                cat2Color.value = e.target.value;
                cat2Preview.style.background = e.target.value;
                updateCategoryColors();
            }
        });
    }
}

function updateCategoryColors() {
    const cat1Color = document.getElementById('category-1-color')?.value || VIZ_CONFIG.colorSettings.defaultCategory1Color;
    const cat2Color = document.getElementById('category-2-color')?.value || VIZ_CONFIG.colorSettings.defaultCategory2Color;
    
    console.log('🎨 Cores das categorias atualizadas:', { cat1Color, cat2Color });
    
    if (window.SemiCirclesVisualization?.updateCategoryColors) {
        window.SemiCirclesVisualization.updateCategoryColors(cat1Color, cat2Color);
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
    
    // Define cores baseadas na paleta
    let cat1Color, cat2Color;
    
    if (paletteType === 'odd') {
        cat1Color = '#FF1493'; // Deep Pink (destaque)
        cat2Color = '#6CDADE';  // Turquoise (accent da Odd)
    } else if (paletteType === 'rainbow') {
        cat1Color = '#FF0000'; // Red
        cat2Color = '#0080FF'; // Blue
    } else if (paletteType === 'custom') {
        // Mantém cores atuais para custom
        cat1Color = document.getElementById('category-1-color')?.value || VIZ_CONFIG.colorSettings.defaultCategory1Color;
        cat2Color = document.getElementById('category-2-color')?.value || VIZ_CONFIG.colorSettings.defaultCategory2Color;
    }
    
    // Aplica as cores aos controles
    if (paletteType !== 'custom') {
        const cat1ColorInput = document.getElementById('category-1-color');
        const cat1ColorText = document.getElementById('category-1-color-text');
        const cat1Preview = document.getElementById('category-1-preview');
        
        if (cat1ColorInput) cat1ColorInput.value = cat1Color;
        if (cat1ColorText) cat1ColorText.value = cat1Color;
        if (cat1Preview) cat1Preview.style.background = cat1Color;
        
        const cat2ColorInput = document.getElementById('category-2-color');
        const cat2ColorText = document.getElementById('category-2-color-text');
        const cat2Preview = document.getElementById('category-2-preview');
        
        if (cat2ColorInput) cat2ColorInput.value = cat2Color;
        if (cat2ColorText) cat2ColorText.value = cat2Color;
        if (cat2Preview) cat2Preview.style.background = cat2Color;
    }
    
    // Atualiza visualização
    updateCategoryColors();
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

window.SemiCirclesVizConfig = {
    config: VIZ_CONFIG,
    getSampleData,
    getDataRequirements,
    onDataLoaded,
    onControlsUpdate,
    onSemiCirclesControlsUpdate,
    onCategoryNamesUpdate,
    onShowValuesChange,
    onShowPercentagesChange,
    onShowCategoryLabelsChange,
    onShowParameterLabelsChange,
    onColorPaletteChange,
    setupSemiCirclesControls
};

// Expõe funções principais globalmente
window.getSampleData = getSampleData;
window.getDataRequirements = getDataRequirements;
window.onDataLoaded = onDataLoaded;

// ==========================================================================
// CONFIGURAÇÃO INICIAL
// ==========================================================================

function initializeSemiCirclesConfig() {
    console.log('⚙️ Inicializando configuração dos meio círculos...');
    
    // Aguarda um pouco para garantir que DOM está pronto
    setTimeout(() => {
        setupSemiCirclesControls();
        console.log('✅ Configuração dos meio círculos concluída');
    }, 100);
}

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSemiCirclesConfig);
} else {
    initializeSemiCirclesConfig();
}
