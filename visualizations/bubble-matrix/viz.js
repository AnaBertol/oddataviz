/**
 * MATRIZ DE BOLHAS - D3.js FLEXÍVEL
 * Sistema que aceita qualquer dataset com estrutura: 1 categoria + múltiplas métricas
 * Normalização por coluna permite comparar métricas com diferentes unidades
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURAÇÕES CENTRALIZADAS
    // ==========================================================================

    const BUBBLE_MATRIX_SETTINGS = {
        // Formato retangular - dimensões fixas
        fixedWidth: 800,
        fixedHeight: 600,
        
        margins: {
            top: 60,   // Reduzido para dar mais espaço
            right: 60,
            bottom: 60,
            left: 150  // Espaço para rótulos das categorias
        },
        
        spacing: {
            titleToSubtitle: 15,
            subtitleToChart: 30,  // Aumentado
            chartToSource: 20,
            headerOffset: 25,     // Reduzido
            labelOffset: 20
        },
        
        animationDuration: 800,
        staggerDelay: 50
    };

    // CONFIGURAÇÃO PADRÃO
    const BUBBLE_DEFAULTS = {
        minBubbleSize: 12,
        maxBubbleSize: 50,
        cellWidth: 120,
        cellHeight: 80,
        bubbleOpacity: 0.8,
        strokeWidth: 1,
        bubbleStroke: true,
        colorMode: 'by-column',
        sortBy: 'original',
        sortOrder: 'desc',
        
        // Exibição
        showColumnHeaders: true,
        showRowLabels: true,
        showValues: true,
        showUnits: true,
        
        // Cores
        colors: ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165', '#FF6B6B']
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
    let vizDataStructure = null; // Estrutura detectada automaticamente

    // ==========================================================================
    // UTILITÁRIOS DE CONTRASTE (COPIADO DOS OUTROS ARQUIVOS)
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
        
        console.log('🫧 Inicializando Matriz de Bolhas flexível...');
        
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
                const specificConfig = readSpecificControlsFromHTML();
                const mergedConfig = createMergedConfig(templateConfig, specificConfig);
                
                renderVisualization(sampleData.data, mergedConfig);
            }
        }
    }

    function createBaseSVG() {
        const chartContainer = document.getElementById('chart');
        if (!chartContainer) return;
        
        chartContainer.querySelector('.chart-placeholder')?.remove();
        d3.select(chartContainer).select('svg').remove();
        
        vizSvg = d3.select(chartContainer)
            .append('svg')
            .attr('id', 'bubble-matrix-viz')
            .attr('width', BUBBLE_MATRIX_SETTINGS.fixedWidth)
            .attr('height', BUBBLE_MATRIX_SETTINGS.fixedHeight);
        
        vizChartGroup = vizSvg.append('g').attr('class', 'chart-group');
    }

    // ==========================================================================
    // DETECÇÃO AUTOMÁTICA DA ESTRUTURA DOS DADOS
    // ==========================================================================

    /**
     * Detecta automaticamente a estrutura dos dados
     * Primeira coluna = categoria, demais = métricas
     */
    function detectDataStructure(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return null;
        }
        
        const firstRow = data[0];
        const allColumns = Object.keys(firstRow);
        
        if (allColumns.length < 2) {
            return null;
        }
        
        const categoryColumn = allColumns[0];
        const metricColumns = allColumns.slice(1);
        
        console.log('📊 Estrutura detectada:');
        console.log('- Categoria:', categoryColumn);
        console.log('- Métricas:', metricColumns);
        
        return {
            categoryColumn: categoryColumn,
            metricColumns: metricColumns,
            allColumns: allColumns,
            categoryName: categoryColumn.replace(/_/g, ' ').toUpperCase(),
            metricNames: metricColumns.map(col => col.replace(/_/g, ' ').toUpperCase())
        };
    }

    /**
     * Gera metadados padrão para colunas sem metadados
     */
    function generateDefaultMetadata(structure, originalMetadata = {}) {
        const metadata = {};
        
        structure.metricColumns.forEach((col, index) => {
            if (originalMetadata[col]) {
                metadata[col] = originalMetadata[col];
            } else {
                metadata[col] = {
                    name: col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    unit: '',
                    format: 'number',
                    description: `Métrica ${index + 1}`
                };
            }
        });
        
        return metadata;
    }

    // ==========================================================================
    // CONFIGURAÇÃO MESCLADA
    // ==========================================================================

    function createMergedConfig(templateConfig, specificConfig) {
        const mergedConfig = Object.assign({}, BUBBLE_DEFAULTS);
        
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
        
        return mergedConfig;
    }

    function readSpecificControlsFromHTML() {
        return {
            minBubbleSize: parseInt(document.getElementById('min-bubble-size')?.value) || BUBBLE_DEFAULTS.minBubbleSize,
            maxBubbleSize: parseInt(document.getElementById('max-bubble-size')?.value) || BUBBLE_DEFAULTS.maxBubbleSize,
            cellWidth: parseInt(document.getElementById('cell-width')?.value) || BUBBLE_DEFAULTS.cellWidth,
            cellHeight: parseInt(document.getElementById('cell-height')?.value) || BUBBLE_DEFAULTS.cellHeight,
            bubbleOpacity: parseFloat(document.getElementById('bubble-opacity')?.value) || BUBBLE_DEFAULTS.bubbleOpacity,
            strokeWidth: parseFloat(document.getElementById('stroke-width')?.value) || BUBBLE_DEFAULTS.strokeWidth,
            bubbleStroke: document.getElementById('bubble-stroke')?.checked !== false,
            
            colorMode: document.querySelector('input[name="color-mode"]:checked')?.value || BUBBLE_DEFAULTS.colorMode,
            sortBy: document.getElementById('sort-by')?.value || BUBBLE_DEFAULTS.sortBy,
            sortOrder: document.getElementById('sort-order')?.value || BUBBLE_DEFAULTS.sortOrder,
            
            showColumnHeaders: document.getElementById('show-column-headers')?.checked !== false,
            showRowLabels: document.getElementById('show-row-labels')?.checked !== false,
            showValues: document.getElementById('show-values')?.checked !== false,
            showUnits: document.getElementById('show-units')?.checked || false,
        
        // ✅ NOVO: Unidades customizadas por coluna
        customUnits: getCustomUnitsFromHTML(),
            
            colors: BUBBLE_DEFAULTS.colors
        };
    }

    // ==========================================================================
    // PROCESSAMENTO DE DADOS FLEXÍVEL
    // ==========================================================================

    function processDataForBubbleMatrix(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { processedData: [], structure: null };
        }
        
        // Detecta estrutura automaticamente
        const structure = detectDataStructure(data);
        if (!structure) {
            console.error('Não foi possível detectar a estrutura dos dados');
            return { processedData: [], structure: null };
        }
        
        // Processa dados e calcula normalização por coluna
        const processedData = data.map(row => {
            const processedRow = {
                [structure.categoryColumn]: row[structure.categoryColumn]
            };
            
            structure.metricColumns.forEach(col => {
                processedRow[col] = parseFloat(row[col]) || 0;
            });
            
            return processedRow;
        });
        
        // Calcula valores máximos por coluna para normalização
        const columnMaxes = {};
        structure.metricColumns.forEach(col => {
            columnMaxes[col] = Math.max(...processedData.map(row => row[col]));
        });
        
        // Adiciona valores normalizados (0-1)
        processedData.forEach(row => {
            structure.metricColumns.forEach(col => {
                const normalizedKey = col + '_normalized';
                row[normalizedKey] = columnMaxes[col] > 0 ? row[col] / columnMaxes[col] : 0;
            });
        });
        
        console.log('📊 Dados processados:', processedData.length, 'linhas');
        console.log('📊 Máximos por coluna:', columnMaxes);
        
        return { 
            processedData: processedData, 
            structure: structure,
            columnMaxes: columnMaxes
        };
    }

    // ==========================================================================
    // ORDENAÇÃO DINÂMICA
    // ==========================================================================

    function sortDataByColumn(data, structure, sortBy, sortOrder) {
        if (sortBy === 'original' || !structure.metricColumns.includes(sortBy)) {
            return data; // Mantém ordem original
        }
        
        const sorted = [...data].sort((a, b) => {
            const valueA = a[sortBy];
            const valueB = b[sortBy];
            
            if (sortOrder === 'asc') {
                return valueA - valueB;
            } else {
                return valueB - valueA;
            }
        });
        
        console.log(`📊 Dados ordenados por ${sortBy} (${sortOrder})`);
        return sorted;
    }

    // ==========================================================================
    // CÁLCULO DE LAYOUT
    // ==========================================================================

    function calculateLayout(config, structure, dataLength) {
        const margins = BUBBLE_MATRIX_SETTINGS.margins;
        const spacing = BUBBLE_MATRIX_SETTINGS.spacing;
        
        let availableWidth = BUBBLE_MATRIX_SETTINGS.fixedWidth - margins.left - margins.right;
        let availableHeight = BUBBLE_MATRIX_SETTINGS.fixedHeight - margins.top - margins.bottom;
        
        // ✅ CORRIGIDO: Calcula altura dos títulos corretamente
        let titleHeight = 0;
        if (config.title) titleHeight += (config.titleSize || 24) + 5; // +5 margem extra
        if (config.subtitle) titleHeight += spacing.titleToSubtitle + (config.subtitleSize || 16) + 5; // +5 margem extra
        if (titleHeight > 0) titleHeight += spacing.subtitleToChart;
        
        // ✅ CORRIGIDO: Reserva espaço para headers das colunas
        const headerHeight = config.showColumnHeaders ? 25 : 0;
        
        const sourceHeight = config.dataSource ? 12 + spacing.chartToSource : 0;
        
        // ✅ CORRIGIDO: Área disponível considera títulos E headers
        const matrixAreaHeight = availableHeight - titleHeight - headerHeight - sourceHeight;
        const matrixAreaWidth = availableWidth;
        
        // Dimensões das células
        const numColumns = structure.metricColumns.length;
        const numRows = dataLength;
        
        const cellWidth = Math.min(config.cellWidth, matrixAreaWidth / numColumns);
        const cellHeight = Math.min(config.cellHeight, matrixAreaHeight / numRows);
        
        // Centraliza a matriz
        const matrixWidth = cellWidth * numColumns;
        const matrixHeight = cellHeight * numRows;
        
        const matrixX = margins.left + (matrixAreaWidth - matrixWidth) / 2;
        const matrixY = margins.top + titleHeight + headerHeight + (matrixAreaHeight - matrixHeight) / 2;
        
        return {
            margins: margins,
            spacing: spacing,
            availableWidth: availableWidth,
            availableHeight: availableHeight,
            
            titles: {
                titleY: margins.top + (config.titleSize || 24),
                subtitleY: margins.top + (config.titleSize || 24) + spacing.titleToSubtitle + (config.subtitleSize || 16)
            },
            
            source: {
                y: BUBBLE_MATRIX_SETTINGS.fixedWidth - margins.bottom + spacing.chartToSource
            },
            
            matrix: {
                x: matrixX,
                y: matrixY,
                width: matrixWidth,
                height: matrixHeight,
                cellWidth: cellWidth,
                cellHeight: cellHeight,
                numColumns: numColumns,
                numRows: numRows
            },
            
            headers: {
                // ✅ CORRIGIDO: Headers posicionados APÓS títulos e espaçamento
                y: margins.top + titleHeight + (headerHeight / 2),
                show: config.showColumnHeaders
            },
            
            rowLabels: {
                x: matrixX - spacing.labelOffset,
                show: config.showRowLabels
            }
        };
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
        
        console.log('🎨 RENDER - Matriz de Bolhas');
        
        const result = processDataForBubbleMatrix(data);
        vizProcessedData = result.processedData;
        vizDataStructure = result.structure;
        
        if (!vizProcessedData || vizProcessedData.length === 0 || !vizDataStructure) {
            showNoDataMessage();
            return;
        }
        
        // Aplica ordenação se especificada
        const sortedData = sortDataByColumn(
            vizProcessedData, 
            vizDataStructure, 
            config.sortBy, 
            config.sortOrder
        );
        
        vizLayoutInfo = calculateLayout(config, vizDataStructure, sortedData.length);
        
        updateSVGDimensions();
        renderTitles();
        renderDataSource();
        renderColumnHeaders();
        renderBubbleMatrix(sortedData, result.columnMaxes);
        
        console.log('🎨 Matriz de bolhas renderizada:', sortedData.length + ' linhas');
    }

    function updateSVGDimensions() {
        if (!vizSvg) return;
        
        vizSvg.attr('width', BUBBLE_MATRIX_SETTINGS.fixedWidth)
              .attr('height', BUBBLE_MATRIX_SETTINGS.fixedHeight);
        
        vizSvg.selectAll('.svg-background').remove();
        
        vizSvg.insert('rect', ':first-child')
            .attr('class', 'svg-background')
            .attr('width', BUBBLE_MATRIX_SETTINGS.fixedWidth)
            .attr('height', BUBBLE_MATRIX_SETTINGS.fixedHeight)
            .attr('fill', vizCurrentConfig.backgroundColor || '#FFFFFF');
    }

    function renderBubbleMatrix(sortedData, columnMaxes) {
        vizChartGroup.selectAll('*').remove();
        
        const layout = vizLayoutInfo.matrix;
        const structure = vizDataStructure;
        
        // Cria escala de tamanho para as bolhas
        const bubbleSizeScale = d3.scaleSqrt()
            .domain([0, 1]) // Valores normalizados
            .range([vizCurrentConfig.minBubbleSize, vizCurrentConfig.maxBubbleSize]);
        
        // Cria dados para todas as células da matriz
        const matrixCells = [];
        sortedData.forEach((row, rowIndex) => {
            structure.metricColumns.forEach((col, colIndex) => {
                matrixCells.push({
                    category: row[structure.categoryColumn],
                    metric: col,
                    value: row[col],
                    normalizedValue: row[col + '_normalized'],
                    rowIndex: rowIndex,
                    colIndex: colIndex,
                    maxValue: columnMaxes[col]
                });
            });
        });
        
        // Renderiza células
        const cellGroups = vizChartGroup.selectAll('.matrix-cell')
            .data(matrixCells)
            .enter()
            .append('g')
            .attr('class', 'matrix-cell')
            .attr('transform', d => {
                const x = layout.x + d.colIndex * layout.cellWidth;
                const y = layout.y + d.rowIndex * layout.cellHeight;
                return `translate(${x}, ${y})`;
            });
        
        // Renderiza bolhas
        const bubbles = cellGroups.append('circle')
            .attr('class', 'bubble')
            .attr('cx', layout.cellWidth / 2)
            .attr('cy', layout.cellHeight / 2)
            .attr('r', d => bubbleSizeScale(d.normalizedValue))
            .attr('fill', d => getBubbleColor(d))
            .attr('opacity', vizCurrentConfig.bubbleOpacity)
            .style('cursor', 'pointer');
        
        // Adiciona contorno se habilitado
        if (vizCurrentConfig.bubbleStroke) {
            bubbles
                .attr('stroke', vizCurrentConfig.textColor || '#2C3E50')
                .attr('stroke-width', vizCurrentConfig.strokeWidth)
                .attr('stroke-opacity', 0.3);
        }
        
        // Renderiza valores com contraste automático
        if (vizCurrentConfig.showValues) {
            renderBubbleValues(cellGroups, layout);
        }
        
        // Renderiza rótulos das linhas
        if (vizCurrentConfig.showRowLabels) {
            renderRowLabels(sortedData, layout);
        }
        
        // Adiciona interações
        setupBubbleInteractions(cellGroups);
        
        // Animação se habilitada
        if (vizCurrentConfig.showAnimation) {
            cellGroups
                .style('opacity', 0)
                .transition()
                .duration(BUBBLE_MATRIX_SETTINGS.animationDuration)
                .delay((d, i) => i * BUBBLE_MATRIX_SETTINGS.staggerDelay)
                .style('opacity', 1);
        }
    }

    function getBubbleColor(d) {
        const colors = vizCurrentConfig.colors || BUBBLE_DEFAULTS.colors;
        
        switch (vizCurrentConfig.colorMode) {
            case 'by-column':
                return colors[d.colIndex % colors.length];
            case 'by-row':
                return colors[d.rowIndex % colors.length];
            case 'single':
            default:
                return colors[0];
        }
    }

    function renderBubbleValues(cellGroups, layout) {
        cellGroups.append('text')
            .attr('class', 'bubble-value')
            .attr('x', layout.cellWidth / 2)
            .attr('y', layout.cellHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .style('fill', d => getContrastColor(getBubbleColor(d)))
            .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
            .style('font-size', (vizCurrentConfig.valueSize || 12) + 'px')
            .style('font-weight', '600')
            .style('pointer-events', 'none')
            .style('stroke', d => getBubbleColor(d))
            .style('stroke-width', '2px')
            .style('paint-order', 'stroke')
            .text(d => formatValue(d.value, d.metric));
    }

    function formatValue(value, metricColumn) {
        // ✅ FORMATAÇÃO INTELIGENTE AUTOMÁTICA
        if (value === 0) return '0';
        
        const absValue = Math.abs(value);
        let formattedValue;
        
        if (absValue >= 1000000) {
            formattedValue = (value / 1000000).toFixed(1) + 'M';
        } else if (absValue >= 1000) {
            formattedValue = (value / 1000).toFixed(1) + 'k';
        } else if (absValue >= 10) {
            formattedValue = value.toFixed(0);
        } else if (absValue >= 1) {
            formattedValue = value.toFixed(1);
        } else {
            formattedValue = value.toFixed(2);
        }
        
        // ✅ ADICIONA UNIDADE CUSTOMIZADA SE DEFINIDA
        if (vizCurrentConfig.showUnits && vizCurrentConfig.customUnits) {
            const customUnit = vizCurrentConfig.customUnits[metricColumn];
            if (customUnit && customUnit.trim()) {
                // Decide se unidade vai antes ou depois
                if (customUnit.startsWith('

    function renderColumnHeaders() {
        vizSvg.selectAll('.column-header').remove();
        
        if (!vizCurrentConfig.showColumnHeaders) return;
        
        const layout = vizLayoutInfo.matrix;
        const headers = vizLayoutInfo.headers;
        
        vizDataStructure.metricColumns.forEach((col, index) => {
            const x = layout.x + index * layout.cellWidth + layout.cellWidth / 2;
            const y = headers.y;
            
            // Nome da métrica
            const metricName = col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            vizSvg.append('text')
                .attr('class', 'column-header')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central') // ✅ CORRIGIDO: Centraliza verticalmente
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', ((vizCurrentConfig.labelSize || 12) + 1) + 'px')
                .style('font-weight', '600')
                .text(metricName);
        });
    }

    function renderRowLabels(sortedData, layout) {
        vizSvg.selectAll('.row-label').remove();
        
        if (!vizCurrentConfig.showRowLabels) return;
        
        const rowLabels = vizLayoutInfo.rowLabels;
        
        sortedData.forEach((row, index) => {
            const x = rowLabels.x;
            const y = layout.y + index * layout.cellHeight + layout.cellHeight / 2;
            
            const categoryName = row[vizDataStructure.categoryColumn];
            
            vizSvg.append('text')
                .attr('class', 'row-label')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', 'end')
                .attr('dominant-baseline', 'central')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', (vizCurrentConfig.labelSize || 12) + 'px')
                .style('font-weight', '500')
                .text(categoryName.length > 20 ? categoryName.substring(0, 20) + '...' : categoryName);
        });
    }

    function renderTitles() {
        vizSvg.selectAll('.chart-title-svg, .chart-subtitle-svg').remove();
        
        const layout = vizLayoutInfo.titles;
        
        if (vizCurrentConfig.title) {
            vizSvg.append('text')
                .attr('class', 'chart-title-svg')
                .attr('x', BUBBLE_MATRIX_SETTINGS.fixedWidth / 2)
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
                .attr('x', BUBBLE_MATRIX_SETTINGS.fixedWidth / 2)
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
                .attr('x', BUBBLE_MATRIX_SETTINGS.fixedWidth / 2)
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
    // INTERAÇÕES
    // ==========================================================================

    function setupBubbleInteractions(cellGroups) {
        cellGroups
            .on('mouseover', handleBubbleHover)
            .on('mouseout', handleBubbleOut)
            .on('click', handleBubbleClick);
    }

    function handleBubbleHover(event, d) {
        d3.select(event.currentTarget).select('.bubble')
            .transition()
            .duration(200)
            .attr('opacity', 1)
            .attr('stroke-width', (vizCurrentConfig.strokeWidth + 1));
        
        showTooltip(event, d);
    }

    function handleBubbleOut(event, d) {
        d3.select(event.currentTarget).select('.bubble')
            .transition()
            .duration(200)
            .attr('opacity', vizCurrentConfig.bubbleOpacity)
            .attr('stroke-width', vizCurrentConfig.strokeWidth);
        
        hideTooltip();
    }

    function handleBubbleClick(event, d) {
        if (window.OddVizApp?.showNotification) {
            const metricName = d.metric.replace(/_/g, ' ').toUpperCase();
            window.OddVizApp.showNotification(
                `${d.category} - ${metricName}: ${formatValue(d.value, d.metric)}`, 
                'info'
            );
        }
    }

    function showTooltip(event, d) {
        hideTooltip();
        
        const metricName = d.metric.replace(/_/g, ' ').toUpperCase();
        const percentage = ((d.value / d.maxValue) * 100).toFixed(1);
        
        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'viz-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0,0,0,0.9)')
            .style('color', 'white')
            .style('padding', '10px')
            .style('border-radius', '6px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .html(`
                <div style="font-weight: bold; margin-bottom: 4px;">${d.category}</div>
                <div style="margin-bottom: 2px;">${metricName}</div>
                <div>Valor: ${formatValue(d.value, d.metric)}</div>
                <div style="font-size: 10px; opacity: 0.8;">${percentage}% do máximo da coluna</div>
            `);
        
        tooltip.transition().duration(200).style('opacity', 1);
    }

    function hideTooltip() {
        d3.selectAll('.viz-tooltip').remove();
    }

    /**
     * ✅ NOVA FUNÇÃO: Coleta unidades customizadas dos inputs HTML
     */
    function getCustomUnitsFromHTML() {
        const customUnits = {};
        
        // Busca inputs de unidades customizadas
        document.querySelectorAll('.custom-unit-input').forEach(input => {
            const columnName = input.dataset.column;
            const unitValue = input.value.trim();
            if (columnName && unitValue) {
                customUnits[columnName] = unitValue;
            }
        });
        
        return customUnits;
    }

    /**
     * ✅ NOVA FUNÇÃO: Cria inputs de unidades customizadas
     */
    function createCustomUnitInputs(structure) {
        const container = document.getElementById('custom-units-container');
        if (!container || !structure) return;
        
        console.log('🏷️ Criando inputs de unidades para:', structure.metricColumns);
        
        // Limpa container
        container.innerHTML = '';
        
        // Cria input para cada métrica
        structure.metricColumns.forEach(col => {
            const metricName = col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            const inputGroup = document.createElement('div');
            inputGroup.className = 'control-group';
            inputGroup.innerHTML = `
                <label class="control-label">${metricName}</label>
                <input type="text" 
                       class="control-input custom-unit-input" 
                       data-column="${col}"
                       placeholder="Ex: %, R$, pts"
                       maxlength="5">
                <p class="control-help">Unidade que aparece junto ao valor</p>
            `;
            
            container.appendChild(inputGroup);
            
            // Event listener para atualizar visualização
            const input = inputGroup.querySelector('.custom-unit-input');
            input.addEventListener('input', () => {
                console.log(`🏷️ Unidade de ${col} alterada para:`, input.value);
                // Re-renderiza se há dados
                if (vizCurrentData && vizCurrentData.length > 0) {
                    const templateConfig = window.OddVizTemplateControls?.getState() || {};
                    const specificConfig = readSpecificControlsFromHTML();
                    const mergedConfig = createMergedConfig(templateConfig, specificConfig);
                    renderVisualization(vizCurrentData, mergedConfig);
                }
            });
        });
        
        console.log('✅ Inputs de unidades criados para', structure.metricColumns.length, 'métricas');
    }

    function onUpdate(newConfig) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        console.log('🔄 Atualizando matriz de bolhas...');
        
        const specificConfig = readSpecificControlsFromHTML();
        const mergedConfig = createMergedConfig(newConfig, specificConfig);
        
        renderVisualization(vizCurrentData, mergedConfig);
    }

    function onBubbleMatrixControlUpdate(bubbleControls) {
        console.log('🫧 Controles matriz atualizados:', bubbleControls);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const mergedConfig = createMergedConfig(templateConfig, bubbleControls);
            renderVisualization(vizCurrentData, mergedConfig);
        }
    }

    function onSortingChange(sortBy, sortOrder) {
        console.log('📊 Ordenação alterada:', sortBy, sortOrder);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const specificConfig = readSpecificControlsFromHTML();
            specificConfig.sortBy = sortBy;
            specificConfig.sortOrder = sortOrder;
            
            const mergedConfig = createMergedConfig(templateConfig, specificConfig);
            renderVisualization(vizCurrentData, mergedConfig);
        }
    }

    function onColorModeChange(colorMode) {
        console.log('🎨 Modo de cor alterado:', colorMode);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const specificConfig = readSpecificControlsFromHTML();
            specificConfig.colorMode = colorMode;
            
            const mergedConfig = createMergedConfig(templateConfig, specificConfig);
            renderVisualization(vizCurrentData, mergedConfig);
        }
    }

    function onShowControlsChange(showControls) {
        console.log('👁️ Controles de exibição alterados:', showControls);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const specificConfig = readSpecificControlsFromHTML();
            Object.assign(specificConfig, showControls);
            
            const mergedConfig = createMergedConfig(templateConfig, specificConfig);
            renderVisualization(vizCurrentData, mergedConfig);
        }
    }

    function updateColorPalette(paletteType) {
        console.log('🎨 Paleta da matriz de bolhas atualizada:', paletteType);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            // Atualiza cores baseado na paleta
            let newColors;
            if (paletteType === 'odd') {
                newColors = ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165', '#FF6B6B'];
            } else if (paletteType === 'rainbow') {
                newColors = ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#0080FF', '#8000FF', '#FF69B4'];
            } else {
                newColors = BUBBLE_DEFAULTS.colors;
            }
            
            vizCurrentConfig.colors = newColors;
            renderVisualization(vizCurrentData, vizCurrentConfig);
        }
    }

    function onDataLoaded(processedData) {
        if (processedData && processedData.data) {
            console.log('📊 Novos dados carregados:', processedData.data.length + ' linhas');
            
            // ✅ CORRIGIDO: Atualiza dropdown ANTES de renderizar
            updateSortDropdown(processedData.data);
            
            // ✅ CORRIGIDO: Detecta estrutura e salva globalmente
            const structure = detectDataStructure(processedData.data);
            if (structure) {
                vizDataStructure = structure;
                console.log('📊 Estrutura detectada e salva:', structure);
                
                // ✅ NOVO: Cria inputs de unidades customizadas
                createCustomUnitInputs(structure);
            }
            
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const specificConfig = readSpecificControlsFromHTML();
            const mergedConfig = createMergedConfig(templateConfig, specificConfig);
            
            renderVisualization(processedData.data, mergedConfig);
        }
    }

    function updateSortDropdown(data) {
        const sortSelect = document.getElementById('sort-by');
        if (!sortSelect || !data || data.length === 0) return;
        
        const structure = detectDataStructure(data);
        if (!structure) return;
        
        // ✅ CORRIGIDO: Salva valor selecionado atual
        const currentValue = sortSelect.value;
        
        // Limpa opções atuais
        sortSelect.innerHTML = '<option value="original">Ordem Original</option>';
        
        // Adiciona opções para cada métrica
        structure.metricColumns.forEach(col => {
            const option = document.createElement('option');
            option.value = col;
            option.textContent = col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            sortSelect.appendChild(option);
        });
        
        // ✅ CORRIGIDO: Restaura valor selecionado se ainda existir
        if (currentValue && structure.metricColumns.includes(currentValue)) {
            sortSelect.value = currentValue;
        }
        
        console.log('📊 Dropdown de ordenação atualizado com', structure.metricColumns.length, 'opções');
        console.log('📊 Valor atual:', sortSelect.value);
    }

    // ==========================================================================
    // UTILITÁRIOS
    // ==========================================================================

    function showNoDataMessage() {
        if (!vizSvg) return;
        
        vizSvg.selectAll('*').remove();
        
        const config = vizCurrentConfig || BUBBLE_DEFAULTS;
        
        vizSvg.append('rect')
            .attr('class', 'svg-background')
            .attr('width', BUBBLE_MATRIX_SETTINGS.fixedWidth)
            .attr('height', BUBBLE_MATRIX_SETTINGS.fixedHeight)
            .attr('fill', config.backgroundColor || '#FFFFFF');
        
        const message = vizSvg.append('g')
            .attr('class', 'no-data-message')
            .attr('transform', `translate(${BUBBLE_MATRIX_SETTINGS.fixedWidth / 2}, ${BUBBLE_MATRIX_SETTINGS.fixedHeight / 2})`);
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-20px')
            .style('fill', config.textColor || '#2C3E50')
            .style('font-family', config.fontFamily || 'Inter')
            .style('font-size', '24px')
            .text('🫧');
        
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

    window.BubbleMatrixVisualization = {
        initVisualization: initVisualization,
        renderVisualization: renderVisualization,
        onUpdate: onUpdate,
        onBubbleMatrixControlUpdate: onBubbleMatrixControlUpdate,
        onSortingChange: onSortingChange,
        onColorModeChange: onColorModeChange,
        onShowControlsChange: onShowControlsChange,
        onDataLoaded: onDataLoaded,
        updateColorPalette: updateColorPalette,
        BUBBLE_MATRIX_SETTINGS: BUBBLE_MATRIX_SETTINGS
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

})();) || customUnit.startsWith('R

    function renderColumnHeaders() {
        vizSvg.selectAll('.column-header').remove();
        
        if (!vizCurrentConfig.showColumnHeaders) return;
        
        const layout = vizLayoutInfo.matrix;
        const headers = vizLayoutInfo.headers;
        
        vizDataStructure.metricColumns.forEach((col, index) => {
            const x = layout.x + index * layout.cellWidth + layout.cellWidth / 2;
            const y = headers.y;
            
            // Nome da métrica
            const metricName = col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            vizSvg.append('text')
                .attr('class', 'column-header')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central') // ✅ CORRIGIDO: Centraliza verticalmente
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', ((vizCurrentConfig.labelSize || 12) + 1) + 'px')
                .style('font-weight', '600')
                .text(metricName);
        });
    }

    function renderRowLabels(sortedData, layout) {
        vizSvg.selectAll('.row-label').remove();
        
        if (!vizCurrentConfig.showRowLabels) return;
        
        const rowLabels = vizLayoutInfo.rowLabels;
        
        sortedData.forEach((row, index) => {
            const x = rowLabels.x;
            const y = layout.y + index * layout.cellHeight + layout.cellHeight / 2;
            
            const categoryName = row[vizDataStructure.categoryColumn];
            
            vizSvg.append('text')
                .attr('class', 'row-label')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', 'end')
                .attr('dominant-baseline', 'central')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', (vizCurrentConfig.labelSize || 12) + 'px')
                .style('font-weight', '500')
                .text(categoryName.length > 20 ? categoryName.substring(0, 20) + '...' : categoryName);
        });
    }

    function renderTitles() {
        vizSvg.selectAll('.chart-title-svg, .chart-subtitle-svg').remove();
        
        const layout = vizLayoutInfo.titles;
        
        if (vizCurrentConfig.title) {
            vizSvg.append('text')
                .attr('class', 'chart-title-svg')
                .attr('x', BUBBLE_MATRIX_SETTINGS.fixedWidth / 2)
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
                .attr('x', BUBBLE_MATRIX_SETTINGS.fixedWidth / 2)
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
                .attr('x', BUBBLE_MATRIX_SETTINGS.fixedWidth / 2)
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
    // INTERAÇÕES
    // ==========================================================================

    function setupBubbleInteractions(cellGroups) {
        cellGroups
            .on('mouseover', handleBubbleHover)
            .on('mouseout', handleBubbleOut)
            .on('click', handleBubbleClick);
    }

    function handleBubbleHover(event, d) {
        d3.select(event.currentTarget).select('.bubble')
            .transition()
            .duration(200)
            .attr('opacity', 1)
            .attr('stroke-width', (vizCurrentConfig.strokeWidth + 1));
        
        showTooltip(event, d);
    }

    function handleBubbleOut(event, d) {
        d3.select(event.currentTarget).select('.bubble')
            .transition()
            .duration(200)
            .attr('opacity', vizCurrentConfig.bubbleOpacity)
            .attr('stroke-width', vizCurrentConfig.strokeWidth);
        
        hideTooltip();
    }

    function handleBubbleClick(event, d) {
        if (window.OddVizApp?.showNotification) {
            const metricName = d.metric.replace(/_/g, ' ').toUpperCase();
            window.OddVizApp.showNotification(
                `${d.category} - ${metricName}: ${formatValue(d.value, d.metric)}`, 
                'info'
            );
        }
    }

    function showTooltip(event, d) {
        hideTooltip();
        
        const metricName = d.metric.replace(/_/g, ' ').toUpperCase();
        const percentage = ((d.value / d.maxValue) * 100).toFixed(1);
        
        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'viz-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0,0,0,0.9)')
            .style('color', 'white')
            .style('padding', '10px')
            .style('border-radius', '6px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .html(`
                <div style="font-weight: bold; margin-bottom: 4px;">${d.category}</div>
                <div style="margin-bottom: 2px;">${metricName}</div>
                <div>Valor: ${formatValue(d.value, d.metric)}</div>
                <div style="font-size: 10px; opacity: 0.8;">${percentage}% do máximo da coluna</div>
            `);
        
        tooltip.transition().duration(200).style('opacity', 1);
    }

    function hideTooltip() {
        d3.selectAll('.viz-tooltip').remove();
    }

    // ==========================================================================
    // FUNÇÕES DE ATUALIZAÇÃO
    // ==========================================================================

    function onUpdate(newConfig) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        console.log('🔄 Atualizando matriz de bolhas...');
        
        const specificConfig = readSpecificControlsFromHTML();
        const mergedConfig = createMergedConfig(newConfig, specificConfig);
        
        renderVisualization(vizCurrentData, mergedConfig);
    }

    function onBubbleMatrixControlUpdate(bubbleControls) {
        console.log('🫧 Controles matriz atualizados:', bubbleControls);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const mergedConfig = createMergedConfig(templateConfig, bubbleControls);
            renderVisualization(vizCurrentData, mergedConfig);
        }
    }

    function onSortingChange(sortBy, sortOrder) {
        console.log('📊 Ordenação alterada:', sortBy, sortOrder);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const specificConfig = readSpecificControlsFromHTML();
            specificConfig.sortBy = sortBy;
            specificConfig.sortOrder = sortOrder;
            
            const mergedConfig = createMergedConfig(templateConfig, specificConfig);
            renderVisualization(vizCurrentData, mergedConfig);
        }
    }

    function onColorModeChange(colorMode) {
        console.log('🎨 Modo de cor alterado:', colorMode);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const specificConfig = readSpecificControlsFromHTML();
            specificConfig.colorMode = colorMode;
            
            const mergedConfig = createMergedConfig(templateConfig, specificConfig);
            renderVisualization(vizCurrentData, mergedConfig);
        }
    }

    function onShowControlsChange(showControls) {
        console.log('👁️ Controles de exibição alterados:', showControls);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const specificConfig = readSpecificControlsFromHTML();
            Object.assign(specificConfig, showControls);
            
            const mergedConfig = createMergedConfig(templateConfig, specificConfig);
            renderVisualization(vizCurrentData, mergedConfig);
        }
    }

    function updateColorPalette(paletteType) {
        console.log('🎨 Paleta da matriz de bolhas atualizada:', paletteType);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            // Atualiza cores baseado na paleta
            let newColors;
            if (paletteType === 'odd') {
                newColors = ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165', '#FF6B6B'];
            } else if (paletteType === 'rainbow') {
                newColors = ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#0080FF', '#8000FF', '#FF69B4'];
            } else {
                newColors = BUBBLE_DEFAULTS.colors;
            }
            
            vizCurrentConfig.colors = newColors;
            renderVisualization(vizCurrentData, vizCurrentConfig);
        }
    }

    function onDataLoaded(processedData) {
        if (processedData && processedData.data) {
            console.log('📊 Novos dados carregados:', processedData.data.length + ' linhas');
            
            // ✅ CORRIGIDO: Atualiza dropdown ANTES de renderizar
            updateSortDropdown(processedData.data);
            
            // ✅ CORRIGIDO: Detecta estrutura e salva globalmente
            const structure = detectDataStructure(processedData.data);
            if (structure) {
                vizDataStructure = structure;
                console.log('📊 Estrutura detectada e salva:', structure);
            }
            
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const specificConfig = readSpecificControlsFromHTML();
            const mergedConfig = createMergedConfig(templateConfig, specificConfig);
            
            renderVisualization(processedData.data, mergedConfig);
        }
    }

    function updateSortDropdown(data) {
        const sortSelect = document.getElementById('sort-by');
        if (!sortSelect || !data || data.length === 0) return;
        
        const structure = detectDataStructure(data);
        if (!structure) return;
        
        // ✅ CORRIGIDO: Salva valor selecionado atual
        const currentValue = sortSelect.value;
        
        // Limpa opções atuais
        sortSelect.innerHTML = '<option value="original">Ordem Original</option>';
        
        // Adiciona opções para cada métrica
        structure.metricColumns.forEach(col => {
            const option = document.createElement('option');
            option.value = col;
            option.textContent = col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            sortSelect.appendChild(option);
        });
        
        // ✅ CORRIGIDO: Restaura valor selecionado se ainda existir
        if (currentValue && structure.metricColumns.includes(currentValue)) {
            sortSelect.value = currentValue;
        }
        
        console.log('📊 Dropdown de ordenação atualizado com', structure.metricColumns.length, 'opções');
        console.log('📊 Valor atual:', sortSelect.value);
    }

    // ==========================================================================
    // UTILITÁRIOS
    // ==========================================================================

    function showNoDataMessage() {
        if (!vizSvg) return;
        
        vizSvg.selectAll('*').remove();
        
        const config = vizCurrentConfig || BUBBLE_DEFAULTS;
        
        vizSvg.append('rect')
            .attr('class', 'svg-background')
            .attr('width', BUBBLE_MATRIX_SETTINGS.fixedWidth)
            .attr('height', BUBBLE_MATRIX_SETTINGS.fixedHeight)
            .attr('fill', config.backgroundColor || '#FFFFFF');
        
        const message = vizSvg.append('g')
            .attr('class', 'no-data-message')
            .attr('transform', `translate(${BUBBLE_MATRIX_SETTINGS.fixedWidth / 2}, ${BUBBLE_MATRIX_SETTINGS.fixedHeight / 2})`);
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-20px')
            .style('fill', config.textColor || '#2C3E50')
            .style('font-family', config.fontFamily || 'Inter')
            .style('font-size', '24px')
            .text('🫧');
        
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

    window.BubbleMatrixVisualization = {
        initVisualization: initVisualization,
        renderVisualization: renderVisualization,
        onUpdate: onUpdate,
        onBubbleMatrixControlUpdate: onBubbleMatrixControlUpdate,
        onSortingChange: onSortingChange,
        onColorModeChange: onColorModeChange,
        onShowControlsChange: onShowControlsChange,
        onDataLoaded: onDataLoaded,
        updateColorPalette: updateColorPalette,
        BUBBLE_MATRIX_SETTINGS: BUBBLE_MATRIX_SETTINGS
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

})();) || customUnit.startsWith('€')) {
                    formattedValue = customUnit + formattedValue;
                } else {
                    formattedValue = formattedValue + customUnit;
                }
            }
        }
        
        return formattedValue;
    }

    function renderColumnHeaders() {
        vizSvg.selectAll('.column-header').remove();
        
        if (!vizCurrentConfig.showColumnHeaders) return;
        
        const layout = vizLayoutInfo.matrix;
        const headers = vizLayoutInfo.headers;
        
        vizDataStructure.metricColumns.forEach((col, index) => {
            const x = layout.x + index * layout.cellWidth + layout.cellWidth / 2;
            const y = headers.y;
            
            // Nome da métrica
            const metricName = col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            vizSvg.append('text')
                .attr('class', 'column-header')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central') // ✅ CORRIGIDO: Centraliza verticalmente
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', ((vizCurrentConfig.labelSize || 12) + 1) + 'px')
                .style('font-weight', '600')
                .text(metricName);
        });
    }

    function renderRowLabels(sortedData, layout) {
        vizSvg.selectAll('.row-label').remove();
        
        if (!vizCurrentConfig.showRowLabels) return;
        
        const rowLabels = vizLayoutInfo.rowLabels;
        
        sortedData.forEach((row, index) => {
            const x = rowLabels.x;
            const y = layout.y + index * layout.cellHeight + layout.cellHeight / 2;
            
            const categoryName = row[vizDataStructure.categoryColumn];
            
            vizSvg.append('text')
                .attr('class', 'row-label')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', 'end')
                .attr('dominant-baseline', 'central')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', (vizCurrentConfig.labelSize || 12) + 'px')
                .style('font-weight', '500')
                .text(categoryName.length > 20 ? categoryName.substring(0, 20) + '...' : categoryName);
        });
    }

    function renderTitles() {
        vizSvg.selectAll('.chart-title-svg, .chart-subtitle-svg').remove();
        
        const layout = vizLayoutInfo.titles;
        
        if (vizCurrentConfig.title) {
            vizSvg.append('text')
                .attr('class', 'chart-title-svg')
                .attr('x', BUBBLE_MATRIX_SETTINGS.fixedWidth / 2)
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
                .attr('x', BUBBLE_MATRIX_SETTINGS.fixedWidth / 2)
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
                .attr('x', BUBBLE_MATRIX_SETTINGS.fixedWidth / 2)
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
    // INTERAÇÕES
    // ==========================================================================

    function setupBubbleInteractions(cellGroups) {
        cellGroups
            .on('mouseover', handleBubbleHover)
            .on('mouseout', handleBubbleOut)
            .on('click', handleBubbleClick);
    }

    function handleBubbleHover(event, d) {
        d3.select(event.currentTarget).select('.bubble')
            .transition()
            .duration(200)
            .attr('opacity', 1)
            .attr('stroke-width', (vizCurrentConfig.strokeWidth + 1));
        
        showTooltip(event, d);
    }

    function handleBubbleOut(event, d) {
        d3.select(event.currentTarget).select('.bubble')
            .transition()
            .duration(200)
            .attr('opacity', vizCurrentConfig.bubbleOpacity)
            .attr('stroke-width', vizCurrentConfig.strokeWidth);
        
        hideTooltip();
    }

    function handleBubbleClick(event, d) {
        if (window.OddVizApp?.showNotification) {
            const metricName = d.metric.replace(/_/g, ' ').toUpperCase();
            window.OddVizApp.showNotification(
                `${d.category} - ${metricName}: ${formatValue(d.value, d.metric)}`, 
                'info'
            );
        }
    }

    function showTooltip(event, d) {
        hideTooltip();
        
        const metricName = d.metric.replace(/_/g, ' ').toUpperCase();
        const percentage = ((d.value / d.maxValue) * 100).toFixed(1);
        
        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'viz-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0,0,0,0.9)')
            .style('color', 'white')
            .style('padding', '10px')
            .style('border-radius', '6px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .html(`
                <div style="font-weight: bold; margin-bottom: 4px;">${d.category}</div>
                <div style="margin-bottom: 2px;">${metricName}</div>
                <div>Valor: ${formatValue(d.value, d.metric)}</div>
                <div style="font-size: 10px; opacity: 0.8;">${percentage}% do máximo da coluna</div>
            `);
        
        tooltip.transition().duration(200).style('opacity', 1);
    }

    function hideTooltip() {
        d3.selectAll('.viz-tooltip').remove();
    }

    // ==========================================================================
    // FUNÇÕES DE ATUALIZAÇÃO
    // ==========================================================================

    function onUpdate(newConfig) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        console.log('🔄 Atualizando matriz de bolhas...');
        
        const specificConfig = readSpecificControlsFromHTML();
        const mergedConfig = createMergedConfig(newConfig, specificConfig);
        
        renderVisualization(vizCurrentData, mergedConfig);
    }

    function onBubbleMatrixControlUpdate(bubbleControls) {
        console.log('🫧 Controles matriz atualizados:', bubbleControls);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const mergedConfig = createMergedConfig(templateConfig, bubbleControls);
            renderVisualization(vizCurrentData, mergedConfig);
        }
    }

    function onSortingChange(sortBy, sortOrder) {
        console.log('📊 Ordenação alterada:', sortBy, sortOrder);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const specificConfig = readSpecificControlsFromHTML();
            specificConfig.sortBy = sortBy;
            specificConfig.sortOrder = sortOrder;
            
            const mergedConfig = createMergedConfig(templateConfig, specificConfig);
            renderVisualization(vizCurrentData, mergedConfig);
        }
    }

    function onColorModeChange(colorMode) {
        console.log('🎨 Modo de cor alterado:', colorMode);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const specificConfig = readSpecificControlsFromHTML();
            specificConfig.colorMode = colorMode;
            
            const mergedConfig = createMergedConfig(templateConfig, specificConfig);
            renderVisualization(vizCurrentData, mergedConfig);
        }
    }

    function onShowControlsChange(showControls) {
        console.log('👁️ Controles de exibição alterados:', showControls);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const specificConfig = readSpecificControlsFromHTML();
            Object.assign(specificConfig, showControls);
            
            const mergedConfig = createMergedConfig(templateConfig, specificConfig);
            renderVisualization(vizCurrentData, mergedConfig);
        }
    }

    function updateColorPalette(paletteType) {
        console.log('🎨 Paleta da matriz de bolhas atualizada:', paletteType);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            // Atualiza cores baseado na paleta
            let newColors;
            if (paletteType === 'odd') {
                newColors = ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165', '#FF6B6B'];
            } else if (paletteType === 'rainbow') {
                newColors = ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#0080FF', '#8000FF', '#FF69B4'];
            } else {
                newColors = BUBBLE_DEFAULTS.colors;
            }
            
            vizCurrentConfig.colors = newColors;
            renderVisualization(vizCurrentData, vizCurrentConfig);
        }
    }

    function onDataLoaded(processedData) {
        if (processedData && processedData.data) {
            console.log('📊 Novos dados carregados:', processedData.data.length + ' linhas');
            
            // ✅ CORRIGIDO: Atualiza dropdown ANTES de renderizar
            updateSortDropdown(processedData.data);
            
            // ✅ CORRIGIDO: Detecta estrutura e salva globalmente
            const structure = detectDataStructure(processedData.data);
            if (structure) {
                vizDataStructure = structure;
                console.log('📊 Estrutura detectada e salva:', structure);
            }
            
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const specificConfig = readSpecificControlsFromHTML();
            const mergedConfig = createMergedConfig(templateConfig, specificConfig);
            
            renderVisualization(processedData.data, mergedConfig);
        }
    }

    function updateSortDropdown(data) {
        const sortSelect = document.getElementById('sort-by');
        if (!sortSelect || !data || data.length === 0) return;
        
        const structure = detectDataStructure(data);
        if (!structure) return;
        
        // ✅ CORRIGIDO: Salva valor selecionado atual
        const currentValue = sortSelect.value;
        
        // Limpa opções atuais
        sortSelect.innerHTML = '<option value="original">Ordem Original</option>';
        
        // Adiciona opções para cada métrica
        structure.metricColumns.forEach(col => {
            const option = document.createElement('option');
            option.value = col;
            option.textContent = col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            sortSelect.appendChild(option);
        });
        
        // ✅ CORRIGIDO: Restaura valor selecionado se ainda existir
        if (currentValue && structure.metricColumns.includes(currentValue)) {
            sortSelect.value = currentValue;
        }
        
        console.log('📊 Dropdown de ordenação atualizado com', structure.metricColumns.length, 'opções');
        console.log('📊 Valor atual:', sortSelect.value);
    }

    // ==========================================================================
    // UTILITÁRIOS
    // ==========================================================================

    function showNoDataMessage() {
        if (!vizSvg) return;
        
        vizSvg.selectAll('*').remove();
        
        const config = vizCurrentConfig || BUBBLE_DEFAULTS;
        
        vizSvg.append('rect')
            .attr('class', 'svg-background')
            .attr('width', BUBBLE_MATRIX_SETTINGS.fixedWidth)
            .attr('height', BUBBLE_MATRIX_SETTINGS.fixedHeight)
            .attr('fill', config.backgroundColor || '#FFFFFF');
        
        const message = vizSvg.append('g')
            .attr('class', 'no-data-message')
            .attr('transform', `translate(${BUBBLE_MATRIX_SETTINGS.fixedWidth / 2}, ${BUBBLE_MATRIX_SETTINGS.fixedHeight / 2})`);
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-20px')
            .style('fill', config.textColor || '#2C3E50')
            .style('font-family', config.fontFamily || 'Inter')
            .style('font-size', '24px')
            .text('🫧');
        
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

    window.BubbleMatrixVisualization = {
        initVisualization: initVisualization,
        renderVisualization: renderVisualization,
        onUpdate: onUpdate,
        onBubbleMatrixControlUpdate: onBubbleMatrixControlUpdate,
        onSortingChange: onSortingChange,
        onColorModeChange: onColorModeChange,
        onShowControlsChange: onShowControlsChange,
        onDataLoaded: onDataLoaded,
        updateColorPalette: updateColorPalette,
        BUBBLE_MATRIX_SETTINGS: BUBBLE_MATRIX_SETTINGS
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
