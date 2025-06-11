/**
 * CONFIGURAÇÕES DA VISUALIZAÇÃO DE TESTE
 * Define configurações específicas para a página de teste
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

const VIZ_CONFIG = {
    // Identificação
    type: 'test',
    name: 'Teste do Template',
    description: 'Visualização de teste para validar todos os controles do template',
    
    // Requisitos de dados
    dataRequirements: {
        requiredColumns: ['categoria', 'valor'],
        columnTypes: {
            categoria: 'string',
            valor: 'number'
        },
        minRows: 2,
        maxRows: 20
    },
    
    // Configurações específicas da visualização
    specificControls: {
        // Para o teste, não temos controles específicos
        // mas outras visualizações terão aqui seus controles únicos
    },
    
    // Configurações de layout
    layout: {
        margins: { top: 20, right: 20, bottom: 60, left: 60 },
        defaultWidth: 800,
        defaultHeight: 400
    },
    
    // Configurações de cores específicas
    colorSettings: {
        // Quais propriedades dos dados podem ser usadas para colorir
        colorByOptions: [
            { value: 'default', label: 'Padrão' },
            { value: 'categoria', label: 'Categoria' },
            { value: 'valor', label: 'Valor' }
        ]
    }
};

// ==========================================================================
// FUNÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

/**
 * Implementa getDataRequirements para data-utils.js
 */
function getDataRequirements() {
    return VIZ_CONFIG.dataRequirements;
}

/**
 * Gera dados de exemplo para esta visualização
 */
function getSampleData() {
    return {
        data: [
            { categoria: 'Categoria A', valor: 25 },
            { categoria: 'Categoria B', valor: 40 },
            { categoria: 'Categoria C', valor: 15 },
            { categoria: 'Categoria D', valor: 35 },
            { categoria: 'Categoria E', valor: 20 }
        ],
        columns: ['categoria', 'valor'],
        columnTypes: { categoria: 'string', valor: 'number' },
        rowCount: 5,
        source: 'example'
    };
}

/**
 * Popula controles específicos (se houver)
 */
function populateSpecificControls() {
    const container = document.getElementById('specific-controls');
    if (!container) return;
    
    // Para o teste, vamos adicionar um controle de exemplo
    container.innerHTML = `
        <h3 class="panel-title">🔧 Controles de Teste</h3>
        
        <div class="control-group">
            <label class="checkbox-wrapper">
                <input type="checkbox" id="test-animation">
                <span class="checkmark"></span>
                <span class="checkbox-label">Animação de Teste</span>
            </label>
        </div>
        
        <div class="control-group">
            <label for="test-speed" class="control-label">
                Velocidade: <span id="test-speed-value">1</span>x
            </label>
            <input type="range" id="test-speed" class="control-range" 
                   min="0.5" max="3" value="1" step="0.5">
        </div>
    `;
    
    // Event listeners para controles específicos
    const animationCheck = document.getElementById('test-animation');
    const speedSlider = document.getElementById('test-speed');
    const speedValue = document.getElementById('test-speed-value');
    
    if (animationCheck) {
        animationCheck.addEventListener('change', (e) => {
            console.log('Animation test:', e.target.checked);
            // Aqui seria implementada a lógica específica
        });
    }
    
    if (speedSlider && speedValue) {
        speedSlider.addEventListener('input', (e) => {
            speedValue.textContent = e.target.value;
            console.log('Speed test:', e.target.value);
            // Aqui seria implementada a lógica específica
        });
    }
}

/**
 * Callback quando dados são carregados
 */
function onDataLoaded(processedData) {
    console.log('Test visualization - Data loaded:', processedData);
    
    // Popula opções de "Aplicar Cores Por"
    if (window.OddVizTemplateControls) {
        window.OddVizTemplateControls.populateColorByOptions();
    }
    
    // Atualiza a visualização (no caso, nosso gráfico de teste)
    updateTestVisualization(processedData);
}

/**
 * Atualiza a visualização de teste com dados reais
 */
function updateTestVisualization(data) {
    const svg = d3.select('#test-viz svg');
    
    if (!data || !data.data) {
        console.log('No data to update visualization');
        return;
    }
    
    // Limpa visualização anterior
    svg.selectAll('*').remove();
    
    // Configurações
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Escalas
    const xScale = d3.scaleBand()
        .domain(data.data.map(d => d.categoria))
        .range([0, innerWidth])
        .padding(0.1);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data.data, d => d.valor)])
        .range([innerHeight, 0]);
    
    // Container principal
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Barras
    const colors = window.OddVizTemplateControls ? 
        window.OddVizTemplateControls.getCurrentColorPalette() : 
        ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'];
    
    g.selectAll('.bar')
        .data(data.data)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.categoria))
        .attr('y', d => yScale(d.valor))
        .attr('width', xScale.bandwidth())
        .attr('height', d => innerHeight - yScale(d.valor))
        .attr('fill', (d, i) => colors[i % colors.length]);
    
    // Eixo X
    g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('fill', '#FAF9FA')
        .style('font-size', '12px');
    
    // Eixo Y
    g.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale))
        .selectAll('text')
        .style('fill', '#FAF9FA')
        .style('font-size', '12px');
    
    // Estilo dos eixos
    svg.selectAll('.domain, .tick line')
        .style('stroke', '#FAF9FA');
    
    console.log('Test visualization updated with real data');
}

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================

/**
 * Inicializa a visualização de teste
 */
function initVisualization() {
    console.log('Initializing test visualization');
    
    // Popula controles específicos
    populateSpecificControls();
    
    // Se houver dados de exemplo, carrega automaticamente
    // (opcional - pode ser removido se quiser forçar upload)
    // setTimeout(() => {
    //     const sampleData = getSampleData();
    //     if (window.OddVizData) {
    //         window.OddVizData.setCurrentData(sampleData);
    //         onDataLoaded(sampleData);
    //     }
    // }, 1000);
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

// Torna funções disponíveis globalmente
window.TestVizConfig = {
    config: VIZ_CONFIG,
    getSampleData,
    getDataRequirements,
    onDataLoaded,
    initVisualization,
    updateTestVisualization
};

console.log('Test visualization config loaded');
