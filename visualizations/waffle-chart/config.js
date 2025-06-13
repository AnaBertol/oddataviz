/**
 * CONFIGURAÇÕES DO GRÁFICO DE WAFFLE - SINCRONIZADO
 * Versão corrigida com configurações consistentes
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
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
    
    specificControls: {
        waffleSize: { min: 12, max: 35, default: 25, step: 1 },
        waffleGap: { min: 0.5, max: 6, default: 2, step: 0.5 },
        waffleRoundness: { min: 0, max: 25, default: 3, step: 0.5 },
        waffleAnimation: { default: false },
        waffleHoverEffect: { default: true }
    },
    
    // ✅ SEMPRE formato quadrado - dimensões fixas
    layout: {
        fixedFormat: 'square',
        fixedWidth: 600,
        fixedHeight: 600,
        margins: { top: 50, right: 50, bottom: 70, left: 50 }
    },
    
    colorSettings: {
        defaultPalette: 'odd',
        supportedPalettes: ['odd', 'custom']
    }
};

// ==========================================================================
// DADOS DE EXEMPLO PADRONIZADOS
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
// FUNÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
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

function onControlsUpdate(state) {
    if (window.WaffleVisualization?.onUpdate) {
        window.WaffleVisualization.onUpdate(state);
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
    if (window.WaffleVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        currentConfig.directLabelPosition = position;
        window.WaffleVisualization.onUpdate(currentConfig);
    }
}

function onShowLegendChange(show) {
    if (window.WaffleVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        currentConfig.showLegend = show;
        window.WaffleVisualization.onUpdate(currentConfig);
    }
}

// ==========================================================================
// CONFIGURAÇÃO DE CONTROLES - CORRIGIDA
// ==========================================================================

function setupWaffleControls() {
    console.log('🎛️ Configurando controles do waffle...');
    
    // ✅ REMOVIDO: Controles de formato de tela (sempre quadrado)
    // Não há mais radio buttons de formato
    
    // Controles de aparência do waffle
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
    
    // Controle de posição da legenda direta
    const directLabelPositions = document.querySelectorAll('input[name="direct-label-position"]');
    directLabelPositions.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                onDirectLabelPositionChange(e.target.value);
            }
        });
    });
    
    // Controle para mostrar/ocultar rótulos
    const showLegendCheck = document.getElementById('show-legend');
    if (showLegendCheck) {
        showLegendCheck.addEventListener('change', (e) => {
            const legendOptions = document.getElementById('legend-options');
            
            // Mostra/oculta controles de posição
            if (legendOptions) {
                legendOptions.style.display = e.target.checked ? 'block' : 'none';
            }
            
            // Dispara atualização da visualização
            onShowLegendChange(e.target.checked);
        });
        
        // Dispara evento inicial para configurar estado
        showLegendCheck.dispatchEvent(new Event('change'));
    }
    
    console.log('✅ Controles do waffle configurados');
}

// ==========================================================================
// SINCRONIZAÇÃO DE PALETA DE CORES - NOVA FUNÇÃO
// ==========================================================================

function onColorPaletteChange(paletteType) {
    // ✅ CRÍTICO: Não chama getCurrentColorPalette() para evitar inconsistências
    // Apenas dispara atualização se necessário
    
    console.log('🎨 Paleta alterada:', paletteType);
    
    if (paletteType === 'custom') {
        // Se for personalizada, deixa o template-controls.js gerenciar
        // Não fazemos nada aqui para evitar conflitos
        return;
    }
    
    // Para paleta "odd", garante que está usando as cores corretas
    if (paletteType === 'odd' && window.WaffleVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        // Força atualização sem buscar cores externas
        window.WaffleVisualization.onUpdate(currentConfig);
    }
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

window.WaffleVizConfig = {
    config: VIZ_CONFIG,
    getSampleData,
    getDataRequirements,
    onDataLoaded,
    onControlsUpdate,
    onWaffleControlsUpdate,
    onDirectLabelPositionChange,
    onShowLegendChange,
    onColorPaletteChange,
    setupWaffleControls
};

// Expõe funções principais globalmente
window.getSampleData = getSampleData;
window.getDataRequirements = getDataRequirements;
window.onDataLoaded = onDataLoaded;

// ==========================================================================
// CONFIGURAÇÃO INICIAL - APRIMORADA
// ==========================================================================

function initializeWaffleConfig() {
    console.log('⚙️ Inicializando configuração do waffle...');
    
    // Aguarda um pouco para garantir que DOM está pronto
    setTimeout(() => {
        setupWaffleControls();
        
        // ✅ NOVO: Configura event listeners para paleta de cores
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const paletteType = e.currentTarget.dataset.palette;
                if (paletteType) {
                    onColorPaletteChange(paletteType);
                }
            });
        });
        
        console.log('✅ Configuração do waffle concluída');
    }, 100);
}

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWaffleConfig);
} else {
    initializeWaffleConfig();
}
