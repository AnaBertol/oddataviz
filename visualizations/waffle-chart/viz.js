/**
 * GRÁFICO DE WAFFLE - D3.js CORRIGIDO
 * Visualização em grade 10x10 com legendas diretas e posicionamento correto
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURAÇÕES DA VISUALIZAÇÃO - CORRIGIDAS
    // ==========================================================================

    const WAFFLE_SETTINGS = {
        gridSize: 10, // Grade 10x10
        totalSquares: 100,
        
        // Margens adaptáveis por formato de tela
        margins: {
            desktop: { top: 80, right: 80, bottom: 120, left: 80 },
            mobile: { top: 60, right: 40, bottom: 100, left: 40 },
            square: { top: 70, right: 70, bottom: 110, left: 70 },
            custom: { top: 80, right: 80, bottom: 120, left: 80 }
        },
        
        // Espaçamentos fixos entre elementos
        spacing: {
            titleToSubtitle: 25,
            subtitleToChart: 40,
            chartToSource: 30,
            legendPadding: 30,
            directLabelOffset: 20
        },
        
        defaultWidth: 800,
        defaultHeight: 600,
        
        // Configurações padrão dos quadrados
        squareSize: 25,
        gap: 2,
        roundness: 3,
        
        // Animações
        animationDuration: 600,
        staggerDelay: 10,
        
        // Cores
        colors: {
            primary: '#6CDADE',
            secondary: '#6F02FD',
            background: '#373737',
            text: '#FAF9FA'
        }
    };

    // ==========================================================================
    // VARIÁVEIS PRIVADAS DO MÓDULO
    // ==========================================================================

    let vizSvg = null;
    let vizWaffleGroup = null;
    let vizLegendGroup = null;
    let vizDirectLabelsGroup = null;
    let vizColorScale = null;
    let vizCurrentData = null;
    let vizProcessedData = null;
    let vizSquaresArray = null;
    let vizCurrentConfig = null;
    let vizLayoutInfo = null; // Nova variável para controlar layout

    // Configurações específicas do waffle
    let waffleConfig = {
        size: WAFFLE_SETTINGS.squareSize,
        gap: WAFFLE_SETTINGS.gap,
        roundness: WAFFLE_SETTINGS.roundness,
        animation: false,
        hover_effect: true
    };

    // ==========================================================================
    // VERIFICAÇÃO DE DEPENDÊNCIAS
    // ==========================================================================

    function checkDependencies() {
        if (typeof d3 === 'undefined') {
            console.error('D3.js não está carregado!');
            return false;
        }
        return true;
    }

    // ==========================================================================
    // INICIALIZAÇÃO
    // ==========================================================================

    function initVisualization() {
        console.log('Initializing waffle chart visualization...');
        
        if (!checkDependencies()) {
            console.error('Dependências não encontradas, abortando inicialização');
            return;
        }
        
        createBaseSVG();
        
        setTimeout(() => {
            if (window.getSampleData && typeof window.getSampleData === 'function') {
                const sampleData = window.getSampleData();
                if (sampleData) {
                    console.log('Loading waffle sample data:', sampleData);
                    renderVisualization(sampleData.data, getDefaultConfig());
                }
            } else {
                console.warn('getSampleData não encontrada');
            }
        }, 100);
        
        console.log('Waffle chart visualization initialized');
    }

    function createBaseSVG() {
        const chartContainer = document.getElementById('chart');
        if (!chartContainer) {
            console.error('Chart container not found');
            return;
        }
        
        const placeholder = chartContainer.querySelector('.chart-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        d3.select(chartContainer).select('svg').remove();
        
        vizSvg = d3.select(chartContainer)
            .append('svg')
            .attr('id', 'waffle-viz')
            .attr('width', WAFFLE_SETTINGS.defaultWidth)
            .attr('height', WAFFLE_SETTINGS.defaultHeight);
        
        // Grupos organizados
        vizWaffleGroup = vizSvg.append('g').attr('class', 'waffle-group');
        vizLegendGroup = vizSvg.append('g').attr('class', 'legend-group');
        vizDirectLabelsGroup = vizSvg.append('g').attr('class', 'direct-labels-group');
    }

    function getDefaultConfig() {
        return {
            width: WAFFLE_SETTINGS.defaultWidth,
            height: WAFFLE_SETTINGS.defaultHeight,
            screenFormat: 'desktop',
            title: 'Distribuição por Categoria',
            subtitle: 'Visualização em formato waffle',
            dataSource: 'Dados de Exemplo, 2024',
            colors: ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'],
            backgroundColor: '#373737',
            textColor: '#FAF9FA',
            fontFamily: 'Inter',
            titleSize: 24,
            subtitleSize: 16,
            labelSize: 12,
            showLegend: true,
            legendDirect: true, // ✅ PADRÃO COM LEGENDA DIRETA
            legendPosition: 'right', // Posição quando não é direta
            directLabelPosition: 'right' // Nova configuração para posição das legendas diretas
        };
    }

    // ==========================================================================
    // CÁLCULO DE LAYOUT - NOVA FUNCIONALIDADE
    // ==========================================================================

    /**
     * Calcula o layout completo considerando todos os elementos
     */
    function calculateLayout(config) {
        const format = config.screenFormat || 'desktop';
        const margins = WAFFLE_SETTINGS.margins[format] || WAFFLE_SETTINGS.margins.custom;
        const spacing = WAFFLE_SETTINGS.spacing;
        
        // Área disponível inicial
        let availableWidth = config.width - margins.left - margins.right;
        let availableHeight = config.height - margins.top - margins.bottom;
        
        // Reserva espaço para títulos
        let titleHeight = 0;
        if (config.title) titleHeight += (config.titleSize || 24) + spacing.titleToSubtitle;
        if (config.subtitle) titleHeight += (config.subtitleSize || 16) + spacing.subtitleToChart;
        
        // Reserva espaço para fonte dos dados
        const sourceHeight = config.dataSource ? 15 + spacing.chartToSource : 0;
        
        // Área disponível para waffle + legenda
        const chartAreaHeight = availableHeight - titleHeight - sourceHeight;
        let chartAreaWidth = availableWidth;
        
        // Calcula tamanho do waffle
        const waffleSize = calculateOptimalWaffleSize(chartAreaWidth, chartAreaHeight, config);
        
        // Ajusta para legendas diretas
        if (config.showLegend && config.legendDirect) {
            const labelWidth = 120; // Largura estimada para legendas diretas
            if (config.directLabelPosition === 'right' || config.directLabelPosition === 'left') {
                chartAreaWidth -= labelWidth + spacing.directLabelOffset;
                waffleSize.totalWidth = Math.min(waffleSize.totalWidth, chartAreaWidth);
            }
        }
        
        // Ajusta para legenda tradicional
        if (config.showLegend && !config.legendDirect) {
            if (config.legendPosition === 'bottom' || config.legendPosition === 'top') {
                availableHeight -= 60; // Altura da legenda
            } else {
                availableWidth -= 150; // Largura da legenda
            }
        }
        
        // Recalcula posições finais
        const waffleX = margins.left + (availableWidth - waffleSize.totalWidth) / 2;
        const waffleY = margins.top + titleHeight + (chartAreaHeight - waffleSize.totalHeight) / 2;
        
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
                y: config.height - margins.bottom + spacing.chartToSource
            },
            directLabels: {
                x: config.directLabelPosition === 'right' ? 
                    waffleX + waffleSize.totalWidth + spacing.directLabelOffset :
                    waffleX - spacing.directLabelOffset,
                y: waffleY,
                align: config.directLabelPosition === 'right' ? 'start' : 'end'
            }
        };
    }

    /**
     * Calcula tamanho ótimo do waffle baseado no espaço disponível
     */
    function calculateOptimalWaffleSize(maxWidth, maxHeight, config) {
        let squareSize = waffleConfig.size;
        let gap = waffleConfig.gap;
        
        // Calcula tamanho total necessário
        let totalWidth = (squareSize * WAFFLE_SETTINGS.gridSize) + (gap * (WAFFLE_SETTINGS.gridSize - 1));
        let totalHeight = totalWidth; // Waffle é sempre quadrado
        
        // Reduz se não cabe
        const maxSize = Math.min(maxWidth, maxHeight);
        if (totalWidth > maxSize) {
            const scale = maxSize / totalWidth;
            squareSize = Math.floor(squareSize * scale);
            gap = Math.max(1, Math.floor(gap * scale));
            totalWidth = (squareSize * WAFFLE_SETTINGS.gridSize) + (gap * (WAFFLE_SETTINGS.gridSize - 1));
            totalHeight = totalWidth;
        }
        
        return {
            squareSize,
            gap,
            totalWidth,
            totalHeight
        };
    }

    // ==========================================================================
    // PROCESSAMENTO DE DADOS
    // ==========================================================================

    function processDataForWaffle(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { processedData: [], squaresArray: [] };
        }
        
        const total = data.reduce((sum, d) => sum + (d.valor || 0), 0);
        
        if (total === 0) {
            return { processedData: [], squaresArray: [] };
        }
        
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
        if (!checkDependencies()) return;
        
        if (!data || !Array.isArray(data) || data.length === 0) {
            showNoDataMessage();
            return;
        }
        
        vizCurrentData = data;
        vizCurrentConfig = Object.assign({}, getDefaultConfig(), config);
        
        // Processa dados
        const result = processDataForWaffle(data);
        vizProcessedData = result.processedData;
        vizSquaresArray = result.squaresArray;
        
        if (vizSquaresArray.length === 0) {
            showNoDataMessage();
            return;
        }
        
        // Calcula layout completo
        vizLayoutInfo = calculateLayout(vizCurrentConfig);
        
        // Renderiza todos os elementos
        updateSVGDimensions();
        createColorScale();
        renderWaffleSquares();
        renderTitles();
        renderDataSource();
        
        // Renderiza legendas conforme configuração
        if (vizCurrentConfig.showLegend) {
            if (vizCurrentConfig.legendDirect) {
                renderDirectLabels();
            } else {
                renderTraditionalLegend();
            }
        }
        
        console.log('Waffle visualization rendered with', vizSquaresArray.length, 'squares');
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

    // ==========================================================================
    // RENDERIZAÇÃO DE ELEMENTOS
    // ==========================================================================

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
        
        updateHTMLTitles();
    }

    function renderDataSource() {
        vizSvg.selectAll('.chart-source-svg').remove();
        
        if (vizCurrentConfig.dataSource) {
            vizSvg.append('text')
                .attr('class', 'chart-source-svg')
                .attr('x', vizCurrentConfig.width / 2) // ✅ CENTRALIZADO
                .attr('y', vizLayoutInfo.source.y)
                .attr('text-anchor', 'middle') // ✅ CENTRALIZADO
                .style('fill', vizCurrentConfig.textColor)
                .style('font-family', vizCurrentConfig.fontFamily)
                .style('font-size', '11px')
                .style('opacity', 0.6)
                .text(`Fonte: ${vizCurrentConfig.dataSource}`);
        }
    }

    // ✅ NOVA FUNCIONALIDADE: LEGENDAS DIRETAS
    function renderDirectLabels() {
        vizDirectLabelsGroup.selectAll('*').remove();
        vizLegendGroup.selectAll('*').remove(); // Remove legenda tradicional
        
        if (!vizProcessedData || vizProcessedData.length === 0) return;
        
        const layout = vizLayoutInfo.directLabels;
        const waffle = vizLayoutInfo.waffle;
        
        // Calcula posições verticais distribuídas pela altura do waffle
        const stepY = waffle.height / vizProcessedData.length;
        
        vizProcessedData.forEach((d, i) => {
            const labelY = layout.y + (i + 0.5) * stepY;
            
            // Grupo para cada label
            const labelGroup = vizDirectLabelsGroup.append('g')
                .attr('class', 'direct-label-item')
                .attr('transform', `translate(${layout.x}, ${labelY})`);
            
            // Texto da categoria com cor correspondente
            labelGroup.append('text')
                .attr('text-anchor', layout.align)
                .attr('dy', '0.32em')
                .style('fill', vizColorScale(d.categoria))
                .style('font-family', vizCurrentConfig.fontFamily)
                .style('font-size', (vizCurrentConfig.labelSize || 12) + 'px')
                .style('font-weight', '600')
                .text(d.categoria);
            
            // Porcentagem abaixo, em cor mais suave
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

    // ✅ NOVA FUNCIONALIDADE: LEGENDA TRADICIONAL COM POSICIONAMENTO CORRETO
    function renderTraditionalLegend() {
        vizLegendGroup.selectAll('*').remove();
        vizDirectLabelsGroup.selectAll('*').remove(); // Remove legendas diretas
        
        if (!vizProcessedData || vizProcessedData.length === 0) return;
        
        const legendData = vizProcessedData.map(d => ({
            label: d.categoria,
            color: vizColorScale(d.categoria),
            percentage: d.percentage
        }));
        
        const position = vizCurrentConfig.legendPosition;
        let legendX = 0, legendY = 0, orientation = 'horizontal';
        
        // Calcula posição baseada na configuração
        switch (position) {
            case 'bottom':
                legendX = vizCurrentConfig.width / 2;
                legendY = vizCurrentConfig.height - 60;
                orientation = 'horizontal';
                break;
            case 'top':
                legendX = vizCurrentConfig.width / 2;
                legendY = 40;
                orientation = 'horizontal';
                break;
            case 'right':
                legendX = vizCurrentConfig.width - 120;
                legendY = vizCurrentConfig.height / 2;
                orientation = 'vertical';
                break;
            case 'left':
                legendX = 40;
                legendY = vizCurrentConfig.height / 2;
                orientation = 'vertical';
                break;
        }
        
        const legend = vizLegendGroup
            .attr('transform', `translate(${legendX}, ${legendY})`);
        
        if (orientation === 'horizontal') {
            renderHorizontalLegend(legend, legendData);
        } else {
            renderVerticalLegend(legend, legendData);
        }
    }

    function renderHorizontalLegend(container, data) {
        const itemWidth = 100;
        const itemsPerRow = Math.floor((vizCurrentConfig.width - 100) / itemWidth);
        
        const items = container.selectAll('.legend-item')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => {
                const row = Math.floor(i / itemsPerRow);
                const col = i % itemsPerRow;
                const offsetX = -(data.length * itemWidth) / 2; // Centraliza
                return `translate(${offsetX + col * itemWidth}, ${row * 25})`;
            });
        
        items.append('rect')
            .attr('width', 12)
            .attr('height', 12)
            .attr('rx', 2)
            .attr('fill', d => d.color);
        
        items.append('text')
            .attr('x', 18)
            .attr('y', 6)
            .attr('dy', '0.32em')
            .style('fill', vizCurrentConfig.textColor)
            .style('font-family', vizCurrentConfig.fontFamily)
            .style('font-size', (vizCurrentConfig.labelSize || 12) + 'px')
            .text(d => `${d.label} (${d.percentage}%)`);
    }

    function renderVerticalLegend(container, data) {
        const items = container.selectAll('.legend-item')
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => `translate(0, ${i * 25})`);
        
        items.append('rect')
            .attr('width', 12)
            .attr('height', 12)
            .attr('rx', 2)
            .attr('fill', d => d.color);
        
        items.append('text')
            .attr('x', 18)
            .attr('y', 6)
            .attr('dy', '0.32em')
            .style('fill', vizCurrentConfig.textColor)
            .style('font-family', vizCurrentConfig.fontFamily)
            .style('font-size', (vizCurrentConfig.labelSize || 12) + 'px')
            .text(d => `${d.label} (${d.percentage}%)`);
    }

    function updateHTMLTitles() {
        const htmlTitle = document.getElementById('rendered-title');
        const htmlSubtitle = document.getElementById('rendered-subtitle');
        
        if (htmlTitle) {
            htmlTitle.style.display = 'none';
        }
        
        if (htmlSubtitle) {
            htmlSubtitle.style.display = 'none';
        }
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
            .attr('stroke', 'none')
            .attr('stroke-width', 0);
        
        vizWaffleGroup.selectAll('.waffle-square')
            .transition()
            .duration(200)
            .style('opacity', 1);
        
        hideTooltip();
    }

    function handleSquareClick(event, d) {
        console.log('Waffle square clicked:', d);
        
        if (window.OddVizApp && window.OddVizApp.showNotification) {
            window.OddVizApp.showNotification(
                `${d.category}: ${d.percentage}%`, 
                'info'
            );
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
        
        tooltip.transition()
            .duration(200)
            .style('opacity', 1);
    }

    function hideTooltip() {
        d3.selectAll('.viz-tooltip').remove();
    }

    // ==========================================================================
    // CALLBACKS EXTERNOS
    // ==========================================================================

    function onUpdate(newConfig) {
        console.log('WaffleVisualization.onUpdate chamado com:', newConfig);
        
        if (!vizCurrentData || vizCurrentData.length === 0) {
            console.warn('Sem dados para atualizar visualização');
            return;
        }
        
        // ✅ DETECTA FORMATO DE TELA
        let screenFormat = 'desktop';
        if (newConfig.chartWidth && newConfig.chartHeight) {
            const ratio = newConfig.chartWidth / newConfig.chartHeight;
            if (ratio < 0.8) screenFormat = 'mobile';
            else if (ratio > 0.8 && ratio < 1.2) screenFormat = 'square';
            else screenFormat = 'desktop';
        }
        
        const mappedConfig = {
            width: newConfig.chartWidth || vizCurrentConfig.width,
            height: newConfig.chartHeight || vizCurrentConfig.height,
            screenFormat: screenFormat, // ✅ NOVA PROPRIEDADE
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
            legendDirect: newConfig.legendDirect !== undefined ? newConfig.legendDirect : vizCurrentConfig.legendDirect,
            legendPosition: newConfig.legendPosition || vizCurrentConfig.legendPosition,
            directLabelPosition: newConfig.directLabelPosition || vizCurrentConfig.directLabelPosition,
            colors: newConfig.colorPalette ? 
                (window.OddVizTemplateControls ? 
                    window.OddVizTemplateControls.getCurrentColorPalette() : 
                    vizCurrentConfig.colors) : 
                vizCurrentConfig.colors
        };
        
        vizCurrentConfig = Object.assign({}, vizCurrentConfig, mappedConfig);
        
        console.log('Configuração atualizada:', vizCurrentConfig);
        
        renderVisualization(vizCurrentData, vizCurrentConfig);
    }

    function onWaffleControlUpdate(waffleControls) {
        console.log('Waffle specific controls updated:', waffleControls);
        
        Object.assign(waffleConfig, waffleControls);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            renderVisualization(vizCurrentData, vizCurrentConfig);
        }
    }

    function onDataLoaded(processedData) {
        console.log('New waffle data loaded:', processedData);
        
        if (processedData && processedData.data) {
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

    function resize(width, height) {
        if (!vizCurrentData) return;
        
        vizCurrentConfig.width = width;
        vizCurrentConfig.height = height;
        
        renderVisualization(vizCurrentData, vizCurrentConfig);
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
        resize: resize,
        WAFFLE_SETTINGS: WAFFLE_SETTINGS
    };

    window.onDataLoaded = onDataLoaded;
    window.initVisualization = initVisualization;

    // ==========================================================================
    // AUTO-INICIALIZAÇÃO
    // ==========================================================================

    function waitForD3AndInit() {
        if (typeof d3 !== 'undefined' && document.readyState !== 'loading') {
            console.log('D3 and DOM ready, initializing waffle visualization');
            initVisualization();
        } else {
            console.log('Waiting for D3 and DOM...');
            setTimeout(waitForD3AndInit, 100);
        }
    }

    waitForD3AndInit();

})();

console.log('Waffle chart visualization script loaded');
