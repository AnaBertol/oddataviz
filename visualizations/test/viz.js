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
    // VARIÁVEIS GLOBAIS DO MÓDULO
    // ==========================================================================

    let svg = null;
    let chartGroup = null;
    let xScale = null;
    let yScale = null;
    let colorScale = null;
    let currentData = null;
    let currentConfig = null;

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
        
        // Cria SVG
        svg = d3.select(chartContainer)
            .append('svg')
            .attr('id', 'test-viz')
            .attr('width', VIZ_SETTINGS.defaultWidth)
            .attr('height', VIZ_SETTINGS.defaultHeight);
        
        // Grupo principal
        chartGroup = svg.append('g')
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
        
        currentData = data;
        currentConfig = Object.assign({}, getDefaultConfig(), config);
        
        // Atualiza dimensões do SVG
        updateSVGDimensions();
        
        // Calcula dimensões internas
        const width = currentConfig.width - VIZ_SETTINGS.margins.left - VIZ_SETTINGS.margins.right;
        const height = currentConfig.height - VIZ_SETTINGS.margins.top - VIZ_SETTINGS.margins.bottom;
        
        // Cria escalas
        createScales(data, width, height);
        
        // Renderiza elementos
        renderBars(data, width, height);
        renderAxes(width, height);
        renderTitles();
        
        if (currentConfig.showLegend) {
            renderLegend(data, width, height);
        }
        
        console.log('Visualization rendered with data:', data.length, 'items');
    }

    /**
     * Atualiza dimensões do SVG
     */
    function updateSVGDimensions() {
        if (!svg) return;
        
        svg.attr('width', currentConfig.width)
           .attr('height', currentConfig.height);
    }

    /**
     * Cria escalas para a visualização
     */
    function createScales(data, width, height) {
        // Escala X (bandas para categorias)
        xScale = d3.scaleBand()
            .domain(data.map(d => d.categoria))
            .range([0, width])
            .padding(VIZ_SETTINGS.barPadding);
        
        // Escala Y (linear para valores)
        const maxValue = d3.max(data, d => d.valor) || 0;
        yScale = d3.scaleLinear()
            .domain([0, maxValue * 1.1]) // 10% extra para espaçamento
            .range([height, 0])
            .nice();
        
        // Escala de cores
        colorScale = d3.scaleOrdinal()
            .domain(data.map(d => d.categoria))
            .range(currentConfig.colors);
    }

    // ==========================================================================
    // RENDERIZAÇÃO DE ELEMENTOS
    // ==========================================================================

    /**
     * Renderiza barras
     */
    function renderBars(data, width, height) {
        const bars = chartGroup.selectAll('.bar')
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
            .attr('x', d => xScale(d.categoria))
            .attr('y', d => yScale(d.valor))
            .attr('width', xScale.bandwidth())
            .attr('height', d => height - yScale(d.valor))
            .attr('fill', d => colorScale(d.categoria));
        
        // Adiciona novas barras
        bars.enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', d => xScale(d.categoria))
            .attr('y', height)
            .attr('width', xScale.bandwidth())
            .attr('height', 0)
            .attr('fill', d => colorScale(d.categoria))
            .style('cursor', 'pointer')
            .on('mouseover', handleBarHover)
            .on('mouseout', handleBarOut)
            .on('click', handleBarClick)
            .transition()
            .duration(VIZ_SETTINGS.animationDuration)
            .attr('y', d => yScale(d.valor))
            .attr('height', d => height - yScale(d.valor));
    }

    /**
     * Renderiza eixos
     */
    function renderAxes(width, height) {
        // Remove eixos existentes
        chartGroup.selectAll('.axis').remove();
        
        // Eixo X
        const xAxis = d3.axisBottom(xScale);
        chartGroup.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis)
            .selectAll('text')
            .style('fill', currentConfig.textColor)
            .style('font-family', currentConfig.fontFamily)
            .style('font-size', '12px');
        
        // Eixo Y
        const yAxis = d3.axisLeft(yScale);
        chartGroup.append('g')
            .attr('class', 'axis y-axis')
            .call(yAxis)
            .selectAll('text')
            .style('fill', currentConfig.textColor)
            .style('font-family', currentConfig.fontFamily)
            .style('font-size', '12px');
        
        // Estiliza linhas dos eixos
        chartGroup.selectAll('.axis .domain, .axis .tick line')
            .style('stroke', currentConfig.textColor)
            .style('stroke-width', 1);
    }

    /**
     * Renderiza títulos
     */
    function renderTitles() {
        // Remove títulos existentes
        svg.selectAll('.chart-title, .chart-subtitle').remove();
        
        // Título principal
        if (currentConfig.title) {
            svg.append('text')
                .attr('class', 'chart-title')
                .attr('x', currentConfig.width / 2)
                .attr('y', 30)
                .attr('text-anchor', 'middle')
                .style('fill', currentConfig.textColor)
                .style('font-family', currentConfig.fontFamily)
                .style('font-size', '20px')
                .style('font-weight', 'bold')
                .text(currentConfig.title);
        }
        
        // Subtítulo
        if (currentConfig.subtitle) {
            svg.append('text')
                .attr('class', 'chart-subtitle')
                .attr('x', currentConfig.width / 2)
                .attr('y', 50)
                .attr('text-anchor', 'middle')
                .style('fill', currentConfig.textColor)
                .style('font-family', currentConfig.fontFamily)
                .style('font-size', '14px')
                .style('opacity', 0.8)
                .text(currentConfig.subtitle);
        }
    }

    /**
     * Renderiza legenda
     */
    function renderLegend(data, width, height) {
        // Remove legenda existente
        svg.selectAll('.legend').remove();
        
        if (!currentConfig.showLegend) return;
        
        const legendData = data.map(d => ({
            label: d.categoria,
            color: colorScale(d.categoria)
        }));
        
        const legendItemWidth = 100;
        const legendItemHeight = 20;
        const legendY = currentConfig.height - 40;
        
        const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${(currentConfig.width - legendData.length * legendItemWidth) / 2}, ${legendY})`);
        
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
            .style('fill', currentConfig.textColor)
            .style('font-family', currentConfig.fontFamily)
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
        // Implementação básica de tooltip
        const tooltip = d3.select('body')
            .selectAll('.viz-tooltip')
            .data([1]);
        
        const tooltipEnter = tooltip.enter()
            .append('div')
            .attr('class', 'viz-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0,0,0,0.8)')
            .style('color', 'white')
            .style('padding', '8px')
            .style('border-radius', '4px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('opacity', 0);
        
        tooltip.merge(tooltipEnter)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .html(`<strong>${d.categoria}</strong><br/>Valor: ${d.valor}`)
            .transition()
            .duration(200)
            .style('opacity', 1);
    }

    /**
     * Esconde tooltip
     */
    function hideTooltip() {
        d3.select('.viz-tooltip')
            .transition()
            .duration(200)
            .style('opacity', 0)
            .remove();
    }

    // ==========================================================================
    // CALLBACKS EXTERNOS
    // ==========================================================================

    /**
     * Callback chamado quando controles são atualizados
     */
    function onUpdate(newConfig) {
        if (!currentData) return;
        
        console.log('Updating visualization with new config:', newConfig);
        
        // Mescla nova configuração
        currentConfig = Object.assign({}, currentConfig, newConfig);
        
        // Re-renderiza
        renderVisualization(currentData, currentConfig);
    }

    /**
     * Callback chamado quando novos dados são carregados
     */
    function onDataLoaded(processedData) {
        console.log('New data loaded:', processedData);
        
        if (processedData && processedData.data) {
            renderVisualization(processedData.data, currentConfig || getDefaultConfig());
        }
    }

    // ==========================================================================
    // UTILITÁRIOS
    // ==========================================================================

    /**
     * Mostra mensagem quando não há dados
     */
    function showNoDataMessage() {
        if (!svg) return;
        
        svg.selectAll('*').remove();
        
        const message = svg.append('g')
            .attr('class', 'no-data-message')
            .attr('transform', `translate(${currentConfig.width / 2}, ${currentConfig.height / 2})`);
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-10px')
            .style('fill', currentConfig.textColor)
            .style('font-family', currentConfig.fontFamily)
            .style('font-size', '18px')
            .text('📊');
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '20px')
            .style('fill', currentConfig.textColor)
            .style('font-family', currentConfig.fontFamily)
            .style('font-size', '14px')
            .text('Carregue dados para visualizar');
    }

    /**
     * Redimensiona visualização
     */
    function resize(width, height) {
        if (!currentData) return;
        
        currentConfig.width = width;
        currentConfig.height = height;
        
        renderVisualization(currentData, currentConfig);
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
