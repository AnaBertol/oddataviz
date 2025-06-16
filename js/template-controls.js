/**
 * ODDATAVIZ - Controles do Template
 * Sistema focado em configurações realmente compartilhadas
 * VERSÃO SIMPLIFICADA - Só o essencial comum a todas as visualizações
 */

// ==========================================================================
// CONFIGURAÇÕES ESSENCIAIS - APENAS O QUE É REALMENTE COMUM
// ==========================================================================

const TEMPLATE_CONFIG = {
    // ✅ PALETAS BÁSICAS - Apenas as duas padrão
    colorPalettes: {
        odd: ['#6F02FD', '#2C0165', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8'],
        rainbow: ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#0080FF', '#8000FF']
    },
    
    // ✅ CONFIGURAÇÕES PADRÃO - Apenas o essencial comum
    defaults: {
        // Textos básicos
        title: 'Título, de preferência curto e insightful',
        subtitle: 'Subtítulo com detalhes importantes',
        dataSource: 'Fonte: fonte dos dados usados',
        
        // Cores básicas
        backgroundColor: '#FFFFFF',
        textColor: '#2C3E50',
        
        // Tipografia básica
        fontFamily: 'Inter',
        titleSize: 24,
        subtitleSize: 16,
        labelSize: 12,
        valueSize: 14,
        
        // Paleta padrão
        colorPalette: 'odd'
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
    console.log('🎛️ Initializing focused template controls...');
    updateCallback = callback;
    
    // Lê valores atuais do HTML primeiro
    readCurrentHTMLValues();
    
    // Inicializa apenas controles essenciais
    initializeBasicControls();
    initializeColorControls();
    initializeTypographyControls();
    
    // Carrega estado inicial
    loadInitialState();
    
    console.log('✅ Template controls initialized - focused approach');
}

/**
 * Lê valores atuais dos controles HTML para preservar configurações específicas
 */
function readCurrentHTMLValues() {
    console.log('📖 Reading essential HTML control values...');
    
    // ✅ APENAS CONFIGURAÇÕES ESSENCIAIS
    const essentialValues = {
        title: document.getElementById('chart-title')?.value,
        subtitle: document.getElementById('chart-subtitle')?.value,
        dataSource: document.getElementById('data-source')?.value,
        backgroundColor: document.getElementById('bg-color')?.value,
        textColor: document.getElementById('text-color')?.value,
        fontFamily: document.getElementById('font-family')?.value,
        titleSize: parseInt(document.getElementById('title-size')?.value),
        subtitleSize: parseInt(document.getElementById('subtitle-size')?.value),
        labelSize: parseInt(document.getElementById('label-size')?.value),
        valueSize: parseInt(document.getElementById('value-size')?.value)
    };
    
    // Paleta ativa
    const activePalette = document.querySelector('.color-option.active')?.dataset.palette;
    if (activePalette && (activePalette === 'odd' || activePalette === 'rainbow')) {
        essentialValues.colorPalette = activePalette;
    }
    
    // Aplica apenas valores válidos
    Object.entries(essentialValues).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '' && !isNaN(value)) {
            currentState[key] = value;
            console.log(`✅ Using HTML ${key}:`, value);
        }
    });
    
    console.log('📋 Essential state after reading HTML:', currentState);
}

/**
 * Carrega estado inicial dos controles
 */
function loadInitialState() {
    // Atualiza valores dos controles essenciais
    updateControlValue('title', currentState.title);
    updateControlValue('subtitle', currentState.subtitle);
    updateControlValue('dataSource', currentState.dataSource);
    updateControlValue('backgroundColor', currentState.backgroundColor);
    updateControlValue('textColor', currentState.textColor);
    updateControlValue('fontFamily', currentState.fontFamily);
    updateControlValue('titleSize', currentState.titleSize);
    updateControlValue('subtitleSize', currentState.subtitleSize);
    updateControlValue('labelSize', currentState.labelSize);
    updateControlValue('valueSize', currentState.valueSize);
    
    // Dispara callback inicial
    if (updateCallback) {
        updateCallback(currentState);
    }
}

// ==========================================================================
// CONTROLES BÁSICOS - APENAS TEXTOS
// ==========================================================================

/**
 * Inicializa controles básicos (título, subtítulo, fonte)
 */
function initializeBasicControls() {
    const textControls = {
        'chart-title': 'title',
        'chart-subtitle': 'subtitle',
        'data-source': 'dataSource'
    };
    
    Object.entries(textControls).forEach(([elementId, stateKey]) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('input', (e) => {
                updateState(stateKey, e.target.value);
            });
        }
    });
}

// ==========================================================================
// CONTROLES DE CORES - APENAS ESSENCIAIS
// ==========================================================================

/**
 * Inicializa controles de cores essenciais
 */
function initializeColorControls() {
    // Paletas básicas (odd e rainbow)
    initializeBasicPalettes();
    
    // Cores básicas (fundo e texto)
    initializeBasicColors();
}

/**
 * Inicializa seleção das duas paletas básicas
 */
function initializeBasicPalettes() {
    const paletteButtons = document.querySelectorAll('.color-option[data-palette="odd"], .color-option[data-palette="rainbow"]');
    
    paletteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const palette = button.getAttribute('data-palette');
            
            // Remove active de paletas básicas
            paletteButtons.forEach(btn => btn.classList.remove('active'));
            
            // Adiciona active ao clicado
            button.classList.add('active');
            
            // Atualiza estado
            updateState('colorPalette', palette);
            
            console.log(`🎨 Basic palette changed to: ${palette}`);
        });
    });
}

/**
 * Inicializa cores básicas (fundo e texto)
 */
function initializeBasicColors() {
    const basicColors = [
        { id: 'bg-color', textId: 'bg-color-text', stateKey: 'backgroundColor' },
        { id: 'text-color', textId: 'text-color-text', stateKey: 'textColor' }
    ];
    
    basicColors.forEach(({ id, textId, stateKey }) => {
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

// ==========================================================================
// CONTROLES DE TIPOGRAFIA - APENAS ESSENCIAIS
// ==========================================================================

/**
 * Inicializa controles de tipografia essenciais
 */
function initializeTypographyControls() {
    const typographyControls = {
        'font-family': 'fontFamily',
        'title-size': 'titleSize',
        'subtitle-size': 'subtitleSize',
        'label-size': 'labelSize',
        'value-size': 'valueSize'
    };
    
    Object.entries(typographyControls).forEach(([elementId, stateKey]) => {
        const element = document.getElementById(elementId);
        if (element) {
            const eventType = element.type === 'range' ? 'input' : 'change';
            element.addEventListener(eventType, (e) => {
                const value = element.type === 'range' ? parseInt(e.target.value) : e.target.value;
                updateState(stateKey, value);
                
                // Atualiza display do valor para ranges
                if (element.type === 'range') {
                    const valueDisplay = document.getElementById(elementId + '-value');
                    if (valueDisplay) {
                        valueDisplay.textContent = value + 'px';
                    }
                }
            });
        }
    });
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
    const elementMap = {
        title: 'chart-title',
        subtitle: 'chart-subtitle',
        dataSource: 'data-source',
        backgroundColor: 'bg-color',
        textColor: 'text-color',
        fontFamily: 'font-family',
        titleSize: 'title-size',
        subtitleSize: 'subtitle-size',
        labelSize: 'label-size',
        valueSize: 'value-size'
    };
    
    const elementId = elementMap[key];
    if (!elementId) return;
    
    const element = document.getElementById(elementId);
    if (!element) return;
    
    if (element.type === 'range') {
        element.value = value;
        // Atualiza display do valor
        const valueDisplay = document.getElementById(elementId + '-value');
        if (valueDisplay) {
            valueDisplay.textContent = value + 'px';
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
 * Obtém a paleta de cores atual (apenas basic palettes)
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
 * Setup genérico para cores personalizadas (para as visualizações usarem)
 */
function setupCustomColors(numColors, callback, defaultColors = null) {
    const container = document.querySelector('.custom-color-inputs');
    if (!container) return;
    
    console.log(`🎨 Setting up ${numColors} custom colors`);
    
    // Usa cores da paleta atual como padrão
    const currentPalette = getCurrentColorPalette();
    const colorsToUse = defaultColors || currentPalette;
    
    // Limpa inputs existentes
    container.innerHTML = '';
    
    // Cria inputs para o número especificado de cores
    for (let i = 0; i < numColors; i++) {
        const color = colorsToUse[i % colorsToUse.length];
        
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-color-item';
        
        wrapper.innerHTML = `
            <label class="control-label">Cor ${i + 1}</label>
            <div class="color-input-wrapper">
                <input type="color" id="custom-color-${i}" class="color-input custom-color-picker" value="${color}">
                <input type="text" id="custom-color-${i}-text" class="color-text custom-color-text" value="${color}">
            </div>
        `;
        
        container.appendChild(wrapper);
        
        // Event listeners
        const colorInput = wrapper.querySelector('.custom-color-picker');
        const textInput = wrapper.querySelector('.custom-color-text');
        
        colorInput.addEventListener('input', (e) => {
            textInput.value = e.target.value;
            collectAndCallback();
        });
        
        textInput.addEventListener('input', (e) => {
            if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                colorInput.value = e.target.value;
                collectAndCallback();
            }
        });
    }
    
    function collectAndCallback() {
        const colors = [];
        container.querySelectorAll('.custom-color-picker').forEach(input => {
            colors.push(input.value);
        });
        
        if (callback && colors.length === numColors) {
            callback(colors);
        }
    }
    
    collectAndCallback();
    console.log(`✅ ${numColors} custom color inputs created`);
}

/**
 * Obtém cores personalizadas atuais
 */
function getCurrentCustomColors() {
    const colors = [];
    document.querySelectorAll('.custom-color-picker').forEach(input => {
        colors.push(input.value);
    });
    return colors;
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS - APENAS O ESSENCIAL
// ==========================================================================

window.OddVizTemplateControls = {
    // Funções essenciais
    initialize,
    updateState,
    getState,
    
    // Paletas básicas
    getCurrentColorPalette,
    
    // Cores personalizadas (para visualizações)
    setupCustomColors,
    getCurrentCustomColors,
    
    // Configurações
    TEMPLATE_CONFIG
};

console.log('✅ Focused Template Controls loaded - handles only essential shared features');
