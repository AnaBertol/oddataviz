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
        margins: { top: 40, right: 40, bottom: 80, left: 80 },
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
            { categoria: 'Categoria A', valor: 35 },
            { categoria: 'Categoria B', valor: 28 },
            { categoria: 'Categoria C', valor: 22 },
            { categoria: 'Categoria D', valor: 10 },
            { categoria: 'Categoria E', valor: 5 }
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
    
    // Atualiza a visualização
    if (window.TestVisualization && window.TestVisualization.onDataLoaded) {
        window.TestVisualization.onDataLoaded(processedData);
    }
}

/**
 * Callback quando controles são atualizados
 */
function onControlsUpdate(state) {
    console.log('Controls updated:', state);
    
    if (window.TestVisualization && window.TestVisualization.onUpdate) {
        window.TestVisualization.onUpdate(state);
    }
}

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================

/**
 * Inicializa a página de teste
 */
function initTestPage() {
    console.log('Initializing test page configuration...');
    
    // Popula controles específicos
    populateSpecificControls();
    
    // Carrega dados de exemplo automaticamente após um pequeno delay
    setTimeout(() => {
        console.log('Auto-loading sample data...');
        const sampleData = getSampleData();
        
        // Atualiza textarea com dados de exemplo
        const textarea = document.getElementById('data-text-input');
        if (textarea && window.OddVizData) {
            const csvData = window.OddVizData.convertDataToCSV(sampleData.data);
            textarea.value = csvData;
            
            // Dispara o processamento dos dados
            window.OddVizData.handleTextareaInput();
        }
    }, 1000);
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
    onControlsUpdate,
    initTestPage
};

// Expõe funções principais globalmente para outros módulos
window.getSampleData = getSampleData;
window.getDataRequirements = getDataRequirements;
window.onDataLoaded = onDataLoaded;

// Auto-inicialização quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTestPage);
} else {
    setTimeout(initTestPage, 100);
}

console.log('Test visualization config loaded successfully');
