/**
 * ODDATAVIZ - Utilitários de Exportação
 * Funções para exportar visualizações em SVG, PNG e gerar código embed
 */

// ==========================================================================
// CONFIGURAÇÕES DE EXPORTAÇÃO
// ==========================================================================

const EXPORT_CONFIG = {
    // Configurações SVG
    svg: {
        xmlns: 'http://www.w3.org/2000/svg',
        xmlnsXlink: 'http://www.w3.org/1999/xlink',
        version: '1.1'
    },
    
    // Configurações PNG
    png: {
        quality: 1.0,
        backgroundColor: '#373737'
    },
    
    // Configurações do embed
    embed: {
        cdnBase: 'https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js',
        baseStyle: `
            * { box-sizing: border-box; }
            body { 
                margin: 0; 
                padding: 20px; 
                background: #373737; 
                color: #FAF9FA; 
                font-family: 'Inter', Arial, sans-serif;
                line-height: 1.6;
            }
            .chart-container { 
                max-width: 100%; 
                margin: 0 auto;
                background: #373737;
            }
            .chart-header {
                margin-bottom: 20px;
                text-align: left;
            }
            .chart-title {
                font-family: 'Newsreader', serif;
                font-style: italic;
                font-size: 24px;
                font-weight: 600;
                color: #FAF9FA;
                margin: 0 0 8px 0;
                line-height: 1.2;
            }
            .chart-subtitle {
                font-size: 16px;
                color: rgba(250, 249, 250, 0.8);
                margin: 0 0 16px 0;
                line-height: 1.4;
            }
            .chart-viz {
                width: 100%;
                overflow: hidden;
                margin-bottom: 16px;
            }
            .chart-source {
                font-size: 12px;
                color: rgba(250, 249, 250, 0.6);
                text-align: left;
                margin: 0;
                padding-top: 8px;
                border-top: 1px solid rgba(250, 249, 250, 0.1);
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                body { padding: 16px 12px; }
                .chart-title { font-size: 20px; }
                .chart-subtitle { font-size: 14px; }
                .chart-source { font-size: 11px; }
            }
            
            @media (max-width: 480px) {
                body { padding: 12px 8px; }
                .chart-title { font-size: 18px; }
                .chart-subtitle { font-size: 13px; }
            }
        `
    }
};

// ==========================================================================
// UTILITÁRIOS GERAIS
// ==========================================================================

/**
 * Sanitiza nome de arquivo
 */
function sanitizeFilename(filename) {
    return filename
        .replace(/[^a-z0-9]/gi, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .toLowerCase();
}

/**
 * Gera timestamp para nomes de arquivo
 */
function getTimestamp() {
    return new Date().toISOString().slice(0, 19).replace(/:/g, '-');
}

/**
 * Baixa arquivo via blob
 */
function downloadFile(content, filename, mimeType) {
    try {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        if (window.OddVizApp && window.OddVizApp.showNotification) {
            window.OddVizApp.showNotification(`Arquivo ${filename} baixado com sucesso!`, 'success');
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao baixar arquivo:', error);
        if (window.OddVizApp && window.OddVizApp.showNotification) {
            window.OddVizApp.showNotification('Erro ao baixar arquivo', 'error');
        }
        return false;
    }
}

// ==========================================================================
// EXPORTAÇÃO SVG
// ==========================================================================

/**
 * Exporta visualização como SVG
 */
function exportSVG(chartSelector = '#chart svg', options = {}) {
    try {
        const svg = document.querySelector(chartSelector);
        if (!svg) {
            throw new Error('SVG não encontrado');
        }
        
        // Clona o SVG para não modificar o original
        const clonedSvg = svg.cloneNode(true);
        
        // Configurações padrão
        const config = {
            filename: options.filename || `oddataviz_${getTimestamp()}.svg`,
            includeStyles: options.includeStyles !== false,
            title: options.title || '',
            description: options.description || '',
            ...options
        };
        
        // Configura atributos do SVG
        clonedSvg.setAttribute('xmlns', EXPORT_CONFIG.svg.xmlns);
        clonedSvg.setAttribute('xmlns:xlink', EXPORT_CONFIG.svg.xmlnsXlink);
        clonedSvg.setAttribute('version', EXPORT_CONFIG.svg.version);
        
        // Adiciona título e descrição para acessibilidade
        if (config.title) {
            const titleElement = document.createElementNS(EXPORT_CONFIG.svg.xmlns, 'title');
            titleElement.textContent = config.title;
            clonedSvg.insertBefore(titleElement, clonedSvg.firstChild);
        }
        
        if (config.description) {
            const descElement = document.createElementNS(EXPORT_CONFIG.svg.xmlns, 'desc');
            descElement.textContent = config.description;
            clonedSvg.insertBefore(descElement, clonedSvg.firstChild);
        }
        
        // Inclui estilos inline se solicitado
        if (config.includeStyles) {
            inlineStyles(clonedSvg);
        }
        
        // Gera o conteúdo do arquivo SVG
        const svgContent = getSVGString(clonedSvg);
        
        // Faz o download
        return downloadFile(
            svgContent,
            sanitizeFilename(config.filename),
            'image/svg+xml'
        );
        
    } catch (error) {
        console.error('Erro ao exportar SVG:', error);
        if (window.OddVizApp && window.OddVizApp.showNotification) {
            window.OddVizApp.showNotification('Erro ao exportar SVG', 'error');
        }
        return false;
    }
}

/**
 * Converte SVG element para string
 */
function getSVGString(svgElement) {
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgElement);
    
    // Adiciona declaração XML se não existir
    if (!svgString.startsWith('<?xml')) {
        svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
    }
    
    return svgString;
}

/**
 * Aplica estilos inline ao SVG
 */
function inlineStyles(svgElement) {
    const styleSheets = Array.from(document.styleSheets);
    const svgElements = svgElement.getElementsByTagName('*');
    
    // Aplica estilos computados aos elementos
    Array.from(svgElements).forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        const styleString = getRelevantStyles(computedStyle);
        
        if (styleString) {
            element.setAttribute('style', styleString);
        }
    });
}

/**
 * Extrai estilos relevantes do computedStyle
 */
function getRelevantStyles(computedStyle) {
    const relevantProps = [
        'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap',
        'font-family', 'font-size', 'font-weight', 'text-anchor', 'opacity',
        'transform', 'clip-path', 'mask'
    ];
    
    const styles = [];
    
    relevantProps.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && value !== 'none' && value !== 'normal') {
            styles.push(`${prop}: ${value}`);
        }
    });
    
    return styles.join('; ');
}

// ==========================================================================
// EXPORTAÇÃO PNG
// ==========================================================================

/**
 * Exporta visualização como PNG
 */
function exportPNG(chartSelector = '#chart svg', options = {}) {
    try {
        const svg = document.querySelector(chartSelector);
        if (!svg) {
            throw new Error('SVG não encontrado');
        }
        
        // Configurações padrão
        const config = {
            filename: options.filename || `oddataviz_${getTimestamp()}.png`,
            scale: options.scale || 2, // Para alta resolução
            backgroundColor: options.backgroundColor || EXPORT_CONFIG.png.backgroundColor,
            quality: options.quality || EXPORT_CONFIG.png.quality,
            ...options
        };
        
        // Obtém dimensões do SVG
        const rect = svg.getBoundingClientRect();
        const width = rect.width * config.scale;
        const height = rect.height * config.scale;
        
        // Cria canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        // Define background
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        // Converte SVG para imagem
        const svgString = getSVGString(svg.cloneNode(true));
        const img = new Image();
        
        img.onload = function() {
            // Desenha a imagem no canvas
            ctx.drawImage(img, 0, 0, width, height);
            
            // Converte para blob e faz download
            canvas.toBlob(function(blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                
                link.href = url;
                link.download = sanitizeFilename(config.filename);
                link.style.display = 'none';
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                URL.revokeObjectURL(url);
                
                if (window.OddVizApp && window.OddVizApp.showNotification) {
                    window.OddVizApp.showNotification(`PNG ${config.filename} baixado com sucesso!`, 'success');
                }
            }, 'image/png', config.quality);
        };
        
        img.onerror = function() {
            throw new Error('Erro ao carregar SVG como imagem');
        };
        
        // Carrega o SVG como data URL
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(svgBlob);
        img.src = url;
        
        return true;
        
    } catch (error) {
        console.error('Erro ao exportar PNG:', error);
        if (window.OddVizApp && window.OddVizApp.showNotification) {
            window.OddVizApp.showNotification('Erro ao exportar PNG', 'error');
        }
        return false;
    }
}

// ==========================================================================
// GERAÇÃO DE CÓDIGO EMBED
// ==========================================================================

/**
 * Gera código para embed
 */
function generateEmbedCode(chartSelector = '#chart svg', options = {}) {
    try {
        const svg = document.querySelector(chartSelector);
        if (!svg) {
            throw new Error('SVG não encontrado');
        }
        
        // Configurações padrão
        const config = {
            title: options.title || 'Visualização Odd Data',
            description: options.description || '',
            width: options.width || svg.getAttribute('width') || '800',
            height: options.height || svg.getAttribute('height') || '600',
            responsive: options.responsive !== false,
            includeData: options.includeData !== false,
            ...options
        };
        
        // Obtém dados se disponível
        let dataScript = '';
        if (config.includeData && window.chartData) {
            dataScript = `
        // Dados da visualização
        const data = ${JSON.stringify(window.chartData, null, 2)};`;
        }
        
        // Obtém o SVG limpo
        const clonedSvg = svg.cloneNode(true);
        const svgString = getSVGString(clonedSvg);
        
        // Gera o código HTML completo
        const embedCode = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${config.title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@1,400;1,600&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        ${EXPORT_CONFIG.embed.baseStyle}
        ${config.responsive ? `
        .chart-viz svg {
            width: 100%;
            height: auto;
            max-width: ${config.width}px;
        }` : `
        .chart-viz svg {
            width: ${config.width}px;
            height: ${config.height}px;
        }`}
        ${config.customCSS || ''}
    </style>
</head>
<body>
    <div class="chart-container">
        <div class="chart-header">
            ${config.title ? `<h1 class="chart-title">${config.title}</h1>` : ''}
            ${config.description ? `<p class="chart-subtitle">${config.description}</p>` : ''}
        </div>
        
        <div class="chart-viz">
            ${svgString}
        </div>
        
        ${config.dataSource ? `<p class="chart-source">Fonte: ${config.dataSource}</p>` : ''}
        ${!config.dataSource ? `<p class="chart-source">Criado com Odd Data Viz</p>` : ''}
    </div>
    
    <script src="${EXPORT_CONFIG.embed.cdnBase}"></script>
    <script>
        // Código gerado por Odd Data Viz
        // https://github.com/[seu-usuario]/oddataviz
        ${dataScript}
        
        // Ajusta responsividade
        function adjustChartSize() {
            const svg = document.querySelector('.chart-viz svg');
            if (svg && window.innerWidth < 768) {
                const container = document.querySelector('.chart-viz');
                const containerWidth = container.offsetWidth;
                svg.style.width = containerWidth + 'px';
                svg.style.height = 'auto';
            }
        }
        
        window.addEventListener('resize', adjustChartSize);
        document.addEventListener('DOMContentLoaded', adjustChartSize);
        
        ${config.customJS || ''}
        
        console.log('Visualização carregada com sucesso!');
    </script>
</body>
</html>`;
        
        return embedCode;
        
    } catch (error) {
        console.error('Erro ao gerar código embed:', error);
        return null;
    }
}

/**
 * Copia código embed para clipboard
 */
function copyEmbedCode(chartSelector = '#chart svg', options = {}) {
    try {
        const embedCode = generateEmbedCode(chartSelector, options);
        if (!embedCode) {
            throw new Error('Erro ao gerar código embed');
        }
        
        // Copia para clipboard
        navigator.clipboard.writeText(embedCode).then(() => {
            if (window.OddVizApp && window.OddVizApp.showNotification) {
                window.OddVizApp.showNotification('Código embed copiado para a área de transferência!', 'success');
            }
        }).catch(err => {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = embedCode;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (window.OddVizApp && window.OddVizApp.showNotification) {
                window.OddVizApp.showNotification('Código embed copiado!', 'success');
            }
        });
        
        return embedCode;
        
    } catch (error) {
        console.error('Erro ao copiar código embed:', error);
        if (window.OddVizApp && window.OddVizApp.showNotification) {
            window.OddVizApp.showNotification('Erro ao copiar código embed', 'error');
        }
        return false;
    }
}

// ==========================================================================
// INICIALIZAÇÃO DOS EVENT LISTENERS
// ==========================================================================

/**
 * Inicializa event listeners para botões de exportação
 */
function initializeExportListeners() {
    // Botão SVG
    const svgBtn = document.getElementById('export-svg');
    if (svgBtn) {
        svgBtn.addEventListener('click', () => {
            const title = document.getElementById('chart-title')?.value || 'Visualização';
            const subtitle = document.getElementById('chart-subtitle')?.value || '';
            
            exportSVG('#chart svg', {
                filename: `${sanitizeFilename(title)}.svg`,
                title: title,
                description: subtitle
            });
        });
    }
    
    // Botão PNG
    const pngBtn = document.getElementById('export-png');
    if (pngBtn) {
        pngBtn.addEventListener('click', () => {
            const title = document.getElementById('chart-title')?.value || 'Visualização';
            
            exportPNG('#chart svg', {
                filename: `${sanitizeFilename(title)}.png`
            });
        });
    }
    
    // Botão embed
    const embedBtn = document.getElementById('copy-embed');
    if (embedBtn) {
        embedBtn.addEventListener('click', () => {
            showEmbedModal();
        });
    }
    
    // Botão copiar código embed (dentro do modal)
    const copyEmbedBtn = document.getElementById('copy-embed-code');
    if (copyEmbedBtn) {
        copyEmbedBtn.addEventListener('click', () => {
            const textarea = document.getElementById('embed-code');
            if (textarea) {
                textarea.select();
                document.execCommand('copy');
                
                if (window.OddVizApp && window.OddVizApp.showNotification) {
                    window.OddVizApp.showNotification('Código copiado!', 'success');
                }
            }
        });
    }
}

/**
 * Mostra modal com código embed
 */
function showEmbedModal() {
    const title = document.getElementById('chart-title')?.value || 'Visualização Odd Data';
    const subtitle = document.getElementById('chart-subtitle')?.value || '';
    const dataSource = document.getElementById('data-source')?.value || '';
    
    const embedCode = generateEmbedCode('#chart svg', {
        title: title,
        description: subtitle,
        dataSource: dataSource
    });
    
    if (embedCode) {
        const modal = document.getElementById('embed-modal');
        const textarea = document.getElementById('embed-code');
        
        if (modal && textarea) {
            textarea.value = embedCode;
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
            
            // Event listeners do modal
            const closeBtn = modal.querySelector('.modal-close');
            const overlay = modal.querySelector('.modal-overlay');
            
            const closeModal = () => {
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
            };
            
            closeBtn?.addEventListener('click', closeModal);
            overlay?.addEventListener('click', closeModal);
            
            // Esc para fechar
            const handleEsc = (e) => {
                if (e.key === 'Escape') {
                    closeModal();
                    document.removeEventListener('keydown', handleEsc);
                }
            };
            
            document.addEventListener('keydown', handleEsc);
        }
    }
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

// Disponibiliza funções globalmente
window.OddVizExport = {
    exportSVG,
    exportPNG,
    generateEmbedCode,
    copyEmbedCode,
    initializeExportListeners,
    showEmbedModal
};

// Auto-inicialização quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeExportListeners);

console.log('Export Utils loaded successfully');
