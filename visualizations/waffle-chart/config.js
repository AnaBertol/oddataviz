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

/**
 * WAFFLE EMBED CORRIGIDO - VERSÃO COMPLETA
 * Corrige: títulos duplicados, layout, tooltips e interações
 */

const WAFFLE_EMBED_FIXED = `
// Classe corrigida do Waffle Chart para embed
class WaffleChartEmbed extends UniversalVisualizationEmbed {
    
    renderVisualization() {
        console.log('🧇 Renderizando waffle chart completo...');
        
        // CORREÇÃO 1: Remove títulos do SVG (já estão no HTML)
        // Sobrescreve os métodos de título para não renderizar
        this.renderTitles = function() { 
            console.log('📝 Títulos já estão no HTML, pulando renderização no SVG');
        };
        this.renderSource = function() { 
            console.log('📄 Fonte já está no HTML, pulando renderização no SVG');
        };
        
        // Processa dados
        const total = this.data.reduce((sum, d) => sum + (d.valor || 0), 0);
        if (total === 0) {
            this.renderError('Total dos dados é zero');
            return;
        }
        
        const processedData = this.data.map(d => {
            const proportion = d.valor / total;
            const squares = Math.round(proportion * 100);
            return {
                categoria: d.categoria,
                valor: d.valor,
                squares: squares,
                percentage: Math.round(proportion * 100)
            };
        });
        
        // Ajusta para garantir 100 quadrados
        const totalSquares = processedData.reduce((sum, d) => sum + d.squares, 0);
        const diff = 100 - totalSquares;
        if (diff !== 0 && processedData.length > 0) {
            processedData[0].squares += diff;
            processedData[0].percentage = processedData[0].squares;
        }
        
        // Gera array de quadrados
        const squares = [];
        let currentIndex = 0;
        
        processedData.forEach((category, categoryIndex) => {
            for (let i = 0; i < category.squares; i++) {
                squares.push({
                    index: currentIndex,
                    row: Math.floor(currentIndex / 10),
                    col: currentIndex % 10,
                    category: category.categoria,
                    value: category.valor,
                    percentage: category.percentage,
                    categoryIndex: categoryIndex,
                    originalData: category
                });
                currentIndex++;
            }
        });
        
        console.log('Dados processados:', processedData.length, 'categorias,', squares.length, 'quadrados');
        
        // CORREÇÃO 2: Layout baseado no original
        this.renderWaffleWithCorrectLayout(processedData, squares);
    }
    
    renderWaffleWithCorrectLayout(processedData, squares) {
        // Configurações do waffle (baseadas no original)
        const waffleConfig = {
            size: this.config.waffleSize || 25,
            gap: this.config.waffleGap || 2,
            roundness: this.config.waffleRoundness || 3
        };
        
        // LAYOUT ORIGINAL: Configurações fixas baseadas no código original
        const WAFFLE_SETTINGS = {
            margins: { top: 50, right: 50, bottom: 70, left: 50 },
            spacing: {
                directLabelOffset: 25
            }
        };
        
        const margins = WAFFLE_SETTINGS.margins;
        const spacing = WAFFLE_SETTINGS.spacing;
        
        // Área disponível (baseado no original)
        let availableWidth = this.config.width - margins.left - margins.right;
        let availableHeight = this.config.height - margins.top - margins.bottom;
        
        // Tamanho do waffle
        const waffleSize = (waffleConfig.size * 10) + (waffleConfig.gap * 9);
        
        // Largura das legendas (baseado no original)
        let labelWidth = 0;
        if (this.config.showLegend !== false) {
            labelWidth = 100;
            availableWidth -= labelWidth + spacing.directLabelOffset;
        }
        
        // Centraliza o conteúdo total
        const totalContentWidth = this.config.showLegend !== false ? 
            waffleSize + spacing.directLabelOffset + labelWidth :
            waffleSize;
        const contentStartX = margins.left + (availableWidth + labelWidth + spacing.directLabelOffset - totalContentWidth) / 2;
        
        // Posição do waffle
        let waffleX;
        if (this.config.showLegend !== false) {
            if ((this.config.directLabelPosition || 'right') === 'right') {
                waffleX = contentStartX;
            } else {
                waffleX = contentStartX + labelWidth + spacing.directLabelOffset;
            }
        } else {
            waffleX = contentStartX;
        }
        
        const waffleY = margins.top + (availableHeight - waffleSize) / 2;
        
        console.log('Layout calculado:', {
            waffleX, waffleY, waffleSize,
            contentStartX, totalContentWidth,
            availableWidth, labelWidth
        });
        
        // Escala de cores
        const colors = this.config.colors || ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'];
        const colorScale = d3.scaleOrdinal()
            .domain(processedData.map(d => d.categoria))
            .range(colors);
        
        // Renderiza waffle
        const waffleGroup = this.svg.append('g')
            .attr('class', 'waffle-group')
            .attr('transform', 'translate(' + waffleX + ',' + waffleY + ')');
        
        const waffleSquares = waffleGroup.selectAll('.waffle-square')
            .data(squares)
            .enter()
            .append('rect')
            .attr('class', 'waffle-square')
            .attr('x', d => d.col * (waffleConfig.size + waffleConfig.gap))
            .attr('y', d => d.row * (waffleConfig.size + waffleConfig.gap))
            .attr('width', waffleConfig.size)
            .attr('height', waffleConfig.size)
            .attr('rx', waffleConfig.roundness)
            .attr('ry', waffleConfig.roundness)
            .attr('fill', d => colorScale(d.category))
            .style('cursor', 'pointer')
            .style('opacity', 1);
        
        // CORREÇÃO 3: Interações completas (hover + tooltip)
        const self = this;
        waffleSquares
            .on('mouseover', function(event, d) {
                // Efeito hover: destaca categoria
                waffleSquares
                    .transition()
                    .duration(200)
                    .style('opacity', function(square) {
                        return square.category === d.category ? 0.9 : 0.3;
                    });
                
                // Destaca o quadrado atual
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('opacity', 0.7)
                    .attr('stroke', self.config.textColor || '#2C3E50')
                    .attr('stroke-width', 2);
                
                // TOOLTIP melhorado
                self.showEnhancedTooltip(event, d);
            })
            .on('mouseout', function(event, d) {
                // Remove efeitos
                waffleSquares
                    .transition()
                    .duration(200)
                    .style('opacity', 1);
                
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('stroke', 'none');
                
                self.hideTooltip();
            })
            .on('click', function(event, d) {
                // Efeito click (opcional)
                console.log('Clicou em:', d.category, '-', d.percentage + '%');
            });
        
        // Renderiza legenda com layout correto
        if (this.config.showLegend !== false) {
            this.renderCorrectLegend(processedData, colorScale, waffleX, waffleY, waffleSize, spacing);
        }
        
        console.log('✅ Waffle completo renderizado');
    }
    
    renderCorrectLegend(processedData, colorScale, waffleX, waffleY, waffleSize, spacing) {
        const legendPosition = this.config.directLabelPosition || 'right';
        
        // Posição da legenda (baseada no layout original)
        let legendX;
        let textAnchor;
        
        if (legendPosition === 'right') {
            legendX = waffleX + waffleSize + spacing.directLabelOffset;
            textAnchor = 'start';
        } else {
            legendX = waffleX - spacing.directLabelOffset;
            textAnchor = 'end';
        }
        
        const legend = this.svg.append('g')
            .attr('class', 'direct-labels-group');
        
        // Distribuição vertical baseada no original
        const stepY = waffleSize / processedData.length;
        
        processedData.forEach((d, i) => {
            const labelY = waffleY + (i + 0.5) * stepY;
            
            const labelGroup = legend.append('g')
                .attr('class', 'direct-label-item')
                .attr('transform', 'translate(' + legendX + ',' + labelY + ')');
            
            // Nome da categoria
            labelGroup.append('text')
                .attr('text-anchor', textAnchor)
                .attr('dy', '0.32em')
                .style('fill', colorScale(d.categoria))
                .style('font-family', this.config.fontFamily || 'Inter')
                .style('font-size', (this.config.labelSize || 12) + 'px')
                .style('font-weight', '600')
                .text(d.categoria);
            
            // Porcentagem
            labelGroup.append('text')
                .attr('text-anchor', textAnchor)
                .attr('dy', '1.5em')
                .style('fill', this.config.textColor || '#2C3E50')
                .style('font-family', this.config.fontFamily || 'Inter')
                .style('font-size', ((this.config.labelSize || 12) - 1) + 'px')
                .style('opacity', 0.7)
                .text(d.percentage + '%');
        });
        
        console.log('✅ Legenda renderizada com layout correto');
    }
    
    // CORREÇÃO 3: Tooltip melhorado
    showEnhancedTooltip(event, d) {
        this.hideTooltip(); // Remove tooltip anterior
        
        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'viz-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0,0,0,0.9)')
            .style('color', 'white')
            .style('padding', '12px 16px')
            .style('border-radius', '8px')
            .style('font-size', '13px')
            .style('font-family', this.config.fontFamily || 'Inter')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('left', (event.pageX + 12) + 'px')
            .style('top', (event.pageY - 12) + 'px')
            .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)')
            .style('z-index', '10000')
            .html(
                '<div style="font-weight: bold; margin-bottom: 6px; color: #6CDADE;">' + d.category + '</div>' +
                '<div style="margin-bottom: 3px;">Valor: <strong>' + d.value + '</strong></div>' +
                '<div>Porcentagem: <strong>' + d.percentage + '%</strong></div>'
            );
        
        // Animação de entrada
        tooltip.transition()
            .duration(200)
            .style('opacity', 1);
    }
    
    renderError(message) {
        console.error('❌ Erro no waffle:', message);
        
        this.svg.append('text')
            .attr('x', this.config.width / 2)
            .attr('y', this.config.height / 2)
            .attr('text-anchor', 'middle')
            .style('fill', '#ff6b6b')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .style('font-family', this.config.fontFamily || 'Inter')
            .text('⚠️ ' + message);
    }
}

// Substitui a classe base
UniversalVisualizationEmbed = WaffleChartEmbed;
console.log('✅ WaffleChartEmbed CORRIGIDO carregado');`;

// ==========================================================================
// REGISTRO COMPLETO CORRIGIDO
// ==========================================================================

console.log('=== SUBSTITUA O REGISTRO COMPLETO NO waffle-chart/config.js ===');
console.log('');

const COMPLETE_FIXED_REGISTRATION = `
// REGISTRO CORRIGIDO - Substitua o bloco inteiro no final do config.js
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
            waffleAnimation: { selector: '#waffle-animation', defaultValue: false, type: 'boolean' },
            waffleHoverEffect: { selector: '#waffle-hover-effect', defaultValue: true, type: 'boolean' },
            showLegend: { selector: '#show-legend', defaultValue: true, type: 'boolean' },
            directLabelPosition: { selector: 'input[name="direct-label-position"]:checked', defaultValue: 'right', type: 'string' }
        },
        
        embedJS: \`${WAFFLE_EMBED_FIXED}\`
    });
    
    console.log('✅ Waffle Chart CORRIGIDO registrado no sistema de exportação');
}`;

console.log(COMPLETE_FIXED_REGISTRATION);
