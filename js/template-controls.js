/**
 * ODDATAVIZ - Controles do Template
 * Sistema de controles compartilhado entre todas as visualizações
 * VERSÃO CORRIGIDA - Compatível com Waffle, Semi-Círculos e Matriz
 */

// ==========================================================================
// CONFIGURAÇÕES DOS CONTROLES - ATUALIZADAS
// ==========================================================================

const TEMPLATE_CONFIG = {
    // ✅ PALETAS ATUALIZADAS - Compatível com sistema atual
    colorPalettes: {
        odd: ['#6F02FD', '#2C0165', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8'],
        rainbow: ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#0080FF', '#8000FF'], // ✅ CORRIGIDO: rainbow em vez de blues
        custom: ['#6F02FD', '#6CDADE', '#3570DF'] // ✅ CORRIGIDO: cores padrão para custom
    },
    
    // ✅ FORMATOS ATUALIZADOS - Compatível com visualizações existentes
    screenFormats: {
        square: { width: 600, height: 600, ratio: '1:1' },        // ✅ Waffle Chart
        rectangular: { width: 800, height: 600, ratio: '4:3' },   // ✅ Semi-círculos e Matriz
        desktop: { width: 800, height: 450, ratio: '16:9' },      // ✅ Mantido para compatibilidade
        mobile: { width: 400, height: 700, ratio: '9:16' },       // ✅ Mantido para compatibilidade
        custom: { width: 800, height: 600, ratio: 'custom' }      // ✅ Mantido para compatibilidade
    },
    
    // ✅ CONFIGURAÇÕES PADRÃO GENÉRICAS - Servem para todas as visualizações
    defaults: {
        title: 'Título, de preferência curto e insightful',
        subtitle: 'Subtítulo com detalhes importantes',
        dataSource: 'Fonte: fonte dos dados usados',
        backgroundColor: '#FFFFFF',
        textColor: '#2C3E50',
        axisColor: '#2C3E50',
        fontFamily: 'Inter',
        titleSize: 24,
        subtitleSize: 16,
        labelSize: 12,
        categorySize: 11,
        valueSize: 14, // ✅ ADICIONADO: Para meio-círculos e matriz
        showLegend: true,
        legendPosition: 'bottom',
        legendDirect: true,
        directLabelPosition: 'right',
        colorBy: 'default',
        colorPalette: 'odd',
        chartWidth: 600,
        chartHeight: 600,
        screenFormat: 'square',
        // ✅ NOVOS: Configurações específicas por visualização
        showValues: true,
        showCategoryLabels: true,
        showGroupLabels: true,
        showParameterLabels: true
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
    console.log('🎛️ Initializing template controls...');
    updateCallback = callback;
    
    // ✅ CRÍTICO: Primeiro lê valores HTML para preservar configurações específicas
    readCurrentHTMLValues();
    
    // Inicializa controles básicos
    initializeBasicControls();
    initializeColorControls();
    initializeTypographyControls();
    initializeLegendControls();
    initializeFormatControls();
    
    // Carrega estado inicial
    loadInitialState();
    
    console.log('✅ Template controls initialized successfully');
}

/**
 * ✅ FUNÇÃO CORRIGIDA: Lê valores atuais dos controles HTML antes de aplicar defaults
 */
function readCurrentHTMLValues() {
    console.log('📖 Reading current HTML control values...');
    
    // ✅ CRÍTICO: Lê textos básicos
    const htmlValues = {
        title: document.getElementById('chart-title')?.value,
        subtitle: document.getElementById('chart-subtitle')?.value,
        dataSource: document.getElementById('data-source')?.value,
        backgroundColor: document.getElementById('bg-color')?.value,
        textColor: document.getElementById('text-color')?.value,
        fontFamily: document.getElementById('font-family')?.value,
        titleSize: document.getElementById('title-size')?.value,
        subtitleSize: document.getElementById('subtitle-size')?.value,
        labelSize: document.getElementById('label-size')?.value,
        valueSize: document.getElementById('value-size')?.value, // ✅ Para meio-círculos e matriz
        showLegend: document.getElementById('show-legend')?.checked,
        showValues: document.getElementById('show-values')?.checked,
        showCategoryLabels: document.getElementById('show-category-labels')?.checked,
        showGroupLabels: document.getElementById('show-group-labels')?.checked,
        showParameterLabels: document.getElementById('show-parameter-labels')?.checked
    };
    
    // ✅ Cores específicas (matriz e outras visualizações)
    const backgroundShapeColor = document.getElementById('background-shape-color')?.value;
    if (backgroundShapeColor) {
        htmlValues.backgroundShapeColor = backgroundShapeColor;
    }
    
    // ✅ Cores de categorias (meio-círculos)
    const category1Color = document.getElementById('category-1-color')?.value;
    const category2Color = document.getElementById('category-2-color')?.value;
    if (category1Color && category2Color) {
        htmlValues.categoryColors = [category1Color, category2Color];
    }
    
    // ✅ Configurações específicas do waffle
    const waffleSize = document.getElementById('waffle-size')?.value;
    const waffleGap = document.getElementById('waffle-gap')?.value;
    const waffleRoundness = document.getElementById('waffle-roundness')?.value;
    if (waffleSize) htmlValues.waffleSize = parseInt(waffleSize);
    if (waffleGap) htmlValues.waffleGap = parseFloat(waffleGap);
    if (waffleRoundness) htmlValues.waffleRoundness = parseFloat(waffleRoundness);
    
    // ✅ Configurações específicas dos meio-círculos
    const circleSize = document.getElementById('circle-size')?.value;
    const circleSpacing = document.getElementById('circle-spacing')?.value;
    if (circleSize) htmlValues.circleSize = parseInt(circleSize);
    if (circleSpacing) htmlValues.circleSpacing = parseInt(circleSpacing);
    
    // ✅ Configurações específicas da matriz
    const elementSize = document.getElementById('element-size')?.value;
    const elementSpacing = document.getElementById('element-spacing')?.value;
    const borderRadius = document.getElementById('border-radius')?.value;
    if (elementSize) htmlValues.elementSize = parseInt(elementSize);
    if (elementSpacing) htmlValues.elementSpacing = parseInt(elementSpacing);
    if (borderRadius) htmlValues.borderRadius = parseFloat(borderRadius);
    
    // ✅ Forma ativa (matriz)
    const activeShape = document.querySelector('.shape-option.active')?.dataset.shape;
    if (activeShape) htmlValues.shape = activeShape;
    
    // ✅ Alinhamento ativo (matriz)
    const activeAlignment = document.querySelector('.alignment-option.active')?.dataset.align;
    if (activeAlignment) htmlValues.alignment = activeAlignment;
    
    // ✅ Radio buttons
    const directLabelPosition = document.querySelector('input[name="direct-label-position"]:checked')?.value;
    if (directLabelPosition) htmlValues.directLabelPosition = directLabelPosition;
    
    const screenFormat = document.querySelector('input[name="screen-format"]:checked')?.value;
    if (screenFormat) {
        htmlValues.screenFormat = screenFormat;
        const format = TEMPLATE_CONFIG.screenFormats[screenFormat];
        if (format) {
            htmlValues.chartWidth = format.width;
            htmlValues.chartHeight = format.height;
        }
    }
    
    // ✅ Paleta ativa
    const activePalette = document.querySelector('.color-option.active')?.dataset.palette;
    if (activePalette) htmlValues.colorPalette = activePalette;
    
    // ✅ Aplica valores HTML válidos ao estado atual
    Object.entries(htmlValues).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            currentState[key] = value;
            console.log(`✅ Using HTML ${key}:`, value);
        }
    });
    
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
// CONTROLES DE CORES - ATUALIZADOS
// ==========================================================================

/**
 * Inicializa controles de cores
 */
function initializeColorControls() {
    // Color By select (se existir)
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
 * ✅ FUNÇÃO ATUALIZADA: Inicializa seleção de paletas
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
            
            // ✅ NOVO: Notifica visualizações sobre mudança de paleta
            if (window.WaffleVisualization?.updateColorPalette) {
                window.WaffleVisualization.updateColorPalette(palette);
            }
            if (window.MatrixChoiceVisualization?.updateColorPalette) {
                const colors = TEMPLATE_CONFIG.colorPalettes[palette] || TEMPLATE_CONFIG.colorPalettes.odd;
                window.MatrixChoiceVisualization.updateColorPalette(colors);
            }
        });
    });
}

/**
 * ✅ FUNÇÃO EXPANDIDA: Inicializa cores individuais
 */
function initializeIndividualColors() {
    const colorInputs = [
        { id: 'bg-color', textId: 'bg-color-text', stateKey: 'backgroundColor' },
        { id: 'text-color', textId: 'text-color-text', stateKey: 'textColor' },
        { id: 'axis-color', textId: 'axis-color-text', stateKey: 'axisColor' },
        // ✅ NOVO: Cores específicas das visualizações
        { id: 'background-shape-color', textId: 'background-shape-color-text', stateKey: 'backgroundShapeColor' },
        { id: 'category-1-color', textId: 'category-1-color-text', stateKey: 'category1Color' },
        { id: 'category-2-color', textId: 'category-2-color-text', stateKey: 'category2Color' }
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
                
                // ✅ NOVO: Sincroniza preview de cor (se existir)
                const preview = document.getElementById(id.replace('-color', '-preview'));
                if (preview) {
                    preview.style.background = e.target.value;
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
                    
                    // ✅ NOVO: Sincroniza preview de cor (se existir)
                    const preview = document.getElementById(id.replace('-color', '-preview'));
                    if (preview) {
                        preview.style.background = color;
                    }
                }
            });
        }
    });
}

/**
 * ✅ FUNÇÃO GENÉRICA: Inicializa cores personalizadas
 * Cada visualização deve chamar esta função com seus próprios parâmetros
 */
function initializeCustomColors() {
    // ✅ Esta função é intencionalmente vazia
    // Cada visualização implementa suas próprias cores personalizadas
    // usando setupCustomColors() quando necessário
    console.log('🎨 Custom colors initialization delegated to individual visualizations');
}

/**
 * ✅ NOVA FUNÇÃO: Setup genérico para cores personalizadas
 * @param {number} numColors - Número de cores necessárias
 * @param {function} callback - Função chamada quando cores mudam
 * @param {array} defaultColors - Cores padrão (opcional)
 */
function setupCustomColors(numColors, callback, defaultColors = null) {
    const container = document.querySelector('.custom-color-inputs');
    if (!container) return;
    
    console.log(`🎨 Setting up ${numColors} custom colors`);
    
    // Cores padrão baseadas na paleta Odd
    const fallbackColors = ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'];
    const colorsToUse = defaultColors || fallbackColors;
    
    // Limpa inputs existentes
    container.innerHTML = '';
    
    // Cria inputs para o número especificado de cores
    for (let i = 0; i < numColors; i++) {
        const color = colorsToUse[i % colorsToUse.length]; // Cicla se precisar de mais cores
        
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
        
        // Event listeners para sincronizar cor e texto
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
    
    // Função para coletar cores e chamar callback
    function collectAndCallback() {
        const colors = [];
        container.querySelectorAll('.custom-color-picker').forEach(input => {
            colors.push(input.value);
        });
        
        if (callback && colors.length === numColors) {
            callback(colors);
        }
    }
    
    // Chama callback inicial
    collectAndCallback();
    
    console.log(`✅ ${numColors} custom color inputs created`);
}

/**
 * ✅ FUNÇÃO AUXILIAR: Obtém cores personalizadas atuais
 */
function getCurrentCustomColors() {
    const colors = [];
    document.querySelectorAll('.custom-color-picker').forEach(input => {
        colors.push(input.value);
    });
    return colors;
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
// CONTROLES DE TIPOGRAFIA - EXPANDIDOS
// ==========================================================================

/**
 * ✅ FUNÇÃO EXPANDIDA: Inicializa controles de tipografia
 */
function initializeTypographyControls() {
    const controls = {
        'font-family': 'fontFamily',
        'title-size': 'titleSize',
        'subtitle-size': 'subtitleSize',
        'label-size': 'labelSize',
        'category-size': 'categorySize',
        'value-size': 'valueSize' // ✅ NOVO: Para meio-círculos e matriz
    };
    
    Object.entries(controls).forEach(([elementId, stateKey]) => {
        const element = document.getElementById(elementId);
        if (element) {
            const eventType = element.type === 'range' ? 'input' : 'change';
            element.addEventListener(eventType, (e) => {
                const value = element.type === 'range' ? parseInt(e.target.value) : e.target.value;
                updateState(stateKey, value);
                
                // ✅ NOVO: Atualiza display do valor para ranges
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
// CONTROLES DE LEGENDA - EXPANDIDOS
// ==========================================================================

/**
 * ✅ FUNÇÃO EXPANDIDA: Inicializa controles de legenda
 */
function initializeLegendControls() {
    // ✅ Controles de exibição (compatível com todas as visualizações)
    const displayControls = {
        'show-legend': 'showLegend',
        'show-values': 'showValues',
        'show-category-labels': 'showCategoryLabels',
        'show-group-labels': 'showGroupLabels',
        'show-parameter-labels': 'showParameterLabels'
    };
    
    Object.entries(displayControls).forEach(([elementId, stateKey]) => {
        const element = document.getElementById(elementId);
        if (element && element.type === 'checkbox') {
            element.addEventListener('change', (e) => {
                updateState(stateKey, e.target.checked);
            });
        }
    });
    
    // Legend position (se existir)
    const legendPositions = document.querySelectorAll('input[name="legend-position"]');
    legendPositions.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                updateState('legendPosition', e.target.value);
            }
        });
    });
    
    // Direct label position
    const directLabelPositions = document.querySelectorAll('input[name="direct-label-position"]');
    directLabelPositions.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                updateState('directLabelPosition', e.target.value);
            }
        });
    });
    
    // ✅ NOVO: Controles específicos por visualização
    initializeSpecificControls();
}

/**
 * ✅ NOVA FUNÇÃO: Inicializa controles específicos de cada visualização
 */
function initializeSpecificControls() {
    // ✅ Controles do waffle
    const waffleControls = ['waffle-size', 'waffle-gap', 'waffle-roundness', 'waffle-animation', 'waffle-hover-effect'];
    waffleControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            const eventType = element.type === 'checkbox' ? 'change' : 'input';
            element.addEventListener(eventType, (e) => {
                const value = element.type === 'checkbox' ? e.target.checked : 
                              element.type === 'range' ? parseFloat(e.target.value) : e.target.value;
                updateState(controlId.replace('-', ''), value);
            });
        }
    });
    
    // ✅ Controles dos meio-círculos
    const semiCircleControls = ['circle-size', 'circle-spacing', 'show-axis-line', 'show-animation', 'show-circle-outline'];
    semiCircleControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            const eventType = element.type === 'checkbox' ? 'change' : 'input';
            element.addEventListener(eventType, (e) => {
                const value = element.type === 'checkbox' ? e.target.checked : 
                              element.type === 'range' ? parseInt(e.target.value) : e.target.value;
                updateState(controlId.replace('-', ''), value);
            });
        }
    });
    
    // ✅ Controles da matriz
    const matrixControls = ['element-size', 'element-spacing', 'border-radius', 'show-animation'];
    matrixControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            const eventType = element.type === 'checkbox' ? 'change' : 'input';
            element.addEventListener(eventType, (e) => {
                const value = element.type === 'checkbox' ? e.target.checked : 
                              element.type === 'range' ? parseFloat(e.target.value) : e.target.value;
                updateState(controlId.replace('-', ''), value);
            });
        }
    });
    
    // ✅ Controles de forma (matriz)
    const shapeOptions = document.querySelectorAll('.shape-option');
    shapeOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const shape = option.dataset.shape;
            if (shape) {
                updateState('shape', shape);
                
                // Atualiza classes ativas
                shapeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            }
        });
    });
    
    // ✅ Controles de alinhamento (matriz)
    const alignmentOptions = document.querySelectorAll('.alignment-option');
    alignmentOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            const alignment = option.dataset.align;
            if (alignment) {
                updateState('alignment', alignment);
                
                // Atualiza classes ativas
                alignmentOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
            }
        });
    });
}

// ==========================================================================
// CONTROLES DE FORMATO - ATUALIZADOS
// ==========================================================================

/**
 * ✅ FUNÇÃO ATUALIZADA: Inicializa controles de formato
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
// UTILITÁRIOS - EXPANDIDOS
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
 * ✅ FUNÇÃO EXPANDIDA: Atualiza valor de um controle específico
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
        valueSize: 'value-size',
        showLegend: 'show-legend',
        showValues: 'show-values',
        showCategoryLabels: 'show-category-labels',
        showGroupLabels: 'show-group-labels',
        showParameterLabels: 'show-parameter-labels',
        chartWidth: 'chart-width',
        chartHeight: 'chart-height',
        // ✅ NOVOS: Controles específicos
        backgroundShapeColor: 'background-shape-color',
        category1Color: 'category-1-color',
        category2Color: 'category-2-color',
        waffleSize: 'waffle-size',
        waffleGap: 'waffle-gap',
        waffleRoundness: 'waffle-roundness',
        circleSize: 'circle-size',
        circleSpacing: 'circle-spacing',
        elementSize: 'element-size',
        elementSpacing: 'element-spacing',
        borderRadius: 'border-radius'
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
            valueDisplay.textContent = value + (key.includes('Size') || key.includes('Width') || key.includes('Height') ? 'px' : '');
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
        
        // Atualiza preview de cor
        const preview = document.getElementById(elementId.replace('-color', '-preview'));
        if (preview) {
            preview.style.background = value;
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
 * ✅ FUNÇÃO ATUALIZADA: Obtém a paleta de cores atual
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
 * ✅ FUNÇÃO MANTIDA: Permite definir defaults customizados
 */
function setDefaults(newDefaults) {
    console.log('🎯 Setting custom defaults:', newDefaults);
    Object.assign(TEMPLATE_CONFIG.defaults, newDefaults);
    Object.assign(currentState, newDefaults);
    return currentState;
}

/**
 * ✅ NOVA FUNÇÃO: Reset para defaults
 */
function resetToDefaults() {
    currentState = { ...TEMPLATE_CONFIG.defaults };
    loadInitialState();
    return currentState;
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS - EXPANDIDAS
// ==========================================================================

window.OddVizTemplateControls = {
    initialize,
    updateState,
    getCurrentColorPalette,
    getState,
    setDefaults,
    resetToDefaults,
    setupCustomColors, // ✅ NOVA EXPORTAÇÃO para visualizações
    getCurrentCustomColors, // ✅ NOVA EXPORTAÇÃO para visualizações  
    TEMPLATE_CONFIG
};

console.log('✅ Template Controls loaded successfully - Updated for all visualizations');
