/**
 * MATRIZ DE BOLHAS - VERSÃO CORRIGIDA SEGUINDO PADRÃO WAFFLE
 * ✅ Quebra automática de títulos, sistema de cores customizadas e integração Template Controls
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURAÇÕES CENTRALIZADAS
    // ==========================================================================

    const BUBBLE_MATRIX_SETTINGS = {
        fixedWidth: 800,  // ✅ Largura correta para formato panorâmico
        fixedHeight: 600, // ✅ Altura padrão
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

    // ✅ CORREÇÃO 1: Sistema de cores seguindo padrão do waffle
    let vizUsingCustomColors = false;
    let vizCustomColors = [];
    let vizCurrentCategories = [];

    // ==========================================================================
    // INICIALIZAÇÃO CORRIGIDA
    // ==========================================================================

    function initVisualization() {
        if (typeof d3 === 'undefined') {
            console.error('D3.js não está carregado!');
            return;
        }
        
        console.log('🫧 Inicializando Matriz de Bolhas com Template Controls...');
        
        // ✅ CORREÇÃO 2: Define largura para Template Controls (formato panorâmico)
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
                
                // ✅ CORREÇÃO 3: Atualiza preview de dados no primeiro carregamento
                updateDataPreview(sampleData.data);
                updateSortDropdown(sampleData.data);
                
                const templateConfig = window.OddVizTemplateControls?.getState() || {};
                renderVisualization(sampleData.data, templateConfig);
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
    // SISTEMA DE CORES CORRIGIDO - SEGUINDO PADRÃO WAFFLE
    // ==========================================================================

    /**
     * ✅ FUNÇÃO: Cria escala de cores inteligente
     */
    function createColorScale() {
        console.log('🎨 Criando escala de cores...');
        console.log('🎨 Usando cores customizadas?', vizUsingCustomColors);
        console.log('🎨 Cores customizadas:', vizCustomColors);
        
        let colors;
        
        if (vizUsingCustomColors && vizCustomColors.length > 0) {
            // ✅ USA CORES CUSTOMIZADAS
            colors = vizCustomColors;
            console.log('🎨 Aplicando cores customizadas:', colors);
        } else {
            // ✅ USA PALETA DO TEMPLATE CONTROLS
            colors = window.OddVizTemplateControls?.getCurrentColorPalette() || 
                     ['#6F02FD', '#2C0165', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8'];
            console.log('🎨 Aplicando paleta padrão:', colors);
        }
        
        return colors;
    }

    /**
     * ✅ FUNÇÃO: Atualiza cores customizadas
     */
    function updateCustomColors(customColors) {
        console.log('🎨 Recebendo cores customizadas:', customColors);
        
        if (!customColors || customColors.length === 0) {
            console.warn('⚠️ Cores customizadas vazias, ignorando');
            return;
        }
        
        // Salva cores customizadas
        vizUsingCustomColors = true;
        vizCustomColors = customColors;
        
        // Re-renderiza visualização com novas cores
        if (vizCurrentData && vizCurrentData.length > 0 && vizCurrentConfig) {
            renderVisualization(vizCurrentData, vizCurrentConfig);
        }
    }

    /**
     * ✅ FUNÇÃO: Volta para paleta padrão
     */
    function updateColorPalette(paletteType) {
        console.log('🎨 Mudando para paleta padrão:', paletteType);
        
        // Desativa cores customizadas
        vizUsingCustomColors = false;
        vizCustomColors = [];
        
        // Re-renderiza visualização com nova paleta
        if (vizCurrentData && vizCurrentData.length > 0 && vizCurrentConfig) {
            renderVisualization(vizCurrentData, vizCurrentConfig);
        }
    }

    // ==========================================================================
    // ATUALIZAÇÃO DE PREVIEW DE DADOS
    // ==========================================================================

    function updateDataPreview(data) {
        const previewElement = document.getElementById('data-preview');
        if (!previewElement || !data || !Array.isArray(data)) return;
        
        console.log('📋 Atualizando preview de dados da matriz de bolhas...');
        
        const maxRows = 5;
        const displayData = data.slice(0, maxRows);
        
        if (displayData.length === 0) {
            previewElement.innerHTML = '<p class="data-placeholder">Nenhum dado disponível</p>';
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
        previewElement.innerHTML = tableHTML;
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
        
        // ✅ DETECTA mudança nas categorias para atualizar paleta personalizada
        const newCategories = data.map(row => row[structure.categoryColumn]);
        const categoriesChanged = !arraysEqual(vizCurrentCategories, newCategories);
        
        if (categoriesChanged) {
            console.log('📊 Categorias mudaram, atualizando sistema de cores');
            vizCurrentCategories = newCategories;
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
    // CÁLCULO DE LAYOUT INTELIGENTE - CORRIGIDO PARA ESTABILIDADE
    // ==========================================================================

    function calculateLayout(config, structure, dataLength) {
        const margins = BUBBLE_MATRIX_SETTINGS.margins;
        const availableWidth = BUBBLE_MATRIX_SETTINGS.fixedWidth - margins.left - margins.right;
        const availableHeight = BUBBLE_MATRIX_SETTINGS.fixedHeight - margins.top - margins.bottom;
        
        // ✅ CORREÇÃO 1: USA TEMPLATE CONTROLS para calcular altura dos títulos
        let titlesHeight = 50;
        if (window.OddVizTemplateControls?.calculateTitlesHeight) {
            titlesHeight = window.OddVizTemplateControls.calculateTitlesHeight(config, BUBBLE_MATRIX_SETTINGS.fixedWidth);
        }
        
        // ✅ CORREÇÃO 2: Calcula espaço para fonte dos dados
        const sourceHeight = config.dataSource ? 25 : 0;
        
        // ✅ CORREÇÃO 3: Área disponível para a matriz (entre títulos e fonte)
        const matrixAreaHeight = availableHeight - titlesHeight - sourceHeight;
        
        // ✅ CORREÇÃO 4: Cálculo estável da largura dos rótulos (não recalcula dinamicamente)
        const showRowLabels = readSpecificControlFromHTML('show-row-labels', true);
        const rowLabelWidth = showRowLabels ? 120 : 0; // Largura fixa, não dinâmica
        const matrixAreaWidth = availableWidth - rowLabelWidth;
        
        // Dimensões das células - USA VALORES DOS CONTROLES
        const numColumns = structure.metricColumns.length;
        const numRows = dataLength;
        
        const cellWidth = Math.min(
            readSpecificControlFromHTML('cell-width', 120), 
            matrixAreaWidth / numColumns
        );
        const cellHeight = Math.min(
            readSpecificControlFromHTML('cell-height', 80), 
            matrixAreaHeight / numRows
        );
        
        // Posicionamento da matriz
        const matrixWidth = cellWidth * numColumns;
        const matrixHeight = cellHeight * numRows;
        
        // ✅ CORREÇÃO 5: CENTRALIZAÇÃO ESTÁVEL - não se move quando rótulos mudam
        const totalContentWidth = rowLabelWidth + matrixWidth;
        const contentStartX = margins.left + (availableWidth - totalContentWidth) / 2;
        
        // ✅ POSIÇÃO FIXA: matriz sempre na mesma posição relativa ao conteúdo
        const matrixX = contentStartX + rowLabelWidth;
        const matrixY = margins.top + titlesHeight + (matrixAreaHeight - matrixHeight) / 2;
        
        return {
            margins: margins,
            availableWidth: availableWidth,
            availableHeight: availableHeight,
            titlesHeight: titlesHeight,
            sourceHeight: sourceHeight,
            
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
                x: matrixX, // ✅ Sempre na mesma posição da matriz
                y: matrixY - 25,
                show: readSpecificControlFromHTML('show-column-headers', true)
            },
            
            rowLabels: {
                x: matrixX - 20, // ✅ Sempre 20px à esquerda da matriz
                y: matrixY,
                show: showRowLabels,
                width: rowLabelWidth
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
        
        // Aplica ordenação - USANDO CONTROLES ATUAIS
        const sortBy = readSpecificControlFromHTML('sort-by', 'original');
        const sortOrder = readSpecificControlFromHTML('sort-order', 'desc');
        const sortedData = sortDataByColumn(processedData, structure, sortBy, sortOrder);
        
        // Calcula layout
        const layoutInfo = calculateLayout(config, structure, sortedData.length);
        
        // Atualiza SVG
        updateSVGDimensions(config);
        
        // ✅ CORREÇÃO 5: USA TEMPLATE CONTROLS para renderizar títulos com quebra automática (startY corrigido)
        if (window.OddVizTemplateControls?.renderTitlesWithWrap) {
            window.OddVizTemplateControls.renderTitlesWithWrap(vizSvg, config, {
                width: BUBBLE_MATRIX_SETTINGS.fixedWidth,
                height: BUBBLE_MATRIX_SETTINGS.fixedHeight,
                startY: 60  // ✅ CORREÇÃO: Valor correto seguindo padrão waffle
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
        
        // ✅ CORREÇÃO 1: Sistema de cores corrigido com modo de coloração
        const currentColors = createColorScale();
        const colorMode = readSpecificControlFromHTML('color-mode', 'by-column');
        
        console.log(`🎨 Modo de cor ativo: ${colorMode}`);
        console.log(`🎨 Cores disponíveis: ${currentColors.length} cores`);
        
        // Cria escala de tamanho para as bolhas - USANDO CONTROLES ATUAIS
        const minBubbleSize = readSpecificControlFromHTML('min-bubble-size', 12);
        const maxBubbleSize = readSpecificControlFromHTML('max-bubble-size', 50);
        const bubbleSizeScale = d3.scaleSqrt()
            .domain([0, 1])
            .range([minBubbleSize, maxBubbleSize]);
        
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
        
        console.log(`🎨 Células da matriz: ${matrixCells.length} células criadas`);
        console.log(`🎨 Primeira célula - rowIndex: ${matrixCells[0]?.rowIndex}, colIndex: ${matrixCells[0]?.colIndex}`);
        
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
        
        // Renderiza bolhas com cores corretas baseadas no modo
        const bubbleOpacity = readSpecificControlFromHTML('bubble-opacity', 0.9);
        const bubbleStroke = readSpecificControlFromHTML('bubble-stroke', true);
        const strokeWidth = readSpecificControlFromHTML('stroke-width', 1);
        
        const bubbles = cellGroups.append('circle')
            .attr('class', 'bubble')
            .attr('cx', layout.cellWidth / 2)
            .attr('cy', layout.cellHeight / 2)
            .attr('r', d => bubbleSizeScale(d.normalizedValue))
            .attr('fill', d => {
                const color = getBubbleColorByMode(d, currentColors, colorMode);
                console.log(`🎨 Célula [${d.rowIndex}, ${d.colIndex}] modo ${colorMode} = cor ${color}`);
                return color;
            })
            .attr('opacity', bubbleOpacity)
            .style('cursor', 'pointer');
        
        // Adiciona contorno se habilitado
        if (bubbleStroke) {
            bubbles
                .attr('stroke', vizCurrentConfig.textColor || '#2C3E50')
                .attr('stroke-width', strokeWidth)
                .attr('stroke-opacity', 0.3);
        }
        
        // Renderiza valores nas bolhas
        const showValues = readSpecificControlFromHTML('show-values', true);
        if (showValues) {
            renderBubbleValues(cellGroups, layout, currentColors, colorMode);
        }
        
        // Renderiza headers das colunas
        renderColumnHeaders(layoutInfo);
        
        // Renderiza rótulos das linhas
        renderRowLabels(sortedData, layoutInfo);
        
        // Adiciona interações
        setupBubbleInteractions(cellGroups);
    }

    // ✅ FUNÇÃO CORRIGIDA: Sistema de cores baseado no modo COM LOGS DETALHADOS
    function getBubbleColorByMode(d, colors, colorMode) {
        let selectedColor;
        
        switch (colorMode) {
            case 'by-column':
                selectedColor = colors[d.colIndex % colors.length];
                break;
            case 'by-row':
                selectedColor = colors[d.rowIndex % colors.length];
                break;
            case 'single':
                selectedColor = colors[0];
                break;
            default:
                console.warn(`🎨 Modo de cor desconhecido: ${colorMode}, usando by-column`);
                selectedColor = colors[d.colIndex % colors.length];
                break;
        }
        
        // Log apenas para primeira célula para evitar spam
        if (d.rowIndex === 0 && d.colIndex === 0) {
            console.log(`🎨 DEBUG: Modo=${colorMode}, Row=${d.rowIndex}, Col=${d.colIndex}, Cor=${selectedColor}`);
        }
        
        return selectedColor;
    }

    function renderBubbleValues(cellGroups, layout, colors, colorMode) {
        cellGroups.append('text')
            .attr('class', 'bubble-value')
            .attr('x', layout.cellWidth / 2)
            .attr('y', layout.cellHeight / 2)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .style('fill', d => getContrastColor(getBubbleColorByMode(d, colors, colorMode)))
            .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
            .style('font-size', (vizCurrentConfig.valueSize || 12) + 'px')
            .style('font-weight', '600')
            .style('pointer-events', 'none')
            .style('stroke', d => getBubbleColorByMode(d, colors, colorMode))
            .style('stroke-width', '2px')
            .style('paint-order', 'stroke')
            .text(d => formatValue(d.value));
    }

    function renderColumnHeaders(layoutInfo) {
        const showColumnHeaders = readSpecificControlFromHTML('show-column-headers', true);
        if (!showColumnHeaders) return;
        
        const layout = layoutInfo.matrix;
        const headers = layoutInfo.headers;
        
        vizDataStructure.metricColumns.forEach((col, index) => {
            const x = headers.x + index * layout.cellWidth + layout.cellWidth / 2;
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
        const showRowLabels = readSpecificControlFromHTML('show-row-labels', true);
        if (!showRowLabels) return;
        
        const layout = layoutInfo.matrix;
        const rowLabels = layoutInfo.rowLabels;
        
        sortedData.forEach((row, index) => {
            const x = rowLabels.x;
            const y = rowLabels.y + index * layout.cellHeight + layout.cellHeight / 2;
            
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

    function readSpecificControlFromHTML(controlId, defaultValue) {
        // ✅ CORREÇÃO ESPECIAL: Para modo de cor, lê diretamente do radio group
        if (controlId === 'color-mode') {
            const allRadios = document.querySelectorAll('input[name="color-mode"]');
            const checkedRadio = document.querySelector('input[name="color-mode"]:checked');
            
            console.log(`🎨 DEBUG Radio buttons encontrados: ${allRadios.length}`);
            allRadios.forEach((radio, index) => {
                console.log(`🎨 DEBUG Radio ${index}: value="${radio.value}", checked=${radio.checked}`);
            });
            
            const result = checkedRadio ? checkedRadio.value : defaultValue;
            console.log(`🎨 DEBUG Resultado final: ${result} (default: ${defaultValue})`);
            return result;
        }
        
        const element = document.getElementById(controlId);
        if (!element) return defaultValue;
        
        if (element.type === 'checkbox') {
            return element.checked;
        } else if (element.type === 'range' || element.type === 'number') {
            return parseFloat(element.value) || defaultValue;
        } else if (element.type === 'radio') {
            const checked = document.querySelector(`input[name="${element.name}"]:checked`);
            return checked ? checked.value : defaultValue;
        } else if (element.tagName === 'SELECT') {
            return element.value || defaultValue;
        } else {
            return element.value || defaultValue;
        }
    }

    function arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

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
        const strokeWidth = readSpecificControlFromHTML('stroke-width', 1);
        
        d3.select(event.currentTarget).select('.bubble')
            .transition()
            .duration(200)
            .attr('opacity', 1)
            .attr('stroke-width', strokeWidth + 1);
        
        showTooltip(event, d);
    }

    function handleBubbleOut(event, d) {
        const bubbleOpacity = readSpecificControlFromHTML('bubble-opacity', 0.9);
        const strokeWidth = readSpecificControlFromHTML('stroke-width', 1);
        
        d3.select(event.currentTarget).select('.bubble')
            .transition()
            .duration(200)
            .attr('opacity', bubbleOpacity)
            .attr('stroke-width', strokeWidth);
        
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
        renderVisualization(vizCurrentData, newConfig);
    }

    function onDataLoaded(processedData) {
        if (processedData && processedData.data) {
            console.log('📊 Novos dados carregados:', processedData.data.length + ' linhas');
            
            updateSortDropdown(processedData.data);
            updateDataPreview(processedData.data);
            
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            renderVisualization(processedData.data, templateConfig);
        }
    }

    // ==========================================================================
    // EXPORTAÇÕES GLOBAIS
    // ==========================================================================

    window.BubbleMatrixVisualization = {
        initVisualization: initVisualization,
        renderVisualization: renderVisualization,
        onUpdate: onUpdate,
        onDataLoaded: onDataLoaded,
        updateColorPalette: updateColorPalette,  // ✅ Sistema de cores corrigido
        updateCustomColors: updateCustomColors, // ✅ Sistema de cores corrigido
        updateDataPreview: updateDataPreview,   // ✅ Expõe função de preview
        BUBBLE_MATRIX_SETTINGS: BUBBLE_MATRIX_SETTINGS,
        
        // ✅ ACESSO PARA DEBUG
        get vizCurrentData() { return vizCurrentData; }
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