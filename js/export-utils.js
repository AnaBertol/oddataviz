/**
 * ODDATAVIZ - SISTEMA DE EXPORTAÇÃO ESCALÁVEL
 * Funciona automaticamente com QUALQUER visualização - presente ou futura
 * Não precisa ser modificado ao adicionar novas visualizações
 */

(function() {
    'use strict';

    // ==========================================================================
    // REGISTRO AUTOMÁTICO DE VISUALIZAÇÕES
    // ==========================================================================

    const VISUALIZATION_REGISTRY = {};

    /**
     * Sistema de auto-registro para visualizações
     * Cada visualização se registra automaticamente quando carrega
     */
    function registerVisualization(config) {
        const vizType = config.type;
        VISUALIZATION_REGISTRY[vizType] = {
            ...config,
            registeredAt: new Date().toISOString()
        };
        
        console.log(`📋 Visualização registrada: ${vizType}`, config);
    }

    /**
     * Detecta automaticamente a visualização atual
     * Usa múltiplos métodos para máxima confiabilidade
     */
    function detectCurrentVisualization() {
        // Método 1: URL path
        const path = window.location.pathname;
        const pathMatch = path.match(/\/visualizations\/([^\/]+)\//);
        if (pathMatch) {
            const vizType = pathMatch[1];
            if (VISUALIZATION_REGISTRY[vizType]) {
                return VISUALIZATION_REGISTRY[vizType];
            }
        }

        // Método 2: Objeto global mais recente
        const globalVizObjects = Object.keys(window).filter(key => 
            key.endsWith('Visualization') && 
            typeof window[key] === 'object' && 
            window[key].vizCurrentData
        );
        
        if (globalVizObjects.length > 0) {
            // Procura correspondência no registry
            for (const objName of globalVizObjects) {
                for (const [type, config] of Object.entries(VISUALIZATION_REGISTRY)) {
                    if (objName.toLowerCase().includes(type.replace('-', ''))) {
                        return config;
                    }
                }
            }
        }

        // Método 3: Controles DOM únicos
        for (const [type, config] of Object.entries(VISUALIZATION_REGISTRY)) {
            if (config.uniqueSelectors) {
                for (const selector of config.uniqueSelectors) {
                    if (document.querySelector(selector)) {
                        return config;
                    }
                }
            }
        }

        // Método 4: Meta tag (se implementado)
        const metaVizType = document.querySelector('meta[name="viz-type"]');
        if (metaVizType) {
            const vizType = metaVizType.getAttribute('content');
            if (VISUALIZATION_REGISTRY[vizType]) {
                return VISUALIZATION_REGISTRY[vizType];
            }
        }

        throw new Error('Nenhuma visualização detectada. Registry: ' + Object.keys(VISUALIZATION_REGISTRY).join(', '));
    }

    // ==========================================================================
    // CAPTURA UNIVERSAL DE DADOS E CONFIGURAÇÕES
    // ==========================================================================

    /**
     * Captura dados de qualquer visualização usando estratégias universais
     */
    function captureVisualizationData(vizConfig) {
        const strategies = [
            // Estratégia 1: Objeto global específico
            () => {
                const globalObj = window[vizConfig.globalObject];
                if (globalObj && globalObj.vizCurrentData) {
                    return globalObj.vizCurrentData;
                }
                return null;
            },

            // Estratégia 2: Função getSampleData
            () => {
                if (window.getSampleData && typeof window.getSampleData === 'function') {
                    const sample = window.getSampleData();
                    return sample.data || sample;
                }
                return null;
            },

            // Estratégia 3: Textarea com parsing automático
            () => {
                const textarea = document.getElementById('data-text-input');
                if (textarea && textarea.value.trim()) {
                    return parseCSVGeneric(textarea.value, vizConfig.dataFormat);
                }
                return null;
            },

            // Estratégia 4: Dados padrão específicos
            () => {
                return vizConfig.defaultData || null;
            }
        ];

        for (const strategy of strategies) {
            try {
                const data = strategy();
                if (data && Array.isArray(data) && data.length > 0) {
                    console.log('✅ Dados capturados com sucesso:', data.length + ' itens');
                    return data;
                }
            } catch (error) {
                console.warn('Estratégia de captura falhou:', error.message);
            }
        }

        throw new Error('Não foi possível capturar dados da visualização');
    }

    /**
     * Captura configurações usando sistema universal
     */
    function captureVisualizationConfig(vizConfig) {
        const config = {};

        // Configurações universais (presentes em todas as visualizações)
        const universalMappings = {
            width: { selector: '#chart-width', defaultValue: vizConfig.defaultWidth || 800, type: 'number' },
            height: { selector: '#chart-height', defaultValue: vizConfig.defaultHeight || 600, type: 'number' },
            title: { selector: '#chart-title', defaultValue: vizConfig.defaultTitle || '', type: 'string' },
            subtitle: { selector: '#chart-subtitle', defaultValue: '', type: 'string' },
            dataSource: { selector: '#data-source', defaultValue: '', type: 'string' },
            backgroundColor: { selector: '#bg-color', defaultValue: '#FFFFFF', type: 'string' },
            textColor: { selector: '#text-color', defaultValue: '#2C3E50', type: 'string' },
            fontFamily: { selector: '#font-family', defaultValue: 'Inter', type: 'string' },
            titleSize: { selector: '#title-size', defaultValue: 24, type: 'number' },
            subtitleSize: { selector: '#subtitle-size', defaultValue: 16, type: 'number' },
            labelSize: { selector: '#label-size', defaultValue: 12, type: 'number' }
        };

        // Captura configurações universais
        for (const [key, mapping] of Object.entries(universalMappings)) {
            config[key] = getElementValue(mapping.selector, mapping.defaultValue, mapping.type);
        }

        // Captura configurações específicas da visualização
        if (vizConfig.specificMappings) {
            for (const [key, mapping] of Object.entries(vizConfig.specificMappings)) {
                config[key] = getElementValue(mapping.selector, mapping.defaultValue, mapping.type);
            }
        }

        // Captura cores (sistema flexível)
        config.colors = captureColors(vizConfig);

        console.log('⚙️ Configurações capturadas:', Object.keys(config).length + ' propriedades');
        return config;
    }

    /**
     * Sistema flexível de captura de cores
     */
    function captureColors(vizConfig) {
        // Estratégia 1: Cores específicas da visualização
        if (vizConfig.colorStrategy === 'categories') {
            const colors = [];
            let index = 1;
            while (true) {
                const colorInput = document.getElementById(`category-${index}-color`);
                if (!colorInput) break;
                colors.push(colorInput.value);
                index++;
            }
            if (colors.length > 0) return colors;
        }

        // Estratégia 2: Paleta ativa
        const activeOption = document.querySelector('.color-option.active');
        if (activeOption) {
            const palette = activeOption.dataset.palette;
            if (palette === 'odd') {
                return ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'];
            } else if (palette === 'rainbow') {
                return ['#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#0080FF', '#8000FF'];
            } else if (palette === 'custom') {
                const customColors = [];
                document.querySelectorAll('.custom-color-picker').forEach(input => {
                    customColors.push(input.value);
                });
                if (customColors.length > 0) return customColors;
            }
        }

        // Estratégia 3: Cores padrão da visualização
        return vizConfig.defaultColors || ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'];
    }

    // ==========================================================================
    // GERAÇÃO DINÂMICA DE CÓDIGO EMBED
    // ==========================================================================

    /**
     * Gera código HTML standalone dinamicamente
     */
    function generateDynamicEmbedCode() {
        try {
            const vizConfig = detectCurrentVisualization();
            const data = captureVisualizationData(vizConfig);
            const config = captureVisualizationConfig(vizConfig);

            const htmlTemplate = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(config.title || vizConfig.displayName)}</title>
    <meta name="viz-type" content="${vizConfig.type}">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
    <style>
        ${getUniversalCSS()}
    </style>
</head>
<body>
    <div class="viz-container">
        <div class="viz-header">
            ${config.title ? `<h1 class="viz-title">${escapeHtml(config.title)}</h1>` : ''}
            ${config.subtitle ? `<p class="viz-subtitle">${escapeHtml(config.subtitle)}</p>` : ''}
        </div>
        <div class="chart-container">
            <div id="chart"></div>
        </div>
        ${config.dataSource ? `<div class="viz-footer">Fonte: ${escapeHtml(config.dataSource)} | Criado com <a href="https://odd.studio" target="_blank">Odd Data Viz</a></div>` : ''}
    </div>
    
    <script>
        // Dados e configuração
        const EMBED_DATA = ${JSON.stringify(data)};
        const EMBED_CONFIG = ${JSON.stringify(config)};
        const VIZ_TYPE = '${vizConfig.type}';
        
        ${getUniversalJS()}
        
        // JavaScript específico da visualização
        ${vizConfig.embedJS}
        
        // Inicialização
        function initVisualization() {
            if (typeof d3 !== 'undefined') {
                try {
                    const viz = new UniversalVisualizationEmbed('chart', EMBED_DATA, EMBED_CONFIG, VIZ_TYPE);
                    viz.render();
                    console.log('✅ Visualização embed renderizada:', VIZ_TYPE);
                } catch (error) {
                    console.error('❌ Erro ao renderizar:', error);
                    document.getElementById('chart').innerHTML = 
                        '<div class="error-message"><h3>Erro ao carregar</h3><p>' + error.message + '</p></div>';
                }
            } else {
                setTimeout(initVisualization, 100);
            }
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initVisualization);
        } else {
            initVisualization();
        }
    </script>
</body>
</html>`;

            return htmlTemplate;

        } catch (error) {
            console.error('Erro ao gerar embed dinâmico:', error);
            throw error;
        }
    }

    // ==========================================================================
    // CSS E JS UNIVERSAIS
    // ==========================================================================

    function getUniversalCSS() {
        return `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            background: #f8f9fa;
            color: #2c3e50;
            min-height: 100vh;
            padding: 20px;
        }
        
        .viz-container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .viz-header { text-align: center; margin-bottom: 32px; }
        .viz-title { font-size: 1.8rem; font-weight: 600; color: #2c3e50; margin-bottom: 8px; }
        .viz-subtitle { font-size: 1rem; opacity: 0.7; margin-bottom: 16px; }
        
        .chart-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 32px 0;
            min-height: 400px;
        }
        
        #chart { width: 100%; display: flex; justify-content: center; align-items: center; }
        svg { max-width: 100%; height: auto; display: block; }
        
        .viz-footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 0.875rem;
            opacity: 0.7;
        }
        
        .viz-footer a { color: #6CDADE; text-decoration: none; }
        .viz-footer a:hover { text-decoration: underline; }
        
        .viz-tooltip {
            position: absolute;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 10px 12px;
            border-radius: 6px;
            font-size: 12px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 1000;
        }
        
        .error-message {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        
        @media (max-width: 768px) {
            body { padding: 10px; }
            .viz-container { padding: 20px; }
            .viz-title { font-size: 1.5rem; }
        }`;
    }

    function getUniversalJS() {
        return `
        // Classe base universal para todas as visualizações
        class UniversalVisualizationEmbed {
            constructor(containerId, data, config, vizType) {
                this.container = d3.select('#' + containerId);
                this.data = data;
                this.config = config;
                this.vizType = vizType;
                this.svg = null;
            }
            
            render() {
                this.createBaseSVG();
                this.renderTitles();
                this.renderVisualization();
                this.renderSource();
            }
            
            createBaseSVG() {
                this.container.selectAll('*').remove();
                
                this.svg = this.container
                    .append('svg')
                    .attr('width', this.config.width)
                    .attr('height', this.config.height)
                    .style('background', this.config.backgroundColor);
            }
            
            renderTitles() {
                if (this.config.title) {
                    this.svg.append('text')
                        .attr('x', this.config.width / 2)
                        .attr('y', 40)
                        .attr('text-anchor', 'middle')
                        .style('fill', this.config.textColor)
                        .style('font-size', this.config.titleSize + 'px')
                        .style('font-weight', 'bold')
                        .text(this.config.title);
                }
                
                if (this.config.subtitle) {
                    this.svg.append('text')
                        .attr('x', this.config.width / 2)
                        .attr('y', 65)
                        .attr('text-anchor', 'middle')
                        .style('fill', this.config.textColor)
                        .style('font-size', this.config.subtitleSize + 'px')
                        .style('opacity', 0.8)
                        .text(this.config.subtitle);
                }
            }
            
            renderSource() {
                if (this.config.dataSource) {
                    this.svg.append('text')
                        .attr('x', this.config.width / 2)
                        .attr('y', this.config.height - 20)
                        .attr('text-anchor', 'middle')
                        .style('fill', this.config.textColor)
                        .style('font-size', '11px')
                        .style('opacity', 0.6)
                        .text('Fonte: ' + this.config.dataSource);
                }
            }
            
            renderVisualization() {
                // Será implementado por cada visualização específica
                console.log('Renderizando', this.vizType, 'com', this.data.length, 'itens');
            }
            
            showTooltip(event, content) {
                const tooltip = d3.select('body')
                    .append('div')
                    .attr('class', 'viz-tooltip')
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px')
                    .html(content);
                
                tooltip.transition().duration(200).style('opacity', 1);
            }
            
            hideTooltip() {
                d3.selectAll('.viz-tooltip').remove();
            }
        }`;
    }

    // ==========================================================================
    // UTILITÁRIOS
    // ==========================================================================

    function getElementValue(selector, defaultValue, type = 'string') {
        const element = document.querySelector(selector);
        if (!element) return defaultValue;

        let value;
        if (element.type === 'checkbox') {
            value = element.checked;
        } else if (element.type === 'radio') {
            const checked = document.querySelector(selector + ':checked');
            value = checked ? checked.value : defaultValue;
        } else {
            value = element.value;
        }

        // Conversão de tipo
        switch (type) {
            case 'number':
                return parseFloat(value) || defaultValue;
            case 'boolean':
                return Boolean(value);
            default:
                return value || defaultValue;
        }
    }

    function parseCSVGeneric(csvString, format) {
        const lines = csvString.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            
            headers.forEach((header, index) => {
                if (values[index] !== undefined) {
                    // Tenta converter para número se possível
                    const numValue = parseFloat(values[index]);
                    row[header] = isNaN(numValue) ? values[index] : numValue;
                }
            });
            
            if (Object.keys(row).length > 0) {
                data.push(row);
            }
        }
        
        return data;
    }

    function escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // ==========================================================================
    // FUNÇÕES DE EXPORTAÇÃO PRINCIPAIS
    // ==========================================================================

    function exportSVG() {
        try {
            const svgElement = getSVGElement();
            if (!svgElement) {
                throw new Error('Nenhuma visualização SVG encontrada');
            }
            
            const clonedSVG = svgElement.cloneNode(true);
            const processedSVG = processSVGForExport(clonedSVG);
            const svgString = serializeSVG(processedSVG);
            
            const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            downloadFile(blob, generateFilename('svg'), 'image/svg+xml');
            
            showNotification('SVG exportado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao exportar SVG:', error);
            showNotification('Erro ao exportar SVG: ' + error.message, 'error');
        }
    }

    function exportPNG() {
        try {
            const svgElement = getSVGElement();
            if (!svgElement) {
                throw new Error('Nenhuma visualização SVG encontrada');
            }
            
            convertSVGToPNG(svgElement)
                .then(blob => {
                    downloadFile(blob, generateFilename('png'), 'image/png');
                    showNotification('PNG exportado com sucesso!', 'success');
                })
                .catch(error => {
                    console.error('Erro ao converter SVG para PNG:', error);
                    showNotification('Erro ao exportar PNG: ' + error.message, 'error');
                });
                
        } catch (error) {
            console.error('Erro ao exportar PNG:', error);
            showNotification('Erro ao exportar PNG: ' + error.message, 'error');
        }
    }

    function copyEmbedCode() {
        try {
            const embedCode = generateDynamicEmbedCode();
            
            if (hasClipboardAPI()) {
                navigator.clipboard.writeText(embedCode).then(() => {
                    showNotification('Código embed copiado!', 'success');
                }).catch(error => {
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
    // FUNÇÕES DE SUPORTE (MANTIDAS DO ORIGINAL)
    // ==========================================================================

    function hasClipboardAPI() {
        return navigator && navigator.clipboard && typeof navigator.clipboard.writeText === 'function';
    }

    function showNotification(message, type) {
        try {
            if (window.OddVizApp && typeof window.OddVizApp.showNotification === 'function') {
                window.OddVizApp.showNotification(message, type || 'info');
            } else {
                console.log('[OddViz] ' + message);
                alert(message);
            }
        } catch (error) {
            console.error('Erro ao mostrar notificação:', error);
        }
    }

    function getSVGElement() {
        const selectors = ['#chart svg', '.chart-wrapper svg', '.viz-container svg', 'svg'];
        
        for (let i = 0; i < selectors.length; i++) {
            const element = document.querySelector(selectors[i]);
            if (element && element.tagName && element.tagName.toLowerCase() === 'svg') {
                return element;
            }
        }
        return null;
    }

    function generateFilename(extension) {
        try {
            const vizConfig = detectCurrentVisualization();
            const config = captureVisualizationConfig(vizConfig);
            const title = config.title || vizConfig.displayName || 'visualizacao';
            const timestamp = new Date().toISOString().slice(0, 10);
            const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            
            return `${sanitizedTitle}_${timestamp}.${extension}`;
        } catch (error) {
            console.warn('Erro ao gerar nome do arquivo:', error);
            return `oddviz_export_${new Date().getTime()}.${extension}`;
        }
    }

    function downloadFile(blob, filename, mimeType) {
        try {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error('Erro ao fazer download:', error);
            showNotification('Erro ao fazer download do arquivo', 'error');
        }
    }

    function serializeSVG(svgElement) {
        try {
            if (window.XMLSerializer) {
                const serializer = new XMLSerializer();
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
                svgElement.setAttribute('width', '800');
            }
            if (!svgElement.getAttribute('height')) {
                svgElement.setAttribute('height', '600');
            }
            
            svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            return svgElement;
        } catch (error) {
            console.error('Erro ao processar SVG:', error);
            return svgElement;
        }
    }

    function convertSVGToPNG(svgElement) {
        return new Promise((resolve, reject) => {
            try {
                const clonedSVG = svgElement.cloneNode(true);
                const processedSVG = processSVGForExport(clonedSVG);
                
                const width = parseInt(processedSVG.getAttribute('width')) || 800;
                const height = parseInt(processedSVG.getAttribute('height')) || 600;
                
                const svgString = serializeSVG(processedSVG);
                const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);
                
                const img = new Image();
                
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        canvas.width = width;
                        canvas.height = height;
                        
                        ctx.fillStyle = '#FFFFFF';
                        ctx.fillRect(0, 0, width, height);
                        
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        if (canvas.toBlob) {
                            canvas.toBlob(resolve, 'image/png', 0.95);
                        } else {
                            const dataURL = canvas.toDataURL('image/png', 0.95);
                            resolve(dataURLtoBlob(dataURL));
                        }
                        
                        URL.revokeObjectURL(url);
                        
                    } catch (error) {
                        reject(error);
                    }
                };
                
                img.onerror = () => reject(new Error('Erro ao carregar imagem SVG'));
                img.src = url;
                
            } catch (error) {
                reject(error);
            }
        });
    }

    function dataURLtoBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        const n = bstr.length;
        const u8arr = new Uint8Array(n);
        
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        return new Blob([u8arr], { type: mime });
    }

    function fallbackCopyEmbed(embedCode) {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = embedCode;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            
            const successful = document.execCommand('copy');
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
        const modal = document.getElementById('embed-modal');
        const textarea = document.getElementById('embed-code');
        
        if (modal && textarea) {
            textarea.value = embedCode;
            modal.classList.add('show');
            modal.setAttribute('aria-hidden', 'false');
            
            setTimeout(() => textarea.select(), 100);
        }
    }

    // ==========================================================================
    // INICIALIZAÇÃO
    // ==========================================================================

    function initializeExportControls() {
        const exportSvgBtn = document.getElementById('export-svg');
        const exportPngBtn = document.getElementById('export-png');
        const copyEmbedBtn = document.getElementById('copy-embed');
        const modalCloseBtn = document.querySelector('.modal-close');
        const modalOverlay = document.querySelector('.modal-overlay');
        const modal = document.getElementById('embed-modal');
        const copyEmbedCodeBtn = document.getElementById('copy-embed-code');
        
        if (exportSvgBtn) exportSvgBtn.addEventListener('click', exportSVG);
        if (exportPngBtn) exportPngBtn.addEventListener('click', exportPNG);
        if (copyEmbedBtn) copyEmbedBtn.addEventListener('click', copyEmbedCode);
        
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
        
        if (copyEmbedCodeBtn) {
            copyEmbedCodeBtn.addEventListener('click', () => {
                const textarea = document.getElementById('embed-code');
                if (textarea) {
                    textarea.select();
                    try {
                        const successful = document.execCommand('copy');
                        if (successful) {
                            showNotification('Código copiado!', 'success');
                        }
                    } catch (error) {
                        console.error('Erro ao copiar:', error);
                    }
                }
            });
        }
        
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
                modal.classList.remove('show');
                modal.setAttribute('aria-hidden', 'true');
            }
        });

        console.log('🚀 Sistema de exportação escalável inicializado');
        console.log('📋 Visualizações registradas:', Object.keys(VISUALIZATION_REGISTRY));
    }

    // ==========================================================================
    // EXPORTAÇÕES GLOBAIS
    // ==========================================================================

    window.OddVizExport = {
        // Funções principais
        exportSVG: exportSVG,
        exportPNG: exportPNG,
        copyEmbedCode: copyEmbedCode,
        
        // Sistema de registro
        registerVisualization: registerVisualization,
        detectCurrentVisualization: detectCurrentVisualization,
        
        // Utilitários
        generateDynamicEmbedCode: generateDynamicEmbedCode,
        initializeExportControls: initializeExportControls,
        
        // Registry para debug
        getRegistry: () => VISUALIZATION_REGISTRY
    };

    // Auto-inicialização
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeExportControls);
    } else {
        initializeExportControls();
    }

    console.log('🚀 Sistema de exportação escalável carregado');

})();
