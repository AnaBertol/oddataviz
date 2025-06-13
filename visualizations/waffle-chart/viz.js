/**
 * WAFFLE CHART VISUALIZATION
 * Implementação do gráfico de waffle usando D3.js
 * 
 * Dependências:
 * - D3.js v7
 * - config.js (configurações específicas)
 * - data-utils.js (manipulação de dados)
 * - export-utils.js (exportação)
 */

// ==========================================================================
// CONFIGURAÇÕES E CONSTANTES
// ==========================================================================

// Configurações específicas do waffle
const WAFFLE_SETTINGS = {
    rows: 10,
    cols: 10,
    total: 100,
    squareSize: 25,
    gap: 2,
    roundness: 3,
    transitionDuration: 800,
    defaultWidth: 800,
    defaultHeight: 600,
    margins: {
        top: 80,
        right: 150,
        bottom: 120,
        left: 80
    }
};

// ==========================================================================
// ESTADO GLOBAL DA VISUALIZAÇÃO
// ==========================================================================

(function() {
    // Variáveis de estado
    let vizSvg = null;
    let vizWaffleGroup = null;
    let vizLegendGroup = null;
    let vizDirectLabelsGroup = null;
    let vizColorScale = null;
    let vizProcessedData = null;
    let vizSquaresArray = null;
    let vizCurrentConfig = null;
    let vizLayoutInfo = null;
    let vizIsInitialized = false;
    let vizRenderInProgress = false;

    // Configurações específicas do waffle
    let waffleConfig = {
        size: WAFFLE_SETTINGS.squareSize,
        gap: WAFFLE_SETTINGS.gap,
        roundness: WAFFLE_SETTINGS.roundness,
        animation: false,
        hover_effect: true,
        maxSize: 35,
        minSize: 12,
        maxGap: 6
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
        
        // Formato de tela padrão (quadrado)
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
            screenFormat: 'square', // ✅ FORMATO QUADRADO POR PADRÃO
            title: 'Distribuição por Categoria',
            subtitle: 'Visualização em formato waffle',
            dataSource: 'Dados de Exemplo, 2024',
            colors: ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'],
            backgroundColor: '#FFFFFF', // ✅ FUNDO BRANCO POR PADRÃO
            textColor: '#2C3E50', // ✅ FONTE ESCURA POR PADRÃO
            fontFamily: 'Inter',
            titleSize: 24,
            subtitleSize: 16,
            showLegend: true,
            legendPosition: 'bottom',
            showDataLabels: false,
            showTooltip: true,
            showGrid: false,
            animationDuration: 800
        };
    }

    // ==========================================================================
    // PROCESSAMENTO DE DADOS
    // ==========================================================================

    function processData(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.error('Dados inválidos ou vazios');
            return null;
        }
        
        const total = d3.sum(data, d => +d.valor);
        
        return data.map(d => {
            const percentage = (+d.valor / total) * 100;
            const squares = Math.round(percentage);
            return {
                categoria: d.categoria,
                valor: +d.valor,
                percentage: percentage,
                squares: squares,
                formattedPercentage: percentage.toFixed(1) + '%'
            };
        });
    }

    function createSquaresArray(processedData) {
        const squares = [];
        let index = 0;
        
        processedData.forEach(d => {
            for (let i = 0; i < d.squares; i++) {
                const row = Math.floor(index / WAFFLE_SETTINGS.cols);
                const col = index % WAFFLE_SETTINGS.cols;
                
                squares.push({
                    index: index,
                    row: row,
                    col: col,
                    category: d.categoria,
                    percentage: d.percentage,
                    formattedPercentage: d.formattedPercentage
                });
                
                index++;
            }
        });
        
        // Preenche com vazios se necessário
        while (index < WAFFLE_SETTINGS.total) {
            const row = Math.floor(index / WAFFLE_SETTINGS.cols);
            const col = index % WAFFLE_SETTINGS.cols;
            
            squares.push({
                index: index,
                row: row,
                col: col,
                category: 'empty',
                percentage: 0,
                formattedPercentage: '0%'
            });
            
            index++;
        }
        
        return squares;
    }

    // ==========================================================================
    // CÁLCULO DE LAYOUT
    // ==========================================================================

    function calculateWaffleLayout(config) {
        const margins = getMarginsByFormat(config.screenFormat);
        const availableWidth = config.width - margins.left - margins.right;
        const availableHeight = config.height - margins.top - margins.bottom;
        
        const totalWidth = WAFFLE_SETTINGS.cols * waffleConfig.size + 
                          (WAFFLE_SETTINGS.cols - 1) * waffleConfig.gap;
        const totalHeight = WAFFLE_SETTINGS.rows * waffleConfig.size + 
                           (WAFFLE_SETTINGS.rows - 1) * waffleConfig.gap;
        
        const scale = Math.min(
            availableWidth / totalWidth,
            availableHeight / totalHeight,
            1.5
        );
        
        const scaledSize = Math.floor(waffleConfig.size * scale);
        const scaledGap = waffleConfig.gap * scale;
        
        const actualWidth = WAFFLE_SETTINGS.cols * scaledSize + 
                           (WAFFLE_SETTINGS.cols - 1) * scaledGap;
        const actualHeight = WAFFLE_SETTINGS.rows * scaledSize + 
                            (WAFFLE_SETTINGS.rows - 1) * scaledGap;
        
        const offsetX = (availableWidth - actualWidth) / 2;
        const offsetY = (availableHeight - actualHeight) / 2;
        
        return {
            x: margins.left + offsetX,
            y: margins.top + offsetY,
            squareSize: scaledSize,
            gap: scaledGap,
            totalWidth: actualWidth,
            totalHeight: actualHeight,
            scale: scale
        };
    }

    function getMarginsByFormat(format) {
        switch(format) {
            case 'mobile':
                return { top: 60, right: 40, bottom: 100, left: 40 };
            case 'square':
                return { top: 70, right: 70, bottom: 110, left: 70 };
            default:
                return { top: 80, right: 80, bottom: 120, left: 80 };
        }
    }

    // ==========================================================================
    // RENDERIZAÇÃO PRINCIPAL
    // ==========================================================================

    function renderVisualization(data, config = {}) {
        if (vizRenderInProgress) {
            console.log('Renderização já em progresso, aguardando...');
            return;
        }
        
        vizRenderInProgress = true;
        vizCurrentConfig = { ...getDefaultConfig(), ...config };
        
        vizProcessedData = processData(data);
        if (!vizProcessedData) {
            vizRenderInProgress = false;
            return;
        }
        
        vizSquaresArray = createSquaresArray(vizProcessedData);
        vizLayoutInfo = {
            waffle: calculateWaffleLayout(vizCurrentConfig)
        };
        
        updateSVGDimensions();
        updateBackground();
        createColorScale();
        renderWaffleSquares();
        
        if (vizCurrentConfig.showLegend) {
            renderDirectLabels();
        } else {
            vizDirectLabelsGroup.selectAll('*').remove();
        }
        
        renderTitles();
        
        vizIsInitialized = true;
        vizRenderInProgress = false;
    }

    // ==========================================================================
    // RENDERIZAÇÃO DE COMPONENTES
    // ==========================================================================

    function updateSVGDimensions() {
        vizSvg
            .attr('width', vizCurrentConfig.width)
            .attr('height', vizCurrentConfig.height);
        
        const chartContainer = document.getElementById('chart-container');
        if (chartContainer) {
            const aspectRatio = vizCurrentConfig.width / vizCurrentConfig.height;
            chartContainer.style.aspectRatio = aspectRatio;
        }
    }

    function updateBackground() {
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
        
        if (waffleConfig.animation) {
            squareEnter
                .transition()
                .duration(WAFFLE_SETTINGS.transitionDuration)
                .delay(d => d.index * 10)
                .style('opacity', 1);
        }
        
        if (waffleConfig.hover_effect) {
            squareEnter
                .on('mouseover', function(event, d) {
                    if (d.category === 'empty') return;
                    
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('transform', `scale(1.1)`)
                        .attr('x', d => d.col * (layout.squareSize + layout.gap) - layout.squareSize * 0.05)
                        .attr('y', d => d.row * (layout.squareSize + layout.gap) - layout.squareSize * 0.05);
                    
                    showTooltip(event, d);
                })
                .on('mouseout', function(event, d) {
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr('transform', 'scale(1)')
                        .attr('x', d => d.col * (layout.squareSize + layout.gap))
                        .attr('y', d => d.row * (layout.squareSize + layout.gap));
                    
                    hideTooltip();
                });
        }
    }

    function renderDirectLabels() {
        vizDirectLabelsGroup.selectAll('*').remove();
        
        const layout = vizLayoutInfo.waffle;
        const labelPosition = document.querySelector('input[name="direct-label-position"]:checked')?.value || 'right';
        
        const isRight = labelPosition === 'right';
        const x = isRight ? 
            layout.x + layout.totalWidth + 20 : 
            layout.x - 20;
        
        const labels = vizDirectLabelsGroup.selectAll('.direct-label')
            .data(vizProcessedData);
        
        const labelGroups = labels.enter()
            .append('g')
            .attr('class', 'direct-label')
            .attr('transform', (d, i) => `translate(${x}, ${layout.y + i * 30})`);
        
        labelGroups.append('rect')
            .attr('x', isRight ? 0 : -12)
            .attr('y', -6)
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', d => vizColorScale(d.categoria))
            .attr('rx', 2);
        
        labelGroups.append('text')
            .attr('x', isRight ? 20 : -20)
            .attr('y', 3)
            .attr('text-anchor', isRight ? 'start' : 'end')
            .attr('fill', vizCurrentConfig.textColor)
            .attr('font-family', vizCurrentConfig.fontFamily)
            .attr('font-size', '14px')
            .text(d => `${d.categoria}: ${d.formattedPercentage}`);
    }

    function renderTitles() {
        vizSvg.selectAll('.chart-title, .chart-subtitle, .chart-source').remove();
        
        if (vizCurrentConfig.title) {
            vizSvg.append('text')
                .attr('class', 'chart-title')
                .attr('x', vizCurrentConfig.width / 2)
                .attr('y', 40)
                .attr('text-anchor', 'middle')
                .attr('fill', vizCurrentConfig.textColor)
                .attr('font-family', vizCurrentConfig.fontFamily)
                .attr('font-size', vizCurrentConfig.titleSize + 'px')
                .attr('font-weight', '600')
                .text(vizCurrentConfig.title);
        }
        
        if (vizCurrentConfig.subtitle) {
            vizSvg.append('text')
                .attr('class', 'chart-subtitle')
                .attr('x', vizCurrentConfig.width / 2)
                .attr('y', 65)
                .attr('text-anchor', 'middle')
                .attr('fill', vizCurrentConfig.textColor)
                .attr('font-family', vizCurrentConfig.fontFamily)
                .attr('font-size', vizCurrentConfig.subtitleSize + 'px')
                .attr('opacity', 0.8)
                .text(vizCurrentConfig.subtitle);
        }
        
        if (vizCurrentConfig.dataSource) {
            vizSvg.append('text')
                .attr('class', 'chart-source')
                .attr('x', vizCurrentConfig.width / 2)
                .attr('y', vizCurrentConfig.height - 20)
                .attr('text-anchor', 'middle')
                .attr('fill', vizCurrentConfig.textColor)
                .attr('font-family', vizCurrentConfig.fontFamily)
                .attr('font-size', '12px')
                .attr('opacity', 0.6)
                .text('Fonte: ' + vizCurrentConfig.dataSource);
        }
    }

    // ==========================================================================
    // TOOLTIP
    // ==========================================================================

    function showTooltip(event, d) {
        if (d.category === 'empty' || !vizCurrentConfig.showTooltip) return;
        
        let tooltip = d3.select('body').select('.waffle-tooltip');
        if (tooltip.empty()) {
            tooltip = d3.select('body')
                .append('div')
                .attr('class', 'waffle-tooltip')
                .style('position', 'absolute')
                .style('padding', '10px')
                .style('background', 'rgba(0, 0, 0, 0.8)')
                .style('color', 'white')
                .style('border-radius', '4px')
                .style('font-size', '14px')
                .style('pointer-events', 'none')
                .style('opacity', 0);
        }
        
        const categoryData = vizProcessedData.find(item => item.categoria === d.category);
        
        tooltip
            .html(`
                <strong>${d.category}</strong><br>
                Valor: ${categoryData.valor}<br>
                Percentual: ${d.formattedPercentage}
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .transition()
            .duration(200)
            .style('opacity', 1);
    }

    function hideTooltip() {
        d3.select('.waffle-tooltip')
            .transition()
            .duration(200)
            .style('opacity', 0);
    }

    // ==========================================================================
    // ATUALIZAÇÕES E CONTROLES
    // ==========================================================================

    window.updateWaffleConfig = function(updates) {
        Object.assign(waffleConfig, updates);
        
        if (vizProcessedData && vizCurrentConfig) {
            vizLayoutInfo = {
                waffle: calculateWaffleLayout(vizCurrentConfig)
            };
            renderWaffleSquares();
            if (vizCurrentConfig.showLegend) {
                renderDirectLabels();
            }
        }
    };

    window.updateVisualization = function(config) {
        if (!vizProcessedData) return;
        
        vizCurrentConfig = { ...vizCurrentConfig, ...config };
        vizLayoutInfo = {
            waffle: calculateWaffleLayout(vizCurrentConfig)
        };
        
        updateSVGDimensions();
        updateBackground();
        renderWaffleSquares();
        
        if (vizCurrentConfig.showLegend) {
            renderDirectLabels();
        } else {
            vizDirectLabelsGroup.selectAll('*').remove();
        }
        
        renderTitles();
    };

    // ==========================================================================
    // EXPORTAÇÕES E INICIALIZAÇÃO
    // ==========================================================================

    window.WaffleViz = {
        init: initVisualization,
        render: renderVisualization,
        updateConfig: updateWaffleConfig,
        updateVisualization: updateVisualization,
        getConfig: () => vizCurrentConfig,
        getData: () => vizProcessedData
    };

    // Auto-inicialização
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVisualization);
    } else {
        setTimeout(initVisualization, 100);
    }

})();
