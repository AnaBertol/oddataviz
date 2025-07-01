/**
 * CONFIGURAÇÕES DA MATRIZ DE BOLHAS - VERSÃO CORRIGIDA SEGUINDO PADRÃO WAFFLE
 * ✅ Sistema de cores customizadas totalmente integrado com Template Controls
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

const VIZ_CONFIG = {
    type: 'bubble-matrix',
    name: 'Matriz de Bolhas',
    description: 'Matriz onde células são círculos com área proporcional ao valor, normalizada por coluna',
    
    dataRequirements: {
        autoDetectStructure: true,
        firstColumnAsCategory: true,
        remainingColumnsAsMetrics: true,
        minRows: 3,
        maxRows: 15,
        minColumns: 3, // 1 categoria + pelo menos 2 métricas
        maxColumns: 8  // 1 categoria + até 7 métricas
    },
    
    // Controles específicos da matriz de bolhas
    specificControls: {
        minBubbleSize: { min: 8, max: 25, default: 12, step: 1 },
        maxBubbleSize: { min: 30, max: 80, default: 50, step: 2 },
        cellWidth: { min: 80, max: 150, default: 120, step: 5 },
        cellHeight: { min: 60, max: 120, default: 80, step: 5 },
        bubbleOpacity: { min: 0.6, max: 1.0, default: 0.9, step: 0.05 },
        strokeWidth: { min: 0.5, max: 3, default: 1, step: 0.5 },
        bubbleStroke: { default: true },
        
        sortBy: { default: 'original' },
        sortOrder: { default: 'desc' },
        colorMode: { options: ['by-column', 'by-row', 'single'], default: 'by-column' },
        
        // Controles de exibição (integrados com Template Controls)
        showColumnHeaders: { default: true },
        showRowLabels: { default: true },
        showValues: { default: true }
    },
    
    layout: {
        fixedFormat: 'wide',
        fixedWidth: 800,  // ✅ Largura correta para formato panorâmico
        fixedHeight: 600, // ✅ Altura padrão
        margins: { top: 60, right: 60, bottom: 60, left: 60 }
    },
    
    colorSettings: {
        defaultPalette: 'odd',
        byColumnColors: ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'],
        byRowColors: ['#6F02FD', '#2C0165', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8'],
        singleColor: '#6F02FD'
    }
};

// ==========================================================================
// DADOS DE EXEMPLO GENÉRICOS
// ==========================================================================

function getSampleData() {
    return {
        data: [
            { categoria: 'Categoria A', metrica_1: 89.5, metrica_2: 67.2, metrica_3: 234.8, metrica_4: 45.1 },
            { categoria: 'Categoria B', metrica_1: 72.3, metrica_2: 89.1, metrica_3: 156.4, metrica_4: 67.8 },
            { categoria: 'Categoria C', metrica_1: 156.7, metrica_2: 34.5, metrica_3: 98.2, metrica_4: 23.9 },
            { categoria: 'Categoria D', metrica_1: 45.2, metrica_2: 78.9, metrica_3: 67.1, metrica_4: 34.5 },
            { categoria: 'Categoria E', metrica_1: 123.4, metrica_2: 45.6, metrica_3: 189.3, metrica_4: 12.7 },
            { categoria: 'Categoria F', metrica_1: 67.8, metrica_2: 92.3, metrica_3: 78.5, metrica_4: 56.2 }
        ],
        columns: ['categoria', 'metrica_1', 'metrica_2', 'metrica_3', 'metrica_4'],
        columnTypes: {
            categoria: 'string',
            metrica_1: 'number',
            metrica_2: 'number', 
            metrica_3: 'number',
            metrica_4: 'number'
        },
        rowCount: 6,
        source: 'example',
        mode: 'bubble-matrix'
    };
}

// ==========================================================================
// VARIÁVEIS DE ESTADO DA PALETA PERSONALIZADA - SEGUINDO PADRÃO WAFFLE
// ==========================================================================

let currentCategories = [];
let currentCustomColors = [];
let isCustomPaletteActive = false;

// ==========================================================================
// INTEGRAÇÃO COM TEMPLATE CONTROLS
// ==========================================================================

function getDataRequirements() {
    return VIZ_CONFIG.dataRequirements;
}

function validateDataStructure(processedData) {
    if (!processedData || !processedData.data || !Array.isArray(processedData.data)) {
        return { isValid: false, message: 'Dados não encontrados ou formato inválido.' };
    }
    
    const data = processedData.data;
    if (data.length < 3) {
        return { isValid: false, message: 'São necessárias pelo menos 3 linhas de dados.' };
    }
    
    const firstRow = data[0];
    const columns = Object.keys(firstRow);
    
    if (columns.length < 3) {
        return { isValid: false, message: 'São necessárias pelo menos 3 colunas (1 categoria + 2 métricas).' };
    }
    
    if (columns.length > 8) {
        return { isValid: false, message: 'Máximo de 8 colunas suportadas (1 categoria + 7 métricas).' };
    }
    
    // Primeira coluna deve ser string (categoria)
    const categoryColumn = columns[0];
    const categoryValue = firstRow[categoryColumn];
    if (typeof categoryValue !== 'string') {
        return { isValid: false, message: 'Primeira coluna deve conter categorias (texto).' };
    }
    
    // Demais colunas devem ser numéricas
    for (let i = 1; i < columns.length; i++) {
        const metricColumn = columns[i];
        const metricValue = firstRow[metricColumn];
        if (typeof metricValue !== 'number' || isNaN(metricValue)) {
            return { 
                isValid: false, 
                message: `Coluna '${metricColumn}' deve conter valores numéricos.` 
            };
        }
    }
    
    return { isValid: true, message: 'Estrutura de dados válida.' };
}

function onDataLoaded(processedData) {
    // Validação automática
    const validationResult = validateDataStructure(processedData);
    
    if (!validationResult.isValid) {
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(validationResult.message, 'error');
        }
        return;
    }
    
    // Avisos para datasets muito grandes
    if (processedData.data && processedData.data.length > 15) {
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(
                'Dataset grande! Recomendamos até 15 categorias para melhor visualização.', 
                'warn'
            );
        }
    }
    
    // ✅ CORREÇÃO 1: DETECTA mudança nas categorias e atualiza paleta personalizada
    if (processedData.data && Array.isArray(processedData.data)) {
        const newCategories = processedData.data.map(d => d.categoria);
        
        // Verifica se as categorias mudaram
        const categoriesChanged = !arraysEqual(currentCategories, newCategories);
        
        if (categoriesChanged) {
            console.log('📊 Categorias mudaram, atualizando paleta personalizada');
            currentCategories = newCategories;
            
            // Se paleta custom está ativa, recria os controles
            if (isCustomPaletteActive) {
                setupBubbleMatrixCustomColors();
            }
        }
    }
    
    if (window.BubbleMatrixVisualization?.onDataLoaded) {
        window.BubbleMatrixVisualization.onDataLoaded(processedData);
    }
}

// ==========================================================================
// CONTROLES ESPECÍFICOS DA MATRIZ DE BOLHAS
// ==========================================================================

function onBubbleMatrixControlsUpdate() {
    // Coleta configurações específicas da matriz de bolhas
    const bubbleControls = {
        minBubbleSize: parseInt(document.getElementById('min-bubble-size')?.value || VIZ_CONFIG.specificControls.minBubbleSize.default),
        maxBubbleSize: parseInt(document.getElementById('max-bubble-size')?.value || VIZ_CONFIG.specificControls.maxBubbleSize.default),
        cellWidth: parseInt(document.getElementById('cell-width')?.value || VIZ_CONFIG.specificControls.cellWidth.default),
        cellHeight: parseInt(document.getElementById('cell-height')?.value || VIZ_CONFIG.specificControls.cellHeight.default),
        bubbleOpacity: parseFloat(document.getElementById('bubble-opacity')?.value || VIZ_CONFIG.specificControls.bubbleOpacity.default),
        strokeWidth: parseFloat(document.getElementById('stroke-width')?.value || VIZ_CONFIG.specificControls.strokeWidth.default),
        bubbleStroke: document.getElementById('bubble-stroke')?.checked !== false,
        sortBy: document.getElementById('sort-by')?.value || VIZ_CONFIG.specificControls.sortBy.default,
        sortOrder: document.getElementById('sort-order')?.value || VIZ_CONFIG.specificControls.sortOrder.default,
        colorMode: document.querySelector('input[name="color-mode"]:checked')?.value || VIZ_CONFIG.specificControls.colorMode.default
    };
    
    console.log('🫧 Controles da matriz de bolhas atualizados:', bubbleControls);
    
    // Força re-renderização mantendo configuração atual
    if (window.BubbleMatrixVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        window.BubbleMatrixVisualization.onUpdate(currentConfig);
    }
}

// ==========================================================================
// SISTEMA DE PALETA PERSONALIZADA - SEGUINDO PADRÃO WAFFLE
// ==========================================================================

/**
 * ✅ FUNÇÃO PRINCIPAL: Configura cores personalizadas baseadas nos dados atuais
 */
function setupBubbleMatrixCustomColors() {
    console.log('🎨 Configurando paleta personalizada da matriz de bolhas...');
    
    // Determina quantas cores são necessárias baseado no modo de coloração
    const colorMode = document.querySelector('input[name="color-mode"]:checked')?.value || 'by-column';
    
    let numColors;
    if (colorMode === 'by-column') {
        // Uma cor para cada métrica (colunas menos a categoria)
        numColors = Math.max(4, (currentCategories.length > 0 ? 4 : 4)); // Padrão: 4 métricas
    } else if (colorMode === 'by-row') {
        // Uma cor para cada categoria
        numColors = currentCategories.length > 0 ? currentCategories.length : 6; // Padrão: 6 categorias
    } else {
        // Modo single: apenas 1 cor
        numColors = 1;
    }
    
    console.log(`🎨 Configurando ${numColors} cores para modo: ${colorMode}`);
    
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
            onBubbleMatrixCustomColorsUpdate,
            defaultColors
        );
        
        // Marca que paleta custom está ativa
        isCustomPaletteActive = true;
        
        console.log('✅ Controles de paleta personalizada da matriz configurados');
    } else {
        console.error('❌ Template Controls não disponível para paleta personalizada');
    }
}

/**
 * ✅ CALLBACK: Chamado quando cores customizadas mudam
 */
function onBubbleMatrixCustomColorsUpdate(customColors) {
    console.log('🎨 Cores personalizadas da matriz atualizadas:', customColors);
    
    // Salva as cores atuais
    currentCustomColors = customColors;
    
    // Atualiza visualização com novas cores
    if (window.BubbleMatrixVisualization?.updateCustomColors) {
        window.BubbleMatrixVisualization.updateCustomColors(customColors);
    }
}

/**
 * ✅ CALLBACK: Chamado quando paleta padrão é selecionada
 */
function onStandardPaletteSelected(paletteType) {
    console.log('🎨 Paleta padrão da matriz selecionada:', paletteType);
    
    // Marca que paleta custom não está mais ativa
    isCustomPaletteActive = false;
    
    // Limpa cores customizadas salvas
    currentCustomColors = [];
    
    // Atualiza visualização com nova paleta
    if (window.BubbleMatrixVisualization?.updateColorPalette) {
        window.BubbleMatrixVisualization.updateColorPalette(paletteType);
    }
}

// ==========================================================================
// CONFIGURAÇÃO DE CONTROLES
// ==========================================================================

function setupBubbleMatrixControls() {
    console.log('🫧 Configurando controles da matriz de bolhas...');
    
    // Controles de tamanho e espaçamento
    const rangeControls = [
        'min-bubble-size', 'max-bubble-size', 'cell-width', 
        'cell-height', 'bubble-opacity', 'stroke-width'
    ];
    
    rangeControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            element.addEventListener('input', onBubbleMatrixControlsUpdate);
            
            // Atualiza display de valores
            const valueDisplay = document.getElementById(controlId + '-value');
            if (valueDisplay) {
                element.addEventListener('input', (e) => {
                    let unit = 'px';
                    if (controlId.includes('opacity')) unit = '';
                    valueDisplay.textContent = e.target.value + unit;
                });
            }
        }
    });
    
    // Controle de contorno
    const strokeControl = document.getElementById('bubble-stroke');
    if (strokeControl) {
        strokeControl.addEventListener('change', onBubbleMatrixControlsUpdate);
    }
    
    // Controles de ordenação
    const sortControls = ['sort-by', 'sort-order'];
    sortControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            element.addEventListener('change', onBubbleMatrixControlsUpdate);
        }
    });
    
    // ✅ CORREÇÃO 2: Controles de modo de cor INTEGRADOS COM PALETA PERSONALIZADA
    const colorModeRadios = document.querySelectorAll('input[name="color-mode"]');
    colorModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                console.log('🎨 Modo de cor alterado para:', e.target.value);
                
                // Se modo mudou E paleta custom está ativa, recria controles
                if (isCustomPaletteActive) {
                    console.log('🎨 Recriando controles de cores personalizadas...');
                    setTimeout(() => {
                        setupBubbleMatrixCustomColors();
                    }, 100);
                }
                
                // Atualiza visualização
                onBubbleMatrixControlsUpdate();
            }
        });
    });
    
    // Controles de exibição - integrados com Template Controls
    const displayControls = [
        { id: 'show-column-headers', handler: onShowColumnHeadersChange },
        { id: 'show-row-labels', handler: onShowRowLabelsChange },
        { id: 'show-values', handler: onShowValuesChange }
    ];
    
    displayControls.forEach(({ id, handler }) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', (e) => {
                handler(e.target.checked);
            });
        }
    });
    
    // ✅ CORREÇÃO 3: SISTEMA DE PALETAS INTEGRADO COM TEMPLATE CONTROLS
    setupPaletteSystem();
    
    console.log('✅ Controles da matriz de bolhas configurados');
}

// Callbacks para controles de exibição - CORRIGIDOS PARA ESTABILIDADE
function onShowColumnHeadersChange(show) {
    console.log('🔄 Alterando exibição de cabeçalhos:', show);
    
    // ✅ NÃO força novo render completo, apenas atualiza elemento específico
    if (window.BubbleMatrixVisualization?.vizCurrentData && window.BubbleMatrixVisualization.vizCurrentData.length > 0) {
        // Re-renderiza apenas os headers mantendo configuração atual
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        currentConfig.showColumnHeaders = show;
        
        // Força atualização sem recalcular layout
        window.BubbleMatrixVisualization.onUpdate(currentConfig);
    }
}

function onShowRowLabelsChange(show) {
    console.log('🔄 Alterando exibição de rótulos de linha:', show);
    
    // ✅ NÃO força novo render completo, apenas atualiza elemento específico
    if (window.BubbleMatrixVisualization?.vizCurrentData && window.BubbleMatrixVisualization.vizCurrentData.length > 0) {
        // Re-renderiza apenas os rótulos mantendo configuração atual
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        currentConfig.showRowLabels = show;
        
        // Força atualização sem recalcular layout
        window.BubbleMatrixVisualization.onUpdate(currentConfig);
    }
}

function onShowValuesChange(show) {
    console.log('🔄 Alterando exibição de valores:', show);
    
    // ✅ NÃO força novo render completo, apenas atualiza elemento específico
    if (window.BubbleMatrixVisualization?.vizCurrentData && window.BubbleMatrixVisualization.vizCurrentData.length > 0) {
        // Re-renderiza apenas os valores mantendo configuração atual
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        currentConfig.showValues = show;
        
        // Força atualização sem recalcular layout
        window.BubbleMatrixVisualization.onUpdate(currentConfig);
    }
}

/**
 * ✅ SISTEMA DE PALETAS INTEGRADO COM TEMPLATE CONTROLS - SEGUINDO PADRÃO WAFFLE
 */
function setupPaletteSystem() {
    console.log('🎨 Configurando integração com sistema de paletas do Template Controls...');
    
    // ✅ DETECTA mudanças em TODAS as paletas
    const paletteButtons = document.querySelectorAll('.color-option');
    const customColorsSection = document.getElementById('custom-colors');
    
    paletteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const paletteType = button.getAttribute('data-palette');
            
            console.log('🎨 Paleta da matriz selecionada:', paletteType);
            
            // Remove active de todos e adiciona ao clicado
            paletteButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            if (paletteType === 'custom') {
                // ✅ CORREÇÃO: Mostra seção ANTES de configurar cores
                if (customColorsSection) {
                    customColorsSection.style.display = 'block';
                    console.log('✅ Seção de cores customizadas da matriz mostrada');
                }
                
                // ✅ Pequeno delay para garantir que DOM atualizou
                setTimeout(() => {
                    setupBubbleMatrixCustomColors();
                }, 50);
            } else {
                // ✅ Oculta seção de cores customizadas
                if (customColorsSection) {
                    customColorsSection.style.display = 'none';
                    console.log('✅ Seção de cores customizadas da matriz ocultada');
                }
                
                // ✅ Usa paleta padrão
                onStandardPaletteSelected(paletteType);
                
                // Atualiza estado do Template Controls
                if (window.OddVizTemplateControls?.updateState) {
                    window.OddVizTemplateControls.updateState('colorPalette', paletteType);
                }
            }
        });
    });
    
    console.log('✅ Sistema de paletas da matriz integrado');
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
 */
function refreshCustomPalette() {
    if (isCustomPaletteActive) {
        setupBubbleMatrixCustomColors();
    }
}

/**
 * ✅ FUNÇÃO PÚBLICA: Obtém cores atuais da paleta personalizada
 */
function getCurrentBubbleMatrixColors() {
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

window.BubbleMatrixVizConfig = {
    config: VIZ_CONFIG,
    getSampleData,
    getDataRequirements,
    onDataLoaded,
    onBubbleMatrixControlsUpdate,
    onShowColumnHeadersChange,
    onShowRowLabelsChange,
    onShowValuesChange,
    
    // ✅ FUNÇÕES DA PALETA PERSONALIZADA
    setupBubbleMatrixCustomColors,
    onBubbleMatrixCustomColorsUpdate,
    onStandardPaletteSelected,
    refreshCustomPalette,
    getCurrentBubbleMatrixColors,
    
    setupBubbleMatrixControls
};

// Expõe funções principais globalmente
window.getSampleData = getSampleData;
window.getDataRequirements = getDataRequirements;
window.onDataLoaded = onDataLoaded;

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================

function initializeBubbleMatrixConfig() {
    console.log('⚙️ Inicializando configuração da matriz de bolhas...');
    
    setTimeout(() => {
        setupBubbleMatrixControls();
        console.log('✅ Configuração da matriz de bolhas concluída');
    }, 300);
}

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBubbleMatrixConfig);
} else {
    initializeBubbleMatrixConfig();
}