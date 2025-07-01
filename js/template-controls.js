/**
 * ODDATAVIZ - Controles do Template
 * Sistema focado em configurações realmente compartilhadas
 * VERSÃO COM QUEBRA AUTOMÁTICA DE TEXTO
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
    },
    
    // ✅ CONFIGURAÇÕES DE QUEBRA DE TEXTO
    textWrap: {
        // Larguras padrão por tipo de visualização
        defaultWidths: {
            square: 500,    // Waffle (600px - margens)
            rectangular: 680, // Meio círculos (800px - margens)
            wide: 900       // Futuras visualizações panorâmicas
        },
        
        // Configurações de quebra
        lineHeight: 1.2,    // Espaçamento entre linhas
        maxLines: {
            title: 3,       // Máximo 3 linhas para título
            subtitle: 2,    // Máximo 2 linhas para subtítulo
            source: 2       // ✅ CORRIGIDO: Máximo 2 linhas para fonte
        },
        
        // Margens de segurança
        padding: 20 // 10px de cada lado
    }
};

// ==========================================================================
// ESTADO DOS CONTROLES
// ==========================================================================

let currentState = { ...TEMPLATE_CONFIG.defaults };
let updateCallback = null;
let currentVisualizationWidth = TEMPLATE_CONFIG.textWrap.defaultWidths.square; // Padrão

// ==========================================================================
// SISTEMA DE QUEBRA AUTOMÁTICA DE TEXTO
// ==========================================================================

/**
 * Classe para gerenciar quebra automática de texto em SVG
 */
class SVGTextWrapper {
    constructor(svg, config = {}) {
        this.svg = svg;
        this.config = {
            maxWidth: config.maxWidth || 500,
            lineHeight: config.lineHeight || 1.2,
            fontSize: config.fontSize || 16,
            fontFamily: config.fontFamily || 'Inter',
            fontWeight: config.fontWeight || 'normal',
            maxLines: config.maxLines || 3,
            textAnchor: config.textAnchor || 'middle',
            ...config
        };
        
        // Canvas temporário para medir texto
        this.measureCanvas = document.createElement('canvas');
        this.measureContext = this.measureCanvas.getContext('2d');
    }
    
    /**
     * Mede a largura de um texto com configurações específicas
     */
    measureTextWidth(text, fontSize, fontFamily, fontWeight = 'normal') {
        this.measureContext.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        return this.measureContext.measureText(text).width;
    }
    
    /**
     * Quebra um texto em múltiplas linhas baseado na largura máxima
     */
    wrapText(text, maxWidth) {
        if (!text || text.trim() === '') return [];
        
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = this.measureTextWidth(
                testLine, 
                this.config.fontSize, 
                this.config.fontFamily, 
                this.config.fontWeight
            );
            
            if (testWidth <= maxWidth || currentLine === '') {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    // Palavra muito longa, força quebra
                    lines.push(word);
                }
            }
            
            // Limita número de linhas
            if (lines.length >= this.config.maxLines - 1 && currentLine) {
                // Se há mais texto, adiciona "..." na última linha
                const remainingWords = words.slice(i + 1);
                if (remainingWords.length > 0) {
                    const lastLineWithEllipsis = currentLine + '...';
                    const ellipsisWidth = this.measureTextWidth(
                        lastLineWithEllipsis,
                        this.config.fontSize,
                        this.config.fontFamily,
                        this.config.fontWeight
                    );
                    
                    if (ellipsisWidth <= maxWidth) {
                        currentLine = lastLineWithEllipsis;
                    } else {
                        // Remove palavras até caber com "..."
                        const currentWords = currentLine.split(' ');
                        for (let j = currentWords.length - 1; j >= 0; j--) {
                            const testLine = currentWords.slice(0, j).join(' ') + '...';
                            const testWidth = this.measureTextWidth(
                                testLine,
                                this.config.fontSize,
                                this.config.fontFamily,
                                this.config.fontWeight
                            );
                            if (testWidth <= maxWidth) {
                                currentLine = testLine;
                                break;
                            }
                        }
                    }
                }
                break;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines.slice(0, this.config.maxLines);
    }
    
    /**
     * Renderiza texto com quebra automática no SVG
     */
    renderWrappedText(x, y, text, className = '') {
        // Remove textos anteriores da mesma classe
        this.svg.selectAll(`.${className}`).remove();
        
        if (!text || text.trim() === '') return { height: 0, lines: [] };
        
        const lines = this.wrapText(text, this.config.maxWidth);
        const lineHeight = this.config.fontSize * this.config.lineHeight;
        const totalHeight = lines.length * lineHeight;
        
        // Ajusta Y baseado no número de linhas para manter centralização
        const startY = lines.length > 1 ? y - ((lines.length - 1) * lineHeight / 2) : y;
        
        // Renderiza cada linha
        lines.forEach((line, index) => {
            this.svg.append('text')
                .attr('class', className)
                .attr('x', x)
                .attr('y', startY + (index * lineHeight))
                .attr('text-anchor', this.config.textAnchor)
                .attr('dominant-baseline', 'middle')
                .style('fill', this.config.fill || '#2C3E50')
                .style('font-family', this.config.fontFamily)
                .style('font-size', this.config.fontSize + 'px')
                .style('font-weight', this.config.fontWeight)
                .style('opacity', this.config.opacity || 1)
                .text(line);
        });
        
        return { 
            height: totalHeight, 
            lines: lines,
            lineHeight: lineHeight,
            actualLines: lines.length
        };
    }
    
    /**
     * Calcula altura necessária para um texto sem renderizar
     */
    calculateTextHeight(text, maxWidth) {
        if (!text || text.trim() === '') return 0;
        
        const lines = this.wrapText(text, maxWidth || this.config.maxWidth);
        const lineHeight = this.config.fontSize * this.config.lineHeight;
        return lines.length * lineHeight;
    }
}

/**
 * Renderiza títulos com quebra automática
 * Esta função será chamada pelas visualizações
 */
function renderTitlesWithWrap(svg, config, layout) {
    const textColor = config.textColor || TEMPLATE_CONFIG.defaults.textColor;
    const fontFamily = config.fontFamily || TEMPLATE_CONFIG.defaults.fontFamily;
    const svgWidth = layout.width || currentVisualizationWidth;
    const svgHeight = layout.height || 600; // ✅ NOVO: Altura do SVG
    const maxTextWidth = svgWidth - TEMPLATE_CONFIG.textWrap.padding;
    
    let currentY = layout.startY || 50;
    const results = {
        titleHeight: 0,
        subtitleHeight: 0,
        sourceHeight: 0,
        totalHeight: 0,
        availableHeight: 0, // ✅ NOVO: Altura disponível para gráfico
        sourceY: 0 // ✅ NOVO: Posição real da fonte
    };
    
    // Remove textos anteriores
    svg.selectAll('.chart-title-svg, .chart-subtitle-svg, .chart-source-svg').remove();
    
    // ✅ TÍTULO com quebra automática
    if (config.title && config.title.trim()) {
        const titleWrapper = new SVGTextWrapper(svg, {
            maxWidth: maxTextWidth,
            fontSize: config.titleSize || 24,
            fontFamily: fontFamily,
            fontWeight: 'bold',
            maxLines: TEMPLATE_CONFIG.textWrap.maxLines.title,
            fill: textColor,
            lineHeight: TEMPLATE_CONFIG.textWrap.lineHeight
        });
        
        const titleResult = titleWrapper.renderWrappedText(
            svgWidth / 2, 
            currentY, 
            config.title, 
            'chart-title-svg'
        );
        
        results.titleHeight = titleResult.height;
        currentY += titleResult.height + 20; // Espaçamento após título
    }
    
    // ✅ SUBTÍTULO com quebra automática
    if (config.subtitle && config.subtitle.trim()) {
        const subtitleWrapper = new SVGTextWrapper(svg, {
            maxWidth: maxTextWidth,
            fontSize: config.subtitleSize || 16,
            fontFamily: fontFamily,
            fontWeight: 'normal',
            maxLines: TEMPLATE_CONFIG.textWrap.maxLines.subtitle,
            fill: textColor,
            opacity: 0.8,
            lineHeight: TEMPLATE_CONFIG.textWrap.lineHeight
        });
        
        const subtitleResult = subtitleWrapper.renderWrappedText(
            svgWidth / 2, 
            currentY, 
            config.subtitle, 
            'chart-subtitle-svg'
        );
        
        results.subtitleHeight = subtitleResult.height;
        currentY += subtitleResult.height + 30; // Espaçamento após subtítulo
    }
    
    // ✅ CALCULA ALTURA E POSIÇÃO DA FONTE DOS DADOS
    let sourceHeight = 0;
    if (config.dataSource && config.dataSource.trim()) {
        const sourceWrapper = new SVGTextWrapper(null, { // ✅ Só para calcular altura
            maxWidth: maxTextWidth * 1.1,
            fontSize: 11,
            fontWeight: 'normal',
            maxLines: TEMPLATE_CONFIG.textWrap.maxLines.source,
            lineHeight: 1.15
        });
        
        sourceHeight = sourceWrapper.calculateTextHeight(config.dataSource, maxTextWidth * 1.1);
    }
    
    // ✅ NOVO: Calcula altura disponível para o gráfico
    const marginBottom = 20; // Margem mínima na parte inferior
    const sourceSpacing = sourceHeight > 0 ? 25 : 0; // Espaçamento antes da fonte
    results.availableHeight = svgHeight - currentY - sourceHeight - sourceSpacing - marginBottom;
    results.sourceY = svgHeight - marginBottom - sourceHeight; // ✅ Posição dinâmica da fonte
    
    // ✅ FONTE DOS DADOS - POSIÇÃO DINÂMICA
    if (config.dataSource && config.dataSource.trim()) {
        const sourceWrapper = new SVGTextWrapper(svg, {
            maxWidth: maxTextWidth * 1.1,
            fontSize: 11,
            fontFamily: fontFamily,
            fontWeight: 'normal',
            maxLines: TEMPLATE_CONFIG.textWrap.maxLines.source,
            fill: textColor,
            opacity: 0.6,
            lineHeight: 1.15
        });
        
        const sourceResult = sourceWrapper.renderWrappedText(
            svgWidth / 2, 
            results.sourceY, // ✅ Usa posição dinâmica
            config.dataSource, 
            'chart-source-svg'
        );
        
        results.sourceHeight = sourceResult.height;
    }
    
    results.totalHeight = results.titleHeight + results.subtitleHeight + 50; // +50 para espaçamentos
    results.contentStartY = currentY;
    
    return results;
}

/**
 * Calcula altura necessária para títulos sem renderizar
 * ✅ CORRIGIDO: Inclui espaço para fonte dos dados
 * Útil para as visualizações calcularem layout
 */
function calculateTitlesHeight(config, maxWidth) {
    const textMaxWidth = (maxWidth || currentVisualizationWidth) - TEMPLATE_CONFIG.textWrap.padding;
    let totalHeight = 0;
    
    // Altura do título
    if (config.title && config.title.trim()) {
        const titleWrapper = new SVGTextWrapper(null, {
            maxWidth: textMaxWidth,
            fontSize: config.titleSize || 24,
            fontWeight: 'bold',
            maxLines: TEMPLATE_CONFIG.textWrap.maxLines.title,
            lineHeight: TEMPLATE_CONFIG.textWrap.lineHeight
        });
        
        totalHeight += titleWrapper.calculateTextHeight(config.title, textMaxWidth) + 10;
    }
    
    // Altura do subtítulo
    if (config.subtitle && config.subtitle.trim()) {
        const subtitleWrapper = new SVGTextWrapper(null, {
            maxWidth: textMaxWidth,
            fontSize: config.subtitleSize || 16,
            fontWeight: 'normal',
            maxLines: TEMPLATE_CONFIG.textWrap.maxLines.subtitle,
            lineHeight: TEMPLATE_CONFIG.textWrap.lineHeight
        });
        
        totalHeight += subtitleWrapper.calculateTextHeight(config.subtitle, textMaxWidth) + 20;
    }
    
    // ✅ NOVO: Inclui altura da fonte dos dados no cálculo total
    if (config.dataSource && config.dataSource.trim()) {
        const sourceWrapper = new SVGTextWrapper(null, {
            maxWidth: textMaxWidth * 1.1,
            fontSize: 11,
            fontWeight: 'normal',
            maxLines: TEMPLATE_CONFIG.textWrap.maxLines.source,
            lineHeight: 1.15
        });
        
        const sourceHeight = sourceWrapper.calculateTextHeight(config.dataSource, textMaxWidth * 1.1);
        totalHeight += sourceHeight + 25; // ✅ Inclui fonte + espaçamento
    }
    
    return totalHeight;
}

/**
 * Define a largura da visualização atual (chamado pelas visualizações)
 */
function setVisualizationWidth(width, format = 'auto') {
    if (typeof width === 'number') {
        currentVisualizationWidth = width;
    } else if (typeof width === 'string' && TEMPLATE_CONFIG.textWrap.defaultWidths[width]) {
        currentVisualizationWidth = TEMPLATE_CONFIG.textWrap.defaultWidths[width];
    }
    
    console.log(`📐 Visualization width set to: ${currentVisualizationWidth}px (format: ${format})`);
}

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================

/**
 * Inicializa o sistema de controles do template
 */
function initialize(callback) {
    console.log('🎛️ Initializing focused template controls with text wrap...');
    updateCallback = callback;
    
    // Lê valores atuais do HTML primeiro
    readCurrentHTMLValues();
    
    // Inicializa apenas controles essenciais
    initializeBasicControls();
    initializeColorControls();
    initializeTypographyControls();
    
    // Carrega estado inicial
    loadInitialState();
    
    console.log('✅ Template controls initialized - focused approach with text wrapping');
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
// EXPORTAÇÕES GLOBAIS - COM SISTEMA DE QUEBRA DE TEXTO
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
    
    // ✅ SISTEMA DE QUEBRA DE TEXTO - NOVO
    renderTitlesWithWrap,
    calculateTitlesHeight,
    setVisualizationWidth,
    SVGTextWrapper,
    
    // Configurações
    TEMPLATE_CONFIG
};

console.log('✅ Template Controls with Text Wrap loaded - handles automatic line breaks for titles');