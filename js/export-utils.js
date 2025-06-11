/**
 * ODDATAVIZ - Utilitários de Exportação
 * Funções para exportar visualizações em SVG, PNG e código embed
 */

// ==========================================================================
// CONFIGURAÇÕES DE EXPORTAÇÃO
// ==========================================================================

const EXPORT_CONFIG = {
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
// EXPORTAÇÃO SVG
// ==========================================================================

/**
 * Exporta visualização como SVG
 */
function exportSVG() {
    try {
        const svgElement = getSVGElement();
        if (!svgElement) {
            throw new Error('Nenhuma visualização SVG encontrada');
        }
        
        // Clona o SVG para não afetar o original
        const clonedSVG = svgElement.cloneNode(true);
        
        // Processa o SVG para exportação
        const processedSVG = processSVGForExport(clonedSVG);
        
        // Serializa o SVG
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(processedSVG);
        
        // Cria o blob e faz download
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        downloadFile(blob, generateFilename('svg'), 'image/svg+xml');
        
        if (window.OddVizApp && window.OddVizApp.showNotification) {
            window.OddVizApp.showNotification('SVG exportado com sucesso!', 'success');
        }
        
    } catch (error) {
        console.error('Erro ao exportar SVG:', error);
        if (window.OddVizApp && window.OddVizApp.showNotification) {
            window.OddVizApp.showNotification(`Erro ao exportar SVG: ${error.message}`, 'error');
        }
    }
}

/**
 * Processa SVG para exportação
 */
function processSVGForExport(svgElement) {
    // Define dimensões se não existirem
    if (!svgElement.getAttribute('width')) {
        svgElement.setAttribute('width', EXPORT_CONFIG.svg.defaultWidth);
    }
    if (!svgElement.getAttribute('height')) {
        svgElement.setAttribute('height', EXPORT_CONFIG.svg.defaultHeight);
    }
    
    // Define namespace
    svgElement.setAttribute('xmlns', EXPORT_CONFIG.svg.namespace);
    
    // Adiciona estilos inline
    inlineStyles(svgElement);
    
    // Remove atributos desnecessários
    removeUnnecessaryAttributes(svgElement);
    
    return svgElement;
}

/**
 * Adiciona estilos CSS inline ao SVG
 */
function inlineStyles(svgElement) {
    const styleSheets = document.styleSheets;
    let allRules = '';
    
    // Coleta regras CSS relevantes
    for (let i = 0; i < styleSheets.length; i++) {
        try {
            const rules = styleSheets[i].cssRules || styleSheets[i].rules;
            for (let j = 0; j < rules.length; j++) {
                const rule = rules[j];
                if (rule.selectorText && isSVGRelevantRule(rule.selectorText)) {
                    allRules += rule.cssText + '\n';
                }
            }
        } catch (e) {
            // Ignora erros de CORS
            console.warn('Não foi possível acessar regras CSS:', e.message);
        }
    }
    
    if (allRules) {
        const styleElement = document.createElementNS(EXPORT_CONFIG.svg.namespace, 'style');
        styleElement.textContent = allRules;
        svgElement.insertBefore(styleElement, svgElement.firstChild);
    }
}

/**
 * Verifica se a regra CSS é relevante para SVG
 */
function isSVGRelevantRule(selector) {
    const svgSelectors = [
        'svg', 'g', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon',
        'text', 'tspan', '.axis', '.bar', '.line', '.dot', '.legend'
    ];
    
    return svgSelectors.some(sel => selector.includes(sel));
}

/**
 * Remove atributos desnecessários do SVG
 */
function removeUnnecessaryAttributes(svgElement) {
    const unnecessaryAttrs = ['class', 'id'];
    const allElements = svgElement.querySelectorAll('*');
    
    allElements.forEach(element => {
        unnecessaryAttrs.forEach(attr => {
            if (element.hasAttribute(attr)) {
                element.removeAttribute(attr);
            }
        });
    });
}

// ==========================================================================
// EXPORTAÇÃO PNG
// ==========================================================================

/**
 * Exporta visualização como PNG
 */
function exportPNG() {
    try {
        const svgElement = getSVGElement();
        if (!svgElement) {
            throw new Error('Nenhuma visualização SVG encontrada');
        }
        
        // Converte SVG para PNG usando canvas
        convertSVGToPNG(svgElement)
            .then(blob => {
                downloadFile(blob, generateFilename('png'), 'image/png');
                
                if (window.OddVizApp && window.OddVizApp.showNotification) {
                    window.OddVizApp.showNotification('PNG exportado com sucesso!', 'success');
                }
            })
            .catch(error => {
                console.error('Erro ao converter SVG para PNG:', error);
                if (window.OddVizApp && window.OddVizApp.showNotification) {
                    window.OddVizApp.showNotification(`Erro ao exportar PNG: ${error.message}`, 'error');
                }
            });
            
    } catch (error) {
        console.error('Erro ao exportar PNG:', error);
        if (window.OddVizApp && window.OddVizApp.showNotification) {
            window.OddVizApp.showNotification(`Erro ao exportar PNG: ${error.message}`, 'error');
        }
    }
}

/**
 * Converte SVG para PNG usando canvas
 */
function convertSVGToPNG(svgElement) {
    return new Promise((resolve, reject) => {
        try {
            // Clona e processa o SVG
            const clonedSVG = svgElement.cloneNode(true);
            const processedSVG = processSVGForExport(clonedSVG);
            
            // Obtém dimensões
            const width = parseInt(processedSVG.getAttribute('width')) || EXPORT_CONFIG.png.defaultWidth;
            const height = parseInt(processedSVG.getAttribute('height')) || EXPORT_CONFIG.png.defaultHeight;
            
            // Serializa SVG
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(processedSVG);
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            
            // Cria imagem
            const img = new Image();
            img.onload = function() {
                try {
                    // Cria canvas
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    // Preenche fundo
                    ctx.fillStyle = EXPORT_CONFIG.png.backgroundColor;
                    ctx.fillRect(0, 0, width, height);
                    
                    // Desenha SVG
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Converte para blob
                    canvas.toBlob(resolve, 'image/png', EXPORT_CONFIG.png.quality);
                    
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

// ==========================================================================
// CÓDIGO EMBED
// ==========================================================================

/**
 * Gera código embed para a visualização
 */
function generateEmbedCode() {
    try {
        const svgElement = getSVGElement();
        if (!svgElement) {
            throw new Error('Nenhuma visualização encontrada');
        }
        
        // Gera diferentes tipos de embed
        const embedOptions = {
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
    const currentURL = window.location.href;
    const width = getVisualizationWidth();
    const height = getVisualizationHeight();
    
    return `<iframe src="${currentURL}" 
        width="${width}" 
        height="${height}" 
        frameborder="0" 
        style="border: none; background: transparent;">
    </iframe>`;
}

/**
 * Gera embed SVG inline
 */
function generateSVGEmbed(svgElement) {
    const clonedSVG = svgElement.cloneNode(true);
    const processedSVG = processSVGForExport(clonedSVG);
    
    const serializer = new XMLSerializer();
    return serializer.serializeToString(processedSVG);
}

/**
 * Gera embed com div container
 */
function generateDivEmbed(svgElement) {
    const svgCode = generateSVGEmbed(svgElement);
    const width = getVisualizationWidth();
    const height = getVisualizationHeight();
    
    return `<div class="oddviz-embed" style="width: ${width}px; height: ${height}px; max-width: 100%;">
    ${svgCode}
</div>`;
}

/**
 * Copia código embed para o clipboard
 */
function copyEmbedCode() {
    try {
        const embedOptions = generateEmbedCode();
        const embedCode = embedOptions.iframe; // Usa iframe como padrão
        
        // Copia para clipboard
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(embedCode).then(() => {
                if (window.OddVizApp && window.OddVizApp.showNotification) {
                    window.OddVizApp.showNotification('Código embed copiado!', 'success');
                }
            }).catch(error => {
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
        if (window.OddVizApp && window.OddVizApp.showNotification) {
            window.OddVizApp.showNotification(`Erro ao gerar embed: ${error.message}`, 'error');
        }
    }
}

/**
 * Fallback para copiar embed code
 */
function fallbackCopyEmbed(embedCode) {
    const textArea = document.createElement('textarea');
    textArea.value = embedCode;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        if (window.OddVizApp && window.OddVizApp.showNotification) {
            window.OddVizApp.showNotification('Código embed copiado!', 'success');
        }
    } catch (error) {
        console.error('Erro no fallback copy:', error);
        if (window.OddVizApp && window.OddVizApp.showNotification) {
            window.OddVizApp.showNotification('Erro ao copiar código', 'error');
        }
    } finally {
        document.body.removeChild(textArea);
    }
}

/**
 * Mostra modal com código embed
 */
function showEmbedModal(embedCode) {
    const modal = document.getElementById('embed-modal');
    const textarea = document.getElementById('embed-code');
    const copyBtn = document.getElementById('copy-embed-code');
    
    if (modal && textarea) {
        textarea.value = embedCode;
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        
        // Foca no textarea
        setTimeout(() => textarea.select(), 100);
        
        // Event listener para botão de copiar
        if (copyBtn) {
            copyBtn.onclick = function() {
                textarea.select();
                try {
                    document.execCommand('copy');
                    if (window.OddVizApp && window.OddVizApp.showNotification) {
                        window.OddVizApp.showNotification('Código copiado!', 'success');
                    }
                } catch (error) {
                    console.error('Erro ao copiar:', error);
                }
            };
        }
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
    const selectors = [
        '#chart svg',
        '.chart-wrapper svg',
        '.viz-container svg',
        'svg'
    ];
    
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.tagName.toLowerCase() === 'svg') {
            return element;
        }
    }
    
    return null;
}

/**
 * Obtém largura da visualização
 */
function getVisualizationWidth() {
    const svgElement = getSVGElement();
    if (svgElement) {
        return parseInt(svgElement.getAttribute('width')) || EXPORT_CONFIG.svg.defaultWidth;
    }
    return EXPORT_CONFIG.svg.defaultWidth;
}

/**
 * Obtém altura da visualização
 */
function getVisualizationHeight() {
    const svgElement = getSVGElement();
    if (svgElement) {
        return parseInt(svgElement.getAttribute('height')) || EXPORT_CONFIG.svg.defaultHeight;
    }
    return EXPORT_CONFIG.svg.defaultHeight;
}

/**
 * Gera nome de arquivo para export
 */
function generateFilename(extension) {
    const chartTitle = getChartTitle();
    const timestamp = new Date().toISOString().slice(0, 10);
    const sanitizedTitle = chartTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    
    return `${sanitizedTitle}_${timestamp}.${extension}`;
}

/**
 * Obtém título do gráfico
 */
function getChartTitle() {
    const titleSelectors = [
        '#chart-title',
        '.chart-title',
        '#rendered-title',
        'h3.chart-title-rendered'
    ];
    
    for (const selector of titleSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
            return element.textContent.trim();
        }
    }
    
    // Usa título da página como fallback
    const vizType = window.OddVizApp ? window.OddVizApp.getCurrentVisualizationType() : null;
    if (vizType) {
        return window.OddVizApp.getVisualizationName(vizType);
    }
    
    return 'grafico_oddviz';
}

/**
 * Faz download de arquivo
 */
function downloadFile(blob, filename, mimeType) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpa URL após um tempo
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ==========================================================================
// INICIALIZAÇÃO
// ==========================================================================

/**
 * Inicializa event listeners para exportação
 */
function initializeExportControls() {
    const exportSvgBtn = document.getElementById('export-svg');
    const exportPngBtn = document.getElementById('export-png');
    const copyEmbedBtn = document.getElementById('copy-embed');
    const modalCloseBtn = document.querySelector('.modal-close');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modal = document.getElementById('embed-modal');
    
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
        modalCloseBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
        });
    }
    
    if (modalOverlay && modal) {
        modalOverlay.addEventListener('click', () => {
            modal.classList.remove('show');
            modal.setAttribute('aria-hidden', 'true');
        });
    }
    
    // Escape key para fechar modal
    document.addEventListener('keydown', (e) => {
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
    exportSVG,
    exportPNG,
    copyEmbedCode,
    generateEmbedCode,
    initializeExportControls,
    EXPORT_CONFIG
};

// Auto-inicialização
document.addEventListener('DOMContentLoaded', initializeExportControls);

console.log('Export Utils loaded successfully');
