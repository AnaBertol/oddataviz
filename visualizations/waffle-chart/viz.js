// ==========================================================================
// INICIALIZAÇÃO CORRIGIDA - REMOVE DUPLICAÇÕES
// ==========================================================================

function initVisualization() {
    if (typeof d3 === 'undefined') {
        console.error('D3.js não está carregado!');
        return;
    }
    
    // ✅ PROTEÇÃO: Evita inicialização múltipla
    if (window.WaffleInitialized) return;
    window.WaffleInitialized = true;
    
    // Define valores HTML corretos ANTES de qualquer inicialização
    setInitialHTMLValues();
    
    createBaseSVG();
    
    // ✅ ÚNICO PONTO DE CARREGAMENTO - só carrega se não há dados
    if (!vizCurrentData) {
        setTimeout(loadSampleData, 100);
    }
}

function loadSampleData() {
    if (window.getSampleData && typeof window.getSampleData === 'function') {
        const sampleData = window.getSampleData();
        if (sampleData?.data) {
            renderVisualization(sampleData.data, getDefaultConfig());
        }
    }
}

// ==========================================================================
// CALLBACKS EXTERNOS - ÚNICOS E LIMPOS
// ==========================================================================

function onUpdate(newConfig) {
    if (!vizCurrentData || vizCurrentData.length === 0) return;
    
    const mappedConfig = {
        width: 600, // Sempre 600px
        height: 600, // Sempre 600px
        title: newConfig.title || vizCurrentConfig.title,
        subtitle: newConfig.subtitle || vizCurrentConfig.subtitle,
        dataSource: newConfig.dataSource || vizCurrentConfig.dataSource,
        backgroundColor: newConfig.backgroundColor || vizCurrentConfig.backgroundColor,
        textColor: newConfig.textColor || vizCurrentConfig.textColor,
        fontFamily: newConfig.fontFamily || vizCurrentConfig.fontFamily,
        titleSize: newConfig.titleSize || vizCurrentConfig.titleSize,
        subtitleSize: newConfig.subtitleSize || vizCurrentConfig.subtitleSize,
        labelSize: newConfig.labelSize || vizCurrentConfig.labelSize,
        showLegend: newConfig.showLegend !== undefined ? newConfig.showLegend : vizCurrentConfig.showLegend,
        legendDirect: true,
        directLabelPosition: newConfig.directLabelPosition || vizCurrentConfig.directLabelPosition,
        colors: newConfig.colorPalette ? 
            (window.OddVizTemplateControls?.getCurrentColorPalette() || vizCurrentConfig.colors) : 
            vizCurrentConfig.colors
    };
    
    vizCurrentConfig = Object.assign({}, vizCurrentConfig, mappedConfig);
    renderVisualization(vizCurrentData, vizCurrentConfig);
}

function onDataLoaded(processedData) {
    if (processedData?.data) {
        renderVisualization(processedData.data, vizCurrentConfig || getDefaultConfig());
    }
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS - LIMPAS
// ==========================================================================

window.WaffleVisualization = {
    initVisualization: initVisualization,
    renderVisualization: renderVisualization,
    onUpdate: onUpdate,
    onWaffleControlUpdate: onWaffleControlsUpdate,
    onDataLoaded: onDataLoaded,
    WAFFLE_SETTINGS: WAFFLE_SETTINGS
};

// ✅ APENAS ESTA EXPORTAÇÃO - não duplicar
window.onDataLoaded = onDataLoaded;
// ✅ REMOVIDO: window.initVisualization (deixa só dentro do namespace)

// ==========================================================================
// AUTO-INICIALIZAÇÃO ÚNICA
// ==========================================================================

function waitForD3AndInit() {
    if (typeof d3 !== 'undefined' && document.readyState !== 'loading') {
        initVisualization();
    } else {
        setTimeout(waitForD3AndInit, 100);
    }
}

// ✅ CHAMA APENAS UMA VEZ
waitForD3AndInit();
