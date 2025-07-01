/**
 * MATRIZ DE MÚLTIPLA ESCOLHA - VERSÃO CORRIGIDA
 * ✅ Com quebra automática de títulos, preview de dados, processamento flexível, paleta inteligente e tooltips informativos
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
        elementSize: 70,
        elementSpacingH: 20,
        elementSpacingV: 20,
        alignment: 'bottom-left',
        borderRadius: 4,
        showAnimation: false,
        showValues: true,
        showCategoryLabels: true,
        showGroupLabels: true,
        matrixOrientation: 'groups-top',
        categoryLabelWidth: 180
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
    // INICIALIZAÇÃO CORRIGIDA
    // ==========================================================================

    function initVisualization() {
        if (typeof d3 === 'undefined') {
            console.error('D3.js não está carregado!');
            return;
        }
        
        console.log('⬜ Inicializando Matriz de Múltipla Escolha com Template Controls...');
        
        // ✅ CORREÇÃO 1: Define largura para Template Controls (quebra automática)
        if (window.OddVizTemplateControls?.setVisualizationWidth) {
            window.OddVizTemplateControls.setVisualizationWidth(MATRIX_SETTINGS.fixedWidth, 'wide');
        }
        
        createBaseSVG();
        
        // Carrega dados de exemplo após breve delay
        setTimeout(loadSampleData, 100);
    }

    function loadSampleData() {
        // ✅ CORREÇÃO: Carrega dados de comparação por padrão
        if (window.getSampleComparisonData && typeof window.getSampleComparisonData === 'function') {
            const sampleData = window.getSampleComparisonData();
            if (sampleData && sampleData.data) {
                console.log('📊 Carregando dados de comparação por padrão...');
                
                // ✅ CORREÇÃO 2: Atualiza preview de dados no primeiro carregamento
                updateDataPreview(sampleData.data);
                
                const templateConfig = window.OddVizTemplateControls?.getState() || {};
                const specificConfig = window.MatrixChoiceVizConfig?.currentConfig || {};
                const mergedConfig = createMergedConfig(templateConfig, specificConfig);
                
                renderVisualization(sampleData.data, mergedConfig);
                return;
            }
        }
        
        // Fallback para dados simples se não conseguir carregar os de comparação
        if (window.getSampleData && typeof window.getSampleData === 'function') {
            const sampleData = window.getSampleData();
            if (sampleData && sampleData.data) {
                console.log('📊 Carregando dados simples como fallback...');
                
                // ✅ CORREÇÃO 2: Atualiza preview de dados no primeiro carregamento
                updateDataPreview(sampleData.data);
                
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
    // ✅ CORREÇÃO 3: FUNÇÃO PARA ATUALIZAR PREVIEW DE DADOS
    // ==========================================================================

    function updateDataPreview(data) {
        const previewContainer = document.getElementById('data-preview');
        if (!previewContainer || !data || !Array.isArray(data)) return;
        
        console.log('📋 Atualizando preview de dados da matriz...');
        
        const maxRows = 5;
        const displayData = data.slice(0, maxRows);
        
        if (displayData.length === 0) {
            previewContainer.innerHTML = '<p class="data-placeholder">Nenhum dado disponível</p>';
            return;
        }
        
        // Cria tabela de preview
        let tableHTML = '<div class="preview-table-wrapper"><table class="preview-table">';
        
        // Cabeçalhos
        const headers = Object.keys(displayData[0]);
        tableHTML += '<thead><tr>';
        headers.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });
        tableHTML += '</tr></thead>';
        
        // Dados
        tableHTML += '<tbody>';
        displayData.forEach(row => {
            tableHTML += '<tr>';
            headers.forEach(header => {
                const value = row[header];
                const displayValue = typeof value === 'number' ? 
                    (value % 1 === 0 ? value.toString() : value.toFixed(2)) : 
                    value;
                tableHTML += `<td>${displayValue}</td>`;
            });
            tableHTML += '</tr>';
        });
        tableHTML += '</tbody></table>';
        
        // Rodapé se houver mais dados
        if (data.length > maxRows) {
            tableHTML += `<p class="preview-footer">Mostrando ${maxRows} de ${data.length} linhas</p>`;
        }
        
        tableHTML += '</div>';
        previewContainer.innerHTML = tableHTML;
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
            elementSpacingH: parseInt(document.getElementById('element-spacing-h')?.value) || MATRIX_DEFAULTS.elementSpacingH,
            elementSpacingV: parseInt(document.getElementById('element-spacing-v')?.value) || MATRIX_DEFAULTS.elementSpacingV,
            alignment: document.querySelector('.alignment-option.active')?.dataset.align || MATRIX_DEFAULTS.alignment,
            borderRadius: parseFloat(document.getElementById('border-radius')?.value) || MATRIX_DEFAULTS.borderRadius,
            showAnimation: document.getElementById('show-animation')?.checked || MATRIX_DEFAULTS.showAnimation,
            backgroundShapeColor: document.getElementById('background-shape-color')?.value || MATRIX_DEFAULTS.backgroundShapeColor,
            matrixOrientation: document.querySelector('.orientation-option.active')?.dataset.orientation || MATRIX_DEFAULTS.matrixOrientation,
            
            showValues: document.getElementById('show-values')?.checked !== false,
            showCategoryLabels: document.getElementById('show-category-labels')?.checked !== false,
            showGroupLabels: document.getElementById('show-group-labels')?.checked !== false,
            
            colors: window.MatrixChoiceVizConfig?.currentConfig?.colors || MATRIX_DEFAULTS.colors
        };
    }

    // ==========================================================================
    // ✅ CORREÇÃO 4: DETECÇÃO AUTOMÁTICA DE ESTRUTURA DE DADOS
    // ==========================================================================

    function detectDataMode(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return 'simple';
        }
        
        // ✅ DETECÇÃO AUTOMÁTICA: Funciona com qualquer nome de coluna
        const firstRow = data[0];
        const columns = Object.keys(firstRow);
        
        if (columns.length < 2) {
            console.warn('Dados insuficientes: necessário pelo menos 2 colunas');
            return 'simple';
        }
        
        // Se tem mais de 2 colunas, assume modo comparação
        if (columns.length > 2) {
            console.log(`📊 Modo comparação detectado: ${columns.length} colunas`);
            return 'comparison';
        }
        
        // Se tem exatamente 2 colunas, assume modo simples
        console.log('📊 Modo simples detectado: 2 colunas');
        return 'simple';
    }

    // ==========================================================================
    // ✅ CORREÇÃO 5: PROCESSAMENTO FLEXÍVEL DE DADOS
    // ==========================================================================

    function processDataForMatrix(rawData, mode) {
        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
            return { processedData: [], mode: 'simple' };
        }
        
        // ✅ DETECÇÃO AUTOMÁTICA: Funciona com qualquer nome de coluna
        const firstRow = rawData[0];
        const columns = Object.keys(firstRow);
        
        if (columns.length < 2) {
            console.warn('Dados insuficientes para matriz: necessário pelo menos 2 colunas');
            return { processedData: [], mode: 'simple' };
        }
        
        // Assume primeira coluna como categoria/parâmetro
        const categoryColumn = columns[0];
        console.log(`📊 Processando matriz: categoria='${categoryColumn}'`);
        
        if (mode === 'simple') {
            // Para modo simples, segunda coluna é o valor
            const valueColumn = columns[1];
            console.log(`📊 Modo simples: valor='${valueColumn}'`);
            
            return {
                processedData: rawData.map(d => ({
                    categoria: String(d[categoryColumn] || ''),
                    valor: Math.min(100, Math.max(0, parseFloat(d[valueColumn]) || 0))
                })).filter(d => d.categoria),
                mode: 'simple'
            };
        } else {
            // Para modo comparação, demais colunas são grupos
            const groupColumns = columns.slice(1); // Todas exceto a primeira
            console.log(`📊 Modo comparação: grupos=[${groupColumns.join(', ')}]`);
            
            const processedData = rawData.map(d => {
                const processed = { categoria: String(d[categoryColumn] || '') };
                groupColumns.forEach(group => {
                    processed[group] = Math.min(100, Math.max(0, parseFloat(d[group]) || 0));
                });
                return processed;
            }).filter(d => d.categoria);
            
            return {
                processedData: processedData,
                groups: groupColumns,
                mode: 'comparison'
            };
        }
    }

    // ==========================================================================
    // CÁLCULO DE LAYOUT - USANDO TEMPLATE CONTROLS
    // ==========================================================================

    function calculateLayout(config, data, mode) {
        const margins = MATRIX_SETTINGS.margins;
        const spacing = MATRIX_SETTINGS.spacing;
        
        let availableWidth = MATRIX_SETTINGS.fixedWidth - margins.left - margins.right;
        let availableHeight = MATRIX_SETTINGS.fixedHeight - margins.top - margins.bottom;
        
        // ✅ CORREÇÃO 6: Usa Template Controls para calcular altura dos títulos
        let titleHeight = 50; // Valor padrão seguro
        if (window.OddVizTemplateControls?.calculateTitlesHeight) {
            titleHeight = window.OddVizTemplateControls.calculateTitlesHeight(config, MATRIX_SETTINGS.fixedWidth);
        }
        
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
        const elementSpacingH = config.elementSpacingH || MATRIX_DEFAULTS.elementSpacingH;
        const elementSpacingV = config.elementSpacingV || MATRIX_DEFAULTS.elementSpacingV;
        const labelHeight = config.showCategoryLabels ? 25 : 0;
        
        const numElements = data.length;
        
        let bestGrid = { cols: Math.ceil(Math.sqrt(numElements)), rows: Math.ceil(numElements / Math.ceil(Math.sqrt(numElements))) };
        let bestFit = 0;
        
        for (let cols = 1; cols <= numElements; cols++) {
            const rows = Math.ceil(numElements / cols);
            const gridWidth = (elementSize * cols) + (elementSpacingH * (cols - 1));
            const gridHeight = (elementSize * rows) + (elementSpacingV * (rows - 1)) + labelHeight;
            
            if (gridWidth <= availableWidth && gridHeight <= (chartAreaHeight - 20)) {
                const fit = (gridWidth / availableWidth) * (gridHeight / (chartAreaHeight - 20));
                if (fit > bestFit) {
                    bestFit = fit;
                    bestGrid = { cols, rows };
                }
            }
        }
        
        const gridWidth = (elementSize * bestGrid.cols) + (elementSpacingH * (bestGrid.cols - 1));
        const gridHeight = (elementSize * bestGrid.rows) + (elementSpacingV * (bestGrid.rows - 1)) + labelHeight;
        
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
                elementSpacingH: elementSpacingH,
                elementSpacingV: elementSpacingV,
                labelHeight: labelHeight
            }
        };
    }

    function calculateComparisonLayoutOptimized(config, data, chartAreaHeight, availableWidth, margins, titleHeight) {
        const elementSize = config.elementSize || MATRIX_DEFAULTS.elementSize;
        const elementSpacingH = config.elementSpacingH || MATRIX_DEFAULTS.elementSpacingH;
        const elementSpacingV = config.elementSpacingV || MATRIX_DEFAULTS.elementSpacingV;
        const orientation = config.matrixOrientation || MATRIX_DEFAULTS.matrixOrientation;
        
        const groups = Object.keys(data[0]).filter(key => key !== 'categoria');
        const categories = data.length;
        
        let matrixCols, matrixRows, groupLabelHeight;
        
        if (orientation === 'groups-top') {
            matrixCols = groups.length;
            matrixRows = categories;
            groupLabelHeight = config.showGroupLabels ? 20 : 0;
        } else {
            matrixCols = categories;
            matrixRows = groups.length;
            groupLabelHeight = config.showCategoryLabels ? 20 : 0;
        }
        
        // ✅ CORREÇÃO: Usa cálculo dinâmico da largura dos rótulos
        const categoryLabelWidth = calculateActualLabelWidth(data, config, orientation);
        
        const matrixWidth = (elementSize * matrixCols) + (elementSpacingH * (matrixCols - 1));
        const matrixHeight = (elementSize * matrixRows) + (elementSpacingV * (matrixRows - 1));
        
        const totalWidth = categoryLabelWidth + matrixWidth;
        const totalHeight = groupLabelHeight + matrixHeight;
        
        // ✅ MELHORIA: Centralização mais inteligente
        const availableWidthForContent = availableWidth - 40; // Reserva 20px de cada lado
        const contentStartX = margins.left + Math.max(20, (availableWidthForContent - totalWidth) / 2);
        
        const matrixX = contentStartX + categoryLabelWidth;
        const matrixY = margins.top + titleHeight + groupLabelHeight + (chartAreaHeight - totalHeight) / 2;
        
        console.log(`📐 Layout comparação: labelWidth=${categoryLabelWidth}px, matrixWidth=${matrixWidth}px, totalWidth=${totalWidth}px`);
        console.log(`📐 Posicionamento: contentStartX=${contentStartX}, matrixX=${matrixX}`);
        
        return {
            mode: 'comparison',
            matrix: {
                x: matrixX,
                y: matrixY,
                elementSize: elementSize,
                elementSpacingH: elementSpacingH,
                elementSpacingV: elementSpacingV,
                groups: groups,
                categories: categories,
                cols: matrixCols,
                rows: matrixRows,
                orientation: orientation
            },
            labels: {
                groupLabelY: matrixY - 12,
                categoryLabelX: matrixX - 8,
                showGroupLabels: config.showGroupLabels,
                showCategoryLabels: config.showCategoryLabels,
                categoryLabelWidth: categoryLabelWidth // ✅ Usa largura calculada dinamicamente
            }
        };
    }

    // ==========================================================================
    // RENDERIZAÇÃO PRINCIPAL - COM TEMPLATE CONTROLS
    // ==========================================================================

    function renderVisualization(data, config) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            showNoDataMessage();
            return;
        }
        
        vizCurrentData = data;
        vizCurrentConfig = config;
        
        console.log('🎨 RENDER - Configuração corrigida:', vizCurrentConfig);
        
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
        
        // ✅ CORREÇÃO 7: USA TEMPLATE CONTROLS para renderizar títulos com quebra automática
        if (window.OddVizTemplateControls?.renderTitlesWithWrap) {
            window.OddVizTemplateControls.renderTitlesWithWrap(vizSvg, vizCurrentConfig, {
                width: MATRIX_SETTINGS.fixedWidth,
                height: MATRIX_SETTINGS.fixedHeight,
                startY: 50
            });
        }
        
        renderDataSource();
        
        if (vizDataMode === 'simple') {
            renderSimpleMatrix();
        } else {
            renderComparisonMatrix(result.groups);
        }
        
        console.log('🎨 Matriz corrigida renderizada:', vizProcessedData.length + ' elementos');
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
                const x = layout.x + col * (layout.elementSize + layout.elementSpacingH);
                const y = layout.y + row * (layout.elementSize + layout.elementSpacingV);
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
        
        // ✅ CORREÇÃO 8: Adiciona interações com tooltips informativos
        setupElementInteractions(elementGroups, 'simple');
        
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
        
        clearAllLabels();
        
        if (orientation === 'groups-top') {
            if (vizCurrentConfig.showGroupLabels) {
                renderGroupLabels(groups, layout);
            }
            if (vizCurrentConfig.showCategoryLabels) {
                renderCategoryLabelsComparison(layout);
            }
        } else {
            if (vizCurrentConfig.showCategoryLabels) {
                renderCategoryLabelsOnTop(layout);
            }
            if (vizCurrentConfig.showGroupLabels) {
                renderGroupLabelsOnLeft(groups, layout);
            }
        }
        
        const matrixCells = [];
        
        if (orientation === 'groups-top') {
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
                const x = layout.x + d.col * (layout.elementSize + layout.elementSpacingH);
                const y = layout.y + d.row * (layout.elementSize + layout.elementSpacingV);
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
        
        // ✅ CORREÇÃO 8: Adiciona interações com tooltips informativos
        setupElementInteractions(cellGroups, 'comparison');
        
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
    // ✅ CORREÇÃO 9: INTERAÇÕES COM TOOLTIPS INFORMATIVOS
    // ==========================================================================

    function setupElementInteractions(groups, mode) {
        groups
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                // Destaque visual
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('opacity', 0.8);
                
                // Tooltip informativo
                showTooltip(event, d, mode);
            })
            .on('mouseout', function(event, d) {
                // Remove destaque
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('opacity', 1);
                
                hideTooltip();
            })
            .on('click', function(event, d) {
                // Notificação com informações detalhadas
                if (window.OddVizApp?.showNotification) {
                    let message;
                    if (mode === 'simple') {
                        message = `${d.categoria}: ${d.valor}%`;
                    } else {
                        message = `${d.categoria} - ${d.grupo.replace(/_/g, ' ')}: ${d.valor}%`;
                    }
                    window.OddVizApp.showNotification(message, 'info');
                }
            });
    }

    function showTooltip(event, data, mode) {
        hideTooltip();
        
        let tooltipContent;
        if (mode === 'simple') {
            tooltipContent = `
                <div style="font-weight: bold; margin-bottom: 4px;">${data.categoria}</div>
                <div>Valor: ${data.valor}%</div>
            `;
        } else {
            tooltipContent = `
                <div style="font-weight: bold; margin-bottom: 4px;">${data.categoria}</div>
                <div style="margin-bottom: 2px;">Grupo: ${data.grupo.replace(/_/g, ' ')}</div>
                <div>Valor: ${data.valor}%</div>
            `;
        }
        
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
            .html(tooltipContent);
        
        tooltip.transition().duration(200).style('opacity', 1);
    }

    function hideTooltip() {
        d3.selectAll('.viz-tooltip').remove();
    }

    // ==========================================================================
    // RENDERIZAÇÃO DE FORMAS - MANTIDA
    // ==========================================================================

    function renderBackgroundShapes(groups, size) {
        const shape = vizCurrentConfig.shape || MATRIX_DEFAULTS.shape;
        
        groups.each(function() {
            const group = d3.select(this);
            
            if (shape === 'bar') {
                const barWidth = size;
                const barHeight = size / 2;
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
                
                const backgroundY = (size - backgroundHeight) / 2;
                const alignmentOffsets = calculateBarAlignment(backgroundWidth, backgroundHeight, valueWidth, alignment);
                valueX = alignmentOffsets.x;
                valueY = backgroundY + alignmentOffsets.y;
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
                    .attr('rx', radius === 0 ? 0 : radius) // ✅ CORREÇÃO: Zero absoluto quando radius = 0
                    .attr('ry', radius === 0 ? 0 : radius) // ✅ CORREÇÃO: Zero absoluto quando radius = 0
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
                    .attr('rx', radius === 0 ? 0 : radius) // ✅ CORREÇÃO: Zero absoluto para barras também
                    .attr('ry', radius === 0 ? 0 : radius) // ✅ CORREÇÃO: Zero absoluto para barras também
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
    // RENDERIZAÇÃO DE TEXTOS - MANTIDA
    // ==========================================================================

    function clearAllLabels() {
        vizSvg.selectAll('.group-label, .category-label-comparison, .category-label-top, .group-label-left').remove();
    }

    function renderValuesWithContrast(groups, size, colorFunction) {
        groups.append('text')
            .attr('class', 'value-text')
            .attr('x', function() {
                return vizCurrentConfig.shape === 'bar' ? size / 2 : size / 2;
            })
            .attr('y', function() {
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
                return d.categoria.length > 24 ? 
                    d.categoria.substring(0, 24) + '...' : 
                    d.categoria; 
            });
    }

    function renderGroupLabels(groups, layout) {
        if (!vizCurrentConfig.showGroupLabels) return;
        
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
    }

    function renderCategoryLabelsComparison(layout) {
        if (!vizCurrentConfig.showCategoryLabels) return;
        
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
    }

    function renderCategoryLabelsOnTop(layout) {
        if (!vizCurrentConfig.showCategoryLabels) return;
        
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
    }

    function renderGroupLabelsOnLeft(groups, layout) {
        if (!vizCurrentConfig.showGroupLabels) return;
        
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
        
        console.log('🔄 Atualizando matriz corrigida com nova configuração...');
        
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
            
            // ✅ CORREÇÃO 10: Atualiza preview quando novos dados são carregados
            updateDataPreview(processedData.data);
            
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const specificConfig = window.MatrixChoiceVizConfig?.currentConfig || {};
            const mergedConfig = createMergedConfig(templateConfig, specificConfig);
            
            renderVisualization(processedData.data, mergedConfig);
        }
    }

    // ==========================================================================
    // ✅ CORREÇÃO 11: CÁLCULO DINÂMICO DE LARGURA DOS RÓTULOS
    // ==========================================================================

    /**
     * ✅ FUNÇÃO: Calcula largura real necessária para os rótulos baseado no texto
     */
    function calculateActualLabelWidth(data, config, orientation) {
        // Se rótulos estão desabilitados, não reserva espaço
        const showLabels = orientation === 'groups-top' ? 
            config.showCategoryLabels : 
            config.showGroupLabels;
            
        if (!showLabels) {
            console.log('📏 Rótulos desabilitados, largura = 0');
            return 0;
        }
        
        // Cria canvas temporário para medição de texto
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Configura fonte igual à que será usada nos rótulos
        const fontSize = config.labelSize || 12;
        const fontFamily = config.fontFamily || 'Inter';
        context.font = `${fontSize}px ${fontFamily}`;
        
        let maxWidth = 0;
        let textsToMeasure = [];
        
        // Determina quais textos medir baseado na orientação
        if (orientation === 'groups-top') {
            // Mede categorias (ficam à esquerda)
            textsToMeasure = data.map(item => item.categoria);
        } else {
            // Mede grupos (ficam à esquerda na orientação alternativa)
            const firstRow = data[0];
            const groups = Object.keys(firstRow).filter(key => key !== 'categoria');
            textsToMeasure = groups.map(group => group.replace(/_/g, ' '));
        }
        
        console.log('📏 Medindo textos para largura:', textsToMeasure);
        
        // Encontra a largura máxima
        textsToMeasure.forEach(text => {
            const width = context.measureText(text).width;
            maxWidth = Math.max(maxWidth, width);
        });
        
        // Adiciona padding e limita largura máxima
        const paddingBuffer = 40; // 20px padding de cada lado
        const calculatedWidth = maxWidth + paddingBuffer;
        const maxAllowedWidth = 220; // Limite máximo para não quebrar layout
        const minAllowedWidth = 60;  // Limite mínimo para legibilidade
        
        const finalWidth = Math.min(Math.max(calculatedWidth, minAllowedWidth), maxAllowedWidth);
        
        console.log(`📏 Largura calculada: texto=${Math.round(maxWidth)}px + padding=${paddingBuffer}px = ${Math.round(calculatedWidth)}px → final=${finalWidth}px`);
        
        return finalWidth;
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
        updateDataPreview: updateDataPreview, // ✅ Expõe função de preview
        MATRIX_SETTINGS: MATRIX_SETTINGS,
        
        // ✅ Acesso para debug
        get vizCurrentData() { return vizCurrentData; }
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