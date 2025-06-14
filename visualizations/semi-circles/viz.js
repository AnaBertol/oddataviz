/**
 * GRÁFICO DE MEIO CÍRCULOS - D3.js SINCRONIZADO
 * Visualização para comparação entre duas categorias
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURAÇÕES CENTRALIZADAS E FIXAS
    // ==========================================================================

    const SEMI_CIRCLES_SETTINGS = {
        // Sempre usa formato retangular - dimensões fixas
        fixedWidth: 800,
        fixedHeight: 600,
        
        margins: {
            top: 60, 
            right: 60, 
            bottom: 80, 
            left: 60
        },
        
        spacing: {
            titleToSubtitle: 20,
            subtitleToChart: 30,
            chartToLegend: 25,
            legendToSource: 20,
            betweenCircles: 30,
            axisOffset: 10
        },
        
        animationDuration: 800,
        staggerDelay: 100
    };

    // CONFIGURAÇÃO PADRÃO CENTRALIZADA
    const DEFAULT_CONFIG = {
        width: 800,
        height: 600,
        screenFormat: 'rectangular',
        title: 'Comparação entre Categorias',
        subtitle: 'Visualização em meio círculos',
        dataSource: 'Dados de Exemplo, 2024',
        category1: 'Personagens',
        category2: 'Jogadores',
        categoryColors: ['#FF1493', '#00CED1'],
        backgroundColor: '#FFFFFF',
        textColor: '#2C3E50',
        fontFamily: 'Inter',
        titleSize: 24,
        subtitleSize: 16,
        labelSize: 12,
        valueSize: 16,
        showValues: true,
        showPercentages: false,
        showCategoryLabels: true,
        showParameterLabels: true,
        circleSize: 80,
        circleSpacing: 30,
        strokeWidth: 2,
        showAxisLine: true,
        showAnimation: true
    };

    // ==========================================================================
    // VARIÁVEIS PRIVADAS
    // ==========================================================================

    let vizSvg = null;
    let vizChartGroup = null;
    let vizCurrentData = null;
    let vizProcessedData = null;
    let vizCurrentConfig = null;
    let vizLayoutInfo = null;

    // ==========================================================================
    // SINCRONIZAÇÃO HTML ↔ JAVASCRIPT
    // ==========================================================================

    function syncHTMLWithDefaults() {
        console.log('🔄 Sincronizando HTML com configurações padrão...');
        
        // Cores
        const bgColor = document.getElementById('bg-color');
        const bgColorText = document.getElementById('bg-color-text');
        const textColor = document.getElementById('text-color');
        const textColorText = document.getElementById('text-color-text');
        
        if (bgColor) bgColor.value = DEFAULT_CONFIG.backgroundColor;
        if (bgColorText) bgColorText.value = DEFAULT_CONFIG.backgroundColor;
        if (textColor) textColor.value = DEFAULT_CONFIG.textColor;
        if (textColorText) textColorText.value = DEFAULT_CONFIG.textColor;
        
        // Cores das categorias
        const cat1Color = document.getElementById('category-1-color');
        const cat1ColorText = document.getElementById('category-1-color-text');
        const cat1Preview = document.getElementById('category-1-preview');
        
        if (cat1Color) cat1Color.value = DEFAULT_CONFIG.categoryColors[0];
        if (cat1ColorText) cat1ColorText.value = DEFAULT_CONFIG.categoryColors[0];
        if (cat1Preview) cat1Preview.style.background = DEFAULT_CONFIG.categoryColors[0];
        
        const cat2Color = document.getElementById('category-2-color');
        const cat2ColorText = document.getElementById('category-2-color-text');
        const cat2Preview = document.getElementById('category-2-preview');
        
        if (cat2Color) cat2Color.value = DEFAULT_CONFIG.categoryColors[1];
        if (cat2ColorText) cat2ColorText.value = DEFAULT_CONFIG.categoryColors[1];
        if (cat2Preview) cat2Preview.style.background = DEFAULT_CONFIG.categoryColors[1];
        
        // Textos
        const titleInput = document.getElementById('chart-title');
        const subtitleInput = document.getElementById('chart-subtitle');
        const sourceInput = document.getElementById('data-source');
        const cat1NameInput = document.getElementById('category-1-name');
        const cat2NameInput = document.getElementById('category-2-name');
        
        if (titleInput) titleInput.value = DEFAULT_CONFIG.title;
        if (subtitleInput) subtitleInput.value = DEFAULT_CONFIG.subtitle;
        if (sourceInput) sourceInput.value = DEFAULT_CONFIG.dataSource;
        if (cat1NameInput) cat1NameInput.value = DEFAULT_CONFIG.category1;
        if (cat2NameInput) cat2NameInput.value = DEFAULT_CONFIG.category2;
        
        // Tipografia
        const fontSelect = document.getElementById('font-family');
        const titleSize = document.getElementById('title-size');
        const subtitleSize = document.getElementById('subtitle-size');
        const labelSize = document.getElementById('label-size');
        const valueSize = document.getElementById('value-size');
        
        if (fontSelect) fontSelect.value = DEFAULT_CONFIG.fontFamily;
        if (titleSize) titleSize.value = DEFAULT_CONFIG.titleSize;
        if (subtitleSize) subtitleSize.value = DEFAULT_CONFIG.subtitleSize;
        if (labelSize) labelSize.value = DEFAULT_CONFIG.labelSize;
        if (valueSize) valueSize.value = DEFAULT_CONFIG.valueSize;
        
        // Controles de exibição
        const showValues = document.getElementById('show-values');
        const showPercentages = document.getElementById('show-percentages');
        const showCategoryLabels = document.getElementById('show-category-labels');
        const showParameterLabels = document.getElementById('show-parameter-labels');
        
        if (showValues) showValues.checked = DEFAULT_CONFIG.showValues;
        if (showPercentages) showPercentages.checked = DEFAULT_CONFIG.showPercentages;
        if (showCategoryLabels) showCategoryLabels.checked = DEFAULT_CONFIG.showCategoryLabels;
        if (showParameterLabels) showParameterLabels.checked = DEFAULT_CONFIG.showParameterLabels;
        
        // Controles específicos
        const circleSize = document.getElementById('circle-size');
        const circleSpacing = document.getElementById('circle-spacing');
        const strokeWidth = document.getElementById('stroke-width');
        const showAxisLine = document.getElementById('show-axis-line');
        const showAnimation = document.getElementById('show-animation');
        
        if (circleSize) circleSize.value = DEFAULT_CONFIG.circleSize;
        if (circleSpacing) circleSpacing.value = DEFAULT_CONFIG.circleSpacing;
        if (strokeWidth) strokeWidth.value = DEFAULT_CONFIG.strokeWidth;
        if (showAxisLine) showAxisLine.checked = DEFAULT_CONFIG.showAxisLine;
        if (showAnimation) showAnimation.checked = DEFAULT_CONFIG.showAnimation;
        
        console.log('✅ HTML sincronizado com configurações padrão');
    }

    // ==========================================================================
    // INICIALIZAÇÃO
    // ==========================================================================

    