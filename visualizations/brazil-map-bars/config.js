/**
 * CONFIGURAÇÕES DO MAPA COROPLÉTICO BRASIL + BARRAS - VERSÃO CORRIGIDA
 * ✅ Sem duplicação de controles e integração completa com Template Controls
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DO MAPA BRASIL
// ==========================================================================

const VIZ_CONFIG = {
    type: 'brazil-map-bars',
    name: 'Mapa Coroplético Brasil + Gráfico de Barras',
    description: 'Visualização combinada de mapa coroplético do Brasil com gráfico de barras ordenado',
    
    // Detecção automática de estrutura de dados
    dataRequirements: {
        autoDetectStructure: true,
        firstColumnAsState: true,
        secondColumnAsValue: true,
        minRows: 5,
        maxRows: 27, // 26 estados + DF
        minColumns: 2,
        maxColumns: 2,
        supportedValueTypes: ['number', 'percentage'],
        requiredStateColumn: true
    },
    
    // ✅ APENAS controles específicos do mapa (sem duplicação)
    specificControls: {
        scaleType: { default: 'continuous' },
        scaleDivisions: { min: 3, max: 10, default: 5, step: 1 },
        paletteType: { default: 'sequential' },
        colorMin: { default: '#E8F4FD' },
        colorMax: { default: '#2C0165' },
        colorLow: { default: '#6F02FD' },
        colorMid: { default: '#FAF9FA' },
        colorHigh: { default: '#6CDADE' },
        divergingMidValue: { default: 50 },
        noDataColor: { default: '#E0E0E0' }, // ✅ APENAS UMA INSTÂNCIA
        mapStrokeWidth: { min: 0.5, max: 3, default: 1, step: 0.5 },
        mapStrokeColor: { default: '#FFFFFF' },
        barOpacity: { min: 0.3, max: 1, default: 0.8, step: 0.1 },
        showStateLabels: { default: true },
        showBarValues: { default: true }
    },
    
    layout: {
        fixedFormat: 'wide',
        fixedWidth: 800,  // ✅ CORREÇÃO: Largura total ajustada
        fixedHeight: 600,
        margins: { top: 60, right: 60, bottom: 80, left: 60 }
    }
};

// ==========================================================================
// MAPEAMENTO DE ESTADOS BRASILEIROS
// ==========================================================================

const STATE_MAPPING = {
    // Nomes completos para siglas
    'acre': 'AC',
    'alagoas': 'AL',
    'amapá': 'AP',
    'amazonas': 'AM',
    'bahia': 'BA',
    'ceará': 'CE',
    'distrito federal': 'DF',
    'espírito santo': 'ES',
    'goiás': 'GO',
    'maranhão': 'MA',
    'mato grosso': 'MT',
    'mato grosso do sul': 'MS',
    'minas gerais': 'MG',
    'pará': 'PA',
    'paraíba': 'PB',
    'paraná': 'PR',
    'pernambuco': 'PE',
    'piauí': 'PI',
    'rio de janeiro': 'RJ',
    'rio grande do norte': 'RN',
    'rio grande do sul': 'RS',
    'rondônia': 'RO',
    'roraima': 'RR',
    'santa catarina': 'SC',
    'são paulo': 'SP',
    'sergipe': 'SE',
    'tocantins': 'TO'
};

const STATE_NAMES = {
    'AC': 'Acre',
    'AL': 'Alagoas',
    'AP': 'Amapá',
    'AM': 'Amazonas',
    'BA': 'Bahia',
    'CE': 'Ceará',
    'DF': 'Distrito Federal',
    'ES': 'Espírito Santo',
    'GO': 'Goiás',
    'MA': 'Maranhão',
    'MT': 'Mato Grosso',
    'MS': 'Mato Grosso do Sul',
    'MG': 'Minas Gerais',
    'PA': 'Pará',
    'PB': 'Paraíba',
    'PR': 'Paraná',
    'PE': 'Pernambuco',
    'PI': 'Piauí',
    'RJ': 'Rio de Janeiro',
    'RN': 'Rio Grande do Norte',
    'RS': 'Rio Grande do Sul',
    'RO': 'Rondônia',
    'RR': 'Roraima',
    'SC': 'Santa Catarina',
    'SP': 'São Paulo',
    'SE': 'Sergipe',
    'TO': 'Tocantins'
};

// ==========================================================================
// DADOS DE EXEMPLO
// ==========================================================================

function getSampleData() {
    return {
        data: [
            { estado: 'SP', valor: 89.5 },
            { estado: 'RJ', valor: 84.2 },
            { estado: 'MG', valor: 76.8 },
            { estado: 'BA', valor: 71.3 },
            { estado: 'PR', valor: 68.7 },
            { estado: 'RS', valor: 65.9 },
            { estado: 'PE', valor: 62.4 },
            { estado: 'CE', valor: 59.1 },
            { estado: 'PA', valor: 56.3 },
            { estado: 'SC', valor: 53.8 },
            { estado: 'GO', valor: 51.2 },
            { estado: 'MA', valor: 48.7 },
            { estado: 'ES', valor: 46.1 },
            { estado: 'PB', valor: 43.9 },
            { estado: 'RN', valor: 41.4 },
            { estado: 'AL', valor: 38.8 },
            { estado: 'PI', valor: 36.5 },
            { estado: 'DF', valor: 34.2 },
            { estado: 'MS', valor: 31.7 },
            { estado: 'MT', valor: 29.3 },
            { estado: 'RO', valor: 26.8 },
            { estado: 'AC', valor: 24.5 },
            { estado: 'AP', valor: 22.1 },
            { estado: 'RR', valor: 19.7 },
            { estado: 'TO', valor: 17.4 },
            { estado: 'AM', valor: 15.2 },
            { estado: 'SE', valor: 12.6 }
        ],
        columns: ['estado', 'valor'],
        columnTypes: { estado: 'string', valor: 'number' },
        rowCount: 27,
        source: 'example'
    };
}

// ==========================================================================
// VARIÁVEIS DE ESTADO ESPECÍFICAS
// ==========================================================================

let currentBrazilMapConfig = {
    scaleType: VIZ_CONFIG.specificControls.scaleType.default,
    scaleDivisions: VIZ_CONFIG.specificControls.scaleDivisions.default,
    paletteType: VIZ_CONFIG.specificControls.paletteType.default,
    colorMin: VIZ_CONFIG.specificControls.colorMin.default,
    colorMax: VIZ_CONFIG.specificControls.colorMax.default,
    colorLow: VIZ_CONFIG.specificControls.colorLow.default,
    colorMid: VIZ_CONFIG.specificControls.colorMid.default,
    colorHigh: VIZ_CONFIG.specificControls.colorHigh.default,
    divergingMidValue: VIZ_CONFIG.specificControls.divergingMidValue.default,
    noDataColor: VIZ_CONFIG.specificControls.noDataColor.default,
    mapStrokeWidth: VIZ_CONFIG.specificControls.mapStrokeWidth.default,
    mapStrokeColor: VIZ_CONFIG.specificControls.mapStrokeColor.default,
    barOpacity: VIZ_CONFIG.specificControls.barOpacity.default,
    showStateLabels: VIZ_CONFIG.specificControls.showStateLabels.default,
    showBarValues: VIZ_CONFIG.specificControls.showBarValues.default
};

// ==========================================================================
// FUNÇÕES DE INTERFACE
// ==========================================================================

function getDataRequirements() {
    return VIZ_CONFIG.dataRequirements;
}

function onDataLoaded(processedData) {
    if (processedData.data && processedData.data.length > 27) {
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(
                'Muitos estados! Verifique se os dados estão corretos.', 
                'warn'
            );
        }
    }
    
    if (window.BrazilMapVisualization?.onDataLoaded) {
        window.BrazilMapVisualization.onDataLoaded(processedData);
    }
}

// ==========================================================================
// CONTROLES ESPECÍFICOS DO MAPA BRASIL
// ==========================================================================

function onBrazilMapControlsUpdate() {
    const brazilMapControls = {
        scaleType: document.querySelector('input[name="scale-type"]:checked')?.value || currentBrazilMapConfig.scaleType,
        scaleDivisions: parseInt(document.getElementById('scale-divisions')?.value || currentBrazilMapConfig.scaleDivisions),
        paletteType: document.querySelector('input[name="palette-type"]:checked')?.value || currentBrazilMapConfig.paletteType,
        colorMin: document.getElementById('color-min')?.value || currentBrazilMapConfig.colorMin,
        colorMax: document.getElementById('color-max')?.value || currentBrazilMapConfig.colorMax,
        colorLow: document.getElementById('color-low')?.value || currentBrazilMapConfig.colorLow,
        colorMid: document.getElementById('color-mid')?.value || currentBrazilMapConfig.colorMid,
        colorHigh: document.getElementById('color-high')?.value || currentBrazilMapConfig.colorHigh,
        divergingMidValue: parseFloat(document.getElementById('diverging-mid-value')?.value || currentBrazilMapConfig.divergingMidValue),
        noDataColor: document.getElementById('no-data-color')?.value || currentBrazilMapConfig.noDataColor,
        mapStrokeWidth: parseFloat(document.getElementById('map-stroke-width')?.value || currentBrazilMapConfig.mapStrokeWidth),
        mapStrokeColor: document.getElementById('map-stroke-color')?.value || currentBrazilMapConfig.mapStrokeColor,
        barOpacity: parseFloat(document.getElementById('bar-opacity')?.value || currentBrazilMapConfig.barOpacity),
        showStateLabels: document.getElementById('show-state-labels')?.checked !== false,
        showBarValues: document.getElementById('show-bar-values')?.checked !== false
    };
    
    // Atualiza estado local
    Object.assign(currentBrazilMapConfig, brazilMapControls);
    
    if (window.BrazilMapVisualization?.onBrazilMapControlUpdate) {
        window.BrazilMapVisualization.onBrazilMapControlUpdate(brazilMapControls);
    }
}

// ==========================================================================
// FUNÇÕES AUXILIARES PARA ESTADOS
// ==========================================================================

function normalizeStateName(stateName) {
    if (!stateName || typeof stateName !== 'string') return null;
    
    const normalized = stateName.toLowerCase().trim();
    
    // Se já é uma sigla válida
    if (stateName.length === 2 && STATE_NAMES[stateName.toUpperCase()]) {
        return stateName.toUpperCase();
    }
    
    // Se é nome completo
    if (STATE_MAPPING[normalized]) {
        return STATE_MAPPING[normalized];
    }
    
    // Tenta match parcial
    for (const [fullName, code] of Object.entries(STATE_MAPPING)) {
        if (fullName.includes(normalized) || normalized.includes(fullName)) {
            return code;
        }
    }
    
    return null;
}

function getStateFullName(stateCode) {
    return STATE_NAMES[stateCode] || stateCode;
}

function formatValue(value) {
    if (typeof value !== 'number') return value;
    
    if (value >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
}

// ==========================================================================
// CONFIGURAÇÃO DE CONTROLES ESPECÍFICOS
// ==========================================================================

function setupBrazilMapControls() {
    console.log('🎛️ Configurando controles específicos do mapa Brasil...');
    
    // Controles de escala
    const scaleTypeRadios = document.querySelectorAll('input[name="scale-type"]');
    scaleTypeRadios.forEach(radio => {
        radio.addEventListener('change', onBrazilMapControlsUpdate);
    });
    
    const scaleDivisionsSlider = document.getElementById('scale-divisions');
    if (scaleDivisionsSlider) {
        scaleDivisionsSlider.addEventListener('input', onBrazilMapControlsUpdate);
    }
    
    // Controles de paleta
    const paletteTypeRadios = document.querySelectorAll('input[name="palette-type"]');
    paletteTypeRadios.forEach(radio => {
        radio.addEventListener('change', onBrazilMapControlsUpdate);
    });
    
    // Controles de cores
    const colorControls = [
        'color-min', 'color-max', 'color-low', 'color-mid', 'color-high',
        'map-stroke-color', 'no-data-color'
    ];
    
    colorControls.forEach(controlId => {
        const colorInput = document.getElementById(controlId);
        const textInput = document.getElementById(controlId + '-text');
        
        if (colorInput) {
            colorInput.addEventListener('input', onBrazilMapControlsUpdate);
        }
        if (textInput) {
            textInput.addEventListener('input', onBrazilMapControlsUpdate);
        }
    });
    
    // Controle de valor médio divergente
    const divergingMidValueInput = document.getElementById('diverging-mid-value');
    if (divergingMidValueInput) {
        divergingMidValueInput.addEventListener('input', onBrazilMapControlsUpdate);
    }
    
    // Controles de aparência
    const appearanceControls = [
        'map-stroke-width',
        'bar-opacity'
    ];
    
    appearanceControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            element.addEventListener('input', onBrazilMapControlsUpdate);
        }
    });
    
    // Controles de checkbox
    const checkboxControls = [
        'show-state-labels',
        'show-bar-values'
    ];
    
    checkboxControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            element.addEventListener('change', onBrazilMapControlsUpdate);
        }
    });
    
    console.log('✅ Controles específicos do mapa Brasil configurados');
}

// ==========================================================================
// SINCRONIZAÇÃO INICIAL COM TEMPLATE CONTROLS
// ==========================================================================

function syncSpecificControlsIfNeeded() {
    console.log('🔄 Verificando se sincronização específica é necessária...');
    
    // Sincroniza valores padrão apenas se necessário
    const controls = [
        { id: 'scale-divisions', value: currentBrazilMapConfig.scaleDivisions },
        { id: 'color-min', value: currentBrazilMapConfig.colorMin },
        { id: 'color-max', value: currentBrazilMapConfig.colorMax },
        { id: 'color-low', value: currentBrazilMapConfig.colorLow },
        { id: 'color-mid', value: currentBrazilMapConfig.colorMid },
        { id: 'color-high', value: currentBrazilMapConfig.colorHigh },
        { id: 'diverging-mid-value', value: currentBrazilMapConfig.divergingMidValue },
        { id: 'no-data-color', value: currentBrazilMapConfig.noDataColor },
        { id: 'map-stroke-width', value: currentBrazilMapConfig.mapStrokeWidth },
        { id: 'map-stroke-color', value: currentBrazilMapConfig.mapStrokeColor },
        { id: 'bar-opacity', value: currentBrazilMapConfig.barOpacity }
    ];
    
    controls.forEach(({ id, value }) => {
        const element = document.getElementById(id);
        if (element && (!element.value || element.value === element.defaultValue)) {
            element.value = value;
            
            // Sincroniza input de texto correspondente
            const textInput = document.getElementById(id + '-text');
            if (textInput) {
                textInput.value = value;
            }
        }
    });
    
    console.log('✅ Sincronização específica concluída (não-intrusiva)');
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

window.BrazilMapVizConfig = {
    config: VIZ_CONFIG,
    getSampleData,
    getDataRequirements,
    onDataLoaded,
    onBrazilMapControlsUpdate,
    setupBrazilMapControls,
    syncSpecificControlsIfNeeded,
    
    // Funções auxiliares
    normalizeStateName,
    getStateFullName,
    formatValue,
    
    // Dados de mapeamento
    STATE_MAPPING,
    STATE_NAMES,
    
    // Estado atual
    get currentConfig() { return currentBrazilMapConfig; }
};

// Expõe funções principais globalmente
window.getSampleData = getSampleData;
window.getDataRequirements = getDataRequirements;
window.onDataLoaded = onDataLoaded;

// ==========================================================================
// INICIALIZAÇÃO ESPECÍFICA DO MAPA BRASIL
// ==========================================================================

function initializeBrazilMapConfig() {
    console.log('⚙️ Inicializando configuração específica do mapa Brasil...');
    
    // Aguarda Template Controls estar pronto
    setTimeout(() => {
        syncSpecificControlsIfNeeded();
        setupBrazilMapControls();
        console.log('✅ Configuração específica do mapa Brasil concluída');
    }, 300);
}

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBrazilMapConfig);
} else {
    initializeBrazilMapConfig();
}