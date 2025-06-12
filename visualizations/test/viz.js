/**
 * VISUALIZAÇÃO DE TESTE - D3.js
 * Gráfico de barras simples para testar o template
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURAÇÕES DA VISUALIZAÇÃO
    // ==========================================================================

    const VIZ_SETTINGS = {
        margins: { top: 40, right: 40, bottom: 80, left: 80 },
        defaultWidth: 800,
        defaultHeight: 400,
        barPadding: 0.1,
        animationDuration: 750,
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
    let vizChartGroup = null;
    let vizXScale = null;
    let vizYScale = null;
    let vizColorScale = null;
    let vizCurrentData = null;
    let vizCurrentConfig = null;

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

    /**
     * Inicializa a visualização de teste
     */
    function initVisualization() {
        console.log('Initializing test visualization...');
        
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
                    console.log('Loading sample data:', sampleData);
                    renderVisualization(sampleData.data, getDefaultConfig());
                }
            } else {
                console.warn('getSampleData não encontrada');
            }
        }, 100);
        
        console.log('Test visualization initialized');
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
            .attr('id', 'test-viz')
            .attr('width', VIZ_SETTINGS.defaultWidth)
            .attr('height', VIZ_SETTINGS.defaultHeight);
        
        // Grupo principal
        vizChartGroup = vizSvg.append('g')
            .attr('transform', `translate(${VIZ_SETTINGS.margins.left}, ${VIZ_SETTINGS.margins.top})`);
    }

    /**
     * Obtém configuração padrão
     */
    function getDefaultConfig() {
        return {
            width: VIZ_SETTINGS.defaultWidth,
            height: VIZ_SETTINGS.defaultHeight,
            title: 'Gráfico de Teste',
            subtitle: 'Testando todos os controles',
            colors: ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'],
            backgroundColor: '#373737',
            textColor: '#FAF9FA',
            fontFamily: 'Inter',
            showLegend: true,
            legendPosition: 'bottom'
        };
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
        
        // Atualiza dimensões do SVG
        updateSVGDimensions();
        
        // Calcula dimensões internas
        const width = vizCurrentConfig.width - VIZ_SETTINGS.margins.left - VIZ_SETTINGS.margins.right;
        const height = vizCurrentConfig.height - VIZ_SETTINGS.margins.top - VIZ_SETTINGS.margins.bottom;
        
        // Cria escalas
        createScales(data, width, height);
        
        // Renderiza elementos
        renderBars(data, width, height);
        renderAxes(width, height);
        renderTitles();
        
        if (vizCurrentConfig.showLegend) {
            renderLegend(data, width, height);
        }
        
        console.log('Visualization rendered with data:', data.length, 'items');
    }

    /**
     * Atualiza dimensões do SVG
     */
    function updateSVGDimensions() {
        if (!vizSvg) return;
        
        vizSvg.attr('width', vizCurrentConfig.width)
              .attr('height', vizCurrentConfig.height);
    }

    /**
     * Cria escalas para a visualização
     */
    function createScales(data, width, height) {
        // Escala X (bandas para categorias)
        vizXScale = d3.scaleBand()
            .domain(data.map(d => d.categoria))
            .range([0, width])
            .padding(VIZ_SETTINGS.barPadding);
        
        // Escala Y (linear para valores)
        const maxValue = d3.max(data, d => d.valor) || 0;
        vizYScale = d3.scaleLinear()
            .domain([0, maxValue * 1.1]) // 10% extra para espaçamento
            .range([height, 0])
            .nice();
        
        // Escala de cores
        vizColorScale = d3.scaleOrdinal()
            .domain(data.map(d => d.categoria))
            .range(vizCurrentConfig.colors);
    }

    // ==========================================================================
    // RENDERIZAÇÃO DE ELEMENTOS
    // ==========================================================================

    /**
     * Renderiza barras
     */
    function renderBars(data, width, height) {
        const bars = vizChartGroup.selectAll('.bar')
            .data(data, d => d.categoria);
        
        // Remove barras antigas
        bars.exit()
            .transition()
            .duration(VIZ_SETTINGS.animationDuration / 2)
            .attr('height', 0)
            .attr('y', height)
            .remove();
        
        // Atualiza barras existentes
        bars.transition()
            .duration(VIZ_SETTINGS.animationDuration)
            .attr('x', d => vizXScale(d.categoria))
            .attr('y', d => vizYScale(d.valor))
            .attr('width', vizXScale.bandwidth())
            .attr('height', d => height - vizYScale(d.valor))
            .attr('fill', d => vizColorScale(d.categoria));
        
        // Adiciona novas barras
        bars.enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => vizXScale(d.categoria))
            .attr('y', height)
            .attr('width', vizXScale.bandwidth())
            .attr('height', 0)
            .attr('fill', d => vizColorScale(d.categoria))
            .style('cursor', 'pointer')
            .on('mouseover', handleBarHover)
            .on('mouseout', handleBarOut)
            .on('click', handleBarClick)
            .transition()
            .duration(VIZ_SETTINGS.animationDuration)
            .attr('y', d => vizYScale(d.valor))
            .attr('height', d => height - vizYScale(d.valor));
    }

    /**
     * Renderiza eixos
     */
    function renderAxes(width, height) {
        // Remove eixos existentes
        vizChartGroup.selectAll('.axis').remove();
        
        // Eixo X
        const xAxis = d3.axisBottom(vizXScale);
        vizChartGroup.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis)
            .selectAll('text')
            .style('fill', vizCurrentConfig.textColor)
            .style('font-family', vizCurrentConfig.fontFamily)
            .style('font-size', '12px');
        
        // Eixo Y
        const yAxis = d3.axisLeft(vizYScale);
        vizChartGroup.append('g')
            .attr('class', 'axis y-axis')
            .call(yAxis)
            .selectAll('text')
            .style('fill', vizCurrentConfig.textColor)
            .style('font-family', vizCurrentConfig.fontFamily)
            .style('font-size', '12px');
        
        // Estiliza linhas dos eixos
        vizChartGroup.selectAll('.axis .domain, .axis .tick line')
            .style('stroke', vizCurrentConfig.textColor)
            .style('stroke-width', 1);
    }

    /**
     * Renderiza títulos
     */
    function renderTitles() {
        // Remove títulos existentes
        vizSvg.selectAll('.chart-title, .chart-subtitle').remove();
        
        // Título principal
        if (vizCurrentConfig.title) {
            vizSvg.append('text')
                .attr('class', 'chart-title')
                .attr('x', vizCurrentConfig.width / 2)
                .attr('y', 30)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor)
                .style('font-family', vizCurrentConfig.fontFamily)
                .style('font-size', '20px')
                .style('font-weight', 'bold')
                .text(vizCurrentConfig.title);
        }
        
        // Subtítulo
        if (vizCurrentConfig.subtitle) {
            vizSvg.append('text')
                .attr('class', 'chart-subtitle')
                .attr('x', vizCurrentConfig.width / 2)
                .attr('y', 50)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor)
                .style('font-family', vizCurrentConfig.fontFamily)
                .style('font-size', '14px')
                .style('opacity', 0.8)
                .text(vizCurrentConfig.subtitle);
        }
    }

    /**
     * Renderiza legenda
     */
    function renderLegend(data, width, height) {
        // Remove legenda existente
        vizSvg.selectAll('.legend').remove();
        
        if (!vizCurrentConfig.showLegend) return;
        
        const legendData = data.map(d => ({
            label: d.categoria,
            color: vizColorScale(d.categoria)
        }));
        
        const legendItemWidth = 100;
        const legendItemHeight = 20;
        const legendY = vizCurrentConfig.height - 40;
        
        const legend = vizSvg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${(vizCurrentConfig.width - legendData.length * legendItemWidth) / 2}, ${legendY})`);
        
        const legendItems = legend.selectAll('.legend-item')
            .data(legendData)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => `translate(${i * legendItemWidth}, 0)`);
        
        // Retângulos coloridos
        legendItems.append('rect')
            .attr('width', 12)
            .attr('height', 12)
            .attr('fill', d => d.color);
        
        // Labels
        legendItems.append('text')
            .attr('x', 18)
            .attr('y', 9)
            .attr('dy', '0.32em')
            .style('fill', vizCurrentConfig.textColor)
            .style('font-family', vizCurrentConfig.fontFamily)
            .style('font-size', '11px')
            .text(d => d.label);
    }

    // ==========================================================================
    // INTERAÇÕES
    // ==========================================================================

    /**
     * Manipula hover nas barras
     */
    function handleBarHover(event, d) {
        // Destaca a barra
        d3.select(event.target)
            .transition()
            .duration(200)
            .style('opacity', 0.8);
        
        // Mostra tooltip (implementação básica)
        showTooltip(event, d);
    }

    /**
     * Manipula saída do hover
     */
    function handleBarOut(event, d) {
        // Remove destaque
        d3.select(event.target)
            .transition()
            .duration(200)
            .style('opacity', 1);
        
        // Esconde tooltip
        hideTooltip();
    }

    /**
     * Manipula clique nas barras
     */
    function handleBarClick(event, d) {
        console.log('Bar clicked:', d);
        
        if (window.OddVizApp && window.OddVizApp.showNotification) {
            window.OddVizApp.showNotification(`Clicou em: ${d.categoria} (${d.valor})`, 'info');
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
            .style('background', 'rgba(0,0,0,0.8)')
            .style('color', 'white')
            .style('padding', '8px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .html(`<strong>${d.categoria}</strong><br/>Valor: ${d.valor}`);
        
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
     * Callback chamado quando controles são atualizados
     */
    function onUpdate(newConfig) {
        console.log('TestVisualization.onUpdate chamado com:', newConfig);
        
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
     * Callback chamado quando novos dados são carregados
     */
    function onDataLoaded(processedData) {
        console.log('New data loaded:', processedData);
        
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
        const message = vizSvg.append('g')
            .attr('class', 'no-data-message')
            .attr('transform', `translate(${config.width / 2}, ${config.height / 2})`);
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-10px')
            .style('fill', config.textColor)
            .style('font-family', config.fontFamily)
            .style('font-size', '18px')
            .text('📊');
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '20px')
            .style('fill', config.textColor)
            .style('font-family', config.fontFamily)
            .style('font-size', '14px')
            .text('Carregue dados para visualizar');
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
    window.TestVisualization = {
        initVisualization: initVisualization,
        renderVisualization: renderVisualization,
        onUpdate: onUpdate,
        onDataLoaded: onDataLoaded,
        resize: resize,
        VIZ_SETTINGS: VIZ_SETTINGS
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
            console.log('D3 and DOM ready, initializing test visualization');
            initVisualization();
        } else {
            console.log('Waiting for D3 and DOM...');
            setTimeout(waitForD3AndInit, 100);
        }
    }

    // Inicia o processo
    waitForD3AndInit();

})();

console.log('Test visualization script loaded');
