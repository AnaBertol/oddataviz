/**
 * ODDATAVIZ - Utilitários de Exportação
 * Funções para exportar visualizações em SVG, PNG e código embed
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
            backgroundColor: '#373737'
        },
        
        // Configurações de embed
        embed: {
            template: 'iframe',
            responsive: true,
            includeStyles: true
        }
    };

    // ==========================================================================
    // UTILITÁRIOS DE COMPATIBILIDADE
    // ==========================================================================

    /**
     * Verifica se navigator.clipboard está disponível
     */
    function hasClipboardAPI() {
        return navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function';
    }

    /**
     * Verifica se Canvas é suportado
     */
    function hasCanvasSupport() {
        try {
            var canvas = document.createElement('canvas');
            return !!(canvas.getContext && canvas.getContext('2d'));
        } catch (e) {
            return false;
        }
    }

    /**
     * Mostra notificação segura
     */
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

    // ==========================================================================
    // EXPORTAÇÃO SVG
    // ==========================================================================

    /**
     * Exporta visualização como SVG
     */
    function exportSVG() {
        try {
            var svgElement = getSVGElement();
            if (!svgElement) {
                throw new Error('Nenhuma visualização SVG encontrada');
            }
            
            // Clona o SVG para não afetar o original
            var clonedSVG = svgElement.cloneNode(true);
            
            // Processa o SVG para exportação
            var processedSVG = processSVGForExport(clonedSVG);
            
            // Serializa o SVG
            var svgString = serializeSVG(processedSVG);
            
            // Cria o blob e faz download
            var blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            downloadFile(blob, generateFilename('svg'), 'image/svg+xml');
            
            showNotification('SVG exportado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao exportar SVG:', error);
            showNotification('Erro ao exportar SVG: ' + error.message, 'error');
        }
    }

    /**
     * Serializa SVG de forma compatível
     */
    function serializeSVG(svgElement) {
        try {
            if (window.XMLSerializer) {
                var serializer = new XMLSerializer();
                return serializer.serializeToString(svgElement);
            } else {
                // Fallback para browsers antigos
                return svgElement.outerHTML || '<svg>Erro na serialização</svg>';
            }
        } catch (error) {
            console.error('Erro na serialização SVG:', error);
            return svgElement.outerHTML || '<svg>Erro na serialização</svg>';
        }
    }

    /**
     * Processa SVG para exportação
     */
    function processSVGForExport(svgElement) {
        try {
            // Define dimensões se não existirem
            if (!svgElement.getAttribute('width')) {
                svgElement.setAttribute('width', EXPORT_CONFIG.svg.defaultWidth);
            }
            if (!svgElement.getAttribute('height')) {
                svgElement.setAttribute('height', EXPORT_CONFIG.svg.defaultHeight);
            }
            
            // Define namespace
            svgElement.setAttribute('xmlns', EXPORT_CONFIG.svg.namespace);
            
            // Adiciona estilos inline de forma segura
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

    /**
     * Adiciona estilos CSS inline ao SVG
     */
    function inlineStyles(svgElement) {
        try {
            var styleSheets = document.styleSheets;
            var allRules = '';
            
            // Coleta regras CSS relevantes
            for (var i = 0; i < styleSheets.length; i++) {
                try {
                    var styleSheet = styleSheets[i];
                    var rules = styleSheet.cssRules || styleSheet.rules;
                    
                    if (rules) {
                        for (var j = 0; j < rules.length; j++) {
                            var rule = rules[j];
                            if (rule.selectorText && isSVGRelevantRule(rule.selectorText)) {
                                allRules += rule.cssText + '\n';
                            }
                        }
                    }
                } catch (e) {
                    // Ignora erros de CORS ou acesso negado
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

    /**
     * Verifica se a regra CSS é relevante para SVG
     */
    function isSVGRelevantRule(selector) {
        var svgSelectors = [
            'svg', 'g', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon',
            'text', 'tspan', '.axis', '.bar', '.line', '.dot', '.legend'
        ];
        
        for (var i = 0; i < svgSelectors.length; i++) {
            if (selector.indexOf(svgSelectors[i]) !== -1) {
                return true;
            }
        }
        return false;
    }

    // ==========================================================================
    // EXPORTAÇÃO PNG
    // ==========================================================================

    /**
     * Exporta visualização como PNG
     */
    function exportPNG() {
        try {
            if (!hasCanvasSupport()) {
                throw new Error('Canvas não é suportado neste navegador');
            }

            var svgElement = getSVGElement();
            if (!svgElement) {
                throw new Error('Nenhuma visualização SVG encontrada');
            }
            
            // Converte SVG para PNG usando canvas
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

    /**
     * Converte SVG para PNG usando canvas
     */
    function convertSVGToPNG(svgElement) {
        return new Promise(function(resolve, reject) {
            try {
                // Clona e processa o SVG
                var clonedSVG = svgElement.cloneNode(true);
                var processedSVG = processSVGForExport(clonedSVG);
                
                // Obtém dimensões
                var width = parseInt(processedSVG.getAttribute('width')) || EXPORT_CONFIG.png.defaultWidth;
                var height = parseInt(processedSVG.getAttribute('height')) || EXPORT_CONFIG.png.defaultHeight;
                
                // Serializa SVG
                var svgString = serializeSVG(processedSVG);
                var svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                var url = URL.createObjectURL(svgBlob);
                
                // Cria imagem
                var img = new Image();
                
                img.onload = function() {
                    try {
                        // Cria canvas
                        var canvas = document.createElement('canvas');
                        var ctx = canvas.getContext('2d');
                        
                        canvas.width = width;
                        canvas.height = height;
                        
                        // Preenche fundo
                        ctx.fillStyle = EXPORT_CONFIG.png.backgroundColor;
                        ctx.fillRect(0, 0, width, height);
                        
                        // Desenha SVG
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Converte para blob
                        if (canvas.toBlob) {
                            canvas.toBlob(resolve, 'image/png', EXPORT_CONFIG.png.quality);
                        } else {
                            // Fallback para browsers antigos
                            var dataURL = canvas.toDataURL('image/png', EXPORT_CONFIG.png.quality);
                            resolve(dataURLtoBlob(dataURL));
                        }
                        
                        // Limpa URL
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

    /**
     * Converte dataURL para Blob (fallback)
     */
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

    // ==========================================================================
    // CÓDIGO EMBED
    // ==========================================================================

    /**
     * Gera código embed para a visualização
     */
    function generateEmbedCode() {
        try {
            var svgElement = getSVGElement();
            if (!svgElement) {
                throw new Error('Nenhuma visualização encontrada');
            }
            
            // Gera diferentes tipos de embed
            var embedOptions = {
                iframe: generateIframeEmbed(),
                svg: generateSVGEmbed(svgElement),
                div: generateDivEmbed(svgElement)
            };
            
            return embedOptions;
            
        } catch (error) {
            console.error('Erro ao gerar código embed:', error);
            throw error;
        }
    }

    /**
     * Gera embed via iframe
     */
    function generateIframeEmbed() {
        var currentURL = window.location.href;
        var width = getVisualizationWidth();
        var height = getVisualizationHeight();
        
        return '<iframe src="' + currentURL + '" width="' + width + '" height="' + height + '" frameborder="0" style="border: none; background: transparent;"></iframe>';
    }

    /**
     * Gera embed SVG inline
     */
    function generateSVGEmbed(svgElement) {
        var clonedSVG = svgElement.cloneNode(true);
        var processedSVG = processSVGForExport(clonedSVG);
        
        return serializeSVG(processedSVG);
    }

    /**
     * Gera embed com div container
     */
    function generateDivEmbed(svgElement) {
        var svgCode = generateSVGEmbed(svgElement);
        var width = getVisualizationWidth();
        var height = getVisualizationHeight();
        
        return '<div class="oddviz-embed" style="width: ' + width + 'px; height: ' + height + 'px; max-width: 100%;">\n    ' + svgCode + '\n</div>';
    }

    /**
     * Copia código embed para o clipboard
     */
    function copyEmbedCode() {
        try {
            var embedOptions = generateEmbedCode();
            var embedCode = embedOptions.iframe; // Usa iframe como padrão
            
            // Copia para clipboard
            if (hasClipboardAPI()) {
                navigator.clipboard.writeText(embedCode).then(function() {
                    showNotification('Código embed copiado!', 'success');
                }).catch(function(error) {
                    console.error('Erro ao copiar:', error);
                    fallbackCopyEmbed(embedCode);
                });
            } else {
                fallbackCopyEmbed(embedCode);
            }
            
            // Mostra modal com o código
            showEmbedModal(embedCode);
            
        } catch (error) {
            console.error('Erro ao copiar código embed:', error);
            showNotification('Erro ao gerar embed: ' + error.message, 'error');
        }
    }

    /**
     * Fallback para copiar embed code
     */
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

    /**
     * Mostra modal com código embed
     */
    function showEmbedModal(embedCode) {
        var modal = document.getElementById('embed-modal');
        var textarea = document.getElementById('embed-code');
        
        if (modal && textarea) {
            textarea.value = embedCode;
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
            
            // Foca no textarea
            setTimeout(function() {
                textarea.select();
            }, 100);
        }
    }

    // ==========================================================================
    // UTILITÁRIOS
    // ==========================================================================

    /**
     * Obtém elemento SVG da visualização
     */
    function getSVGElement() {
        // Tenta diferentes seletores
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

    /**
     * Obtém largura da visualização
     */
    function getVisualizationWidth() {
        var svgElement = getSVGElement();
        if (svgElement) {
            var width = svgElement.getAttribute('width');
            return parseInt(width) || EXPORT_CONFIG.svg.defaultWidth;
        }
        return EXPORT_CONFIG.svg.defaultWidth;
    }

    /**
     * Obtém altura da visualização
     */
    function getVisualizationHeight() {
        var svgElement = getSVGElement();
        if (svgElement) {
            var height = svgElement.getAttribute('height');
            return parseInt(height) || EXPORT_CONFIG.svg.defaultHeight;
        }
        return EXPORT_CONFIG.svg.defaultHeight;
    }

    /**
     * Gera nome de arquivo para export
     */
    function generateFilename(extension) {
        var chartTitle = getChartTitle();
        var timestamp = new Date().toISOString().slice(0, 10);
        var sanitizedTitle = chartTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        return sanitizedTitle + '_' + timestamp + '.' + extension;
    }

    /**
     * Obtém título do gráfico
     */
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
        
        // Usa título da página como fallback
        var vizType = window.OddVizApp && typeof window.OddVizApp.getCurrentVisualizationType === 'function' 
            ? window.OddVizApp.getCurrentVisualizationType() 
            : null;
            
        if (vizType && window.OddVizApp && typeof window.OddVizApp.getVisualizationName === 'function') {
            return window.OddVizApp.getVisualizationName(vizType);
        }
        
        return 'grafico_oddviz';
    }

    /**
     * Faz download de arquivo
     */
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
            
            // Limpa URL após um tempo
            setTimeout(function() {
                URL.revokeObjectURL(url);
            }, 1000);
        } catch (error) {
            console.error('Erro ao fazer download:', error);
            showNotification('Erro ao fazer download do arquivo', 'error');
        }
    }

    // ==========================================================================
    // INICIALIZAÇÃO
    // ==========================================================================

    /**
     * Inicializa event listeners para exportação
     */
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
        
        // Modal controls
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
        
        // Escape key para fechar modal
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
        initializeExportControls: initializeExportControls,
        EXPORT_CONFIG: EXPORT_CONFIG
    };

    // Auto-inicialização
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeExportControls);
    } else {
        initializeExportControls();
    }

    console.log('Export Utils loaded successfully');

})();
