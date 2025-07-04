/**
 * MAPA COROPLÉTICO BRASIL + GRÁFICO DE BARRAS - LIMPO
 * Arquivo recriado para forçar atualização do cache
 */

(function() {
    'use strict';

    // CONFIGURAÇÕES
    const BRAZIL_MAP_SETTINGS = {
        fixedWidth: 800,
        fixedHeight: 600,
        margins: { top: 60, right: 60, bottom: 80, left: 60 },
        mapArea: { width: 350, height: 400 },
        barsArea: { width: 300, height: 400 },
        mapToBarsSeparation: 70
    };

    const BRAZIL_MAP_DEFAULTS = {
        scaleType: 'continuous',
        scaleDivisions: 5,
        paletteType: 'sequential',
        colorMin: '#E8F4FD',
        colorMax: '#2C0165',
        colorLow: '#6F02FD',
        colorMid: '#FAF9FA',
        colorHigh: '#6CDADE',
        divergingMidValue: 50,
        noDataColor: '#E0E0E0',
        mapStrokeWidth: 1,
        mapStrokeColor: '#FFFFFF',
        barOpacity: 0.8,
        showStateLabels: true,
        showBarValues: true
    };

    // VARIÁVEIS
    let vizSvg = null;
    let vizMapGroup = null;
    let vizBarsGroup = null;
    let vizCurrentData = null;
    let vizProcessedData = null;
    let vizCurrentConfig = null;
    let vizLayoutInfo = null;
    let vizBrazilTopology = null;
    let vizColorScale = null;

    // FUNÇÃO DE CONTRASTE
    function calculateTextContrastColor(backgroundColor) {
        if (!backgroundColor) return '#000000';
        
        let r, g, b;
        
        if (backgroundColor.startsWith('rgb(')) {
            const matches = backgroundColor.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
            if (matches) {
                r = parseInt(matches[1]);
                g = parseInt(matches[2]);
                b = parseInt(matches[3]);
            } else {
                return '#000000';
            }
        } else {
            const hex = backgroundColor.replace('#', '');
            if (hex.length !== 6) return '#000000';
            
            r = parseInt(hex.substr(0, 2), 16);
            g = parseInt(hex.substr(2, 2), 16);
            b = parseInt(hex.substr(4, 2), 16);
        }
        
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    // INICIALIZAÇÃO
    function initVisualization() {
        if (typeof d3 === 'undefined') {
            console.error('D3.js não carregado');
            return;
        }
        
        if (window.OddVizTemplateControls?.setVisualizationWidth) {
            window.OddVizTemplateControls.setVisualizationWidth(BRAZIL_MAP_SETTINGS.fixedWidth, 'wide');
        }
        
        createBaseSVG();
        loadBrazilTopology();
        setTimeout(loadSampleData, 500);
    }

    function createBaseSVG() {
        const chartContainer = document.getElementById('chart');
        if (!chartContainer) return;
        
        chartContainer.querySelector('.chart-placeholder')?.remove();
        d3.select(chartContainer).select('svg').remove();
        
        vizSvg = d3.select(chartContainer)
            .append('svg')
            .attr('id', 'brazil-map-viz')
            .attr('width', BRAZIL_MAP_SETTINGS.fixedWidth)
            .attr('height', BRAZIL_MAP_SETTINGS.fixedHeight);
        
        vizMapGroup = vizSvg.append('g').attr('class', 'map-group');
        vizBarsGroup = vizSvg.append('g').attr('class', 'bars-group');
    }

    function loadBrazilTopology() {
        try {
            const topologyData = window.brazilTopologyData;
            if (topologyData) {
                vizBrazilTopology = topologyData;
                console.log('✅ Topologia carregada');
            } else {
                console.error('❌ Topologia não encontrada');
            }
        } catch (error) {
            console.error('❌ Erro topologia:', error);
        }
    }

    function loadSampleData() {
        if (window.getSampleData && typeof window.getSampleData === 'function') {
            const sampleData = window.getSampleData();
            if (sampleData && sampleData.data) {
                console.log('📊 Dados de exemplo carregados');
                
                updateDataPreview(sampleData.data);
                
                const templateConfig = window.OddVizTemplateControls?.getState() || {};
                const specificConfig = window.BrazilMapVizConfig?.currentConfig || {};
                const mergedConfig = createMergedConfig(templateConfig, specificConfig);
                
                renderVisualization(sampleData.data, mergedConfig);
            }
        }
    }

    function updateDataPreview(data) {
        const previewContainer = document.getElementById('data-preview');
        if (!previewContainer || !data || !Array.isArray(data)) return;
        
        const maxRows = 8;
        const displayData = data.slice(0, maxRows);
        
        if (displayData.length === 0) {
            previewContainer.innerHTML = '<p class="data-placeholder">Nenhum dado disponível</p>';
            return;
        }
        
        let tableHTML = '<div class="preview-table-wrapper"><table class="preview-table">';
        
        const headers = Object.keys(displayData[0]);
        tableHTML += '<thead><tr>';
        headers.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });
        tableHTML += '</tr></thead>';
        
        tableHTML += '<tbody>';
        displayData.forEach(row => {
            tableHTML += '<tr>';
            headers.forEach(header => {
                const value = row[header];
                const displayValue = typeof value === 'number' ? 
                    (value >= 1000000 ? (value / 1000000).toFixed(1) + 'M' : 
                     value >= 1000 ? (value / 1000).toFixed(1) + 'K' : value.toString()) : 
                    value;
                tableHTML += `<td>${displayValue}</td>`;
            });
            tableHTML += '</tr>';
        });
        tableHTML += '</tbody></table>';
        
        if (data.length > maxRows) {
            tableHTML += `<p class="preview-footer">Mostrando ${maxRows} de ${data.length} estados</p>`;
        }
        
        tableHTML += '</div>';
        previewContainer.innerHTML = tableHTML;
    }

    function createMergedConfig(templateConfig, specificConfig) {
        const mergedConfig = Object.assign({}, BRAZIL_MAP_DEFAULTS);
        
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
            scaleType: document.querySelector('input[name="scale-type"]:checked')?.value || BRAZIL_MAP_DEFAULTS.scaleType,
            scaleDivisions: parseInt(document.getElementById('scale-divisions')?.value) || BRAZIL_MAP_DEFAULTS.scaleDivisions,
            paletteType: document.querySelector('input[name="palette-type"]:checked')?.value || BRAZIL_MAP_DEFAULTS.paletteType,
            colorMin: document.getElementById('color-min')?.value || BRAZIL_MAP_DEFAULTS.colorMin,
            colorMax: document.getElementById('color-max')?.value || BRAZIL_MAP_DEFAULTS.colorMax,
            colorLow: document.getElementById('color-low')?.value || BRAZIL_MAP_DEFAULTS.colorLow,
            colorMid: document.getElementById('color-mid')?.value || BRAZIL_MAP_DEFAULTS.colorMid,
            colorHigh: document.getElementById('color-high')?.value || BRAZIL_MAP_DEFAULTS.colorHigh,
            divergingMidValue: parseFloat(document.getElementById('diverging-mid-value')?.value) || BRAZIL_MAP_DEFAULTS.divergingMidValue,
            noDataColor: document.getElementById('no-data-color')?.value || BRAZIL_MAP_DEFAULTS.noDataColor,
            mapStrokeWidth: parseFloat(document.getElementById('map-stroke-width')?.value) || BRAZIL_MAP_DEFAULTS.mapStrokeWidth,
            mapStrokeColor: document.getElementById('map-stroke-color')?.value || BRAZIL_MAP_DEFAULTS.mapStrokeColor,
            barOpacity: parseFloat(document.getElementById('bar-opacity')?.value) || BRAZIL_MAP_DEFAULTS.barOpacity,
            showStateLabels: document.getElementById('show-state-labels')?.checked !== false,
            showBarValues: document.getElementById('show-bar-values')?.checked !== false
        };
    }

    function processDataForBrazilMap(rawData) {
        if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
            return { processedData: [], stateData: new Map() };
        }
        
        const firstRow = rawData[0];
        const columns = Object.keys(firstRow);
        
        if (columns.length < 2) {
            return { processedData: [], stateData: new Map() };
        }
        
        const stateColumn = columns[0];
        const valueColumn = columns[1];
        
        const stateData = new Map();
        const processedData = [];
        
        rawData.forEach(row => {
            const rawState = row[stateColumn];
            const rawValue = parseFloat(row[valueColumn]);
            
            if (!rawState || isNaN(rawValue)) return;
            
            const stateCode = window.BrazilMapVizConfig?.normalizeStateName(rawState);
            if (!stateCode) return;
            
            const stateFullName = window.BrazilMapVizConfig?.getStateFullName(stateCode);
            
            const dataPoint = {
                state: stateCode,
                stateName: stateFullName,
                value: rawValue,
                formattedValue: window.BrazilMapVizConfig?.formatValue(rawValue),
                original: row
            };
            
            stateData.set(stateCode, dataPoint);
            processedData.push(dataPoint);
        });
        
        processedData.sort((a, b) => b.value - a.value);
        
        return { processedData, stateData };
    }

    function createColorScale(data, config) {
        const values = data.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        
        if (config.scaleType === 'continuous') {
            if (config.paletteType === 'sequential') {
                return d3.scaleSequential()
                    .domain([minValue, maxValue])
                    .interpolator(d3.interpolateRgb(config.colorMin, config.colorMax));
            } else {
                const midValue = config.divergingMidValue || ((minValue + maxValue) / 2);
                return d3.scaleLinear()
                    .domain([minValue, midValue, maxValue])
                    .range([config.colorLow, config.colorMid, config.colorHigh])
                    .interpolate(d3.interpolateRgb);
            }
        } else {
            // Escala com divisões
            const range = maxValue - minValue;
            const step = range / config.scaleDivisions;
            const thresholds = [];
            
            for (let i = 0; i <= config.scaleDivisions; i++) {
                thresholds.push(minValue + (i * step));
            }
            
            if (config.paletteType === 'sequential') {
                const colorScale = d3.scaleSequential()
                    .domain([0, config.scaleDivisions - 1])
                    .interpolator(d3.interpolateRgb(config.colorMin, config.colorMax));
                
                return (value) => {
                    for (let i = 0; i < thresholds.length - 1; i++) {
                        if (value >= thresholds[i] && value < thresholds[i + 1]) {
                            return colorScale(i);
                        }
                    }
                    return colorScale(config.scaleDivisions - 1);
                };
            } else {
                // Divergente com valor médio personalizado
                const midValue = config.divergingMidValue || ((minValue + maxValue) / 2);
                const halfDivisions = Math.floor(config.scaleDivisions / 2);
                
                const lowThresholds = [];
                const highThresholds = [];
                
                for (let i = 0; i <= halfDivisions; i++) {
                    lowThresholds.push(minValue + (i * (midValue - minValue) / halfDivisions));
                }
                
                for (let i = 0; i <= halfDivisions; i++) {
                    highThresholds.push(midValue + (i * (maxValue - midValue) / halfDivisions));
                }
                
                const allThresholds = [...lowThresholds, ...highThresholds.slice(1)];
                
                const colorScale = d3.scaleLinear()
                    .domain([0, halfDivisions, config.scaleDivisions - 1])
                    .range([config.colorLow, config.colorMid, config.colorHigh])
                    .interpolate(d3.interpolateRgb);
                
                return (value) => {
                    for (let i = 0; i < allThresholds.length - 1; i++) {
                        if (value >= allThresholds[i] && value < allThresholds[i + 1]) {
                            return colorScale(i);
                        }
                    }
                    return colorScale(config.scaleDivisions - 1);
                };
            }
        }
    }

    function renderVisualization(data, config) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            showNoDataMessage();
            return;
        }
        
        if (!vizBrazilTopology) {
            showErrorMessage('Mapa do Brasil não carregado');
            return;
        }
        
        vizCurrentData = data;
        vizCurrentConfig = config;
        
        const result = processDataForBrazilMap(data);
        vizProcessedData = result.processedData;
        
        if (vizProcessedData.length === 0) {
            showNoDataMessage();
            return;
        }
        
        vizColorScale = createColorScale(vizProcessedData, vizCurrentConfig);
        vizLayoutInfo = calculateLayout(vizCurrentConfig);
        
        updateSVGDimensions();
        
        renderMap(result.stateData);
        renderBars(vizProcessedData);
        
        console.log('✅ Renderização concluída');
    }

    function calculateLayout(config) {
        const margins = BRAZIL_MAP_SETTINGS.margins;
        
        let titlesLayoutInfo = { contentStartY: margins.top + 50, availableHeight: 400 };
        
        if (window.OddVizTemplateControls?.renderTitlesWithWrap) {
            titlesLayoutInfo = window.OddVizTemplateControls.renderTitlesWithWrap(vizSvg, config, {
                width: BRAZIL_MAP_SETTINGS.fixedWidth,
                height: BRAZIL_MAP_SETTINGS.fixedHeight,
                startY: 50
            });
        }
        
        const availableHeight = titlesLayoutInfo.availableHeight || 400;
        const contentStartY = titlesLayoutInfo.contentStartY || (margins.top + 50);
        
        const totalContentWidth = BRAZIL_MAP_SETTINGS.mapArea.width + 
                                  BRAZIL_MAP_SETTINGS.mapToBarsSeparation + 
                                  BRAZIL_MAP_SETTINGS.barsArea.width;
        
        const availableWidth = BRAZIL_MAP_SETTINGS.fixedWidth - margins.left - margins.right;
        const offsetX = Math.max(0, (availableWidth - totalContentWidth) / 2);
        
        const mapArea = {
            x: margins.left + offsetX,
            y: contentStartY,
            width: BRAZIL_MAP_SETTINGS.mapArea.width,
            height: Math.min(availableHeight, BRAZIL_MAP_SETTINGS.mapArea.height)
        };
        
        const barsArea = {
            x: margins.left + offsetX + BRAZIL_MAP_SETTINGS.mapArea.width + BRAZIL_MAP_SETTINGS.mapToBarsSeparation,
            y: contentStartY,
            width: BRAZIL_MAP_SETTINGS.barsArea.width,
            height: Math.min(availableHeight, BRAZIL_MAP_SETTINGS.barsArea.height)
        };
        
        return { mapArea, barsArea, titlesLayoutInfo };
    }

    function updateSVGDimensions() {
        if (!vizSvg) return;
        
        vizSvg.attr('width', BRAZIL_MAP_SETTINGS.fixedWidth)
              .attr('height', BRAZIL_MAP_SETTINGS.fixedHeight);
        
        vizSvg.selectAll('.svg-background').remove();
        
        vizSvg.insert('rect', ':first-child')
            .attr('class', 'svg-background')
            .attr('width', BRAZIL_MAP_SETTINGS.fixedWidth)
            .attr('height', BRAZIL_MAP_SETTINGS.fixedHeight)
            .attr('fill', vizCurrentConfig.backgroundColor || '#FFFFFF');
    }

    function renderMap(stateData) {
        if (!vizBrazilTopology) return;
        
        vizMapGroup.selectAll('*').remove();
        
        const mapArea = vizLayoutInfo.mapArea;
        
        const projection = d3.geoMercator()
            .fitSize([mapArea.width, mapArea.height], 
                     topojson.feature(vizBrazilTopology, vizBrazilTopology.objects.estados));
        
        const path = d3.geoPath().projection(projection);
        
        const mapContainer = vizMapGroup.append('g')
            .attr('transform', `translate(${mapArea.x}, ${mapArea.y})`);
        
        // Estados
        mapContainer.selectAll('.state')
            .data(topojson.feature(vizBrazilTopology, vizBrazilTopology.objects.estados).features)
            .enter()
            .append('path')
            .attr('class', 'state')
            .attr('id', d => 'state-' + d.id)
            .attr('d', path)
            .attr('fill', d => {
                const data = stateData.get(d.id);
                return data ? vizColorScale(data.value) : (vizCurrentConfig.noDataColor || '#E0E0E0');
            })
            .attr('stroke', vizCurrentConfig.mapStrokeColor)
            .attr('stroke-width', vizCurrentConfig.mapStrokeWidth)
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                handleMapHover(event, d, stateData);
            })
            .on('mouseout', function(event, d) {
                handleMapOut(event, d);
            })
            .on('click', function(event, d) {
                handleMapClick(event, d, stateData);
            });
        
        // SIGLAS DOS ESTADOS
        if (vizCurrentConfig.showStateLabels) {
            mapContainer.selectAll('.state-label')
                .data(topojson.feature(vizBrazilTopology, vizBrazilTopology.objects.estados).features)
                .enter()
                .append('text')
                .attr('class', 'state-label')
                .attr('x', d => path.centroid(d)[0])
                .attr('y', d => path.centroid(d)[1])
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', (vizCurrentConfig.valueSize || 8) + 'px')
                .style('font-weight', '600')
                .style('pointer-events', 'none')
                .style('fill', function(d) {
                    const data = stateData.get(d.id);
                    const stateColor = data ? vizColorScale(data.value) : vizCurrentConfig.noDataColor;
                    return calculateTextContrastColor(stateColor);
                })
                .style('stroke', function(d) {
                    const data = stateData.get(d.id);
                    return data ? vizColorScale(data.value) : vizCurrentConfig.noDataColor;
                })
                .style('stroke-width', '1px')
                .style('paint-order', 'stroke fill')
                .text(d => d.id);
        }
    }

    function renderBars(data) {
        vizBarsGroup.selectAll('*').remove();
        
        const barsArea = vizLayoutInfo.barsArea;
        const titleHeight = 25;
        const bottomMargin = 10;
        const availableBarHeight = barsArea.height - titleHeight - bottomMargin;
        
        const maxBarHeight = 12;
        const minBarHeight = 8;
        const barSpacing = 1;
        
        const maxBarsForHeight = Math.floor(availableBarHeight / (minBarHeight + barSpacing));
        const actualBarCount = Math.min(data.length, maxBarsForHeight);
        
        let barHeight;
        if (actualBarCount >= data.length) {
            barHeight = Math.min(maxBarHeight, Math.floor(availableBarHeight / data.length) - barSpacing);
        } else {
            barHeight = minBarHeight;
        }
        
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.value)])
            .range([0, barsArea.width - 80]);
        
        const barsContainer = vizBarsGroup.append('g')
            .attr('transform', `translate(${barsArea.x}, ${barsArea.y + 10})`);
        
        barsContainer.append('text')
            .attr('class', 'bars-title')
            .attr('x', 0)
            .attr('y', 0)
            .style('fill', vizCurrentConfig.textColor || '#2C3E50')
            .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
            .style('font-size', (vizCurrentConfig.labelSize || 12) + 'px')
            .style('font-weight', '600')
            .text('Ranking por Estado');
        
        const visibleData = data.slice(0, actualBarCount);
        
        const bars = barsContainer.selectAll('.bar-group')
            .data(visibleData)
            .enter()
            .append('g')
            .attr('class', 'bar-group')
            .attr('transform', (d, i) => `translate(0, ${titleHeight + (i * (barHeight + barSpacing))})`);
        
        bars.append('rect')
            .attr('class', 'bar')
            .attr('id', d => 'bar-' + d.state)
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', d => xScale(d.value))
            .attr('height', barHeight)
            .attr('fill', d => vizColorScale(d.value))
            .attr('opacity', vizCurrentConfig.barOpacity)
            .style('cursor', 'pointer')
            .on('mouseover', function(event, d) {
                handleBarHover(event, d);
            })
            .on('mouseout', function(event, d) {
                handleBarOut(event, d);
            })
            .on('click', function(event, d) {
                handleBarClick(event, d);
            });
        
        bars.append('text')
            .attr('class', 'bar-label')
            .attr('x', -3)
            .attr('y', barHeight / 2)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .style('fill', vizCurrentConfig.textColor || '#2C3E50')
            .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
            .style('font-size', Math.min(10, barHeight - 2) + 'px')
            .style('font-weight', '600')
            .text(d => d.state);
        
        if (vizCurrentConfig.showBarValues) {
            bars.append('text')
                .attr('class', 'bar-value')
                .attr('x', d => xScale(d.value) + 3)
                .attr('y', barHeight / 2)
                .attr('text-anchor', 'start')
                .attr('dominant-baseline', 'middle')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', Math.min(9, barHeight - 3) + 'px')
                .style('font-weight', '500')
                .text(d => d.formattedValue);
        }
    }

    function showNoDataMessage() {
        if (!vizSvg) return;
        
        vizSvg.selectAll('*').remove();
        
        const message = vizSvg.append('g')
            .attr('transform', `translate(${BRAZIL_MAP_SETTINGS.fixedWidth / 2}, ${BRAZIL_MAP_SETTINGS.fixedHeight / 2})`);
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .text('Carregue dados para visualizar o mapa');
    }

    function showErrorMessage(errorText) {
        if (!vizSvg) return;
        
        vizSvg.selectAll('*').remove();
        
        const message = vizSvg.append('g')
            .attr('transform', `translate(${BRAZIL_MAP_SETTINGS.fixedWidth / 2}, ${BRAZIL_MAP_SETTINGS.fixedHeight / 2})`);
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .text(errorText);
    }

    // FUNÇÕES DE INTERAÇÃO
    function handleMapHover(event, d, stateData) {
        const data = stateData.get(d.id);
        
        if (data) {
            d3.select('#state-' + d.id).classed('highlighted', true);
            d3.select('#bar-' + d.id).classed('highlighted', true);
        } else {
            d3.select('#state-' + d.id).classed('highlighted', true);
        }
        
        vizSvg.selectAll('.state:not(.highlighted)').classed('dimmed', true);
        if (data) {
            vizSvg.selectAll('.bar:not(.highlighted)').classed('dimmed', true);
        }
        
        showTooltip(event, {
            state: d.id,
            stateName: d.properties.nome,
            value: data ? data.value : null,
            formattedValue: data ? data.formattedValue : 'Sem dados'
        });
    }

    function handleMapOut(event, d) {
        d3.selectAll('.highlighted').classed('highlighted', false);
        d3.selectAll('.dimmed').classed('dimmed', false);
        hideTooltip();
    }

    function handleMapClick(event, d, stateData) {
        const data = stateData.get(d.id);
        
        if (window.OddVizApp?.showNotification) {
            const message = data ? 
                `${d.properties.nome} (${d.id}): ${data.formattedValue}` :
                `${d.properties.nome} (${d.id}): Sem dados`;
            window.OddVizApp.showNotification(message, 'info');
        }
    }

    function handleBarHover(event, d) {
        d3.select('#bar-' + d.state).classed('highlighted', true);
        d3.select('#state-' + d.state).classed('highlighted', true);
        
        vizSvg.selectAll('.state:not(.highlighted)').classed('dimmed', true);
        vizSvg.selectAll('.bar:not(.highlighted)').classed('dimmed', true);
        
        showTooltip(event, {
            state: d.state,
            stateName: d.stateName,
            value: d.value,
            formattedValue: d.formattedValue
        });
    }

    function handleBarOut(event, d) {
        d3.selectAll('.highlighted').classed('highlighted', false);
        d3.selectAll('.dimmed').classed('dimmed', false);
        hideTooltip();
    }

    function handleBarClick(event, d) {
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(
                `${d.stateName} (${d.state}): ${d.formattedValue}`,
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
                '<div style="font-weight: bold; margin-bottom: 4px;">' + data.stateName + '</div>' +
                '<div style="margin-bottom: 2px;">Código: ' + data.state + '</div>' +
                '<div>Valor: ' + (data.value !== null ? data.formattedValue : 'Sem dados') + '</div>'
            );
        
        tooltip.transition().duration(200).style('opacity', 1);
    }

    function hideTooltip() {
        d3.selectAll('.viz-tooltip').remove();
    }

    function onUpdate(newConfig) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        renderVisualization(vizCurrentData, newConfig);
    }

    function onBrazilMapControlUpdate(brazilMapControls) {
        if (vizCurrentData && vizCurrentData.length > 0) {
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const mergedConfig = createMergedConfig(templateConfig, brazilMapControls);
            renderVisualization(vizCurrentData, mergedConfig);
        }
    }

    function onDataLoaded(processedData) {
        if (processedData && processedData.data) {
            updateDataPreview(processedData.data);
            
            const templateConfig = window.OddVizTemplateControls?.getState() || {};
            const specificConfig = window.BrazilMapVizConfig?.currentConfig || {};
            const mergedConfig = createMergedConfig(templateConfig, specificConfig);
            
            renderVisualization(processedData.data, mergedConfig);
        }
    }

    // DADOS DO BRASIL
    window.brazilTopologyData = {"type":"Topology","objects":{"estados":{"type":"GeometryCollection","bbox":[-73.97741220933203,-33.74579986956992,-34.81727575186676,5.24981966486962],"geometries":[{"type":"Polygon","properties":{"nome":"Acre"},"id":"AC","arcs":[[0,1,2]]},{"type":"Polygon","properties":{"nome":"Alagoas"},"id":"AL","arcs":[[3,4,5,6]]},{"type":"Polygon","properties":{"nome":"Amazonas"},"id":"AM","arcs":[[7,8,9,10,-1,11]]},{"type":"Polygon","properties":{"nome":"Amapá"},"id":"AP","arcs":[[12,13]]},{"type":"Polygon","properties":{"nome":"Bahia"},"id":"BA","arcs":[[-6,14,15,16,17,18,19,20,21,22,23]]},{"type":"Polygon","properties":{"nome":"Ceará"},"id":"CE","arcs":[[24,25,26,27,28,29]]},{"type":"Polygon","properties":{"nome":"Distrito Federal"},"id":"DF","arcs":[[30]]},{"type":"Polygon","properties":{"nome":"Espírito Santo"},"id":"ES","arcs":[[31,32,-17,33]]},{"type":"Polygon","properties":{"nome":"Goiás"},"id":"GO","arcs":[[34,-21,35,36,37,38,39]]},{"type":"Polygon","properties":{"nome":"Maranhão"},"id":"MA","arcs":[[40,41,42,43]]},{"type":"Polygon","properties":{"nome":"Minas Gerais"},"id":"MG","arcs":[[-18,-33,44,45,46,-38,-36,-20,47]]},{"type":"Polygon","properties":{"nome":"Mato Grosso do Sul"},"id":"MS","arcs":[[-39,-47,48,49,50,51]]},{"type":"Polygon","properties":{"nome":"Mato Grosso"},"id":"MT","arcs":[[52,-10,53,54,-40,-52,55]]},{"type":"Polygon","properties":{"nome":"Pará"},"id":"PA","arcs":[[-41,56,-54,-9,57,58,-13,59]]},{"type":"Polygon","properties":{"nome":"Paraíba"},"id":"PB","arcs":[[60,61,-26,62]]},{"type":"Polygon","properties":{"nome":"Pernambuco"},"id":"PE","arcs":[[63,-7,-24,64,-27,-62]]},{"type":"Polygon","properties":{"nome":"Piauí"},"id":"PI","arcs":[[65,-28,-65,-23,-43]]},{"type":"Polygon","properties":{"nome":"Paraná"},"id":"PR","arcs":[[66,67,68,69,-50]]},{"type":"Polygon","properties":{"nome":"Rio de Janeiro"},"id":"RJ","arcs":[[70,-45,-32,71]]},{"type":"Polygon","properties":{"nome":"Rio Grande do Norte"},"id":"RN","arcs":[[72,-63,-25]]},{"type":"Polygon","properties":{"nome":"Rondônia"},"id":"RO","arcs":[[-11,-53,73,-2]]},{"type":"Polygon","properties":{"nome":"Roraima"},"id":"RR","arcs":[[-58,-8,74]]},{"type":"Polygon","properties":{"nome":"Rio Grande do Sul"},"id":"RS","arcs":[[75,76]]},{"type":"Polygon","properties":{"nome":"Santa Catarina"},"id":"SC","arcs":[[-69,77,-76,78]]},{"type":"Polygon","properties":{"nome":"Sergipe"},"id":"SE","arcs":[[-5,79,-15]]},{"type":"Polygon","properties":{"nome":"São Paulo"},"id":"SP","arcs":[[80,-67,-49,-46,-71]]},{"type":"Polygon","properties":{"nome":"Tocantins"},"id":"TO","arcs":[[-22,-35,-55,-57,-44]]}]}},"arcs":[[[44,6830],[888,-264],[899,-430]],[[1831,6136],[53,-21]],[[1884,6115],[-496,-311],[-531,28],[4,388],[-163,-136],[-231,11],[-54,142],[-214,6],[78,87],[-155,194],[-60,108],[-1,33],[-60,45],[-1,64],[49,0],[-5,56]],[[9922,6376],[-59,-94],[-100,-112],[-79,-103],[-63,-55],[1,-12],[-26,-38]],[[9596,5962],[-14,24],[-29,-3],[-1,23],[-18,18],[-15,-8],[-64,49],[-2,22],[-265,130]],[[9188,6217],[-59,46]],[[9129,6263],[111,120],[215,-137],[14,29],[52,-1],[19,-19],[167,129],[65,-17],[46,25],[104,-16]],[[2703,9217],[168,-91],[120,-557],[-61,-114],[260,-204],[-27,191],[108,89],[122,-104],[101,52],[-29,45],[90,192],[294,7]],[[3849,8723],[7,-174],[141,-189],[502,-284],[-524,-1167],[62,-132]],[[4037,6777],[-63,-376],[-799,-6]],[[3175,6395],[-154,8],[-180,203],[-183,-1],[-181,-239],[-160,-3],[2,-131],[-360,5],[-128,-101]],[[44,6830],[27,97],[141,67],[-33,110],[118,239],[340,179],[388,28],[140,845],[-157,212],[-4,196],[228,5],[-1,115],[-175,-2],[0,173],[416,3],[191,112],[91,-88],[5,-169],[395,-133],[549,398]],[[6087,8820],[-403,-354],[13,-101],[-173,-13],[-324,622],[-188,125],[-105,0],[-34,187]],[[4873,9286],[56,3],[56,-74],[101,-6],[60,48],[124,-3],[26,-40],[92,0],[383,582],[147,-550],[241,-178],[-6,-154],[-66,-94]],[[9188,6217],[4,-118],[41,-7],[23,-89],[-27,-12],[0,-83],[-46,-14],[-8,15],[-39,-2],[-17,-28],[66,-136],[138,-69]],[[9323,5674],[-231,-360],[-50,33],[-95,-89],[-30,-389],[51,-283],[-113,-360],[41,-104],[-34,-52],[-61,-27],[-40,-91]],[[8761,3952],[-156,102]],[[8605,4054],[20,51],[-108,94],[32,122],[59,9],[78,221]],[[8686,4551],[-1086,452],[-466,-253]],[[7134,4750],[3,94]],[[7137,4844],[-57,487]],[[7080,5331],[-81,420],[192,273]],[[7191,6024],[145,-146],[284,48],[119,154],[-47,124],[94,73],[184,-90],[134,93],[92,0],[159,154]],[[8355,6434],[133,-126],[-2,-70],[89,-2],[251,232],[190,-118],[36,34],[59,-48],[-17,-30],[35,-43]],[[9365,7418],[-85,-34],[-239,-361]],[[9041,7023],[-50,-152],[58,-87],[-44,-118]],[[9005,6666],[-107,0],[-142,107],[-220,-16]],[[8536,6757],[40,160],[-78,32],[-88,447],[-72,510]],[[8338,7906],[-128,50],[128,-50]],[[8338,7906],[333,19],[395,-220],[147,-163],[151,-84],[1,-40]],[[6809,4538],[-247,0],[-1,139],[248,-1],[0,-138]],[[8439,3189],[-202,48],[1,74],[-44,12]],[[8194,3323],[25,149],[102,4],[125,237],[-41,54],[31,73],[-67,107],[59,53],[51,-2],[40,55],[86,1]],[[8761,3952],[-35,-114],[28,-142],[-28,-77],[-70,-49],[-38,-113],[-86,-149],[-55,-3],[-38,-116]],[[5974,5372],[319,-97],[787,56]],[[7137,4844],[-208,-33],[8,-228],[-128,-45]],[[6809,4538],[0,138],[-248,1],[1,-139],[247,0]],[[6809,4538],[7,-515],[-149,-121],[-100,48],[-194,-2],[-98,-84],[-232,-6],[-161,-198]],[[5882,3660],[-484,217],[-63,162]],[[5335,4039],[-42,92],[61,205],[189,243],[111,18],[56,192],[132,22],[132,561]],[[6494,7329],[254,158],[170,251],[207,649]],[[7125,8387],[333,-125],[88,-218],[107,-36],[117,75],[266,-131],[175,2]],[[8211,7954],[-298,-387],[17,-624],[-142,-57],[-38,63],[-118,-43],[-124,-131],[-225,-89],[-129,-304],[37,-358]],[[7191,6024],[-148,36],[-48,105],[-118,179],[62,164],[82,13],[-14,113],[-130,-30],[-161,194],[78,250],[-34,200],[-266,81]],[[8194,3323],[-19,-45],[-34,1],[-68,-172],[14,-23],[-199,-95],[-67,29],[-358,-110]],[[7463,2908],[-407,-128],[-283,748],[-898,17]],[[5875,3545],[7,115]],[[7134,4750],[467,250],[1085,-449]],[[5875,3545],[-380,-578],[-163,-105]],[[5332,2862],[-126,-89],[-93,-129],[-75,-154]],[[5038,2490],[-113,35],[-168,-25],[-124,443],[-541,16],[7,318],[-83,259],[199,521]],[[4215,4057],[199,152],[186,44],[219,-125],[255,6],[107,112],[-1,-117],[-96,-91],[251,1]],[[3397,5141],[213,358],[2,332],[-439,5],[2,559]],[[4037,6777],[360,-535],[1668,-112]],[[6065,6130],[-131,-409],[40,-349]],[[4215,4057],[-217,169],[0,257],[-473,-1],[-3,196],[-100,112],[84,-4],[-5,124],[-33,149],[-71,82]],[[6494,7329],[-53,-48],[143,-59],[-139,-293],[-76,-20],[-89,-202],[56,-59],[-271,-518]],[[3849,8723],[6,259]],[[3855,8982],[444,162],[287,10],[-11,134],[298,-2]],[[6087,8820],[40,-84],[96,8],[298,-157],[5,-63],[120,-42],[77,60],[402,-155]],[[9960,6990],[39,-272]],[[9999,6718],[-63,39],[-105,-17],[-15,-49],[-119,-45],[-62,10],[-87,-35],[-7,-55],[-97,-44],[-84,97],[92,122],[-80,49],[-177,-118],[-190,-6]],[[9041,7023],[118,-34],[216,129],[24,-39],[-79,-138],[198,-78],[83,131],[359,-4]],[[9999,6718],[-77,-342]],[[8355,6434],[181,152],[-1,62],[-43,16],[1,75],[43,18]],[[8211,7954],[127,-48]],[[5332,2862],[851,-121],[143,-388],[301,-170]],[[6627,2183],[-147,-192]],[[6480,1991],[-146,0],[-90,-58],[-97,48],[-174,-2],[-35,-51],[-138,-19],[-30,-85],[-577,95]],[[5193,1919],[-79,159],[-163,12],[87,400]],[[7465,2663],[-31,91],[163,59],[-21,50],[-69,-22],[-44,67]],[[8439,3189],[-36,-55],[23,-120],[-63,-36],[-85,-28],[-110,-92],[30,-33],[-40,-56],[-254,-6],[-143,-22],[-67,34],[-193,-67],[11,-31],[-47,-14]],[[9365,7418],[161,-68],[182,9],[152,-44],[100,-325]],[[3397,5141],[-92,49],[-212,-8],[-79,90],[-419,197],[-101,-39],[-281,219],[1,464],[-330,2]],[[2703,9217],[-4,55],[-149,-1],[-57,298],[-163,167],[23,19],[49,-43],[117,-7],[33,-50],[204,9],[51,-85],[69,20],[-29,72],[127,52],[73,-19],[338,175],[-3,116],[183,4],[6,-185],[93,-36],[4,-150],[-90,-206],[5,-163],[51,-18],[1,-108],[129,-130],[91,-21]],[[5143,1686],[528,-63],[306,-244],[184,-48],[-45,-133],[68,-60]],[[6184,1138],[-135,-303],[-133,-178],[-99,-87],[-222,-158],[-1,77],[49,0],[120,85],[185,255],[-129,25],[-123,-212],[-152,-152],[40,-23],[0,-60],[-59,-68],[-52,-150],[-56,-69],[-157,-120],[-40,34],[30,90],[102,123],[55,-33],[53,110],[-45,29],[-109,-69],[-594,445],[-114,-51],[-363,270],[448,491],[460,247]],[[6480,1991],[30,-65],[-49,-122],[25,-167],[-2,-126],[-41,-168],[-259,-205]],[[5143,1686],[50,233]],[[9596,5962],[-7,-11],[-28,0],[-96,-66],[-142,-211]],[[7465,2663],[-175,-74],[14,-25],[-36,-24],[-59,19],[-73,-11],[-207,-105],[-302,-260]]],"transform":{"scale":[0.003916405286275154,0.0038999519486388173],"translate":[-73.97741220933203,-33.74579986956992]}};

    // EXPORTAÇÕES
    window.BrazilMapVisualization = {
        initVisualization: initVisualization,
        renderVisualization: renderVisualization,
        onUpdate: onUpdate,
        onBrazilMapControlUpdate: onBrazilMapControlUpdate,
        onDataLoaded: onDataLoaded,
        updateDataPreview: updateDataPreview,
        BRAZIL_MAP_SETTINGS: BRAZIL_MAP_SETTINGS
    };

    window.onDataLoaded = onDataLoaded;
    window.initVisualization = initVisualization;

    // AUTO-INICIALIZAÇÃO
    function waitForD3AndInit() {
        if (typeof d3 !== 'undefined' && typeof topojson !== 'undefined' && document.readyState !== 'loading') {
            initVisualization();
        } else {
            setTimeout(waitForD3AndInit, 100);
        }
    }

    waitForD3AndInit();

})();