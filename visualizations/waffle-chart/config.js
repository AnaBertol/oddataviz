/**
 * CONFIGURAÇÕES DO GRÁFICO DE WAFFLE - SINCRONIZADO
 * Versão corrigida com configurações consistentes
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

const VIZ_CONFIG = {
    type: 'waffle-chart',
    name: 'Gráfico de Waffle',
    description: 'Visualização em grade 10x10 para mostrar proporções e distribuições',
    
    dataRequirements: {
        requiredColumns: ['categoria', 'valor'],
        columnTypes: {
            categoria: 'string',
            valor: 'number'
        },
        minRows: 2,
        maxRows: 10
    },
    
    specificControls: {
        waffleSize: { min: 12, max: 35, default: 25, step: 1 },
        waffleGap: { min: 0.5, max: 6, default: 2, step: 0.5 },
        waffleRoundness: { min: 0, max: 25, default: 3, step: 0.5 },
        waffleAnimation: { default: false },
        waffleHoverEffect: { default: true }
    },
    
    // ✅ SEMPRE formato quadrado - dimensões fixas
    layout: {
        fixedFormat: 'square',
        fixedWidth: 600,
        fixedHeight: 600,
        margins: { top: 50, right: 50, bottom: 70, left: 50 }
    },
    
    colorSettings: {
        defaultPalette: 'odd',
        supportedPalettes: ['odd', 'custom']
    }
};

// ==========================================================================
// DADOS DE EXEMPLO PADRONIZADOS
// ==========================================================================

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

// ==========================================================================
// FUNÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

function getDataRequirements() {
    return VIZ_CONFIG.dataRequirements;
}

function onDataLoaded(processedData) {
    if (processedData.data && processedData.data.length > 10) {
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(
                'Muitas categorias! Recomendamos até 10 para melhor visualização.', 
                'warn'
            );
        }
    }
    
    if (window.WaffleVisualization?.onDataLoaded) {
        window.WaffleVisualization.onDataLoaded(processedData);
    }
}

function onControlsUpdate(state) {
    if (window.WaffleVisualization?.onUpdate) {
        window.WaffleVisualization.onUpdate(state);
    }
}

// ==========================================================================
// CONTROLES ESPECÍFICOS DO WAFFLE
// ==========================================================================

function onWaffleControlsUpdate() {
    const waffleControls = {
        size: parseInt(document.getElementById('waffle-size')?.value || VIZ_CONFIG.specificControls.waffleSize.default),
        gap: parseFloat(document.getElementById('waffle-gap')?.value || VIZ_CONFIG.specificControls.waffleGap.default),
        roundness: parseFloat(document.getElementById('waffle-roundness')?.value || VIZ_CONFIG.specificControls.waffleRoundness.default),
        animation: document.getElementById('waffle-animation')?.checked || VIZ_CONFIG.specificControls.waffleAnimation.default,
        hover_effect: document.getElementById('waffle-hover-effect')?.checked !== false
    };
    
    if (window.WaffleVisualization?.onWaffleControlUpdate) {
        window.WaffleVisualization.onWaffleControlUpdate(waffleControls);
    }
}

function onDirectLabelPositionChange(position) {
    if (window.WaffleVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        currentConfig.directLabelPosition = position;
        window.WaffleVisualization.onUpdate(currentConfig);
    }
}

function onShowLegendChange(show) {
    if (window.WaffleVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        currentConfig.showLegend = show;
        window.WaffleVisualization.onUpdate(currentConfig);
    }
}

// ==========================================================================
// CONFIGURAÇÃO DE CONTROLES - CORRIGIDA
// ==========================================================================

function setupWaffleControls() {
    console.log('🎛️ Configurando controles do waffle...');
    
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
    
    // ✅ NOVO: Event listeners para paletas de cores
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const paletteType = e.currentTarget.dataset.palette;
            if (paletteType) {
                onColorPaletteChange(paletteType);
            }
        });
    });
    
    // Controle de posição da legenda direta
    const directLabelPositions = document.querySelectorAll('input[name="direct-label-position"]');
    directLabelPositions.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                onDirectLabelPositionChange(e.target.value);
            }
        });
    });
    
    // Controle para mostrar/ocultar rótulos
    const showLegendCheck = document.getElementById('show-legend');
    if (showLegendCheck) {
        showLegendCheck.addEventListener('change', (e) => {
            const legendOptions = document.getElementById('legend-options');
            
            // Mostra/oculta controles de posição
            if (legendOptions) {
                legendOptions.style.display = e.target.checked ? 'block' : 'none';
            }
            
            // Dispara atualização da visualização
            onShowLegendChange(e.target.checked);
        });
        
        // Dispara evento inicial para configurar estado
        showLegendCheck.dispatchEvent(new Event('change'));
    }
    
    console.log('✅ Controles do waffle configurados');
}

// ==========================================================================
// SISTEMA DE PALETA DE CORES - CORRIGIDO
// ==========================================================================

function onColorPaletteChange(paletteType) {
    console.log('🎨 Mudando paleta para:', paletteType);
    
    // Atualiza classes ativas
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
    });
    
    const selectedOption = document.querySelector(`.color-option[data-palette="${paletteType}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    // Controla visibilidade do painel custom
    const customColorsPanel = document.getElementById('custom-colors');
    if (customColorsPanel) {
        if (paletteType === 'custom') {
            customColorsPanel.style.display = 'block';
            setupCustomColorInputs();
        } else {
            customColorsPanel.style.display = 'none';
        }
    }
    
    // ✅ CORRIGIDO: Chama função correta
    if (window.WaffleVisualization?.updateColorPalette) {
        window.WaffleVisualization.updateColorPalette(paletteType);
    }
}

function setupCustomColorInputs() {
    const container = document.querySelector('.custom-color-inputs');
    if (!container) return;
    
    // Limpa inputs existentes
    container.innerHTML = '';
    
    // Cria 6 inputs de cor (número padrão da paleta Odd)
    const defaultColors = ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'];
    
    defaultColors.forEach((color, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-color-item';
        
        wrapper.innerHTML = `
            <label class="control-label">Cor ${index + 1}</label>
            <div class="color-input-wrapper">
                <input type="color" id="custom-color-${index}" class="color-input custom-color-picker" value="${color}">
                <input type="text" id="custom-color-${index}-text" class="color-text custom-color-text" value="${color}">
            </div>
        `;
        
        container.appendChild(wrapper);
        
        // Event listeners para sincronizar cor e texto
        const colorInput = wrapper.querySelector('.custom-color-picker');
        const textInput = wrapper.querySelector('.custom-color-text');
        
        colorInput.addEventListener('input', (e) => {
            textInput.value = e.target.value;
            updateCustomColors();
        });
        
        textInput.addEventListener('input', (e) => {
            if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                colorInput.value = e.target.value;
                updateCustomColors();
            }
        });
    });
    
    // Aplica cores iniciais
    updateCustomColors();
}

function updateCustomColors() {
    const colors = [];
    document.querySelectorAll('.custom-color-picker').forEach(input => {
        colors.push(input.value);
    });
    
    console.log('🎨 Cores customizadas atualizadas:', colors);
    
    if (window.WaffleVisualization?.updateCustomColors) {
        window.WaffleVisualization.updateCustomColors(colors);
    }
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

window.WaffleVizConfig = {
    config: VIZ_CONFIG,
    getSampleData,
    getDataRequirements,
    onDataLoaded,
    onControlsUpdate,
    onWaffleControlsUpdate,
    onDirectLabelPositionChange,
    onShowLegendChange,
    onColorPaletteChange,
    setupWaffleControls
};

// Expõe funções principais globalmente
window.getSampleData = getSampleData;
window.getDataRequirements = getDataRequirements;
window.onDataLoaded = onDataLoaded;

// ==========================================================================
// CONFIGURAÇÃO INICIAL - APRIMORADA
// ==========================================================================

function initializeWaffleConfig() {
    console.log('⚙️ Inicializando configuração do waffle...');
    
    // Aguarda um pouco para garantir que DOM está pronto
    setTimeout(() => {
        setupWaffleControls();
        console.log('✅ Configuração do waffle concluída');
    }, 100);
}

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWaffleConfig);
} else {
    initializeWaffleConfig();
}

// Registro no sistema escalável
if (window.OddVizExport && window.OddVizExport.registerVisualization) {
    window.OddVizExport.registerVisualization({
        type: 'waffle-chart',
        displayName: 'Gráfico de Waffle',
        globalObject: 'WaffleVisualization',
        // ... (copie o exemplo completo do artifact)
    });
}

// Sistema de registro para exportação
if (window.OddVizExport && window.OddVizExport.registerVisualization) {
    window.OddVizExport.registerVisualization({
        type: 'waffle-chart',
        displayName: 'Gráfico de Waffle',
        globalObject: 'WaffleVisualization',
        
        defaultWidth: 600,
        defaultHeight: 600,
        defaultTitle: 'Distribuição por Categoria',
        
        dataFormat: {
            columns: ['categoria', 'valor'],
            types: { categoria: 'string', valor: 'number' }
        },
        
        defaultData: [
            { categoria: 'Categoria A', valor: 35 },
            { categoria: 'Categoria B', valor: 25 },
            { categoria: 'Categoria C', valor: 20 },  
            { categoria: 'Categoria D', valor: 15 },
            { categoria: 'Categoria E', valor: 5 }
        ],
        
        defaultColors: ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'],
        colorStrategy: 'palette',
        uniqueSelectors: ['#waffle-size', '#waffle-gap', '#waffle-roundness'],
        
        specificMappings: {
            waffleSize: { selector: '#waffle-size', defaultValue: 25, type: 'number' },
            waffleGap: { selector: '#waffle-gap', defaultValue: 2, type: 'number' },
            waffleRoundness: { selector: '#waffle-roundness', defaultValue: 3, type: 'number' },
            showLegend: { selector: '#show-legend', defaultValue: true, type: 'boolean' },
            directLabelPosition: { selector: 'input[name="direct-label-position"]:checked', defaultValue: 'right', type: 'string' }
        },
        
        embedJS: `
        // Implementação simplificada do waffle para embed
        class WaffleChartEmbed extends UniversalVisualizationEmbed {
            renderVisualization() {
                console.log('🧇 Renderizando waffle chart...');
                
                // Calcula dados processados
                const total = this.data.reduce((sum, d) => sum + (d.valor || 0), 0);
                const processedData = this.data.map(d => ({
                    categoria: d.categoria,
                    valor: d.valor,
                    squares: Math.round((d.valor / total) * 100),
                    percentage: Math.round((d.valor / total) * 100)
                }));
                
                // Gera quadrados
                const squares = [];
                let currentIndex = 0;
                processedData.forEach(category => {
                    for (let i = 0; i < category.squares; i++) {
                        squares.push({
                            row: Math.floor(currentIndex / 10),
                            col: currentIndex % 10,
                            category: category.categoria,
                            percentage: category.percentage
                        });
                        currentIndex++;
                    }
                });
                
                // Configurações
                const squareSize = this.config.waffleSize || 25;
                const gap = this.config.waffleGap || 2;
                const waffleSize = (squareSize * 10) + (gap * 9);
                const startX = (this.config.width - waffleSize) / 2;
                const startY = 100;
                
                // Cores
                const colors = this.config.colors || ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8'];
                const colorScale = d3.scaleOrdinal()
                    .domain(processedData.map(d => d.categoria))
                    .range(colors);
                
                // Renderiza waffle
                const waffleGroup = this.svg.append('g')
                    .attr('transform', 'translate(' + startX + ',' + startY + ')');
                
                waffleGroup.selectAll('.waffle-square')
                    .data(squares)
                    .enter()
                    .append('rect')
                    .attr('class', 'waffle-square')
                    .attr('x', d => d.col * (squareSize + gap))
                    .attr('y', d => d.row * (squareSize + gap))
                    .attr('width', squareSize)
                    .attr('height', squareSize)
                    .attr('rx', this.config.waffleRoundness || 3)
                    .attr('fill', d => colorScale(d.category))
                    .style('cursor', 'pointer');
                
                // Renderiza legenda
                if (this.config.showLegend !== false) {
                    const legendX = startX + waffleSize + 30;
                    const legend = this.svg.append('g').attr('class', 'legend');
                    
                    processedData.forEach((d, i) => {
                        const legendY = startY + (i * 40);
                        
                        legend.append('text')
                            .attr('x', legendX)
                            .attr('y', legendY)
                            .style('fill', colorScale(d.categoria))
                            .style('font-size', '12px')
                            .style('font-weight', '600')
                            .text(d.categoria);
                        
                        legend.append('text')
                            .attr('x', legendX)
                            .attr('y', legendY + 15)
                            .style('fill', this.config.textColor)
                            .style('font-size', '11px')
                            .text(d.percentage + '%');
                    });
                }
                
                console.log('✅ Waffle renderizado com', squares.length, 'quadrados');
            }
        }
        
        UniversalVisualizationEmbed = WaffleChartEmbed;`
    });
}
