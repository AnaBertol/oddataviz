/**
 * CONFIGURAÇÕES DO GRÁFICO DE MEIO CÍRCULOS - VERSÃO CORRIGIDA
 * ✅ Com detecção automática de estrutura de dados e integração completa com Template Controls
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DOS MEIO CÍRCULOS
// ==========================================================================

const VIZ_CONFIG = {
    type: 'semi-circles',
    name: 'Gráfico de Meio Círculos',
    description: 'Comparação entre duas categorias usando meio círculos sobrepostos',
    
    // ✅ CORREÇÃO 1: Detecção automática de estrutura de dados
    dataRequirements: {
        autoDetectStructure: true,
        firstColumnAsParameter: true,
        secondColumnAsCategory1: true,
        thirdColumnAsCategory2: true,
        minRows: 2,
        maxRows: 8,
        minColumns: 3,
        maxColumns: 3,
        supportedValueTypes: ['number', 'percentage']
    },
    
    // ✅ APENAS controles específicos dos meio círculos
    specificControls: {
        circleSize: { min: 40, max: 240, default: 160, step: 5 },
        circleSpacing: { min: -50, max: 60, default: 30, step: 5 },
        showAxisLine: { default: true },
        showAnimation: { default: false },
        showCircleOutline: { default: true },
        outlineWidth: { min: 0.5, max: 4, default: 1, step: 0.5 },
        outlineStyle: { default: 'dashed' },
        category1Name: { default: 'Personagens' },
        category2Name: { default: 'Jogadores' },
        category1Color: { default: '#6F02FD' },
        category2Color: { default: '#6CDADE' }
    },
    
    layout: {
        fixedFormat: 'rectangular',
        fixedWidth: 800,
        fixedHeight: 600,
        margins: { top: 60, right: 60, bottom: 80, left: 60 }
    }
};

// ==========================================================================
// DADOS DE EXEMPLO
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
// VARIÁVEIS DE ESTADO ESPECÍFICAS
// ==========================================================================

let currentSemiCirclesConfig = {
    category1: VIZ_CONFIG.specificControls.category1Name.default,
    category2: VIZ_CONFIG.specificControls.category2Name.default,
    categoryColors: [
        VIZ_CONFIG.specificControls.category1Color.default,
        VIZ_CONFIG.specificControls.category2Color.default
    ]
};

// ==========================================================================
// FUNÇÕES DE INTERFACE
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

// ==========================================================================
// CONTROLES ESPECÍFICOS DOS MEIO CÍRCULOS
// ==========================================================================

function onSemiCirclesControlsUpdate() {
    const semiCirclesControls = {
        circleSize: parseInt(document.getElementById('circle-size')?.value || VIZ_CONFIG.specificControls.circleSize.default),
        circleSpacing: parseInt(document.getElementById('circle-spacing')?.value || VIZ_CONFIG.specificControls.circleSpacing.default),
        showAxisLine: document.getElementById('show-axis-line')?.checked !== false,
        showAnimation: document.getElementById('show-animation')?.checked || false,
        showCircleOutline: document.getElementById('show-circle-outline')?.checked || false,
        outlineWidth: parseFloat(document.getElementById('outline-width')?.value || VIZ_CONFIG.specificControls.outlineWidth.default),
        outlineStyle: document.querySelector('input[name="outline-style"]:checked')?.value || VIZ_CONFIG.specificControls.outlineStyle.default
    };
    
    if (window.SemiCirclesVisualization?.onSemiCirclesControlUpdate) {
        window.SemiCirclesVisualization.onSemiCirclesControlUpdate(semiCirclesControls);
    }
}

function onCategoryNamesUpdate() {
    const newNames = {
        category1: document.getElementById('category-1-name')?.value || currentSemiCirclesConfig.category1,
        category2: document.getElementById('category-2-name')?.value || currentSemiCirclesConfig.category2
    };
    
    // Atualiza estado local
    Object.assign(currentSemiCirclesConfig, newNames);
    
    // ✅ INTEGRAÇÃO COM TEMPLATE CONTROLS: Mescla com configuração do template
    if (window.SemiCirclesVisualization?.onUpdate) {
        const templateConfig = window.OddVizTemplateControls?.getState() || {};
        const mergedConfig = Object.assign({}, templateConfig, newNames);
        window.SemiCirclesVisualization.onUpdate(mergedConfig);
    }
}

function onShowValuesChange(showValues) {
    if (window.SemiCirclesVisualization?.onUpdate) {
        const templateConfig = window.OddVizTemplateControls?.getState() || {};
        templateConfig.showValues = showValues;
        window.SemiCirclesVisualization.onUpdate(templateConfig);
    }
}

function onShowCategoryLabelsChange(show) {
    if (window.SemiCirclesVisualization?.onUpdate) {
        const templateConfig = window.OddVizTemplateControls?.getState() || {};
        templateConfig.showCategoryLabels = show;
        window.SemiCirclesVisualization.onUpdate(templateConfig);
    }
}

function onShowParameterLabelsChange(show) {
    if (window.SemiCirclesVisualization?.onUpdate) {
        const templateConfig = window.OddVizTemplateControls?.getState() || {};
        templateConfig.showParameterLabels = show;
        window.SemiCirclesVisualization.onUpdate(templateConfig);
    }
}

// ==========================================================================
// SISTEMA DE CORES PARA DUAS CATEGORIAS
// ==========================================================================

function setupCategoryColorControls() {
    console.log('🎨 Configurando controles de cores das categorias...');
    
    // ✅ SINCRONIZA COM VALORES PADRÃO APENAS SE NECESSÁRIO
    const cat1Color = document.getElementById('category-1-color');
    const cat1ColorText = document.getElementById('category-1-color-text');
    const cat1Preview = document.getElementById('category-1-preview');
    
    // Só define valores padrão se estiverem vazios
    if (cat1Color && !cat1Color.value) {
        cat1Color.value = currentSemiCirclesConfig.categoryColors[0];
    }
    if (cat1ColorText && !cat1ColorText.value) {
        cat1ColorText.value = currentSemiCirclesConfig.categoryColors[0];
    }
    if (cat1Preview) {
        cat1Preview.style.background = cat1Color?.value || currentSemiCirclesConfig.categoryColors[0];
    }
    
    const cat2Color = document.getElementById('category-2-color');
    const cat2ColorText = document.getElementById('category-2-color-text');
    const cat2Preview = document.getElementById('category-2-preview');
    
    // Só define valores padrão se estiverem vazios
    if (cat2Color && !cat2Color.value) {
        cat2Color.value = currentSemiCirclesConfig.categoryColors[1];
    }
    if (cat2ColorText && !cat2ColorText.value) {
        cat2ColorText.value = currentSemiCirclesConfig.categoryColors[1];
    }
    if (cat2Preview) {
        cat2Preview.style.background = cat2Color?.value || currentSemiCirclesConfig.categoryColors[1];
    }
    
    // Event listeners para categoria 1
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
    
    // Event listeners para categoria 2
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
    
    console.log('✅ Controles de cores das categorias configurados');
}

function updateCategoryColors() {
    const cat1Color = document.getElementById('category-1-color')?.value || currentSemiCirclesConfig.categoryColors[0];
    const cat2Color = document.getElementById('category-2-color')?.value || currentSemiCirclesConfig.categoryColors[1];
    
    // Atualiza estado local
    currentSemiCirclesConfig.categoryColors = [cat1Color, cat2Color];
    
    console.log('🎨 Cores das categorias atualizadas:', { cat1Color, cat2Color });
    
    if (window.SemiCirclesVisualization?.updateCategoryColors) {
        window.SemiCirclesVisualization.updateCategoryColors(cat1Color, cat2Color);
    }
}

// ==========================================================================
// CONFIGURAÇÃO DE CONTROLES ESPECÍFICOS
// ==========================================================================

function setupSemiCirclesControls() {
    console.log('🎛️ Configurando controles específicos dos meio círculos...');
    
    // ✅ APENAS controles específicos dos meio círculos
    const semiCirclesControls = [
        'circle-size',
        'circle-spacing', 
        'show-axis-line',
        'show-animation',
        'show-circle-outline',
        'outline-width'
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
                        let unit = 'px';
                        valueDisplay.textContent = e.target.value + unit;
                    });
                }
            }
        }
    });
    
    // Radio buttons para estilo do contorno
    const outlineStyleRadios = document.querySelectorAll('input[name="outline-style"]');
    outlineStyleRadios.forEach(radio => {
        radio.addEventListener('change', onSemiCirclesControlsUpdate);
    });
    
    // ✅ CONTROLE DIRETO PARA VALUE-SIZE (bypass do template-controls)
    const valueSizeSlider = document.getElementById('value-size');
    if (valueSizeSlider) {
        valueSizeSlider.addEventListener('input', function(e) {
            const newSize = parseInt(e.target.value);
            console.log('🎚️ Value-size slider movido para:', newSize);
            
            // Atualiza diretamente a visualização
            if (window.SemiCirclesVisualization?.onUpdate) {
                const templateConfig = window.OddVizTemplateControls?.getState() || {};
                templateConfig.valueSize = newSize;
                window.SemiCirclesVisualization.onUpdate(templateConfig);
            }
        });
        
        // Atualiza o display do valor
        const valueDisplay = document.getElementById('value-size-value');
        if (valueDisplay) {
            valueSizeSlider.addEventListener('input', (e) => {
                valueDisplay.textContent = e.target.value + 'px';
            });
        }
    }
    
    // Controles de nomes das categorias
    const categoryNameInputs = ['category-1-name', 'category-2-name'];
    categoryNameInputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', onCategoryNamesUpdate);
        }
    });
    
    // ✅ CONFIGURAÇÃO DE CORES DAS CATEGORIAS
    setupCategoryColorControls();
    
    // Controles de exibição
    const displayControls = [
        { id: 'show-values', handler: onShowValuesChange },
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
    
    // Setup de controles de outline
    setupOutlineControls();
    
    console.log('✅ Controles específicos dos meio círculos configurados');
}

function setupOutlineControls() {
    const showOutlineCheck = document.getElementById('show-circle-outline');
    const outlineControls = document.getElementById('outline-controls');
    
    if (showOutlineCheck && outlineControls) {
        showOutlineCheck.addEventListener('change', function() {
            outlineControls.style.display = this.checked ? 'block' : 'none';
        });
        
        // Dispara evento inicial
        showOutlineCheck.dispatchEvent(new Event('change'));
    }
}

// ==========================================================================
// SINCRONIZAÇÃO INICIAL COM TEMPLATE CONTROLS
// ==========================================================================

/**
 * ✅ FUNÇÃO: Sincroniza valores específicos APENAS se necessário
 */
function syncSpecificControlsIfNeeded() {
    console.log('🔄 Verificando se sincronização específica é necessária...');
    
    // ✅ APENAS sincroniza nomes das categorias se estiverem com valores padrão
    const cat1NameInput = document.getElementById('category-1-name');
    const cat2NameInput = document.getElementById('category-2-name');
    
    if (cat1NameInput && (!cat1NameInput.value || cat1NameInput.value === 'Categoria 1')) {
        cat1NameInput.value = currentSemiCirclesConfig.category1;
    }
    
    if (cat2NameInput && (!cat2NameInput.value || cat2NameInput.value === 'Categoria 2')) {
        cat2NameInput.value = currentSemiCirclesConfig.category2;
    }
    
    console.log('✅ Sincronização específica concluída (não-intrusiva)');
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

window.SemiCirclesVizConfig = {
    config: VIZ_CONFIG,
    getSampleData,
    getDataRequirements,
    onDataLoaded,
    onSemiCirclesControlsUpdate,
    onCategoryNamesUpdate,
    onShowValuesChange,
    onShowCategoryLabelsChange,
    onShowParameterLabelsChange,
    updateCategoryColors,
    setupSemiCirclesControls,
    syncSpecificControlsIfNeeded,
    
    // Estado atual
    get currentConfig() { return currentSemiCirclesConfig; }
};

// Expõe funções principais globalmente
window.getSampleData = getSampleData;
window.getDataRequirements = getDataRequirements;
window.onDataLoaded = onDataLoaded;

// ==========================================================================
// INICIALIZAÇÃO ESPECÍFICA DOS MEIO CÍRCULOS
// ==========================================================================

function initializeSemiCirclesConfig() {
    console.log('⚙️ Inicializando configuração específica dos meio círculos...');
    
    // ✅ AGUARDA TEMPLATE CONTROLS ESTAR PRONTO
    setTimeout(() => {
        syncSpecificControlsIfNeeded(); // Sincronização não-intrusiva
        setupSemiCirclesControls();
        console.log('✅ Configuração específica dos meio círculos concluída');
    }, 300); // Delay maior para garantir Template Controls carregado
}

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSemiCirclesConfig);
} else {
    initializeSemiCirclesConfig();
}