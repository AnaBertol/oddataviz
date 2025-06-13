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
        metadata: {
            title: 'Distribuição de Vendas por Categoria',
            source: 'Dados de Exemplo, 2024',
            description: 'Visualização das vendas distribuídas por categoria'
        }
    };
}

/**
 * Callback quando dados são carregados
 */
function onDataLoaded(processedData) {
    console.log('Waffle visualization - Data loaded:', processedData);
    
    // Validação específica para waffle
    if (processedData && processedData.data) {
        const totalPercentage = processedData.data.reduce((sum, d) => sum + d.valor, 0);
        
        // Aviso se não somar aproximadamente 100
        if (Math.abs(totalPercentage - 100) > 1) {
            console.warn(`Total dos valores: ${totalPercentage}%. Recomenda-se que some 100% para melhor visualização.`);
        }
        
        // Aviso se muitas categorias
        if (processedData.data.length > VIZ_CONFIG.dataRequirements.maxRows) {
            window.OddVizTemplateControls?.showNotification(
                `Muitas categorias (${processedData.data.length}). Recomendamos até 10 para melhor visualização.`, 
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
            window.OddVizTemplateControls.getCurrentConfig() : {};
        currentConfig.directLabelPosition = position;
        window.WaffleVisualization.onUpdate(currentConfig);
    }
}

// ==========================================================================
// FUNÇÕES DE CONTROLE ESPECÍFICAS
// ==========================================================================

/**
 * Configura controles específicos do waffle
 */
function setupWaffleControls() {
    console.log('Setting up waffle specific controls...');
    
    // Listeners para controles do waffle
    const waffleSize = document.getElementById('waffle-size');
    const waffleSizeValue = document.getElementById('waffle-size-value');
    const waffleGap = document.getElementById('waffle-gap');
    const waffleGapValue = document.getElementById('waffle-gap-value');
    const waffleRoundness = document.getElementById('waffle-roundness');
    const waffleRoundnessValue = document.getElementById('waffle-roundness-value');
    
    if (waffleSize && waffleSizeValue) {
        waffleSize.addEventListener('input', (e) => {
            waffleSizeValue.textContent = e.target.value + 'px';
            onWaffleControlsUpdate();
        });
    }
    
    if (waffleGap && waffleGapValue) {
        waffleGap.addEventListener('input', (e) => {
            waffleGapValue.textContent = e.target.value + 'px';
            onWaffleControlsUpdate();
        });
    }
    
    if (waffleRoundness && waffleRoundnessValue) {
        waffleRoundness.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            if (value >= 25) {
                waffleRoundnessValue.textContent = 'Círculo';
            } else {
                waffleRoundnessValue.textContent = value + 'px';
            }
            onWaffleControlsUpdate();
        });
    }
    
    // Animação e hover
    const waffleAnimation = document.getElementById('waffle-animation');
    const waffleHoverEffect = document.getElementById('waffle-hover-effect');
    
    if (waffleAnimation) {
        waffleAnimation.addEventListener('change', onWaffleControlsUpdate);
    }
    
    if (waffleHoverEffect) {
        waffleHoverEffect.addEventListener('change', onWaffleControlsUpdate);
    }
    
    // Posição dos rótulos diretos
    const directLabelRadios = document.querySelectorAll('input[name="direct-label-position"]');
    directLabelRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                onDirectLabelPositionChange(e.target.value);
            }
        });
    });
    
    // Toggle entre legenda e rótulos diretos
    const legendDirectCheck = document.getElementById('show-legend');
    const directLabelControls = document.getElementById('direct-label-controls');
    const legendPositionControls = document.getElementById('legend-position-group');
    
    if (legendDirectCheck) {
        legendDirectCheck.addEventListener('change', (e) => {
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
 * ✅ NOVA FUNÇÃO: Define valores iniciais nos controles HTML
 */
function setInitialControlValues() {
    // Cores padrão
    const bgColor = document.getElementById('bg-color');
    const bgColorText = document.getElementById('bg-color-text');
    const textColor = document.getElementById('text-color');
    const textColorText = document.getElementById('text-color-text');
    
    if (bgColor) bgColor.value = '#FFFFFF';
    if (bgColorText) bgColorText.value = '#FFFFFF';
    if (textColor) textColor.value = '#2C3E50';
    if (textColorText) textColorText.value = '#2C3E50';
    
    // Formato de tela quadrado por padrão
    const squareFormat = document.querySelector('input[name="screen-format"][value="square"]');
    if (squareFormat) squareFormat.checked = true;
    
    // Rótulos sempre habilitados
    const showLegend = document.getElementById('show-legend');
    if (showLegend) showLegend.checked = true;
    
    // Posição à direita por padrão
    const rightPosition = document.querySelector('input[name="direct-label-position"][value="right"]');
    if (rightPosition) rightPosition.checked = true;
    
    console.log('Initial control values set to match defaults');
}

/**
 * Inicializa a página do waffle chart
 */
function initWafflePage() {
    console.log('Initializing waffle chart page...');
    
    // ✅ CONFIGURA VALORES PADRÃO ANTES DE TUDO
    setInitialControlValues();
    
    // Configura controles específicos
    setupWaffleControls();
    
    // Carrega dados de exemplo automaticamente - APENAS UMA VEZ
    setTimeout(() => {
        console.log('Auto-loading waffle sample data...');
        const sampleData = getSampleData();
        
        // ✅ EVITA CARREGAMENTO DUPLICADO
        if (window.WaffleViz && window.WaffleViz.getData() === null) {
            // Atualiza textarea com dados de exemplo (SEM DISPARAR PROCESSAMENTO)
            const textarea = document.getElementById('data-text-input');
            if (textarea) {
                const csvData = window.OddVizData ? 
                    window.OddVizData.convertDataToCSV(sampleData.data) :
                    'categoria,valor\nCategoria A,35\nCategoria B,25\nCategoria C,20\nCategoria D,15\nCategoria E,5';
                textarea.value = csvData;
                
                // ✅ Dispara processamento apenas se data-utils estiver carregado
                if (window.OddVizData && window.OddVizData.handleTextareaInput) {
                    window.OddVizData.handleTextareaInput();
                }
            }
        }
    }, 500); // Reduz delay
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
    setupWaffleControls,
    setInitialControlValues
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
