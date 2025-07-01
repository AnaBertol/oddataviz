/**
 * GRÁFICO DE MEIO CÍRCULOS - D3.js CORRIGIDO COM TEMPLATE CONTROLS
 * ✅ Com quebra automática de títulos, preview de dados e processamento flexível
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURAÇÕES CENTRALIZADAS E FIXAS
    // ==========================================================================

    const SEMI_CIRCLES_SETTINGS = {
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
            betweenCircles: 30,
            axisOffset: 10
        },
        
        animationDuration: 800,
        staggerDelay: 100
    };

    // ✅ CONFIGURAÇÃO PADRÃO MÍNIMA (apenas valores que não vêm do Template Controls)
    const SEMI_CIRCLES_DEFAULTS = {
        category1: 'Personagens',
        category2: 'Jogadores',
        categoryColors: ['#6F02FD', '#6CDADE'],
        circleSize: 160,
        circleSpacing: 30,
        showAxisLine: true,
        showAnimation: false,
        showCircleOutline: true,
        outlineWidth: 1,
        outlineStyle: 'dashed',
        showValues: true,
        showCategoryLabels: true,
        showParameterLabels: true
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

    // ==========================================================================
    // INICIALIZAÇÃO CORRIGIDA
    // ==========================================================================

    function initVisualization() {
        if (typeof d3 === 'undefined') {
            console.error('D3.js não está carregado!');
            return;
        }
        
        console.log('⚪ Inicializando Gráfico de Meio Círculos com Template Controls...');
        
        // ✅ CORREÇÃO 1: Define largura para Template Controls (quebra automática)
        if (window.OddVizTemplateControls?.setVisualizationWidth) {
            window.OddVizTemplateControls.setVisualizationWidth(SEMI_CIRCLES_SETTINGS.fixedWidth, 'wide');
        }
        
        createBaseSVG();
        
        // Carrega dados de exemplo após breve delay
        setTimeout(loadSampleData, 100);
    }

    function loadSampleData() {
        if (window.getSampleData && typeof window.getSampleData === 'function') {
            const sampleData = window.getSampleData();
            if (sampleData && sampleData.data) {
                console.log('📊 Carregando dados de exemplo...');
                
                // ✅ CORREÇÃO 2: Atualiza preview de dados no primeiro carregamento
                updateDataPreview(sampleData.data);
                
                // ✅ Mescla configuração do Template Controls com específicas
                const templateConfig = window.OddVizTemplateControls?.getState() || {};
                const specificConfig = window.SemiCirclesVizConfig?.currentConfig || {};
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
            .attr('id', 'semi-circles-viz')
            .attr('width', SEMI_CIRCLES_SETTINGS.fixedWidth)
            .attr('height', SEMI_CIRCLES_SETTINGS.fixedHeight);
        
        // Grupos organizados
        vizChartGroup = vizSvg.append('g').attr('class', 'chart-group');
    }

    // ==========================================================================
    // ✅ CORREÇÃO 3: FUNÇÃO PARA ATUALIZAR PREVIEW DE DADOS
    // ==========================================================================

    function updateDataPreview(data) {
        const previewContainer = document.getElementById('data-preview');
        if (!previewContainer || !data || !Array.isArray(data)) return;
        
        console.log('📋 Atualizando preview de dados dos meio círculos...');
        
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
    // CONFIGURAÇÃO MESCLADA
    // ==========================================================================

    /**
     * ✅ FUNÇÃO: Mescla configurações do Template Controls com específicas dos meio círculos
     */
    function createMergedConfig(templateConfig, specificConfig) {
        // Começa com os padrões mínimos
        const mergedConfig = Object.assign({}, SEMI_CIRCLES_DEFAULTS);
        
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
        
        // Aplica configurações específicas dos meio círculos (sobrescreve se necessário)
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
            // Nomes das categorias
            category1: document.getElementById('category-1-name')?.value || SEMI_CIRCLES_DEFAULTS.category1,
            category2: document.getElementById('category-2-name')?.value || SEMI_CIRCLES_DEFAULTS.category2,
            
            // Cores das categorias
            categoryColors: [
                document.getElementById('category-1-color')?.value || SEMI_CIRCLES_DEFAULTS.categoryColors[0],
                document.getElementById('category-2-color')?.value || SEMI_CIRCLES_DEFAULTS.categoryColors[1]
            ],
            
            // Controles específicos dos círculos
            circleSize: parseInt(document.getElementById('circle-size')?.value) || SEMI_CIRCLES_DEFAULTS.circleSize,
            circleSpacing: parseInt(document.getElementById('circle-spacing')?.value) || SEMI_CIRCLES_DEFAULTS.circleSpacing,
            showAxisLine: document.getElementById('show-axis-line')?.checked !== false,
            showAnimation: document.getElementById('show-animation')?.checked || false,
            showCircleOutline: document.getElementById('show-circle-outline')?.checked !== false,
            outlineWidth: parseFloat(document.getElementById('outline-width')?.value) || SEMI_CIRCLES_DEFAULTS.outlineWidth,
            outlineStyle: document.querySelector('input[name="outline-style"]:checked')?.value || SEMI_CIRCLES_DEFAULTS.outlineStyle,
            
            // Controles de exibição
            showValues: document.getElementById('show-values')?.checked !== false,
            showCategoryLabels: document.getElementById('show-category-labels')?.checked !== false,
            showParameterLabels: document.getElementById('show-parameter-labels')?.checked !== false
        };
    }

    // ==========================================================================
    // CÁLCULO DE LAYOUT - USANDO TEMPLATE CONTROLS
    // ==========================================================================

    function calculateLayout(config, dataLength) {
        const margins = SEMI_CIRCLES_SETTINGS.margins;
        const spacing = SEMI_CIRCLES_SETTINGS.spacing;
        
        let availableWidth = SEMI_CIRCLES_SETTINGS.fixedWidth - margins.left - margins.right;
        let availableHeight = SEMI_CIRCLES_SETTINGS.fixedHeight - margins.top - margins.bottom;
        
        // ✅ CORREÇÃO 4: Usa Template Controls para calcular altura dos títulos
        let titleHeight = 50; // Valor padrão seguro
        if (window.OddVizTemplateControls?.calculateTitlesHeight) {
            titleHeight = window.OddVizTemplateControls.calculateTitlesHeight(config, SEMI_CIRCLES_SETTINGS.fixedWidth);
        }
        
        // Reserva espaço para fonte dos dados e rótulos dos parâmetros
        const sourceHeight = config.dataSource ? 15 + spacing.legendToSource : 0;
        const parameterLabelsHeight = config.showParameterLabels ? 25 : 0;
        
        // Área disponível para os círculos
        const chartAreaHeight = availableHeight - titleHeight - sourceHeight - parameterLabelsHeight;
        
        // Calcula layout dos círculos
        const circleSize = config.circleSize || SEMI_CIRCLES_DEFAULTS.circleSize;
        const circleSpacing = config.circleSpacing || SEMI_CIRCLES_DEFAULTS.circleSpacing;
        
        // Largura necessária para os círculos
        const totalCirclesWidth = (circleSize * dataLength) + (circleSpacing * (dataLength - 1));
        
        // Largura dos rótulos das categorias (se existir)
        const categoryLabelsWidth = config.showCategoryLabels ? 90 : 0;
        const gapBetweenLabelsAndCircles = config.showCategoryLabels ? 20 : 0;
        
        // Largura total do conjunto (rótulos + gap + círculos)
        const totalContentWidth = categoryLabelsWidth + gapBetweenLabelsAndCircles + totalCirclesWidth;
        
        // Centraliza o conjunto completo na tela
        const contentStartX = margins.left + (availableWidth - totalContentWidth) / 2;
        
        // Posições específicas
        const categoryLabelsX = contentStartX + categoryLabelsWidth - 10;
        const circlesStartX = contentStartX + categoryLabelsWidth + gapBetweenLabelsAndCircles;
        const circlesY = margins.top + titleHeight + (chartAreaHeight - circleSize) / 2;
        
        // Linha central (eixo divisório)
        const axisY = circlesY + circleSize / 2;
        
        return {
            margins: margins,
            spacing: spacing,
            availableWidth: availableWidth,
            availableHeight: availableHeight,
            chartAreaHeight: chartAreaHeight,
            totalContentWidth: totalContentWidth,
            circles: {
                startX: circlesStartX,
                y: circlesY,
                size: circleSize,
                spacing: circleSpacing,
                axisY: axisY
            },
            titles: {
                titleY: margins.top + (config.titleSize || 24),
                subtitleY: margins.top + (config.titleSize || 24) + spacing.titleToSubtitle + (config.subtitleSize || 16)
            },
            categoryLabels: {
                category1Y: axisY - 25,
                category2Y: axisY + 25,
                x: categoryLabelsX,
                show: config.showCategoryLabels
            },
            source: {
                y: SEMI_CIRCLES_SETTINGS.fixedHeight - margins.bottom + spacing.legendToSource
            },
            parameterLabels: {
                y: circlesY + circleSize + 20
            },
            axisLine: {
                startX: config.showCategoryLabels ? contentStartX : circlesStartX,
                endX: circlesStartX + totalCirclesWidth
            }
        };
    }

    // ==========================================================================
    // ✅ CORREÇÃO 5: PROCESSAMENTO DE DADOS FLEXÍVEL
    // ==========================================================================

    function processDataForSemiCircles(rawData) {
        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
            return { processedData: [] };
        }
        
        // ✅ DETECÇÃO AUTOMÁTICA: Funciona com qualquer nome de coluna
        const firstRow = rawData[0];
        const columns = Object.keys(firstRow);
        
        if (columns.length < 3) {
            console.warn('Dados insuficientes para meio círculos: necessário pelo menos 3 colunas');
            return { processedData: [] };
        }
        
        // Assume primeira coluna como parâmetro, segunda e terceira como categorias
        const parametroColumn = columns[0];
        const categoria1Column = columns[1];
        const categoria2Column = columns[2];
        
        console.log(`📊 Processando meio círculos: parâmetro='${parametroColumn}', cat1='${categoria1Column}', cat2='${categoria2Column}'`);
        
        // Processa dados
        let data = rawData.map(row => ({
            parametro: String(row[parametroColumn] || ''),
            categoria_1: parseFloat(row[categoria1Column]) || 0,
            categoria_2: parseFloat(row[categoria2Column]) || 0,
            original: row
        })).filter(d => d.parametro && (d.categoria_1 > 0 || d.categoria_2 > 0));
        
        if (data.length === 0) {
            console.warn('Nenhum dado válido encontrado após processamento');
            return { processedData: [] };
        }
        
        const processedData = data.map(function(d) {
            const cat1Value = d.categoria_1;
            const cat2Value = d.categoria_2;
            const total = cat1Value + cat2Value;
            
            return {
                parametro: d.parametro,
                categoria_1: cat1Value,
                categoria_2: cat2Value,
                total: total,
                cat1Percentage: total > 0 ? (cat1Value / total) * 100 : 0,
                cat2Percentage: total > 0 ? (cat2Value / total) * 100 : 0,
                maxValue: Math.max(cat1Value, cat2Value)
            };
        });
        
        // Calcula valor máximo global para normalização
        const globalMax = Math.max.apply(Math, processedData.map(function(d) { return d.maxValue; }));
        
        processedData.forEach(function(d) {
            d.normalizedCat1 = globalMax > 0 ? d.categoria_1 / globalMax : 0;
            d.normalizedCat2 = globalMax > 0 ? d.categoria_2 / globalMax : 0;
        });
        
        return { processedData: processedData, globalMax: globalMax };
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
        vizCurrentConfig = config; // ✅ USA CONFIGURAÇÃO MESCLADA
        
        console.log('🎨 RENDER - Configuração mesclada:', vizCurrentConfig);
        
        const result = processDataForSemiCircles(data);
        vizProcessedData = result.processedData;
        
        if (vizProcessedData.length === 0) {
            showNoDataMessage();
            return;
        }
        
        vizLayoutInfo = calculateLayout(vizCurrentConfig, vizProcessedData.length);
        
        updateSVGDimensions();
        
        // ✅ CORREÇÃO 6: USA TEMPLATE CONTROLS para renderizar títulos com quebra automática
        if (window.OddVizTemplateControls?.renderTitlesWithWrap) {
            window.OddVizTemplateControls.renderTitlesWithWrap(vizSvg, vizCurrentConfig, {
                width: SEMI_CIRCLES_SETTINGS.fixedWidth,
                height: SEMI_CIRCLES_SETTINGS.fixedHeight,
                startY: 50
            });
        }
        
        renderSemiCircles();
        renderAxisLine();
        renderCategoryLabels();
        renderParameterLabels();
        renderDataSource();
        
        console.log('🎨 Meio círculos renderizados:', vizProcessedData.length + ' parâmetros');
    }

    function updateSVGDimensions() {
        if (!vizSvg) return;
        
        vizSvg.attr('width', SEMI_CIRCLES_SETTINGS.fixedWidth)
              .attr('height', SEMI_CIRCLES_SETTINGS.fixedHeight);
        
        vizSvg.selectAll('.svg-background').remove();
        
        vizSvg.insert('rect', ':first-child')
            .attr('class', 'svg-background')
            .attr('width', SEMI_CIRCLES_SETTINGS.fixedWidth)
            .attr('height', SEMI_CIRCLES_SETTINGS.fixedHeight)
            .attr('fill', vizCurrentConfig.backgroundColor || '#FFFFFF');
    }

    function renderSemiCircles() {
        vizChartGroup.selectAll('.circle-group').remove();
        
        const layout = vizLayoutInfo.circles;
        
        // Cria grupos para cada parâmetro
        const circleGroups = vizChartGroup.selectAll('.circle-group')
            .data(vizProcessedData)
            .enter()
            .append('g')
            .attr('class', 'circle-group')
            .attr('transform', function(d, i) {
                return 'translate(' + (layout.startX + i * (layout.size + layout.spacing)) + ',' + layout.y + ')';
            });
        
        // Adiciona círculos de contorno se habilitado
        if (vizCurrentConfig.showCircleOutline) {
            circleGroups.append('circle')
                .attr('class', 'circle-outline')
                .attr('cx', layout.size / 2)
                .attr('cy', layout.size / 2)
                .attr('r', function(d) {
                    const maxValueThisParam = Math.max(d.categoria_1, d.categoria_2);
                    const globalMax = Math.max.apply(Math, vizProcessedData.map(function(item) { 
                        return Math.max(item.categoria_1, item.categoria_2); 
                    }));
                    return (layout.size / 2) * Math.sqrt(maxValueThisParam / globalMax);
                })
                .attr('fill', 'none')
                .attr('stroke', vizCurrentConfig.textColor || '#2C3E50')
                .attr('stroke-width', vizCurrentConfig.outlineWidth || 1)
                .attr('stroke-dasharray', vizCurrentConfig.outlineStyle === 'dashed' ? '5,5' : 'none')
                .attr('opacity', 0.4);
        }
        
        // Meio círculo superior (categoria 1)
        const upperSemiCircles = circleGroups.append('path')
            .attr('class', 'semi-circle-upper')
            .attr('d', function(d) {
                const radius = (layout.size / 2) * Math.sqrt(d.normalizedCat1);
                const cx = layout.size / 2;
                const cy = layout.size / 2;
                return 'M ' + (cx - radius) + ' ' + cy + ' A ' + radius + ' ' + radius + ' 0 0 1 ' + (cx + radius) + ' ' + cy + ' Z';
            })
            .attr('fill', vizCurrentConfig.categoryColors ? vizCurrentConfig.categoryColors[0] : SEMI_CIRCLES_DEFAULTS.categoryColors[0])
            .style('cursor', 'pointer');
        
        // Meio círculo inferior (categoria 2)
        const lowerSemiCircles = circleGroups.append('path')
            .attr('class', 'semi-circle-lower')
            .attr('d', function(d) {
                const radius = (layout.size / 2) * Math.sqrt(d.normalizedCat2);
                const cx = layout.size / 2;
                const cy = layout.size / 2;
                return 'M ' + (cx - radius) + ' ' + cy + ' A ' + radius + ' ' + radius + ' 0 0 0 ' + (cx + radius) + ' ' + cy + ' Z';
            })
            .attr('fill', vizCurrentConfig.categoryColors ? vizCurrentConfig.categoryColors[1] : SEMI_CIRCLES_DEFAULTS.categoryColors[1])
            .style('cursor', 'pointer');
        
        // Adiciona valores se habilitado
        if (vizCurrentConfig.showValues) {
            // Valores categoria 1 (acima do eixo)
            circleGroups.append('text')
                .attr('class', 'value-text-upper')
                .attr('x', layout.size / 2)
                .attr('y', layout.size / 2 - 12)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'alphabetic')
                .style('fill', function(d) {
                    return getContrastColor(vizCurrentConfig.categoryColors ? vizCurrentConfig.categoryColors[0] : SEMI_CIRCLES_DEFAULTS.categoryColors[0]);
                })
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', (vizCurrentConfig.valueSize || 16) + 'px')
                .style('font-weight', '600')
                .style('stroke', vizCurrentConfig.categoryColors ? vizCurrentConfig.categoryColors[0] : SEMI_CIRCLES_DEFAULTS.categoryColors[0])
                .style('stroke-width', '3px')
                .style('paint-order', 'stroke')
                .text(function(d) { return d.categoria_1; });
            
            // Valores categoria 2 (abaixo do eixo)
            circleGroups.append('text')
                .attr('class', 'value-text-lower')
                .attr('x', layout.size / 2)
                .attr('y', layout.size / 2 + 12)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'hanging')
                .style('fill', function(d) {
                    return getContrastColor(vizCurrentConfig.categoryColors ? vizCurrentConfig.categoryColors[1] : SEMI_CIRCLES_DEFAULTS.categoryColors[1]);
                })
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', (vizCurrentConfig.valueSize || 16) + 'px')
                .style('font-weight', '600')
                .style('stroke', vizCurrentConfig.categoryColors ? vizCurrentConfig.categoryColors[1] : SEMI_CIRCLES_DEFAULTS.categoryColors[1])
                .style('stroke-width', '3px')
                .style('paint-order', 'stroke')
                .text(function(d) { return d.categoria_2; });
        }
        
        // Adiciona interações
        setupCircleInteractions(circleGroups);
        
        // Animação se habilitada
        if (vizCurrentConfig.showAnimation) {
            upperSemiCircles
                .style('opacity', 0)
                .transition()
                .duration(SEMI_CIRCLES_SETTINGS.animationDuration)
                .delay(function(d, i) { return i * SEMI_CIRCLES_SETTINGS.staggerDelay; })
                .style('opacity', 1);
            
            lowerSemiCircles
                .style('opacity', 0)
                .transition()
                .duration(SEMI_CIRCLES_SETTINGS.animationDuration)
                .delay(function(d, i) { return i * SEMI_CIRCLES_SETTINGS.staggerDelay + 200; })
                .style('opacity', 1);
        }
    }

    function setupCircleInteractions(circleGroups) {
        circleGroups.selectAll('.semi-circle-upper, .semi-circle-lower')
            .on('mouseover', handleCircleHover)
            .on('mouseout', handleCircleOut)
            .on('click', handleCircleClick);
    }

    function renderAxisLine() {
        vizSvg.selectAll('.axis-line').remove();
        
        if (!vizCurrentConfig.showAxisLine) return;
        
        const layout = vizLayoutInfo.circles;
        const axisLayout = vizLayoutInfo.axisLine;
        const lineY = layout.axisY;
        
        vizSvg.append('line')
            .attr('class', 'axis-line')
            .attr('x1', axisLayout.startX)
            .attr('x2', axisLayout.endX)
            .attr('y1', lineY)
            .attr('y2', lineY)
            .attr('stroke', vizCurrentConfig.textColor || '#2C3E50')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '5,5')
            .attr('opacity', 0.5);
    }

    function renderCategoryLabels() {
        vizSvg.selectAll('.category-label').remove();
        
        if (!vizCurrentConfig.showCategoryLabels) return;
        
        const layout = vizLayoutInfo.categoryLabels;
        
        // Label categoria 1 (superior)
        vizSvg.append('text')
            .attr('class', 'category-label category-1-label')
            .attr('x', layout.x)
            .attr('y', layout.category1Y)
            .attr('text-anchor', 'end')
            .style('fill', vizCurrentConfig.categoryColors ? vizCurrentConfig.categoryColors[0] : SEMI_CIRCLES_DEFAULTS.categoryColors[0])
            .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
            .style('font-size', ((vizCurrentConfig.labelSize || 12) + 2) + 'px')
            .style('font-weight', '600')
            .text(vizCurrentConfig.category1 || SEMI_CIRCLES_DEFAULTS.category1);
        
        // Label categoria 2 (inferior)
        vizSvg.append('text')
            .attr('class', 'category-label category-2-label')
            .attr('x', layout.x)
            .attr('y', layout.category2Y)
            .attr('text-anchor', 'end')
            .style('fill', vizCurrentConfig.categoryColors ? vizCurrentConfig.categoryColors[1] : SEMI_CIRCLES_DEFAULTS.categoryColors[1])
            .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
            .style('font-size', ((vizCurrentConfig.labelSize || 12) + 2) + 'px')
            .style('font-weight', '600')
            .text(vizCurrentConfig.category2 || SEMI_CIRCLES_DEFAULTS.category2);
    }

    function renderParameterLabels() {
        vizSvg.selectAll('.parameter-label').remove();
        
        if (!vizCurrentConfig.showParameterLabels) return;
        
        const layout = vizLayoutInfo.circles;
        const labelY = vizLayoutInfo.parameterLabels.y;
        
        vizProcessedData.forEach(function(d, i) {
            const labelX = layout.startX + i * (layout.size + layout.spacing) + layout.size / 2;
            
            vizSvg.append('text')
                .attr('class', 'parameter-label')
                .attr('x', labelX)
                .attr('y', labelY)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', (vizCurrentConfig.labelSize || 12) + 'px')
                .style('font-weight', '500')
                .text(d.parametro);
        });
    }

    function renderDataSource() {
        vizSvg.selectAll('.chart-source-svg').remove();
        
        if (vizCurrentConfig.dataSource) {
            let sourceText = vizCurrentConfig.dataSource;
            
            // ✅ CORREÇÃO: Verifica se já tem "Fonte:" para evitar duplicação
            if (!sourceText.toLowerCase().startsWith('fonte:') && !sourceText.toLowerCase().startsWith('source:')) {
                sourceText = 'Fonte: ' + sourceText;
            }
            
            vizSvg.append('text')
                .attr('class', 'chart-source-svg')
                .attr('x', SEMI_CIRCLES_SETTINGS.fixedWidth / 2)
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
    // INTERAÇÕES
    // ==========================================================================

    function handleCircleHover(event, d) {
        const isUpper = event.target.classList.contains('semi-circle-upper');
        const category = isUpper ? vizCurrentConfig.category1 : vizCurrentConfig.category2;
        const value = isUpper ? d.categoria_1 : d.categoria_2;
        const percentage = isUpper ? d.cat1Percentage : d.cat2Percentage;
        
        d3.select(event.target)
            .transition()
            .duration(200)
            .style('opacity', 0.8);
        
        showTooltip(event, {
            parametro: d.parametro,
            category: category,
            value: value,
            percentage: percentage
        });
    }

    function handleCircleOut(event, d) {
        d3.select(event.target)
            .transition()
            .duration(200)
            .style('opacity', 1);
        
        hideTooltip();
    }

    function handleCircleClick(event, d) {
        const isUpper = event.target.classList.contains('semi-circle-upper');
        const category = isUpper ? vizCurrentConfig.category1 : vizCurrentConfig.category2;
        const value = isUpper ? d.categoria_1 : d.categoria_2;
        
        if (window.OddVizApp && window.OddVizApp.showNotification) {
            window.OddVizApp.showNotification(
                d.parametro + ' - ' + category + ': ' + value, 
                'info'
            );
        }
    }

    function showTooltip(event, data) {
        hideTooltip();
        
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
            .html(
                '<div style="font-weight: bold; margin-bottom: 4px;">' + data.parametro + '</div>' +
                '<div style="margin-bottom: 2px;">' + data.category + '</div>' +
                '<div>Valor: ' + data.value + '</div>'
            );
        
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
        
        console.log('🔄 Atualizando meio círculos com nova configuração...');
        
        // ✅ MESCLA nova configuração com específicas
        const specificConfig = window.SemiCirclesVizConfig?.currentConfig || {};
        const mergedConfig = createMergedConfig(newConfig, specificConfig);
        
        // Re-renderiza
        renderVisualization(vizCurrentData, mergedConfig);
    }

    function onSemiCirclesControlUpdate(semiCirclesControls) {
        console.log('⚪ Controles meio círculos atualizados:', semiCirclesControls);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            // Mescla com configuração atual
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const mergedConfig = createMergedConfig(templateConfig, semiCirclesControls);
            renderVisualization(vizCurrentData, mergedConfig);
        }
    }

    function updateCategoryColors(cat1Color, cat2Color) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        console.log('🎨 Cores das categorias atualizadas:', { cat1Color: cat1Color, cat2Color: cat2Color });
        
        // Atualiza configuração com novas cores
        if (!vizCurrentConfig.categoryColors) {
            vizCurrentConfig.categoryColors = [];
        }
        vizCurrentConfig.categoryColors[0] = cat1Color;
        vizCurrentConfig.categoryColors[1] = cat2Color;
        
        // Re-renderiza apenas os círculos e rótulos
        renderSemiCircles();
        renderCategoryLabels();
    }

    function onDataLoaded(processedData) {
        if (processedData && processedData.data) {
            console.log('📊 Novos dados carregados:', processedData.data.length + ' parâmetros');
            
            // ✅ CORREÇÃO 7: Atualiza preview quando novos dados são carregados
            updateDataPreview(processedData.data);
            
            // Mescla configurações
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const specificConfig = window.SemiCirclesVizConfig?.currentConfig || {};
            const mergedConfig = createMergedConfig(templateConfig, specificConfig);
            
            renderVisualization(processedData.data, mergedConfig);
        }
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
        
        const config = vizCurrentConfig || SEMI_CIRCLES_DEFAULTS;
        
        vizSvg.append('rect')
            .attr('class', 'svg-background')
            .attr('width', SEMI_CIRCLES_SETTINGS.fixedWidth)
            .attr('height', SEMI_CIRCLES_SETTINGS.fixedHeight)
            .attr('fill', config.backgroundColor || '#FFFFFF');
        
        const message = vizSvg.append('g')
            .attr('class', 'no-data-message')
            .attr('transform', 'translate(' + (SEMI_CIRCLES_SETTINGS.fixedWidth / 2) + ',' + (SEMI_CIRCLES_SETTINGS.fixedHeight / 2) + ')');
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-20px')
            .style('fill', config.textColor || '#2C3E50')
            .style('font-family', config.fontFamily || 'Inter')
            .style('font-size', '24px')
            .text('⚪');
        
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

    window.SemiCirclesVisualization = {
        initVisualization: initVisualization,
        renderVisualization: renderVisualization,
        onUpdate: onUpdate,
        onSemiCirclesControlUpdate: onSemiCirclesControlUpdate,
        onDataLoaded: onDataLoaded,
        updateCategoryColors: updateCategoryColors,
        updateDataPreview: updateDataPreview, // ✅ Expõe função de preview
        SEMI_CIRCLES_SETTINGS: SEMI_CIRCLES_SETTINGS
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