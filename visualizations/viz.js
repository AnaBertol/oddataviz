/**
 * GRÁFICO DE WAFFLE - D3.js
 * Visualização em grade 10x10 para mostrar proporções
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURAÇÕES DA VISUALIZAÇÃO
    // ==========================================================================

    const WAFFLE_SETTINGS = {
        gridSize: 10, // Grade 10x10
        totalSquares: 100,
        margins: { top: 60, right: 60, bottom: 120, left: 60 },
        defaultWidth: 800,
        defaultHeight: 600,
        
        // Configurações padrão dos quadrados
        squareSize: 25,
        gap: 2,
        roundness: 3,
        
        // Animações
        animationDuration: 800,
        staggerDelay: 15, // Delay entre cada quadrado na animação
        
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
    let vizColorScale = null;
    let vizCurrentData = null;
    let vizProcessedData = null;
    let vizSquaresArray = null;
    let vizCurrentConfig = null;

    // Configurações específicas do waffle
    let waffleConfig = {
        size: WAFFLE_SETTINGS.squareSize,
        gap: WAFFLE_SETTINGS.gap,
        roundness: WAFFLE_SETTINGS.roundness,
        animation: true,
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
        
        if (typeof window.WaffleVizConfig === 'undefined') {
            console.error('WaffleVizConfig não está carregado!');
            return false;
        }
        
        return true;
    }

    // ==========================================================================
    // INICIALIZAÇÃO
    // ==========================================================================

    /**
     * Inicializa a visualização do waffle chart
     */
    function initVisualization() {
        console.log('Initializing waffle chart visualization...');
        
        if (!checkDependencies()) {
            console.error('Dependências não encontradas, abortando inicialização');
            return;
        }
        
        // Cria SVG base
        createBaseSVG();
        
        // Carrega dados de exemplo automaticamente
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

    /**
     * Cria SVG base
     */
    function createBaseSVG() {
        const chartContainer = document.getElementById('chart');
        if (!chartContainer) {
            console.error('Chart container not found');
            return;
        }
        
        // Remove placeholder se existir
        const placeholder = chartContainer.querySelector('.chart-placeholder');
        if (placeholder) {
            placeholder.remove();
        }
        
        // Remove SVG anterior se existir
        d3.select(chartContainer).select('svg').remove();
        
        // Cria SVG
        vizSvg = d3.select(chartContainer)
            .append('svg')
            .attr('id', 'waffle-viz')
            .attr('width', WAFFLE_SETTINGS.defaultWidth)
            .attr('height', WAFFLE_SETTINGS.defaultHeight);
        
        // Grupo principal para o waffle
        vizWaffleGroup = vizSvg.append('g')
            .attr('class', 'waffle-group')
            .attr('transform', `translate(${WAFFLE_SETTINGS.margins.left}, ${WAFFLE_SETTINGS.margins.top})`);
        
        // Grupo para a legenda
        vizLegendGroup = vizSvg.append('g')
            .attr('class', 'legend-group');
    }

    /**
     * Obtém configuração padrão
     */
    function getDefaultConfig() {
        return {
            width: WAFFLE_SETTINGS.defaultWidth,
            height: WAFFLE_SETTINGS.defaultHeight,
            title: 'Distribuição por Categoria',
            subtitle: 'Visualização em formato waffle',
            colors: ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'],
            backgroundColor: '#373737',
            textColor: '#FAF9FA',
            fontFamily: 'Inter',
            showLegend: true,
            legendPosition: 'bottom'
        };
    }

    // ==========================================================================
    // PROCESSAMENTO DE DADOS
    // ==========================================================================

    /**
     * Processa dados para o formato waffle
     */
    function processDataForWaffle(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { processedData: [], squaresArray: [] };
        }
        
        // Calcula total
        const total = data.reduce((sum, d) => sum + (d.valor || 0), 0);
        
        if (total === 0) {
            return { processedData: [], squaresArray: [] };
        }
        
        // Converte para proporções e calcula quadrados
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
            // Ajusta o maior valor
            const maxIndex = processedData.reduce((maxIdx, d, idx) => 
                d.squares > processedData[maxIdx].squares ? idx : maxIdx, 0);
            processedData[maxIndex].squares += diff;
            processedData[maxIndex].percentage = Math.round(processedData[maxIndex].squares);
        }
        
        // Gera array de quadrados
        const squaresArray = generateSquaresArray(processedData);
        
        return { processedData, squaresArray };
    }

    /**
     * Gera array de quadrados para renderização
     */
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

    /**
     * Renderiza a visualização com dados
     */
    function renderVisualization(data, config) {
        if (!checkDependencies()) return;
        
        if (!data || !Array.isArray(data) || data.length === 0) {
            showNoDataMessage();
            return;
        }
        
        vizCurrentData = data;
        vizCurrentConfig = Object.assign({}, getDefaultConfig(), config);
        
        // Processa dados para waffle
        const result = processDataForWaffle(data);
        vizProcessedData = result.processedData;
        vizSquaresArray = result.squaresArray;
        
        if (vizSquaresArray.length === 0) {
            showNoDataMessage();
            return;
        }
        
        // Atualiza dimensões do SVG
        updateSVGDimensions();
        
        // Cria escala de cores
        createColorScale();
        
        // Calcula posicionamento
        const waffleSize = calculateWaffleSize();
        
        // Renderiza elementos
        renderWaffleSquares(waffleSize);
        renderTitles();
        
        if (vizCurrentConfig.showLegend) {
            renderLegend();
        }
        
        console.log('Waffle visualization rendered with', vizSquaresArray.length, 'squares');
    }

    /**
     * Calcula tamanho e posicionamento do waffle
     */
    function calculateWaffleSize() {
        const availableWidth = vizCurrentConfig.width - WAFFLE_SETTINGS.margins.left - WAFFLE_SETTINGS.margins.right;
        const availableHeight = vizCurrentConfig.height - WAFFLE_SETTINGS.margins.top - WAFFLE_SETTINGS.margins.bottom;
        
        // Calcula tamanho total da grade
        const totalWidth = (waffleConfig.size * WAFFLE_SETTINGS.gridSize) + (waffleConfig.gap * (WAFFLE_SETTINGS.gridSize - 1));
        const totalHeight = (waffleConfig.size * WAFFLE_SETTINGS.gridSize) + (waffleConfig.gap * (WAFFLE_SETTINGS.gridSize - 1));
        
        // Centraliza
        const offsetX = (availableWidth - totalWidth) / 2;
        const offsetY = (availableHeight - totalHeight) / 2;
        
        return {
            squareSize: waffleConfig.size,
            gap: waffleConfig.gap,
            totalWidth: totalWidth,
            totalHeight: totalHeight,
            offsetX: Math.max(0, offsetX),
            offsetY: Math.max(0, offsetY)
        };
    }

    /**
     * Atualiza dimensões do SVG
     */
    function updateSVGDimensions() {
        if (!vizSvg) return;
        
        vizSvg.attr('width', vizCurrentConfig.width)
              .attr('height', vizCurrentConfig.height);
        
        // Remove e recria background
        vizSvg.selectAll('.svg-background').remove();
        
        // Adiciona retângulo de fundo
        vizSvg.insert('rect', ':first-child')
            .attr('class', 'svg-background')
            .attr('width', vizCurrentConfig.width)
            .attr('height', vizCurrentConfig.height)
            .attr('fill', vizCurrentConfig.backgroundColor);
    }

    /**
     * Cria escala de cores
     */
    function createColorScale() {
        vizColorScale = d3.scaleOrdinal()
            .domain(vizProcessedData.map(d => d.categoria))
            .range(vizCurrentConfig.colors);
    }

    // ==========================================================================
    // RENDERIZAÇÃO DE ELEMENTOS
    // ==========================================================================

    /**
     * Renderiza os quadrados do waffle
     */
    function renderWaffleSquares(waffleSize) {
        // Remove quadrados existentes
        vizWaffleGroup.selectAll('.waffle-square').remove();
        
        // Atualiza posição do grupo
        vizWaffleGroup.attr('transform', 
            `translate(${WAFFLE_SETTINGS.margins.left + waffleSize.offsetX}, ${WAFFLE_SETTINGS.margins.top + waffleSize.offsetY})`);
        
        // Cria quadrados
        const squares = vizWaffleGroup.selectAll('.waffle-square')
            .data(vizSquaresArray, d => d.index);
        
        const squareEnter = squares.enter()
            .append('rect')
            .attr('class', 'waffle-square')
            .attr('x', d => d.col * (waffleSize.squareSize + waffleSize.gap))
            .attr('y', d => d.row * (waffleSize.squareSize + waffleSize.gap))
            .attr('width', waffleSize.squareSize)
            .attr('height', waffleSize.squareSize)
            .attr('rx', waffleConfig.roundness)
            .attr('ry', waffleConfig.roundness)
            .attr('fill', d => vizColorScale(d.category))
            .style('cursor', waffleConfig.hover_effect ? 'pointer' : 'default')
            .style('opacity', waffleConfig.animation ? 0 : 1);
        
        // Adiciona interações se habilitadas
        if (waffleConfig.hover_effect) {
            squareEnter
                .on('mouseover', handleSquareHover)
                .on('mouseout', handleSquareOut)
                .on('click', handleSquareClick);
        }
        
        // Animação de entrada se habilitada
        if (waffleConfig.animation) {
            squareEnter
                .transition()
                .duration(WAFFLE_SETTINGS.animationDuration)
                .delay((d, i) => i * WAFFLE_SETTINGS.staggerDelay)
                .style('opacity', 1)
                .ease(d3.easeElasticOut.amplitude(1).period(0.3));
        }
        
        // Atualiza quadrados existentes
        squares.transition()
            .duration(WAFFLE_SETTINGS.animationDuration / 2)
            .attr('x', d => d.col * (waffleSize.squareSize + waffleSize.gap))
            .attr('y', d => d.row * (waffleSize.squareSize + waffleSize.gap))
            .attr('width', waffleSize.squareSize)
            .attr('height', waffleSize.squareSize)
            .attr('rx', waffleConfig.roundness)
            .attr('ry', waffleConfig.roundness)
            .attr('fill', d => vizColorScale(d.category));
        
        // Remove quadrados antigos
        squares.exit()
            .transition()
            .duration(WAFFLE_SETTINGS.animationDuration / 2)
            .style('opacity', 0)
            .remove();
    }

    /**
     * Renderiza títulos
     */
    function renderTitles() {
        // Remove títulos existentes
        vizSvg.selectAll('.chart-title-svg, .chart-subtitle-svg').remove();
        
        // Título principal
        if (vizCurrentConfig.title) {
            vizSvg.append('text')
                .attr('class', 'chart-title-svg')
                .attr('x', vizCurrentConfig.width / 2)
                .attr('y', 30)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor)
                .style('font-family', vizCurrentConfig.fontFamily)
                .style('font-size', (vizCurrentConfig.titleSize || 24) + 'px')
                .style('font-weight', 'bold')
                .text(vizCurrentConfig.title);
        }
        
        // Subtítulo
        if (vizCurrentConfig.subtitle) {
            vizSvg.append('text')
                .attr('class', 'chart-subtitle-svg')
                .attr('x', vizCurrentConfig.width / 2)
                .attr('y', 50)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor)
                .style('font-family', vizCurrentConfig.fontFamily)
                .style('font-size', (vizCurrentConfig.subtitleSize || 16) + 'px')
                .style('opacity', 0.8)
                .text(vizCurrentConfig.subtitle);
        }
        
        // Atualiza também os elementos HTML se existirem
        updateHTMLTitles();
    }

    /**
     * Atualiza títulos HTML
     */
    function updateHTMLTitles() {
        const htmlTitle = document.getElementById('rendered-title');
        const htmlSubtitle = document.getElementById('rendered-subtitle');
        
        if (htmlTitle) {
            htmlTitle.textContent = vizCurrentConfig.title || '';
            htmlTitle.style.fontFamily = vizCurrentConfig.fontFamily;
            htmlTitle.style.fontSize = (vizCurrentConfig.titleSize || 24) + 'px';
            htmlTitle.style.color = vizCurrentConfig.textColor;
        }
        
        if (htmlSubtitle) {
            htmlSubtitle.textContent = vizCurrentConfig.subtitle || '';
            htmlSubtitle.style.fontFamily = vizCurrentConfig.fontFamily;
            htmlSubtitle.style.fontSize = (vizCurrentConfig.subtitleSize || 16) + 'px';
            htmlSubtitle.style.color = vizCurrentConfig.textColor;
        }
    }

    /**
     * Renderiza legenda
     */
    function renderLegend() {
        // Remove legenda existente
        vizLegendGroup.selectAll('*').remove();
        
        if (!vizCurrentConfig.showLegend || !vizProcessedData || vizProcessedData.length === 0) {
            return;
        }
        
        const legendData = vizProcessedData.map(d => ({
            label: d.categoria,
            color: vizColorScale(d.categoria),
            value: d.valor,
            percentage: d.percentage,
            squares: d.squares
        }));
        
        const legendItemWidth = 150;
        const legendItemHeight = 25;
        const legendY = vizCurrentConfig.height - 80;
        const itemsPerRow = Math.floor((vizCurrentConfig.width - 100) / legendItemWidth);
        
        const legend = vizLegendGroup
            .attr('transform', `translate(50, ${legendY})`);
        
        const legendItems = legend.selectAll('.legend-item')
            .data(legendData)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => {
                const row = Math.floor(i / itemsPerRow);
                const col = i % itemsPerRow;
                return `translate(${col * legendItemWidth}, ${row * legendItemHeight})`;
            });
        
        // Retângulos coloridos (mini waffles)
        legendItems.append('rect')
            .attr('width', 14)
            .attr('height', 14)
            .attr('rx', 2)
            .attr('ry', 2)
            .attr('fill', d => d.color);
        
        // Labels com categoria
        legendItems.append('text')
            .attr('x', 20)
            .attr('y', 7)
            .attr('dy', '0.32em')
            .style('fill', vizCurrentConfig.textColor)
            .style('font-family', vizCurrentConfig.fontFamily)
            .style('font-size', '12px')
            .style('font-weight', '500')
            .text(d => d.label);
        
        // Porcentagem
        legendItems.append('text')
            .attr('x', 20)
            .attr('y', 19)
            .attr('dy', '0.32em')
            .style('fill', vizCurrentConfig.textColor)
            .style('font-family', vizCurrentConfig.fontFamily)
            .style('font-size', '10px')
            .style('opacity', 0.7)
            .text(d => `${d.percentage}% (${d.squares} quadrados)`);
    }

    // ==========================================================================
    // INTERAÇÕES
    // ==========================================================================

    /**
     * Manipula hover nos quadrados
     */
    function handleSquareHover(event, d) {
        if (!waffleConfig.hover_effect) return;
        
        // Destaca o quadrado
        d3.select(event.target)
            .transition()
            .duration(200)
            .style('opacity', 0.7)
            .attr('stroke', vizCurrentConfig.textColor)
            .attr('stroke-width', 2);
        
        // Destaca outros quadrados da mesma categoria
        vizWaffleGroup.selectAll('.waffle-square')
            .filter(square => square.category === d.category)
            .transition()
            .duration(200)
            .style('opacity', 0.9);
        
        // Diminui opacidade dos outros
        vizWaffleGroup.selectAll('.waffle-square')
            .filter(square => square.category !== d.category)
            .transition()
            .duration(200)
            .style('opacity', 0.3);
        
        // Mostra tooltip
        showTooltip(event, d);
    }

    /**
     * Manipula saída do hover
     */
    function handleSquareOut(event, d) {
        if (!waffleConfig.hover_effect) return;
        
        // Remove destaque do quadrado
        d3.select(event.target)
            .transition()
            .duration(200)
            .style('opacity', 1)
            .attr('stroke', 'none')
            .attr('stroke-width', 0);
        
        // Restaura opacidade de todos os quadrados
        vizWaffleGroup.selectAll('.waffle-square')
            .transition()
            .duration(200)
            .style('opacity', 1);
        
        // Esconde tooltip
        hideTooltip();
    }

    /**
     * Manipula clique nos quadrados
     */
    function handleSquareClick(event, d) {
        console.log('Waffle square clicked:', d);
        
        if (window.OddVizApp && window.OddVizApp.showNotification) {
            window.OddVizApp.showNotification(
                `${d.category}: ${d.percentage}% (${d.originalData.squares} quadrados)`, 
                'info'
            );
        }
    }

    /**
     * Mostra tooltip
     */
    function showTooltip(event, d) {
        // Remove tooltip anterior
        hideTooltip();
        
        // Cria nova tooltip
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
                <div>Quadrados: ${d.originalData.squares} de 100</div>
            `);
        
        tooltip.transition()
            .duration(200)
            .style('opacity', 1);
    }

    /**
     * Esconde tooltip
     */
    function hideTooltip() {
        d3.selectAll('.viz-tooltip').remove();
    }

    // ==========================================================================
    // CALLBACKS EXTERNOS
    // ==========================================================================

    /**
     * Callback chamado quando controles gerais são atualizados
     */
    function onUpdate(newConfig) {
        console.log('WaffleVisualization.onUpdate chamado com:', newConfig);
        
        if (!vizCurrentData || vizCurrentData.length === 0) {
            console.warn('Sem dados para atualizar visualização');
            return;
        }
        
        // Mescla nova configuração, mapeando propriedades do template
        const mappedConfig = {
            width: newConfig.chartWidth || vizCurrentConfig.width,
            height: newConfig.chartHeight || vizCurrentConfig.height,
            title: newConfig.title || vizCurrentConfig.title,
            subtitle: newConfig.subtitle || vizCurrentConfig.subtitle,
            backgroundColor: newConfig.backgroundColor || vizCurrentConfig.backgroundColor,
            textColor: newConfig.textColor || vizCurrentConfig.textColor,
            fontFamily: newConfig.fontFamily || vizCurrentConfig.fontFamily,
            showLegend: newConfig.showLegend !== undefined ? newConfig.showLegend : vizCurrentConfig.showLegend,
            legendPosition: newConfig.legendPosition || vizCurrentConfig.legendPosition,
            colors: newConfig.colorPalette ? 
                (window.OddVizTemplateControls ? 
                    window.OddVizTemplateControls.getCurrentColorPalette() : 
                    vizCurrentConfig.colors) : 
                vizCurrentConfig.colors
        };
        
        vizCurrentConfig = Object.assign({}, vizCurrentConfig, mappedConfig);
        
        console.log('Configuração atualizada:', vizCurrentConfig);
        
        // Re-renderiza
        renderVisualization(vizCurrentData, vizCurrentConfig);
    }

    /**
     * Callback chamado quando controles específicos do waffle são atualizados
     */
    function onWaffleControlUpdate(waffleControls) {
        console.log('Waffle specific controls updated:', waffleControls);
        
        // Atualiza configurações específicas do waffle
        Object.assign(waffleConfig, waffleControls);
        
        // Re-renderiza se há dados
        if (vizCurrentData && vizCurrentData.length > 0) {
            renderVisualization(vizCurrentData, vizCurrentConfig);
        }
    }

    /**
     * Callback chamado quando novos dados são carregados
     */
    function onDataLoaded(processedData) {
        console.log('New waffle data loaded:', processedData);
        
        if (processedData && processedData.data) {
            renderVisualization(processedData.data, vizCurrentConfig || getDefaultConfig());
        }
    }

    // ==========================================================================
    // UTILITÁRIOS
    // ==========================================================================

    /**
     * Mostra mensagem quando não há dados
     */
    function showNoDataMessage() {
        if (!vizSvg) return;
        
        vizSvg.selectAll('*').remove();
        
        const config = vizCurrentConfig || getDefaultConfig();
        
        // Background
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
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '30px')
            .style('fill', config.textColor)
            .style('font-family', config.fontFamily)
            .style('font-size', '12px')
            .style('opacity', 0.7)
            .text('O gráfico de waffle mostra proporções em uma grade 10x10');
    }

    /**
     * Redimensiona visualização
     */
    function resize(width, height) {
        if (!vizCurrentData) return;
        
        vizCurrentConfig.width = width;
        vizCurrentConfig.height = height;
        
        renderVisualization(vizCurrentData, vizCurrentConfig);
    }

    // ==========================================================================
    // EXPORTAÇÕES GLOBAIS
    // ==========================================================================

    // Torna funções disponíveis globalmente
    window.WaffleVisualization = {
        initVisualization: initVisualization,
        renderVisualization: renderVisualization,
        onUpdate: onUpdate,
        onWaffleControlUpdate: onWaffleControlUpdate,
        onDataLoaded: onDataLoaded,
        resize: resize,
        WAFFLE_SETTINGS: WAFFLE_SETTINGS
    };

    // Função global para ser chamada quando dados são carregados
    window.onDataLoaded = onDataLoaded;

    // Função global para inicializar
    window.initVisualization = initVisualization;

    // ==========================================================================
    // AUTO-INICIALIZAÇÃO
    // ==========================================================================

    // Aguarda D3 e DOM estarem prontos
    function waitForD3AndInit() {
        if (typeof d3 !== 'undefined' && document.readyState !== 'loading') {
            console.log('D3 and DOM ready, initializing waffle visualization');
            initVisualization();
        } else {
            console.log('Waiting for D3 and DOM...');
            setTimeout(waitForD3AndInit, 100);
        }
    }

    // Inicia o processo
    waitForD3AndInit();

})();

console.log('Waffle chart visualization script loaded');
