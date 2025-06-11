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
    
    // Configurações padrão
    defaults: {
        title: 'Gráfico de Dados',
        subtitle: '',
        dataSource: '',
        backgroundColor: '#373737',
        textColor: '#FAF9FA',
        axisColor: '#FAF9FA',
        fontFamily: 'Inter',
        titleSize: 24,
        subtitleSize: 16,
        labelSize: 12,
        categorySize: 11,
        showLegend: true,
        legendPosition: 'bottom',
        legendDirect: false,
        colorBy: 'default',
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
    updateCallback = callback;
    
    // Inicializa controles básicos
    initializeBasicControls();
    initializeColorControls();
    initializeTypographyControls();
    initializeLegendControls();
    initializeFormatControls();
    
    // Carrega estado inicial
    loadInitialState();
    
    console.log('Template controls initialized');
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
    const customColorsContainer = document.querySelector('.custom-color-inputs');
    if (!customColorsContainer) return;
    
    // Gera inputs para 6 cores
    for (let i = 0; i < 6; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-color-input';
        
        const input = document.createElement('input');
        input.type = 'color';
        input.id = `custom-color-${i}`;
        input.value = TEMPLATE_CONFIG.colorPalettes.custom[i] || '#cccccc';
        
        const label = document.createElement('label');
        label.htmlFor = input.id;
        label.textContent = `Cor ${i + 1}`;
        
        wrapper.appendChild(input);
        wrapper.appendChild(label);
        customColorsContainer.appendChild(wrapper);
        
        // Event listener
        input.addEventListener('input', (e) => {
            updateCustomPalette();
        });
    }
}

/**
 * Atualiza paleta personalizada
 */
function updateCustomPalette() {
    const customColors = [];
    for (let i = 0; i < 6; i++) {
        const input = document.getElementById(`custom-color-${i}`);
        if (input) {
            customColors.push(input.value);
        }
    }
    
    TEMPLATE_CONFIG.colorPalettes.custom = customColors;
    
    if (currentState.colorPalette === 'custom') {
        triggerUpdate();
    }
}

/**
 * Mostra/esconde controles de cores personalizadas
 */
function toggleCustomColors(show) {
    const container = document.getElementById('custom-colors');
    if (container) {
        container.style.display = show ? 'block' : 'none';
    }
}

// ==========================================================================
// CONTROLES DE TIPOGRAFIA
// ==========================================================================

/**
 * Inicializa controles de tipografia
 */
function initializeTypographyControls() {
    // Font family
    const fontSelect = document.getElementById('font-family');
    if (fontSelect) {
        fontSelect.addEventListener('change', (e) => {
            updateState('fontFamily', e.target.value);
        });
    }
    
    // Font sizes
    const sizeControls = [
        { id: 'title-size', valueId: 'title-size-value', stateKey: 'titleSize' },
        { id: 'subtitle-size', valueId: 'subtitle-size-value', stateKey: 'subtitleSize' },
        { id: 'label-size', valueId: 'label-size-value', stateKey: 'labelSize' },
        { id: 'category-size', valueId: 'category-size-value', stateKey: 'categorySize' }
    ];
    
    sizeControls.forEach(({ id, valueId, stateKey }) => {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(valueId);
        
        if (slider) {
            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                updateState(stateKey, value);
                
                if (valueDisplay) {
                    valueDisplay.textContent = value;
                }
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
    // Show legend checkbox
    const showLegendCheck = document.getElementById('show-legend');
    if (showLegendCheck) {
        showLegendCheck.addEventListener('change', (e) => {
            updateState('showLegend', e.target.checked);
            toggleLegendOptions(e.target.checked);
        });
    }
    
    // Legend direct labels
    const legendDirectCheck = document.getElementById('legend-direct');
    if (legendDirectCheck) {
        legendDirectCheck.addEventListener('change', (e) => {
            updateState('legendDirect', e.target.checked);
        });
    }
    
    // Legend position
    const positionRadios = document.querySelectorAll('input[name="legend-position"]');
    positionRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                updateState('legendPosition', e.target.value);
            }
        });
    });
}

/**
 * Mostra/esconde opções de legenda
 */
function toggleLegendOptions(show) {
    const legendOptions = document.getElementById('legend-options');
    const legendPosition = document.getElementById('legend-position-group');
    
    if (legendOptions) {
        legendOptions.style.display = show ? 'block' : 'none';
    }
    
    if (legendPosition) {
        legendPosition.style.display = show ? 'block' : 'none';
    }
}

// ==========================================================================
// CONTROLES DE FORMATO
// ==========================================================================

/**
 * Inicializa controles de formato de tela
 */
function initializeFormatControls() {
    const formatRadios = document.querySelectorAll('input[name="screen-format"]');
    
    formatRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                const format = e.target.value;
                applyScreenFormat(format);
                toggleCustomDimensions(format === 'custom');
            }
        });
    });
    
    // Dimension sliders (para formato custom)
    initializeDimensionSliders();
}

/**
 * Aplica formato de tela
 */
function applyScreenFormat(format) {
    if (TEMPLATE_CONFIG.screenFormats[format]) {
        const { width, height } = TEMPLATE_CONFIG.screenFormats[format];
        updateState('chartWidth', width);
        updateState('chartHeight', height);
        
        // Atualiza sliders se estiverem visíveis
        const widthSlider = document.getElementById('chart-width');
        const heightSlider = document.getElementById('chart-height');
        const widthValue = document.getElementById('width-value');
        const heightValue = document.getElementById('height-value');
        
        if (widthSlider) {
            widthSlider.value = width;
            if (widthValue) widthValue.textContent = width;
        }
        
        if (heightSlider) {
            heightSlider.value = height;
            if (heightValue) heightValue.textContent = height;
        }
    }
}

/**
 * Inicializa sliders de dimensões
 */
function initializeDimensionSliders() {
    const dimensionControls = [
        { id: 'chart-width', valueId: 'width-value', stateKey: 'chartWidth' },
        { id: 'chart-height', valueId: 'height-value', stateKey: 'chartHeight' }
    ];
    
    dimensionControls.forEach(({ id, valueId, stateKey }) => {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(valueId);
        
        if (slider) {
            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                updateState(stateKey, value);
                
                if (valueDisplay) {
                    valueDisplay.textContent = value;
                }
            });
        }
    });
}

/**
 * Mostra/esconde dimensões personalizadas
 */
function toggleCustomDimensions(show) {
    const container = document.getElementById('custom-dimensions');
    if (container) {
        container.style.display = show ? 'block' : 'none';
    }
}

// ==========================================================================
// GERENCIAMENTO DE ESTADO
// ==========================================================================

/**
 * Atualiza estado e dispara callback
 */
function updateState(key, value) {
    currentState[key] = value;
    triggerUpdate();
}

/**
 * Dispara callback de update
 */
function triggerUpdate() {
    if (updateCallback) {
        updateCallback(currentState);
    }
    
    // Atualiza títulos renderizados
    updateRenderedTitles();
}

/**
 * Atualiza títulos renderizados na visualização
 */
function updateRenderedTitles() {
    const renderedTitle = document.getElementById('rendered-title');
    const renderedSubtitle = document.getElementById('rendered-subtitle');
    
    if (renderedTitle) {
        renderedTitle.textContent = currentState.title || '';
        renderedTitle.style.display = currentState.title ? 'block' : 'none';
    }
    
    if (renderedSubtitle) {
        renderedSubtitle.textContent = currentState.subtitle || '';
        renderedSubtitle.style.display = currentState.subtitle ? 'block' : 'none';
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
        axisColor: 'axis-color',
        fontFamily: 'font-family',
        titleSize: 'title-size',
        subtitleSize: 'subtitle-size',
        labelSize: 'label-size',
        categorySize: 'category-size',
        showLegend: 'show-legend',
        legendDirect: 'legend-direct',
        colorBy: 'color-by'
    };
    
    const elementId = elementMap[key];
    if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = value;
            } else if (element.type === 'radio') {
                if (element.value === value) {
                    element.checked = true;
                }
            } else {
                element.value = value;
            }
        }
    }
}

// ==========================================================================
// UTILITÁRIOS
// ==========================================================================

/**
 * Verifica se uma cor é válida
 */
function isValidColor(color) {
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return colorRegex.test(color);
}

/**
 * Obtém paleta de cores atual
 */
function getCurrentColorPalette() {
    return TEMPLATE_CONFIG.colorPalettes[currentState.colorPalette] || TEMPLATE_CONFIG.colorPalettes.odd;
}

/**
 * Popula opções de "Aplicar Cores Por"
 */
function populateColorByOptions() {
    const colorBySelect = document.getElementById('color-by');
    if (!colorBySelect || !window.chartColumns) return;
    
    // Limpa opções existentes
    colorBySelect.innerHTML = '<option value="default">Padrão</option>';
    
    // Adiciona colunas disponíveis
    window.chartColumns.forEach(column => {
        const option = document.createElement('option');
        option.value = column;
        option.textContent = column.charAt(0).toUpperCase() + column.slice(1);
        colorBySelect.appendChild(option);
    });
}

/**
 * Define estado completo
 */
function setState(newState) {
    currentState = { ...currentState, ...newState };
    
    // Atualiza controles
    Object.keys(newState).forEach(key => {
        updateControlValue(key, newState[key]);
    });
    
    triggerUpdate();
}

/**
 * Obtém estado atual
 */
function getState() {
    return { ...currentState };
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

window.OddVizTemplateControls = {
    initialize,
    updateState,
    setState,
    getState,
    getCurrentColorPalette,
    populateColorByOptions,
    TEMPLATE_CONFIG
};

console.log('Template Controls loaded successfully');
