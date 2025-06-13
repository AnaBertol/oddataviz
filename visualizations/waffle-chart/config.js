/**
 * CONFIGURAÇÕES DO GRÁFICO DE WAFFLE - SINCRONIZADO
 * Versão corrigida com configurações consistentes
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

const VIZ_CONFIG = {
    type: 'waffle-chart',
    name: 'Gráfico de Waffle',
    description: 'Visualização em grade 10x10 para mostrar proporções e distribuições',
    
    dataRequirements: {
        requiredColumns: ['categoria', 'valor'],
        columnTypes: {
            categoria: 'string',
            valor: 'number'
        },
        minRows: 2,
        maxRows: 10
    },
    
    specificControls: {
        waffleSize: { min: 12, max: 35, default: 25, step: 1 },
        waffleGap: { min: 0.5, max: 6, default: 2, step: 0.5 },
        waffleRoundness: { min: 0, max: 25, default: 3, step: 0.5 },
        waffleAnimation: { default: false },
        waffleHoverEffect: { default: true }
    },
    
    // ✅ SEMPRE formato quadrado - dimensões fixas
    layout: {
        fixedFormat: 'square',
        fixedWidth: 600,
        fixedHeight: 600,
        margins: { top: 50, right: 50, bottom: 70, left: 50 }
    },
    
    colorSettings: {
        defaultPalette: 'odd',
        supportedPalettes: ['odd', 'custom']
    }
};

// ==========================================================================
// DADOS DE EXEMPLO PADRONIZADOS
// ==========================================================================

function getSampleData() {
    return {
        data: [
            { categoria: 'Categoria A', valor: 35 },
            { categoria: 'Categoria B', valor: 25 },
            { categoria: 'Categoria C', valor: 20 },
            { categoria: 'Categoria D', valor: 15 },
            { categoria: 'Categoria E', valor: 5 }
        ],
        columns: ['categoria', 'valor'],
        columnTypes: { categoria: 'string', valor: 'number' },
        rowCount: 5,
        source: 'example'
    };
}

// ==========================================================================
// FUNÇÕES ESPECÍFICAS DA VISUALIZAÇÃO
// ==========================================================================

function getDataRequirements() {
    return VIZ_CONFIG.dataRequirements;
}

function onDataLoaded(processedData) {
    if (processedData.data && processedData.data.length > 10) {
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(
                'Muitas categorias! Recomendamos até 10 para melhor visualização.', 
                'warn'
            );
        }
    }
    
    if (window.WaffleVisualization?.onDataLoaded) {
        window.WaffleVisualization.onDataLoaded(processedData);
    }
}

function onControlsUpdate(state) {
    if (window.WaffleVisualization?.onUpdate) {
        window.WaffleVisualization.onUpdate(state);
    }
}

// ==========================================================================
// CONTROLES ESPECÍFICOS DO WAFFLE
// ==========================================================================

function onWaffleControlsUpdate() {
    const waffleControls = {
        size: parseInt(document.getElementById('waffle-size')?.value || VIZ_CONFIG.specificControls.waffleSize.default),
        gap: parseFloat(document.getElementById('waffle-gap')?.value || VIZ_CONFIG.specificControls.waffleGap.default),
        roundness: parseFloat(document.getElementById('waffle-roundness')?.value || VIZ_CONFIG.specificControls.waffleRoundness.default),
        animation: document.getElementById('waffle-animation')?.checked || VIZ_CONFIG.specificControls.waffleAnimation.default,
        hover_effect: document.getElementById('waffle-hover-effect')?.checked !== false
    };
    
    if (window.WaffleVisualization?.onWaffleControlUpdate) {
        window.WaffleVisualization.onWaffleControlUpdate(waffleControls);
    }
}

function onDirectLabelPositionChange(position) {
    if (window.WaffleVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        currentConfig.directLabelPosition = position;
        window.WaffleVisualization.onUpdate(currentConfig);
    }
}

function onShowLegendChange(show) {
    if (window.WaffleVisualization?.onUpdate) {
        const currentConfig = window.OddVizTemplateControls?.getState() || {};
        currentConfig.showLegend = show;
        window.WaffleVisualization.onUpdate(currentConfig);
    }
}

// ==========================================================================
// CONFIGURAÇÃO DE CONTROLES - CORRIGIDA
// ==========================================================================

function setupWaffleControls() {
    console.log('🎛️ Configurando controles do waffle...');
    
    // Controles de aparência do waffle
    const waffleControls = [
        'waffle-size',
        'waffle-gap', 
        'waffle-roundness',
        'waffle-animation',
        'waffle-hover-effect'
    ];
    
    waffleControls.forEach(controlId => {
        const element = document.getElementById(controlId);
        if (element) {
            const eventType = element.type === 'checkbox' ? 'change' : 'input';
            element.addEventListener(eventType, onWaffleControlsUpdate);
            
            // Atualiza display de valores para ranges
            if (element.type === 'range') {
                const valueDisplay = document.getElementById(controlId + '-value');
                if (valueDisplay) {
                    element.addEventListener('input', (e) => {
                        valueDisplay.textContent = e.target.value + 'px';
                    });
                }
            }
        }
    });
    
    // ✅ NOVO: Event listeners para paletas de cores
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const paletteType = e.currentTarget.dataset.palette;
            if (paletteType) {
                onColorPaletteChange(paletteType);
            }
        });
    });
    
    // Controle de posição da legenda direta
    const directLabelPositions = document.querySelectorAll('input[name="direct-label-position"]');
    directLabelPositions.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                onDirectLabelPositionChange(e.target.value);
            }
        });
    });
    
    // Controle para mostrar/ocultar rótulos
    const showLegendCheck = document.getElementById('show-legend');
    if (showLegendCheck) {
        showLegendCheck.addEventListener('change', (e) => {
            const legendOptions = document.getElementById('legend-options');
            
            // Mostra/oculta controles de posição
            if (legendOptions) {
                legendOptions.style.display = e.target.checked ? 'block' : 'none';
            }
            
            // Dispara atualização da visualização
            onShowLegendChange(e.target.checked);
        });
        
        // Dispara evento inicial para configurar estado
        showLegendCheck.dispatchEvent(new Event('change'));
    }
    
    console.log('✅ Controles do waffle configurados');
}

// ==========================================================================
// SISTEMA DE PALETA DE CORES - CORRIGIDO
// ==========================================================================

function onColorPaletteChange(paletteType) {
    console.log('🎨 Mudando paleta para:', paletteType);
    
    // Atualiza classes ativas
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
    });
    
    const selectedOption = document.querySelector(`.color-option[data-palette="${paletteType}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
        console.log('✅ Botão marcado como ativo');
    } else {
        console.log('❌ Botão não encontrado para paleta:', paletteType);
    }
    
    // Controla visibilidade do painel custom
    const customColorsPanel = document.getElementById('custom-colors');
    if (customColorsPanel) {
        if (paletteType === 'custom') {
            customColorsPanel.style.display = 'block';
            setupCustomColorInputs();
            console.log('✅ Painel custom exibido');
        } else {
            customColorsPanel.style.display = 'none';
            console.log('✅ Painel custom ocultado');
        }
    }
    
    // ✅ CORRIGIDO: Chama função correta
    console.log('🔄 Chamando updateColorPalette...');
    if (window.WaffleVisualization?.updateColorPalette) {
        window.WaffleVisualization.updateColorPalette(paletteType);
    } else {
        console.log('❌ window.WaffleVisualization.updateColorPalette não encontrada');
    }
}

function setupCustomColorInputs() {
    const container = document.querySelector('.custom-color-inputs');
    if (!container) return;
    
    // Limpa inputs existentes
    container.innerHTML = '';
    
    // ✅ NOVO: Detecta número de categorias dos dados atuais
    let numberOfCategories = 6; // Padrão
    
    if (window.WaffleVisualization?.getCurrentDataLength) {
        numberOfCategories = window.WaffleVisualization.getCurrentDataLength();
    } else if (window.getSampleData) {
        // Fallback: usa dados de exemplo para detectar
        const sampleData = window.getSampleData();
        if (sampleData?.data) {
            numberOfCategories = sampleData.data.length;
        }
    }
    
    console.log('🎨 Criando', numberOfCategories, 'inputs de cor personalizadas');
    
    // Cores base (Odd como padrão inicial)
    const baseColors = ['#6F02FD', '#6CDADE', '#3570DF', '#EDFF19', '#FFA4E8', '#2C0165'];
    
    // Gera cores extras se necessário (tons diferentes das cores base)
    const allColors = [];
    for (let i = 0; i < numberOfCategories; i++) {
        if (i < baseColors.length) {
            allColors.push(baseColors[i]);
        } else {
            // Gera variações das cores base para as categorias extras
            const baseIndex = i % baseColors.length;
            const variation = Math.floor(i / baseColors.length);
            allColors.push(generateColorVariation(baseColors[baseIndex], variation));
        }
    }
    
    // Cria inputs dinamicamente
    allColors.forEach((color, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-color-item';
        
        wrapper.innerHTML = `
            <label class="control-label">Cor ${index + 1}</label>
            <div class="color-input-wrapper">
                <input type="color" id="custom-color-${index}" class="color-input custom-color-picker" value="${color}">
                <input type="text" id="custom-color-${index}-text" class="color-text custom-color-text" value="${color}">
            </div>
        `;
        
        container.appendChild(wrapper);
        
        // Event listeners para sincronizar cor e texto
        const colorInput = wrapper.querySelector('.custom-color-picker');
        const textInput = wrapper.querySelector('.custom-color-text');
        
        colorInput.addEventListener('input', (e) => {
            textInput.value = e.target.value;
            updateCustomColors();
        });
        
        textInput.addEventListener('input', (e) => {
            if (e.target.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                colorInput.value = e.target.value;
                updateCustomColors();
            }
        });
    });
    
    // Mostra informação para o usuário
    if (numberOfCategories > 6) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'color-info';
        infoDiv.innerHTML = `
            <p style="font-size: 0.875rem; color: var(--color-accent); margin-top: var(--spacing-sm);">
                ℹ️ Detectadas ${numberOfCategories} categorias. Você pode personalizar todas as cores.
            </p>
        `;
        container.appendChild(infoDiv);
    }
    
    // Aplica cores iniciais
    updateCustomColors();
}

// ✅ NOVA FUNÇÃO: Gera variações de cor
function generateColorVariation(baseColor, variation) {
    // Converte hex para HSL, ajusta luminosidade/saturação, volta para hex
    const rgb = hexToRgb(baseColor);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Varia luminosidade e saturação para criar versões distintas
    let newL = hsl[2] + (variation * 0.15); // Varia luminosidade
    let newS = hsl[1] - (variation * 0.1);  // Varia saturação
    
    // Garante que ficam dentro dos limites
    newL = Math.max(0.2, Math.min(0.8, newL));
    newS = Math.max(0.3, Math.min(1, newS));
    
    const newRgb = hslToRgb(hsl[0], newS, newL);
    return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
}

// Funções auxiliares de conversão de cor
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
}

function hslToRgb(h, s, l) {
    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function updateCustomColors() {
    const colors = [];
    document.querySelectorAll('.custom-color-picker').forEach(input => {
        colors.push(input.value);
    });
    
    console.log('🎨 Cores customizadas atualizadas:', colors);
    
    if (window.WaffleVisualization?.updateCustomColors) {
        window.WaffleVisualization.updateCustomColors(colors);
    }
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

window.WaffleVizConfig = {
    config: VIZ_CONFIG,
    getSampleData,
    getDataRequirements,
    onDataLoaded,
    onControlsUpdate,
    onWaffleControlsUpdate,
    onDirectLabelPositionChange,
    onShowLegendChange,
    onColorPaletteChange,
    setupWaffleControls
};

// Expõe funções principais globalmente
window.getSampleData = getSampleData;
window.getDataRequirements = getDataRequirements;
window.onDataLoaded = onDataLoaded;

// ==========================================================================
// CONFIGURAÇÃO INICIAL - APRIMORADA
// ==========================================================================

function initializeWaffleConfig() {
    console.log('⚙️ Inicializando configuração do waffle...');
    
    // Aguarda um pouco para garantir que DOM está pronto
    setTimeout(() => {
        setupWaffleControls();
        console.log('✅ Configuração do waffle concluída');
    }, 100);
}

// Auto-inicialização
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWaffleConfig);
} else {
    initializeWaffleConfig();
}
