/**
 * CONFIGURAÇÕES DO GRÁFICO DE WAFFLE - COM PALETA PERSONALIZADA CORRIGIDA
 * Versão que sincroniza cores customizadas com categorias dos dados
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
// VARIÁVEIS DE ESTADO DA PALETA PERSONALIZADA
// ==========================================================================

let currentCategories = [];
let currentCustomColors = [];
let isCustomPaletteActive = false;

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
    
    // ✅ NOVA LÓGICA: Detecta mudança nas categorias e atualiza paleta personalizada
    if (processedData.data && Array.isArray(processedData.data)) {
        const newCategories = processedData.data.map(d => d.categoria);
        
        // Verifica se as categorias mudaram
        const categoriesChanged = !arraysEqual(currentCategories, newCategories);
        
        if (categoriesChanged) {
            console.log('📊 Categorias mudaram, atualizando paleta personalizada');
            currentCategories = newCategories;
            
            // Se paleta custom está ativa, recria os controles
            if (isCustomPaletteActive) {
                setupWaffleCustomColors();
            }
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
// SISTEMA DE PALETA PERSONALIZADA CORRIGIDO
// ==========================================================================

/**
 * ✅ FUNÇÃO PRINCIPAL: Configura cores personalizadas baseadas nos dados atuais
 */
function setupWaffleCustomColors() {
    console.log('🎨 Configurando paleta personalizada do waffle...');
    
    // Usa categorias atuais ou dados de exemplo
    const categoriesToUse = currentCategories.length > 0 ? 
        currentCategories : 
        getSampleData().data.map(d => d.categoria);
    
    const numColors = categoriesToUse.length;
    
    if (numColors === 0) {
        console.warn('⚠️ Nenhuma categoria encontrada para configurar cores');
        return;
    }
    
    console.log(`🎨 Configurando ${numColors} cores para categorias:`, categoriesToUse);
    
    // Usa cores da paleta atual como padrão se não há cores customizadas
    let defaultColors = currentCustomColors;
    if (defaultColors.length === 0) {
        const currentPalette = window.OddVizTemplateControls?.getCurrentColorPalette() || 
                              ['#6F02FD', '#2C0165', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8'];
        defaultColors = currentPalette.slice(0, numColors);
    }
    
    // ✅ USA o sistema do Template Controls para criar inputs
    if (window.OddVizTemplateControls?.setupCustomColors) {
        window.OddVizTemplateControls.setupCustomColors(
            numColors, 
            onWaffleCustomColorsUpdate,
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
 * ✅ CALLBACK: Chamado quando cores customizadas mudam
 */
function onWaffleCustomColorsUpdate(customColors) {
    console.log('🎨 Cores personalizadas atualizadas:', customColors);
    
    // Salva as cores atuais
    currentCustomColors = customColors;
    
    // Aplica as cores na visualização
    if (window.WaffleVisualization?.updateCustomColors) {
        window.WaffleVisualization.updateCustomColors(customColors);
    }
}

/**
 * ✅ CALLBACK: Chamado quando paleta padrão é selecionada
 */
function onStandardPaletteSelected(paletteType) {
    console.log('🎨 Paleta padrão selecionada:', paletteType);
    
    // Marca que paleta custom não está mais ativa
    isCustomPaletteActive = false;
    
    // Limpa cores customizadas salvas
    currentCustomColors = [];
    
    // Notifica a visualização para usar paleta padrão
    if (window.WaffleVisualization?.updateColorPalette) {
        window.WaffleVisualization.updateColorPalette(paletteType);
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
    
    // ✅ SISTEMA DE PALETAS CORRIGIDO
    setupPaletteSystem();
    
    console.log('✅ Controles específicos do waffle configurados');
}

/**
 * ✅ NOVA FUNÇÃO: Configura sistema completo de paletas
 */
function setupPaletteSystem() {
    console.log('🎨 Configurando sistema de paletas...');
    
    // Detecta botões de paleta
    const paletteButtons = document.querySelectorAll('.color-option');
    
    paletteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const paletteType = button.getAttribute('data-palette');
            
            // Remove active de todos
            paletteButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adiciona active ao clicado
            button.classList.add('active');
            
            // Mostra/oculta seção de cores customizadas
            const customColorsSection = document.getElementById('custom-colors');
            if (customColorsSection) {
                customColorsSection.style.display = paletteType === 'custom' ? 'block' : 'none';
            }
            
            if (paletteType === 'custom') {
                // ✅ Configura paleta personalizada
                setTimeout(() => {
                    setupWaffleCustomColors();
                }, 100);
            } else {
                // ✅ Usa paleta padrão
                onStandardPaletteSelected(paletteType);
                
                // Atualiza estado do Template Controls
                if (window.OddVizTemplateControls?.updateState) {
                    window.OddVizTemplateControls.updateState('colorPalette', paletteType);
                }
            }
        });
    });
    
    console.log('✅ Sistema de paletas configurado');
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
 * ✅ FUNÇÃO PÚBLICA: Força configuração de paleta personalizada
 * Útil para chamar externamente quando dados mudam
 */
function refreshCustomPalette() {
    if (isCustomPaletteActive) {
        setupWaffleCustomColors();
    }
}

/**
 * ✅ FUNÇÃO PÚBLICA: Obtém cores atuais da paleta personalizada
 */
function getCurrentWaffleColors() {
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

window.WaffleVizConfig = {
    config: VIZ_CONFIG,
    getSampleData,
    getDataRequirements,
    onDataLoaded,
    onWaffleControlsUpdate,
    onDirectLabelPositionChange,
    onShowLegendChange,
    
    // ✅ NOVAS FUNÇÕES DA PALETA PERSONALIZADA
    setupWaffleCustomColors,
    onWaffleCustomColorsUpdate,
    onStandardPaletteSelected,
    refreshCustomPalette,
    getCurrentWaffleColors,
    
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
    }, 200);
}

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWaffleConfig);
} else {
    initializeWaffleConfig();
}
