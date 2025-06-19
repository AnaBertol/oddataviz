/**
 * MATRIZ DE BOLHAS - VERSÃO CORRIGIDA COM CORES PERSISTENTES
 * Sistema integrado com Template Controls e cores que não resetam
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURAÇÕES CENTRALIZADAS
    // ==========================================================================

    const BUBBLE_MATRIX_SETTINGS = {
        fixedWidth: 800,
        fixedHeight: 600,
        margins: { top: 60, right: 60, bottom: 60, left: 60 },
        animationDuration: 800,
        staggerDelay: 50
    };

    const BUBBLE_DEFAULTS = {
        minBubbleSize: 12,
        maxBubbleSize: 50,
        cellWidth: 120,
        cellHeight: 80,
        bubbleOpacity: 0.9,
        strokeWidth: 1,
        bubbleStroke: true,
        colorMode: 'by-column',
        sortBy: 'original',
        sortOrder: 'desc',
        showColumnHeaders: true,
        showRowLabels: true,
        showValues: true,
        colors: ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165']
    };

    // ==========================================================================
    // VARIÁVEIS PRIVADAS
    // ==========================================================================

    let vizSvg = null;
    let vizChartGroup = null;
    let vizCurrentData = null;
    let vizCurrentConfig = null;
    let vizDataStructure = null;

    // ✅ ESTADO DAS CORES SEPARADO E PERSISTENTE
    let vizColorState = {
        currentPalette: 'odd',
        customColors: null,
        isCustomActive: false
    };

    // ==========================================================================
    // INICIALIZAÇÃO
    // ==========================================================================

    function initVisualization() {
        if (typeof d3 === 'undefined') {
            console.error('D3.js não está carregado!');
            return;
        }
        
        console.log('🫧 Inicializando Matriz de Bolhas com Template Controls...');
        
        // Define largura para o sistema de quebra de texto
        if (window.OddVizTemplateControls?.setVisualizationWidth) {
            window.OddVizTemplateControls.setVisualizationWidth(BUBBLE_MATRIX_SETTINGS.fixedWidth, 'wide');
        }
        
        createBaseSVG();
        
        setTimeout(() => {
            loadSampleData();
        }, 150);
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

    function loadSampleData() {
        if (window.getSampleData && typeof window.getSampleData === 'function') {
            const sampleData = window.getSampleData();
            if (sampleData && sampleData.data) {
                console.log('📊 Carregando dados de exemplo...');
                
                updateDataPreview(sampleData.data);
                updateSortDropdown(sampleData.data);
                
                const templateConfig = window.OddVizTemplateControls?.getState() || {};
                const mergedConfig = createMergedConfig(templateConfig);
                
                renderVisualization(sampleData.data, mergedConfig);
            }
        }
    }

    // ==========================================================================
    // DETECÇÃO AUTOMÁTICA DA ESTRUTURA DOS DADOS
    // ==========================================================================

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
        
        console.log('📊 Estrutura detectada:', {
            categoria: categoryColumn,
            metricas: metricColumns
        });
        
        return {
            categoryColumn: categoryColumn,
            metricColumns: metricColumns,
            allColumns: allColumns
        };
    }

    // ==========================================================================
    // CONFIGURAÇÃO INTEGRADA COM TEMPLATE CONTROLS - CORRIGIDA
    // ==========================================================================

    function createMergedConfig(templateConfig) {
        const mergedConfig = Object.assign({}, BUBBLE_DEFAULTS);
        
        // Integra configurações do Template Controls
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
                valueSize: templateConfig.valueSize,
                showColumnHeaders: templateConfig.showColumnHeaders !== undefined ? templateConfig.showColumnHeaders : BUBBLE_DEFAULTS.showColumnHeaders,
                showRowLabels: templateConfig.showRowLabels !== undefined ? templateConfig.showRowLabels : BUBBLE_DEFAULTS.showRowLabels,
                showValues: templateConfig.showValues !== undefined ? templateConfig.showValues : BUBBLE_DEFAULTS.showValues
            });
        }
        
        // Integra configurações específicas da matriz de bolhas
        const specificConfig = readSpecificControlsFromHTML();
        if (specificConfig) {
            Object.assign(mergedConfig, specificConfig);
        }
        
        // ✅ CORREÇÃO PRINCIPAL: Preserva cores do estado atual
        mergedConfig.colors = getCurrentColors();
        
        console.log('🔧 Config mesclada criada, cores preservadas:', mergedConfig.colors);
        
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
            sortOrder: document.getElementById('sort-order')?.value || BUBBLE_DEFAULTS.sortOrder
        };
    }

    // ✅ NOVA FUNÇÃO: Obtém cores atuais baseadas no estado
    function getCurrentColors() {
        if (vizColorState.isCustomActive && vizColorState.customColors) {
            return vizColorState.customColors;
        }
        
        // Integração com Template Controls
        if (window.OddVizTemplateControls?.getCurrentColorPalette) {
            return window.OddVizTemplateControls.getCurrentColorPalette();
        }
        
        // Fallback baseado no estado interno
        switch (vizColorState.currentPalette) {
            case 'rainbow':
                return ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#0080FF', '#8000FF'];
            case 'odd':
            default:
                return ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'];
        }
    }

    // ==========================================================================
    // PROCESSAMENTO DE DADOS
    // ==========================================================================

    function processDataForBubbleMatrix(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { processedData: [], structure: null };
        }
        
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
        
        return { 
            processedData: processedData, 
            structure: structure,
            columnMaxes: columnMaxes
        };
    }

    function sortDataByColumn(data, structure, sortBy, sortOrder) {
        if (sortBy === 'original' || !structure.metricColumns.includes(sortBy)) {
            return data;
        }
        
        return [...data].sort((a, b) => {
            const valueA = a[sortBy];
            const valueB = b[sortBy];
            
            if (sortOrder === 'asc') {
                return valueA - valueB;
            } else {
                return valueB - valueA;
            }
        });
    }

    // ==========================================================================
    // CÁLCULO DE LAYOUT INTELIGENTE
    // ==========================================================================

    function calculateLayout(config, structure, dataLength) {
        const margins = BUBBLE_MATRIX_SETTINGS.margins;
        const availableWidth = BUBBLE_MATRIX_SETTINGS.fixedWidth - margins.left - margins.right;
        
        // USA TEMPLATE CONTROLS para calcular altura dos títulos
        let titlesHeight = 50;
        if (window.OddVizTemplateControls?.calculateTitlesHeight) {
            titlesHeight = window.OddVizTemplateControls.calculateTitlesHeight(config, BUBBLE_MATRIX_SETTINGS.fixedWidth);
        }
        
        // Ajusta layout baseado na exibição dos rótulos das linhas
        const rowLabelWidth = config.showRowLabels ? 120 : 0;
        const matrixAreaWidth = availableWidth - rowLabelWidth;
        
        // Dimensões das células
        const numColumns = structure.metricColumns.length;
        const numRows = dataLength;
        
        const cellWidth = Math.min(config.cellWidth || 120, matrixAreaWidth / numColumns);
        const cellHeight = Math.min(config.cellHeight || 80, 300 / numRows);
        
        // Posicionamento da matriz
        const matrixWidth = cellWidth * numColumns;
        const matrixHeight = cellHeight * numRows;
        
        // Centralização inteligente: considera rótulos das linhas
        const totalContentWidth = rowLabelWidth + matrixWidth;
        const matrixX = margins.left + rowLabelWidth + (availableWidth - totalContentWidth) / 2;
        const matrixY = titlesHeight + 40;
        
        return {
            margins: margins,
            availableWidth: availableWidth,
            titlesHeight: titlesHeight,
            
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
                y: matrixY - 25,
                show: config.showColumnHeaders
            },
            
            rowLabels: {
                x: matrixX - 20,
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
        const { processedData, structure, columnMaxes } = result;
        vizDataStructure = structure;
        
        if (!processedData || processedData.length === 0 || !structure) {
            showNoDataMessage();
            return;
        }
        
        // Aplica ordenação
        const sortedData = sortDataByColumn(processedData, structure, config.sortBy, config.sortOrder);
        
        // Calcula layout
        const layoutInfo = calculateLayout(config, structure, sortedData.length);
        
        // Atualiza SVG
        updateSVGDimensions(config);
        
        // USA TEMPLATE CONTROLS para renderizar títulos com quebra automática
        if (window.OddVizTemplateControls?.renderTitlesWithWrap) {
            window.OddVizTemplateControls.renderTitlesWithWrap(vizSvg, config, {
                width: BUBBLE_MATRIX_SETTINGS.fixedWidth,
                height: BUBBLE_MATRIX_SETTINGS.fixedHeight,
                startY: 50
            });
        }
        
        // Renderiza matriz de bolhas
        renderBubbleMatrix(sortedData, columnMaxes, layoutInfo);
        
        console.log('🎨 Matriz de bolhas renderizada:', sortedData.length + ' linhas');
    }

    function updateSVGDimensions(config) {
        if (!vizSvg) return;
        
        vizSvg.attr('width', BUBBLE_MATRIX_SETTINGS.fixedWidth)
              .attr('height', BUBBLE_MATRIX_SETTINGS.fixedHeight);
        
        vizSvg.selectAll('.svg-background').remove();
        
        vizSvg.insert('rect', ':first-child')
            .attr('class', 'svg-background')
            .attr('width', BUBBLE_MATRIX_SETTINGS.fixedWidth)
            .attr('height', BUBBLE_MATRIX_SETTINGS.fixedHeight)
            .attr('fill', config.backgroundColor || '#FFFFFF');
    }

    function renderBubbleMatrix(sortedData, columnMaxes, layoutInfo) {
        // Limpa elementos antigos
        vizChartGroup.selectAll('*').remove();
        vizSvg.selectAll('.row-label, .column-header').remove();
        
        const layout = layoutInfo.matrix;
        const structure = vizDataStructure;
        
        // Cria escala de tamanho para as bolhas
        const bubbleSizeScale = d3.scaleSqrt()
            .domain([0, 1])
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
        
        // Renderiza valores nas bolhas
        if (vizCurrentConfig.showValues) {
            renderBubbleValues(cellGroups, layout);
        }
        
        // Renderiza headers das colunas
        renderColumnHeaders(layoutInfo);
        
        // Renderiza rótulos das linhas
        renderRowLabels(sortedData, layoutInfo);
        
        // Adiciona interações
        setupBubbleInteractions(cellGroups);
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
            .text(d => formatValue(d.value));
    }

    function renderColumnHeaders(layoutInfo) {
        if (!vizCurrentConfig.showColumnHeaders) return;
        
        const layout = layoutInfo.matrix;
        const headers = layoutInfo.headers;
        
        vizDataStructure.metricColumns.forEach((col, index) => {
            const x = layout.x + index * layout.cellWidth + layout.cellWidth / 2;
            const y = headers.y;
            
            const metricName = col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            vizSvg.append('text')
                .attr('class', 'column-header')
                .attr('x', x)
                .attr('y', y)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', ((vizCurrentConfig.labelSize || 12) + 1) + 'px')
                .style('font-weight', '600')
                .text(metricName);
        });
    }

    function renderRowLabels(sortedData, layoutInfo) {
        if (!vizCurrentConfig.showRowLabels) return;
        
        const layout = layoutInfo.matrix;
        const rowLabels = layoutInfo.rowLabels;
        
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

    // ==========================================================================
    // UTILITÁRIOS
    // ==========================================================================

    function getContrastColor(hexColor) {
        const hex = hexColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    function formatValue(value) {
        if (value === 0) return '0';
        
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'k';
        } else if (value >= 10) {
            return value.toFixed(0);
        } else {
            return value.toFixed(1);
        }
    }

    function updateDataPreview(data) {
        const previewElement = document.getElementById('data-preview');
        if (!previewElement || !data || !Array.isArray(data)) return;
        
        if (data.length === 0) {
            previewElement.innerHTML = '<p class="data-placeholder">Nenhum dado carregado</p>';
            return;
        }
        
        const firstRow = data[0];
        const columns = Object.keys(firstRow);
        
        let tableHTML = '<div class="data-table-wrapper"><table class="data-table">';
        
        // Header
        tableHTML += '<thead><tr>';
        columns.forEach(col => {
            const displayName = col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            tableHTML += `<th>${displayName}</th>`;
        });
        tableHTML += '</tr></thead>';
        
        // Primeiras 5 linhas
        tableHTML += '<tbody>';
        const rowsToShow = Math.min(5, data.length);
        for (let i = 0; i < rowsToShow; i++) {
            tableHTML += '<tr>';
            columns.forEach(col => {
                const value = data[i][col];
                tableHTML += `<td>${value}</td>`;
            });
            tableHTML += '</tr>';
        }
        
        if (data.length > 5) {
            tableHTML += `<tr><td colspan="${columns.length}" class="more-rows">... e mais ${data.length - 5} linhas</td></tr>`;
        }
        
        tableHTML += '</tbody></table></div>';
        
        previewElement.innerHTML = tableHTML;
    }

    function updateSortDropdown(data) {
        const sortSelect = document.getElementById('sort-by');
        if (!sortSelect || !data || data.length === 0) return;
        
        const structure = detectDataStructure(data);
        if (!structure) return;
        
        sortSelect.innerHTML = '<option value="original">Ordem Original</option>';
        
        structure.metricColumns.forEach(col => {
            const option = document.createElement('option');
            option.value = col;
            option.textContent = col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            sortSelect.appendChild(option);
        });
    }

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
                `${d.category} - ${metricName}: ${formatValue(d.value)}`, 
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
                <div>Valor: ${formatValue(d.value)}</div>
                <div style="font-size: 10px; opacity: 0.8;">${percentage}% do máximo da coluna</div>
            `);
        
        tooltip.transition().duration(200).style('opacity', 1);
    }

    function hideTooltip() {
        d3.selectAll('.viz-tooltip').remove();
    }

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
    // FUNÇÕES DE ATUALIZAÇÃO - CORRIGIDAS
    // ==========================================================================

    function onUpdate(newConfig) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        console.log('🔄 Atualizando matriz de bolhas via Template Controls...');
        
        const mergedConfig = createMergedConfig(newConfig);
        renderVisualization(vizCurrentData, mergedConfig);
    }

    // ✅ NOVA FUNÇÃO: Atualização apenas de controles específicos
    function onSpecificControlsUpdate(specificConfig) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        console.log('🔄 Atualizando controles específicos, preservando cores...');
        
        // Atualiza apenas as propriedades específicas sem mexer nas cores
        if (vizCurrentConfig) {
            Object.assign(vizCurrentConfig, specificConfig);
            renderVisualization(vizCurrentData, vizCurrentConfig);
        }
    }

    // ✅ NOVA FUNÇÃO: Atualização apenas de controles de exibição
    function onDisplayControlChange(controlName, value) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        console.log(`🔄 Alterando ${controlName}: ${value}`);
        
        if (vizCurrentConfig) {
            vizCurrentConfig[controlName] = value;
            renderVisualization(vizCurrentData, vizCurrentConfig);
        }
    }

    function onDataLoaded(processedData) {
        if (processedData && processedData.data) {
            console.log('📊 Novos dados carregados:', processedData.data.length + ' linhas');
            
            updateSortDropdown(processedData.data);
            updateDataPreview(processedData.data);
            
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const mergedConfig = createMergedConfig(templateConfig);
            
            renderVisualization(processedData.data, mergedConfig);
        }
    }

    function updateColorPalette(paletteType) {
        console.log('🎨 Paleta da matriz de bolhas atualizada:', paletteType);
        
        // ✅ ATUALIZA ESTADO DAS CORES
        vizColorState.currentPalette = paletteType;
        vizColorState.isCustomActive = (paletteType === 'custom');
        
        // Se não é custom, limpa cores customizadas
        if (paletteType !== 'custom') {
            vizColorState.customColors = null;
        }
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            // Atualiza config atual e re-renderiza
            if (vizCurrentConfig) {
                vizCurrentConfig.colors = getCurrentColors();
                renderVisualization(vizCurrentData, vizCurrentConfig);
            }
        }
    }

    function updateCustomColors(customColors) {
        console.log('🎨 Cores personalizadas da matriz atualizadas:', customColors);
        
        // ✅ ATUALIZA ESTADO DAS CORES
        vizColorState.customColors = customColors;
        vizColorState.isCustomActive = true;
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            // Atualiza config atual e re-renderiza
            if (vizCurrentConfig) {
                vizCurrentConfig.colors = customColors;
                renderVisualization(vizCurrentData, vizCurrentConfig);
            }
        }
    }

    // ==========================================================================
    // EXPORTAÇÕES GLOBAIS
    // ==========================================================================

    window.BubbleMatrixVisualization = {
        initVisualization: initVisualization,
        renderVisualization: renderVisualization,
        onUpdate: onUpdate,
        onSpecificControlsUpdate: onSpecificControlsUpdate,  // ✅ NOVA
        onDisplayControlChange: onDisplayControlChange,      // ✅ NOVA
        onDataLoaded: onDataLoaded,
        updateColorPalette: updateColorPalette,
        updateCustomColors: updateCustomColors,
        BUBBLE_MATRIX_SETTINGS: BUBBLE_MATRIX_SETTINGS
    };

    window.initVisualization = initVisualization;
    window.onDataLoaded = onDataLoaded;

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