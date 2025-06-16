/**
 * GRÁFICO DE WAFFLE - D3.js COM QUEBRA AUTOMÁTICA DE TEXTO
 * VERSÃO CORRIGIDA - Fonte dos dados posicionada dinamicamente
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURAÇÕES ESPECÍFICAS DO WAFFLE
    // ==========================================================================

    const WAFFLE_SETTINGS = {
        gridSize: 10,
        totalSquares: 100,
        
        // Sempre usa formato quadrado - dimensões fixas
        fixedWidth: 600,
        fixedHeight: 600,
        
        margins: {
            top: 50, 
            right: 50, 
            bottom: 70, 
            left: 50
        },
        
        spacing: {
            directLabelOffset: 25
        },
        
        animationDuration: 600,
        staggerDelay: 10
    };

    // ==========================================================================
    // VARIÁVEIS PRIVADAS
    // ==========================================================================

    let vizSvg = null;
    let vizWaffleGroup = null;
    let vizDirectLabelsGroup = null;
    let vizColorScale = null;
    let vizCurrentData = null;
    let vizProcessedData = null;
    let vizSquaresArray = null;
    let vizCurrentConfig = null;
    let vizLayoutInfo = null;
    let vizCurrentTitlesHeight = 0; // ✅ NOVA: Altura atual dos títulos

    // Configurações específicas do waffle
    let waffleConfig = {
        size: 25,
        gap: 2,
        roundness: 3,
        animation: false,
        hover_effect: true,
        maxSize: 35,
        minSize: 12,
        maxGap: 6
    };

    // ==========================================================================
    // INICIALIZAÇÃO - COM QUEBRA DE TEXTO
    // ==========================================================================

    function initVisualization() {
        if (typeof d3 === 'undefined') {
            console.error('D3.js não está carregado!');
            return;
        }
        
        console.log('🧇 Inicializando Waffle Chart com quebra de texto...');
        
        // ✅ NOVA: Informa largura da visualização para quebra de texto
        if (window.OddVizTemplateControls?.setVisualizationWidth) {
            window.OddVizTemplateControls.setVisualizationWidth(600, 'square');
            console.log('📐 Largura configurada: 600px (formato quadrado)');
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
                
                // ✅ APENAS recebe configuração do Template Controls
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
            .attr('id', 'waffle-viz')
            .attr('width', WAFFLE_SETTINGS.fixedWidth)
            .attr('height', WAFFLE_SETTINGS.fixedHeight);
        
        // Grupos organizados
        vizWaffleGroup = vizSvg.append('g').attr('class', 'waffle-group');
        vizDirectLabelsGroup = vizSvg.append('g').attr('class', 'direct-labels-group');
    }

    // ==========================================================================
    // CÁLCULO DE LAYOUT - COM TÍTULOS DINÂMICOS E FONTE POSICIONADA CORRETAMENTE
    // ==========================================================================

    function calculateLayout(config) {
        const margins = WAFFLE_SETTINGS.margins;
        const spacing = WAFFLE_SETTINGS.spacing;
        
        let availableWidth = WAFFLE_SETTINGS.fixedWidth - margins.left - margins.right;
        let availableHeight = WAFFLE_SETTINGS.fixedHeight - margins.top - margins.bottom;
        
        // ✅ CORRIGIDO: Calcula altura dinâmica dos títulos (incluindo fonte dos dados)
        let titlesHeight = 0;
        let sourceHeight = 0;
        
        if (window.OddVizTemplateControls?.calculateTitlesHeight) {
            titlesHeight = window.OddVizTemplateControls.calculateTitlesHeight(config, WAFFLE_SETTINGS.fixedWidth);
            vizCurrentTitlesHeight = titlesHeight;
            console.log(`📏 Altura total dos textos (títulos + fonte): ${titlesHeight}px`);
        } else {
            // Fallback para altura estimada
            titlesHeight = 50; // Margem superior básica
            if (config.title) titlesHeight += (config.titleSize || 24) * 1.5; // Considera quebra de linha
            if (config.subtitle) titlesHeight += (config.subtitleSize || 16) * 1.2;
            if (config.dataSource) {
                sourceHeight = 25; // Altura da fonte separada
                titlesHeight += sourceHeight;
            }
            vizCurrentTitlesHeight = titlesHeight;
        }
        
        // ✅ CORRIGIDO: Área disponível para o waffle considerando TUDO
        const reservedSpaceForSource = 40; // Espaço reservado na parte inferior
        const usableHeight = WAFFLE_SETTINGS.fixedHeight - margins.top - margins.bottom - reservedSpaceForSource;
        const waffleAreaHeight = usableHeight - (titlesHeight - margins.top);
        let waffleAreaWidth = availableWidth;
        
        console.log(`📐 Área disponível para waffle: ${waffleAreaWidth}x${waffleAreaHeight}px`);
        console.log(`📏 Títulos ocupam: ${titlesHeight}px`);
        
        // Calcula largura das legendas
        let labelWidth = 0;
        const showDirectLabels = getWaffleConfig('showDirectLabels', true);
        if (showDirectLabels) {
            labelWidth = 100;
            waffleAreaWidth -= labelWidth + spacing.directLabelOffset;
        }
        
        // ✅ PROTEÇÃO: Se área for muito pequena, ajusta
        if (waffleAreaHeight < 150) {
            console.warn('⚠️ Área muito pequena para waffle - ajustando tamanhos');
            waffleAreaHeight = Math.max(150, waffleAreaHeight);
        }
        
        // Calcula tamanho ótimo do waffle baseado na área disponível
        const maxWaffleSize = Math.min(waffleAreaWidth, waffleAreaHeight);
        const waffleSize = calculateOptimalWaffleSize(maxWaffleSize, maxWaffleSize);
        
        // Centraliza considerando se há rótulos ou não
        const totalContentWidth = showDirectLabels ? 
            waffleSize.totalWidth + spacing.directLabelOffset + labelWidth :
            waffleSize.totalWidth;
        const contentStartX = margins.left + (availableWidth - totalContentWidth) / 2;
        
        // Ajusta posição do waffle baseado na posição dos rótulos
        const directLabelPosition = getWaffleConfig('directLabelPosition', 'right');
        let waffleX;
        if (showDirectLabels) {
            if (directLabelPosition === 'right') {
                waffleX = contentStartX;
            } else {
                waffleX = contentStartX + labelWidth + spacing.directLabelOffset;
            }
        } else {
            waffleX = contentStartX;
        }
        
        // ✅ CORRIGIDO: Posição Y do waffle centralizada na área disponível
        const effectiveTitlesHeight = Math.max(titlesHeight - margins.top, 0);
        const waffleY = margins.top + effectiveTitlesHeight + 
                       Math.max(0, (waffleAreaHeight - waffleSize.totalHeight) / 2);
        
        // ✅ CORRIGIDO: Posição dinâmica da fonte dos dados
        const sourceY = WAFFLE_SETTINGS.fixedHeight - reservedSpaceForSource;
        
        return {
            margins,
            spacing,
            titlesHeight,
            waffleAreaHeight,
            sourceY, // ✅ NOVA: Posição dinâmica da fonte
            waffle: {
                x: waffleX,
                y: waffleY,
                width: waffleSize.totalWidth,
                height: waffleSize.totalHeight,
                squareSize: waffleSize.squareSize,
                gap: waffleSize.gap
            },
            directLabels: {
                x: showDirectLabels ? (
                    directLabelPosition === 'right' ? 
                        waffleX + waffleSize.totalWidth + spacing.directLabelOffset :
                        contentStartX + labelWidth
                ) : waffleX,
                y: waffleY,
                align: directLabelPosition === 'right' ? 'start' : 'end',
                show: showDirectLabels
            },
            // ✅ CORRIGIDO: Layout para sistema de quebra de texto
            textLayout: {
                width: WAFFLE_SETTINGS.fixedWidth,
                height: WAFFLE_SETTINGS.fixedHeight,
                startY: margins.top,
                sourceY: sourceY // ✅ Posição específica da fonte
            }
        };
    }

    function calculateOptimalWaffleSize(maxWidth, maxHeight) {
        let squareSize = Math.min(waffleConfig.maxSize, Math.max(waffleConfig.minSize, waffleConfig.size));
        let gap = Math.min(waffleConfig.maxGap, Math.max(0.5, waffleConfig.gap));
        
        let totalSize = (squareSize * WAFFLE_SETTINGS.gridSize) + (gap * (WAFFLE_SETTINGS.gridSize - 1));
        
        const maxAvailable = Math.min(maxWidth, maxHeight);
        if (totalSize > maxAvailable) {
            const scale = (maxAvailable * 0.85) / totalSize;
            squareSize = Math.max(waffleConfig.minSize, Math.floor(squareSize * scale));
            gap = Math.max(0.5, Math.floor(gap * scale * 10) / 10);
            totalSize = (squareSize * WAFFLE_SETTINGS.gridSize) + (gap * (WAFFLE_SETTINGS.gridSize - 1));
        }
        
        return { squareSize, gap, totalWidth: totalSize, totalHeight: totalSize };
    }

    // ==========================================================================
    // PROCESSAMENTO DE DADOS (INALTERADO)
    // ==========================================================================

    function processDataForWaffle(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return { processedData: [], squaresArray: [] };
        }
        
        const total = data.reduce((sum, d) => sum + (d.valor || 0), 0);
        if (total === 0) return { processedData: [], squaresArray: [] };
        
        let processedData = data.map(d => {
            const proportion = d.valor / total;
            const squares = Math.round(proportion * WAFFLE_SETTINGS.totalSquares);
            return {
                ...d,
                proportion: proportion,
                squares: squares,
                percentage: Math.round(proportion * 100)
            };
        });
        
        // Ajusta para garantir exatamente 100 quadrados
        const totalSquares = processedData.reduce((sum, d) => sum + d.squares, 0);
        const diff = WAFFLE_SETTINGS.totalSquares - totalSquares;
        
        if (diff !== 0) {
            const maxIndex = processedData.reduce((maxIdx, d, idx) => 
                d.squares > processedData[maxIdx].squares ? idx : maxIdx, 0);
            processedData[maxIndex].squares += diff;
            processedData[maxIndex].percentage = Math.round(processedData[maxIndex].squares);
        }
        
        const squaresArray = generateSquaresArray(processedData);
        return { processedData, squaresArray };
    }

    function generateSquaresArray(processedData) {
        const squares = [];
        let currentIndex = 0;
        
        processedData.forEach((category, categoryIndex) => {
            for (let i = 0; i < category.squares; i++) {
                squares.push({
                    index: currentIndex,
                    row: Math.floor(currentIndex / WAFFLE_SETTINGS.gridSize),
                    col: currentIndex % WAFFLE_SETTINGS.gridSize,
                    category: category.categoria,
                    value: category.valor,
                    categoryIndex: categoryIndex,
                    percentage: category.percentage,
                    originalData: category
                });
                currentIndex++;
            }
        });
        
        return squares;
    }

    // ==========================================================================
    // RENDERIZAÇÃO PRINCIPAL - COM QUEBRA DE TEXTO E FONTE CORRIGIDA
    // ==========================================================================

    function renderVisualization(data, config) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            showNoDataMessage();
            return;
        }
        
        vizCurrentData = data;
        vizCurrentConfig = config; // ✅ USA CONFIGURAÇÃO DO TEMPLATE CONTROLS
        
        const result = processDataForWaffle(data);
        vizProcessedData = result.processedData;
        vizSquaresArray = result.squaresArray;
        
        if (vizSquaresArray.length === 0) {
            showNoDataMessage();
            return;
        }
        
        vizLayoutInfo = calculateLayout(vizCurrentConfig);
        
        updateSVGDimensions();
        createColorScale();
        
        // ✅ CORRIGIDO: Renderiza títulos com quebra automática E fonte posicionada corretamente
        renderTitlesWithWrap();
        
        renderWaffleSquares();
        renderDirectLabels();
        
        console.log('🎨 Waffle renderizado com quebra de texto e fonte posicionada dinamicamente');
    }

    function updateSVGDimensions() {
        if (!vizSvg) return;
        
        vizSvg.attr('width', WAFFLE_SETTINGS.fixedWidth)
              .attr('height', WAFFLE_SETTINGS.fixedHeight);
        
        vizSvg.selectAll('.svg-background').remove();
        
        vizSvg.insert('rect', ':first-child')
            .attr('class', 'svg-background')
            .attr('width', WAFFLE_SETTINGS.fixedWidth)
            .attr('height', WAFFLE_SETTINGS.fixedHeight)
            .attr('fill', vizCurrentConfig.backgroundColor || '#FFFFFF');
    }

    function createColorScale() {
        // ✅ USA PALETA DO TEMPLATE CONTROLS
        const colors = window.OddVizTemplateControls?.getCurrentColorPalette() || 
                      ['#6F02FD', '#2C0165', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8'];
        
        vizColorScale = d3.scaleOrdinal()
            .domain(vizProcessedData.map(d => d.categoria))
            .range(colors);
    }

    // ✅ CORRIGIDO: Função de renderização de títulos com fonte posicionada dinamicamente
    function renderTitlesWithWrap() {
        if (!window.OddVizTemplateControls?.renderTitlesWithWrap) {
            console.warn('⚠️ Sistema de quebra de texto não disponível - usando fallback');
            renderTitlesFallback();
            return;
        }
        
        // ✅ CORRIGIDO: Renderiza título e subtítulo com sistema padrão
        const layout = vizLayoutInfo.textLayout;
        
        const titleResults = window.OddVizTemplateControls.renderTitlesWithWrap(
            vizSvg,
            vizCurrentConfig,
            layout
        );
        
        // ✅ CORRIGIDO: Renderiza fonte dos dados com posição dinâmica
        renderDataSourceDynamic();
        
        console.log(`📝 Títulos renderizados com quebra automática`);
        console.log(`📍 Fonte dos dados na posição: ${vizLayoutInfo.sourceY}px`);
    }

    // ✅ NOVA: Função específica para renderizar fonte dos dados com posição dinâmica
    function renderDataSourceDynamic() {
        // Remove fonte anterior
        vizSvg.selectAll('.chart-source-svg').remove();
        
        if (!vizCurrentConfig.dataSource || !vizCurrentConfig.dataSource.trim()) {
            return;
        }
        
        const textColor = vizCurrentConfig.textColor || '#2C3E50';
        const fontFamily = vizCurrentConfig.fontFamily || 'Inter';
        
        // ✅ CORRIGIDO: Usa posição dinâmica calculada no layout
        const sourceY = vizLayoutInfo.sourceY;
        
        // ✅ USANDO SISTEMA DE QUEBRA PARA A FONTE TAMBÉM
        if (window.OddVizTemplateControls?.SVGTextWrapper) {
            const sourceWrapper = new window.OddVizTemplateControls.SVGTextWrapper(vizSvg, {
                maxWidth: WAFFLE_SETTINGS.fixedWidth - 100, // Margem das laterais
                fontSize: 11,
                fontFamily: fontFamily,
                fontWeight: 'normal',
                maxLines: 2, // Máximo 2 linhas para fonte
                fill: textColor,
                opacity: 0.6,
                lineHeight: 1.15
            });
            
            sourceWrapper.renderWrappedText(
                WAFFLE_SETTINGS.fixedWidth / 2,
                sourceY,
                vizCurrentConfig.dataSource,
                'chart-source-svg'
            );
        } else {
            // Fallback simples
            vizSvg.append('text')
                .attr('class', 'chart-source-svg')
                .attr('x', WAFFLE_SETTINGS.fixedWidth / 2)
                .attr('y', sourceY)
                .attr('text-anchor', 'middle')
                .style('fill', textColor)
                .style('font-family', fontFamily)
                .style('font-size', '11px')
                .style('opacity', 0.6)
                .text(vizCurrentConfig.dataSource);
        }
    }

    // ✅ CORRIGIDO: Fallback completo
    function renderTitlesFallback() {
        vizSvg.selectAll('.chart-title-svg, .chart-subtitle-svg, .chart-source-svg').remove();
        
        const config = vizCurrentConfig;
        const textColor = config.textColor || '#2C3E50';
        const fontFamily = config.fontFamily || 'Inter';
        
        let currentY = 40;
        
        if (config.title) {
            vizSvg.append('text')
                .attr('class', 'chart-title-svg')
                .attr('x', WAFFLE_SETTINGS.fixedWidth / 2)
                .attr('y', currentY)
                .attr('text-anchor', 'middle')
                .style('fill', textColor)
                .style('font-family', fontFamily)
                .style('font-size', (config.titleSize || 24) + 'px')
                .style('font-weight', 'bold')
                .text(config.title);
            
            currentY += (config.titleSize || 24) + 10;
        }
        
        if (config.subtitle) {
            vizSvg.append('text')
                .attr('class', 'chart-subtitle-svg')
                .attr('x', WAFFLE_SETTINGS.fixedWidth / 2)
                .attr('y', currentY)
                .attr('text-anchor', 'middle')
                .style('fill', textColor)
                .style('font-family', fontFamily)
                .style('font-size', (config.subtitleSize || 16) + 'px')
                .style('opacity', 0.8)
                .text(config.subtitle);
        }
        
        // ✅ CORRIGIDO: Fonte dos dados com posição dinâmica mesmo no fallback
        if (config.dataSource) {
            vizSvg.append('text')
                .attr('class', 'chart-source-svg')
                .attr('x', WAFFLE_SETTINGS.fixedWidth / 2)
                .attr('y', vizLayoutInfo?.sourceY || (WAFFLE_SETTINGS.fixedHeight - 20))
                .attr('text-anchor', 'middle')
                .style('fill', textColor)
                .style('font-family', fontFamily)
                .style('font-size', '11px')
                .style('opacity', 0.6)
                .text(config.dataSource);
        }
    }

    function renderWaffleSquares() {
        vizWaffleGroup.selectAll('.waffle-square').remove();
        
        const layout = vizLayoutInfo.waffle;
        vizWaffleGroup.attr('transform', `translate(${layout.x}, ${layout.y})`);
        
        const squares = vizWaffleGroup.selectAll('.waffle-square')
            .data(vizSquaresArray, d => d.index);
        
        const squareEnter = squares.enter()
            .append('rect')
            .attr('class', 'waffle-square')
            .attr('x', d => d.col * (layout.squareSize + layout.gap))
            .attr('y', d => d.row * (layout.squareSize + layout.gap))
            .attr('width', layout.squareSize)
            .attr('height', layout.squareSize)
            .attr('rx', waffleConfig.roundness)
            .attr('ry', waffleConfig.roundness)
            .attr('fill', d => vizColorScale(d.category))
            .style('cursor', waffleConfig.hover_effect ? 'pointer' : 'default')
            .style('opacity', waffleConfig.animation ? 0 : 1);
        
        if (waffleConfig.hover_effect) {
            squareEnter
                .on('mouseover', handleSquareHover)
                .on('mouseout', handleSquareOut)
                .on('click', handleSquareClick);
        }
        
        if (waffleConfig.animation) {
            squareEnter
                .transition()
                .duration(WAFFLE_SETTINGS.animationDuration)
                .delay((d, i) => i * WAFFLE_SETTINGS.staggerDelay)
                .style('opacity', 1);
        }
    }

    function renderDirectLabels() {
        vizDirectLabelsGroup.selectAll('*').remove();
        
        const layout = vizLayoutInfo.directLabels;
        if (!layout.show || !vizProcessedData || vizProcessedData.length === 0) {
            return;
        }
        
        const waffle = vizLayoutInfo.waffle;
        const stepY = waffle.height / vizProcessedData.length;
        
        vizProcessedData.forEach((d, i) => {
            const labelY = layout.y + (i + 0.5) * stepY;
            
            const labelGroup = vizDirectLabelsGroup.append('g')
                .attr('class', 'direct-label-item')
                .attr('transform', `translate(${layout.x}, ${labelY})`);
            
            labelGroup.append('text')
                .attr('text-anchor', layout.align)
                .attr('dy', '0.32em')
                .style('fill', vizColorScale(d.categoria))
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', (vizCurrentConfig.labelSize || 12) + 'px')
                .style('font-weight', '600')
                .text(d.categoria);
            
            labelGroup.append('text')
                .attr('text-anchor', layout.align)
                .attr('dy', '1.5em')
                .style('fill', vizCurrentConfig.textColor || '#2C3E50')
                .style('font-family', vizCurrentConfig.fontFamily || 'Inter')
                .style('font-size', ((vizCurrentConfig.labelSize || 12) - 1) + 'px')
                .style('opacity', 0.7)
                .text(`${d.percentage}%`);
        });
    }

    // ==========================================================================
    // INTERAÇÕES (INALTERADO)
    // ==========================================================================

    function handleSquareHover(event, d) {
        if (!waffleConfig.hover_effect) return;
        
        d3.select(event.target)
            .transition()
            .duration(200)
            .style('opacity', 0.7)
            .attr('stroke', vizCurrentConfig.textColor || '#2C3E50')
            .attr('stroke-width', 2);
        
        vizWaffleGroup.selectAll('.waffle-square')
            .filter(square => square.category === d.category)
            .transition()
            .duration(200)
            .style('opacity', 0.9);
        
        vizWaffleGroup.selectAll('.waffle-square')
            .filter(square => square.category !== d.category)
            .transition()
            .duration(200)
            .style('opacity', 0.3);
        
        showTooltip(event, d);
    }

    function handleSquareOut(event, d) {
        if (!waffleConfig.hover_effect) return;
        
        d3.select(event.target)
            .transition()
            .duration(200)
            .style('opacity', 1)
            .attr('stroke', 'none');
        
        vizWaffleGroup.selectAll('.waffle-square')
            .transition()
            .duration(200)
            .style('opacity', 1);
        
        hideTooltip();
    }

    function handleSquareClick(event, d) {
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(`${d.category}: ${d.percentage}%`, 'info');
        }
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
                <div style="font-weight: bold; margin-bottom: 4px;">${d.category}</div>
                <div>Valor: ${d.value}</div>
                <div>Porcentagem: ${d.percentage}%</div>
            `);
        
        tooltip.transition().duration(200).style('opacity', 1);
    }

    function hideTooltip() {
        d3.selectAll('.viz-tooltip').remove();
    }

    // ==========================================================================
    // ATUALIZAÇÃO DE CONTROLES - COM DETECÇÃO DE MUDANÇAS DE TEXTO
    // ==========================================================================

    function onUpdate(newConfig) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        console.log('🔄 Atualizando waffle com nova configuração do template');
        
        // ✅ NOVA: Detecta mudanças de configuração de texto
        const textChanged = detectTextChanges(vizCurrentConfig, newConfig);
        
        if (textChanged) {
            console.log('📝 Configuração de texto mudou - recalculando layout completo');
            
            // Recalcula altura dos títulos
            const newTitlesHeight = window.OddVizTemplateControls?.calculateTitlesHeight(newConfig, WAFFLE_SETTINGS.fixedWidth) || 80;
            
            if (Math.abs(newTitlesHeight - vizCurrentTitlesHeight) > 5) { // Tolerância de 5px
                console.log(`📏 Altura dos títulos mudou: ${vizCurrentTitlesHeight}px → ${newTitlesHeight}px`);
                // Força re-renderização completa
                vizCurrentConfig = newConfig;
                renderVisualization(vizCurrentData, vizCurrentConfig);
                return;
            }
        }
        
        // ✅ Atualização normal se texto não mudou significativamente
        vizCurrentConfig = newConfig;
        
        // Re-renderiza elementos que dependem da configuração
        updateSVGDimensions();
        createColorScale();
        renderTitlesWithWrap();
        renderWaffleSquares();
        renderDirectLabels();
    }

    // ✅ NOVA: Função para detectar mudanças de texto
    function detectTextChanges(oldConfig, newConfig) {
        if (!oldConfig) return true;
        
        const textProperties = [
            'title', 'subtitle', 'dataSource',
            'titleSize', 'subtitleSize', 'fontFamily'
        ];
        
        return textProperties.some(prop => oldConfig[prop] !== newConfig[prop]);
    }

    function onWaffleControlUpdate(waffleControls) {
        // Valida limites
        if (waffleControls.size) {
            waffleControls.size = Math.min(waffleConfig.maxSize, Math.max(waffleConfig.minSize, waffleControls.size));
        }
        if (waffleControls.gap) {
            waffleControls.gap = Math.min(waffleConfig.maxGap, Math.max(0.5, waffleControls.gap));
        }
        
        Object.assign(waffleConfig, waffleControls);
        
        console.log('🧇 Controles waffle atualizados:', waffleControls);
        
        if (vizCurrentData && vizCurrentData.length > 0) {
            renderVisualization(vizCurrentData, vizCurrentConfig);
        }
    }

    function updateColorPalette(paletteType) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        console.log('🎨 Paleta atualizada pelo template:', paletteType);
        
        // Re-renderiza (createColorScale vai buscar a paleta atual do template)
        renderVisualization(vizCurrentData, vizCurrentConfig);
    }

    function updateCustomColors(customColors) {
        if (!vizCurrentData || vizCurrentData.length === 0) return;
        
        console.log('🎨 Cores customizadas:', customColors);
        
        // Aplica cores customizadas diretamente
        vizColorScale = d3.scaleOrdinal()
            .domain(vizProcessedData.map(d => d.categoria))
            .range(customColors);
        
        // Re-renderiza apenas os quadrados
        renderWaffleSquares();
        renderDirectLabels();
    }

    function onDataLoaded(processedData) {
        if (processedData?.data) {
            console.log('📊 Novos dados carregados:', processedData.data.length + ' linhas');
            const templateState = window.OddVizTemplateControls?.getState() || {};
            renderVisualization(processedData.data, templateState);
        }
    }

    // ==========================================================================
    // UTILITÁRIOS ESPECÍFICOS DO WAFFLE
    // ==========================================================================

    function getWaffleConfig(key, defaultValue) {
        // Busca primeiro nos controles HTML específicos do waffle
        switch(key) {
            case 'showDirectLabels':
                const showLegend = document.getElementById('show-legend')?.checked;
                return showLegend !== undefined ? showLegend : defaultValue;
            case 'directLabelPosition':
                const position = document.querySelector('input[name="direct-label-position"]:checked')?.value;
                return position || defaultValue;
            default:
                return defaultValue;
        }
    }

    function showNoDataMessage() {
        if (!vizSvg) return;
        
        vizSvg.selectAll('*').remove();
        
        const config = vizCurrentConfig || {};
        
        vizSvg.append('rect')
            .attr('class', 'svg-background')
            .attr('width', WAFFLE_SETTINGS.fixedWidth)
            .attr('height', WAFFLE_SETTINGS.fixedHeight)
            .attr('fill', config.backgroundColor || '#FFFFFF');
        
        const message = vizSvg.append('g')
            .attr('class', 'no-data-message')
            .attr('transform', `translate(${WAFFLE_SETTINGS.fixedWidth / 2}, ${WAFFLE_SETTINGS.fixedHeight / 2})`);
        
        message.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-20px')
            .style('fill', config.textColor || '#2C3E50')
            .style('font-family', config.fontFamily || 'Inter')
            .style('font-size', '24px')
            .text('🧇');
        
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

    window.WaffleVisualization = {
        initVisualization: initVisualization,
        renderVisualization: renderVisualization,
        onUpdate: onUpdate,
        onWaffleControlUpdate: onWaffleControlUpdate,
        onDataLoaded: onDataLoaded,
        updateColorPalette: updateColorPalette,
        updateCustomColors: updateCustomColors,
        WAFFLE_SETTINGS: WAFFLE_SETTINGS,
        
        // ✅ CORREÇÃO: Expõe variáveis necessárias para cores personalizadas
        get vizProcessedData() { return vizProcessedData; },
        get vizColorScale() { return vizColorScale; },
        
        // Expõe dados atuais para outros sistemas
        get vizCurrentData() { return vizCurrentData; },
        get vizCurrentConfig() { return vizCurrentConfig; },
        get vizCurrentTitlesHeight() { return vizCurrentTitlesHeight; }
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
