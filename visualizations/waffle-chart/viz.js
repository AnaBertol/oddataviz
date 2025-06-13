/**
 * GRÁFICO DE WAFFLE - D3.js OTIMIZADO
 * Visualização em grade 10x10 com legendas diretas
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURAÇÕES DA VISUALIZAÇÃO
    // ==========================================================================

    const WAFFLE_SETTINGS = {
        gridSize: 10,
        totalSquares: 100,
        
        margins: {
            desktop: { top: 60, right: 60, bottom: 80, left: 60 },
            mobile: { top: 40, right: 30, bottom: 60, left: 30 },
            square: { top: 50, right: 50, bottom: 70, left: 50 },
            custom: { top: 60, right: 60, bottom: 80, left: 60 }
        },
        
        spacing: {
            titleToSubtitle: 20,
            subtitleToChart: 30,
            chartToLegend: 25,
            legendToSource: 20,
            directLabelOffset: 25
        },
        
        defaultWidth: 800,
        defaultHeight: 600,
        animationDuration: 600,
        staggerDelay: 10
    };

    // ==========================================================================
    // VARIÁVEIS PRIVADAS
    // ==========================================================================

    let vizSvg = null;
    let vizWaffleGroup = null;
    let vizDirectLabelsGroup = null;
    let vizColorScale = null;
    let vizCurrentData = null;
    let vizProcessedData = null;
    let vizSquaresArray = null;
    let vizCurrentConfig = null;
    let vizLayoutInfo = null;

    let waffleConfig = {
        size: 25,
        gap: 2,
        roundness: 3,
        animation: false,
        hover_effect: true,
        maxSize: 35,
        minSize: 12,
        maxGap: 6
    };

    // ==========================================================================
    // CONFIGURAÇÃO PADRÃO
    // ==========================================================================

    function getDefaultConfig() {
        return {
            width: WAFFLE_SETTINGS.defaultWidth,
            height: WAFFLE_SETTINGS.defaultHeight,
            screenFormat: 'square',
            title: 'Distribuição por Categoria',
            subtitle: 'Visualização em formato waffle',
            dataSource: 'Dados de Exemplo, 2024',
            colors: ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'],
            backgroundColor: '#FFFFFF',
            textColor: '#2C3E50',
            fontFamily: 'Inter',
            titleSize: 24,
            subtitleSize: 16,
            labelSize: 12,
            showLegend: true,
            legendDirect: true,
            directLabelPosition: 'right'
        };
    }

    // ==========================================================================
    // CONFIGURAÇÃO INICIAL DE VALORES HTML
    // ==========================================================================

    function setInitialHTMLValues() {
        // Cores padrão
        const bgColor = document.getElementById('bg-color');
        const bgColorText = document.getElementById('bg-color-text');
        const textColor = document.getElementById('text-color');
        const textColorText = document.getElementById('text-color-text');
        
        if (bgColor) bgColor.value = '#FFFFFF';
        if (bgColorText) bgColorText.value = '#FFFFFF';
        if (textColor) textColor.value = '#2C3E50';
        if (textColorText) textColorText.value = '#2C3E50';
        
        // Formato de tela padrão
        const squareFormat = document.querySelector('input[name="screen-format"][value="square"]');
        if (squareFormat) squareFormat.checked = true;
        
        // Rótulos sempre habilitados
        const showLegend = document.getElementById('show-legend');
        if (showLegend) showLegend.checked = true;
        
        // Posição à direita por padrão
        const rightPosition = document.querySelector('input[name="direct-label-position"][value="right"]');
        if (rightPosition) rightPosition.checked = true;
    }

    // ==========================================================================
    // INICIALIZAÇÃO
    // ==========================================================================

    function initVisualization() {
        if (typeof d3 === 'undefined') {
            console.error('D3.js não está carregado!');
            return;
        }
        
        // Define valores HTML corretos ANTES de qualquer inicialização
        setInitialHTMLValues();
        
        createBaseSVG();
        
        // Carrega dados de exemplo após breve delay
        setTimeout(loadSampleData, 100);
    }

    function loadSampleData() {
        if (window.getSampleData && typeof window.getSampleData === 'function') {
            const sampleData = window.getSampleData();
            if (sampleData?.data) {
                renderVisualization(sampleData.data, getDefaultConfig());
            }
        }
    }

    function createBaseSVG() {
        const chartContainer = document.getElementById('chart');
        if (!chartContainer) return;
        
        // Remove placeholder e SVG anterior
        chartContainer.querySelector('.chart-placeholder')?.remove();
        d3.select(chartContainer).select('svg').remove();
        
        vizSvg = d3.select(chartContainer)
            .append('svg')
            .attr('id', 'waffle-viz')
            .attr('width', WAFFLE_SETTINGS.defaultWidth)
            .attr('height', WAFFLE_SETTINGS.defaultHeight);
        
        // Grupos organizados
        vizWaffleGroup = vizSvg.append('g').attr('class', 'waffle-group');
        vizDirectLabelsGroup = vizSvg.append('g').attr('class', 'direct-labels-group');
    }

    // ==========================================================================
    // CÁLCULO DE LAYOUT
    // ==========================================================================

    function calculateLayout(config) {
        const format = config.screenFormat || 'square';
        const margins = WAFFLE_SETTINGS.margins[format];
        const spacing = WAFFLE_SETTINGS.spacing;
        
        let availableWidth = config.width - margins.left - margins.right;
        let availableHeight = config.height - margins.top - margins.bottom;
        
        // Calcula altura dos títulos
        let titleHeight = 0;
        if (config.title) titleHeight += (config.titleSize || 24);
        if (config.subtitle) titleHeight += spacing.titleToSubtitle + (config.subtitleSize || 16);
        if (titleHeight > 0) titleHeight += spacing.subtitleToChart;
        
        // Reserva espaço para fonte dos dados
        const sourceHeight = config.dataSource ? 15 + spacing.legendToSource : 0;
        
        // Área disponível para o waffle + legendas diretas
        let waffleAreaHeight = availableHeight - titleHeight - sourceHeight;
        let waffleAreaWidth = availableWidth;
        
        // ✅ CORRIGIDO: Calcula largura das legendas apenas se mostrar rótulos
        let labelWidth = 0;
        if (config.showLegend) {
            labelWidth = 100;
            waffleAreaWidth -= labelWidth + spacing.directLabelOffset;
        }
        
        // Calcula tamanho ótimo do waffle
        const maxWaffleSize = Math.min(waffleAreaWidth, waffleAreaHeight);
        const waffleSize = calculateOptimalWaffleSize(maxWaffleSize, maxWaffleSize);
        
        // ✅ CORRIGIDO: Centraliza considerando se há rótulos ou não
        const totalContentWidth = config.showLegend ? 
            waffleSize.totalWidth + spacing.directLabelOffset + labelWidth :
            waffleSize.totalWidth;
        const contentStartX = margins.left + (availableWidth - totalContentWidth) / 2;
        
        const waffleX = contentStartX;
        const waffleY = margins.top + titleHeight + (waffleAreaHeight - waffleSize.totalHeight) / 2;
        
        return {
            margins,
            spacing,
            waffle: {
                x: waffleX,
                y: waffleY,
                width: waffleSize.totalWidth,
                height: waffleSize.totalHeight,
                squareSize: waffleSize.squareSize,
                gap: waffleSize.gap
            },
            titles: {
                titleY: margins.top + (config.titleSize || 24),
                subtitleY: margins.top + (config.titleSize || 24) + spacing.titleToSubtitle + (config.subtitleSize || 16)
            },
            source: {
                y: config.height - margins.bottom + spacing.legendToSource
            },
            directLabels: {
                // ✅ CORRIGIDO: Posição correta considerando showLegend
                x: config.showLegend ? (
                    config.directLabelPosition === 'right' ? 
                        waffleX + waffleSize.totalWidth + spacing.directLabelOffset :
                        waffleX - spacing.directLabelOffset
                ) : waffleX, // Se não mostrar rótulos, posição não importa
                y: waffleY,
                align: config.directLabelPosition === 'right' ? 'start' : 'end'
            }
        };
    }

    function calculateOptimalWaffleSize(maxWidth, maxHeight) {
        let squareSize = Math.min(waffleConfig.maxSize, Math.max(waffleConfig.minSize, waffleConfig.size));
        let gap = Math.min(waffleConfig.maxGap, Math.max(0.5, waffleConfig.gap));
        
        let totalSize = (squareSize * WAFFLE_SETTINGS.gridSize) + (gap * (WAFFLE_SETTINGS.gridSize - 1));
        
        const maxAvailable = Math.min(maxWidth, maxHeight);
        if (totalSize > maxAvailable) {
            const scale = (maxAvailable * 0.85) / totalSize;
            squareSize = Math.max(waffleConfig.minSize, Math.floor(squareSize * scale));
            gap = Math.max(0.5, Math.floor(gap * scale * 10) / 10);
            totalSize = (squareSize * WAFFLE_SETTINGS.gridSize) + (gap * (WAFFLE_SETTINGS.gridSize - 1));
        }
        
        return { squareSize, gap, totalWidth: totalSize, totalHeight: totalSize };
    }

    // ==========================================================================
    // PROCESSAMENTO DE DADOS
    // ==========================================================================

    function processDataForWaffle(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { processedData: [], squaresArray: [] };
        }
        
        const total = data.reduce((sum, d) => sum + (d.valor || 0), 0);
        if (total === 0) return { processedData: [], squaresArray: [] };
        
        let processedData = data.map(d => {
            const proportion = d.valor / total;
            const squares = Math.round(proportion * WAFFLE_SETTINGS.totalSquares);
            return {
                ...d,
                proportion: proportion,
                squares: squares,
                percentage: Math.round(proportion * 100)
            };
        });
        
        // Ajusta para garantir exatamente 100 quadrados
        const totalSquares = processedData.reduce((sum, d) => sum + d.squares, 0);
        const diff = WAFFLE_SETTINGS.totalSquares - totalSquares;
        
        if (diff !== 0) {
            const maxIndex = processedData.reduce((maxIdx, d, idx) => 
                d.squares > processedData[maxIdx].squares ? idx : maxIdx, 0);
            processedData[maxIndex].squares += diff;
            processedData[maxIndex].percentage = Math.round(processedData[maxIndex].squares);
        }
        
        const squaresArray = generateSquaresArray(processedData);
        return { processedData, squaresArray };
    }

    function generateSquaresArray(processedData) {
        const squares = [];
        let currentIndex = 0;
        
        processedData.forEach((category, categoryIndex) => {
            for (let i = 0; i < category.squares; i++) {
                squares.push({
                    index: currentIndex,
                    row: Math.floor(currentIndex / WAFFLE_SETTINGS.gridSize),
                    col: currentIndex % WAFFLE_SETTINGS.gridSize,
                    category: category.categoria,
                    value: category.valor,
                    categoryIndex: categoryIndex,
                    percentage: category.percentage,
                    originalData: category
                });
                currentIndex++;
            }
        });
        
        return squares;
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
        vizCurrentConfig = Object.assign({}, getDefaultConfig(), config);
        
        const result = processDataForWaffle(data);
        vizProcessedData = result.processedData;
        vizSquaresArray = result.squaresArray;
        
        if (vizSquaresArray.length === 0) {
            showNoDataMessage();
            return;
        }
        
        vizLayoutInfo = calculateLayout(vizCurrentConfig);
        
        updateSVGDimensions();
        createColorScale();
        renderWaffleSquares();
        renderTitles();
        renderDataSource();
        
        // ✅ CORRIGIDO: Sempre chama renderDirectLabels, que decide internamente se renderiza
        renderDirectLabels();
    }

    function updateSVGDimensions() {
        if (!vizSvg) return;
        
        vizSvg.attr('width', vizCurrentConfig.width)
              .attr('height', vizCurrentConfig.height);
        
        vizSvg.selectAll('.svg-background').remove();
        
        vizSvg.insert('rect', ':first-child')
            .attr('class', 'svg-background')
            .attr('width', vizCurrentConfig.width)
            .attr('height', vizCurrentConfig.height)
            .attr('fill', vizCurrentConfig.backgroundColor);
    }

    function createColorScale() {
        vizColorScale = d3.scaleOrdinal()
            .domain(vizProcessedData.map(d => d.categoria))
            .range(vizCurrentConfig.colors);
    }

    function renderWaffleSquares() {
        vizWaffleGroup.selectAll('.waffle-square').remove();
        
        const layout = vizLayoutInfo.waffle;
        vizWaffleGroup.attr('transform', `translate(${layout.x}, ${layout.y})`);
        
        const squares = vizWaffleGroup.selectAll('.waffle-square')
            .data(vizSquaresArray, d => d.index);
        
        const squareEnter = squares.enter()
            .append('rect')
            .attr('class', 'waffle-square')
            .attr('x', d => d.col * (layout.squareSize + layout.gap))
            .attr('y', d => d.row * (layout.squareSize + layout.gap))
            .attr('width', layout.squareSize)
            .attr('height', layout.squareSize)
            .attr('rx', waffleConfig.roundness)
            .attr('ry', waffleConfig.roundness)
            .attr('fill', d => vizColorScale(d.category))
            .style('cursor', waffleConfig.hover_effect ? 'pointer' : 'default')
            .style('opacity', waffleConfig.animation ? 0 : 1);
        
        if (waffleConfig.hover_effect) {
            squareEnter
                .on('mouseover', handleSquareHover)
                .on('mouseout', handleSquareOut)
                .on('click', handleSquareClick);
        }
        
        if (waffleConfig.animation) {
            squareEnter
                .transition()
                .duration(WAFFLE_SETTINGS.animationDuration)
                .delay((d, i) => i * WAFFLE_SETTINGS.staggerDelay)
                .style('opacity', 1);
        }
    }

    function renderTitles() {
        vizSvg.selectAll('.chart-title-svg, .chart-subtitle-svg').remove();
        
        const layout = vizLayoutInfo.titles;
        
        if (vizCurrentConfig.title) {
            vizSvg.append('text')
                .attr('class', 'chart-title-svg')
                .attr('x', vizCurrentConfig.width / 2)
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
                .attr('x', vizCurrentConfig.width / 2)
                .attr('y', layout.subtitleY)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor)
                .style('font-family', vizCurrentConfig.fontFamily)
                .style('font-size', (vizCurrentConfig.subtitleSize || 16) + 'px')
                .style('opacity', 0.8)
                .text(vizCurrentConfig.subtitle);
        }
    }

    function renderDataSource() {
        vizSvg.selectAll('.chart-source-svg').remove();
        
        if (vizCurrentConfig.dataSource) {
            vizSvg.append('text')
                .attr('class', 'chart-source-svg')
                .attr('x', vizCurrentConfig.width / 2)
                .attr('y', vizLayoutInfo.source.y)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor)
                .style('font-family', vizCurrentConfig.fontFamily)
                .style('font-size', '11px')
                .style('opacity', 0.6)
                .text(`Fonte: ${vizCurrentConfig.dataSource}`);
        }
    }

    function renderDirectLabels() {
        vizDirectLabelsGroup.selectAll('*').remove();
        
        // ✅ CORRIGIDO: Só renderiza se showLegend for true
        if (!vizCurrentConfig.showLegend || !vizProcessedData || vizProcessedData.length === 0) {
            return;
        }
        
        const layout = vizLayoutInfo.directLabels;
        const waffle = vizLayoutInfo.waffle;
        
        const stepY = waffle.height / vizProcessedData.length;
        
        vizProcessedData.forEach((d, i) => {
            const labelY = layout.y + (i + 0.5) * stepY;
            
            const labelGroup = vizDirectLabelsGroup.append('g')
                .attr('class', 'direct-label-item')
                .attr('transform', `translate(${layout.x}, ${labelY})`);
            
            labelGroup.append('text')
                .attr('text-anchor', layout.align)
                .attr('dy', '0.32em')
                .style('fill', vizColorScale(d.categoria))
                .style('font-family', vizCurrentConfig.fontFamily)
                .style('font-size', (vizCurrentConfig.labelSize || 12) + 'px')
                .style('font-weight', '600')
                .text(d.categoria);
            
            labelGroup.append('text')
                .attr('text-anchor', layout.align)
                .attr('dy', '1.5em')
                .style('fill', vizCurrentConfig.textColor)
                .style('font-family', vizCurrentConfig.fontFamily)
                .style('font-size', ((vizCurrentConfig.labelSize || 12) - 1) + 'px')
                .style('opacity', 0.7)
                .text(`${d.percentage}%`);
        });
    }

    // ==========================================================================
    // INTERAÇÕES
    // ==========================================================================

    function handleSquareHover(event, d) {
        if (!waffleConfig.hover_effect) return;
        
        d3.select(event.target)
            .transition()
            .duration(200)
            .style('opacity', 0.7)
            .attr('stroke', vizCurrentConfig.textColor)
            .attr('stroke-width', 2);
        
        vizWaffleGroup.selectAll('.waffle-square')
            .filter(square => square.category === d.category)
            .transition()
            .duration(200)
            .style('opacity', 0.9);
        
        vizWaffleGroup.selectAll('.waffle-square')
            .filter(square => square.category !== d.category)
            .transition()
            .duration(200)
            .style('opacity', 0.3);
        
        showTooltip(event, d);
    }

    function handleSquareOut(event, d) {
        if (!waffleConfig.hover_effect) return;
        
        d3.select(event.target)
            .transition()
            .duration(200)
            .style('opacity', 1)
            .attr('stroke', 'none');
        
        vizWaffleGroup.selectAll('.waffle-square')
            .transition()
            .duration(200)
            .style('opacity', 1);
        
        hideTooltip();
    }

    function handleSquareClick(event, d) {
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(`${d.category}: ${d.percentage}%`, 'info');
        }
    }

    function showTooltip(event, d) {
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
            .html(`
                <div style="font-weight: bold; margin-bottom: 4px;">${d.category}</div>
                <div>Valor: ${d.value}</div>
                <div>Porcentagem: ${d.percentage}%</div>
            `);
        
        tooltip.transition().duration(200).style('opacity', 1);
    }

    function hideTooltip() {
        d3.selectAll('.viz-tooltip').remove();
    }

    // ==========================================================================
    // CALLBACKS EXTERNOS
    // ==========================================================================

    function onUpdate(newConfig) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        let screenFormat = 'square'; // Padrão é sempre square
        if (newConfig.chartWidth && newConfig.chartHeight) {
            const ratio = newConfig.chartWidth / newConfig.chartHeight;
            if (ratio < 0.8) screenFormat = 'mobile';
            else if (ratio > 1.2) screenFormat = 'desktop';
        }
        
        const mappedConfig = {
            width: newConfig.chartWidth || vizCurrentConfig.width,
            height: newConfig.chartHeight || vizCurrentConfig.height,
            screenFormat: screenFormat,
            title: newConfig.title || vizCurrentConfig.title,
            subtitle: newConfig.subtitle || vizCurrentConfig.subtitle,
            dataSource: newConfig.dataSource || vizCurrentConfig.dataSource,
            backgroundColor: newConfig.backgroundColor || vizCurrentConfig.backgroundColor,
            textColor: newConfig.textColor || vizCurrentConfig.textColor,
            fontFamily: newConfig.fontFamily || vizCurrentConfig.fontFamily,
            titleSize: newConfig.titleSize || vizCurrentConfig.titleSize,
            subtitleSize: newConfig.subtitleSize || vizCurrentConfig.subtitleSize,
            labelSize: newConfig.labelSize || vizCurrentConfig.labelSize,
            showLegend: newConfig.showLegend !== undefined ? newConfig.showLegend : vizCurrentConfig.showLegend,
            legendDirect: true,
            directLabelPosition: newConfig.directLabelPosition || vizCurrentConfig.directLabelPosition,
            colors: newConfig.colorPalette ? 
                (window.OddVizTemplateControls?.getCurrentColorPalette() || vizCurrentConfig.colors) : 
                vizCurrentConfig.colors
        };
        
        vizCurrentConfig = Object.assign({}, vizCurrentConfig, mappedConfig);
        renderVisualization(vizCurrentData, vizCurrentConfig);
    }

    function onWaffleControlUpdate(waffleControls) {
        if (waffleControls.size) {
            waffleControls.size = Math.min(waffleConfig.maxSize, Math.max(waffleConfig.minSize, waffleControls.size));
        }
        if (waffleControls.gap) {
            waffleControls.gap = Math.min(waffleConfig.maxGap, Math.max(0.5, waffleControls.gap));
        }
        
        Object.assign(waffleConfig, waffleControls);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            renderVisualization(vizCurrentData, vizCurrentConfig);
        }
    }

    function onDataLoaded(processedData) {
        if (processedData?.data) {
            renderVisualization(processedData.data, vizCurrentConfig || getDefaultConfig());
        }
    }

    // ==========================================================================
    // UTILITÁRIOS
    // ==========================================================================

    function showNoDataMessage() {
        if (!vizSvg) return;
        
        vizSvg.selectAll('*').remove();
        
        const config = vizCurrentConfig || getDefaultConfig();
        
        vizSvg.append('rect')
            .attr('class', 'svg-background')
            .attr('width', config.width)
            .attr('height', config.height)
            .attr('fill', config.backgroundColor);
        
        const message = vizSvg.append('g')
            .attr('class', 'no-data-message')
            .attr('transform', `translate(${config.width / 2}, ${config.height / 2})`);
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-20px')
            .style('fill', config.textColor)
            .style('font-family', config.fontFamily)
            .style('font-size', '24px')
            .text('🧇');
        
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

    window.WaffleVisualization = {
        initVisualization: initVisualization,
        renderVisualization: renderVisualization,
        onUpdate: onUpdate,
        onWaffleControlUpdate: onWaffleControlUpdate,
        onDataLoaded: onDataLoaded,
        WAFFLE_SETTINGS: WAFFLE_SETTINGS
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
