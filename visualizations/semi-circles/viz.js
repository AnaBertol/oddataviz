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
        categoryColors: ['#6F02FD', '#6CDADE'], // Roxo e Turquesa da Odd
        backgroundColor: '#FFFFFF',
        textColor: '#2C3E50',
        fontFamily: 'Inter',
        titleSize: 24,
        subtitleSize: 16,
        labelSize: 12,
        valueSize: 16,
        showValues: true,
        showCategoryLabels: true,
        showParameterLabels: true,
        circleSize: 80,
        circleSpacing: 30,
        showAxisLine: true,
        showAnimation: false, // Padrão OFF
        showCircleOutline: true, // Padrão ON
        outlineWidth: 1,
        outlineStyle: 'dashed' // Padrão tracejado
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
        const showCategoryLabels = document.getElementById('show-category-labels');
        const showParameterLabels = document.getElementById('show-parameter-labels');
        
        if (showValues) showValues.checked = DEFAULT_CONFIG.showValues;
        if (showCategoryLabels) showCategoryLabels.checked = DEFAULT_CONFIG.showCategoryLabels;
        if (showParameterLabels) showParameterLabels.checked = DEFAULT_CONFIG.showParameterLabels;
        
        // Controles específicos
        const circleSize = document.getElementById('circle-size');
        const circleSpacing = document.getElementById('circle-spacing');
        const showAxisLine = document.getElementById('show-axis-line');
        const showAnimation = document.getElementById('show-animation');
        const showCircleOutline = document.getElementById('show-circle-outline');
        const outlineWidth = document.getElementById('outline-width');
        
        if (circleSize) circleSize.value = DEFAULT_CONFIG.circleSize;
        if (circleSpacing) circleSpacing.value = DEFAULT_CONFIG.circleSpacing;
        if (showAxisLine) showAxisLine.checked = DEFAULT_CONFIG.showAxisLine;
        if (showAnimation) showAnimation.checked = DEFAULT_CONFIG.showAnimation;
        if (showCircleOutline) showCircleOutline.checked = DEFAULT_CONFIG.showCircleOutline;
        if (outlineWidth) outlineWidth.value = DEFAULT_CONFIG.outlineWidth;
        
        // Define o radio button padrão para tracejado
        const dashedRadio = document.querySelector('input[name="outline-style"][value="dashed"]');
        if (dashedRadio) dashedRadio.checked = true;
        
        console.log('✅ HTML sincronizado com configurações padrão');
    }

    // ==========================================================================
    // INICIALIZAÇÃO
    // ==========================================================================

    function initVisualization() {
        if (typeof d3 === 'undefined') {
            console.error('D3.js não está carregado!');
            return;
        }
        
        console.log('⚪ Inicializando Gráfico de Meio Círculos...');
        
        // Sincroniza HTML ANTES de qualquer renderização
        syncHTMLWithDefaults();
        
        createBaseSVG();
        
        // Carrega dados de exemplo após breve delay
        setTimeout(loadSampleData, 100);
    }

    function loadSampleData() {
        if (window.getSampleData && typeof window.getSampleData === 'function') {
            const sampleData = window.getSampleData();
            if (sampleData && sampleData.data) {
                console.log('📊 Carregando dados de exemplo...');
                renderVisualization(sampleData.data, Object.assign({}, DEFAULT_CONFIG));
            }
        }
    }

    function createBaseSVG() {
        const chartContainer = document.getElementById('chart');
        if (!chartContainer) return;
        
        // Remove placeholder e SVG anterior
        const placeholder = chartContainer.querySelector('.chart-placeholder');
        if (placeholder) placeholder.remove();
        
        d3.select(chartContainer).select('svg').remove();
        
        // Cria SVG com dimensões fixas
        vizSvg = d3.select(chartContainer)
            .append('svg')
            .attr('id', 'semi-circles-viz')
            .attr('width', SEMI_CIRCLES_SETTINGS.fixedWidth)
            .attr('height', SEMI_CIRCLES_SETTINGS.fixedHeight);
        
        // Grupos organizados
        vizChartGroup = vizSvg.append('g').attr('class', 'chart-group');
    }

    // ==========================================================================
    // CÁLCULO DE LAYOUT
    // ==========================================================================

    function calculateLayout(config, dataLength) {
        const margins = SEMI_CIRCLES_SETTINGS.margins;
        const spacing = SEMI_CIRCLES_SETTINGS.spacing;
        
        let availableWidth = SEMI_CIRCLES_SETTINGS.fixedWidth - margins.left - margins.right;
        let availableHeight = SEMI_CIRCLES_SETTINGS.fixedHeight - margins.top - margins.bottom;
        
        // Calcula altura dos títulos
        let titleHeight = 0;
        if (config.title) titleHeight += (config.titleSize || 24);
        if (config.subtitle) titleHeight += spacing.titleToSubtitle + (config.subtitleSize || 16);
        if (titleHeight > 0) titleHeight += spacing.subtitleToChart;
        
        // Reserva espaço para fonte dos dados e rótulos dos parâmetros
        const sourceHeight = config.dataSource ? 15 + spacing.legendToSource : 0;
        const parameterLabelsHeight = config.showParameterLabels ? 25 : 0;
        
        // Área disponível para os círculos
        const chartAreaHeight = availableHeight - titleHeight - sourceHeight - parameterLabelsHeight;
        
        // Calcula layout dos círculos
        const circleSize = config.circleSize || DEFAULT_CONFIG.circleSize;
        const circleSpacing = config.circleSpacing || DEFAULT_CONFIG.circleSpacing;
        
        // Largura necessária para os círculos
        const totalCirclesWidth = (circleSize * dataLength) + (circleSpacing * (dataLength - 1));
        
        // Largura dos rótulos das categorias (se existir)
        const categoryLabelsWidth = config.showCategoryLabels ? 90 : 0;
        const gapBetweenLabelsAndCircles = config.showCategoryLabels ? 20 : 0;
        
        // Largura total do conjunto (rótulos + gap + círculos)
        const totalContentWidth = categoryLabelsWidth + gapBetweenLabelsAndCircles + totalCirclesWidth;
        
        // Centraliza o conjunto completo na tela
        const contentStartX = margins.left + (availableWidth - totalContentWidth) / 2;
        
        // Posições específicas
        const categoryLabelsX = contentStartX + categoryLabelsWidth - 10; // 10px antes do gap
        const circlesStartX = contentStartX + categoryLabelsWidth + gapBetweenLabelsAndCircles;
        const circlesY = margins.top + titleHeight + (chartAreaHeight - circleSize) / 2;
        
        // Linha central (eixo divisório)
        const axisY = circlesY + circleSize / 2;
        
        return {
            margins: margins,
            spacing: spacing,
            availableWidth: availableWidth,
            availableHeight: availableHeight,
            chartAreaHeight: chartAreaHeight,
            totalContentWidth: totalContentWidth,
            circles: {
                startX: circlesStartX,
                y: circlesY,
                size: circleSize,
                spacing: circleSpacing,
                axisY: axisY
            },
            titles: {
                titleY: margins.top + (config.titleSize || 24),
                subtitleY: margins.top + (config.titleSize || 24) + spacing.titleToSubtitle + (config.subtitleSize || 16)
            },
            categoryLabels: {
                category1Y: axisY - 25,
                category2Y: axisY + 25,
                x: categoryLabelsX,
                show: config.showCategoryLabels
            },
            source: {
                y: SEMI_CIRCLES_SETTINGS.fixedHeight - margins.bottom + spacing.legendToSource
            },
            parameterLabels: {
                y: circlesY + circleSize + 20
            },
            axisLine: {
                // Linha vai dos rótulos até o fim dos círculos
                startX: config.showCategoryLabels ? contentStartX : circlesStartX,
                endX: circlesStartX + totalCirclesWidth
            }
        };
    }

    // ==========================================================================
    // PROCESSAMENTO DE DADOS
    // ==========================================================================

    function processDataForSemiCircles(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { processedData: [] };
        }
        
        const processedData = data.map(function(d) {
            const cat1Value = parseFloat(d.categoria_1) || 0;
            const cat2Value = parseFloat(d.categoria_2) || 0;
            const total = cat1Value + cat2Value;
            
            return {
                parametro: d.parametro,
                categoria_1: cat1Value,
                categoria_2: cat2Value,
                total: total,
                cat1Percentage: total > 0 ? (cat1Value / total) * 100 : 0,
                cat2Percentage: total > 0 ? (cat2Value / total) * 100 : 0,
                maxValue: Math.max(cat1Value, cat2Value)
            };
        });
        
        // Calcula valor máximo global para normalização
        const globalMax = Math.max.apply(Math, processedData.map(function(d) { return d.maxValue; }));
        
        processedData.forEach(function(d) {
            d.normalizedCat1 = globalMax > 0 ? d.categoria_1 / globalMax : 0;
            d.normalizedCat2 = globalMax > 0 ? d.categoria_2 / globalMax : 0;
        });
        
        return { processedData: processedData, globalMax: globalMax };
    }

    // ==========================================================================
    // RENDERIZAÇÃO PRINCIPAL
    // ==========================================================================

    function renderVisualization(data, config) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            showNoDataMessage();
            return;
        }
        
        vizCurrentData = data;
        vizCurrentConfig = Object.assign({}, DEFAULT_CONFIG, config);
        
        const result = processDataForSemiCircles(data);
        vizProcessedData = result.processedData;
        
        if (vizProcessedData.length === 0) {
            showNoDataMessage();
            return;
        }
        
        vizLayoutInfo = calculateLayout(vizCurrentConfig, vizProcessedData.length);
        
        updateSVGDimensions();
        renderSemiCircles();
        renderTitles();
        renderAxisLine();
        renderCategoryLabels();
        renderParameterLabels();
        renderDataSource();
        
        console.log('🎨 Meio círculos renderizados:', vizProcessedData.length + ' parâmetros');
    }

    function updateSVGDimensions() {
        if (!vizSvg) return;
        
        // Força dimensões fixas
        vizSvg.attr('width', SEMI_CIRCLES_SETTINGS.fixedWidth)
              .attr('height', SEMI_CIRCLES_SETTINGS.fixedHeight);
        
        vizSvg.selectAll('.svg-background').remove();
        
        vizSvg.insert('rect', ':first-child')
            .attr('class', 'svg-background')
            .attr('width', SEMI_CIRCLES_SETTINGS.fixedWidth)
            .attr('height', SEMI_CIRCLES_SETTINGS.fixedHeight)
            .attr('fill', vizCurrentConfig.backgroundColor);
    }

    function renderSemiCircles() {
        vizChartGroup.selectAll('.circle-group').remove();
        
        const layout = vizLayoutInfo.circles;
        
        // Cria grupos para cada parâmetro
        const circleGroups = vizChartGroup.selectAll('.circle-group')
            .data(vizProcessedData)
            .enter()
            .append('g')
            .attr('class', 'circle-group')
            .attr('transform', function(d, i) {
                return 'translate(' + (layout.startX + i * (layout.size + layout.spacing)) + ',' + layout.y + ')';
            });
        
        // Adiciona círculos de contorno se habilitado - INDIVIDUAL POR PARÂMETRO
        if (vizCurrentConfig.showCircleOutline) {
            circleGroups.append('circle')
                .attr('class', 'circle-outline')
                .attr('cx', layout.size / 2)
                .attr('cy', layout.size / 2)
                .attr('r', function(d) {
                    // Raio baseado no maior valor deste parâmetro específico
                    const maxValueThisParam = Math.max(d.categoria_1, d.categoria_2);
                    const globalMax = Math.max.apply(Math, vizProcessedData.map(function(item) { 
                        return Math.max(item.categoria_1, item.categoria_2); 
                    }));
                    return (layout.size / 2) * Math.sqrt(maxValueThisParam / globalMax);
                })
                .attr('fill', 'none')
                .attr('stroke', vizCurrentConfig.textColor)
                .attr('stroke-width', vizCurrentConfig.outlineWidth)
                .attr('stroke-dasharray', vizCurrentConfig.outlineStyle === 'dashed' ? '5,5' : 'none')
                .attr('opacity', 0.4);
        }
        
        // Meio círculo superior (categoria 1) - SEM BORDA
        const upperSemiCircles = circleGroups.append('path')
            .attr('class', 'semi-circle-upper')
            .attr('d', function(d) {
                const radius = (layout.size / 2) * Math.sqrt(d.normalizedCat1);
                const cx = layout.size / 2;
                const cy = layout.size / 2;
                return 'M ' + (cx - radius) + ' ' + cy + ' A ' + radius + ' ' + radius + ' 0 0 1 ' + (cx + radius) + ' ' + cy + ' Z';
            })
            .attr('fill', vizCurrentConfig.categoryColors[0])
            .style('cursor', 'pointer');
        
        // Meio círculo inferior (categoria 2) - SEM BORDA
        const lowerSemiCircles = circleGroups.append('path')
            .attr('class', 'semi-circle-lower')
            .attr('d', function(d) {
                const radius = (layout.size / 2) * Math.sqrt(d.normalizedCat2);
                const cx = layout.size / 2;
                const cy = layout.size / 2;
                return 'M ' + (cx - radius) + ' ' + cy + ' A ' + radius + ' ' + radius + ' 0 0 0 ' + (cx + radius) + ' ' + cy + ' Z';
            })
            .attr('fill', vizCurrentConfig.categoryColors[1])
            .style('cursor', 'pointer');
        
        // Adiciona valores se habilitado
        if (vizCurrentConfig.showValues) {
            // Valores categoria 1 (acima do eixo - 11px do eixo)
            circleGroups.append('text')
                .attr('class', 'value-text-upper')
                .attr('x', layout.size / 2)
                .attr('y', layout.size / 2 - 11) // 11px do eixo
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .style('fill', function(d) {
                    return getContrastColor(vizCurrentConfig.categoryColors[0]);
                })
                .style('font-family', vizCurrentConfig.fontFamily)
                .style('font-size', vizCurrentConfig.valueSize + 'px') // SEM || fallback - força usar o valor atual
                .style('font-weight', '600')
                .style('stroke', vizCurrentConfig.categoryColors[0])
                .style('stroke-width', '3px')
                .style('paint-order', 'stroke')
                .text(function(d) { return d.categoria_1; });
            
            // Valores categoria 2 (abaixo do eixo - 11px do eixo)
            circleGroups.append('text')
                .attr('class', 'value-text-lower')
                .attr('x', layout.size / 2)
                .attr('y', layout.size / 2 + 11) // 11px do eixo
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .style('fill', function(d) {
                    return getContrastColor(vizCurrentConfig.categoryColors[1]);
                })
                .style('font-family', vizCurrentConfig.fontFamily)
                .style('font-size', vizCurrentConfig.valueSize + 'px') // SEM || fallback - força usar o valor atual
                .style('font-weight', '600')
                .style('stroke', vizCurrentConfig.categoryColors[1])
                .style('stroke-width', '3px')
                .style('paint-order', 'stroke')
                .text(function(d) { return d.categoria_2; });
        }
        
        // Adiciona interações
        setupCircleInteractions(circleGroups);
        
        // Animação se habilitada
        if (vizCurrentConfig.showAnimation) {
            upperSemiCircles
                .style('opacity', 0)
                .transition()
                .duration(SEMI_CIRCLES_SETTINGS.animationDuration)
                .delay(function(d, i) { return i * SEMI_CIRCLES_SETTINGS.staggerDelay; })
                .style('opacity', 1);
            
            lowerSemiCircles
                .style('opacity', 0)
                .transition()
                .duration(SEMI_CIRCLES_SETTINGS.animationDuration)
                .delay(function(d, i) { return i * SEMI_CIRCLES_SETTINGS.staggerDelay + 200; })
                .style('opacity', 1);
        }
    }

    function setupCircleInteractions(circleGroups) {
        circleGroups.selectAll('.semi-circle-upper, .semi-circle-lower')
            .on('mouseover', handleCircleHover)
            .on('mouseout', handleCircleOut)
            .on('click', handleCircleClick);
    }

    function renderAxisLine() {
        vizSvg.selectAll('.axis-line').remove();
        
        if (!vizCurrentConfig.showAxisLine) return;
        
        const layout = vizLayoutInfo.circles;
        const axisLayout = vizLayoutInfo.axisLine;
        const lineY = layout.axisY;
        
        vizSvg.append('line')
            .attr('class', 'axis-line')
            .attr('x1', axisLayout.startX)
            .attr('x2', axisLayout.endX)
            .attr('y1', lineY)
            .attr('y2', lineY)
            .attr('stroke', vizCurrentConfig.textColor)
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '5,5')
            .attr('opacity', 0.5);
    }

    function renderTitles() {
        vizSvg.selectAll('.chart-title-svg, .chart-subtitle-svg').remove();
        
        const layout = vizLayoutInfo.titles;
        
        if (vizCurrentConfig.title) {
            vizSvg.append('text')
                .attr('class', 'chart-title-svg')
                .attr('x', SEMI_CIRCLES_SETTINGS.fixedWidth / 2)
                .attr('y', layout.titleY)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor)
                .style('font-family', vizCurrentConfig.fontFamily)
                .style('font-size', (vizCurrentConfig.titleSize || 24) + 'px')
                .style('font-weight', 'bold')
                .text(vizCurrentConfig.title);
        }
        
        if (vizCurrentConfig.subtitle) {
            vizSvg.append('text')
                .attr('class', 'chart-subtitle-svg')
                .attr('x', SEMI_CIRCLES_SETTINGS.fixedWidth / 2)
                .attr('y', layout.subtitleY)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor)
                .style('font-family', vizCurrentConfig.fontFamily)
                .style('font-size', (vizCurrentConfig.subtitleSize || 16) + 'px')
                .style('opacity', 0.8)
                .text(vizCurrentConfig.subtitle);
        }
    }

    function renderCategoryLabels() {
        vizSvg.selectAll('.category-label').remove();
        
        if (!vizCurrentConfig.showCategoryLabels) return;
        
        const layout = vizLayoutInfo.categoryLabels;
        
        // Label categoria 1 (superior)
        vizSvg.append('text')
            .attr('class', 'category-label category-1-label')
            .attr('x', layout.x)
            .attr('y', layout.category1Y)
            .attr('text-anchor', 'end') // Alinhado à direita para ficar próximo aos círculos
            .style('fill', vizCurrentConfig.categoryColors[0])
            .style('font-family', vizCurrentConfig.fontFamily)
            .style('font-size', (vizCurrentConfig.labelSize + 2) + 'px')
            .style('font-weight', '600')
            .text(vizCurrentConfig.category1 || 'Categoria 1');
        
        // Label categoria 2 (inferior)
        vizSvg.append('text')
            .attr('class', 'category-label category-2-label')
            .attr('x', layout.x)
            .attr('y', layout.category2Y)
            .attr('text-anchor', 'end') // Alinhado à direita para ficar próximo aos círculos
            .style('fill', vizCurrentConfig.categoryColors[1])
            .style('font-family', vizCurrentConfig.fontFamily)
            .style('font-size', (vizCurrentConfig.labelSize + 2) + 'px')
            .style('font-weight', '600')
            .text(vizCurrentConfig.category2 || 'Categoria 2');
    }

    function renderParameterLabels() {
        vizSvg.selectAll('.parameter-label').remove();
        
        if (!vizCurrentConfig.showParameterLabels) return;
        
        const layout = vizLayoutInfo.circles;
        const labelY = vizLayoutInfo.parameterLabels.y;
        
        vizProcessedData.forEach(function(d, i) {
            const labelX = layout.startX + i * (layout.size + layout.spacing) + layout.size / 2;
            
            vizSvg.append('text')
                .attr('class', 'parameter-label')
                .attr('x', labelX)
                .attr('y', labelY)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor)
                .style('font-family', vizCurrentConfig.fontFamily)
                .style('font-size', vizCurrentConfig.labelSize + 'px')
                .style('font-weight', '500')
                .text(d.parametro);
        });
    }

    function renderDataSource() {
        vizSvg.selectAll('.chart-source-svg').remove();
        
        if (vizCurrentConfig.dataSource) {
            vizSvg.append('text')
                .attr('class', 'chart-source-svg')
                .attr('x', SEMI_CIRCLES_SETTINGS.fixedWidth / 2)
                .attr('y', vizLayoutInfo.source.y)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor)
                .style('font-family', vizCurrentConfig.fontFamily)
                .style('font-size', '11px')
                .style('opacity', 0.6)
                .text('Fonte: ' + vizCurrentConfig.dataSource);
        }
    }

    // ==========================================================================
    // INTERAÇÕES
    // ==========================================================================

    function handleCircleHover(event, d) {
        const isUpper = event.target.classList.contains('semi-circle-upper');
        const category = isUpper ? vizCurrentConfig.category1 : vizCurrentConfig.category2;
        const value = isUpper ? d.categoria_1 : d.categoria_2;
        const percentage = isUpper ? d.cat1Percentage : d.cat2Percentage;
        
        // Destaca o meio círculo
        d3.select(event.target)
            .transition()
            .duration(200)
            .style('opacity', 0.8);
        
        showTooltip(event, {
            parametro: d.parametro,
            category: category,
            value: value,
            percentage: percentage
        });
    }

    function handleCircleOut(event, d) {
        d3.select(event.target)
            .transition()
            .duration(200)
            .style('opacity', 1);
        
        hideTooltip();
    }

    function handleCircleClick(event, d) {
        const isUpper = event.target.classList.contains('semi-circle-upper');
        const category = isUpper ? vizCurrentConfig.category1 : vizCurrentConfig.category2;
        const value = isUpper ? d.categoria_1 : d.categoria_2;
        
        if (window.OddVizApp && window.OddVizApp.showNotification) {
            window.OddVizApp.showNotification(
                d.parametro + ' - ' + category + ': ' + value, 
                'info'
            );
        }
    }

    function showTooltip(event, data) {
        hideTooltip();
        
        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'viz-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0,0,0,0.9)')
            .style('color', 'white')
            .style('padding', '10px')
            .style('border-radius', '6px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .html(
                '<div style="font-weight: bold; margin-bottom: 4px;">' + data.parametro + '</div>' +
                '<div style="margin-bottom: 2px;">' + data.category + '</div>' +
                '<div>Valor: ' + data.value + '</div>'
            );
        
        tooltip.transition().duration(200).style('opacity', 1);
    }

    function hideTooltip() {
        d3.selectAll('.viz-tooltip').remove();
    }

    // ==========================================================================
    // FUNÇÕES DE ATUALIZAÇÃO
    // ==========================================================================

    function onUpdate(newConfig) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        console.log('🔄 Atualizando meio círculos com nova configuração...');
        
        const mappedConfig = {
            // Dimensões sempre fixas para meio círculos
            width: SEMI_CIRCLES_SETTINGS.fixedWidth,
            height: SEMI_CIRCLES_SETTINGS.fixedHeight,
            screenFormat: 'rectangular',
            
            // Textos
            title: newConfig.title !== undefined ? newConfig.title : vizCurrentConfig.title,
            subtitle: newConfig.subtitle !== undefined ? newConfig.subtitle : vizCurrentConfig.subtitle,
            dataSource: newConfig.dataSource !== undefined ? newConfig.dataSource : vizCurrentConfig.dataSource,
            category1: newConfig.category1 !== undefined ? newConfig.category1 : vizCurrentConfig.category1,
            category2: newConfig.category2 !== undefined ? newConfig.category2 : vizCurrentConfig.category2,
            
            // Cores - mantém as cores atuais das categorias
            backgroundColor: newConfig.backgroundColor !== undefined ? newConfig.backgroundColor : vizCurrentConfig.backgroundColor,
            textColor: newConfig.textColor !== undefined ? newConfig.textColor : vizCurrentConfig.textColor,
            categoryColors: vizCurrentConfig.categoryColors, // Mantém cores atuais
            
            // Tipografia
            fontFamily: newConfig.fontFamily !== undefined ? newConfig.fontFamily : vizCurrentConfig.fontFamily,
            titleSize: newConfig.titleSize !== undefined ? newConfig.titleSize : vizCurrentConfig.titleSize,
            subtitleSize: newConfig.subtitleSize !== undefined ? newConfig.subtitleSize : vizCurrentConfig.subtitleSize,
            labelSize: newConfig.labelSize !== undefined ? newConfig.labelSize : vizCurrentConfig.labelSize,
            valueSize: newConfig.valueSize !== undefined ? newConfig.valueSize : vizCurrentConfig.valueSize,
            
            // Controles de exibição
            showValues: newConfig.showValues !== undefined ? newConfig.showValues : vizCurrentConfig.showValues,
            showCategoryLabels: newConfig.showCategoryLabels !== undefined ? newConfig.showCategoryLabels : vizCurrentConfig.showCategoryLabels,
            showParameterLabels: newConfig.showParameterLabels !== undefined ? newConfig.showParameterLabels : vizCurrentConfig.showParameterLabels,
            
            // Controles específicos
            circleSize: newConfig.circleSize !== undefined ? newConfig.circleSize : vizCurrentConfig.circleSize,
            circleSpacing: newConfig.circleSpacing !== undefined ? newConfig.circleSpacing : vizCurrentConfig.circleSpacing,
            showAxisLine: newConfig.showAxisLine !== undefined ? newConfig.showAxisLine : vizCurrentConfig.showAxisLine,
            showAnimation: newConfig.showAnimation !== undefined ? newConfig.showAnimation : vizCurrentConfig.showAnimation,
            showCircleOutline: newConfig.showCircleOutline !== undefined ? newConfig.showCircleOutline : vizCurrentConfig.showCircleOutline,
            outlineWidth: newConfig.outlineWidth !== undefined ? newConfig.outlineWidth : vizCurrentConfig.outlineWidth,
            outlineStyle: newConfig.outlineStyle !== undefined ? newConfig.outlineStyle : vizCurrentConfig.outlineStyle
        };
        
        // Atualiza configuração atual
        vizCurrentConfig = Object.assign({}, vizCurrentConfig, mappedConfig);
        
        // Re-renderiza
        renderVisualization(vizCurrentData, vizCurrentConfig);
    }

    function onSemiCirclesControlUpdate(semiCirclesControls) {
        Object.assign(vizCurrentConfig, semiCirclesControls);
        
        console.log('⚪ Controles meio círculos atualizados:', semiCirclesControls);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            renderVisualization(vizCurrentData, vizCurrentConfig);
        }
    }

    function updateCategoryColors(cat1Color, cat2Color) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        console.log('🎨 Cores das categorias atualizadas:', { cat1Color: cat1Color, cat2Color: cat2Color });
        
        // Atualiza configuração com novas cores
        vizCurrentConfig.categoryColors = [cat1Color, cat2Color];
        
        // Re-renderiza com novas cores
        renderVisualization(vizCurrentData, vizCurrentConfig);
    }

    function onDataLoaded(processedData) {
        if (processedData && processedData.data) {
            console.log('📊 Novos dados carregados:', processedData.data.length + ' parâmetros');
            renderVisualization(processedData.data, vizCurrentConfig || Object.assign({}, DEFAULT_CONFIG));
        }
    }

    // ==========================================================================
    // UTILITÁRIOS
    // ==========================================================================

    function getContrastColor(hexColor) {
        // Remove # se presente
        const hex = hexColor.replace('#', '');
        
        // Converte para RGB
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Calcula luminância usando fórmula padrão
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Retorna branco para cores escuras, preto para cores claras
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    function showNoDataMessage() {
        if (!vizSvg) return;
        
        vizSvg.selectAll('*').remove();
        
        const config = vizCurrentConfig || DEFAULT_CONFIG;
        
        vizSvg.append('rect')
            .attr('class', 'svg-background')
            .attr('width', SEMI_CIRCLES_SETTINGS.fixedWidth)
            .attr('height', SEMI_CIRCLES_SETTINGS.fixedHeight)
            .attr('fill', config.backgroundColor);
        
        const message = vizSvg.append('g')
            .attr('class', 'no-data-message')
            .attr('transform', 'translate(' + (SEMI_CIRCLES_SETTINGS.fixedWidth / 2) + ',' + (SEMI_CIRCLES_SETTINGS.fixedHeight / 2) + ')');
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-20px')
            .style('fill', config.textColor)
            .style('font-family', config.fontFamily)
            .style('font-size', '24px')
            .text('⚪');
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '10px')
            .style('fill', config.textColor)
            .style('font-family', config.fontFamily)
            .style('font-size', '16px')
            .text('Carregue dados para visualizar');
    }

    // ==========================================================================
    // EXPORTAÇÕES GLOBAIS
    // ==========================================================================

    window.SemiCirclesVisualization = {
        initVisualization: initVisualization,
        renderVisualization: renderVisualization,
        onUpdate: onUpdate,
        onSemiCirclesControlUpdate: onSemiCirclesControlUpdate,
        onDataLoaded: onDataLoaded,
        updateCategoryColors: updateCategoryColors,
        SEMI_CIRCLES_SETTINGS: SEMI_CIRCLES_SETTINGS,
        DEFAULT_CONFIG: DEFAULT_CONFIG
    };

    window.onDataLoaded = onDataLoaded;
    window.initVisualization = initVisualization;

    // ==========================================================================
    // AUTO-INICIALIZAÇÃO
    // ==========================================================================

    function waitForD3AndInit() {
        if (typeof d3 !== 'undefined' && document.readyState !== 'loading') {
            initVisualization();
        } else {
            setTimeout(waitForD3AndInit, 100);
        }
    }

    waitForD3AndInit();

})();
