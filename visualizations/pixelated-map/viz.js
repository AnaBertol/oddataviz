/**
 * MAPA INTERATIVO - VISUALIZAÇÃO D3.js
 * Baseado na estrutura do mapa do Brasil, mas com mapas configuráveis
 */

(function() {
    'use strict';

    // CONFIGURAÇÕES
    const MAP_SETTINGS = {
        fixedWidth: 800,
        fixedHeight: 600,
        margins: { top: 60, right: 60, bottom: 80, left: 60 }
    };

    const MAP_DEFAULTS = {
        colorScheme: 'sequential',
        colorMin: '#E8F4FD',
        colorMax: '#2C0165',
        showLabels: true,
        showValues: true,
        strokeColor: '#FFFFFF',
        strokeWidth: 1
    };

    // VARIÁVEIS
    let vizSvg = null;
    let vizMapGroup = null;
    let vizCurrentData = null;
    let vizCurrentConfig = null;
    let vizLayoutInfo = null;
    let vizMapTopology = null;
    let vizColorScale = null;
    let vizMapConfig = null;

    // ==========================================================================
    // INICIALIZAÇÃO
    // ==========================================================================

    function initVisualization() {
        if (typeof d3 === 'undefined') {
            console.error('D3.js não carregado');
            return;
        }
        
        if (window.OddVizTemplateControls?.setVisualizationWidth) {
            window.OddVizTemplateControls.setVisualizationWidth(MAP_SETTINGS.fixedWidth, 'wide');
        }
        
        createBaseSVG();
        showInitialState();
    }

    function createBaseSVG() {
        const chartContainer = document.getElementById('chart');
        if (!chartContainer) return;
        
        // Remove placeholder se existir
        chartContainer.querySelector('.chart-placeholder')?.remove();
        d3.select(chartContainer).select('svg').remove();
        
        vizSvg = d3.select(chartContainer)
            .append('svg')
            .attr('id', 'interactive-map-viz')
            .attr('width', MAP_SETTINGS.fixedWidth)
            .attr('height', MAP_SETTINGS.fixedHeight);
        
        vizMapGroup = vizSvg.append('g').attr('class', 'map-group');
    }

    function showInitialState() {
        if (!vizSvg) return;
        
        // Mostra placeholder inicial
        const placeholder = vizSvg.append('g')
            .attr('class', 'placeholder-group')
            .attr('transform', `translate(${MAP_SETTINGS.fixedWidth / 2}, ${MAP_SETTINGS.fixedHeight / 2})`);
        
        placeholder.append('text')
            .attr('class', 'placeholder-icon')
            .attr('text-anchor', 'middle')
            .attr('y', -20)
            .style('font-size', '4rem')
            .style('opacity', 0.7)
            .text('🗺️');
        
        placeholder.append('text')
            .attr('class', 'placeholder-title')
            .attr('text-anchor', 'middle')
            .attr('y', 20)
            .style('font-size', '1.5rem')
            .style('font-weight', '600')
            .style('fill', '#FAF9FA')
            .text('Configure seu mapa');
        
        placeholder.append('text')
            .attr('class', 'placeholder-description')
            .attr('text-anchor', 'middle')
            .attr('y', 45)
            .style('font-size', '1rem')
            .style('fill', 'rgba(250, 249, 250, 0.8)')
            .text('Selecione o mapa base para começar');
    }

    // ==========================================================================
    // GERAÇÃO DO MAPA
    // ==========================================================================

    function generateMap(mapConfig) {
        console.log('🗺️ Gerando mapa com configuração:', mapConfig);
        
        return new Promise((resolve, reject) => {
            try {
                vizMapConfig = mapConfig;
                
                // Remove placeholder
                vizSvg.selectAll('.placeholder-group').remove();
                
                // Carrega topologia do mapa
                loadMapTopology(mapConfig.mapBase)
                    .then(() => {
                        console.log('✅ Mapa base carregado - renderizando versão cinza');
                        
                        // ✅ ALTERAÇÃO: Renderiza mapa sem dados (versão cinza)
                        renderEmptyMap();
                        
                        resolve();
                    })
                    .catch(error => {
                        console.error('❌ Erro ao carregar topologia:', error);
                        showErrorMessage('Erro ao carregar dados geográficos: ' + error.message);
                        reject(error);
                    });
                    
            } catch (error) {
                console.error('❌ Erro geral ao gerar mapa:', error);
                showErrorMessage('Erro ao processar configuração do mapa');
                reject(error);
            }
        });
    }
    
    function renderEmptyMap() {
        if (!vizMapTopology) return;
        
        vizMapGroup.selectAll('*').remove();
        
        const mapArea = { 
            x: MAP_SETTINGS.margins.left, 
            y: MAP_SETTINGS.margins.top + 50, 
            width: MAP_SETTINGS.fixedWidth - MAP_SETTINGS.margins.left - MAP_SETTINGS.margins.right, 
            height: 400 
        };
        
        const config = window.InteractiveMapConfig?.mapConfigs[vizMapConfig.mapBase];
        
        if (!config) {
            console.error('❌ Configuração do mapa não encontrada');
            return;
        }
        
        // Container do mapa
        const mapContainer = vizMapGroup.append('g')
            .attr('transform', `translate(${mapArea.x}, ${mapArea.y})`);
        
        try {
            // Converte topologia para features geográficas
            const allFeatures = topojson.feature(vizMapTopology, vizMapTopology.objects[config.objectName]);
            
            // Aplica filtro geográfico se necessário
            let filteredFeatures = allFeatures.features;
            
            if (vizMapConfig.filterCategory !== 'none' && vizMapConfig.filterValue) {
                console.log('🔍 Aplicando filtro geográfico:', vizMapConfig.filterValue);
                
                const selectedGrouping = config.groupings.find(g => g.filterBy === vizMapConfig.filterCategory);
                if (selectedGrouping && selectedGrouping.categoryField) {
                    filteredFeatures = allFeatures.features.filter(feature => {
                        const categoryValue = getNestedProperty(feature, selectedGrouping.categoryField);
                        return categoryValue === vizMapConfig.filterValue;
                    });
                    
                    console.log(`🗺️ Filtro aplicado: ${filteredFeatures.length} de ${allFeatures.features.length} features`);
                }
            }
            
            // Cria projeção baseada nas features filtradas
            const filteredGeoCollection = {
                type: "FeatureCollection",
                features: filteredFeatures
            };
            
            const projection = createProjection(vizMapConfig.mapBase, filteredGeoCollection, mapArea);
            const path = d3.geoPath().projection(projection);
            
            console.log(`🗺️ Renderizando ${filteredFeatures.length} features sem dados (mapa cinza)`);
            
            // ✅ RENDERIZA MAPA CINZA: Todas as áreas com a mesma cor
            mapContainer.selectAll('.geo-area')
                .data(filteredFeatures)
                .enter()
                .append('path')
                .attr('class', 'geo-area')
                .attr('d', path)
                .attr('fill', '#E5E5E5') // ✅ Cor cinza neutra
                .attr('stroke', '#FFFFFF')
                .attr('stroke-width', 1)
                .style('cursor', 'pointer')
                .on('mouseover', function(event, d) {
                    d3.select(this).attr('fill', '#D0D0D0'); // Hover mais escuro
                    showBasicTooltip(event, d, config);
                })
                .on('mouseout', function() {
                    d3.select(this).attr('fill', '#E5E5E5'); // Volta ao cinza
                    hideTooltip();
                });
            
            console.log('✅ Mapa base renderizado - pronto para dados');
            
        } catch (error) {
            console.error('❌ Erro ao renderizar mapa:', error);
            showErrorMessage('Erro ao processar dados geográficos');
        }
    }
    
    function showBasicTooltip(event, feature, config) {
        const name = getNestedProperty(feature, config.nameField) || feature.id || 'Área';
        const id = feature.id || '';
        
        const tooltip = d3.select('body')
            .append('div')
            .attr('class', 'viz-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0,0,0,0.9)')
            .style('color', 'white')
            .style('padding', '10px 12px')
            .style('border-radius', '6px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('z-index', 1000)
            .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)')
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .html(
                '<div style="font-weight: bold; margin-bottom: 4px;">' + name + '</div>' +
                (id ? '<div style="margin-bottom: 2px;">Código: ' + id + '</div>' : '') +
                '<div style="font-style: italic; color: #ccc;">Carregue dados para ver valores</div>'
            );
        
        tooltip.transition().duration(200).style('opacity', 1);
    }

    function loadMapTopology(mapBase) {
        return new Promise((resolve, reject) => {
            // Usa dados já carregados pelo config.js
            const mapData = window.InteractiveMapConfig?.getLoadedMapData(mapBase);
            
            if (mapData) {
                vizMapTopology = mapData;
                console.log('✅ Topologia carregada do cache:', mapBase);
                resolve();
            } else {
                reject(new Error('Dados do mapa não foram carregados. Configure o mapa primeiro.'));
            }
        });
    }

    function generateSampleDataForMap(mapConfig) {
        console.log('📊 Gerando dados de exemplo para:', mapConfig);
        
        const data = [];
        const config = window.InteractiveMapConfig?.mapConfigs[mapConfig.mapBase];
        const mapData = window.InteractiveMapConfig?.getLoadedMapData(mapConfig.mapBase);
        
        if (!config || !mapData) {
            console.error('❌ Configuração ou dados do mapa não encontrados');
            return { data: [], columns: ['key', 'value'], columnTypes: { key: 'string', value: 'number' }, rowCount: 0, source: 'error' };
        }
        
        let geometries = mapData.objects[config.objectName].geometries;
        
        // ✅ PRIMEIRO: Aplica filtro geográfico se necessário
        if (mapConfig.filterCategory !== 'none' && mapConfig.filterValue) {
            console.log('🔍 Filtrando geometrias por:', mapConfig.filterValue);
            
            const selectedGrouping = config.groupings.find(g => g.filterBy === mapConfig.filterCategory);
            if (selectedGrouping && selectedGrouping.categoryField) {
                geometries = geometries.filter(geom => {
                    const categoryValue = getNestedProperty(geom, selectedGrouping.categoryField);
                    return categoryValue === mapConfig.filterValue;
                });
                
                console.log(`🗺️ Filtro aplicado: ${geometries.length} geometrias restantes`);
            }
        }
        
        let entities = [];
        
        // ✅ SEGUNDO: Define entidades baseado no agrupamento
        if (mapConfig.grouping === 'none') {
            // Sem agrupamento: usa identificadores diretos
            entities = geometries.map(geom => {
                const id = getNestedProperty(geom, config.keyField);
                return { key: id, geometry: geom };
            }).filter(item => item.key);
            
        } else {
            // Com agrupamento: agrupa por categoria
            const selectedGrouping = config.groupings.find(g => g.value === mapConfig.grouping);
            if (selectedGrouping && selectedGrouping.categoryField) {
                const groups = new Map();
                
                geometries.forEach(geom => {
                    const categoryValue = getNestedProperty(geom, selectedGrouping.categoryField);
                    if (categoryValue) {
                        if (!groups.has(categoryValue)) {
                            groups.set(categoryValue, []);
                        }
                        groups.get(categoryValue).push(geom);
                    }
                });
                
                entities = Array.from(groups.keys()).map(category => ({
                    key: category,
                    geometries: groups.get(category)
                }));
            }
        }
        
        // ✅ TERCEIRO: Gera valores aleatórios para as entidades finais
        entities.forEach(entity => {
            const value = Math.random() * 100;
            data.push({
                key: entity.key,
                value: parseFloat(value.toFixed(1))
            });
        });
        
        // Ordena por valor decrescente
        data.sort((a, b) => b.value - a.value);
        
        console.log('📊 Dados gerados:', data.length, 'entidades');
        
        if (data.length === 0) {
            console.warn('⚠️ Nenhum dado foi gerado - verifique configuração e filtros');
        }
        
        return {
            data: data,
            columns: ['key', 'value'],
            columnTypes: { key: 'string', value: 'number' },
            rowCount: data.length,
            source: 'generated'
        };
    }
    
    function getNestedProperty(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : null;
        }, obj);
    }

    // ==========================================================================
    // RENDERIZAÇÃO
    // ==========================================================================

    // ✅ CORREÇÃO: Melhorar mesclagem de configurações
    function createMergedConfig(templateConfig, specificConfig) {
        const mergedConfig = Object.assign({}, MAP_DEFAULTS);
        
        // ✅ CORREÇÃO: Aplica configurações do template
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
        
        // ✅ CORREÇÃO: Aplica configurações específicas (prioridade maior)
        if (specificConfig) {
            Object.assign(mergedConfig, specificConfig);
        }
        
        console.log('🔧 Configuração mesclada:', mergedConfig);
        return mergedConfig;
    }

    function renderVisualization(data, config) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            showNoDataMessage();
            return;
        }
        
        if (!vizMapTopology) {
            showErrorMessage('Dados do mapa não carregados');
            return;
        }
        
        vizCurrentData = data;
        
        // ✅ CORREÇÃO: Validar e completar configuração se necessário
        let finalConfig = config;
        
        if (!config || !config.title || !config.backgroundColor) {
            console.log('⚠️ Configuração incompleta, coletando valores atuais...');
            
            const templateConfig = window.OddVizTemplateControls?.getState?.() || readTemplateConfigDirectlyFromHTML();
            const specificConfig = window.InteractiveMapConfig?.getCurrentSpecificConfig?.() || {};
            finalConfig = createMergedConfig(templateConfig, specificConfig);
        }
        
        // ✅ CORREÇÃO: Se ainda não tem configurações específicas, busca do config.js
        if (!finalConfig.scaleType || !finalConfig.paletteType) {
            const specificConfig = window.InteractiveMapConfig?.getCurrentSpecificConfig?.() || {};
            finalConfig = createMergedConfig(finalConfig, specificConfig);
        }
        
        vizCurrentConfig = finalConfig;
        
        console.log('🎨 Renderizando visualização com configuração final:', finalConfig);
        console.log('📊 Dados:', data.length, 'itens');
        
        // Calcula layout
        vizLayoutInfo = calculateLayout(finalConfig);
        
        // ✅ CORREÇÃO: Cria escala com configuração completa
        vizColorScale = createColorScale(data, finalConfig);
        
        // Atualiza dimensões do SVG
        updateSVGDimensions();
        
        // Renderiza mapa
        renderMap(data);
        
        console.log('✅ Renderização concluída');
    }

    function calculateLayout(config) {
        const margins = MAP_SETTINGS.margins;
        
        let titlesLayoutInfo = { contentStartY: margins.top + 50, availableHeight: 400 };
        
        // ✅ CORREÇÃO: Usa Template Controls para títulos apenas se disponível e funcional
        if (window.OddVizTemplateControls?.renderTitlesWithWrap && config.title) {
            try {
                console.log('📝 Renderizando títulos com Template Controls:', {
                    title: config.title,
                    subtitle: config.subtitle,
                    dataSource: config.dataSource
                });
                
                titlesLayoutInfo = window.OddVizTemplateControls.renderTitlesWithWrap(vizSvg, config, {
                    width: MAP_SETTINGS.fixedWidth,
                    height: MAP_SETTINGS.fixedHeight,
                    startY: 60  // ✅ POSIÇÃO CORRETA: 60px da borda
                });
                
                console.log('✅ Títulos renderizados:', titlesLayoutInfo);
            } catch (error) {
                console.error('❌ Erro ao renderizar títulos:', error);
                // ✅ CORREÇÃO: Fallback para renderização manual se Template Controls falhar
                renderTitlesManually(config);
            }
        } else {
            console.log('⚠️ Template Controls não disponível, renderizando títulos manualmente');
            renderTitlesManually(config);
        }
        
        const contentStartY = titlesLayoutInfo.contentStartY || (margins.top + 50);
        const availableHeight = titlesLayoutInfo.availableHeight || 400;
        
        const mapArea = {
            x: margins.left,
            y: contentStartY,
            width: MAP_SETTINGS.fixedWidth - margins.left - margins.right,
            height: Math.min(availableHeight, 400)
        };
        
        return { mapArea, titlesLayoutInfo };
    }

    function updateSVGDimensions() {
        if (!vizSvg) return;
        
        vizSvg.attr('width', MAP_SETTINGS.fixedWidth)
              .attr('height', MAP_SETTINGS.fixedHeight);
        
        vizSvg.selectAll('.svg-background').remove();
        
        vizSvg.insert('rect', ':first-child')
            .attr('class', 'svg-background')
            .attr('width', MAP_SETTINGS.fixedWidth)
            .attr('height', MAP_SETTINGS.fixedHeight)
            .attr('fill', vizCurrentConfig.backgroundColor || '#FFFFFF');
    }

    // ✅ CORREÇÃO: Usar configurações específicas corretas
    function createColorScale(data, config) {
        const values = data.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        
        // ✅ CORREÇÃO: Usar configurações específicas da config mesclada
        const scaleType = config.scaleType || 'continuous';
        const paletteType = config.paletteType || 'sequential';
        
        console.log('🎨 Criando escala de cores:', { 
            scaleType, 
            paletteType, 
            minValue, 
            maxValue,
            colorMin: config.colorMin,
            colorMax: config.colorMax 
        });
        
        if (scaleType === 'continuous') {
            if (paletteType === 'sequential') {
                return d3.scaleSequential()
                    .domain([minValue, maxValue])
                    .interpolator(d3.interpolateRgb(
                        config.colorMin || '#E8F4FD', 
                        config.colorMax || '#2C0165'
                    ));
            } else {
                // Paleta divergente
                const midValue = config.divergingMidValue || ((minValue + maxValue) / 2);
                return d3.scaleLinear()
                    .domain([minValue, midValue, maxValue])
                    .range([
                        config.colorLow || '#6F02FD', 
                        config.colorMid || '#FAF9FA', 
                        config.colorHigh || '#6CDADE'
                    ])
                    .interpolate(d3.interpolateRgb);
            }
        } else {
            // Escala com divisões (quantile)
            const divisions = config.scaleDivisions || 5;
            
            if (paletteType === 'sequential') {
                const colorScale = d3.scaleSequential()
                    .domain([0, divisions - 1])
                    .interpolator(d3.interpolateRgb(
                        config.colorMin || '#E8F4FD', 
                        config.colorMax || '#2C0165'
                    ));
                
                return d3.scaleQuantile()
                    .domain(values)
                    .range(d3.range(divisions).map(i => colorScale(i)));
            } else {
                // Divergente com divisões
                const colorScale = d3.scaleLinear()
                    .domain([0, Math.floor(divisions / 2), divisions - 1])
                    .range([
                        config.colorLow || '#6F02FD', 
                        config.colorMid || '#FAF9FA', 
                        config.colorHigh || '#6CDADE'
                    ])
                    .interpolate(d3.interpolateRgb);
                
                return d3.scaleQuantile()
                    .domain(values)
                    .range(d3.range(divisions).map(i => colorScale(i)));
            }
        }
    }

    function renderMap(data) {
        if (!vizMapTopology) return;
        
        vizMapGroup.selectAll('*').remove();
        
        const mapArea = vizLayoutInfo.mapArea;
        const dataMap = new Map(data.map(d => [d.key, d]));
        const config = window.InteractiveMapConfig?.mapConfigs[vizMapConfig.mapBase];
        
        if (!config) {
            console.error('❌ Configuração do mapa não encontrada');
            return;
        }
        
        // Container do mapa
        const mapContainer = vizMapGroup.append('g')
            .attr('transform', `translate(${mapArea.x}, ${mapArea.y})`);
        
        try {
            // Converte topologia para features geográficas
            const allFeatures = topojson.feature(vizMapTopology, vizMapTopology.objects[config.objectName]);
            
            // ✅ NOVO: Aplica filtro geográfico ANTES de criar projeção
            let filteredFeatures = allFeatures.features;
            
            if (vizMapConfig.filterCategory !== 'none' && vizMapConfig.filterValue) {
                console.log('🔍 Aplicando filtro geográfico antes da projeção:', vizMapConfig.filterValue);
                
                const selectedGrouping = config.groupings.find(g => g.filterBy === vizMapConfig.filterCategory);
                if (selectedGrouping && selectedGrouping.categoryField) {
                    filteredFeatures = allFeatures.features.filter(feature => {
                        const categoryValue = getNestedProperty(feature, selectedGrouping.categoryField);
                        return categoryValue === vizMapConfig.filterValue;
                    });
                    
                    console.log(`🗺️ Filtro aplicado na projeção: ${filteredFeatures.length} de ${allFeatures.features.length} features`);
                }
            }
            
            // ✅ CORREÇÃO: Cria projeção baseada apenas nas features filtradas
            const filteredGeoCollection = {
                type: "FeatureCollection",
                features: filteredFeatures
            };
            
            const projection = createProjection(vizMapConfig.mapBase, filteredGeoCollection, mapArea);
            const path = d3.geoPath().projection(projection);
            
            // Processa features baseado no agrupamento (usando features filtradas)
            const processedFeatures = processFeatures(filteredFeatures, config, dataMap);
            
            console.log(`📊 Renderizando ${processedFeatures.length} features processadas`);
            
            // Renderiza áreas geográficas
            mapContainer.selectAll('.geo-area')
                .data(processedFeatures)
                .enter()
                .append('path')
                .attr('class', 'geo-area')
                .attr('d', path)
                .attr('fill', d => {
                    const data = dataMap.get(d.key);
                    // ✅ CORREÇÃO: Usar cor correta para dados ausentes
                    return data ? vizColorScale(data.value) : (vizCurrentConfig.noDataColor || '#E0E0E0');
                })
                .attr('stroke', vizCurrentConfig.strokeColor || '#FFFFFF')
                .attr('stroke-width', vizCurrentConfig.unitStrokeWidth || 0.5)
                .style('cursor', 'pointer')
                .on('mouseover', function(event, d) {
                    handleMapHover(event, d, dataMap);
                })
                .on('mouseout', function() {
                    handleMapOut();
                })
                .on('click', function(event, d) {
                    handleMapClick(event, d, dataMap);
                });
            
            // ✅ NOVO: Renderiza contornos de grupo se há agrupamento
            if (vizMapConfig.grouping !== 'none' && vizCurrentConfig.groupStrokeWidth > 0) {
                renderGroupBoundaries(mapContainer, processedFeatures, path);
            }
            
            // Renderiza labels se habilitados
            if (vizCurrentConfig.showLabels) {
                renderMapLabels(mapContainer, processedFeatures, path, dataMap);
            }
            
            // ✅ NOVO: Renderiza escala se habilitada
            if (vizCurrentConfig.showScale) {
                renderColorScale(vizSvg, vizCurrentConfig, vizColorScale);
            }
            
        } catch (error) {
            console.error('❌ Erro ao renderizar mapa:', error);
            showErrorMessage('Erro ao processar dados geográficos');
        }
    }
    
    function createProjection(mapBase, features, mapArea) {
        let projection;
        
        // ✅ MELHORADO: Escolhe projeção mais adequada baseada no contexto
        if (mapBase === 'brazil') {
            // Para Brasil, sempre Mercator
            projection = d3.geoMercator();
        } else if (mapBase === 'world') {
            // Para mundo, verifica se é uma região específica
            const bounds = d3.geoBounds(features);
            const [[left, bottom], [right, top]] = bounds;
            
            // Se a área é muito pequena (região específica), usa Mercator para melhor precisão
            const latitudeRange = top - bottom;
            const longitudeRange = right - left;
            
            if (latitudeRange < 60 && longitudeRange < 90) {
                console.log('🗺️ Região específica detectada, usando Mercator');
                projection = d3.geoMercator();
            } else {
                console.log('🗺️ Área global, usando Natural Earth');
                projection = d3.geoNaturalEarth1();
            }
        } else {
            projection = d3.geoMercator();
        }
        
        // ✅ CRÍTICO: Ajusta projeção para caber exatamente nas features fornecidas
        projection.fitSize([mapArea.width, mapArea.height], features);
        
        // ✅ DEBUG: Log dos bounds para verificar zoom
        const bounds = d3.geoBounds(features);
        console.log('🔍 Bounds das features:', bounds);
        console.log('📏 Área disponível:', mapArea.width, 'x', mapArea.height);
        
        return projection;
    }
    
    function processFeatures(features, config, dataMap) {
        // ✅ IMPORTANTE: As features já vêm filtradas geograficamente
        // Agora só precisamos processar agrupamento
        
        let processedFeatures = features;
        
        console.log(`🔧 Processando ${features.length} features (já filtradas geograficamente)`);
        
        // Se não há agrupamento, usa features individuais
        if (vizMapConfig.grouping === 'none') {
            return processedFeatures.map(feature => {
                const key = getNestedProperty(feature, config.keyField);
                return {
                    ...feature,
                    key: key,
                    name: getNestedProperty(feature, config.nameField) || key
                };
            }).filter(f => f.key); // ✅ CORREÇÃO: Remove apenas features sem key, não sem dados
        }
        
        // Com agrupamento: agrupa features por categoria
        const selectedGrouping = config.groupings.find(g => g.value === vizMapConfig.grouping);
        if (!selectedGrouping || !selectedGrouping.categoryField) {
            console.warn('⚠️ Agrupamento não encontrado ou sem campo de categoria');
            return processedFeatures;
        }
        
        const groups = new Map();
        const allCategories = new Set();
        
        // ✅ CORREÇÃO: Primeiro, coleta TODAS as categorias (com e sem dados)
        processedFeatures.forEach(feature => {
            const categoryValue = getNestedProperty(feature, selectedGrouping.categoryField);
            if (categoryValue) {
                allCategories.add(categoryValue);
                
                if (!groups.has(categoryValue)) {
                    groups.set(categoryValue, []);
                }
                groups.get(categoryValue).push(feature);
            }
        });
        
        // ✅ CORREÇÃO: Processa TODAS as categorias, não apenas as que têm dados
        const combinedFeatures = [];
        allCategories.forEach(categoryValue => {
            const groupFeatures = groups.get(categoryValue);
            
            try {
                if (groupFeatures.length === 1) {
                    // Se só tem uma feature, usa ela diretamente
                    const feature = groupFeatures[0];
                    combinedFeatures.push({
                        ...feature,
                        key: categoryValue,
                        name: categoryValue,
                        groupedFeatures: groupFeatures
                    });
                } else {
                    // ✅ FUTURO: Aqui poderia usar topojson.merge para combinar geometrias
                    // Por enquanto, cria múltiplas features com a mesma key
                    groupFeatures.forEach(feature => {
                        combinedFeatures.push({
                            ...feature,
                            key: categoryValue,
                            name: categoryValue,
                            originalFeature: feature,
                            groupedFeatures: groupFeatures
                        });
                    });
                }
            } catch (error) {
                console.warn('⚠️ Erro ao processar grupo:', categoryValue, error);
            }
        });
        
        console.log(`📊 Agrupamento processado: ${combinedFeatures.length} features finais de ${allCategories.size} categorias`);
        console.log(`📋 Categorias com dados: ${Array.from(allCategories).filter(cat => dataMap.has(cat)).length}`);
        console.log(`📋 Categorias sem dados: ${Array.from(allCategories).filter(cat => !dataMap.has(cat)).length}`);
        
        return combinedFeatures;
    }
    
    function renderMapLabels(container, features, path, dataMap) {
        // ✅ MELHORIA: Para agrupamentos, renderiza apenas um label por grupo
        const labelsToRender = new Map();
        
        features.forEach(feature => {
            const key = feature.key;
            if (!labelsToRender.has(key)) {
                // Para agrupamentos, calcula centroid médio de todas as features do grupo
                if (feature.groupedFeatures && feature.groupedFeatures.length > 1) {
                    const centroids = feature.groupedFeatures.map(f => {
                        try {
                            return path.centroid(f);
                        } catch (error) {
                            return [0, 0];
                        }
                    }).filter(c => c[0] && c[1]);
                    
                    if (centroids.length > 0) {
                        const avgX = centroids.reduce((sum, c) => sum + c[0], 0) / centroids.length;
                        const avgY = centroids.reduce((sum, c) => sum + c[1], 0) / centroids.length;
                        labelsToRender.set(key, { centroid: [avgX, avgY], feature });
                    }
                } else {
                    // Para features individuais, usa centroid normal
                    try {
                        const centroid = path.centroid(feature);
                        labelsToRender.set(key, { centroid, feature });
                    } catch (error) {
                        console.warn('⚠️ Erro ao calcular centroid para:', key);
                    }
                }
            }
        });
        
        console.log(`🏷️ Renderizando ${labelsToRender.size} labels únicos`);
        
        // Renderiza labels únicos
        container.selectAll('.map-label')
            .data(Array.from(labelsToRender.values()))
            .enter()
            .append('text')
            .attr('class', 'map-label')
            .attr('transform', d => `translate(${d.centroid[0]}, ${d.centroid[1]})`)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .style('fill', d => {
                const data = dataMap.get(d.feature.key);
                const fillColor = data ? vizColorScale(data.value) : (vizCurrentConfig.noDataColor || '#E0E0E0');
                return calculateTextContrastColor(fillColor);
            })
            .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
            .style('font-size', (vizCurrentConfig.labelSize || 10) + 'px')
            .style('font-weight', '600')
            .style('pointer-events', 'none')
            .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.5)')
            .text(d => d.feature.key);
        
        // ✅ CORREÇÃO: Renderiza valores apenas para áreas que têm dados
        if (vizCurrentConfig.showValues) {
            container.selectAll('.map-value')
                .data(Array.from(labelsToRender.values()).filter(d => dataMap.has(d.feature.key)))
                .enter()
                .append('text')
                .attr('class', 'map-value')
                .attr('transform', d => `translate(${d.centroid[0]}, ${d.centroid[1] + 12})`)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .style('fill', d => {
                    const data = dataMap.get(d.feature.key);
                    const fillColor = data ? vizColorScale(data.value) : '#E0E0E0';
                    return calculateTextContrastColor(fillColor);
                })
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', (vizCurrentConfig.valueSize || 9) + 'px')
                .style('font-weight', '500')
                .style('pointer-events', 'none')
                .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.5)')
                .text(d => {
                    const data = dataMap.get(d.feature.key);
                    return data ? data.value.toFixed(1) : '';
                });
        }
    }
    
    // ✅ CORREÇÃO: Função de fallback para renderizar títulos manualmente
    function renderTitlesManually(config) {
        console.log('📝 Renderizando títulos manualmente...');
        
        // Remove títulos anteriores
        vizSvg.selectAll('.chart-title-svg, .chart-subtitle-svg, .chart-source-svg').remove();
        
        let currentY = 60;
        
        // Título
        if (config.title && config.title.trim()) {
            vizSvg.append('text')
                .attr('class', 'chart-title-svg')
                .attr('x', MAP_SETTINGS.fixedWidth / 2)
                .attr('y', currentY)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .style('fill', config.textColor || '#2C3E50')
                .style('font-family', config.fontFamily || 'Inter')
                .style('font-size', (config.titleSize || 24) + 'px')
                .style('font-weight', 'bold')
                .text(config.title);
            
            currentY += (config.titleSize || 24) + 10;
        }
        
        // Subtítulo
        if (config.subtitle && config.subtitle.trim()) {
            vizSvg.append('text')
                .attr('class', 'chart-subtitle-svg')
                .attr('x', MAP_SETTINGS.fixedWidth / 2)
                .attr('y', currentY)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .style('fill', config.textColor || '#2C3E50')
                .style('font-family', config.fontFamily || 'Inter')
                .style('font-size', (config.subtitleSize || 16) + 'px')
                .style('font-weight', 'normal')
                .style('opacity', 0.8)
                .text(config.subtitle);
            
            currentY += (config.subtitleSize || 16) + 20;
        }
        
        // Fonte dos dados (na parte inferior)
        if (config.dataSource && config.dataSource.trim()) {
            vizSvg.append('text')
                .attr('class', 'chart-source-svg')
                .attr('x', MAP_SETTINGS.fixedWidth / 2)
                .attr('y', MAP_SETTINGS.fixedHeight - 20)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .style('fill', config.textColor || '#2C3E50')
                .style('font-family', config.fontFamily || 'Inter')
                .style('font-size', '11px')
                .style('font-weight', 'normal')
                .style('opacity', 0.6)
                .text(config.dataSource);
        }
        
        console.log('✅ Títulos renderizados manualmente');
    }

    // ✅ CORREÇÃO: Renderiza contornos de grupo REAL
    function renderGroupBoundaries(container, features, path) {
        console.log('🔲 Renderizando contornos de grupo...');
        
        // Remove contornos anteriores
        container.selectAll('.group-boundary').remove();
        
        // Agrupa features por key (categoria do grupo)
        const groupedByKey = new Map();
        
        features.forEach(feature => {
            const key = feature.key;
            if (!groupedByKey.has(key)) {
                groupedByKey.set(key, []);
            }
            groupedByKey.get(key).push(feature);
        });
        
        console.log(`📊 Grupos encontrados: ${groupedByKey.size}`);
        
        // Para cada grupo, cria contorno externo
        groupedByKey.forEach((groupFeatures, groupKey) => {
            if (groupFeatures.length > 1) {
                console.log(`🔲 Processando grupo "${groupKey}" com ${groupFeatures.length} features`);
                
                try {
                    // ✅ CORREÇÃO: Usa topojson.merge para criar contorno externo real
                    if (typeof topojson !== 'undefined' && topojson.merge) {
                        
                        // Encontra topologia original do grupo
                        const config = window.InteractiveMapConfig?.mapConfigs[vizMapConfig.mapBase];
                        const mapData = window.InteractiveMapConfig?.getLoadedMapData(vizMapConfig.mapBase);
                        
                        if (config && mapData) {
                            // Encontra índices das geometrias do grupo
                            const geometryIndices = [];
                            const allGeometries = mapData.objects[config.objectName].geometries;
                            
                            groupFeatures.forEach(feature => {
                                const index = allGeometries.findIndex(geom => {
                                    const geomKey = getGroupKey(geom, config);
                                    return geomKey === groupKey;
                                });
                                if (index !== -1) {
                                    geometryIndices.push(index);
                                }
                            });
                            
                            console.log(`🔍 Índices encontrados para grupo "${groupKey}":`, geometryIndices);
                            
                            if (geometryIndices.length > 1) {
                                // Merge das geometrias do grupo
                                const mergedGeometry = topojson.merge(mapData, geometryIndices);
                                
                                if (mergedGeometry) {
                                    console.log(`✅ Merge bem-sucedido para grupo "${groupKey}"`);
                                    
                                    // Renderiza contorno externo
                                    container.append('path')
                                        .datum(mergedGeometry)
                                        .attr('class', `group-boundary group-boundary-${groupKey.replace(/\s+/g, '-')}`)
                                        .attr('d', path)
                                        .attr('fill', 'none')
                                        .attr('stroke', vizCurrentConfig.strokeColor || '#FFFFFF')
                                        .attr('stroke-width', vizCurrentConfig.groupStrokeWidth || 2)
                                        .attr('stroke-opacity', 1)
                                        .attr('stroke-linejoin', 'round')
                                        .attr('stroke-linecap', 'round')
                                        .style('pointer-events', 'none');
                                        
                                } else {
                                    console.warn(`⚠️ Merge falhou para grupo "${groupKey}"`);
                                }
                            }
                        }
                    } else {
                        console.warn('⚠️ topojson.merge não disponível, usando fallback');
                        // Fallback: renderiza contorno grosso individual
                        renderGroupBoundariesFallback(container, groupFeatures, path, groupKey);
                    }
                        
                } catch (error) {
                    console.error('❌ Erro ao processar contorno do grupo:', groupKey, error);
                    // Fallback em caso de erro
                    renderGroupBoundariesFallback(container, groupFeatures, path, groupKey);
                }
            }
        });
        
        console.log('✅ Contornos de grupo renderizados');
    }
    
    // ✅ NOVO: Função para determinar chave do grupo baseada na configuração
    function getGroupKey(geometry, config) {
        if (vizMapConfig.grouping === 'none') {
            return getNestedProperty(geometry, config.keyField);
        } else {
            const selectedGrouping = config.groupings.find(g => g.value === vizMapConfig.grouping);
            if (selectedGrouping && selectedGrouping.categoryField) {
                return getNestedProperty(geometry, selectedGrouping.categoryField);
            }
        }
        return null;
    }
    
    // ✅ NOVO: Fallback para contornos de grupo
    function renderGroupBoundariesFallback(container, groupFeatures, path, groupKey) {
        console.log(`🔄 Usando fallback para grupo "${groupKey}"`);
        
        // Renderiza contorno grosso para cada feature, com stroke-dasharray para distinguir
        groupFeatures.forEach((feature, index) => {
            container.append('path')
                .datum(feature)
                .attr('class', `group-boundary group-boundary-${groupKey.replace(/\s+/g, '-')}`)
                .attr('d', path)
                .attr('fill', 'none')
                .attr('stroke', vizCurrentConfig.strokeColor || '#FFFFFF')
                .attr('stroke-width', vizCurrentConfig.groupStrokeWidth || 2)
                .attr('stroke-opacity', 0.8)
                .attr('stroke-dasharray', '5,3') // Linha tracejada para distinguir
                .style('pointer-events', 'none');
        });
    }
    
    // ✅ CORREÇÃO: Renderiza escala de cores usando escala real
    function renderColorScale(svg, config, colorScale) {
        console.log('📏 Renderizando escala de cores...');
        
        // Remove escala anterior
        svg.selectAll('.color-scale-group').remove();
        
        if (!vizCurrentData || vizCurrentData.length === 0) {
            console.warn('⚠️ Sem dados para renderizar escala');
            return;
        }
        
        const scaleGroup = svg.append('g').attr('class', 'color-scale-group');
        
        // Configurações da escala
        const scaleWidth = config.scaleWidth || 200;
        const scaleHeight = config.scaleHeight || 20;
        const orientation = config.scaleOrientation || 'horizontal';
        const position = config.scalePosition || 'bottom-right';
        
        console.log('📏 Configurações da escala:', { scaleWidth, scaleHeight, orientation, position });
        
        // Calcula posição da escala
        const scalePosition = calculateScalePosition(position, scaleWidth, scaleHeight, orientation);
        
        // Container da escala
        const scaleContainer = scaleGroup.append('g')
            .attr('transform', `translate(${scalePosition.x}, ${scalePosition.y})`);
        
        // ✅ CORREÇÃO: Gera dados baseados na escala real
        const scaleData = generateScaleDataFromRealScale(config, colorScale);
        const labelData = generateScaleLabelDataFromRealData(config);
        
        console.log('📊 Dados da escala:', { scaleData: scaleData.length, labelData: labelData.length });
        
        // Renderiza barra de escala
        if (orientation === 'horizontal') {
            renderHorizontalScale(scaleContainer, scaleWidth, scaleHeight, scaleData, labelData, config);
        } else {
            renderVerticalScale(scaleContainer, scaleWidth, scaleHeight, scaleData, labelData, config);
        }
        
        console.log('✅ Escala de cores renderizada');
    }
    
    // ✅ CORREÇÃO: Gera dados da escala baseado na escala real
    function generateScaleDataFromRealScale(config, colorScale) {
        const values = vizCurrentData.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        
        const segments = 20; // Mais segmentos para gradiente suave
        const data = [];
        
        for (let i = 0; i < segments; i++) {
            const progress = i / (segments - 1);
            const value = minValue + (maxValue - minValue) * progress;
            
            // ✅ CORREÇÃO: Usa a escala real da visualização
            const color = colorScale(value);
            
            data.push({ 
                value, 
                color,
                progress 
            });
        }
        
        return data;
    }
    
    // ✅ CORREÇÃO: Gera labels baseados nos dados reais
    function generateScaleLabelDataFromRealData(config) {
        const values = vizCurrentData.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        
        const labelData = [];
        
        if (config.scaleType === 'continuous') {
            if (config.paletteType === 'diverging') {
                // Para divergente, usa o valor médio configurado
                const midValue = config.divergingMidValue || ((minValue + maxValue) / 2);
                labelData.push(
                    { position: 0, label: minValue.toFixed(1), value: minValue },
                    { position: 0.5, label: midValue.toFixed(1), value: midValue },
                    { position: 1, label: maxValue.toFixed(1), value: maxValue }
                );
            } else {
                // Para sequencial, min e max
                labelData.push(
                    { position: 0, label: minValue.toFixed(1), value: minValue },
                    { position: 1, label: maxValue.toFixed(1), value: maxValue }
                );
            }
        } else {
            // Escala quantile: usa as divisões reais
            const divisions = config.scaleDivisions || 5;
            const sortedValues = [...values].sort((a, b) => a - b);
            
            for (let i = 0; i <= divisions; i++) {
                const position = i / divisions;
                const quantileIndex = Math.floor(position * (sortedValues.length - 1));
                const value = sortedValues[quantileIndex];
                
                labelData.push({ 
                    position, 
                    label: value.toFixed(1), 
                    value 
                });
            }
        }
        
        return labelData;
    }
    
    function calculateScalePosition(position, width, height, orientation) {
        const margin = 20;
        const svgWidth = MAP_SETTINGS.fixedWidth;
        const svgHeight = MAP_SETTINGS.fixedHeight;
        
        // ✅ CORREÇÃO: Ajusta dimensões conforme orientação
        const finalWidth = orientation === 'vertical' ? height : width;
        const finalHeight = orientation === 'vertical' ? width : height;
        
        let x, y;
        
        switch (position) {
            case 'bottom-right':
                x = svgWidth - finalWidth - margin;
                y = svgHeight - finalHeight - margin - 60; // Mais espaço para fonte
                break;
            case 'bottom-left':
                x = margin;
                y = svgHeight - finalHeight - margin - 60;
                break;
            case 'top-right':
                x = svgWidth - finalWidth - margin;
                y = margin + 120; // Espaço para títulos
                break;
            case 'top-left':
                x = margin;
                y = margin + 120;
                break;
            case 'bottom-center':
                x = (svgWidth - finalWidth) / 2;
                y = svgHeight - finalHeight - margin - 60;
                break;
            case 'top-center':
                x = (svgWidth - finalWidth) / 2;
                y = margin + 120;
                break;
            default:
                x = svgWidth - finalWidth - margin;
                y = svgHeight - finalHeight - margin - 60;
        }
        
        console.log(`📍 Posição da escala (${position}, ${orientation}):`, { x, y });
        return { x, y };
    }
    
    function renderHorizontalScale(container, width, height, scaleData, labelData, config) {
        console.log('📏 Renderizando escala horizontal...');
        
        // Largura de cada segmento
        const segmentWidth = width / scaleData.length;
        
        // Renderiza retângulos coloridos
        container.selectAll('.scale-rect')
            .data(scaleData)
            .enter()
            .append('rect')
            .attr('class', 'scale-rect')
            .attr('x', (d, i) => i * segmentWidth)
            .attr('y', 0)
            .attr('width', segmentWidth)
            .attr('height', height)
            .attr('fill', d => d.color)
            .attr('stroke', 'none');
        
        // Borda da escala
        container.append('rect')
            .attr('class', 'scale-border')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'none')
            .attr('stroke', config.strokeColor || '#FFFFFF')
            .attr('stroke-width', 1);
        
        // Renderiza labels
        container.selectAll('.scale-label')
            .data(labelData)
            .enter()
            .append('text')
            .attr('class', 'scale-label')
            .attr('x', d => d.position * width)
            .attr('y', height + 15)
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .style('fill', config.textColor || '#2C3E50')
            .style('font-family', config.fontFamily || 'Inter')
            .text(d => d.label);
        
        console.log('✅ Escala horizontal renderizada');
    }
    
    function renderVerticalScale(container, width, height, scaleData, labelData, config) {
        console.log('📏 Renderizando escala vertical...');
        
        // Altura de cada segmento
        const segmentHeight = height / scaleData.length;
        
        // Renderiza retângulos coloridos (invertido para vertical)
        container.selectAll('.scale-rect')
            .data(scaleData)
            .enter()
            .append('rect')
            .attr('class', 'scale-rect')
            .attr('x', 0)
            .attr('y', (d, i) => height - (i + 1) * segmentHeight)
            .attr('width', width)
            .attr('height', segmentHeight)
            .attr('fill', d => d.color)
            .attr('stroke', 'none');
        
        // Borda da escala
        container.append('rect')
            .attr('class', 'scale-border')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', height)
            .attr('fill', 'none')
            .attr('stroke', config.strokeColor || '#FFFFFF')
            .attr('stroke-width', 1);
        
        // Renderiza labels
        container.selectAll('.scale-label')
            .data(labelData)
            .enter()
            .append('text')
            .attr('class', 'scale-label')
            .attr('x', width + 10)
            .attr('y', d => height - (d.position * height) + 4)
            .attr('text-anchor', 'start')
            .style('font-size', '10px')
            .style('fill', config.textColor || '#2C3E50')
            .style('font-family', config.fontFamily || 'Inter')
            .text(d => d.label);
        
        console.log('✅ Escala vertical renderizada');
    }
    
    function generateScaleData(config) {
        const segments = 10; // Número de segmentos na escala
        const data = [];
        
        for (let i = 0; i < segments; i++) {
            const value = i / (segments - 1);
            let color;
            
            if (config.paletteType === 'sequential') {
                // Interpola entre colorMin e colorMax
                color = d3.interpolateRgb(config.colorMin, config.colorMax)(value);
            } else {
                // Divergente: interpola através do meio
                if (value <= 0.5) {
                    color = d3.interpolateRgb(config.colorLow, config.colorMid)(value * 2);
                } else {
                    color = d3.interpolateRgb(config.colorMid, config.colorHigh)((value - 0.5) * 2);
                }
            }
            
            data.push({ value, color });
        }
        
        return data;
    }
    
    function generateScaleLabelData(config, scaleData) {
        // Gera labels baseado nos dados atuais
        if (!vizCurrentData || vizCurrentData.length === 0) {
            return [
                { position: 0, label: 'Min' },
                { position: 1, label: 'Max' }
            ];
        }
        
        const values = vizCurrentData.map(d => d.value);
        const minValue = Math.min(...values);
        const maxValue = Math.max(...values);
        
        const labelData = [];
        
        if (config.scaleType === 'continuous') {
            // Escala contínua: min, meio, max
            labelData.push(
                { position: 0, label: minValue.toFixed(1) },
                { position: 0.5, label: ((minValue + maxValue) / 2).toFixed(1) },
                { position: 1, label: maxValue.toFixed(1) }
            );
        } else {
            // Escala quantile: divisões
            const divisions = config.scaleDivisions || 5;
            for (let i = 0; i <= divisions; i++) {
                const position = i / divisions;
                const value = minValue + (maxValue - minValue) * position;
                labelData.push({ position, label: value.toFixed(1) });
            }
        }
        
        return labelData;
    }

    // ✅ NOVA FUNÇÃO: Gera dados de exemplo para configuração atual
    function generateSampleDataForCurrentConfig() {
        if (!vizMapConfig) {
            console.warn('⚠️ Configuração do mapa não definida');
            return null;
        }
        
        return generateSampleDataForMap(vizMapConfig);
    }

    // ==========================================================================
    // FUNÇÕES AUXILIARES
    // ==========================================================================

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

    function showNoDataMessage() {
        if (!vizSvg) return;
        
        vizSvg.selectAll('*').remove();
        
        const message = vizSvg.append('g')
            .attr('transform', `translate(${MAP_SETTINGS.fixedWidth / 2}, ${MAP_SETTINGS.fixedHeight / 2})`);
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', -10)
            .style('font-size', '3rem')
            .style('opacity', 0.7)
            .text('📊');
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', 20)
            .style('font-size', '1.25rem')
            .style('fill', '#FAF9FA')
            .text('Carregue dados para visualizar o mapa');
    }

    function showErrorMessage(errorText) {
        if (!vizSvg) return;
        
        vizSvg.selectAll('*').remove();
        
        const message = vizSvg.append('g')
            .attr('transform', `translate(${MAP_SETTINGS.fixedWidth / 2}, ${MAP_SETTINGS.fixedHeight / 2})`);
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', -10)
            .style('font-size', '3rem')
            .style('opacity', 0.7)
            .text('⚠️');
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('y', 20)
            .style('font-size', '1.25rem')
            .style('fill', '#FAF9FA')
            .text(errorText);
    }

    // ==========================================================================
    // FUNÇÕES DE INTERAÇÃO
    // ==========================================================================

    function handleMapHover(event, d, dataMap) {
        const data = dataMap.get(d.key);
        
        // Destaca área
        d3.select(event.currentTarget)
            .style('opacity', 0.8)
            .style('stroke-width', (vizCurrentConfig.strokeWidth || 1) + 1);
        
        // ✅ CORREÇÃO: Tooltip melhorado para dados ausentes
        showTooltip(event, {
            key: d.key,
            name: d.name || d.key,
            value: data ? data.value : null,
            formattedValue: data ? data.value.toFixed(1) : 'Sem dados',
            hasData: !!data
        });
    }

    function handleMapOut() {
        // Remove destaques
        d3.selectAll('.geo-area')
            .style('opacity', 1)
            .style('stroke-width', vizCurrentConfig.strokeWidth || 1);
        
        // Esconde tooltip
        hideTooltip();
    }

    function handleMapClick(event, d, dataMap) {
        const data = dataMap.get(d.key);
        
        if (window.OddVizApp?.showNotification) {
            const message = data ? 
                `${d.name || d.key}: ${data.value.toFixed(1)}` :
                `${d.name || d.key}: Sem dados`;
            window.OddVizApp.showNotification(message, 'info');
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
            .style('padding', '10px 12px')
            .style('border-radius', '6px')
            .style('font-size', '12px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('z-index', 1000)
            .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)')
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        
        // ✅ CORREÇÃO: Tooltip diferenciado para dados ausentes
        let tooltipContent = '<div style="font-weight: bold; margin-bottom: 4px;">' + (data.name || data.key) + '</div>';
        tooltipContent += '<div style="margin-bottom: 2px;">Código: ' + data.key + '</div>';
        
        if (data.hasData) {
            tooltipContent += '<div>Valor: ' + data.formattedValue + '</div>';
        } else {
            tooltipContent += '<div style="color: #ff9999; font-style: italic;">⚠️ Sem dados disponíveis</div>';
        }
        
        tooltip.html(tooltipContent);
        tooltip.transition().duration(200).style('opacity', 1);
    }

    function hideTooltip() {
        d3.selectAll('.viz-tooltip').remove();
    }

    // ✅ CORREÇÃO: Função para ler configuração diretamente do HTML
    function readTemplateConfigDirectlyFromHTML() {
        console.log('📖 Lendo configuração diretamente do HTML...');
        
        const config = {
            // Textos
            title: document.getElementById('chart-title')?.value || 'Mapa Interativo',
            subtitle: document.getElementById('chart-subtitle')?.value || 'Visualização geográfica personalizada',
            dataSource: document.getElementById('data-source')?.value || 'Dados de exemplo gerados automaticamente',
            
            // Cores básicas
            backgroundColor: document.getElementById('bg-color')?.value || '#FFFFFF',
            textColor: document.getElementById('text-color')?.value || '#2C3E50',
            
            // Tipografia
            fontFamily: document.getElementById('font-family')?.value || 'Inter',
            titleSize: parseInt(document.getElementById('title-size')?.value) || 24,
            subtitleSize: parseInt(document.getElementById('subtitle-size')?.value) || 16,
            labelSize: parseInt(document.getElementById('label-size')?.value) || 12,
            valueSize: parseInt(document.getElementById('value-size')?.value) || 10
        };
        
        console.log('📋 Configuração lida do HTML:', config);
        return config;
    }

    // ==========================================================================
    // FUNÇÕES DE CALLBACK
    // ==========================================================================

    // ✅ CORREÇÃO: Usar configurações específicas
    function onUpdate(newConfig) {
        console.log('🔄 Template controls atualizados via onUpdate:', newConfig);
        
        if (!vizCurrentData || vizCurrentData.length === 0) {
            console.log('⚠️ Sem dados para atualizar visualização');
            return;
        }
        
        // ✅ CORREÇÃO: Se newConfig está vazio ou incompleto, lê do HTML
        let finalTemplateConfig = newConfig;
        
        if (!newConfig || !newConfig.title || !newConfig.backgroundColor) {
            console.log('⚠️ Configuração incompleta recebida, lendo do HTML...');
            finalTemplateConfig = readTemplateConfigDirectlyFromHTML();
        }
        
        // ✅ CORREÇÃO: Obter configurações específicas atuais
        const specificConfig = window.InteractiveMapConfig?.getCurrentSpecificConfig?.() || {};
        
        // ✅ CORREÇÃO: Mesclar corretamente template + específicas
        const mergedConfig = createMergedConfig(finalTemplateConfig, specificConfig);
        
        console.log('🎨 Configuração final para re-renderização:', mergedConfig);
        
        // ✅ CORREÇÃO: Re-renderizar com configuração completa
        renderVisualization(vizCurrentData, mergedConfig);
    }

    function onSpecificConfigUpdate(specificConfig) {
        console.log('🎨 Configurações específicas atualizadas:', specificConfig);
        
        if (!vizCurrentData || vizCurrentData.length === 0) {
            console.log('⚠️ Sem dados para atualizar com configurações específicas');
            return;
        }
        
        // ✅ CORREÇÃO: Obter configuração do template atual
        const templateConfig = window.OddVizTemplateControls?.getState() || {};
        
        // ✅ CORREÇÃO: Mesclar template + específicas (específicas têm prioridade)
        const mergedConfig = createMergedConfig(templateConfig, specificConfig);
        
        console.log('🔄 Re-renderizando com configuração específica mesclada');
        renderVisualization(vizCurrentData, mergedConfig);
    }

    function onMapConfigUpdate(mapConfig) {
        console.log('🗺️ Configuração do mapa atualizada:', mapConfig);
        // Esta função é chamada quando mudanças na configuração base do mapa
        // Por ora, não fazemos nada aqui pois o mapa é regenerado
    }

    // ✅ CORREÇÃO: Melhorar integração
    function onDataLoaded(processedData) {
        if (!window.InteractiveMapConfig?.isConfigurationReady) {
            if (window.OddVizApp?.showNotification) {
                window.OddVizApp.showNotification(
                    'Configure o mapa primeiro antes de carregar dados.',
                    'warn'
                );
            }
            return;
        }
        
        if (processedData && processedData.data) {
            console.log('📊 Dados carregados:', processedData.data.length, 'itens');
            
            // ✅ CORREÇÃO: Atualizar preview de dados
            if (window.InteractiveMapConfig?.updateDataPreview) {
                window.InteractiveMapConfig.updateDataPreview(processedData.data);
            }
            
            // ✅ CORREÇÃO: Aguarda Template Controls estar pronto antes de renderizar
            setTimeout(() => {
                console.log('🎛️ Coletando configurações para renderização...');
                
                // ✅ CORREÇÃO: Força Template Controls a usar valores do HTML
                let templateConfig = {};
                
                if (window.OddVizTemplateControls?.getState) {
                    templateConfig = window.OddVizTemplateControls.getState();
                    console.log('📋 Template config obtido:', templateConfig);
                } else {
                    console.warn('⚠️ Template Controls não disponível, usando valores padrão');
                    // ✅ CORREÇÃO: Lê valores diretamente do HTML se Template Controls falhar
                    templateConfig = readTemplateConfigDirectlyFromHTML();
                }
                
                const specificConfig = window.InteractiveMapConfig?.getCurrentSpecificConfig?.() || {};
                console.log('📋 Specific config obtido:', specificConfig);
                
                const mergedConfig = createMergedConfig(templateConfig, specificConfig);
                console.log('🎨 Configuração final mesclada:', mergedConfig);
                
                renderVisualization(processedData.data, mergedConfig);
            }, 300);
        }
    }

    // ==========================================================================
    // EXPORTAÇÕES GLOBAIS
    // ==========================================================================

    window.InteractiveMapVisualization = {
        initVisualization: initVisualization,
        generateMap: generateMap,
        renderVisualization: renderVisualization,
        onUpdate: onUpdate,
        onSpecificConfigUpdate: onSpecificConfigUpdate, // ✅ NOVO
        onMapConfigUpdate: onMapConfigUpdate,
        onDataLoaded: onDataLoaded,
        generateSampleDataForCurrentConfig: generateSampleDataForCurrentConfig,
        MAP_SETTINGS: MAP_SETTINGS,
        
        // ✅ NOVO: Expõe dados atuais para verificação
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