/**
 * ODDATAVIZ - Utilitários de Exportação CORRIGIDOS
 * Funções para exportar visualizações em SVG, PNG e código embed STANDALONE
 * Versão compatível com GitHub Pages
 */

(function() {
    'use strict';

    // ==========================================================================
    // CONFIGURAÇÕES DE EXPORTAÇÃO
    // ==========================================================================

    var EXPORT_CONFIG = {
        // Configurações SVG
        svg: {
            namespace: 'http://www.w3.org/2000/svg',
            defaultWidth: 800,
            defaultHeight: 600,
            quality: 'high'
        },
        
        // Configurações PNG
        png: {
            defaultWidth: 800,
            defaultHeight: 600,
            quality: 0.95,
            backgroundColor: '#FFFFFF' // Mudado para branco
        },
        
        // Configurações de embed
        embed: {
            template: 'standalone',
            responsive: true,
            includeStyles: true,
            d3Version: '7.8.5'
        }
    };

    // ==========================================================================
    // COLETA DE DADOS E CONFIGURAÇÕES ATUAIS
    // ==========================================================================

    /**
     * Coleta estado completo da visualização atual
     */
    function getCurrentVisualizationState() {
        try {
            var state = {
                type: 'waffle-chart',
                data: null,
                config: null,
                svgElement: null
            };

            // Coleta dados atuais
            if (window.WaffleVisualization && window.WaffleVisualization.getCurrentData) {
                state.data = window.WaffleVisualization.getCurrentData();
            } else if (window.vizCurrentData) {
                state.data = window.vizCurrentData;
            } else {
                // Fallback: usa dados de exemplo
                if (window.getSampleData) {
                    var sampleData = window.getSampleData();
                    state.data = sampleData.data;
                }
            }

            // Coleta configurações atuais
            if (window.WaffleVisualization && window.WaffleVisualization.getCurrentConfig) {
                state.config = window.WaffleVisualization.getCurrentConfig();
            } else if (window.vizCurrentConfig) {
                state.config = window.vizCurrentConfig;
            } else if (window.OddVizTemplateControls && window.OddVizTemplateControls.getState) {
                state.config = window.OddVizTemplateControls.getState();
            } else {
                // Fallback: configuração padrão
                state.config = getDefaultWaffleConfig();
            }

            // Coleta configurações específicas do waffle
            if (window.waffleConfig) {
                state.waffleConfig = window.waffleConfig;
            } else {
                state.waffleConfig = {
                    size: 25,
                    gap: 2,
                    roundness: 3,
                    animation: false,
                    hover_effect: true
                };
            }

            // Coleta SVG atual
            state.svgElement = getSVGElement();

            return state;
        } catch (error) {
            console.error('Erro ao coletar estado da visualização:', error);
            return null;
        }
    }

    /**
     * Configuração padrão do waffle para fallback
     */
    function getDefaultWaffleConfig() {
        return {
            width: 800,
            height: 600,
            screenFormat: 'square',
            title: 'Distribuição por Categoria',
            subtitle: 'Visualização em formato waffle',
            dataSource: 'Dados de Exemplo, 2024',
            colors: ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'],
            backgroundColor: '#FFFFFF',
            textColor: '#2C3E50',
            fontFamily: 'Inter',
            titleSize: 24,
            subtitleSize: 16,
            labelSize: 12,
            showLegend: true,
            legendDirect: true,
            directLabelPosition: 'right'
        };
    }

    // ==========================================================================
    // GERAÇÃO DE CÓDIGO EMBED STANDALONE
    // ==========================================================================

    /**
     * Gera código HTML completo e standalone
     */
    function generateStandaloneEmbedCode() {
        try {
            var state = getCurrentVisualizationState();
            if (!state || !state.data) {
                throw new Error('Não foi possível obter dados da visualização');
            }

            var htmlTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(state.config.title || 'Gráfico de Waffle')}</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/${EXPORT_CONFIG.embed.d3Version}/d3.min.js"></script>
    <style>
        ${getEmbedCSS()}
    </style>
</head>
<body>
    <div id="waffle-chart-container">
        <div id="chart"></div>
    </div>
    
    <script>
        ${getWaffleVisualizationCode(state)}
        
        // Dados da visualização
        var embedData = ${JSON.stringify(state.data)};
        
        // Configuração da visualização  
        var embedConfig = ${JSON.stringify(state.config)};
        
        // Configuração específica do waffle
        var embedWaffleConfig = ${JSON.stringify(state.waffleConfig)};
        
        // Inicializa visualização quando D3 carregar
        function initEmbedVisualization() {
            if (typeof d3 !== 'undefined') {
                try {
                    var viz = new WaffleChartEmbed('chart', embedData, embedConfig, embedWaffleConfig);
                    viz.render();
                } catch (error) {
                    console.error('Erro ao inicializar visualização:', error);
                    document.getElementById('chart').innerHTML = '<p>Erro ao carregar visualização</p>';
                }
            } else {
                setTimeout(initEmbedVisualization, 100);
            }
        }
        
        // Inicia quando página carregar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initEmbedVisualization);
        } else {
            initEmbedVisualization();
        }
    </script>
</body>
</html>`;

            return htmlTemplate;
        } catch (error) {
            console.error('Erro ao gerar código standalone:', error);
            throw error;
        }
    }

    /**
     * CSS para o embed
     */
    function getEmbedCSS() {
        return `
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Inter', Arial, sans-serif;
            background: #FFFFFF;
        }
        
        #waffle-chart-container {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        #chart {
            width: 100%;
            height: 100%;
        }
        
        svg {
            max-width: 100%;
            height: auto;
        }
        
        .waffle-square {
            cursor: pointer;
            transition: opacity 0.2s ease;
        }
        
        .waffle-square:hover {
            opacity: 0.7;
        }
        
        .direct-label-item text {
            font-family: 'Inter', Arial, sans-serif;
        }
        
        .chart-title-svg {
            font-family: 'Inter', Arial, sans-serif;
        }
        
        .chart-subtitle-svg {
            font-family: 'Inter', Arial, sans-serif;
        }
        
        .chart-source-svg {
            font-family: 'Inter', Arial, sans-serif;
        }`;
    }

    /**
     * Código JavaScript do waffle chart para embed
     */
    function getWaffleVisualizationCode(state) {
        return `
        // Classe do Waffle Chart para Embed
        function WaffleChartEmbed(containerId, data, config, waffleConfig) {
            this.container = d3.select('#' + containerId);
            this.data = data;
            this.config = config;
            this.waffleConfig = waffleConfig;
            this.svg = null;
            this.processedData = null;
            
            // Configurações do waffle
            this.WAFFLE_SETTINGS = {
                gridSize: 10,
                totalSquares: 100,
                margins: {
                    square: { top: 50, right: 50, bottom: 70, left: 50 }
                },
                spacing: {
                    titleToSubtitle: 20,
                    subtitleToChart: 30,
                    chartToLegend: 25,
                    legendToSource: 20,
                    directLabelOffset: 25
                }
            };
        }
        
        WaffleChartEmbed.prototype.render = function() {
            try {
                this.processData();
                this.createSVG();
                this.renderWaffle();
                this.renderTitles();
                this.renderLegend();
                this.renderSource();
            } catch (error) {
                console.error('Erro na renderização:', error);
            }
        };
        
        WaffleChartEmbed.prototype.processData = function() {
            var total = this.data.reduce(function(sum, d) { return sum + (d.valor || 0); }, 0);
            
            this.processedData = this.data.map(function(d) {
                var proportion = d.valor / total;
                var squares = Math.round(proportion * 100);
                return {
                    categoria: d.categoria,
                    valor: d.valor,
                    squares: squares,
                    percentage: Math.round(proportion * 100)
                };
            });
            
            // Ajusta para garantir 100 quadrados
            var totalSquares = this.processedData.reduce(function(sum, d) { return sum + d.squares; }, 0);
            var diff = 100 - totalSquares;
            if (diff !== 0 && this.processedData.length > 0) {
                this.processedData[0].squares += diff;
            }
        };
        
        WaffleChartEmbed.prototype.createSVG = function() {
            this.container.selectAll('*').remove();
            
            this.svg = this.container
                .append('svg')
                .attr('width', this.config.width)
                .attr('height', this.config.height);
                
            this.svg.append('rect')
                .attr('width', this.config.width)
                .attr('height', this.config.height)
                .attr('fill', this.config.backgroundColor);
        };
        
        WaffleChartEmbed.prototype.renderWaffle = function() {
            var self = this;
            var colorScale = d3.scaleOrdinal()
                .domain(this.processedData.map(function(d) { return d.categoria; }))
                .range(this.config.colors);
            
            // Gera array de quadrados
            var squares = [];
            var currentIndex = 0;
            
            this.processedData.forEach(function(category, categoryIndex) {
                for (var i = 0; i < category.squares; i++) {
                    squares.push({
                        index: currentIndex,
                        row: Math.floor(currentIndex / 10),
                        col: currentIndex % 10,
                        category: category.categoria,
                        percentage: category.percentage
                    });
                    currentIndex++;
                }
            });
            
            // Calcula posição do waffle
            var squareSize = this.waffleConfig.size || 25;
            var gap = this.waffleConfig.gap || 2;
            var waffleSize = (squareSize * 10) + (gap * 9);
            var startX = (this.config.width - waffleSize) / 2;
            var startY = 100;
            
            // Renderiza quadrados
            var waffleGroup = this.svg.append('g')
                .attr('transform', 'translate(' + startX + ',' + startY + ')');
            
            waffleGroup.selectAll('.waffle-square')
                .data(squares)
                .enter()
                .append('rect')
                .attr('class', 'waffle-square')
                .attr('x', function(d) { return d.col * (squareSize + gap); })
                .attr('y', function(d) { return d.row * (squareSize + gap); })
                .attr('width', squareSize)
                .attr('height', squareSize)
                .attr('rx', self.waffleConfig.roundness || 3)
                .attr('fill', function(d) { return colorScale(d.category); });
        };
        
        WaffleChartEmbed.prototype.renderTitles = function() {
            if (this.config.title) {
                this.svg.append('text')
                    .attr('class', 'chart-title-svg')
                    .attr('x', this.config.width / 2)
                    .attr('y', 40)
                    .attr('text-anchor', 'middle')
                    .style('fill', this.config.textColor)
                    .style('font-size', (this.config.titleSize || 24) + 'px')
                    .style('font-weight', 'bold')
                    .text(this.config.title);
            }
            
            if (this.config.subtitle) {
                this.svg.append('text')
                    .attr('class', 'chart-subtitle-svg')
                    .attr('x', this.config.width / 2)
                    .attr('y', 65)
                    .attr('text-anchor', 'middle')
                    .style('fill', this.config.textColor)
                    .style('font-size', (this.config.subtitleSize || 16) + 'px')
                    .style('opacity', 0.8)
                    .text(this.config.subtitle);
            }
        };
        
        WaffleChartEmbed.prototype.renderLegend = function() {
            if (!this.config.showLegend) return;
            
            var self = this;
            var colorScale = d3.scaleOrdinal()
                .domain(this.processedData.map(function(d) { return d.categoria; }))
                .range(this.config.colors);
            
            var legendX = this.config.directLabelPosition === 'right' ? 
                this.config.width - 150 : 50;
            var legendY = 150;
            
            var legend = this.svg.append('g')
                .attr('class', 'legend')
                .attr('transform', 'translate(' + legendX + ',' + legendY + ')');
            
            this.processedData.forEach(function(d, i) {
                var legendItem = legend.append('g')
                    .attr('transform', 'translate(0,' + (i * 30) + ')');
                
                legendItem.append('text')
                    .attr('text-anchor', self.config.directLabelPosition === 'right' ? 'start' : 'end')
                    .style('fill', colorScale(d.categoria))
                    .style('font-size', (self.config.labelSize || 12) + 'px')
                    .style('font-weight', '600')
                    .text(d.categoria);
                
                legendItem.append('text')
                    .attr('text-anchor', self.config.directLabelPosition === 'right' ? 'start' : 'end')
                    .attr('dy', '1.2em')
                    .style('fill', self.config.textColor)
                    .style('font-size', ((self.config.labelSize || 12) - 1) + 'px')
                    .style('opacity', 0.7)
                    .text(d.percentage + '%');
            });
        };
        
        WaffleChartEmbed.prototype.renderSource = function() {
            if (this.config.dataSource) {
                this.svg.append('text')
                    .attr('class', 'chart-source-svg')
                    .attr('x', this.config.width / 2)
                    .attr('y', this.config.height - 20)
                    .attr('text-anchor', 'middle')
                    .style('fill', this.config.textColor)
                    .style('font-size', '11px')
                    .style('opacity', 0.6)
                    .text('Fonte: ' + this.config.dataSource);
            }
        };`;
    }

    /**
     * Escapa HTML para prevenir XSS
     */
    function escapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // ==========================================================================
    // EXPORTAÇÃO SVG E PNG (MANTIDAS AS ORIGINAIS)
    // ==========================================================================

    function hasClipboardAPI() {
        return navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function';
    }

    function hasCanvasSupport() {
        try {
            var canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        } catch (e) {
            return false;
        }
    }

    function showNotification(message, type) {
        try {
            if (window.OddVizApp && typeof window.OddVizApp.showNotification === 'function') {
                window.OddVizApp.showNotification(message, type || 'info');
            } else {
                console.log('[OddViz] ' + message);
                if (typeof alert === 'function') {
                    alert(message);
                }
            }
        } catch (error) {
            console.error('Erro ao mostrar notificação:', error);
        }
    }

    function exportSVG() {
        try {
            var svgElement = getSVGElement();
            if (!svgElement) {
                throw new Error('Nenhuma visualização SVG encontrada');
            }
            
            var clonedSVG = svgElement.cloneNode(true);
            var processedSVG = processSVGForExport(clonedSVG);
            var svgString = serializeSVG(processedSVG);
            
            var blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            downloadFile(blob, generateFilename('svg'), 'image/svg+xml');
            
            showNotification('SVG exportado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao exportar SVG:', error);
            showNotification('Erro ao exportar SVG: ' + error.message, 'error');
        }
    }

    function exportPNG() {
        try {
            if (!hasCanvasSupport()) {
                throw new Error('Canvas não é suportado neste navegador');
            }

            var svgElement = getSVGElement();
            if (!svgElement) {
                throw new Error('Nenhuma visualização SVG encontrada');
            }
            
            convertSVGToPNG(svgElement)
                .then(function(blob) {
                    downloadFile(blob, generateFilename('png'), 'image/png');
                    showNotification('PNG exportado com sucesso!', 'success');
                })
                .catch(function(error) {
                    console.error('Erro ao converter SVG para PNG:', error);
                    showNotification('Erro ao exportar PNG: ' + error.message, 'error');
                });
                
        } catch (error) {
            console.error('Erro ao exportar PNG:', error);
            showNotification('Erro ao exportar PNG: ' + error.message, 'error');
        }
    }

    // ==========================================================================
    // CÓDIGO EMBED PRINCIPAL (CORRIGIDO)
    // ==========================================================================

    function generateEmbedCode() {
        try {
            var embedCode = generateStandaloneEmbedCode();
            return {
                standalone: embedCode,
                iframe: generateIframeEmbed(), // Mantém iframe como opção
                svg: generateSVGEmbed()
            };
        } catch (error) {
            console.error('Erro ao gerar código embed:', error);
            throw error;
        }
    }

    function copyEmbedCode() {
        try {
            var embedOptions = generateEmbedCode();
            var embedCode = embedOptions.standalone; // ✅ USA CÓDIGO STANDALONE
            
            if (hasClipboardAPI()) {
                navigator.clipboard.writeText(embedCode).then(function() {
                    showNotification('Código embed standalone copiado!', 'success');
                }).catch(function(error) {
                    console.error('Erro ao copiar:', error);
                    fallbackCopyEmbed(embedCode);
                });
            } else {
                fallbackCopyEmbed(embedCode);
            }
            
            showEmbedModal(embedCode);
            
        } catch (error) {
            console.error('Erro ao copiar código embed:', error);
            showNotification('Erro ao gerar embed: ' + error.message, 'error');
        }
    }

    // ==========================================================================
    // UTILITÁRIOS (MANTIDOS)
    // ==========================================================================

    function getSVGElement() {
        var selectors = [
            '#chart svg',
            '.chart-wrapper svg',
            '.viz-container svg',
            'svg'
        ];
        
        for (var i = 0; i < selectors.length; i++) {
            var element = document.querySelector(selectors[i]);
            if (element && element.tagName && element.tagName.toLowerCase() === 'svg') {
                return element;
            }
        }
        
        return null;
    }

    function generateFilename(extension) {
        var chartTitle = getChartTitle();
        var timestamp = new Date().toISOString().slice(0, 10);
        var sanitizedTitle = chartTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        return sanitizedTitle + '_' + timestamp + '.' + extension;
    }

    function getChartTitle() {
        var titleSelectors = [
            '#chart-title',
            '.chart-title',
            '#rendered-title',
            'h3.chart-title-rendered'
        ];
        
        for (var i = 0; i < titleSelectors.length; i++) {
            var element = document.querySelector(titleSelectors[i]);
            if (element && element.textContent && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }
        
        return 'grafico_waffle_oddviz';
    }

    function downloadFile(blob, filename, mimeType) {
        try {
            var url = URL.createObjectURL(blob);
            var link = document.createElement('a');
            
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(function() {
                URL.revokeObjectURL(url);
            }, 1000);
        } catch (error) {
            console.error('Erro ao fazer download:', error);
            showNotification('Erro ao fazer download do arquivo', 'error');
        }
    }

    // Funções auxiliares mantidas (serializeSVG, processSVGForExport, etc.)
    function serializeSVG(svgElement) {
        try {
            if (window.XMLSerializer) {
                var serializer = new XMLSerializer();
                return serializer.serializeToString(svgElement);
            } else {
                return svgElement.outerHTML || '<svg>Erro na serialização</svg>';
            }
        } catch (error) {
            console.error('Erro na serialização SVG:', error);
            return svgElement.outerHTML || '<svg>Erro na serialização</svg>';
        }
    }

    function processSVGForExport(svgElement) {
        try {
            if (!svgElement.getAttribute('width')) {
                svgElement.setAttribute('width', EXPORT_CONFIG.svg.defaultWidth);
            }
            if (!svgElement.getAttribute('height')) {
                svgElement.setAttribute('height', EXPORT_CONFIG.svg.defaultHeight);
            }
            
            svgElement.setAttribute('xmlns', EXPORT_CONFIG.svg.namespace);
            
            try {
                inlineStyles(svgElement);
            } catch (styleError) {
                console.warn('Não foi possível processar estilos:', styleError);
            }
            
            return svgElement;
        } catch (error) {
            console.error('Erro ao processar SVG:', error);
            return svgElement;
        }
    }

    function inlineStyles(svgElement) {
        try {
            var styleSheets = document.styleSheets;
            var allRules = '';
            
            for (var i = 0; i < styleSheets.length; i++) {
                try {
                    var styleSheet = styleSheets[i];
                    var rules = styleSheet.cssRules || styleSheet.rules;
                    
                    if (rules) {
                        for (var j = 0; j < rules.length; j++) {
                            var rule = rules[j];
                            if (rule.selectorText && isSVGRelevantRule(rule.selectorText)) {
                                allRules += rule.cssText + '\\n';
                            }
                        }
                    }
                } catch (e) {
                    console.warn('Não foi possível acessar regras CSS:', e.message);
                }
            }
            
            if (allRules) {
                var styleElement = document.createElementNS(EXPORT_CONFIG.svg.namespace, 'style');
                styleElement.textContent = allRules;
                svgElement.insertBefore(styleElement, svgElement.firstChild);
            }
        } catch (error) {
            console.warn('Erro ao processar estilos inline:', error);
        }
    }

    function isSVGRelevantRule(selector) {
        var svgSelectors = [
            'svg', 'g', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon',
            'text', 'tspan', '.waffle-square', '.direct-label-item', '.chart-title-svg'
        ];
        
        for (var i = 0; i < svgSelectors.length; i++) {
            if (selector.indexOf(svgSelectors[i]) !== -1) {
                return true;
            }
        }
        return false;
    }

    function convertSVGToPNG(svgElement) {
        return new Promise(function(resolve, reject) {
            try {
                var clonedSVG = svgElement.cloneNode(true);
                var processedSVG = processSVGForExport(clonedSVG);
                
                var width = parseInt(processedSVG.getAttribute('width')) || EXPORT_CONFIG.png.defaultWidth;
                var height = parseInt(processedSVG.getAttribute('height')) || EXPORT_CONFIG.png.defaultHeight;
                
                var svgString = serializeSVG(processedSVG);
                var svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                var url = URL.createObjectURL(svgBlob);
                
                var img = new Image();
                
                img.onload = function() {
                    try {
                        var canvas = document.createElement('canvas');
                        var ctx = canvas.getContext('2d');
                        
                        canvas.width = width;
                        canvas.height = height;
                        
                        ctx.fillStyle = EXPORT_CONFIG.png.backgroundColor;
                        ctx.fillRect(0, 0, width, height);
                        
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        if (canvas.toBlob) {
                            canvas.toBlob(resolve, 'image/png', EXPORT_CONFIG.png.quality);
                        } else {
                            var dataURL = canvas.toDataURL('image/png', EXPORT_CONFIG.png.quality);
                            resolve(dataURLtoBlob(dataURL));
                        }
                        
                        URL.revokeObjectURL(url);
                        
                    } catch (error) {
                        reject(error);
                    }
                };
                
                img.onerror = function() {
                    reject(new Error('Erro ao carregar imagem SVG'));
                };
                
                img.src = url;
                
            } catch (error) {
                reject(error);
            }
        });
    }

    function dataURLtoBlob(dataURL) {
        var arr = dataURL.split(',');
        var mime = arr[0].match(/:(.*?);/)[1];
        var bstr = atob(arr[1]);
        var n = bstr.length;
        var u8arr = new Uint8Array(n);
        
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new Blob([u8arr], { type: mime });
    }

    function generateIframeEmbed() {
        var currentURL = window.location.href;
        var width = getVisualizationWidth();
        var height = getVisualizationHeight();
        
        return '<iframe src="' + currentURL + '" width="' + width + '" height="' + height + '" frameborder="0" style="border: none; background: transparent;"></iframe>';
    }

    function generateSVGEmbed() {
        var svgElement = getSVGElement();
        if (svgElement) {
            var clonedSVG = svgElement.cloneNode(true);
            var processedSVG = processSVGForExport(clonedSVG);
            return serializeSVG(processedSVG);
        }
        return '';
    }

    function getVisualizationWidth() {
        var svgElement = getSVGElement();
        if (svgElement) {
            var width = svgElement.getAttribute('width');
            return parseInt(width) || EXPORT_CONFIG.svg.defaultWidth;
        }
        return EXPORT_CONFIG.svg.defaultWidth;
    }

    function getVisualizationHeight() {
        var svgElement = getSVGElement();
        if (svgElement) {
            var height = svgElement.getAttribute('height');
            return parseInt(height) || EXPORT_CONFIG.svg.defaultHeight;
        }
        return EXPORT_CONFIG.svg.defaultHeight;
    }

    function fallbackCopyEmbed(embedCode) {
        try {
            var textArea = document.createElement('textarea');
            textArea.value = embedCode;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            
            var successful = document.execCommand('copy');
            if (successful) {
                showNotification('Código embed copiado!', 'success');
            } else {
                showNotification('Selecione e copie o código manualmente', 'info');
            }
            
            document.body.removeChild(textArea);
        } catch (error) {
            console.error('Erro no fallback copy:', error);
            showNotification('Selecione e copie o código manualmente', 'info');
        }
    }

    function showEmbedModal(embedCode) {
        var modal = document.getElementById('embed-modal');
        var textarea = document.getElementById('embed-code');
        
        if (modal && textarea) {
            textarea.value = embedCode;
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
            
            setTimeout(function() {
                textarea.select();
            }, 100);
        }
    }

    // ==========================================================================
    // INICIALIZAÇÃO
    // ==========================================================================

    function initializeExportControls() {
        var exportSvgBtn = document.getElementById('export-svg');
        var exportPngBtn = document.getElementById('export-png');
        var copyEmbedBtn = document.getElementById('copy-embed');
        var modalCloseBtn = document.querySelector('.modal-close');
        var modalOverlay = document.querySelector('.modal-overlay');
        var modal = document.getElementById('embed-modal');
        var copyEmbedCodeBtn = document.getElementById('copy-embed-code');
        
        if (exportSvgBtn) {
            exportSvgBtn.addEventListener('click', exportSVG);
        }
        
        if (exportPngBtn) {
            exportPngBtn.addEventListener('click', exportPNG);
        }
        
        if (copyEmbedBtn) {
            copyEmbedBtn.addEventListener('click', copyEmbedCode);
        }
        
        if (modalCloseBtn && modal) {
            modalCloseBtn.addEventListener('click', function() {
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
            });
        }
        
        if (modalOverlay && modal) {
            modalOverlay.addEventListener('click', function() {
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
            });
        }
        
        if (copyEmbedCodeBtn) {
            copyEmbedCodeBtn.addEventListener('click', function() {
                var textarea = document.getElementById('embed-code');
                if (textarea) {
                    textarea.select();
                    try {
                        var successful = document.execCommand('copy');
                        if (successful) {
                            showNotification('Código copiado!', 'success');
                        }
                    } catch (error) {
                        console.error('Erro ao copiar:', error);
                    }
                }
            });
        }
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
            }
        });
    }

    // ==========================================================================
    // EXPORTAÇÕES GLOBAIS
    // ==========================================================================

    window.OddVizExport = {
        exportSVG: exportSVG,
        exportPNG: exportPNG,
        copyEmbedCode: copyEmbedCode,
        generateEmbedCode: generateEmbedCode,
        generateStandaloneEmbedCode: generateStandaloneEmbedCode,
        initializeExportControls: initializeExportControls,
        EXPORT_CONFIG: EXPORT_CONFIG
    };

    // Auto-inicialização
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeExportControls);
    } else {
        initializeExportControls();
    }

    console.log('Export Utils (FIXED) loaded successfully');

})();
