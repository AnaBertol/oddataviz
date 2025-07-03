/**
 * GRÁFICO DE FAIXAS DE DISTRIBUIÇÃO - D3.js LIMPO
 * ✅ Apenas renderização - Controles movidos para config.js
 * ✅ Seguindo padrão waffle-chart
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURAÇÕES ESPECÍFICAS DO RANGE CHART
    // ==========================================================================

    const RANGE_SETTINGS = {
        // Sempre usa formato wide - dimensões fixas
        fixedWidth: 800,
        fixedHeight: 600,
        
        margins: {
            top: 50, 
            right: 50, 
            bottom: 80, 
            left: 50
        },
        
        // Espaçamentos específicos para o range chart
        spacing: {
            barToScale: 80,      // Distância entre barra e escala
            scaleToConnections: 20, // Espaço para linhas conectoras
            connectionBuffer: 10   // Buffer para evitar sobreposição
        },
        
        // Configurações de animação
        animationDuration: 800,
        connectionDelay: 100
    };

    // ==========================================================================
    // VARIÁVEIS PRIVADAS
    // ==========================================================================

    let vizSvg = null;
    let vizBarGroup = null;
    let vizScaleGroup = null;
    let vizConnectionsGroup = null;
    let vizColorScale = null;
    let vizCurrentData = null;
    let vizProcessedData = null;
    let vizCurrentConfig = null;
    let vizLayoutInfo = null;

    // Variáveis para sistema de cores customizadas
    let vizUsingCustomColors = false;
    let vizCustomColors = [];

    // Configurações específicas do range chart (vindas do config.js)
    let rangeConfig = {
        barHeight: 50,
        connectionStroke: 2,
        showConnections: true,
        connectionStyle: 'dashed', // 'solid', 'dashed', 'fill'
        connectionOpacity: 0.6,
        useLogScale: false,
        openStartRange: false,
        openEndRange: false,
        showPercentValues: true,
        showGroupLabels: true,
        scaleName: 'Faturamento (em milhares)',
        barRoundness: 3,
        showBarOutline: true
    };

    // ==========================================================================
    // INICIALIZAÇÃO
    // ==========================================================================

    function initVisualization() {
        if (typeof d3 === 'undefined') {
            console.error('D3.js não está carregado!');
            return;
        }
        
        console.log('📊 Inicializando Range Distribution Chart...');
        
        // Define largura para Template Controls (quebra automática)
        if (window.OddVizTemplateControls?.setVisualizationWidth) {
            window.OddVizTemplateControls.setVisualizationWidth(RANGE_SETTINGS.fixedWidth, 'wide');
        }
        
        createBaseSVG();
        
        // Carrega dados de exemplo após breve delay
        setTimeout(loadSampleData, 100);
    }

    function loadSampleData() {
        if (window.getSampleData && typeof window.getSampleData === 'function') {
            const sampleData = window.getSampleData();
            if (sampleData?.data) {
                console.log('📊 Carregando dados de exemplo...');
                
                // Atualiza preview de dados no primeiro carregamento
                updateDataPreview(sampleData.data);
                
                const templateState = window.OddVizTemplateControls?.getState() || {};
                renderVisualization(sampleData.data, templateState);
            }
        }
    }

    function createBaseSVG() {
        const chartContainer = document.getElementById('chart');
        if (!chartContainer) return;
        
        // Remove placeholder e SVG anterior
        chartContainer.querySelector('.chart-placeholder')?.remove();
        d3.select(chartContainer).select('svg').remove();
        
        // Cria SVG com dimensões fixas
        vizSvg = d3.select(chartContainer)
            .append('svg')
            .attr('id', 'range-viz')
            .attr('width', RANGE_SETTINGS.fixedWidth)
            .attr('height', RANGE_SETTINGS.fixedHeight);
        
        // Grupos organizados
        vizBarGroup = vizSvg.append('g').attr('class', 'bar-group');
        vizScaleGroup = vizSvg.append('g').attr('class', 'scale-group');
        vizConnectionsGroup = vizSvg.append('g').attr('class', 'connections-group');
    }

    // ==========================================================================
    // FUNÇÃO PARA ATUALIZAR PREVIEW DE DADOS
    // ==========================================================================

    function updateDataPreview(data) {
        const previewContainer = document.getElementById('data-preview');
        if (!previewContainer || !data || !Array.isArray(data)) return;
        
        console.log('📋 Atualizando preview de dados do range chart...');
        
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
    // PROCESSAMENTO DE DADOS
    // ==========================================================================

    function processDataForRange(rawData) {
        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
            return { processedData: [], scaleExtent: [0, 100] };
        }
        
        // Detecção automática de colunas
        const firstRow = rawData[0];
        const columns = Object.keys(firstRow);
        
        if (columns.length < 4) {
            console.warn('Dados insuficientes: necessário pelo menos 4 colunas (grupo, inicio, fim, percentual)');
            return { processedData: [], scaleExtent: [0, 100] };
        }
        
        // Mapeia colunas automaticamente
        const groupColumn = columns[0];
        const startColumn = columns[1];
        const endColumn = columns[2];
        const percentColumn = columns[3];
        
        console.log(`📊 Processando range chart: grupo='${groupColumn}', inicio='${startColumn}', fim='${endColumn}', percentual='${percentColumn}'`);
        
        // Processa dados
        let data = rawData.map(row => ({
            grupo: String(row[groupColumn] || ''),
            inicio: parseFloat(row[startColumn]) || 0,
            fim: parseFloat(row[endColumn]) || 0,
            percentual: parseFloat(row[percentColumn]) || 0,
            original: row
        })).filter(d => d.grupo && d.percentual > 0);
        
        if (data.length === 0) {
            console.warn('Nenhum dado válido encontrado após processamento');
            return { processedData: [], scaleExtent: [0, 100] };
        }
        
        // Calcula extensão da escala
        const allValues = data.flatMap(d => [d.inicio, d.fim]);
        let scaleExtent = [Math.min(...allValues), Math.max(...allValues)];
        
        // Ajusta para escala log se necessário
        if (rangeConfig.useLogScale) {
            // Para escala log, valores devem ser > 0
            const minValue = Math.max(0.1, scaleExtent[0]);
            scaleExtent = [minValue, scaleExtent[1]];
        }
        
        // Ajusta para faixas abertas
        if (rangeConfig.openStartRange && data.length > 0) {
            data[0].isOpenStart = true;
        }
        if (rangeConfig.openEndRange && data.length > 0) {
            data[data.length - 1].isOpenEnd = true;
        }
        
        // Normaliza percentuais para somar 100%
        const totalPercent = data.reduce((sum, d) => sum + d.percentual, 0);
        if (totalPercent > 0) {
            data = data.map(d => ({
                ...d,
                percentualNormalizado: (d.percentual / totalPercent) * 100
            }));
        }
        
        // Calcula posições cumulativas na barra
        let cumulativePercent = 0;
        const processedData = data.map(d => {
            const result = {
                ...d,
                barStart: cumulativePercent,
                barEnd: cumulativePercent + d.percentualNormalizado,
                barWidth: d.percentualNormalizado
            };
            cumulativePercent += d.percentualNormalizado;
            return result;
        });
        
        return { processedData, scaleExtent };
    }

    // ==========================================================================
    // CÁLCULO DE LAYOUT CORRIGIDO
    // ==========================================================================

    function calculateLayout(config) {
        const margins = RANGE_SETTINGS.margins;
        
        let availableWidth = RANGE_SETTINGS.fixedWidth - margins.left - margins.right;
        let availableHeight = RANGE_SETTINGS.fixedHeight - margins.top - margins.bottom;
        
        // ✅ CORREÇÃO: Usa Template Controls para calcular altura exata dos títulos
        const titleLayout = window.OddVizTemplateControls?.renderTitlesWithWrap ? 
            { contentStartY: 120, availableHeight: availableHeight - 70 } : // Fallback
            { contentStartY: 120, availableHeight: availableHeight - 70 };
        
        // Reserva espaço para fonte dos dados
        const sourceHeight = config.dataSource ? 30 : 0;
        
        // MAIOR ESPAÇO PARA SETAS
        const arrowSpace = 80;
        const contentWidth = availableWidth - arrowSpace;
        const contentStartX = margins.left + (arrowSpace / 2);
        
        // ✅ CORREÇÃO: Centralização entre títulos e fonte
        const totalContentHeight = titleLayout.availableHeight - sourceHeight;
        const scaleFixedHeight = 40; // Altura fixa da escala (sem controle)
        
        // Espaço necessário para barra + escala + conexões
        const barHeight = rangeConfig.barHeight;
        const connectionHeight = 80; // Espaço para conexões
        const totalElementsHeight = barHeight + connectionHeight + scaleFixedHeight;
        
        // ✅ CENTRALIZAÇÃO PERFEITA
        const remainingSpace = totalContentHeight - totalElementsHeight;
        const topPadding = Math.max(20, remainingSpace / 2);
        
        const barY = titleLayout.contentStartY + topPadding;
        const scaleY = barY + barHeight + connectionHeight;
        const connectionsStartY = barY + barHeight;
        const connectionsEndY = scaleY;
        
        return {
            margins,
            content: {
                x: contentStartX,
                y: titleLayout.contentStartY,
                width: contentWidth,
                height: totalContentHeight
            },
            bar: {
                x: contentStartX,
                y: barY,
                width: contentWidth,
                height: barHeight
            },
            scale: {
                x: contentStartX,
                y: scaleY,
                width: contentWidth,
                height: scaleFixedHeight // ✅ Altura fixa
            },
            connections: {
                startY: connectionsStartY,
                endY: connectionsEndY,
                height: connectionsEndY - connectionsStartY
            },
            source: {
                y: RANGE_SETTINGS.fixedHeight - margins.bottom + 20
            },
            arrows: {
                leftX: margins.left + 10,
                rightX: margins.left + availableWidth - 10,
                width: arrowSpace / 2
            }
        };
    }

    // ==========================================================================
    // SISTEMA DE CORES
    // ==========================================================================

    function createColorScale() {
        console.log('🎨 Criando escala de cores...');
        
        let colors;
        
        if (vizUsingCustomColors && vizCustomColors.length > 0) {
            colors = vizCustomColors;
            console.log('🎨 Aplicando cores customizadas:', colors);
        } else {
            colors = window.OddVizTemplateControls?.getCurrentColorPalette() || 
                     ['#6F02FD', '#2C0165', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8'];
            console.log('🎨 Aplicando paleta padrão:', colors);
        }
        
        vizColorScale = d3.scaleOrdinal()
            .domain(vizProcessedData.map(d => d.grupo))
            .range(colors);
    }

    function updateCustomColors(customColors) {
        console.log('🎨 Recebendo cores customizadas:', customColors);
        
        if (!customColors || customColors.length === 0) {
            console.warn('⚠️ Cores customizadas vazias, ignorando');
            return;
        }
        
        vizUsingCustomColors = true;
        vizCustomColors = customColors;
        
        if (vizProcessedData && vizProcessedData.length > 0) {
            createColorScale();
            renderVisualization(vizCurrentData, vizCurrentConfig);
        }
    }

    function updateColorPalette(paletteType) {
        console.log('🎨 Mudando para paleta padrão:', paletteType);
        
        vizUsingCustomColors = false;
        vizCustomColors = [];
        
        if (vizProcessedData && vizProcessedData.length > 0) {
            createColorScale();
            renderVisualization(vizCurrentData, vizCurrentConfig);
        }
    }

    // ==========================================================================
    // UTILITÁRIOS DE COR
    // ==========================================================================

    /**
     * Calcula cor de contraste para texto baseado na cor de fundo
     */
    function getContrastColor(backgroundColor) {
        // Remove # se presente
        const hex = backgroundColor.replace('#', '');
        
        // Converte para RGB
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Calcula luminância relativa
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Retorna branco para cores escuras, preto para cores claras
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
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
        
        const result = processDataForRange(data);
        vizProcessedData = result.processedData;
        
        if (vizProcessedData.length === 0) {
            showNoDataMessage();
            return;
        }
        
        vizLayoutInfo = calculateLayout(vizCurrentConfig);
        
        updateSVGDimensions();
        createColorScale();
        
        // Usa Template Controls para renderizar títulos com quebra automática
        if (window.OddVizTemplateControls?.renderTitlesWithWrap) {
            window.OddVizTemplateControls.renderTitlesWithWrap(vizSvg, vizCurrentConfig, {
                width: RANGE_SETTINGS.fixedWidth,
                height: RANGE_SETTINGS.fixedHeight,
                startY: 60
            });
        }
        
        renderPercentageBar();
        renderScale(result.scaleExtent);
        renderConnections();
        renderDataSource();
        
        console.log('📊 Range chart renderizado com', vizProcessedData.length, 'grupos');
    }

    function updateSVGDimensions() {
        if (!vizSvg) return;
        
        vizSvg.attr('width', RANGE_SETTINGS.fixedWidth)
              .attr('height', RANGE_SETTINGS.fixedHeight);
        
        vizSvg.selectAll('.svg-background').remove();
        
        vizSvg.insert('rect', ':first-child')
            .attr('class', 'svg-background')
            .attr('width', RANGE_SETTINGS.fixedWidth)
            .attr('height', RANGE_SETTINGS.fixedHeight)
            .attr('fill', vizCurrentConfig.backgroundColor || '#FFFFFF');
    }

    function renderPercentageBar() {
        vizBarGroup.selectAll('*').remove();
        
        const layout = vizLayoutInfo.bar;
        const barScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, layout.width]);
        
        // ✅ REMOVIDO: Fundo cinza da barra (era o retângulo que você viu)
        // Sem fundo - apenas os segmentos coloridos
        
        // Segmentos da barra
        const segments = vizBarGroup.selectAll('.bar-segment')
            .data(vizProcessedData, d => d.grupo);
        
        const segmentEnter = segments.enter()
            .append('g')
            .attr('class', 'bar-segment');
        
        const segmentRects = segmentEnter.append('rect')
            .attr('class', 'segment-rect')
            .attr('x', d => layout.x + barScale(d.barStart))
            .attr('y', layout.y)
            .attr('width', d => barScale(d.barWidth))
            .attr('height', layout.height)
            .attr('rx', rangeConfig.barRoundness) // ✅ NOVO: Cantos arredondados
            .attr('ry', rangeConfig.barRoundness)
            .attr('fill', d => vizColorScale(d.grupo))
            .style('cursor', 'pointer')
            .on('mouseover', handleSegmentHover)
            .on('mouseout', handleSegmentOut);
        
        // ✅ NOVO: Contorno opcional
        if (rangeConfig.showBarOutline) {
            segmentRects
                .attr('stroke', vizCurrentConfig.textColor || '#2C3E50')
                .attr('stroke-width', 1)
                .style('stroke-opacity', 0.3);
        }
        
        // RÓTULOS DOS PERCENTUAIS com contraste automático
        if (rangeConfig.showPercentValues) {
            segmentEnter.append('text')
                .attr('class', 'segment-percent-label')
                .attr('x', d => layout.x + barScale(d.barStart + d.barWidth / 2))
                .attr('y', layout.y + layout.height / 2)
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .style('fill', d => getContrastColor(vizColorScale(d.grupo)))
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', (vizCurrentConfig.labelSize || 12) + 'px')
                .style('font-weight', '600')
                .style('text-shadow', '0 1px 2px rgba(0,0,0,0.3)')
                .text(d => Math.round(d.percentual) + '%');
        }
        
        // RÓTULOS DOS GRUPOS (acima da barra)
        if (rangeConfig.showGroupLabels) {
            renderGroupLabels(layout, barScale);
        }
    }

    // NOVA FUNÇÃO: Renderiza rótulos dos grupos sem sobreposição
    function renderGroupLabels(layout, barScale) {
        if (vizProcessedData.length === 0) return;
        
        // ✅ NOVO ALGORITMO: Distribui uniformemente entre extremos
        const totalWidth = layout.width;
        const leftX = layout.x; // Extrema esquerda
        const rightX = layout.x + totalWidth; // Extrema direita
        
        const positions = [];
        
        if (vizProcessedData.length === 1) {
            // Um único grupo - centralizado
            positions.push(layout.x + totalWidth / 2);
        } else if (vizProcessedData.length === 2) {
            // Dois grupos - extremos
            positions.push(leftX);
            positions.push(rightX);
        } else {
            // Múltiplos grupos - espalhar uniformemente
            positions.push(leftX); // Primeiro à esquerda
            
            // Distribui os do meio uniformemente
            const middleGroups = vizProcessedData.length - 2;
            const stepSize = totalWidth / (vizProcessedData.length - 1);
            
            for (let i = 1; i <= middleGroups; i++) {
                positions.push(leftX + (stepSize * i));
            }
            
            positions.push(rightX); // Último à direita
        }
        
        // Renderiza os rótulos nas posições calculadas
        vizProcessedData.forEach((d, i) => {
            const color = vizColorScale(d.grupo);
            const xPosition = positions[i];
            
            // Determina alinhamento baseado na posição
            let textAnchor = 'middle';
            if (i === 0 && vizProcessedData.length > 1) {
                textAnchor = 'start'; // Primeiro grupo alinhado à esquerda
            } else if (i === vizProcessedData.length - 1 && vizProcessedData.length > 1) {
                textAnchor = 'end'; // Último grupo alinhado à direita
            }
            
            // Texto do grupo
            vizBarGroup.append('text')
                .attr('class', 'group-label')
                .attr('x', xPosition)
                .attr('y', layout.y - 10) // Acima da barra
                .attr('text-anchor', textAnchor)
                .style('fill', color)
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', (vizCurrentConfig.labelSize || 12) - 1 + 'px')
                .style('font-weight', '600')
                .text(d.grupo);
            
            console.log(`🏷️ Grupo ${i}: "${d.grupo}" → X: ${xPosition.toFixed(1)} (${textAnchor})`);
        });
    }

    function renderScale(scaleExtent) {
        vizScaleGroup.selectAll('*').remove();
        
        const layout = vizLayoutInfo.scale;
        
        // Aplicar EXATAMENTE a mesma lógica usada nas conexões
        let actualScaleExtent = scaleExtent;
        let scaleX;
        
        if (rangeConfig.useLogScale && scaleExtent[0] >= 0) {
            // Ajusta valor mínimo para escala log
            const minValue = Math.max(0.1, scaleExtent[0]);
            actualScaleExtent = [minValue, scaleExtent[1]];
            scaleX = d3.scaleLog()
                .domain(actualScaleExtent)
                .range([0, layout.width]);
            console.log('📊 Usando escala LOG:', actualScaleExtent);
        } else {
            scaleX = d3.scaleLinear()
                .domain(actualScaleExtent)
                .range([0, layout.width]);
            console.log('📊 Usando escala LINEAR:', actualScaleExtent);
        }
        
        // Linha base da escala
        vizScaleGroup.append('line')
            .attr('class', 'scale-line')
            .attr('x1', layout.x)
            .attr('y1', layout.y)
            .attr('x2', layout.x + layout.width)
            .attr('y2', layout.y)
            .attr('stroke', vizCurrentConfig.textColor || '#2C3E50')
            .attr('stroke-width', 2);
        
        // COLETA TODAS AS POSIÇÕES DOS RÓTULOS PARA EVITAR SOBREPOSIÇÃO
        const labelPositions = [];
        
        // Marcadores da escala para cada grupo
        vizProcessedData.forEach((d, i) => {
            // MESMA lógica usada nas conexões
            let startX, endX;
            
            if (d.isOpenStart) {
                startX = layout.x;
            } else {
                // CORRIGIDO: MESMA lógica das conexões
                let adjustedStart = d.inicio;
                if (rangeConfig.useLogScale) {
                    adjustedStart = Math.max(actualScaleExtent[0], d.inicio);
                }
                startX = layout.x + scaleX(adjustedStart);
            }
            
            if (d.isOpenEnd) {
                endX = layout.x + layout.width;
            } else {
                // CORRIGIDO: MESMA lógica das conexões
                let adjustedEnd = d.fim;
                if (rangeConfig.useLogScale) {
                    adjustedEnd = Math.min(actualScaleExtent[1], d.fim);
                }
                endX = layout.x + scaleX(adjustedEnd);
            }
            
            const color = vizColorScale(d.grupo);
            
            // Faixa na escala
            vizScaleGroup.append('rect')
                .attr('class', 'scale-range')
                .attr('x', startX)
                .attr('y', layout.y - 5)
                .attr('width', endX - startX)
                .attr('height', 10)
                .attr('fill', color)
                .style('opacity', 0.7);
            
            // COLETA posições para evitar sobreposição
            const valuesToMark = [];
            if (!d.isOpenStart) valuesToMark.push({ value: d.inicio, x: startX, color: color });
            if (!d.isOpenEnd) valuesToMark.push({ value: d.fim, x: endX, color: color });
            
            valuesToMark.forEach(mark => {
                labelPositions.push(mark);
            });
        });
        
        // RENDERIZA RÓTULOS SEM SOBREPOSIÇÃO
        renderScaleLabelsWithoutOverlap(labelPositions, layout);
        
        // Renderiza nome da escala
        if (rangeConfig.scaleName && rangeConfig.scaleName.trim()) {
            vizScaleGroup.append('text')
                .attr('class', 'scale-name')
                .attr('x', layout.x + layout.width / 2)
                .attr('y', layout.y + 50) // Abaixo dos rótulos dos valores
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', (vizCurrentConfig.labelSize || 12) + 'px')
                .style('font-weight', '600')
                .style('font-style', 'italic')
                .text(rangeConfig.scaleName);
        }
        
        // Renderiza setas em área separada
        renderOpenRangeArrows(actualScaleExtent, scaleX);
    }

    // NOVA FUNÇÃO: Renderiza rótulos evitando sobreposição
    function renderScaleLabelsWithoutOverlap(labelPositions, layout) {
        // Remove duplicatas por valor
        const uniquePositions = [];
        const seenValues = new Set();
        
        labelPositions.forEach(pos => {
            if (!seenValues.has(pos.value)) {
                seenValues.add(pos.value);
                uniquePositions.push(pos);
            }
        });
        
        // Ordena por posição X
        uniquePositions.sort((a, b) => a.x - b.x);
        
        // ESPAÇAMENTO REDUZIDO
        const minDistance = 30; // 30px entre rótulos
        const adjustedPositions = [];
        
        uniquePositions.forEach((pos, i) => {
            let adjustedX = pos.x;
            
            // Verifica sobreposição com rótulo anterior
            if (i > 0) {
                const prevPos = adjustedPositions[i - 1];
                if (adjustedX - prevPos.adjustedX < minDistance) {
                    adjustedX = prevPos.adjustedX + minDistance;
                }
            }
            
            // Verifica se não ultrapassa a área da escala
            const maxX = layout.x + layout.width;
            if (adjustedX > maxX) {
                adjustedX = maxX;
                // Se não cabe, esconde o rótulo sobreposto
                if (adjustedX - (adjustedPositions[i - 1]?.adjustedX || 0) < minDistance) {
                    adjustedPositions.push({ ...pos, adjustedX, hidden: true });
                    return;
                }
            }
            
            adjustedPositions.push({ ...pos, adjustedX });
        });
        
        // Renderiza os rótulos ajustados
        adjustedPositions.forEach(pos => {
            if (pos.hidden) return;
            
            // Linha do marcador
            vizScaleGroup.append('line')
                .attr('class', 'scale-tick')
                .attr('x1', pos.x) // Linha na posição real
                .attr('y1', layout.y - 8)
                .attr('x2', pos.x)
                .attr('y2', layout.y + 8)
                .attr('stroke', pos.color)
                .attr('stroke-width', 2);
            
            // Texto do valor (na posição ajustada se necessário)
            vizScaleGroup.append('text')
                .attr('class', 'scale-label')
                .attr('x', pos.adjustedX) // Texto na posição ajustada
                .attr('y', layout.y + 25)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', (vizCurrentConfig.labelSize || 12) - 1 + 'px')
                .text(formatScaleValue(pos.value));
            
            // LINHA CONECTORA CINZA SÓLIDA se texto foi movido
            if (Math.abs(pos.adjustedX - pos.x) > 5) {
                vizScaleGroup.append('line')
                    .attr('class', 'label-connector')
                    .attr('x1', pos.x)
                    .attr('y1', layout.y + 8)
                    .attr('x2', pos.adjustedX)
                    .attr('y2', layout.y + 20)
                    .attr('stroke', '#999999') // Cinza sólido
                    .attr('stroke-width', 1)
                    .style('opacity', 0.6); // Sem tracejado
            }
        });
    }

    // Renderiza setas para faixas abertas
    function renderOpenRangeArrows(actualScaleExtent, scaleX) {
        const layout = vizLayoutInfo.scale;
        const arrows = vizLayoutInfo.arrows;
        
        vizProcessedData.forEach((d, i) => {
            const color = vizColorScale(d.grupo);
            
            // Seta para faixa inicial aberta - MAIS À ESQUERDA
            if (d.isOpenStart) {
                const arrowX = arrows.leftX + 20; // Mais espaço à esquerda
                
                // Seta apontando para a esquerda
                vizScaleGroup.append('path')
                    .attr('class', 'open-arrow-start')
                    .attr('d', `M ${arrowX} ${layout.y - 5} L ${arrowX - 10} ${layout.y} L ${arrowX} ${layout.y + 5} Z`)
                    .attr('fill', color)
                    .attr('stroke', color)
                    .attr('stroke-width', 1);
                
                // LINHA CONECTORA CINZA SÓLIDA
                vizScaleGroup.append('line')
                    .attr('class', 'arrow-connector')
                    .attr('x1', arrowX)
                    .attr('y1', layout.y)
                    .attr('x2', layout.x)
                    .attr('y2', layout.y)
                    .attr('stroke', '#999999') // Cinza sólido
                    .attr('stroke-width', 1)
                    .style('opacity', 0.6); // Sem tracejado
                
                // TEXTO ALINHADO COM RÓTULOS DA ESCALA
                vizScaleGroup.append('text')
                    .attr('class', 'open-label-start')
                    .attr('x', arrowX - 5)
                    .attr('y', layout.y + 25) // MESMO Y dos rótulos normais
                    .attr('text-anchor', 'middle')
                    .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                    .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                    .style('font-size', (vizCurrentConfig.labelSize || 12) - 1 + 'px') // MESMO tamanho
                    .style('font-style', 'italic')
                    .text('< ' + formatScaleValue(d.fim));
            }
            
            // Seta para faixa final aberta - MAIS À DIREITA
            if (d.isOpenEnd) {
                const arrowX = arrows.rightX - 20; // Bem mais à direita, fora da escala
                
                // Seta apontando para a direita
                vizScaleGroup.append('path')
                    .attr('class', 'open-arrow-end')
                    .attr('d', `M ${arrowX} ${layout.y - 5} L ${arrowX + 10} ${layout.y} L ${arrowX} ${layout.y + 5} Z`)
                    .attr('fill', color)
                    .attr('stroke', color)
                    .attr('stroke-width', 1);
                
                // LINHA CONECTORA CINZA SÓLIDA
                vizScaleGroup.append('line')
                    .attr('class', 'arrow-connector')
                    .attr('x1', arrowX)
                    .attr('y1', layout.y)
                    .attr('x2', layout.x + layout.width)
                    .attr('y2', layout.y)
                    .attr('stroke', '#999999') // Cinza sólido
                    .attr('stroke-width', 1)
                    .style('opacity', 0.6); // Sem tracejado
                
                // TEXTO ALINHADO COM RÓTULOS DA ESCALA
                vizScaleGroup.append('text')
                    .attr('class', 'open-label-end')
                    .attr('x', arrowX + 5)
                    .attr('y', layout.y + 25) // MESMO Y dos rótulos normais
                    .attr('text-anchor', 'middle')
                    .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                    .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                    .style('font-size', (vizCurrentConfig.labelSize || 12) - 1 + 'px') // MESMO tamanho
                    .style('font-style', 'italic')
                    .text('> ' + formatScaleValue(d.inicio));
            }
        });
    }

    function renderConnections() {
        vizConnectionsGroup.selectAll('*').remove();
        
        if (!rangeConfig.showConnections) {
            console.log('🔗 Conexões desabilitadas, pulando renderização');
            return;
        }
        
        const barLayout = vizLayoutInfo.bar;
        const scaleLayout = vizLayoutInfo.scale;
        const connections = vizLayoutInfo.connections;
        
        const barScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, barLayout.width]);
        
        // Recalcula escala EXATAMENTE como na renderScale
        const rawExtent = [
            Math.min(...vizProcessedData.map(d => d.inicio)), 
            Math.max(...vizProcessedData.map(d => d.fim))
        ];
        
        let scaleX;
        let actualScaleExtent = rawExtent;
        
        if (rangeConfig.useLogScale && rawExtent[0] >= 0) {
            const minValue = Math.max(0.1, rawExtent[0]);
            actualScaleExtent = [minValue, rawExtent[1]];
            scaleX = d3.scaleLog()
                .domain(actualScaleExtent)
                .range([0, scaleLayout.width]);
            console.log('🔗 Usando escala LOG para conexões:', actualScaleExtent);
        } else {
            scaleX = d3.scaleLinear()
                .domain(actualScaleExtent)
                .range([0, scaleLayout.width]);
            console.log('🔗 Usando escala LINEAR para conexões:', actualScaleExtent);
        }
        
        // ✅ RENDERIZA BASEADO NO ESTILO SELECIONADO
        if (rangeConfig.connectionStyle === 'fill') {
            renderConnectionFills(barLayout, scaleLayout, connections, barScale, scaleX, actualScaleExtent);
        } else {
            renderConnectionLines(barLayout, scaleLayout, connections, barScale, scaleX, actualScaleExtent);
        }
    }

    // ✅ NOVA FUNÇÃO: Renderiza preenchimento entre as áreas
    function renderConnectionFills(barLayout, scaleLayout, connections, barScale, scaleX, actualScaleExtent) {
        vizProcessedData.forEach((d, i) => {
            const color = vizColorScale(d.grupo);
            
            // Pontos na barra
            const barStartX = barLayout.x + barScale(d.barStart);
            const barEndX = barLayout.x + barScale(d.barEnd);
            
            // Pontos na escala
            let scaleStartX, scaleEndX;
            
            if (d.isOpenStart) {
                scaleStartX = scaleLayout.x;
            } else {
                let adjustedStart = d.inicio;
                if (rangeConfig.useLogScale) {
                    adjustedStart = Math.max(actualScaleExtent[0], d.inicio);
                }
                scaleStartX = scaleLayout.x + scaleX(adjustedStart);
            }
            
            if (d.isOpenEnd) {
                scaleEndX = scaleLayout.x + scaleLayout.width;
            } else {
                let adjustedEnd = d.fim;
                if (rangeConfig.useLogScale) {
                    adjustedEnd = Math.min(actualScaleExtent[1], d.fim);
                }
                scaleEndX = scaleLayout.x + scaleX(adjustedEnd);
            }
            
            // ✅ CRIA ÁREA DE PREENCHIMENTO
            const pathData = [
                [barStartX, connections.startY],    // Início da barra
                [barEndX, connections.startY],      // Fim da barra
                [scaleEndX, connections.endY],      // Fim da escala
                [scaleStartX, connections.endY],    // Início da escala
                [barStartX, connections.startY]     // Fecha o caminho
            ];
            
            const pathString = d3.line()(pathData);
            
            vizConnectionsGroup.append('path')
                .attr('class', `connection-fill connection-fill-${i}`)
                .attr('d', pathString)
                .attr('fill', color)
                .attr('stroke', 'none')
                .style('opacity', rangeConfig.connectionOpacity);
            
            console.log(`🔗 Fill ${d.grupo}: Bar[${barStartX.toFixed(1)}-${barEndX.toFixed(1)}] → Scale[${scaleStartX.toFixed(1)}-${scaleEndX.toFixed(1)}]`);
        });
    }

    // ✅ FUNÇÃO ATUALIZADA: Renderiza linhas conectoras
    function renderConnectionLines(barLayout, scaleLayout, connections, barScale, scaleX, actualScaleExtent) {
        vizProcessedData.forEach((d, i) => {
            const color = vizColorScale(d.grupo);
            
            // Pontos de conexão na barra (bordas do segmento)
            const barStartX = barLayout.x + barScale(d.barStart);
            const barEndX = barLayout.x + barScale(d.barEnd);
            
            // RECALCULA POSIÇÕES com a escala CORRETA
            let scaleStartX, scaleEndX;
            
            if (d.isOpenStart) {
                scaleStartX = scaleLayout.x;
            } else {
                let adjustedStart = d.inicio;
                if (rangeConfig.useLogScale) {
                    adjustedStart = Math.max(actualScaleExtent[0], d.inicio);
                }
                scaleStartX = scaleLayout.x + scaleX(adjustedStart);
            }
            
            if (d.isOpenEnd) {
                scaleEndX = scaleLayout.x + scaleLayout.width;
            } else {
                let adjustedEnd = d.fim;
                if (rangeConfig.useLogScale) {
                    adjustedEnd = Math.min(actualScaleExtent[1], d.fim);
                }
                scaleEndX = scaleLayout.x + scaleX(adjustedEnd);
            }
            
            console.log(`🔗 Lines ${d.grupo}: Bar[${barStartX.toFixed(1)}-${barEndX.toFixed(1)}] → Scale[${scaleStartX.toFixed(1)}-${scaleEndX.toFixed(1)}] (${rangeConfig.useLogScale ? 'LOG' : 'LINEAR'})`);
            
            // Linhas conectoras das bordas
            const connectionPaths = [
                `M ${barStartX} ${connections.startY} L ${scaleStartX} ${connections.endY}`,
                `M ${barEndX} ${connections.startY} L ${scaleEndX} ${connections.endY}`
            ];
            
            connectionPaths.forEach((path, pathIndex) => {
                const connectionLine = vizConnectionsGroup.append('path')
                    .attr('class', `connection-line connection-${i}-${pathIndex}`)
                    .attr('d', path)
                    .attr('stroke', color)
                    .attr('stroke-width', rangeConfig.connectionStroke)
                    .attr('fill', 'none')
                    .style('opacity', rangeConfig.connectionOpacity);
                
                // ✅ APLICA ESTILO DE LINHA
                if (rangeConfig.connectionStyle === 'solid') {
                    connectionLine.attr('stroke-dasharray', 'none');
                } else if (rangeConfig.connectionStyle === 'dashed') {
                    connectionLine.attr('stroke-dasharray', '6,4');
                }
            });
        });
    }

    function renderDataSource() {
        vizSvg.selectAll('.chart-source-svg').remove();
        
        if (vizCurrentConfig.dataSource) {
            vizSvg.append('text')
                .attr('class', 'chart-source-svg')
                .attr('x', RANGE_SETTINGS.fixedWidth / 2)
                .attr('y', vizLayoutInfo.source.y)
                .attr('text-anchor', 'middle')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', '11px')
                .style('opacity', 0.6)
                .text(vizCurrentConfig.dataSource); // ✅ CORRIGIDO: Sem "Fonte:" duplicado
        }
    }

    // ==========================================================================
    // INTERAÇÕES
    // ==========================================================================

    function handleSegmentHover(event, d) {
        d3.select(event.target)
            .transition()
            .duration(200)
            .style('opacity', 0.8);
        
        showTooltip(event, d);
    }

    function handleSegmentOut(event, d) {
        d3.select(event.target)
            .transition()
            .duration(200)
            .style('opacity', 1);
        
        hideTooltip();
    }

    function showTooltip(event, d) {
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
            .html(`
                <div style="font-weight: bold; margin-bottom: 4px;">${d.grupo}</div>
                <div>Faixa: ${formatScaleValue(d.inicio)} - ${formatScaleValue(d.fim)}</div>
                <div>Percentual: ${Math.round(d.percentual)}%</div>
            `);
        
        tooltip.transition().duration(200).style('opacity', 1);
    }

    function hideTooltip() {
        d3.selectAll('.viz-tooltip').remove();
    }

    // ==========================================================================
    // UTILITÁRIOS
    // ==========================================================================

    function formatScaleValue(value) {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
            return (value / 1000).toFixed(0) + 'k';
        }
        return value.toString();
    }

    function showNoDataMessage() {
        if (!vizSvg) return;
        
        vizSvg.selectAll('*').remove();
        
        const config = vizCurrentConfig || {};
        
        vizSvg.append('rect')
            .attr('class', 'svg-background')
            .attr('width', RANGE_SETTINGS.fixedWidth)
            .attr('height', RANGE_SETTINGS.fixedHeight)
            .attr('fill', config.backgroundColor || '#FFFFFF');
        
        const message = vizSvg.append('g')
            .attr('class', 'no-data-message')
            .attr('transform', `translate(${RANGE_SETTINGS.fixedWidth / 2}, ${RANGE_SETTINGS.fixedHeight / 2})`);
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-20px')
            .style('fill', config.textColor || '#2C3E50')
            .style('font-family', config.fontFamily || 'Inter')
            .style('font-size', '24px')
            .text('📊');
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '10px')
            .style('fill', config.textColor || '#2C3E50')
            .style('font-family', config.fontFamily || 'Inter')
            .style('font-size', '16px')
            .text('Carregue dados para visualizar');
    }

    // ==========================================================================
    // FUNÇÕES DE ATUALIZAÇÃO (vindas do config.js)
    // ==========================================================================

    function onUpdate(newConfig) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        console.log('🔄 Atualizando range chart com nova configuração do template');
        
        vizCurrentConfig = newConfig;
        renderVisualization(vizCurrentData, vizCurrentConfig);
    }

    function onRangeControlsUpdate(rangeControls) {
        Object.assign(rangeConfig, rangeControls);
        
        console.log('📊 Controles range atualizados:', rangeControls);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            renderVisualization(vizCurrentData, vizCurrentConfig);
        }
    }

    function onDataLoaded(processedData) {
        if (processedData?.data) {
            console.log('📊 Novos dados carregados:', processedData.data.length + ' linhas');
            
            updateDataPreview(processedData.data);
            
            const templateState = window.OddVizTemplateControls?.getState() || {};
            renderVisualization(processedData.data, templateState);
        }
    }

    // ==========================================================================
    // EXPORTAÇÕES GLOBAIS
    // ==========================================================================

    window.RangeVisualization = {
        initVisualization: initVisualization,
        renderVisualization: renderVisualization,
        onUpdate: onUpdate,
        onRangeControlsUpdate: onRangeControlsUpdate,
        onDataLoaded: onDataLoaded,
        
        // Funções para sistema de cores
        updateColorPalette: updateColorPalette,
        updateCustomColors: updateCustomColors,
        updateDataPreview: updateDataPreview,
        
        RANGE_SETTINGS: RANGE_SETTINGS,
        
        // Acesso para debug
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