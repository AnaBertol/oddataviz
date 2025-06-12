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
        
        // Margens reduzidas e mais proporcionais
        margins: {
            desktop: { top: 60, right: 60, bottom: 80, left: 60 },
            mobile: { top: 40, right: 30, bottom: 60, left: 30 },
            square: { top: 50, right: 50, bottom: 70, left: 50 },
            custom: { top: 60, right: 60, bottom: 80, left: 60 }
        },
        
        // Espaçamentos reduzidos entre elementos
        spacing: {
            titleToSubtitle: 20,
            subtitleToChart: 30,
            chartToLegend: 25,
            legendToSource: 20,
            directLabelOffset: 25
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
    // VARIÁVEIS PRIVADAS DO MÓDULO - COM CONTROLE DE RENDERIZAÇÃO
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
    let vizLayoutInfo = null;
    let vizIsInitialized = false; // ✅ CONTROLE DE INICIALIZAÇÃO
    let vizRenderInProgress = false; // ✅ PREVINE RENDERIZAÇÕES SIMULTÂNEAS

    // Configurações específicas do waffle - COM LIMITES AJUSTADOS
    let waffleConfig = {
        size: WAFFLE_SETTINGS.squareSize,
        gap: WAFFLE_SETTINGS.gap,
        roundness: WAFFLE_SETTINGS.roundness,
        animation: false,
        hover_effect: true,
        // ✅ NOVOS LIMITES PARA EVITAR OVERFLOW
        maxSize: 35, // Tamanho máximo reduzido
        minSize: 12, // Tamanho mínimo aumentado
        maxGap: 6    // Gap máximo reduzido
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
    // INICIALIZAÇÃO - COM PREVENÇÃO DE CONFLITO
    // ==========================================================================

    function initVisualization() {
        console.log('Initializing waffle chart visualization...');
        
        if (!checkDependencies()) {
            console.error('Dependências não encontradas, abortando inicialização');
            return;
        }
        
        createBaseSVG();
        
        // ✅ CONFIGURA VALORES PADRÃO NOS CONTROLES HTML ANTES DE INICIALIZAR
        setDefaultHTMLValues();
        
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

    // ✅ NOVA FUNÇÃO PARA CONFIGURAR VALORES PADRÃO NO HTML
    function setDefaultHTMLValues() {
        // Configurações de cor padrão
        const bgColorInput = document.getElementById('bg-color');
        const bgColorText = document.getElementById('bg-color-text');
        const textColorInput = document.getElementById('text-color');
        const textColorText = document.getElementById('text-color-text');
        
        if (bgColorInput) bgColorInput.value = '#FFFFFF';
        if (bgColorText) bgColorText.value = '#FFFFFF';
        if (textColorInput) textColorInput.value = '#2C3E50';
        if (textColorText) textColorText.value = '#2C3E50';
        
        // Formato de tela padrão
        const squareRadio = document.querySelector('input[name="screen-format"][value="square"]');
        if (squareRadio) squareRadio.checked = true;
        
        // Rótulos diretos sempre habilitados
        const showLegend = document.getElementById('show-legend');
        if (showLegend) showLegend.checked = true;
        
        const directLabelRight = document.querySelector('input[name="direct-label-position"][value="right"]');
        if (directLabelRight) directLabelRight.checked = true;
        
        console.log('Default HTML values set');
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
            screenFormat: 'square', // ✅ PADRÃO QUADRADO
            title: 'Distribuição por Categoria',
            subtitle: 'Visualização em formato waffle',
            dataSource: 'Dados de Exemplo, 2024',
            colors: ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'],
            backgroundColor: '#FFFFFF', // ✅ FUNDO BRANCO
            textColor: '#2C3E50', // ✅ FONTE ESCURA
            fontFamily: 'Inter',
            titleSize: 24,
            subtitleSize: 16,
            labelSize: 12,
            showLegend: true,
            legendDirect: true, // ✅ SEMPRE LEGENDA DIRETA
            directLabelPosition: 'right' // ✅ PADRÃO À DIREITA
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
        
        // Calcula altura dos títulos
        let titleHeight = 0;
        if (config.title) titleHeight += (config.titleSize || 24);
        if (config.subtitle) titleHeight += spacing.titleToSubtitle + (config.subtitleSize || 16);
        if (titleHeight > 0) titleHeight += spacing.subtitleToChart;
        
        // Reserva espaço para fonte dos dados (sempre no final)
        const sourceHeight = config.dataSource ? 15 + spacing.legendToSource : 0;
        
        // ✅ APENAS LEGENDAS DIRETAS - SEM LEGENDA TRADICIONAL
        // Área disponível para o waffle + legendas diretas
        let waffleAreaHeight = availableHeight - titleHeight - sourceHeight;
        let waffleAreaWidth = availableWidth;
        
        // Largura das legendas diretas
        const labelWidth = 100;
        waffleAreaWidth -= labelWidth + spacing.directLabelOffset;
        
        // Calcula tamanho ótimo do waffle (sempre quadrado)
        const maxWaffleSize = Math.min(waffleAreaWidth, waffleAreaHeight);
        const waffleSize = calculateOptimalWaffleSize(maxWaffleSize, maxWaffleSize, config);
        
        // ✅ CENTRALIZA O CONJUNTO WAFFLE + RÓTULOS
        const totalContentWidth = waffleSize.totalWidth + spacing.directLabelOffset + labelWidth;
        const contentStartX = margins.left + (availableWidth - totalContentWidth) / 2;
        
        // Posições finais
        const waffleX = contentStartX;
        const waffleY = margins.top + titleHeight + (waffleAreaHeight - waffleSize.totalHeight) / 2;
        
        const sourceY = config.height - margins.bottom + spacing.legendToSource;
        
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
                y: sourceY
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
        // ✅ APLICA LIMITES CONFIGURADOS
        let squareSize = Math.min(waffleConfig.maxSize, Math.max(waffleConfig.minSize, waffleConfig.size));
        let gap = Math.min(waffleConfig.maxGap, Math.max(0.5, waffleConfig.gap));
        
        // Calcula tamanho total necessário
        let totalSize = (squareSize * WAFFLE_SETTINGS.gridSize) + (gap * (WAFFLE_SETTINGS.gridSize - 1));
        
        // Reduz se não cabe no espaço disponível
        const maxAvailable = Math.min(maxWidth, maxHeight);
        if (totalSize > maxAvailable) {
            const scale = (maxAvailable * 0.85) / totalSize; // 85% do espaço para margem de segurança
            squareSize = Math.max(waffleConfig.minSize, Math.floor(squareSize * scale));
            gap = Math.max(0.5, Math.floor(gap * scale * 10) / 10);
            totalSize = (squareSize * WAFFLE_SETTINGS.gridSize) + (gap * (WAFFLE_SETTINGS.gridSize - 1));
        }
        
        return {
            squareSize,
            gap,
            totalWidth: totalSize,
            totalHeight: totalSize
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
        
        // ✅ PREVINE RENDERIZAÇÕES SIMULTÂNEAS
        if (vizRenderInProgress) {
            console.log('Render já em progresso, ignorando chamada duplicada');
            return;
        }
        
        vizRenderInProgress = true;
        
        if (!data || !Array.isArray(data) || data.length === 0) {
            showNoDataMessage();
            vizRenderInProgress = false;
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
            vizRenderInProgress = false;
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
        
        // Renderiza legendas - APENAS LEGENDAS DIRETAS
        if (vizCurrentConfig.showLegend) {
            renderDirectLabels();
        }
        
        vizIsInitialized = true;
        vizRenderInProgress = false;
        
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

    // ✅ LEGENDAS DIRETAS SIMPLIFICADAS
    function renderDirectLabels() {
        vizDirectLabelsGroup.selectAll('*').remove();
        
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
        
        // ✅ IGNORA UPDATES ANTES DA INICIALIZAÇÃO COMPLETA
        if (!vizIsInitialized || vizRenderInProgress) {
            console.log('Ignorando update - visualização não inicializada ou render em progresso');
            return;
        }
        
        if (!vizCurrentData || vizCurrentData.length === 0) {
            console.warn('Sem dados para atualizar visualização');
            return;
        }
        
        // ✅ DETECTA FORMATO DE TELA
        let screenFormat = 'square'; // Padrão
        if (newConfig.chartWidth && newConfig.chartHeight) {
            const ratio = newConfig.chartWidth / newConfig.chartHeight;
            if (ratio < 0.8) screenFormat = 'mobile';
            else if (ratio > 0.8 && ratio < 1.2) screenFormat = 'square';
            else screenFormat = 'desktop';
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
            legendDirect: true, // ✅ SEMPRE LEGENDA DIRETA
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
        
        // ✅ APLICA LIMITES AOS CONTROLES
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
        console.log('New waffle data loaded:', processedData);
        
        // ✅ APENAS RENDERIZA SE NÃO ESTIVER INICIALIZADO
        if (processedData && processedData.data && !vizIsInitialized) {
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
