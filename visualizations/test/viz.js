/**
 * CÓDIGO D3 DA VISUALIZAÇÃO DE TESTE
 * Implementa um gráfico de barras simples para testar o template
 */

// ==========================================================================
// VARIÁVEIS GLOBAIS
// ==========================================================================

let currentData = null;
let currentState = null;
let svg = null;
let chart = null;

// ==========================================================================
// CONFIGURAÇÕES DO GRÁFICO
// ==========================================================================

const CHART_CONFIG = {
    margins: { top: 20, right: 20, bottom: 60, left: 60 },
    defaultWidth: 800,
    defaultHeight: 400,
    animationDuration: 750,
    colors: {
        odd: ['#6F02FD', '#2C0165', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8'],
        blues: ['#08519c', '#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#eff3ff'],
        warm: ['#d73027', '#f46d43', '#fdae61', '#fee08b', '#e0f3f8', '#abd9e9'],
        custom: []
    }
};

// ==========================================================================
// FUNÇÕES PRINCIPAIS DE RENDERIZAÇÃO
// ==========================================================================

/**
 * Inicializa o SVG e estrutura básica
 */
function initializeSVG() {
    // Remove SVG existente
    d3.select('#chart').select('svg').remove();
    
    // Cria novo SVG
    svg = d3.select('#chart')
        .append('svg')
        .attr('width', CHART_CONFIG.defaultWidth)
        .attr('height', CHART_CONFIG.defaultHeight);
    
    // Container principal com margens
    chart = svg.append('g')
        .attr('class', 'chart-container')
        .attr('transform', `translate(${CHART_CONFIG.margins.left},${CHART_CONFIG.margins.top})`);
    
    console.log('SVG initialized');
}

/**
 * Renderiza o gráfico de barras
 */
function renderBarChart(data, state) {
    if (!data || !data.data || !Array.isArray(data.data)) {
        console.log('Invalid data for rendering');
        return;
    }
    
    // Dimensões internas
    const width = (state?.width || CHART_CONFIG.defaultWidth) - CHART_CONFIG.margins.left - CHART_CONFIG.margins.right;
    const height = (state?.height || CHART_CONFIG.defaultHeight) - CHART_CONFIG.margins.top - CHART_CONFIG.margins.bottom;
    
    // Atualiza tamanho do SVG
    svg.attr('width', state?.width || CHART_CONFIG.defaultWidth)
       .attr('height', state?.height || CHART_CONFIG.defaultHeight);
    
    // Escalas
    const xScale = d3.scaleBand()
        .domain(data.data.map(d => d.categoria))
        .range([0, width])
        .padding(0.1);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data.data, d => d.valor)])
        .range([height, 0])
        .nice();
    
    // Escala de cores
    const colors = getCurrentColors(state);
    const colorScale = d3.scaleOrdinal()
        .domain(data.data.map(d => d.categoria))
        .range(colors);
    
    // Limpa conteúdo anterior
    chart.selectAll('*').remove();
    
    // Renderiza barras
    const bars = chart.selectAll('.bar')
        .data(data.data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.categoria))
        .attr('y', height) // Começa de baixo para animação
        .attr('width', xScale.bandwidth())
        .attr('height', 0) // Começa com altura 0 para animação
        .attr('fill', d => colorScale(d.categoria))
        .style('cursor', 'pointer');
    
    // Animação das barras
    bars.transition()
        .duration(CHART_CONFIG.animationDuration)
        .attr('y', d => yScale(d.valor))
        .attr('height', d => height - yScale(d.valor));
    
    // Eixo X
    const xAxis = d3.axisBottom(xScale);
    chart.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .selectAll('text')
        .style('fill', state?.textColor || '#FAF9FA')
        .style('font-size', `${state?.categorySize || 11}px`)
        .style('font-family', state?.fontFamily || 'Inter');
    
    // Eixo Y
    const yAxis = d3.axisLeft(yScale);
    chart.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
        .selectAll('text')
        .style('fill', state?.textColor || '#FAF9FA')
        .style('font-size', `${state?.labelSize || 12}px`)
        .style('font-family', state?.fontFamily || 'Inter');
    
    // Estilo dos eixos
    chart.selectAll('.domain, .tick line')
        .style('stroke', state?.axisColor || '#FAF9FA')
        .style('stroke-width', 1);
    
    // Rótulos de valores (se habilitado)
    if (state?.showValueLabels) {
        chart.selectAll('.value-label')
            .data(data.data)
            .enter().append('text')
            .attr('class', 'value-label')
            .attr('x', d => xScale(d.categoria) + xScale.bandwidth() / 2)
            .attr('y', d => yScale(d.valor) - 5)
            .attr('text-anchor', 'middle')
            .style('fill', state?.textColor || '#FAF9FA')
            .style('font-size', `${state?.labelSize || 12}px`)
            .style('font-family', state?.fontFamily || 'Inter')
            .text(d => d.valor)
            .style('opacity', 0)
            .transition()
            .delay(CHART_CONFIG.animationDuration / 2)
            .duration(CHART_CONFIG.animationDuration / 2)
            .style('opacity', 1);
    }
    
    // Hover effects
    bars.on('mouseover', function(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .style('opacity', 0.8);
        
        // Tooltip simples
        showTooltip(event, d);
    })
    .on('mouseout', function() {
        d3.select(this)
            .transition()
            .duration(200)
            .style('opacity', 1);
        
        hideTooltip();
    });
    
    // Renderiza legenda se habilitada
    if (state?.showLegend && !state?.legendDirect) {
        renderLegend(data.data, colorScale, state);
    }
    
    console.log('Bar chart rendered');
}

/**
 * Renderiza legenda
 */
function renderLegend(data, colorScale, state) {
    const legendPosition = state?.legendPosition || 'bottom';
    const legendContainer = svg.append('g').attr('class', 'legend');
    
    const legendItems = legendContainer.selectAll('.legend-item')
        .data(data)
        .enter().append('g')
        .attr('class', 'legend-item');
    
    // Retângulos de cor
    legendItems.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', d => colorScale(d.categoria));
    
    // Textos
    legendItems.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .style('fill', state?.textColor || '#FAF9FA')
        .style('font-size', `${state?.labelSize || 12}px`)
        .style('font-family', state?.fontFamily || 'Inter')
        .text(d => d.categoria);
    
    // Posicionamento da legenda
    const legendWidth = 150; // Aproximado
    const legendHeight = data.length * 25;
    
    if (legendPosition === 'bottom') {
        legendContainer.attr('transform', 
            `translate(${(svg.attr('width') - legendWidth) / 2}, ${svg.attr('height') - legendHeight - 10})`);
    } else if (legendPosition === 'right') {
        legendContainer.attr('transform', 
            `translate(${svg.attr('width') - legendWidth - 10}, 50)`);
    }
    // Adicionar outras posições conforme necessário
    
    // Posiciona itens da legenda
    legendItems.attr('transform', (d, i) => `translate(0, ${i * 25})`);
}

// ==========================================================================
// FUNÇÕES AUXILIARES
// ==========================================================================

/**
 * Obtém cores atuais baseado no estado
 */
function getCurrentColors(state) {
    const palette = state?.colorPalette || 'odd';
    
    if (palette === 'custom' && state?.customColors) {
        return state.customColors;
    }
    
    return CHART_CONFIG.colors[palette] || CHART_CONFIG.colors.odd;
}

/**
 * Mostra tooltip
 */
function showTooltip(event, data) {
    // Remove tooltip existente
    d3.select('.tooltip').remove();
    
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', '#FAF9FA')
        .style('padding', '8px 12px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('font-family', 'Inter')
        .style('pointer-events', 'none')
        .style('z-index', '1000')
        .style('opacity', 0);
    
    tooltip.html(`<strong>${data.categoria}</strong><br/>Valor: ${data.valor}`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .transition()
        .duration(200)
        .style('opacity', 1);
}

/**
 * Esconde tooltip
 */
function hideTooltip() {
    d3.select('.tooltip')
        .transition()
        .duration(200)
        .style('opacity', 0)
        .remove();
}

/**
 * Atualiza visualização com novo estado
 */
function updateVisualization(newState) {
    currentState = { ...currentState, ...newState };
    
    if (currentData) {
        renderBarChart(currentData, currentState);
    }
    
    // Atualiza cor de fundo do SVG
    if (newState.backgroundColor) {
        svg.style('background-color', newState.backgroundColor);
    }
}

// ==========================================================================
// FUNÇÕES PÚBLICAS (INTERFACE)
// ==========================================================================

/**
 * Inicializa a visualização
 */
function initVisualization() {
    console.log('Initializing test bar chart visualization');
    
    // Inicializa SVG
    initializeSVG();
    
    // Define estado inicial
    currentState = {
        width: CHART_CONFIG.defaultWidth,
        height: CHART_CONFIG.defaultHeight,
        colorPalette: 'odd',
        showLegend: true,
        legendPosition: 'bottom',
        showValueLabels: false
    };
    
    console.log('Test visualization initialized');
}

/**
 * Callback quando dados são carregados
 */
function onDataLoaded(processedData) {
    console.log('Test visualization - Data loaded:', processedData);
    
    currentData = processedData;
    
    // Renderiza com dados
    if (svg) {
        renderBarChart(processedData, currentState);
    } else {
        // Se SVG não existe ainda, inicializa primeiro
        initVisualization();
        renderBarChart(processedData, currentState);
    }
    
    // Popula opções de cores
    if (window.OddVizTemplateControls) {
        window.OddVizTemplateControls.populateColorByOptions();
    }
}

/**
 * Callback de atualização dos controles
 */
function onVisualizationUpdate(state) {
    console.log('Test visualization - State updated:', state);
    updateVisualization(state);
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

// Disponibiliza funções globalmente
window.TestVisualization = {
    init: initVisualization,
    onDataLoaded,
    onUpdate: onVisualizationUpdate,
    updateVisualization,
    getCurrentColors
};

console.log('Test visualization code loaded');
