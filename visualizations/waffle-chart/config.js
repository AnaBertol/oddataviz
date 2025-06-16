/**
 * CONFIGURAÇÕES DO GRÁFICO DE WAFFLE - LIMPO
 * Versão limpa focada apenas em configurações específicas do waffle
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DO WAFFLE
// ==========================================================================

const VIZ_CONFIG = {
    type: 'waffle-chart',
    name: 'Gráfico de Waffle',
    description: 'Visualização em grade 10x10 para mostrar proporções e distribuições',
    
    dataRequirements: {
        requiredColumns: ['categoria', 'valor'],
        columnTypes: {
            categoria: 'string',
            valor: 'number'
        },
        minRows: 2,
        maxRows: 10
    },
    
    // ✅ APENAS controles específicos do waffle
    specificControls: {
        waffleSize: { min: 12, max: 35, default: 25, step: 1 },
        waffleGap: { min: 0.5, max: 6, default: 2, step: 0.5 },
        waffleRoundness: { min: 0, max: 25, default: 3, step: 0.5 },
        waffleAnimation: { default: false },
        waffleHoverEffect: { default: true },
        showDirectLabels: { default: true },
        directLabelPosition: { default: 'right' }
    },
    
    layout: {
        fixedFormat: 'square',
        fixedWidth: 600,
        fixedHeight: 600,
        margins: { top: 50, right: 50, bottom: 70, left: 50 }
    }
};

// ==========================================================================
// DADOS DE EXEMPLO
// ==========================================================================

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

// ==========================================================================
// FUNÇÕES DE INTERFACE
// ==========================================================================

function getDataRequirements() {
    return VIZ_CONFIG.dataRequirements;
}

function onDataLoaded(processedData) {
    if (processedData.data && processedData.data.length > 10) {
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(
                'Muitas categorias! Recomendamos até 10 para melhor visualização.', 
                'warn'
            );
        }
    }
    
    if (window.WaffleVisualization?.onDataLoaded) {
        window.WaffleVisualization.onDataLoaded(processedData);
    }
}

// ==========================================================================
// CONTROLES ESPECÍFICOS DO WAFFLE
// ==========================================================================

function onWaffleControlsUpdate() {
    const waffleControls = {
        size: parseInt(document.getElementById('waffle-size')?.value || VIZ_CONFIG.specificControls.waffleSize.default),
        gap: parseFloat(document.getElementById('waffle-gap')?.value || VIZ_CONFIG.specificControls.waffleGap.default),
        roundness: parseFloat(document.getElementById('waffle-roundness')?.value || VIZ_CONFIG.specificControls.waffleRoundness.default),
        animation: document.getElementById('waffle-animation')?.checked || VIZ_CONFIG.specificControls.waffleAnimation.default,
        hover_effect: document.getElementById('waffle-hover-effect')?.checked !== false
    };
    
    if (window.WaffleVisualization?.onWaffleControlUpdate) {
        window.WaffleVisualization.onWaffleControlUpdate(waffleControls);
    }
}

function onDirectLabelPositionChange(position) {
    // Atualiza apenas o layout dos rótulos
    if (window.WaffleVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        // Não altera a configuração do template, apenas força re-render
        window.WaffleVisualization.onUpdate(currentConfig);
    }
}

function onShowLegendChange(show) {
    // Atualiza apenas a exibição dos rótulos
    if (window.WaffleVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        // Não altera a configuração do template, apenas força re-render
        window.WaffleVisualization.onUpdate(currentConfig);
    }
}

// ==========================================================================
// CORES PERSONALIZADAS ESPECÍFICAS DO WAFFLE
// ==========================================================================

function setupWaffleCustomColors() {
    // ✅ USA o sistema do Template Controls
    if (!window.OddVizTemplateControls?.setupCustomColors) return;
    
    // Determina quantas cores precisa baseado nos dados atuais
    const currentData = window.WaffleVisualization?.vizCurrentData || getSampleData().data;
    const numColors = currentData.length;
    
    console.log(`🧇 Setting up ${numColors} custom colors for waffle`);
    
    // Usa o sistema genérico do template
    window.OddVizTemplateControls.setupCustomColors(
        numColors, 
        updateWaffleCustomColors,
        null // Usa cores padrão do template
    );
}

function updateWaffleCustomColors(customColors) {
    console.log('🎨 Waffle custom colors updated:', customColors);
    
    if (window.WaffleVisualization?.updateCustomColors) {
        window.WaffleVisualization.updateCustomColors(customColors);
    }
}

// ==========================================================================
// CONFIGURAÇÃO DE CONTROLES ESPECÍFICOS
// ==========================================================================

function setupWaffleControls() {
    console.log('🎛️ Configurando controles específicos do waffle...');
    
    // ✅ APENAS controles específicos do waffle
    const waffleControls = [
        'waffle-size',
        'waffle-gap', 
        'waffle-roundness',
        'waffle-animation',
        'waffle-hover-effect'
    ];
    
    waffleControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            const eventType = element.type === 'checkbox' ? 'change' : 'input';
            element.addEventListener(eventType, onWaffleControlsUpdate);
            
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
    
    // ✅ Controles de posição da legenda direta (específicos do waffle)
    const directLabelPositions = document.querySelectorAll('input[name="direct-label-position"]');
    directLabelPositions.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                onDirectLabelPositionChange(e.target.value);
            }
        });
    });
    
    // ✅ Controle para mostrar/ocultar rótulos (específico do waffle)
    const showLegendCheck = document.getElementById('show-legend');
    if (showLegendCheck) {
        showLegendCheck.addEventListener('change', (e) => {
            const legendOptions = document.getElementById('legend-options');
            
            // Mostra/oculta controles de posição
            if (legendOptions) {
                legendOptions.style.display = e.target.checked ? 'block' : 'none';
            }
            
            // Atualiza visualização
            onShowLegendChange(e.target.checked);
        });
        
        // Dispara evento inicial
        showLegendCheck.dispatchEvent(new Event('change'));
    }
    
    // ✅ Setup de cores personalizadas quando paleta custom é selecionada
    const customPaletteButton = document.querySelector('.color-option[data-palette="custom"]');
    if (customPaletteButton) {
        customPaletteButton.addEventListener('click', () => {
            // Pequeno delay para garantir que o template processou a mudança
            setTimeout(setupWaffleCustomColors, 100);
        });
    }
    
    console.log('✅ Controles específicos do waffle configurados');
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

window.WaffleVizConfig = {
    config: VIZ_CONFIG,
    getSampleData,
    getDataRequirements,
    onDataLoaded,
    onWaffleControlsUpdate,
    onDirectLabelPositionChange,
    onShowLegendChange,
    setupWaffleCustomColors,
    updateWaffleCustomColors,
    setupWaffleControls
};

// Expõe funções principais globalmente
window.getSampleData = getSampleData;
window.getDataRequirements = getDataRequirements;
window.onDataLoaded = onDataLoaded;

// ==========================================================================
// INICIALIZAÇÃO ESPECÍFICA DO WAFFLE
// ==========================================================================

function initializeWaffleConfig() {
    console.log('⚙️ Inicializando configuração específica do waffle...');
    
    // Aguarda Template Controls estar pronto
    setTimeout(() => {
        setupWaffleControls();
        console.log('✅ Configuração específica do waffle concluída');
    }, 200); // Delay maior para garantir que template carregou
}

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWaffleConfig);
} else {
    initializeWaffleConfig();
}
