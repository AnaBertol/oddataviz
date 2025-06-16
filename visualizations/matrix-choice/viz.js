/**
 * MATRIZ DE MÚLTIPLA ESCOLHA - VERSÃO MELHORADA
 * Correções: orientação flexível, barras centralizadas, espaçamentos separados, rótulos condicionais, largura maior para categorias
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURAÇÕES CENTRALIZADAS E FIXAS - MELHORADAS
    // ==========================================================================

    const MATRIX_SETTINGS = {
        // Sempre usa formato retangular - dimensões fixas
        fixedWidth: 800,
        fixedHeight: 600,
        
        margins: {
            top: 50,
            right: 40,
            bottom: 60,
            left: 40
        },
        
        spacing: {
            titleToSubtitle: 15,
            subtitleToChart: 20,
            chartToLegend: 20,
            legendToSource: 15,
            gridGap: 12,
            labelOffset: 20
        },
        
        animationDuration: 600,
        staggerDelay: 50
    };

    // ✅ CONFIGURAÇÃO PADRÃO ATUALIZADA
    const MATRIX_DEFAULTS = {
        colors: ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'],
        backgroundShapeColor: '#F5F5F5',
        shape: 'square',
        elementSize: 70, // ✅ MUDADO: era 80, agora 70
        elementSpacingH: 20, // ✅ NOVO: Espaçamento horizontal separado
        elementSpacingV: 20,  // ✅ NOVO: Espaçamento vertical separado
        alignment: 'bottom-left',
        borderRadius: 4,
        showAnimation: false,
        showValues: true,
        showCategoryLabels: true,
        showGroupLabels: true,
        matrixOrientation: 'groups-top', // ✅ NOVO: Orientação padrão
        categoryLabelWidth: 180 // ✅ AUMENTADO: era 100, depois 150
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
    let vizDataMode = 'simple';

    // ==========================================================================
    // UTILITÁRIO DE CONTRASTE
    // ==========================================================================

    function getContrastColor(hexColor) {
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
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
        
        console.log('⬜ Inicializando Matriz melhorada...');
        
        createBaseSVG();
        
        setTimeout(() => {
            loadSampleData();
        }, 150);
    }

    function loadSampleData() {
        if (window.getSampleData && typeof window.getSampleData === 'function') {
            const sampleData = window.getSampleData();
            if (sampleData && sampleData.data) {
                console.log('📊 Carregando dados de exemplo...');
                
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
        
        const placeholder = chartContainer.querySelector('.chart-placeholder');
        if (placeholder) placeholder.remove();
        
        d3.select(chartContainer).select('svg').remove();
        
        vizSvg = d3.select(chartContainer)
            .append('svg')
            .attr('id', 'matrix-choice-viz')
            .attr('width', MATRIX_SETTINGS.fixedWidth)
            .attr('height', MATRIX_SETTINGS.fixedHeight);
        
        vizChartGroup = vizSvg.append('g').attr('class', 'chart-group');
    }

    // ==========================================================================
    // CONFIGURAÇÃO MESCLADA - ATUALIZADA
    // ==========================================================================

    function createMergedConfig(templateConfig, specificConfig) {
        const mergedConfig = Object.assign({}, MATRIX_DEFAULTS);
        
        if (templateConfig) {
            Object.assign(mergedConfig, {
                title: templateConfig.title,
                subtitle: templateConfig.subtitle,
                dataSource: templateConfig.dataSource,
                backgroundColor: templateConfig.backgroundColor,
                textColor: templateConfig.textColor,
                fontFamily: templateConfig.fontFamily,
                titleSize: templateConfig.titleSize,
                subtitleSize: templateConfig.subtitleSize,
                labelSize: templateConfig.labelSize,
                valueSize: templateConfig.valueSize
            });
        }
        
        if (specificConfig) {
            Object.assign(mergedConfig, specificConfig);
        }
        
        const htmlConfig = readSpecificControlsFromHTML();
        Object.assign(mergedConfig, htmlConfig);
        
        return mergedConfig;
    }

    function readSpecificControlsFromHTML() {
        return {
            shape: document.querySelector('.shape-option.active')?.dataset.shape || MATRIX_DEFAULTS.shape,
            elementSize: parseInt(document.getElementById('element-size')?.value) || MATRIX_DEFAULTS.elementSize,
            elementSpacingH: parseInt(document.getElementById('element-spacing-h')?.value) || MATRIX_DEFAULTS.elementSpacingH, // ✅ NOVO
            elementSpacingV: parseInt(document.getElementById('element-spacing-v')?.value) || MATRIX_DEFAULTS.elementSpacingV, // ✅ NOVO
            alignment: document.querySelector('.alignment-option.active')?.dataset.align || MATRIX_DEFAULTS.alignment,
            borderRadius: parseFloat(document.getElementById('border-radius')?.value) || MATRIX_DEFAULTS.borderRadius,
            showAnimation: document.getElementById('show-animation')?.checked || MATRIX_DEFAULTS.showAnimation,
            backgroundShapeColor: document.getElementById('background-shape-color')?.value || MATRIX_DEFAULTS.backgroundShapeColor,
            matrixOrientation: document.querySelector('.orientation-option.active')?.dataset.orientation || MATRIX_DEFAULTS.matrixOrientation, // ✅ NOVO
            
            showValues: document.getElementById('show-values')?.checked !== false,
            showCategoryLabels: document.getElementById('show-category-labels')?.checked !== false,
            showGroupLabels: document.getElementById('show-group-labels')?.checked !== false,
            
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
        
        if (keys.length > 2 && keys[0] === 'categoria') {
            return 'comparison';
        }
        
        if (keys.length === 2 && keys.includes('categoria') && keys.includes('valor')) {
            return 'simple';
        }
        
        return 'simple';
    }

    // ==========================================================================
    // CÁLCULO DE LAYOUT - ATUALIZADO COM ORIENTAÇÃO
    // ==========================================================================

    function calculateLayout(config, data, mode) {
        const margins = MATRIX_SETTINGS.margins;
        const spacing = MATRIX_SETTINGS.spacing;
        
        let availableWidth = MATRIX_SETTINGS.fixedWidth - margins.left - margins.right;
        let availableHeight = MATRIX_SETTINGS.fixedHeight - margins.top - margins.bottom;
        
        let titleHeight = 0;
        if (config.title) titleHeight += (config.titleSize || 24);
        if (config.subtitle) titleHeight += spacing.titleToSubtitle + (config.subtitleSize || 16);
        if (titleHeight > 0) titleHeight += spacing.subtitleToChart;
        
        const sourceHeight = config.dataSource ? 12 + spacing.legendToSource : 0;
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
            layout = Object.assign(layout, calculateSimpleLayoutOptimized(config, data, chartAreaHeight, availableWidth, margins, titleHeight));
        } else {
            layout = Object.assign(layout, calculateComparisonLayoutOptimized(config, data, chartAreaHeight, availableWidth, margins, titleHeight));
        }
        
        return layout;
    }

    function calculateSimpleLayoutOptimized(config, data, chartAreaHeight, availableWidth, margins, titleHeight) {
        const elementSize = config.elementSize || MATRIX_DEFAULTS.elementSize;
        const elementSpacingH = config.elementSpacingH || MATRIX_DEFAULTS.elementSpacingH; // ✅ NOVO
        const elementSpacingV = config.elementSpacingV || MATRIX_DEFAULTS.elementSpacingV; // ✅ NOVO
        const labelHeight = config.showCategoryLabels ? 25 : 0;
        
        const numElements = data.length;
        
        let bestGrid = { cols: Math.ceil(Math.sqrt(numElements)), rows: Math.ceil(numElements / Math.ceil(Math.sqrt(numElements))) };
        let bestFit = 0;
        
        for (let cols = 1; cols <= numElements; cols++) {
            const rows = Math.ceil(numElements / cols);
            const gridWidth = (elementSize * cols) + (elementSpacingH * (cols - 1)); // ✅ USA ESPAÇAMENTO H
            const gridHeight = (elementSize * rows) + (elementSpacingV * (rows - 1)) + labelHeight; // ✅ USA ESPAÇAMENTO V
            
            if (gridWidth <= availableWidth && gridHeight <= (chartAreaHeight - 20)) {
                const fit = (gridWidth / availableWidth) * (gridHeight / (chartAreaHeight - 20));
                if (fit > bestFit) {
                    bestFit = fit;
                    bestGrid = { cols, rows };
                }
            }
        }
        
        const gridWidth = (elementSize * bestGrid.cols) + (elementSpacingH * (bestGrid.cols - 1)); // ✅ USA ESPAÇAMENTO H
        const gridHeight = (elementSize * bestGrid.rows) + (elementSpacingV * (bestGrid.rows - 1)) + labelHeight; // ✅ USA ESPAÇAMENTO V
        
        const gridX = margins.left + (availableWidth - gridWidth) / 2;
        const gridY = margins.top + titleHeight + (chartAreaHeight - gridHeight) / 2;
        
        return {
            mode: 'simple',
            grid: {
                x: gridX,
                y: gridY,
                cols: bestGrid.cols,
                rows: bestGrid.rows,
                elementSize: elementSize,
                elementSpacingH: elementSpacingH, // ✅ NOVO
                elementSpacingV: elementSpacingV, // ✅ NOVO
                labelHeight: labelHeight
            }
        };
    }

    function calculateComparisonLayoutOptimized(config, data, chartAreaHeight, availableWidth, margins, titleHeight) {
        const elementSize = config.elementSize || MATRIX_DEFAULTS.elementSize;
        const elementSpacingH = config.elementSpacingH || MATRIX_DEFAULTS.elementSpacingH; // ✅ NOVO
        const elementSpacingV = config.elementSpacingV || MATRIX_DEFAULTS.elementSpacingV; // ✅ NOVO
        const orientation = config.matrixOrientation || MATRIX_DEFAULTS.matrixOrientation; // ✅ NOVO
        
        const groups = Object.keys(data[0]).filter(key => key !== 'categoria');
        const categories = data.length;
        
        // ✅ ORIENTAÇÃO FLEXÍVEL: grupos no topo vs categorias no topo
        let matrixCols, matrixRows, groupLabelHeight, categoryLabelWidth;
        
        if (orientation === 'groups-top') {
            // Configuração padrão: grupos no topo, categorias à esquerda
            matrixCols = groups.length;
            matrixRows = categories;
            groupLabelHeight = config.showGroupLabels ? 20 : 0;
            categoryLabelWidth = config.showCategoryLabels ? (config.categoryLabelWidth || MATRIX_DEFAULTS.categoryLabelWidth) : 0; // ✅ LARGURA MAIOR
        } else {
            // Nova configuração: categorias no topo, grupos à esquerda
            matrixCols = categories;
            matrixRows = groups.length;
            groupLabelHeight = config.showCategoryLabels ? 20 : 0; // Rótulos das categorias no topo
            categoryLabelWidth = config.showGroupLabels ? (config.categoryLabelWidth || MATRIX_DEFAULTS.categoryLabelWidth) : 0; // Rótulos dos grupos à esquerda
        }
        
        const matrixWidth = (elementSize * matrixCols) + (elementSpacingH * (matrixCols - 1)); // ✅ USA ESPAÇAMENTO H
        const matrixHeight = (elementSize * matrixRows) + (elementSpacingV * (matrixRows - 1)); // ✅ USA ESPAÇAMENTO V
        
        const totalWidth = categoryLabelWidth + matrixWidth;
        const totalHeight = groupLabelHeight + matrixHeight;
        
        const matrixX = margins.left + categoryLabelWidth + (availableWidth - totalWidth) / 2;
        const matrixY = margins.top + titleHeight + groupLabelHeight + (chartAreaHeight - totalHeight) / 2;
        
        return {
            mode: 'comparison',
            matrix: {
                x: matrixX,
                y: matrixY,
                elementSize: elementSize,
                elementSpacingH: elementSpacingH, // ✅ NOVO
                elementSpacingV: elementSpacingV, // ✅ NOVO
                groups: groups,
                categories: categories,
                cols: matrixCols, // ✅ NOVO
                rows: matrixRows, // ✅ NOVO
                orientation: orientation // ✅ NOVO
            },
            labels: {
                groupLabelY: matrixY - 12,
                categoryLabelX: matrixX - 8,
                showGroupLabels: config.showGroupLabels,
                showCategoryLabels: config.showCategoryLabels,
                categoryLabelWidth: categoryLabelWidth // ✅ NOVO
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
                    valor: Math.min(100, Math.max(0, parseFloat(d.valor) || 0))
                })),
                mode: 'simple'
            };
        } else {
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
        vizCurrentConfig = config;
        
        console.log('🎨 RENDER - Configuração melhorada:', vizCurrentConfig);
        
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
        
        console.log('🎨 Matriz melhorada renderizada:', vizProcessedData.length + ' elementos');
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
        
        const elementGroups = vizChartGroup.selectAll('.element-group')
            .data(vizProcessedData)
            .enter()
            .append('g')
            .attr('class', 'element-group')
            .attr('transform', function(d, i) {
                const col = i % layout.cols;
                const row = Math.floor(i / layout.cols);
                const x = layout.x + col * (layout.elementSize + layout.elementSpacingH); // ✅ USA ESPAÇAMENTO H
                const y = layout.y + row * (layout.elementSize + layout.elementSpacingV); // ✅ USA ESPAÇAMENTO V
                return 'translate(' + x + ',' + y + ')';
            });
        
        renderBackgroundShapes(elementGroups, layout.elementSize);
        renderValueShapes(elementGroups, layout.elementSize, (d) => vizCurrentConfig.colors[0]);
        
        if (vizCurrentConfig.showValues) {
            renderValuesWithContrast(elementGroups, layout.elementSize, (d) => vizCurrentConfig.colors[0]);
        }
        
        if (vizCurrentConfig.showCategoryLabels) {
            renderCategoryLabels(elementGroups, layout.elementSize);
        }
        
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
        const orientation = layout.orientation;
        
        // ✅ CORRIGIDO: Limpa TODOS os rótulos antes de renderizar
        clearAllLabels();
        
        // ✅ RENDERIZAÇÃO CONDICIONAL E EXCLUSIVA baseada na orientação
        if (orientation === 'groups-top') {
            // Configuração padrão: grupos no topo, categorias à esquerda
            if (vizCurrentConfig.showGroupLabels) {
                renderGroupLabels(groups, layout);
            }
            if (vizCurrentConfig.showCategoryLabels) {
                renderCategoryLabelsComparison(layout);
            }
        } else {
            // Nova configuração: categorias no topo, grupos à esquerda
            if (vizCurrentConfig.showCategoryLabels) {
                renderCategoryLabelsOnTop(layout);
            }
            if (vizCurrentConfig.showGroupLabels) {
                renderGroupLabelsOnLeft(groups, layout);
            }
        }
        
        // Cria grupos para cada célula da matriz com orientação flexível
        const matrixCells = [];
        
        if (orientation === 'groups-top') {
            // Configuração padrão: categorias nas linhas, grupos nas colunas
            vizProcessedData.forEach((category, catIndex) => {
                groups.forEach((group, groupIndex) => {
                    matrixCells.push({
                        categoria: category.categoria,
                        grupo: group,
                        valor: category[group],
                        catIndex: catIndex,
                        groupIndex: groupIndex,
                        row: catIndex,
                        col: groupIndex
                    });
                });
            });
        } else {
            // Nova configuração: grupos nas linhas, categorias nas colunas
            groups.forEach((group, groupIndex) => {
                vizProcessedData.forEach((category, catIndex) => {
                    matrixCells.push({
                        categoria: category.categoria,
                        grupo: group,
                        valor: category[group],
                        catIndex: catIndex,
                        groupIndex: groupIndex,
                        row: groupIndex,
                        col: catIndex
                    });
                });
            });
        }
        
        const cellGroups = vizChartGroup.selectAll('.matrix-cell')
            .data(matrixCells)
            .enter()
            .append('g')
            .attr('class', 'matrix-cell')
            .attr('transform', function(d) {
                const x = layout.x + d.col * (layout.elementSize + layout.elementSpacingH); // ✅ USA ESPAÇAMENTO H
                const y = layout.y + d.row * (layout.elementSize + layout.elementSpacingV); // ✅ USA ESPAÇAMENTO V
                return 'translate(' + x + ',' + y + ')';
            });
        
        renderBackgroundShapes(cellGroups, layout.elementSize);
        
        renderValueShapes(cellGroups, layout.elementSize, (d) => {
            const colorIndex = (orientation === 'groups-top' ? d.groupIndex : d.catIndex) % vizCurrentConfig.colors.length;
            return vizCurrentConfig.colors[colorIndex];
        });
        
        if (vizCurrentConfig.showValues) {
            renderValuesWithContrast(cellGroups, layout.elementSize, (d) => {
                const colorIndex = (orientation === 'groups-top' ? d.groupIndex : d.catIndex) % vizCurrentConfig.colors.length;
                return vizCurrentConfig.colors[colorIndex];
            });
        }
        
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
    // RENDERIZAÇÃO DE FORMAS - CORRIGIDA PARA BARRAS
    // ==========================================================================

    function renderBackgroundShapes(groups, size) {
        const shape = vizCurrentConfig.shape || MATRIX_DEFAULTS.shape;
        
        groups.each(function() {
            const group = d3.select(this);
            
            if (shape === 'bar') {
                const barWidth = size;
                const barHeight = size / 2;
                // ✅ CORREÇÃO: Centraliza a barra na metade da altura do quadrado
                const barY = (size - barHeight) / 2;
                renderShape(group, shape, barWidth, barHeight, vizCurrentConfig.backgroundShapeColor || MATRIX_DEFAULTS.backgroundShapeColor, 'background-shape', 0, barY);
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
                
                // ✅ CORREÇÃO: Alinhamento das barras considerando centralização
                const backgroundY = (size - backgroundHeight) / 2;
                const alignmentOffsets = calculateBarAlignment(backgroundWidth, backgroundHeight, valueWidth, alignment);
                valueX = alignmentOffsets.x;
                valueY = backgroundY + alignmentOffsets.y; // ✅ APLICA OFFSET Y DA CENTRALIZAÇÃO
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

    function renderShape(container, shape, width, height, color, className, x = 0, y = 0) {
        const radius = vizCurrentConfig.borderRadius || MATRIX_DEFAULTS.borderRadius;
        
        switch (shape) {
            case 'square':
                container.append('rect')
                    .attr('class', className)
                    .attr('x', x)
                    .attr('y', y)
                    .attr('width', width)
                    .attr('height', height)
                    .attr('rx', radius)
                    .attr('ry', radius)
                    .attr('fill', color);
                break;
                
            case 'circle':
                container.append('circle')
                    .attr('class', className)
                    .attr('cx', x + width / 2)
                    .attr('cy', y + height / 2)
                    .attr('r', Math.min(width, height) / 2)
                    .attr('fill', color);
                break;
                
            case 'bar':
                container.append('rect')
                    .attr('class', className)
                    .attr('x', x)
                    .attr('y', y)
                    .attr('width', width)
                    .attr('height', height)
                    .attr('rx', radius)
                    .attr('ry', radius)
                    .attr('fill', color);
                break;
                
            case 'triangle':
                const centerX = x + width / 2;
                const centerY = y + height / 2;
                const points = [
                    [centerX, y],
                    [x, y + height],
                    [x + width, y + height]
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
    // RENDERIZAÇÃO DE TEXTOS - CORRIGIDA COM LIMPEZA CENTRALIZADA
    // ==========================================================================

    /**
     * ✅ NOVA FUNÇÃO: Limpa todos os tipos de rótulos
     */
    function clearAllLabels() {
        vizSvg.selectAll('.group-label, .category-label-comparison, .category-label-top, .group-label-left').remove();
        console.log('🧹 Todos os rótulos limpos');
    }

    function renderValuesWithContrast(groups, size, colorFunction) {
        groups.append('text')
            .attr('class', 'value-text')
            .attr('x', function() {
                return vizCurrentConfig.shape === 'bar' ? size / 2 : size / 2;
            })
            .attr('y', function() {
                // ✅ CORREÇÃO: Para barras, usa a metade da altura do quadrado (centralização)
                return vizCurrentConfig.shape === 'bar' ? size / 2 : size / 2;
            })
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .style('fill', function(d) {
                const shapeColor = colorFunction(d);
                return getContrastColor(shapeColor);
            })
            .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
            .style('font-size', (vizCurrentConfig.valueSize || 14) + 'px')
            .style('font-weight', '600')
            .style('pointer-events', 'none')
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
                return vizCurrentConfig.shape === 'bar' ? (size / 2) + 12 : size + 12;
            })
            .attr('text-anchor', 'middle')
            .style('fill', vizCurrentConfig.textColor || '#2C3E50')
            .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
            .style('font-size', (vizCurrentConfig.labelSize || 12) + 'px')
            .style('font-weight', '500')
            .text(function(d) { 
                // ✅ LARGURA MAIOR: permite texto mais longo
                return d.categoria.length > 24 ? 
                    d.categoria.substring(0, 24) + '...' : 
                    d.categoria; 
            });
    }

    // ✅ FUNÇÃO CORRIGIDA: Renderiza rótulos dos grupos (orientação padrão)
    function renderGroupLabels(groups, layout) {
        if (!vizCurrentConfig.showGroupLabels) {
            console.log('🏷️ Rótulos dos grupos desabilitados');
            return;
        }
        
        console.log('🏷️ Renderizando rótulos dos grupos:', groups);
        
        groups.forEach((group, i) => {
            const x = layout.x + i * (layout.elementSize + layout.elementSpacingH) + layout.elementSize / 2;
            const y = vizLayoutInfo.labels.groupLabelY;
            
            vizSvg.append('text')
                .attr('class', 'group-label')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', ((vizCurrentConfig.labelSize || 12) + 1) + 'px')
                .style('font-weight', '600')
                .text(group.replace(/_/g, ' ').toUpperCase());
        });
        
        console.log('✅ Rótulos dos grupos renderizados');
    }

    // ✅ FUNÇÃO CORRIGIDA: Renderiza rótulos das categorias (orientação padrão)
    function renderCategoryLabelsComparison(layout) {
        if (!vizCurrentConfig.showCategoryLabels) {
            console.log('🏷️ Rótulos das categorias desabilitados');
            return;
        }
        
        console.log('🏷️ Renderizando rótulos das categorias (orientação padrão)');
        
        vizProcessedData.forEach((category, i) => {
            const y = layout.y + i * (layout.elementSize + layout.elementSpacingV) + layout.elementSize / 2;
            
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
                .text(category.categoria.length > 28 ?
                      category.categoria.substring(0, 28) + '...' : 
                      category.categoria);
        });
        
        console.log('✅ Rótulos das categorias (orientação padrão) renderizados');
    }

    // ✅ FUNÇÃO CORRIGIDA: Renderiza rótulos das categorias no topo (orientação alternativa)
    function renderCategoryLabelsOnTop(layout) {
        if (!vizCurrentConfig.showCategoryLabels) {
            console.log('🏷️ Rótulos das categorias no topo desabilitados');
            return;
        }
        
        console.log('🏷️ Renderizando rótulos das categorias no topo');
        
        vizProcessedData.forEach((category, i) => {
            const x = layout.x + i * (layout.elementSize + layout.elementSpacingH) + layout.elementSize / 2;
            const y = vizLayoutInfo.labels.groupLabelY;
            
            vizSvg.append('text')
                .attr('class', 'category-label-top')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', ((vizCurrentConfig.labelSize || 12) + 1) + 'px')
                .style('font-weight', '600')
                .text(category.categoria.length > 20 ? 
                      category.categoria.substring(0, 20) + '...' : 
                      category.categoria);
        });
        
        console.log('✅ Rótulos das categorias no topo renderizados');
    }

    // ✅ FUNÇÃO CORRIGIDA: Renderiza rótulos dos grupos à esquerda (orientação alternativa)
    function renderGroupLabelsOnLeft(groups, layout) {
        if (!vizCurrentConfig.showGroupLabels) {
            console.log('🏷️ Rótulos dos grupos à esquerda desabilitados');
            return;
        }
        
        console.log('🏷️ Renderizando rótulos dos grupos à esquerda:', groups);
        
        groups.forEach((group, i) => {
            const y = layout.y + i * (layout.elementSize + layout.elementSpacingV) + layout.elementSize / 2;
            
            vizSvg.append('text')
                .attr('class', 'group-label-left')
                .attr('x', vizLayoutInfo.labels.categoryLabelX)
                .attr('y', y)
                .attr('text-anchor', 'end')
                .attr('dominant-baseline', 'central')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', (vizCurrentConfig.labelSize || 12) + 'px')
                .style('font-weight', '500')
                .text(group.replace(/_/g, ' ').length > 28 ?
                      group.replace(/_/g, ' ').substring(0, 28) + '...' : 
                      group.replace(/_/g, ' '));
        });
        
        console.log('✅ Rótulos dos grupos à esquerda renderizados');
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

    function renderDataSource() {
        vizSvg.selectAll('.chart-source-svg').remove();
        
        if (vizCurrentConfig.dataSource) {
            let sourceText = vizCurrentConfig.dataSource;
            
            if (!sourceText.toLowerCase().startsWith('fonte:') && !sourceText.toLowerCase().startsWith('source:')) {
                sourceText = 'Fonte: ' + sourceText;
            }
            
            vizSvg.append('text')
                .attr('class', 'chart-source-svg')
                .attr('x', MATRIX_SETTINGS.fixedWidth / 2)
                .attr('y', vizLayoutInfo.source.y)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', '10px')
                .style('opacity', 0.6)
                .text(sourceText);
        }
    }

    // ==========================================================================
    // FUNÇÕES DE ATUALIZAÇÃO
    // ==========================================================================

    function onUpdate(newConfig) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        console.log('🔄 Atualizando matriz melhorada com nova configuração...');
        
        const specificConfig = window.MatrixChoiceVizConfig?.currentConfig || {};
        const mergedConfig = createMergedConfig(newConfig, specificConfig);
        
        renderVisualization(vizCurrentData, mergedConfig);
    }

    function onMatrixControlUpdate(matrixControls) {
        console.log('⬜ Controles matriz atualizados:', matrixControls);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const mergedConfig = createMergedConfig(templateConfig, matrixControls);
            renderVisualization(vizCurrentData, mergedConfig);
        }
    }

    function updateColorPalette(colors) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        console.log('🎨 Cores da matriz atualizadas:', colors);
        
        vizCurrentConfig.colors = colors;
        renderVisualization(vizCurrentData, vizCurrentConfig);
    }

    function updateCustomColors(customColors) {
        updateColorPalette(customColors);
    }

    function onDataLoaded(processedData) {
        if (processedData && processedData.data) {
            console.log('📊 Novos dados carregados:', processedData.data.length + ' elementos');
            
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
