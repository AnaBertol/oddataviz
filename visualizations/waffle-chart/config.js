/**
 * CONFIGURAÇÕES DO GRÁFICO DE WAFFLE - CORRIGIDO
 * Define configurações específicas para o waffle chart
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
    
    layout: {
        margins: { 
            desktop: { top: 80, right: 80, bottom: 120, left: 80 },
            mobile: { top: 60, right: 40, bottom: 100, left: 40 },
            square: { top: 70, right: 70, bottom: 110, left: 70 }
        },
        defaultWidth: 800,
        defaultHeight: 600
    },
    
    colorSettings: {
        defaultPalette: 'odd',
        supportedPalettes: ['odd', 'custom']
    }
};

// ==========================================================================
// FUNÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

function getDataRequirements() {
    return VIZ_CONFIG.dataRequirements;
}

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
// CALLBACKS PARA CONTROLES ESPECÍFICOS
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
    // ✅ INTEGRAÇÃO: Atualiza via sistema de template controls
    if (window.OddVizTemplateControls) {
        const currentState = window.OddVizTemplateControls.getState();
        currentState.directLabelPosition = position;
        window.OddVizTemplateControls.triggerUpdate(currentState);
    } else if (window.WaffleVisualization?.onUpdate) {
        // Fallback direto
        const currentConfig = { directLabelPosition: position };
        window.WaffleVisualization.onUpdate(currentConfig);
    }
}

function onShowLegendChange(show) {
    // ✅ INTEGRAÇÃO: Atualiza via sistema de template controls
    if (window.OddVizTemplateControls) {
        const currentState = window.OddVizTemplateControls.getState();
        currentState.showLegend = show;
        window.OddVizTemplateControls.triggerUpdate(currentState);
    } else if (window.WaffleVisualization?.onUpdate) {
        // Fallback direto
        const currentConfig = { showLegend: show };
        window.WaffleVisualization.onUpdate(currentConfig);
    }
}

// ==========================================================================
// CONFIGURAÇÃO DE CONTROLES - EXECUTA APENAS UMA VEZ
// ==========================================================================

function setupWaffleControls() {
    // ✅ PROTEÇÃO: Evita configurar controles múltiplas vezes
    if (window.WaffleControlsConfigured) return;
    window.WaffleControlsConfigured = true;
    
    console.log('🔧 Configurando controles específicos do Waffle...');
    
    // Controles de aparência do waffle
    const waffleControls = [
        'waffle-size',
        'waffle-gap', 
        'waffle-roundness',
        'waffle-animation',
        'waffle-hover-effect'
    ];
    
    let controlsConfigured = 0;
    
    waffleControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            const eventType = element.type === 'checkbox' ? 'change' : 'input';
            element.addEventListener(eventType, onWaffleControlsUpdate);
            controlsConfigured++;
            
            // Atualiza display de valores para ranges
            if (element.type === 'range') {
                const valueDisplay = document.getElementById(controlId + '-value');
                if (valueDisplay) {
                    element.addEventListener('input', (e) => {
                        valueDisplay.textContent = e.target.value + 'px';
                    });
                }
            }
        } else {
            console.warn(`⚠️ Controle não encontrado: ${controlId}`);
        }
    });
    
    console.log(`✅ ${controlsConfigured}/${waffleControls.length} controles do waffle configurados`);
    
    // Controle de posição da legenda direta
    const directLabelPositions = document.querySelectorAll('input[name="direct-label-position"]');
    directLabelPositions.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                console.log(`📍 Posição da legenda alterada: ${e.target.value}`);
                onDirectLabelPositionChange(e.target.value);
            }
        });
    });
    
    // Event listener para mostrar/ocultar rótulos
    const showLegendCheck = document.getElementById('show-legend');
    if (showLegendCheck) {
        showLegendCheck.addEventListener('change', (e) => {
            console.log(`👁️ Mostrar rótulos: ${e.target.checked}`);
            
            const legendOptions = document.getElementById('legend-options');
            if (legendOptions) {
                legendOptions.style.display = e.target.checked ? 'block' : 'none';
            }
            
            onShowLegendChange(e.target.checked);
        });
        
        // Dispara evento inicial para configurar estado
        showLegendCheck.dispatchEvent(new Event('change'));
    }
    
    // ✅ VERIFICA se template controls estão disponíveis
    setTimeout(() => {
        if (window.OddVizTemplateControls) {
            console.log('✅ Template Controls detectado e funcionando');
        } else {
            console.warn('⚠️ Template Controls não detectado - controles gerais podem não funcionar');
        }
    }, 200);
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

window.WaffleVizConfig = {
    config: VIZ_CONFIG,
    getSampleData,
    getDataRequirements,
    onWaffleControlsUpdate,
    onDirectLabelPositionChange,
    onShowLegendChange,
    setupWaffleControls
};

// ✅ EXPORTAÇÕES GLOBAIS PRINCIPAIS - SEM onDataLoaded duplicado
window.getSampleData = getSampleData;
window.getDataRequirements = getDataRequirements;

// ✅ CONFIGURAÇÃO ÚNICA - não executar se já foi configurado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupWaffleControls);
} else {
    setTimeout(setupWaffleControls, 50);
}
