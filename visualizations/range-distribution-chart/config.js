/**
 * CONFIGURAÇÕES DO GRÁFICO DE FAIXAS DE DISTRIBUIÇÃO - VERSÃO ESTRUTURADA
 * Seguindo exatamente o padrão do waffle-chart
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DO RANGE CHART
// ==========================================================================

const VIZ_CONFIG = {
    type: 'range-distribution-chart',
    name: 'Gráfico de Faixas de Distribuição',
    description: 'Visualização que conecta percentuais de grupos a suas faixas correspondentes em uma escala',
    
    dataRequirements: {
        autoDetectStructure: true,
        requiredColumns: ['grupo', 'inicio', 'fim', 'percentual'],
        columnTypes: { 
            grupo: 'string', 
            inicio: 'number', 
            fim: 'number', 
            percentual: 'number' 
        },
        minRows: 2,
        maxRows: 15,
        minColumns: 4,
        maxColumns: 4,
        supportedValueTypes: ['number', 'percentage']
    },
    
    // Controles específicos do range chart
    specificControls: {
        barHeight: { min: 30, max: 80, default: 50, step: 5 },
        connectionStroke: { min: 1, max: 5, default: 2, step: 0.5 },
        showConnections: { default: true },
        connectionStyle: { default: 'dashed' }, // 'solid', 'dashed', 'fill'
        connectionOpacity: { min: 0.1, max: 1, default: 0.6, step: 0.1 },
        useLogScale: { default: false },
        openStartRange: { default: false },
        openEndRange: { default: false },
        showPercentValues: { default: true },
        showGroupLabels: { default: true },
        scaleName: { default: 'Faturamento (em milhares)' },
        // Novos controles de estilo da barra
        barRoundness: { min: 0, max: 15, default: 3, step: 1 },
        showBarOutline: { default: true }
    },
    
    layout: {
        fixedFormat: 'wide',
        fixedWidth: 800,
        fixedHeight: 600,
        margins: { top: 50, right: 50, bottom: 80, left: 50 }
    }
};

// ==========================================================================
// DADOS DE EXEMPLO
// ==========================================================================

function getSampleData() {
    return {
        data: [
            { grupo: 'Micro (0-100k)', inicio: 0, fim: 100, percentual: 24 },
            { grupo: 'Pequena I (100k-500k)', inicio: 100, fim: 500, percentual: 19 },
            { grupo: 'Pequena II (500k-1M)', inicio: 500, fim: 1000, percentual: 13 },
            { grupo: 'Média (1M-5M)', inicio: 1000, fim: 5000, percentual: 28 },
            { grupo: 'Grande I (5M-10M)', inicio: 5000, fim: 10000, percentual: 16 }
        ],
        columns: ['grupo', 'inicio', 'fim', 'percentual'],
        columnTypes: { grupo: 'string', inicio: 'number', fim: 'number', percentual: 'number' },
        rowCount: 5,
        source: 'example'
    };
}

// ==========================================================================
// VARIÁVEIS DE ESTADO DA PALETA PERSONALIZADA
// ==========================================================================

let currentGroups = [];
let currentCustomColors = [];
let isCustomPaletteActive = false;

// ==========================================================================
// FUNÇÕES DE INTERFACE
// ==========================================================================

function getDataRequirements() {
    return VIZ_CONFIG.dataRequirements;
}

function onDataLoaded(processedData) {
    if (processedData.data && processedData.data.length > 15) {
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(
                'Muitos grupos! Recomendamos até 15 para melhor visualização.', 
                'warn'
            );
        }
    }
    
    // Detecta mudança nos grupos e atualiza paleta personalizada
    if (processedData.data && Array.isArray(processedData.data)) {
        const newGroups = processedData.data.map(d => d.grupo);
        
        // Verifica se os grupos mudaram
        const groupsChanged = !arraysEqual(currentGroups, newGroups);
        
        if (groupsChanged) {
            console.log('📊 Grupos mudaram, atualizando paleta personalizada');
            currentGroups = newGroups;
            
            // Se paleta custom está ativa, recria os controles
            if (isCustomPaletteActive) {
                setupRangeCustomColors();
            }
        }
    }
    
    if (window.RangeVisualization?.onDataLoaded) {
        window.RangeVisualization.onDataLoaded(processedData);
    }
}

// ==========================================================================
// CONTROLES ESPECÍFICOS DO RANGE CHART
// ==========================================================================

function onRangeControlsUpdate() {
    const rangeControls = {
        barHeight: parseInt(document.getElementById('bar-height')?.value || VIZ_CONFIG.specificControls.barHeight.default),
        connectionStroke: parseFloat(document.getElementById('connection-stroke')?.value || VIZ_CONFIG.specificControls.connectionStroke.default),
        showConnections: document.getElementById('show-connections')?.checked !== false,
        connectionStyle: document.querySelector('input[name="connection-style"]:checked')?.value || VIZ_CONFIG.specificControls.connectionStyle.default,
        connectionOpacity: parseFloat(document.getElementById('connection-opacity')?.value || VIZ_CONFIG.specificControls.connectionOpacity.default),
        useLogScale: document.getElementById('use-log-scale')?.checked || false,
        openStartRange: document.getElementById('open-start-range')?.checked || false,
        openEndRange: document.getElementById('open-end-range')?.checked || false,
        showPercentValues: document.getElementById('show-percent-values')?.checked !== false,
        showGroupLabels: document.getElementById('show-group-labels')?.checked !== false,
        scaleName: document.getElementById('scale-name')?.value || VIZ_CONFIG.specificControls.scaleName.default,
        // Novos controles de estilo da barra
        barRoundness: parseInt(document.getElementById('bar-roundness')?.value || VIZ_CONFIG.specificControls.barRoundness.default),
        showBarOutline: document.getElementById('show-bar-outline')?.checked !== false
    };
    
    if (window.RangeVisualization?.onRangeControlsUpdate) {
        window.RangeVisualization.onRangeControlsUpdate(rangeControls);
    }
}

// ==========================================================================
// SISTEMA DE PALETA PERSONALIZADA
// ==========================================================================

/**
 * Configura cores personalizadas baseadas nos dados atuais
 */
function setupRangeCustomColors() {
    console.log('🎨 Configurando paleta personalizada do range chart...');
    
    // Usa grupos atuais ou dados de exemplo
    const groupsToUse = currentGroups.length > 0 ? 
        currentGroups : 
        getSampleData().data.map(d => d.grupo);
    
    const numColors = groupsToUse.length;
    
    if (numColors === 0) {
        console.warn('⚠️ Nenhum grupo encontrado para configurar cores');
        return;
    }
    
    console.log(`🎨 Configurando ${numColors} cores para grupos:`, groupsToUse);
    
    // Usa cores da paleta atual como padrão se não há cores customizadas
    let defaultColors = currentCustomColors;
    if (defaultColors.length === 0) {
        const currentPalette = window.OddVizTemplateControls?.getCurrentColorPalette() || 
                              ['#6F02FD', '#2C0165', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8'];
        defaultColors = currentPalette.slice(0, numColors);
        
        // Se precisa de mais cores, repete a paleta
        while (defaultColors.length < numColors) {
            defaultColors = defaultColors.concat(currentPalette);
        }
        defaultColors = defaultColors.slice(0, numColors);
    }
    
    // Usa o sistema do Template Controls para criar inputs
    if (window.OddVizTemplateControls?.setupCustomColors) {
        window.OddVizTemplateControls.setupCustomColors(
            numColors, 
            onRangeCustomColorsUpdate,
            defaultColors
        );
        
        // Marca que paleta custom está ativa
        isCustomPaletteActive = true;
        
        console.log('✅ Controles de paleta personalizada configurados');
    } else {
        console.error('❌ Template Controls não disponível');
    }
}

/**
 * Callback chamado quando cores customizadas mudam
 */
function onRangeCustomColorsUpdate(customColors) {
    console.log('🎨 Cores personalizadas atualizadas:', customColors);
    
    // Salva as cores atuais
    currentCustomColors = customColors;
    
    if (window.RangeVisualization?.updateCustomColors) {
        window.RangeVisualization.updateCustomColors(customColors);
    }
}

/**
 * Callback chamado quando paleta padrão é selecionada
 */
function onStandardPaletteSelected(paletteType) {
    console.log('🎨 Paleta padrão selecionada:', paletteType);
    
    // Marca que paleta custom não está mais ativa
    isCustomPaletteActive = false;
    
    // Limpa cores customizadas salvas
    currentCustomColors = [];
    
    if (window.RangeVisualization?.updateColorPalette) {
        window.RangeVisualization.updateColorPalette(paletteType);
    }
}

// ==========================================================================
// CONFIGURAÇÃO DE CONTROLES ESPECÍFICOS
// ==========================================================================

function setupRangeControls() {
    console.log('🎛️ Configurando controles específicos do range chart...');
    
    // Controles específicos do range chart
    const rangeControls = [
        'bar-height', 
        'connection-stroke',
        'show-connections',
        'connection-opacity',
        'use-log-scale',
        'open-start-range',
        'open-end-range',
        'show-percent-values',
        'show-group-labels',
        'scale-name',
        'bar-roundness',
        'show-bar-outline'
    ];
    
    rangeControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            const eventType = element.type === 'checkbox' ? 'change' : 
                             element.type === 'text' ? 'input' : 'input';
            element.addEventListener(eventType, onRangeControlsUpdate);
            
            // Atualiza display de valores para ranges
            if (element.type === 'range') {
                const valueDisplay = document.getElementById(controlId + '-value');
                if (valueDisplay) {
                    element.addEventListener('input', (e) => {
                        if (controlId === 'connection-opacity') {
                            valueDisplay.textContent = (parseFloat(e.target.value) * 100) + '%';
                        } else {
                            valueDisplay.textContent = e.target.value + 'px';
                        }
                    });
                }
            }
        }
    });
    
    // Event listeners para radio buttons do estilo de conexão
    const connectionStyleRadios = document.querySelectorAll('input[name="connection-style"]');
    connectionStyleRadios.forEach(radio => {
        radio.addEventListener('change', onRangeControlsUpdate);
    });
    
    // Sistema de paletas integrado com Template Controls
    setupPaletteSystem();
    
    console.log('✅ Controles específicos do range chart configurados');
}

/**
 * Sistema de paletas integrado com Template Controls
 */
function setupPaletteSystem() {
    console.log('🎨 Configurando integração com sistema de paletas do Template Controls...');
    
    // Detecta mudanças em TODAS as paletas
    const paletteButtons = document.querySelectorAll('.color-option');
    const customColorsSection = document.getElementById('custom-colors');
    
    paletteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const paletteType = button.getAttribute('data-palette');
            
            console.log('🎨 Paleta selecionada:', paletteType);
            
            // Remove active de todos e adiciona ao clicado
            paletteButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            if (paletteType === 'custom') {
                // Mostra seção ANTES de configurar cores
                if (customColorsSection) {
                    customColorsSection.style.display = 'block';
                    console.log('✅ Seção de cores customizadas mostrada');
                }
                
                // Pequeno delay para garantir que DOM atualizou
                setTimeout(() => {
                    setupRangeCustomColors();
                }, 50);
            } else {
                // Oculta seção de cores customizadas
                if (customColorsSection) {
                    customColorsSection.style.display = 'none';
                    console.log('✅ Seção de cores customizadas ocultada');
                }
                
                // Usa paleta padrão
                onStandardPaletteSelected(paletteType);
                
                // Atualiza estado do Template Controls
                if (window.OddVizTemplateControls?.updateState) {
                    window.OddVizTemplateControls.updateState('colorPalette', paletteType);
                }
            }
        });
    });
    
    console.log('✅ Sistema de paletas integrado');
}

// ==========================================================================
// UTILITÁRIOS
// ==========================================================================

/**
 * Compara duas arrays para verificar se são iguais
 */
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

/**
 * Força configuração de paleta personalizada
 */
function refreshCustomPalette() {
    if (isCustomPaletteActive) {
        setupRangeCustomColors();
    }
}

/**
 * Obtém cores atuais da paleta personalizada
 */
function getCurrentRangeColors() {
    if (isCustomPaletteActive && currentCustomColors.length > 0) {
        return currentCustomColors;
    }
    
    // Retorna paleta padrão do Template Controls
    return window.OddVizTemplateControls?.getCurrentColorPalette() || 
           ['#6F02FD', '#2C0165', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8'];
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

window.RangeVizConfig = {
    config: VIZ_CONFIG,
    getSampleData,
    getDataRequirements,
    onDataLoaded,
    onRangeControlsUpdate,
    
    // Funções da paleta personalizada
    setupRangeCustomColors,
    onRangeCustomColorsUpdate,
    onStandardPaletteSelected,
    refreshCustomPalette,
    getCurrentRangeColors,
    
    setupRangeControls
};

// Expõe funções principais globalmente
window.getSampleData = getSampleData;
window.getDataRequirements = getDataRequirements;
window.onDataLoaded = onDataLoaded;

// ==========================================================================
// INICIALIZAÇÃO ESPECÍFICA DO RANGE CHART
// ==========================================================================

function initializeRangeConfig() {
    console.log('⚙️ Inicializando configuração específica do range chart...');
    
    // Aguarda Template Controls estar pronto
    setTimeout(() => {
        setupRangeControls();
        console.log('✅ Configuração específica do range chart concluída');
    }, 200);
}

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeRangeConfig);
} else {
    initializeRangeConfig();
}