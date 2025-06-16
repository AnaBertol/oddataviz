/**
 * GRÁFICO DE WAFFLE - D3.js COM PALETA PERSONALIZADA CORRIGIDA
 * Versão que sincroniza corretamente com sistema de cores customizadas
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURAÇÕES ESPECÍFICAS DO WAFFLE
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

    // ✅ NOVA VARIÁVEL: Controla se está usando cores customizadas
    let vizUsingCustomColors = false;
    let vizCustomColors = [];

    // Configurações específicas do waffle
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
    // INICIALIZAÇÃO
    // ==========================================================================

    function initVisualization() {
        if (typeof d3 === 'undefined') {
            console.error('D3.js não está carregado!');
            return;
        }
        
        console.log('🧇 Inicializando Waffle Chart com paleta personalizada...');
        
        createBaseSVG();
        
        // Carrega dados de exemplo após breve delay
        setTimeout(loadSampleData, 100);
    }

    function loadSampleData() {
        if (window.getSampleData && typeof window.getSampleData === 'function') {
            const sampleData = window.getSampleData();
            if (sampleData?.data) {
                console.log('📊 Carregando dados de exemplo...');
                
                const templateState = window.OddVizTemplateControls?.getState() || {};
                renderVisualization(sampleData.data, templateState);
            }
        }
    }

    function createBaseSVG() {
        const chartContainer = document.getElementById('chart');
        if (!chartContainer) return;
        
        // Remove placeholder e SVG anterior
        chartContainer.querySelector('.chart-placeholder')?.remove();
        d3.select(chartContainer).select('svg').remove();
        
        // Cria SVG com dimensões fixas
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
        const margins = WAFFLE_SETTINGS.margins;
        const spacing = WAFFLE_SETTINGS.spacing;
        
        let availableWidth = WAFFLE_SETTINGS.fixedWidth - margins.left - margins.right;
        let availableHeight = WAFFLE_SETTINGS.fixedHeight - margins.top - margins.bottom;
        
        // Calcula altura dos títulos baseado na configuração do template
        let titleHeight = 0;
        if (config.title) titleHeight += (config.titleSize || 24);
        if (config.subtitle) titleHeight += spacing.titleToSubtitle + (config.subtitleSize || 16);
        if (titleHeight > 0) titleHeight += spacing.subtitleToChart;
        
        // Reserva espaço para fonte dos dados
        const sourceHeight = config.dataSource ? 15 + spacing.legendToSource : 0;
        
        // Área disponível para o waffle + legendas diretas
        let waffleAreaHeight = availableHeight - titleHeight - sourceHeight;
        let waffleAreaWidth = availableWidth;
        
        // Calcula largura das legendas
        let labelWidth = 0;
        const showDirectLabels = getWaffleConfig('showDirectLabels', true);
        if (showDirectLabels) {
            labelWidth = 100;
            waffleAreaWidth -= labelWidth + spacing.directLabelOffset;
        }
        
        // Calcula tamanho ótimo do waffle
        const maxWaffleSize = Math.min(waffleAreaWidth, waffleAreaHeight);
        const waffleSize = calculateOptimalWaffleSize(maxWaffleSize, maxWaffleSize);
        
        // Centraliza considerando se há rótulos ou não
        const totalContentWidth = showDirectLabels ? 
            waffleSize.totalWidth + spacing.directLabelOffset + labelWidth :
            waffleSize.totalWidth;
        const contentStartX = margins.left + (availableWidth - totalContentWidth) / 2;
        
        // Ajusta posição do waffle baseado na posição dos rótulos
        const directLabelPosition = getWaffleConfig('directLabelPosition', 'right');
        let waffleX;
        if (showDirectLabels) {
            if (directLabelPosition === 'right') {
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
                x: showDirectLabels ? (
                    directLabelPosition === 'right' ? 
                        waffleX + waffleSize.totalWidth + spacing.directLabelOffset :
                        contentStartX + labelWidth
                ) : waffleX,
                y: waffleY,
                align: directLabelPosition === 'right' ? 'start' : 'end',
                show: showDirectLabels
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
    // SISTEMA DE CORES CORRIGIDO
    // ==========================================================================

    /**
     * ✅ NOVA FUNÇÃO: Cria escala de cores inteligente
     */
    function createColorScale() {
        console.log('🎨 Criando escala de cores...');
        console.log('🎨 Usando cores customizadas?', vizUsingCustomColors);
        console.log('🎨 Cores customizadas:', vizCustomColors);
        
        let colors;
        
        if (vizUsingCustomColors && vizCustomColors.length > 0) {
            // ✅ USA CORES CUSTOMIZADAS
            colors = vizCustomColors;
            console.log('🎨 Aplicando cores customizadas:', colors);
        } else {
            // ✅ USA PALETA DO TEMPLATE CONTROLS
            colors = window.OddVizTemplateControls?.getCurrentColorPalette() || 
                     ['#6F02FD', '#2C0165', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8'];
            console.log('🎨 Aplicando paleta padrão:', colors);
        }
        
        vizColorScale = d3.scaleOrdinal()
            .domain(vizProcessedData.map(d => d.categoria))
            .range(colors);
    }

    /**
     * ✅ NOVA FUNÇÃO: Atualiza cores customizadas
     */
    function updateCustomColors(customColors) {
        console.log('🎨 Recebendo cores customizadas:', customColors);
        
        if (!customColors || customColors.length === 0) {
            console.warn('⚠️ Cores customizadas vazias, ignorando');
            return;
        }
        
        // Salva cores customizadas
        vizUsingCustomColors = true;
        vizCustomColors = customColors;
        
        // Recria escala de cores
        if (vizProcessedData && vizProcessedData.length > 0) {
            createColorScale();
            
            // Re-renderiza apenas os elementos visuais
            renderWaffleSquares();
            renderDirectLabels();
        }
    }

    /**
     * ✅ NOVA FUNÇÃO: Volta para paleta padrão
     */
    function updateColorPalette(paletteType) {
        console.log('🎨 Mudando para paleta padrão:', paletteType);
        
        // Desativa cores customizadas
        vizUsingCustomColors = false;
        vizCustomColors = [];
        
        // Recria escala de cores
        if (vizProcessedData && vizProcessedData.length > 0) {
            createColorScale();
            
            // Re-renderiza apenas os elementos visuais
            renderWaffleSquares();
            renderDirectLabels();
        }
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
        vizCurrentConfig = config;
        
        const result = processDataForWaffle(data);
        vizProcessedData = result.processedData;
        vizSquaresArray = result.squaresArray;
        
        if (vizSquaresArray.length === 0) {
            showNoDataMessage();
            return;
        }
        
        vizLayoutInfo = calculateLayout(vizCurrentConfig);
        
        updateSVGDimensions();
        createColorScale(); // ✅ Cria escala de cores inteligente
        renderWaffleSquares();
        renderTitles();
        renderDataSource();
        renderDirectLabels();
        
        console.log('🎨 Waffle renderizado com', vizProcessedData.length, 'categorias');
    }

    function updateSVGDimensions() {
        if (!vizSvg) return;
        
        vizSvg.attr('width', WAFFLE_SETTINGS.fixedWidth)
              .attr('height', WAFFLE_SETTINGS.fixedHeight);
        
        vizSvg.selectAll('.svg-background').remove();
        
        vizSvg.insert('rect', ':first-child')
            .attr('class', 'svg-background')
            .attr('width', WAFFLE_SETTINGS.fixedWidth)
            .attr('height', WAFFLE_SETTINGS.fixedHeight)
            .attr('fill', vizCurrentConfig.backgroundColor || '#FFFFFF');
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
        const config = vizCurrentConfig;
        
        if (config.title) {
            vizSvg.append('text')
                .attr('class', 'chart-title-svg')
                .attr('x', WAFFLE_SETTINGS.fixedWidth / 2)
                .attr('y', layout.titleY)
                .attr('text-anchor', 'middle')
                .style('fill', config.textColor || '#2C3E50')
                .style('font-family', config.fontFamily || 'Inter')
                .style('font-size', (config.titleSize || 24) + 'px')
                .style('font-weight', 'bold')
                .text(config.title);
        }
        
        if (config.subtitle) {
            vizSvg.append('text')
                .attr('class', 'chart-subtitle-svg')
                .attr('x', WAFFLE_SETTINGS.fixedWidth / 2)
                .attr('y', layout.subtitleY)
                .attr('text-anchor', 'middle')
                .style('fill', config.textColor || '#2C3E50')
                .style('font-family', config.fontFamily || 'Inter')
                .style('font-size', (config.subtitleSize || 16) + 'px')
                .style('opacity', 0.8)
                .text(config.subtitle);
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
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', '11px')
                .style('opacity', 0.6)
                .text(vizCurrentConfig.dataSource);
        }
    }

    function renderDirectLabels() {
        vizDirectLabelsGroup.selectAll('*').remove();
        
        const layout = vizLayoutInfo.directLabels;
        if (!layout.show || !vizProcessedData || vizProcessedData.length === 0) {
            return;
        }
        
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
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', (vizCurrentConfig.labelSize || 12) + 'px')
                .style('font-weight', '600')
                .text(d.categoria);
            
            labelGroup.append('text')
                .attr('text-anchor', layout.align)
                .attr('dy', '1.5em')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
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
            .attr('stroke', vizCurrentConfig.textColor || '#2C3E50')
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
    // ATUALIZAÇÃO DE CONTROLES
    // ==========================================================================

    function onUpdate(newConfig) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        console.log('🔄 Atualizando waffle com nova configuração do template');
        
        vizCurrentConfig = newConfig;
        renderVisualization(vizCurrentData, vizCurrentConfig);
    }

    function onWaffleControlUpdate(waffleControls) {
        // Valida limites
        if (waffleControls.size) {
            waffleControls.size = Math.min(waffleConfig.maxSize, Math.max(waffleConfig.minSize, waffleControls.size));
        }
        if (waffleControls.gap) {
            waffleControls.gap = Math.min(waffleConfig.maxGap, Math.max(0.5, waffleControls.gap));
        }
        
        Object.assign(waffleConfig, waffleControls);
        
        console.log('🧇 Controles waffle atualizados:', waffleControls);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            renderVisualization(vizCurrentData, vizCurrentConfig);
        }
    }

    function onDataLoaded(processedData) {
        if (processedData?.data) {
            console.log('📊 Novos dados carregados:', processedData.data.length + ' linhas');
            
            // ✅ IMPORTANTE: Limpa estado de cores customizadas quando dados mudam
            // Para permitir que o config.js detecte mudança e reconfigure paleta
            
            const templateState = window.OddVizTemplateControls?.getState() || {};
            renderVisualization(processedData.data, templateState);
        }
    }

    // ==========================================================================
    // UTILITÁRIOS ESPECÍFICOS DO WAFFLE
    // ==========================================================================

    function getWaffleConfig(key, defaultValue) {
        // Busca primeiro nos controles HTML específicos do waffle
        switch(key) {
            case 'showDirectLabels':
                const showLegend = document.getElementById('show-legend')?.checked;
                return showLegend !== undefined ? showLegend : defaultValue;
            case 'directLabelPosition':
                const position = document.querySelector('input[name="direct-label-position"]:checked')?.value;
                return position || defaultValue;
            default:
                return defaultValue;
        }
    }

    function showNoDataMessage() {
        if (!vizSvg) return;
        
        vizSvg.selectAll('*').remove();
        
        const config = vizCurrentConfig || {};
        
        vizSvg.append('rect')
            .attr('class', 'svg-background')
            .attr('width', WAFFLE_SETTINGS.fixedWidth)
            .attr('height', WAFFLE_SETTINGS.fixedHeight)
            .attr('fill', config.backgroundColor || '#FFFFFF');
        
        const message = vizSvg.append('g')
            .attr('class', 'no-data-message')
            .attr('transform', `translate(${WAFFLE_SETTINGS.fixedWidth / 2}, ${WAFFLE_SETTINGS.fixedHeight / 2})`);
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-20px')
            .style('fill', config.textColor || '#2C3E50')
            .style('font-family', config.fontFamily || 'Inter')
            .style('font-size', '24px')
            .text('🧇');
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '10px')
            .style('fill', config.textColor || '#2C3E50')
            .style('font-family', config.fontFamily || 'Inter')
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
        
        // ✅ NOVAS FUNÇÕES PARA SISTEMA DE CORES
        updateColorPalette: updateColorPalette,
        updateCustomColors: updateCustomColors,
        
        WAFFLE_SETTINGS: WAFFLE_SETTINGS,
        
        // ✅ ACESSO PARA DEBUG
        get vizCurrentData() { return vizCurrentData; }
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
