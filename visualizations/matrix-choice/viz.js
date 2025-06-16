/**
 * MATRIZ DE MÚLTIPLA ESCOLHA - D3.js VERSÃO CORRIGIDA
 * Correções: contraste automático dos valores, rótulos de grupos, fonte sem duplicação
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURAÇÕES CENTRALIZADAS E FIXAS
    // ==========================================================================

    const MATRIX_SETTINGS = {
        // Sempre usa formato retangular - dimensões fixas
        fixedWidth: 800,
        fixedHeight: 600,
        
        margins: {
            top: 60, 
            right: 60, 
            bottom: 80, 
            left: 60
        },
        
        spacing: {
            titleToSubtitle: 20,
            subtitleToChart: 30,
            chartToLegend: 25,
            legendToSource: 20,
            gridGap: 15,
            labelOffset: 25
        },
        
        animationDuration: 600,
        staggerDelay: 50
    };

    // ✅ CONFIGURAÇÃO PADRÃO CORRIGIDA
    const MATRIX_DEFAULTS = {
        colors: ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'],
        backgroundShapeColor: '#F5F5F5', // ✅ CORRIGIDO: Cinza claro da Odd
        shape: 'square',
        elementSize: 80,
        elementSpacing: 20,
        alignment: 'center',
        borderRadius: 4,
        showAnimation: false,
        showValues: true,
        showCategoryLabels: true,
        showGroupLabels: true
    };

    // ==========================================================================
    // VARIÁVEIS PRIVADAS
    // ==========================================================================

    let vizSvg = null;
    let vizChartGroup = null;
    let vizCurrentData = null;
    let vizProcessedData = null;
    let vizCurrentConfig = null;
    let vizLayoutInfo = null;
    let vizDataMode = 'simple'; // 'simple' ou 'comparison'

    // ==========================================================================
    // UTILITÁRIO DE CONTRASTE - COPIADO DOS SEMI CÍRCULOS
    // ==========================================================================

    /**
     * ✅ FUNÇÃO COPIADA: Calcula cor de contraste automático
     */
    function getContrastColor(hexColor) {
        // Remove # se presente
        const hex = hexColor.replace('#', '');
        
        // Converte para RGB
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Calcula luminância usando fórmula padrão
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Retorna branco para cores escuras, preto para cores claras
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    // ==========================================================================
    // INICIALIZAÇÃO
    // ==========================================================================

    function initVisualization() {
        if (typeof d3 === 'undefined') {
            console.error('D3.js não está carregado!');
            return;
        }
        
        console.log('⬜ Inicializando Matriz de Múltipla Escolha corrigida...');
        
        createBaseSVG();
        
        // ✅ AGUARDA TEMPLATE CONTROLS ESTAR PRONTO
        setTimeout(() => {
            loadSampleData();
        }, 150);
    }

    function loadSampleData() {
        if (window.getSampleData && typeof window.getSampleData === 'function') {
            const sampleData = window.getSampleData();
            if (sampleData && sampleData.data) {
                console.log('📊 Carregando dados de exemplo...');
                
                // ✅ MESCLA configuração do Template Controls com específicas
                const templateConfig = window.OddVizTemplateControls?.getState() || {};
                const specificConfig = window.MatrixChoiceVizConfig?.currentConfig || {};
                const mergedConfig = createMergedConfig(templateConfig, specificConfig);
                
                renderVisualization(sampleData.data, mergedConfig);
            }
        }
    }

    function createBaseSVG() {
        const chartContainer = document.getElementById('chart');
        if (!chartContainer) return;
        
        // Remove placeholder e SVG anterior
        const placeholder = chartContainer.querySelector('.chart-placeholder');
        if (placeholder) placeholder.remove();
        
        d3.select(chartContainer).select('svg').remove();
        
        // Cria SVG com dimensões fixas
        vizSvg = d3.select(chartContainer)
            .append('svg')
            .attr('id', 'matrix-choice-viz')
            .attr('width', MATRIX_SETTINGS.fixedWidth)
            .attr('height', MATRIX_SETTINGS.fixedHeight);
        
        // Grupos organizados
        vizChartGroup = vizSvg.append('g').attr('class', 'chart-group');
    }

    // ==========================================================================
    // CONFIGURAÇÃO MESCLADA
    // ==========================================================================

    /**
     * ✅ NOVA FUNÇÃO: Mescla configurações do Template Controls com específicas da matriz
     */
    function createMergedConfig(templateConfig, specificConfig) {
        // Começa com os padrões mínimos
        const mergedConfig = Object.assign({}, MATRIX_DEFAULTS);
        
        // Aplica configurações do Template Controls (títulos, cores básicas, tipografia)
        if (templateConfig) {
            Object.assign(mergedConfig, {
                // Textos do Template Controls
                title: templateConfig.title,
                subtitle: templateConfig.subtitle,
                dataSource: templateConfig.dataSource,
                
                // Cores básicas do Template Controls
                backgroundColor: templateConfig.backgroundColor,
                textColor: templateConfig.textColor,
                
                // Tipografia do Template Controls
                fontFamily: templateConfig.fontFamily,
                titleSize: templateConfig.titleSize,
                subtitleSize: templateConfig.subtitleSize,
                labelSize: templateConfig.labelSize,
                valueSize: templateConfig.valueSize
            });
        }
        
        // Aplica configurações específicas da matriz (sobrescreve se necessário)
        if (specificConfig) {
            Object.assign(mergedConfig, specificConfig);
        }
        
        // ✅ BUSCA valores específicos direto dos controles HTML (mais confiável)
        const htmlConfig = readSpecificControlsFromHTML();
        Object.assign(mergedConfig, htmlConfig);
        
        return mergedConfig;
    }

    /**
     * ✅ FUNÇÃO AUXILIAR: Lê controles específicos direto do HTML
     */
    function readSpecificControlsFromHTML() {
        return {
            // Controles específicos da matriz
            shape: document.querySelector('.shape-option.active')?.dataset.shape || MATRIX_DEFAULTS.shape,
            elementSize: parseInt(document.getElementById('element-size')?.value) || MATRIX_DEFAULTS.elementSize,
            elementSpacing: parseInt(document.getElementById('element-spacing')?.value) || MATRIX_DEFAULTS.elementSpacing,
            alignment: document.querySelector('.alignment-option.active')?.dataset.align || MATRIX_DEFAULTS.alignment,
            borderRadius: parseFloat(document.getElementById('border-radius')?.value) || MATRIX_DEFAULTS.borderRadius,
            showAnimation: document.getElementById('show-animation')?.checked || MATRIX_DEFAULTS.showAnimation,
            backgroundShapeColor: document.getElementById('background-shape-color')?.value || MATRIX_DEFAULTS.backgroundShapeColor,
            
            // Controles de exibição
            showValues: document.getElementById('show-values')?.checked !== false,
            showCategoryLabels: document.getElementById('show-category-labels')?.checked !== false,
            showGroupLabels: document.getElementById('show-group-labels')?.checked !== false,
            
            // Cores (usa estado atual ou padrão)
            colors: window.MatrixChoiceVizConfig?.currentConfig?.colors || MATRIX_DEFAULTS.colors
        };
    }

    // ==========================================================================
    // DETECÇÃO DE MODO DE DADOS
    // ==========================================================================

    function detectDataMode(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return 'simple';
        }
        
        const firstRow = data[0];
        const keys = Object.keys(firstRow);
        
        // Se tem mais de 2 colunas e a primeira é categoria, é modo comparação
        if (keys.length > 2 && keys[0] === 'categoria') {
            return 'comparison';
        }
        
        // Se tem exatamente categoria e valor, é modo simples
        if (keys.length === 2 && keys.includes('categoria') && keys.includes('valor')) {
            return 'simple';
        }
        
        // Default para simples
        return 'simple';
    }

    // ==========================================================================
    // CÁLCULO DE LAYOUT - CORRIGIDO
    // ==========================================================================

    function calculateLayout(config, data, mode) {
        const margins = MATRIX_SETTINGS.margins;
        const spacing = MATRIX_SETTINGS.spacing;
        
        let availableWidth = MATRIX_SETTINGS.fixedWidth - margins.left - margins.right;
        let availableHeight = MATRIX_SETTINGS.fixedHeight - margins.top - margins.bottom;
        
        // Calcula altura dos títulos
        let titleHeight = 0;
        if (config.title) titleHeight += (config.titleSize || 24);
        if (config.subtitle) titleHeight += spacing.titleToSubtitle + (config.subtitleSize || 16);
        if (titleHeight > 0) titleHeight += spacing.subtitleToChart;
        
        // Reserva espaço para fonte dos dados
        const sourceHeight = config.dataSource ? 15 + spacing.legendToSource : 0;
        
        // Área disponível para a matriz
        const chartAreaHeight = availableHeight - titleHeight - sourceHeight;
        
        let layout = {
            margins: margins,
            spacing: spacing,
            availableWidth: availableWidth,
            availableHeight: availableHeight,
            chartAreaHeight: chartAreaHeight,
            titles: {
                titleY: margins.top + (config.titleSize || 24),
                subtitleY: margins.top + (config.titleSize || 24) + spacing.titleToSubtitle + (config.subtitleSize || 16)
            },
            source: {
                y: MATRIX_SETTINGS.fixedHeight - margins.bottom + spacing.legendToSource
            }
        };
        
        if (mode === 'simple') {
            layout = Object.assign(layout, calculateSimpleLayout(config, data, chartAreaHeight, availableWidth, margins));
        } else {
            layout = Object.assign(layout, calculateComparisonLayout(config, data, chartAreaHeight, availableWidth, margins));
        }
        
        return layout;
    }

    function calculateSimpleLayout(config, data, chartAreaHeight, availableWidth, margins) {
        const elementSize = config.elementSize || MATRIX_DEFAULTS.elementSize;
        const elementSpacing = config.elementSpacing || MATRIX_DEFAULTS.elementSpacing;
        const labelHeight = config.showCategoryLabels ? 30 : 0;
        
        // Calcula grid ótimo
        const numElements = data.length;
        const cols = Math.ceil(Math.sqrt(numElements));
        const rows = Math.ceil(numElements / cols);
        
        // Dimensões necessárias
        const gridWidth = (elementSize * cols) + (elementSpacing * (cols - 1));
        const gridHeight = (elementSize * rows) + (elementSpacing * (rows - 1)) + labelHeight;
        
        // Centraliza na área disponível COM MARGEM ADEQUADA
        const contentAreaHeight = chartAreaHeight - 40; // 40px de margem para breathing room
        const gridX = margins.left + (availableWidth - gridWidth) / 2;
        const gridY = margins.top + 
                     (config.title ? (config.titleSize || 24) + MATRIX_SETTINGS.spacing.titleToSubtitle : 0) +
                     (config.subtitle ? (config.subtitleSize || 16) + MATRIX_SETTINGS.spacing.subtitleToChart : 0) +
                     (contentAreaHeight - gridHeight) / 2;
        
        return {
            mode: 'simple',
            grid: {
                x: gridX,
                y: gridY,
                cols: cols,
                rows: rows,
                elementSize: elementSize,
                elementSpacing: elementSpacing,
                labelHeight: labelHeight
            }
        };
    }

    function calculateComparisonLayout(config, data, chartAreaHeight, availableWidth, margins) {
        const elementSize = config.elementSize || MATRIX_DEFAULTS.elementSize;
        const elementSpacing = config.elementSpacing || MATRIX_DEFAULTS.elementSpacing;
        
        // Extrai grupos (todas as colunas exceto 'categoria')
        const groups = Object.keys(data[0]).filter(key => key !== 'categoria');
        const categories = data.length;
        
        // Calcula espaço para rótulos
        const groupLabelHeight = config.showGroupLabels ? 25 : 0;
        const categoryLabelWidth = config.showCategoryLabels ? 120 : 0;
        
        // Dimensões da matriz
        const matrixWidth = (elementSize * groups.length) + (elementSpacing * (groups.length - 1));
        const matrixHeight = (elementSize * categories) + (elementSpacing * (categories - 1));
        
        // Centraliza considerando rótulos COM MARGEM ADEQUADA
        const totalWidth = categoryLabelWidth + matrixWidth;
        const totalHeight = groupLabelHeight + matrixHeight;
        
        const contentAreaHeight = chartAreaHeight - 40; // 40px de margem para breathing room
        const matrixX = margins.left + categoryLabelWidth + (availableWidth - totalWidth) / 2;
        const matrixY = margins.top + 
                       (config.title ? (config.titleSize || 24) + MATRIX_SETTINGS.spacing.titleToSubtitle : 0) +
                       (config.subtitle ? (config.subtitleSize || 16) + MATRIX_SETTINGS.spacing.subtitleToChart : 0) +
                       groupLabelHeight + 
                       (contentAreaHeight - totalHeight) / 2;
        
        return {
            mode: 'comparison',
            matrix: {
                x: matrixX,
                y: matrixY,
                elementSize: elementSize,
                elementSpacing: elementSpacing,
                groups: groups,
                categories: categories
            },
            labels: {
                groupLabelY: matrixY - 15,
                categoryLabelX: matrixX - 10,
                showGroupLabels: config.showGroupLabels,
                showCategoryLabels: config.showCategoryLabels
            }
        };
    }

    // ==========================================================================
    // PROCESSAMENTO DE DADOS
    // ==========================================================================

    function processDataForMatrix(data, mode) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { processedData: [], mode: 'simple' };
        }
        
        if (mode === 'simple') {
            return {
                processedData: data.map(d => ({
                    categoria: d.categoria,
                    valor: Math.min(100, Math.max(0, parseFloat(d.valor) || 0)) // Limita entre 0-100
                })),
                mode: 'simple'
            };
        } else {
            // Modo comparação
            const groups = Object.keys(data[0]).filter(key => key !== 'categoria');
            
            return {
                processedData: data.map(d => {
                    const processed = { categoria: d.categoria };
                    groups.forEach(group => {
                        processed[group] = Math.min(100, Math.max(0, parseFloat(d[group]) || 0));
                    });
                    return processed;
                }),
                groups: groups,
                mode: 'comparison'
            };
        }
    }

    // ==========================================================================
    // RENDERIZAÇÃO PRINCIPAL
    // ==========================================================================

    function renderVisualization(data, config) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            showNoDataMessage();
            return;
        }
        
        vizCurrentData = data;
        vizCurrentConfig = config; // ✅ USA CONFIGURAÇÃO MESCLADA
        
        console.log('🎨 RENDER - Configuração mesclada:', vizCurrentConfig);
        
        // Detecta modo dos dados
        vizDataMode = detectDataMode(data);
        console.log('📊 Modo detectado:', vizDataMode);
        
        const result = processDataForMatrix(data, vizDataMode);
        vizProcessedData = result.processedData;
        
        if (vizProcessedData.length === 0) {
            showNoDataMessage();
            return;
        }
        
        vizLayoutInfo = calculateLayout(vizCurrentConfig, vizProcessedData, vizDataMode);
        
        updateSVGDimensions();
        renderTitles();
        renderDataSource();
        
        if (vizDataMode === 'simple') {
            renderSimpleMatrix();
        } else {
            renderComparisonMatrix(result.groups);
        }
        
        console.log('🎨 Matriz renderizada:', vizProcessedData.length + ' elementos');
    }

    function updateSVGDimensions() {
        if (!vizSvg) return;
        
        vizSvg.attr('width', MATRIX_SETTINGS.fixedWidth)
              .attr('height', MATRIX_SETTINGS.fixedHeight);
        
        vizSvg.selectAll('.svg-background').remove();
        
        vizSvg.insert('rect', ':first-child')
            .attr('class', 'svg-background')
            .attr('width', MATRIX_SETTINGS.fixedWidth)
            .attr('height', MATRIX_SETTINGS.fixedHeight)
            .attr('fill', vizCurrentConfig.backgroundColor || '#FFFFFF');
    }

    function renderSimpleMatrix() {
        vizChartGroup.selectAll('*').remove();
        
        const layout = vizLayoutInfo.grid;
        
        // Cria grupos para cada elemento
        const elementGroups = vizChartGroup.selectAll('.element-group')
            .data(vizProcessedData)
            .enter()
            .append('g')
            .attr('class', 'element-group')
            .attr('transform', function(d, i) {
                const col = i % layout.cols;
                const row = Math.floor(i / layout.cols);
                const x = layout.x + col * (layout.elementSize + layout.elementSpacing);
                const y = layout.y + row * (layout.elementSize + layout.elementSpacing);
                return 'translate(' + x + ',' + y + ')';
            });
        
        // Renderiza formas de fundo (100%)
        renderBackgroundShapes(elementGroups, layout.elementSize);
        
        // Renderiza formas de valor
        renderValueShapes(elementGroups, layout.elementSize, (d) => vizCurrentConfig.colors[0]);
        
        // ✅ RENDERIZA VALORES COM CONTRASTE AUTOMÁTICO
        if (vizCurrentConfig.showValues) {
            renderValuesWithContrast(elementGroups, layout.elementSize, (d) => vizCurrentConfig.colors[0]);
        }
        
        // Renderiza rótulos das categorias
        if (vizCurrentConfig.showCategoryLabels) {
            renderCategoryLabels(elementGroups, layout.elementSize);
        }
        
        // Animação se habilitada
        if (vizCurrentConfig.showAnimation) {
            elementGroups
                .style('opacity', 0)
                .transition()
                .duration(MATRIX_SETTINGS.animationDuration)
                .delay((d, i) => i * MATRIX_SETTINGS.staggerDelay)
                .style('opacity', 1);
        }
    }

    function renderComparisonMatrix(groups) {
        vizChartGroup.selectAll('*').remove();
        
        const layout = vizLayoutInfo.matrix;
        
        // ✅ CORRIGIDO: Renderiza rótulos dos grupos (topo) com dados corretos
        if (vizCurrentConfig.showGroupLabels) {
            renderGroupLabels(groups, layout);
        }
        
        // Renderiza rótulos das categorias (esquerda)
        if (vizCurrentConfig.showCategoryLabels) {
            renderCategoryLabelsComparison(layout);
        }
        
        // Cria grupos para cada célula da matriz
        const matrixCells = [];
        vizProcessedData.forEach((category, catIndex) => {
            groups.forEach((group, groupIndex) => {
                matrixCells.push({
                    categoria: category.categoria,
                    grupo: group,
                    valor: category[group],
                    catIndex: catIndex,
                    groupIndex: groupIndex
                });
            });
        });
        
        const cellGroups = vizChartGroup.selectAll('.matrix-cell')
            .data(matrixCells)
            .enter()
            .append('g')
            .attr('class', 'matrix-cell')
            .attr('transform', function(d) {
                const x = layout.x + d.groupIndex * (layout.elementSize + layout.elementSpacing);
                const y = layout.y + d.catIndex * (layout.elementSize + layout.elementSpacing);
                return 'translate(' + x + ',' + y + ')';
            });
        
        // Renderiza formas de fundo (100%)
        renderBackgroundShapes(cellGroups, layout.elementSize);
        
        // Renderiza formas de valor (com cores diferentes por grupo)
        renderValueShapes(cellGroups, layout.elementSize, (d) => {
            const colorIndex = d.groupIndex % vizCurrentConfig.colors.length;
            return vizCurrentConfig.colors[colorIndex];
        });
        
        // ✅ RENDERIZA VALORES COM CONTRASTE AUTOMÁTICO
        if (vizCurrentConfig.showValues) {
            renderValuesWithContrast(cellGroups, layout.elementSize, (d) => {
                const colorIndex = d.groupIndex % vizCurrentConfig.colors.length;
                return vizCurrentConfig.colors[colorIndex];
            });
        }
        
        // Animação se habilitada
        if (vizCurrentConfig.showAnimation) {
            cellGroups
                .style('opacity', 0)
                .transition()
                .duration(MATRIX_SETTINGS.animationDuration)
                .delay((d, i) => i * MATRIX_SETTINGS.staggerDelay)
                .style('opacity', 1);
        }
    }

    // ==========================================================================
    // RENDERIZAÇÃO DE FORMAS
    // ==========================================================================

    function renderBackgroundShapes(groups, size) {
        const shape = vizCurrentConfig.shape || MATRIX_DEFAULTS.shape;
        
        groups.each(function() {
            const group = d3.select(this);
            
            if (shape === 'bar') {
                const barWidth = size;
                const barHeight = size / 2;
                renderShape(group, shape, barWidth, barHeight, vizCurrentConfig.backgroundShapeColor || MATRIX_DEFAULTS.backgroundShapeColor, 'background-shape');
            } else {
                renderShape(group, shape, size, size, vizCurrentConfig.backgroundShapeColor || MATRIX_DEFAULTS.backgroundShapeColor, 'background-shape');
            }
        });
    }

    function renderValueShapes(groups, size, colorFunction) {
        const shape = vizCurrentConfig.shape || MATRIX_DEFAULTS.shape;
        const alignment = vizCurrentConfig.alignment || MATRIX_DEFAULTS.alignment;
        
        groups.each(function(d) {
            const group = d3.select(this);
            const percentage = d.valor / 100;
            
            let valueWidth, valueHeight, valueX, valueY;
            
            if (shape === 'bar') {
                const backgroundWidth = size;
                const backgroundHeight = size / 2;
                valueWidth = backgroundWidth * percentage;
                valueHeight = backgroundHeight;
                
                const alignmentOffsets = calculateBarAlignment(backgroundWidth, backgroundHeight, valueWidth, alignment);
                valueX = alignmentOffsets.x;
                valueY = alignmentOffsets.y;
            } else {
                const valueSize = size * Math.sqrt(percentage);
                valueWidth = valueSize;
                valueHeight = valueSize;
                
                const alignmentOffsets = calculateAlignment(size, valueSize, alignment);
                valueX = alignmentOffsets.x;
                valueY = alignmentOffsets.y;
            }
            
            const valueGroup = group.append('g')
                .attr('class', 'value-shape')
                .attr('transform', 'translate(' + valueX + ',' + valueY + ')');
            
            renderShape(valueGroup, shape, valueWidth, valueHeight, colorFunction(d), 'value-shape');
        });
    }

    function renderShape(container, shape, width, height, color, className) {
        const radius = vizCurrentConfig.borderRadius || MATRIX_DEFAULTS.borderRadius;
        
        switch (shape) {
            case 'square':
                container.append('rect')
                    .attr('class', className)
                    .attr('width', width)
                    .attr('height', height)
                    .attr('rx', radius)
                    .attr('ry', radius)
                    .attr('fill', color);
                break;
                
            case 'circle':
                container.append('circle')
                    .attr('class', className)
                    .attr('cx', width / 2)
                    .attr('cy', height / 2)
                    .attr('r', Math.min(width, height) / 2)
                    .attr('fill', color);
                break;
                
            case 'bar':
                const barWidth = width;
                const barHeight = height;
                
                container.append('rect')
                    .attr('class', className)
                    .attr('width', barWidth)
                    .attr('height', barHeight)
                    .attr('rx', radius)
                    .attr('ry', radius)
                    .attr('fill', color);
                break;
                
            case 'triangle':
                const centerX = width / 2;
                const centerY = height / 2;
                const points = [
                    [centerX, centerY - height / 2],
                    [centerX - width / 2, centerY + height / 2],
                    [centerX + width / 2, centerY + height / 2]
                ];
                
                container.append('polygon')
                    .attr('class', className)
                    .attr('points', points.map(p => p.join(',')).join(' '))
                    .attr('fill', color);
                break;
        }
    }

    function calculateAlignment(containerSize, elementSize, alignment) {
        const offset = (containerSize - elementSize) / 2;
        
        switch (alignment) {
            case 'top-left': return { x: 0, y: 0 };
            case 'top-center': return { x: offset, y: 0 };
            case 'top-right': return { x: containerSize - elementSize, y: 0 };
            case 'middle-left': return { x: 0, y: offset };
            case 'center': return { x: offset, y: offset };
            case 'middle-right': return { x: containerSize - elementSize, y: offset };
            case 'bottom-left': return { x: 0, y: containerSize - elementSize };
            case 'bottom-center': return { x: offset, y: containerSize - elementSize };
            case 'bottom-right': return { x: containerSize - elementSize, y: containerSize - elementSize };
            default: return { x: offset, y: offset };
        }
    }

    function calculateBarAlignment(backgroundWidth, backgroundHeight, valueWidth, alignment) {
        switch (alignment) {
            case 'top-left':
            case 'middle-left':
            case 'bottom-left':
                return { x: 0, y: 0 };
            case 'top-center':
            case 'center':
            case 'bottom-center':
                return { x: (backgroundWidth - valueWidth) / 2, y: 0 };
            case 'top-right':
            case 'middle-right':
            case 'bottom-right':
                return { x: backgroundWidth - valueWidth, y: 0 };
            default:
                return { x: 0, y: 0 };
        }
    }

    // ==========================================================================
    // RENDERIZAÇÃO DE TEXTOS - CORRIGIDA
    // ==========================================================================

    /**
     * ✅ NOVA FUNÇÃO: Renderiza valores com contraste automático e contorno
     * Baseada na lógica dos semi círculos
     */
    function renderValuesWithContrast(groups, size, colorFunction) {
        groups.append('text')
            .attr('class', 'value-text')
            .attr('x', function() {
                return vizCurrentConfig.shape === 'bar' ? size / 2 : size / 2;
            })
            .attr('y', function() {
                return vizCurrentConfig.shape === 'bar' ? (size / 2) / 2 : size / 2;
            })
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .style('fill', function(d) {
                // ✅ CONTRASTE AUTOMÁTICO baseado na cor da forma
                const shapeColor = colorFunction(d);
                return getContrastColor(shapeColor);
            })
            .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
            .style('font-size', (vizCurrentConfig.valueSize || 14) + 'px')
            .style('font-weight', '600')
            .style('pointer-events', 'none')
            // ✅ CONTORNO NA COR DA FORMA (como nos semi círculos)
            .style('stroke', function(d) {
                return colorFunction(d);
            })
            .style('stroke-width', '3px')
            .style('paint-order', 'stroke')
            .text(function(d) { return d.valor + '%'; });
    }

    function renderCategoryLabels(groups, size) {
        groups.append('text')
            .attr('class', 'category-label')
            .attr('x', function() {
                return vizCurrentConfig.shape === 'bar' ? size / 2 : size / 2;
            })
            .attr('y', function() {
                return vizCurrentConfig.shape === 'bar' ? (size / 2) + 15 : size + 15;
            })
            .attr('text-anchor', 'middle')
            .style('fill', vizCurrentConfig.textColor || '#2C3E50')
            .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
            .style('font-size', (vizCurrentConfig.labelSize || 12) + 'px')
            .style('font-weight', '500')
            .text(function(d) { 
                return d.categoria.length > 15 ? 
                    d.categoria.substring(0, 15) + '...' : 
                    d.categoria; 
            });
    }

    /**
     * ✅ CORRIGIDA: Função para renderizar rótulos dos grupos
     */
    function renderGroupLabels(groups, layout) {
        console.log('🏷️ Renderizando rótulos dos grupos:', groups);
        console.log('📐 Layout da matriz:', layout);
        
        // ✅ CORRIGIDO: Remove rótulos antigos antes de criar novos
        vizSvg.selectAll('.group-label').remove();
        
        groups.forEach((group, i) => {
            const x = layout.x + i * (layout.elementSize + layout.elementSpacing) + layout.elementSize / 2;
            const y = vizLayoutInfo.labels.groupLabelY;
            
            console.log(`🏷️ Grupo ${i}: ${group} na posição x=${x}, y=${y}`);
            
            vizSvg.append('text')
                .attr('class', 'group-label')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', ((vizCurrentConfig.labelSize || 12) + 2) + 'px')
                .style('font-weight', '600')
                .text(group.replace(/_/g, ' ').toUpperCase());
        });
        
        console.log('✅ Rótulos dos grupos renderizados');
    }

    function renderCategoryLabelsComparison(layout) {
        // ✅ CORRIGIDO: Remove rótulos antigos antes de criar novos
        vizSvg.selectAll('.category-label-comparison').remove();
        
        vizProcessedData.forEach((category, i) => {
            const y = layout.y + i * (layout.elementSize + layout.elementSpacing) + layout.elementSize / 2;
            
            vizSvg.append('text')
                .attr('class', 'category-label-comparison')
                .attr('x', vizLayoutInfo.labels.categoryLabelX)
                .attr('y', y)
                .attr('text-anchor', 'end')
                .attr('dominant-baseline', 'central')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', (vizCurrentConfig.labelSize || 12) + 'px')
                .style('font-weight', '500')
                .text(category.categoria.length > 20 ? 
                      category.categoria.substring(0, 20) + '...' : 
                      category.categoria);
        });
    }

    function renderTitles() {
        vizSvg.selectAll('.chart-title-svg, .chart-subtitle-svg').remove();
        
        const layout = vizLayoutInfo.titles;
        
        if (vizCurrentConfig.title) {
            vizSvg.append('text')
                .attr('class', 'chart-title-svg')
                .attr('x', MATRIX_SETTINGS.fixedWidth / 2)
                .attr('y', layout.titleY)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', (vizCurrentConfig.titleSize || 24) + 'px')
                .style('font-weight', 'bold')
                .text(vizCurrentConfig.title);
        }
        
        if (vizCurrentConfig.subtitle) {
            vizSvg.append('text')
                .attr('class', 'chart-subtitle-svg')
                .attr('x', MATRIX_SETTINGS.fixedWidth / 2)
                .attr('y', layout.subtitleY)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', (vizCurrentConfig.subtitleSize || 16) + 'px')
                .style('opacity', 0.8)
                .text(vizCurrentConfig.subtitle);
        }
    }

    /**
     * ✅ CORRIGIDA: Função renderDataSource sem duplicação de "Fonte:"
     * O Template Controls já pode fornecer "Fonte: texto" ou apenas "texto"
     */
    function renderDataSource() {
        vizSvg.selectAll('.chart-source-svg').remove();
        
        if (vizCurrentConfig.dataSource) {
            let sourceText = vizCurrentConfig.dataSource;
            
            // ✅ CORREÇÃO: Se ainda não tem "Fonte:" no início, adiciona
            if (!sourceText.toLowerCase().startsWith('fonte:')) {
                sourceText = 'Fonte: ' + sourceText;
            }
            
            vizSvg.append('text')
                .attr('class', 'chart-source-svg')
                .attr('x', MATRIX_SETTINGS.fixedWidth / 2)
                .attr('y', vizLayoutInfo.source.y)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', '11px')
                .style('opacity', 0.6)
                .text(sourceText);
        }
    }

    // ==========================================================================
    // FUNÇÕES DE ATUALIZAÇÃO
    // ==========================================================================

    function onUpdate(newConfig) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        console.log('🔄 Atualizando matriz com nova configuração...');
        
        // ✅ MESCLA nova configuração com específicas
        const specificConfig = window.MatrixChoiceVizConfig?.currentConfig || {};
        const mergedConfig = createMergedConfig(newConfig, specificConfig);
        
        // Re-renderiza
        renderVisualization(vizCurrentData, mergedConfig);
    }

    function onMatrixControlUpdate(matrixControls) {
        console.log('⬜ Controles matriz atualizados:', matrixControls);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            // Mescla com configuração atual
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const mergedConfig = createMergedConfig(templateConfig, matrixControls);
            renderVisualization(vizCurrentData, mergedConfig);
        }
    }

    function updateColorPalette(colors) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        console.log('🎨 Cores da matriz atualizadas:', colors);
        
        // Atualiza configuração com novas cores
        vizCurrentConfig.colors = colors;
        
        // Re-renderiza com novas cores
        renderVisualization(vizCurrentData, vizCurrentConfig);
    }

    function updateCustomColors(customColors) {
        updateColorPalette(customColors);
    }

    function onDataLoaded(processedData) {
        if (processedData && processedData.data) {
            console.log('📊 Novos dados carregados:', processedData.data.length + ' elementos');
            
            // Mescla configurações
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const specificConfig = window.MatrixChoiceVizConfig?.currentConfig || {};
            const mergedConfig = createMergedConfig(templateConfig, specificConfig);
            
            renderVisualization(processedData.data, mergedConfig);
        }
    }

    // ==========================================================================
    // UTILITÁRIOS
    // ==========================================================================

    function showNoDataMessage() {
        if (!vizSvg) return;
        
        vizSvg.selectAll('*').remove();
        
        const config = vizCurrentConfig || MATRIX_DEFAULTS;
        
        vizSvg.append('rect')
            .attr('class', 'svg-background')
            .attr('width', MATRIX_SETTINGS.fixedWidth)
            .attr('height', MATRIX_SETTINGS.fixedHeight)
            .attr('fill', config.backgroundColor || '#FFFFFF');
        
        const message = vizSvg.append('g')
            .attr('class', 'no-data-message')
            .attr('transform', 'translate(' + (MATRIX_SETTINGS.fixedWidth / 2) + ',' + (MATRIX_SETTINGS.fixedHeight / 2) + ')');
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-20px')
            .style('fill', config.textColor || '#2C3E50')
            .style('font-family', config.fontFamily || 'Inter')
            .style('font-size', '24px')
            .text('⬜');
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '10px')
            .style('fill', config.textColor || '#2C3E50')
            .style('font-family', config.fontFamily || 'Inter')
            .style('font-size', '16px')
            .text('Carregue dados para visualizar');
    }

    // ==========================================================================
    // EXPORTAÇÕES GLOBAIS
    // ==========================================================================

    window.MatrixChoiceVisualization = {
        initVisualization: initVisualization,
        renderVisualization: renderVisualization,
        onUpdate: onUpdate,
        onMatrixControlUpdate: onMatrixControlUpdate,
        onDataLoaded: onDataLoaded,
        updateColorPalette: updateColorPalette,
        updateCustomColors: updateCustomColors,
        MATRIX_SETTINGS: MATRIX_SETTINGS
    };

    window.onDataLoaded = onDataLoaded;
    window.initVisualization = initVisualization;

    // ==========================================================================
    // AUTO-INICIALIZAÇÃO
    // ==========================================================================

    function waitForD3AndInit() {
        if (typeof d3 !== 'undefined' && document.readyState !== 'loading') {
            initVisualization();
        } else {
            setTimeout(waitForD3AndInit, 100);
        }
    }

    waitForD3AndInit();

})();
