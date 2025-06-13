/**
 * ODDATAVIZ - Controles do Template
 * Sistema de controles compartilhado entre todas as visualizações
 */

// ==========================================================================
// CONFIGURAÇÕES DOS CONTROLES
// ==========================================================================

const TEMPLATE_CONFIG = {
    // Paletas de cores
    colorPalettes: {
        odd: ['#6F02FD', '#2C0165', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8'],
        blues: ['#08519c', '#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#eff3ff'],
        warm: ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#e0f3f8', '#abd9e9'],
        custom: ['#333333', '#666666', '#999999', '#cccccc']
    },
    
    // Formatos de tela
    screenFormats: {
        desktop: { width: 800, height: 450, ratio: '16:9' },
        mobile: { width: 400, height: 700, ratio: '9:16' },
        square: { width: 600, height: 600, ratio: '1:1' },
        custom: { width: 800, height: 600, ratio: 'custom' }
    },
    
    // ✅ CONFIGURAÇÕES PADRÃO ATUALIZADAS PARA WAFFLE
    defaults: {
        title: 'Distribuição por Categoria',
        subtitle: 'Visualização em formato waffle',
        dataSource: 'Dados de Exemplo, 2024',
        backgroundColor: '#FFFFFF', // ✅ FUNDO BRANCO
        textColor: '#2C3E50', // ✅ FONTE ESCURA
        axisColor: '#2C3E50', // ✅ EIXOS ESCUROS
        fontFamily: 'Inter',
        titleSize: 24,
        subtitleSize: 16,
        labelSize: 12,
        categorySize: 11,
        showLegend: true,
        legendPosition: 'bottom',
        legendDirect: true, // ✅ RÓTULOS DIRETOS POR PADRÃO
        directLabelPosition: 'right', // ✅ NOVA PROPRIEDADE
        colorBy: 'default',
        colorPalette: 'odd',
        chartWidth: 600, // ✅ FORMATO QUADRADO
        chartHeight: 600, // ✅ FORMATO QUADRADO
        screenFormat: 'square' // ✅ FORMATO QUADRADO POR PADRÃO
    }
};

// ==========================================================================
// ESTADO DOS CONTROLES
// ==========================================================================

let currentState = { ...TEMPLATE_CONFIG.defaults };
let updateCallback = null;

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================

/**
 * Inicializa o sistema de controles do template
 */
function initialize(callback) {
    console.log('Initializing template controls...');
    updateCallback = callback;
    
    // ✅ PRIMEIRO: Lê valores dos controles HTML para sobrescrever defaults
    readCurrentHTMLValues();
    
    // Inicializa controles básicos
    initializeBasicControls();
    initializeColorControls();
    initializeTypographyControls();
    initializeLegendControls();
    initializeFormatControls();
    
    // Carrega estado inicial
    loadInitialState();
    
    console.log('Template controls initialized successfully');
}

/**
 * ✅ NOVA FUNÇÃO: Lê valores atuais dos controles HTML antes de inicializar
 */
function readCurrentHTMLValues() {
    console.log('📖 Reading current HTML control values...');
    
    // Lê cores dos inputs HTML
    const bgColor = document.getElementById('bg-color')?.value;
    const textColor = document.getElementById('text-color')?.value;
    
    if (bgColor) {
        currentState.backgroundColor = bgColor;
        console.log(`✅ Using HTML bg-color: ${bgColor}`);
    }
    
    if (textColor) {
        currentState.textColor = textColor;
        currentState.axisColor = textColor; // Mantém consistência
        console.log(`✅ Using HTML text-color: ${textColor}`);
    }
    
    // Lê formato de tela
    const screenFormat = document.querySelector('input[name="screen-format"]:checked')?.value;
    if (screenFormat) {
        currentState.screenFormat = screenFormat;
        const format = TEMPLATE_CONFIG.screenFormats[screenFormat];
        if (format) {
            currentState.chartWidth = format.width;
            currentState.chartHeight = format.height;
        }
        console.log(`✅ Using HTML screen-format: ${screenFormat}`);
    }
    
    // Lê configurações de legenda
    const showLegend = document.getElementById('show-legend')?.checked;
    if (showLegend !== undefined) {
        currentState.showLegend = showLegend;
        console.log(`✅ Using HTML show-legend: ${showLegend}`);
    }
    
    const directLabelPosition = document.querySelector('input[name="direct-label-position"]:checked')?.value;
    if (directLabelPosition) {
        currentState.directLabelPosition = directLabelPosition;
        console.log(`✅ Using HTML direct-label-position: ${directLabelPosition}`);
    }
    
    console.log('📋 Final state after reading HTML:', currentState);
}

/**
 * Carrega estado inicial dos controles
 */
function loadInitialState() {
    // Atualiza valores dos controles com estado atual
    Object.keys(currentState).forEach(key => {
        updateControlValue(key, currentState[key]);
    });
    
    // Dispara callback inicial
    if (updateCallback) {
        updateCallback(currentState);
    }
}

// ==========================================================================
// CONTROLES BÁSICOS
// ==========================================================================

/**
 * Inicializa controles básicos (título, subtítulo, etc.)
 */
function initializeBasicControls() {
    const controls = {
        'chart-title': 'title',
        'chart-subtitle': 'subtitle',
        'data-source': 'dataSource'
    };
    
    Object.entries(controls).forEach(([elementId, stateKey]) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('input', (e) => {
                updateState(stateKey, e.target.value);
            });
        }
    });
}

// ==========================================================================
// CONTROLES DE CORES
// ==========================================================================

/**
 * Inicializa controles de cores
 */
function initializeColorControls() {
    // Color By select
    const colorBySelect = document.getElementById('color-by');
    if (colorBySelect) {
        colorBySelect.addEventListener('change', (e) => {
            updateState('colorBy', e.target.value);
        });
    }
    
    // Paletas de cores
    initializeColorPalettes();
    
    // Cores individuais
    initializeIndividualColors();
    
    // Cores personalizadas
    initializeCustomColors();
}

/**
 * Inicializa seleção de paletas
 */
function initializeColorPalettes() {
    const paletteButtons = document.querySelectorAll('.color-option');
    
    paletteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const palette = button.getAttribute('data-palette');
            
            // Remove active de todos
            paletteButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adiciona active ao clicado
            button.classList.add('active');
            
            // Atualiza estado
            updateState('colorPalette', palette);
            
            // Mostra/esconde controles personalizados
            toggleCustomColors(palette === 'custom');
        });
    });
}

/**
 * Inicializa cores individuais
 */
function initializeIndividualColors() {
    const colorInputs = [
        { id: 'bg-color', textId: 'bg-color-text', stateKey: 'backgroundColor' },
        { id: 'text-color', textId: 'text-color-text', stateKey: 'textColor' },
        { id: 'axis-color', textId: 'axis-color-text', stateKey: 'axisColor' }
    ];
    
    colorInputs.forEach(({ id, textId, stateKey }) => {
        const colorInput = document.getElementById(id);
        const textInput = document.getElementById(textId);
        
        if (colorInput) {
            colorInput.addEventListener('input', (e) => {
                updateState(stateKey, e.target.value);
                if (textInput) {
                    textInput.value = e.target.value;
                }
            });
        }
        
        if (textInput) {
            textInput.addEventListener('input', (e) => {
                const color = e.target.value;
                if (isValidColor(color)) {
                    updateState(stateKey, color);
                    if (colorInput) {
                        colorInput.value = color;
                    }
                }
            });
        }
    });
}

/**
 * Inicializa cores personalizadas
 */
function initializeCustomColors() {
    // Será implementado conforme necessário para cada visualização
}

/**
 * Mostra/esconde controles de cores personalizadas
 */
function toggleCustomColors(show) {
    const customColorsSection = document.getElementById('custom-colors');
    if (customColorsSection) {
        customColorsSection.style.display = show ? 'block' : 'none';
    }
}

// ==========================================================================
// CONTROLES DE TIPOGRAFIA
// ==========================================================================

/**
 * Inicializa controles de tipografia
 */
function initializeTypographyControls() {
    const controls = {
        'font-family': 'fontFamily',
        'title-size': 'titleSize',
        'subtitle-size': 'subtitleSize',
        'label-size': 'labelSize',
        'category-size': 'categorySize'
    };
    
    Object.entries(controls).forEach(([elementId, stateKey]) => {
        const element = document.getElementById(elementId);
        if (element) {
            const eventType = element.type === 'range' ? 'input' : 'change';
            element.addEventListener(eventType, (e) => {
                const value = element.type === 'range' ? parseInt(e.target.value) : e.target.value;
                updateState(stateKey, value);
            });
        }
    });
}

// ==========================================================================
// CONTROLES DE LEGENDA
// ==========================================================================

/**
 * Inicializa controles de legenda
 */
function initializeLegendControls() {
    // Show/hide legend
    const showLegendCheck = document.getElementById('show-legend');
    if (showLegendCheck) {
        showLegendCheck.addEventListener('change', (e) => {
            updateState('showLegend', e.target.checked);
        });
    }
    
    // Legend position
    const legendPositions = document.querySelectorAll('input[name="legend-position"]');
    legendPositions.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                updateState('legendPosition', e.target.value);
            }
        });
    });
    
    // ✅ NOVO: Direct labels
    const legendDirectCheck = document.getElementById('legend-direct');
    if (legendDirectCheck) {
        legendDirectCheck.addEventListener('change', (e) => {
            updateState('legendDirect', e.target.checked);
        });
    }
    
    // ✅ NOVO: Direct label position
    const directLabelPositions = document.querySelectorAll('input[name="direct-label-position"]');
    directLabelPositions.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                updateState('directLabelPosition', e.target.value);
            }
        });
    });
}

// ==========================================================================
// CONTROLES DE FORMATO
// ==========================================================================

/**
 * Inicializa controles de formato
 */
function initializeFormatControls() {
    // Screen format
    const screenFormats = document.querySelectorAll('input[name="screen-format"]');
    screenFormats.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                const format = e.target.value;
                updateState('screenFormat', format);
                
                if (format !== 'custom') {
                    const dimensions = TEMPLATE_CONFIG.screenFormats[format];
                    if (dimensions) {
                        updateState('chartWidth', dimensions.width);
                        updateState('chartHeight', dimensions.height);
                    }
                }
                
                toggleCustomDimensions(format === 'custom');
            }
        });
    });
    
    // Custom dimensions
    const widthRange = document.getElementById('chart-width');
    const heightRange = document.getElementById('chart-height');
    
    if (widthRange) {
        widthRange.addEventListener('input', (e) => {
            updateState('chartWidth', parseInt(e.target.value));
        });
    }
    
    if (heightRange) {
        heightRange.addEventListener('input', (e) => {
            updateState('chartHeight', parseInt(e.target.value));
        });
    }
}

/**
 * Mostra/esconde controles de dimensões personalizadas
 */
function toggleCustomDimensions(show) {
    const customDimensions = document.getElementById('custom-dimensions');
    if (customDimensions) {
        customDimensions.style.display = show ? 'block' : 'none';
    }
}

// ==========================================================================
// UTILITÁRIOS
// ==========================================================================

/**
 * Atualiza estado e dispara callback
 */
function updateState(key, value) {
    currentState[key] = value;
    
    if (updateCallback) {
        updateCallback(currentState);
    }
}

/**
 * Atualiza valor de um controle específico
 */
function updateControlValue(key, value) {
    // Mapeia keys do estado para IDs dos elementos
    const elementMap = {
        title: 'chart-title',
        subtitle: 'chart-subtitle',
        dataSource: 'data-source',
        backgroundColor: 'bg-color',
        textColor: 'text-color',
        axisColor: 'axis-color',
        fontFamily: 'font-family',
        titleSize: 'title-size',
        subtitleSize: 'subtitle-size',
        labelSize: 'label-size',
        categorySize: 'category-size',
        showLegend: 'show-legend',
        chartWidth: 'chart-width',
        chartHeight: 'chart-height'
    };
    
    const elementId = elementMap[key];
    if (!elementId) return;
    
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (element.type === 'checkbox') {
        element.checked = value;
    } else if (element.type === 'range') {
        element.value = value;
        // Atualiza display do valor se existir
        const valueDisplay = document.getElementById(elementId + '-value');
        if (valueDisplay) {
            valueDisplay.textContent = value + (key.includes('Size') ? 'px' : '');
        }
    } else {
        element.value = value;
    }
    
    // Atualiza inputs de texto de cor
    if (key.includes('Color')) {
        const textInput = document.getElementById(elementId + '-text');
        if (textInput) {
            textInput.value = value;
        }
    }
}

/**
 * Valida se uma string é uma cor válida
 */
function isValidColor(color) {
    const s = new Option().style;
    s.color = color;
    return s.color !== '';
}

/**
 * Obtém a paleta de cores atual
 */
function getCurrentColorPalette() {
    return TEMPLATE_CONFIG.colorPalettes[currentState.colorPalette] || TEMPLATE_CONFIG.colorPalettes.odd;
}

/**
 * Obtém o estado atual
 */
function getState() {
    return { ...currentState };
}

/**
 * ✅ NOVA FUNÇÃO: Permite definir defaults customizados
 */
function setDefaults(newDefaults) {
    console.log('🎯 Setting custom defaults:', newDefaults);
    Object.assign(TEMPLATE_CONFIG.defaults, newDefaults);
    Object.assign(currentState, newDefaults);
    return currentState;
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

window.OddVizTemplateControls = {
    initialize,
    updateState,
    getCurrentColorPalette,
    getState,
    setDefaults, // ✅ NOVA FUNÇÃO EXPORTADA
    TEMPLATE_CONFIG
};

console.log('Template Controls loaded successfully');
