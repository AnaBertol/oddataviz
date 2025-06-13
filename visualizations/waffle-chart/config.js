/**
 * CONFIGURAÇÕES DO GRÁFICO DE WAFFLE
 * Define configurações específicas para o waffle chart
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

const VIZ_CONFIG = {
    // Identificação
    type: 'waffle-chart',
    name: 'Gráfico de Waffle',
    description: 'Visualização em grade 10x10 para mostrar proporções e distribuições',
    
    // Requisitos de dados
    dataRequirements: {
        requiredColumns: ['categoria', 'valor'],
        columnTypes: {
            categoria: 'string',
            valor: 'number'
        },
        minRows: 2,
        maxRows: 10 // Máximo de 10 categorias para boa visualização
    },
    
    // Configurações específicas da visualização
    specificControls: {
        waffleSize: { min: 12, max: 35, default: 25, step: 1 }, // ✅ LIMITES AJUSTADOS
        waffleGap: { min: 0.5, max: 6, default: 2, step: 0.5 }, // ✅ LIMITES AJUSTADOS
        waffleRoundness: { min: 0, max: 25, default: 3, step: 0.5 },
        waffleAnimation: { default: false },
        waffleHoverEffect: { default: true },
        directLabelPosition: { options: ['right', 'left'], default: 'right' }
    },
    
    // Configurações de layout
    layout: {
        margins: { 
            desktop: { top: 80, right: 80, bottom: 120, left: 80 },
            mobile: { top: 60, right: 40, bottom: 100, left: 40 },
            square: { top: 70, right: 70, bottom: 110, left: 70 }
        },
        defaultWidth: 800,
        defaultHeight: 600
    },
    
    // Configurações de cores específicas
    colorSettings: {
        defaultPalette: 'odd',
        supportedPalettes: ['odd', 'custom']
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
            { categoria: 'Categoria B', valor: 25 },
            { categoria: 'Categoria C', valor: 20 },
            { categoria: 'Categoria D', valor: 15 },
            { categoria: 'Categoria E', valor: 5 }
        ],
        columns: ['categoria', 'valor'],
        columnTypes: { categoria: 'string', valor: 'number' },
        rowCount: 5,
        source: 'example'
    };
}

/**
 * Popula controles específicos do waffle chart
 */
function populateSpecificControls() {
    // Controles específicos são renderizados no HTML
    // Esta função pode ser usada para lógica adicional se necessário
    console.log('Waffle specific controls populated');
}

/**
 * Callback quando dados são carregados
 */
function onDataLoaded(processedData) {
    console.log('Waffle visualization - Data loaded:', processedData);
    
    // Valida se os dados são adequados para waffle chart
    if (processedData.data && processedData.data.length > 10) {
        if (window.OddVizApp && window.OddVizApp.showNotification) {
            window.OddVizApp.showNotification(
                'Muitas categorias! Recomendamos até 10 para melhor visualização.', 
                'warn'
            );
        }
    }
    
    // Popula opções de cores (apenas odd e custom para waffle)
    if (window.OddVizTemplateControls) {
        // Pode adicionar lógica específica aqui se necessário
    }
    
    // Atualiza a visualização
    if (window.WaffleVisualization && window.WaffleVisualization.onDataLoaded) {
        window.WaffleVisualization.onDataLoaded(processedData);
    }
}

/**
 * Callback quando controles gerais são atualizados
 */
function onControlsUpdate(state) {
    console.log('Waffle controls updated:', state);
    
    // Passa o estado completo para a visualização
    if (window.WaffleVisualization && window.WaffleVisualization.onUpdate) {
        window.WaffleVisualization.onUpdate(state);
    }
}

/**
 * Callback quando controles específicos do waffle são atualizados
 */
function onWaffleControlsUpdate() {
    const waffleControls = {
        size: parseInt(document.getElementById('waffle-size')?.value || VIZ_CONFIG.specificControls.waffleSize.default),
        gap: parseFloat(document.getElementById('waffle-gap')?.value || VIZ_CONFIG.specificControls.waffleGap.default),
        roundness: parseFloat(document.getElementById('waffle-roundness')?.value || VIZ_CONFIG.specificControls.waffleRoundness.default),
        animation: document.getElementById('waffle-animation')?.checked || VIZ_CONFIG.specificControls.waffleAnimation.default,
        hover_effect: document.getElementById('waffle-hover-effect')?.checked !== false
    };
    
    console.log('Waffle specific controls updated:', waffleControls);
    
    if (window.WaffleVisualization && window.WaffleVisualization.onWaffleControlUpdate) {
        window.WaffleVisualization.onWaffleControlUpdate(waffleControls);
    }
}

/**
 * Callback quando a posição da legenda direta é alterada
 */
function onDirectLabelPositionChange(position) {
    console.log('Direct label position changed:', position);
    
    // Atualiza configuração e re-renderiza
    if (window.WaffleVisualization && window.WaffleVisualization.onUpdate) {
        const currentConfig = window.OddVizTemplateControls ? 
            window.OddVizTemplateControls.getState() : {};
        
        currentConfig.directLabelPosition = position;
        
        window.WaffleVisualization.onUpdate(currentConfig);
    }
}

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================

/**
 * Configura event listeners para controles específicos
 */
function setupWaffleControls() {
    console.log('Setting up waffle-specific controls...');
    
    // Controles de aparência do waffle
    const waffleControls = [
        'waffle-size',
        'waffle-gap', 
        'waffle-roundness',
        'waffle-animation',
        'waffle-hover-effect'
    ];
    
    waffleControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            const eventType = element.type === 'checkbox' ? 'change' : 'input';
            element.addEventListener(eventType, onWaffleControlsUpdate);
            
            // Atualiza display de valores para ranges
            if (element.type === 'range') {
                const valueDisplay = document.getElementById(controlId + '-value');
                if (valueDisplay) {
                    element.addEventListener('input', (e) => {
                        valueDisplay.textContent = e.target.value + 'px';
                    });
                }
            }
        }
    });
    
    // ✅ NOVO: Controle de posição da legenda direta
    const directLabelPositions = document.querySelectorAll('input[name="direct-label-position"]');
    directLabelPositions.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                onDirectLabelPositionChange(e.target.value);
            }
        });
    });
    
    // ✅ NOVO: Toggle entre legenda direta e tradicional
    const legendDirectCheck = document.getElementById('legend-direct');
    if (legendDirectCheck) {
        legendDirectCheck.addEventListener('change', (e) => {
            const directLabelControls = document.getElementById('direct-label-controls');
            const legendPositionControls = document.getElementById('legend-position-group');
            
            if (directLabelControls) {
                directLabelControls.style.display = e.target.checked ? 'block' : 'none';
            }
            
            if (legendPositionControls) {
                legendPositionControls.style.display = e.target.checked ? 'none' : 'block';
            }
        });
        
        // Dispara evento inicial para configurar estado
        legendDirectCheck.dispatchEvent(new Event('change'));
    }
    
    console.log('Waffle controls setup complete');
}

/**
 * Inicializa a página do waffle chart
 */
function initWafflePage() {
    console.log('Initializing waffle chart page...');
    
    // ✅ PRIMEIRA PRIORIDADE: Corrigir valores HTML antes de tudo
    setCorrectHTMLValues();
    
    // Configura controles específicos
    setupWaffleControls();
    
    // Carrega dados de exemplo automaticamente (SEM disparo de processamento)
    setTimeout(() => {
        console.log('Auto-loading waffle sample data...');
        const sampleData = getSampleData();
        
        // Atualiza textarea com dados de exemplo SEM processar
        const textarea = document.getElementById('data-text-input');
        if (textarea && window.OddVizData) {
            const csvData = window.OddVizData.convertDataToCSV ? 
                window.OddVizData.convertDataToCSV(sampleData.data) :
                'categoria,valor\nCategoria A,35\nCategoria B,25\nCategoria C,20\nCategoria D,15\nCategoria E,5';
            textarea.value = csvData;
            
            // ✅ NÃO DISPARA handleTextareaInput para evitar renderização duplicada
        }
    }, 500); // Reduz delay
}

/**
 * ✅ NOVA FUNÇÃO: Define valores iniciais nos controles HTML
 */
function setCorrectHTMLValues() {
    console.log('🔧 Setting correct HTML default values...');
    
    // Cores padrão - VALORES CORRETOS
    const bgColor = document.getElementById('bg-color');
    const bgColorText = document.getElementById('bg-color-text');
    const textColor = document.getElementById('text-color');
    const textColorText = document.getElementById('text-color-text');
    
    if (bgColor) {
        bgColor.value = '#FFFFFF';
        console.log('✅ bg-color set to #FFFFFF');
    }
    if (bgColorText) {
        bgColorText.value = '#FFFFFF';
        console.log('✅ bg-color-text set to #FFFFFF');
    }
    if (textColor) {
        textColor.value = '#2C3E50';
        console.log('✅ text-color set to #2C3E50');
    }
    if (textColorText) {
        textColorText.value = '#2C3E50';
        console.log('✅ text-color-text set to #2C3E50');
    }
    
    // Formato de tela - SQUARE por padrão para melhor layout
    const squareFormat = document.querySelector('input[name="screen-format"][value="square"]');
    if (squareFormat) {
        squareFormat.checked = true;
        console.log('✅ screen-format set to square');
    }
    
    // Rótulos sempre habilitados
    const showLegend = document.getElementById('show-legend');
    if (showLegend) {
        showLegend.checked = true;
        console.log('✅ show-legend enabled');
    }
    
    // Posição à direita por padrão
    const rightPosition = document.querySelector('input[name="direct-label-position"][value="right"]');
    if (rightPosition) {
        rightPosition.checked = true;
        console.log('✅ direct-label-position set to right');
    }
    
    console.log('🎯 All HTML control values set to match getDefaultConfig()');
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

// Torna funções disponíveis globalmente
window.WaffleVizConfig = {
    config: VIZ_CONFIG,
    getSampleData,
    getDataRequirements,
    onDataLoaded,
    onControlsUpdate,
    onWaffleControlsUpdate,
    onDirectLabelPositionChange,
    initWafflePage,
    setupWaffleControls
};

// Expõe funções principais globalmente para outros módulos
window.getSampleData = getSampleData;
window.getDataRequirements = getDataRequirements;
window.onDataLoaded = onDataLoaded;

// Auto-inicialização quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWafflePage);
} else {
    setTimeout(initWafflePage, 100);
}

console.log('Waffle chart config loaded successfully');
