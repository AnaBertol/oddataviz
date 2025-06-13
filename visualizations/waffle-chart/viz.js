/**
 * GRÁFICO DE WAFFLE - D3.js SINCRONIZADO
 * Versão corrigida com configurações consistentes
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURAÇÕES CENTRALIZADAS E FIXAS
    // ==========================================================================

    const WAFFLE_SETTINGS = {
        gridSize: 10,
        totalSquares: 100,
        
        // Sempre usa formato quadrado - dimensões fixas
        fixedWidth: 600,
        fixedHeight: 600,
        
        margins: {
            top: 50, 
            right: 50, 
            bottom: 70, 
            left: 50
        },
        
        spacing: {
            titleToSubtitle: 20,
            subtitleToChart: 30,
            chartToLegend: 25,
            legendToSource: 20,
            directLabelOffset: 25
        },
        
        animationDuration: 600,
        staggerDelay: 10
    };

    // CONFIGURAÇÃO PADRÃO CENTRALIZADA - única fonte da verdade
    const DEFAULT_CONFIG = {
        width: 600,
        height: 600,
        screenFormat: 'square', // Sempre quadrado
        title: 'Distribuição por Categoria',
        subtitle: 'Visualização em formato waffle',
        dataSource: 'Dados de Exemplo, 2024',
        // ✅ CORRIGIDO: Array sempre fixo e consistente
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
    // SINCRONIZAÇÃO HTML ↔ JAVASCRIPT
    // ==========================================================================

    function syncHTMLWithDefaults() {
        // ✅ IMPORTANTE: Sincroniza valores HTML com DEFAULT_CONFIG
        
        // Cores
        const bgColor = document.getElementById('bg-color');
        const bgColorText = document.getElementById('bg-color-text');
        const textColor = document.getElementById('text-color');
        const textColorText = document.getElementById('text-color-text');
        
        if (bgColor) bgColor.value = DEFAULT_CONFIG.backgroundColor;
        if (bgColorText) bgColorText.value = DEFAULT_CONFIG.backgroundColor;
        if (textColor) textColor.value = DEFAULT_CONFIG.textColor;
        if (textColorText) textColorText.value = DEFAULT_CONFIG.textColor;
        
        // Textos
        const titleInput = document.getElementById('chart-title');
        const subtitleInput = document.getElementById('chart-subtitle');
        const sourceInput = document.getElementById('data-source');
        
        if (titleInput) titleInput.value = DEFAULT_CONFIG.title;
        if (subtitleInput) subtitleInput.value = DEFAULT_CONFIG.subtitle;
        if (sourceInput) sourceInput.value = DEFAULT_CONFIG.dataSource;
        
        // Tipografia
        const fontSelect = document.getElementById('font-family');
        const titleSize = document.getElementById('title-size');
        const subtitleSize = document.getElementById('subtitle-size');
        const labelSize = document.getElementById('label-size');
        
        if (fontSelect) fontSelect.value = DEFAULT_CONFIG.fontFamily;
        if (titleSize) titleSize.value = DEFAULT_CONFIG.titleSize;
        if (subtitleSize) subtitleSize.value = DEFAULT_CONFIG.subtitleSize;
        if (labelSize) labelSize.value = DEFAULT_CONFIG.labelSize;
        
        // Rótulos
        const showLegend = document.getElementById('show-legend');
        if (showLegend) showLegend.checked = DEFAULT_CONFIG.showLegend;
        
        const rightPosition = document.querySelector('input[name="direct-label-position"][value="right"]');
        if (rightPosition) rightPosition.checked = (DEFAULT_CONFIG.directLabelPosition === 'right');
        
        // Paleta de cores - sempre "odd" ativa
        const oddPalette = document.querySelector('.color-option[data-palette="odd"]');
        if (oddPalette) oddPalette.classList.add('active');
        
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
        
        console.log('🧇 Inicializando Waffle Chart...');
        
        // ✅ CRÍTICO: Sincroniza HTML ANTES de qualquer renderização
        syncHTMLWithDefaults();
        
        createBaseSVG();
        
        // Carrega dados de exemplo após breve delay
        setTimeout(loadSampleData, 100);
    }

    function loadSampleData() {
        if (window.getSampleData && typeof window.getSampleData === 'function') {
            const sampleData = window.getSampleData();
            if (sampleData?.data) {
                console.log('📊 Carregando dados de exemplo...');
                // ✅ SEMPRE usa DEFAULT_CONFIG na primeira renderização
                renderVisualization(sampleData.data, Object.assign({}, DEFAULT_CONFIG));
            }
        }
    }

    function createBaseSVG() {
        const chartContainer = document.getElementById('chart');
        if (!chartContainer) return;
        
        // Remove placeholder e SVG anterior
        chartContainer.querySelector('.chart-placeholder')?.remove();
        d3.select(chartContainer).select('svg').remove();
        
        // ✅ SEMPRE cria SVG com dimensões fixas
        vizSvg = d3.select(chartContainer)
            .append('svg')
            .attr('id', 'waffle-viz')
            .attr('width', WAFFLE_SETTINGS.fixedWidth)
            .attr('height', WAFFLE_SETTINGS.fixedHeight);
        
        // Grupos organizados
        vizWaffleGroup = vizSvg.append('g').attr('class', 'waffle-group');
        vizDirectLabelsGroup = vizSvg.append('g').attr('class', 'direct-labels-group');
    }

    // ==========================================================================
    // CÁLCULO DE LAYOUT - SEMPRE QUADRADO
    // ==========================================================================

    function calculateLayout(config) {
        // ✅ SEMPRE usa margens fixas para waffle quadrado
        const margins = WAFFLE_SETTINGS.margins;
        const spacing = WAFFLE_SETTINGS.spacing;
        
        let availableWidth = WAFFLE_SETTINGS.fixedWidth - margins.left - margins.right;
        let availableHeight = WAFFLE_SETTINGS.fixedHeight - margins.top - margins.bottom;
        
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
        
        // Calcula largura das legendas apenas se mostrar rótulos
        let labelWidth = 0;
        if (config.showLegend) {
            labelWidth = 100;
            waffleAreaWidth -= labelWidth + spacing.directLabelOffset;
        }
        
        // Calcula tamanho ótimo do waffle
        const maxWaffleSize = Math.min(waffleAreaWidth, waffleAreaHeight);
        const waffleSize = calculateOptimalWaffleSize(maxWaffleSize, maxWaffleSize);
        
        // Centraliza considerando se há rótulos ou não
        const totalContentWidth = config.showLegend ? 
            waffleSize.totalWidth + spacing.directLabelOffset + labelWidth :
            waffleSize.totalWidth;
        const contentStartX = margins.left + (availableWidth - totalContentWidth) / 2;
        
        // Ajusta posição do waffle baseado na posição dos rótulos
        let waffleX;
        if (config.showLegend) {
            if (config.directLabelPosition === 'right') {
                waffleX = contentStartX;
            } else {
                waffleX = contentStartX + labelWidth + spacing.directLabelOffset;
            }
        } else {
            waffleX = contentStartX;
        }
        
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
                y: WAFFLE_SETTINGS.fixedHeight - margins.bottom + spacing.legendToSource
            },
            directLabels: {
                x: config.showLegend ? (
                    config.directLabelPosition === 'right' ? 
                        waffleX + waffleSize.totalWidth + spacing.directLabelOffset :
                        contentStartX + labelWidth
                ) : waffleX,
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
        // ✅ SEMPRE usa DEFAULT_CONFIG como base e faz merge
        vizCurrentConfig = Object.assign({}, DEFAULT_CONFIG, config);
        
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
        renderDirectLabels();
        
        console.log('🎨 Waffle renderizado com configuração:', {
            colors: vizCurrentConfig.colors.length + ' cores',
            showLegend: vizCurrentConfig.showLegend,
            position: vizCurrentConfig.directLabelPosition
        });
    }

    function updateSVGDimensions() {
        if (!vizSvg) return;
        
        // ✅ SEMPRE força dimensões fixas
        vizSvg.attr('width', WAFFLE_SETTINGS.fixedWidth)
              .attr('height', WAFFLE_SETTINGS.fixedHeight);
        
        vizSvg.selectAll('.svg-background').remove();
        
        vizSvg.insert('rect', ':first-child')
            .attr('class', 'svg-background')
            .attr('width', WAFFLE_SETTINGS.fixedWidth)
            .attr('height', WAFFLE_SETTINGS.fixedHeight)
            .attr('fill', vizCurrentConfig.backgroundColor);
    }

    function createColorScale() {
        // ✅ SEMPRE usa as cores da configuração atual (sem buscar externa)
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
                .attr('x', WAFFLE_SETTINGS.fixedWidth / 2)
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
                .attr('x', WAFFLE_SETTINGS.fixedWidth / 2)
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
                .attr('x', WAFFLE_SETTINGS.fixedWidth / 2)
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
        
        vizWaffleGroup.
