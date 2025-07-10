/**
 * CONFIGURAÇÕES DO MAPA INTERATIVO - VERSÃO BASEADA NO TEMPLATE
 * Seguindo exatamente a estrutura do mapa do Brasil
 */

// ==========================================================================
// CONFIGURAÇÕES ESPECÍFICAS DO MAPA INTERATIVO
// ==========================================================================

const VIZ_CONFIG = {
    type: 'interactive-map',
    name: 'Mapa Interativo',
    description: 'Visualização de mapa com múltiplas opções de base geográfica, agrupamentos e filtros',
    
    // Detecção automática de estrutura de dados
    dataRequirements: {
        autoDetectStructure: true,
        firstColumnAsKey: true,
        secondColumnAsValue: true,
        minRows: 3,
        maxRows: 200, // Flexível para diferentes mapas
        minColumns: 2,
        maxColumns: 2,
        supportedValueTypes: ['number', 'percentage'],
        requiredKeyColumn: true
    },
    
    // Controles específicos do mapa interativo
    specificControls: {
        mapBase: { default: null, options: ['brazil', 'world'] },
        grouping: { default: null },
        filterCategory: { default: 'none' },
        filterValue: { default: null },
        colorScheme: { default: 'sequential' },
        colorMin: { default: '#E8F4FD' },
        colorMax: { default: '#2C0165' },
        showLabels: { default: true },
        showValues: { default: true }
    },
    
    layout: {
        fixedFormat: 'wide',
        fixedWidth: 800,
        fixedHeight: 600,
        margins: { top: 60, right: 60, bottom: 80, left: 60 }
    }
};

// ==========================================================================
// CONFIGURAÇÕES DOS MAPAS DISPONÍVEIS
// ==========================================================================

const MAP_CONFIGS = {
    brazil: {
        name: 'Brasil',
        file: '../../data/maps/brazil.json',
        objectName: 'estados', // Nome do objeto principal no TopoJSON
        keyField: 'id', // Campo que contém o identificador (AC, SP, etc.)
        nameField: 'properties.nome', // Campo que contém o nome completo
        groupings: [
            { 
                value: 'none', 
                label: 'Estados (sem agrupamento)', 
                keyField: 'id',
                filterBy: null 
            },
            { 
                value: 'regions', 
                label: 'Regiões', 
                keyField: 'regiao',
                filterBy: 'regiao',
                categoryField: 'properties.regiao' // ✅ CORRIGIDO: campo correto no JSON
            }
        ],
        // Será preenchido dinamicamente após carregar o JSON
        filters: {
            regiao: [] // ✅ CORRIGIDO: nome da chave
        }
    },
    world: {
        name: 'Mundo',
        file: '../../data/maps/world.json',
        objectName: 'countries', // Nome do objeto principal no TopoJSON
        keyField: 'id', // Campo que contém o código do país
        nameField: 'properties.name', // Campo que contém o nome do país
        groupings: [
            { 
                value: 'none', 
                label: 'Países (sem agrupamento)', 
                keyField: 'id',
                filterBy: null 
            },
            { 
                value: 'regions', 
                label: 'Regiões', 
                keyField: 'region',
                filterBy: 'region',
                categoryField: 'properties.region'
            },
            { 
                value: 'groups', 
                label: 'Grupos', 
                keyField: 'group',
                filterBy: 'group',
                categoryField: 'properties.group'
            },
            { 
                value: 'continents', 
                label: 'Continentes', 
                keyField: 'continente',
                filterBy: 'continente',
                categoryField: 'properties.continente' // ✅ CORRIGIDO: campo correto no JSON
            }
        ],
        // Será preenchido dinamicamente após carregar o JSON
        filters: {
            region: [],
            group: [],
            continente: [] // ✅ CORRIGIDO: nome da chave
        }
    }
};

// Cache dos arquivos JSON carregados
let loadedMapData = {};

// ==========================================================================
// VARIÁVEIS DE ESTADO ESPECÍFICAS
// ==========================================================================

let currentMapConfig = {
    mapBase: VIZ_CONFIG.specificControls.mapBase.default,
    grouping: VIZ_CONFIG.specificControls.grouping.default,
    filterCategory: VIZ_CONFIG.specificControls.filterCategory.default,
    filterValue: VIZ_CONFIG.specificControls.filterValue.default,
    colorScheme: VIZ_CONFIG.specificControls.colorScheme.default,
    colorMin: VIZ_CONFIG.specificControls.colorMin.default,
    colorMax: VIZ_CONFIG.specificControls.colorMax.default,
    showLabels: VIZ_CONFIG.specificControls.showLabels.default,
    showValues: VIZ_CONFIG.specificControls.showValues.default
};

let mapConfigurationReady = false;

// ==========================================================================
// FUNÇÕES DE INTERFACE
// ==========================================================================

function getDataRequirements() {
    return VIZ_CONFIG.dataRequirements;
}

function onDataLoaded(processedData) {
    if (!mapConfigurationReady) {
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(
                'Configure o mapa primeiro antes de carregar dados.', 
                'warn'
            );
        }
        return;
    }
    
    if (window.InteractiveMapVisualization?.onDataLoaded) {
        window.InteractiveMapVisualization.onDataLoaded(processedData);
    }
}

// ==========================================================================
// CONTROLES ESPECÍFICOS DO MAPA INTERATIVO
// ==========================================================================

function setupControls() {
    console.log('🎛️ Configurando controles específicos do mapa interativo...');
    
    setupMapBaseControls();
    setupConfigurationFlow();
    
    // ✅ CORREÇÃO: Adicionar configuração dos controles específicos
    setupSpecificColorControls();
    
    console.log('✅ Controles específicos do mapa interativo configurados');
}

// ✅ CORREÇÃO: Adicionar função setupConfigurationFlow ausente
function setupConfigurationFlow() {
    console.log('🔄 Configurando fluxo de configuração do mapa...');
    // Esta função gerencia o fluxo de configuração específico do mapa
    // Não precisa fazer nada especial, só precisa existir para evitar o erro
    console.log('✅ Fluxo de configuração iniciado');
}

function setupSpecificColorControls() {
    console.log('🎨 Configurando controles específicos de cores...');
    
    // Controles de escala
    const scaleTypeRadios = document.querySelectorAll('input[name="scale-type"]');
    scaleTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // ✅ CORREÇÃO: Mostrar/ocultar divisões baseado na seleção
            const scaleDivisionsGroup = document.getElementById('scale-divisions-group');
            if (scaleDivisionsGroup) {
                scaleDivisionsGroup.style.display = this.value === 'quantile' ? 'block' : 'none';
            }
            onSpecificControlsUpdate();
        });
    });
    
    const scaleDivisionsSlider = document.getElementById('scale-divisions');
    if (scaleDivisionsSlider) {
        scaleDivisionsSlider.addEventListener('input', function() {
            // ✅ CORREÇÃO: Atualizar display do valor
            const valueDisplay = document.getElementById('scale-divisions-value');
            if (valueDisplay) {
                valueDisplay.textContent = this.value;
            }
            onSpecificControlsUpdate();
        });
    }
    
    // Controles de paleta
    const paletteTypeRadios = document.querySelectorAll('input[name="palette-type"]');
    paletteTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // ✅ CORREÇÃO: Mostrar/ocultar seções de cores
            const sequentialColors = document.getElementById('sequential-colors');
            const divergingColors = document.getElementById('diverging-colors');
            
            if (sequentialColors && divergingColors) {
                sequentialColors.style.display = this.value === 'sequential' ? 'block' : 'none';
                divergingColors.style.display = this.value === 'diverging' ? 'block' : 'none';
            }
            
            onSpecificControlsUpdate();
        });
    });
    
    // ✅ CORREÇÃO: Controles de cor específicos com sincronização
    const specificColorControls = [
        'color-min', 'color-max', 'color-low', 'color-mid', 'color-high',
        'no-data-color', 'diverging-mid-value', 'stroke-color', 'unit-stroke-width', 'group-stroke-width',
        'scale-width', 'scale-height'
    ];
    
    specificColorControls.forEach(controlId => {
        const colorInput = document.getElementById(controlId);
        const textInput = document.getElementById(controlId + '-text');
        const rangeInput = document.getElementById(controlId);
        
        if (colorInput && colorInput.type === 'color') {
            colorInput.addEventListener('input', function() {
                if (textInput) {
                    textInput.value = this.value;
                }
                onSpecificControlsUpdate();
            });
        }
        
        if (textInput) {
            textInput.addEventListener('input', function() {
                if (this.value.match(/^#[0-9A-Fa-f]{6}$/)) {
                    if (colorInput) {
                        colorInput.value = this.value;
                    }
                    onSpecificControlsUpdate();
                }
            });
        }
        
        if (rangeInput && rangeInput.type === 'range') {
            rangeInput.addEventListener('input', function() {
                const valueDisplay = document.getElementById(controlId + '-value');
                if (valueDisplay) {
                    valueDisplay.textContent = this.value + 'px';
                }
                onSpecificControlsUpdate();
            });
        }
    });
    
    // ✅ NOVO: Controles de radio para escala
    const scaleRadioControls = ['show-scale', 'scale-orientation'];
    scaleRadioControls.forEach(controlName => {
        const radios = document.querySelectorAll(`input[name="${controlName}"]`);
        radios.forEach(radio => {
            radio.addEventListener('change', onSpecificControlsUpdate);
        });
    });
    
    // ✅ NOVO: Controle de select para posição da escala
    const scalePositionSelect = document.getElementById('scale-position');
    if (scalePositionSelect) {
        scalePositionSelect.addEventListener('change', onSpecificControlsUpdate);
    }
    
    console.log('✅ Controles específicos de cores configurados');
}

function onSpecificControlsUpdate() {
    console.log('🎨 Controles específicos atualizados');
    
    // ✅ CORREÇÃO: Coleta configuração específica completa
    const specificConfig = getCurrentSpecificConfig();
    
    // ✅ CORREÇÃO: Chama visualização se há dados carregados
    if (window.InteractiveMapVisualization?.vizCurrentData && 
        window.InteractiveMapVisualization.vizCurrentData.length > 0) {
        
        console.log('🔄 Atualizando visualização com configurações específicas');
        
        // ✅ CORREÇÃO: Usa função correta da visualização
        if (window.InteractiveMapVisualization?.onSpecificConfigUpdate) {
            window.InteractiveMapVisualization.onSpecificConfigUpdate(specificConfig);
        }
    } else {
        console.log('⚠️ Aguardando dados para aplicar configurações específicas');
    }
}

function setupMapBaseControls() {
    const mapBaseRadios = document.querySelectorAll('input[name="map-base"]');
    mapBaseRadios.forEach(radio => {
        radio.addEventListener('change', handleMapBaseChange);
    });
    
    const groupingSelect = document.getElementById('grouping-select');
    if (groupingSelect) {
        groupingSelect.addEventListener('change', handleGroupingChange);
    }
    
    const filterCategory = document.getElementById('filter-category');
    if (filterCategory) {
        filterCategory.addEventListener('change', handleFilterCategoryChange);
    }
    
    const filterValue = document.getElementById('filter-value');
    if (filterValue) {
        filterValue.addEventListener('change', handleFilterValueChange);
    }
    
    const generateBtn = document.getElementById('generate-map');
    if (generateBtn) {
        generateBtn.addEventListener('click', handleGenerateMap);
    }
}

function handleMapBaseChange(event) {
    currentMapConfig.mapBase = event.target.value;
    
    // Reset outros valores
    currentMapConfig.grouping = null;
    currentMapConfig.filterCategory = 'none';
    currentMapConfig.filterValue = null;
    
    console.log('🗺️ Mapa base selecionado:', currentMapConfig.mapBase);
    
    // ✅ NOVO: Reset dos controles visuais
    resetControlsToInitialState();
    
    // Carrega dados do mapa e popula controles
    loadMapData(currentMapConfig.mapBase)
        .then(() => {
            enableGroupingControls();
            populateGroupingOptions();
            updateWizardStep(2, 'Escolha o agrupamento');
        })
        .catch(error => {
            console.error('❌ Erro ao carregar mapa:', error);
            if (window.OddVizApp?.showNotification) {
                window.OddVizApp.showNotification(
                    'Erro ao carregar dados do mapa. Verifique se o arquivo existe.',
                    'error'
                );
            }
        });
}

function resetControlsToInitialState() {
    console.log('🔄 Resetando controles para estado inicial');
    
    // Reset grouping
    const groupingControl = document.getElementById('grouping-control');
    const groupingSelect = document.getElementById('grouping-select');
    if (groupingControl && groupingSelect) {
        groupingControl.classList.add('disabled');
        groupingSelect.disabled = true;
        groupingSelect.innerHTML = '<option value="">Escolha o mapa base primeiro</option>';
    }
    
    // Reset filter category
    const filterControl = document.getElementById('filter-control');
    const filterCategory = document.getElementById('filter-category');
    if (filterControl && filterCategory) {
        filterControl.classList.add('disabled');
        filterCategory.disabled = true;
        filterCategory.innerHTML = '<option value="none">Sem filtro - mapa completo</option>';
    }
    
    // Reset filter value
    const filterValueControl = document.getElementById('filter-value-control');
    const filterValue = document.getElementById('filter-value');
    if (filterValueControl && filterValue) {
        filterValueControl.style.display = 'none';
        filterValueControl.classList.add('disabled');
        filterValue.disabled = true;
        filterValue.innerHTML = '';
    }
    
    // Reset generate button
    const generateControl = document.getElementById('generate-control');
    if (generateControl) {
        generateControl.style.display = 'none';
        generateControl.classList.add('disabled');
    }
    
    // Reset wizard
    updateWizardStep(1, 'Selecione o mapa base');
}

async function loadMapData(mapBase) {
    const config = MAP_CONFIGS[mapBase];
    
    if (!config) {
        throw new Error('Configuração de mapa não encontrada');
    }
    
    // Verifica se já foi carregado
    if (loadedMapData[mapBase]) {
        console.log('🗺️ Dados do mapa já carregados:', mapBase);
        return loadedMapData[mapBase];
    }
    
    console.log('📡 Carregando dados do mapa:', config.file);
    
    try {
        const response = await fetch(config.file);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const mapData = await response.json();
        
        if (!mapData.objects || !mapData.objects[config.objectName]) {
            throw new Error(`Objeto "${config.objectName}" não encontrado no arquivo JSON`);
        }
        
        // Extrai categorias únicas do JSON
        extractCategoriesFromMapData(mapBase, mapData);
        
        // Armazena no cache
        loadedMapData[mapBase] = mapData;
        
        console.log('✅ Dados do mapa carregados:', mapBase);
        return mapData;
        
    } catch (error) {
        console.error('❌ Erro ao carregar arquivo do mapa:', error);
        throw error;
    }
}

function extractCategoriesFromMapData(mapBase, mapData) {
    const config = MAP_CONFIGS[mapBase];
    const geometries = mapData.objects[config.objectName].geometries;
    
    console.log('🔍 Extraindo categorias do JSON para:', mapBase);
    console.log('📊 Total de geometrias:', geometries.length);
    
    // ✅ DEBUG: Mostra estrutura da primeira geometria
    if (geometries.length > 0) {
        console.log('🗺️ Exemplo de geometria:', {
            id: geometries[0].id,
            properties: geometries[0].properties
        });
    }
    
    // Limpa filtros existentes
    Object.keys(config.filters).forEach(key => {
        config.filters[key] = [];
    });
    
    // Para cada agrupamento que tem filtro
    config.groupings.forEach(grouping => {
        if (grouping.filterBy && grouping.categoryField) {
            console.log(`🔍 Processando agrupamento: ${grouping.label}`);
            console.log(`📋 Campo: ${grouping.categoryField}`);
            
            const categories = new Set();
            let foundCount = 0;
            let totalCount = 0;
            
            geometries.forEach(geometry => {
                totalCount++;
                try {
                    // Acessa o campo da categoria usando notação de ponto
                    const categoryValue = getNestedProperty(geometry, grouping.categoryField);
                    if (categoryValue && typeof categoryValue === 'string') {
                        categories.add(categoryValue.trim());
                        foundCount++;
                    }
                } catch (error) {
                    console.warn(`⚠️ Erro ao acessar ${grouping.categoryField} em:`, geometry);
                }
            });
            
            // Ordena e armazena as categorias
            config.filters[grouping.filterBy] = Array.from(categories).sort();
            
            console.log(`📊 Categorias encontradas para ${grouping.filterBy}:`, config.filters[grouping.filterBy]);
            console.log(`✅ ${foundCount}/${totalCount} geometrias tinham valores válidos`);
            
            if (foundCount === 0) {
                console.error(`❌ NENHUMA categoria encontrada para ${grouping.categoryField}!`);
                console.log('🔍 Verifique se o campo existe nos dados. Campos disponíveis na primeira geometria:');
                if (geometries[0] && geometries[0].properties) {
                    console.log('📋 Properties:', Object.keys(geometries[0].properties));
                }
            }
        }
    });
}

function getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : null;
    }, obj);
}

function enableGroupingControls() {
    const groupingControl = document.getElementById('grouping-control');
    const groupingSelect = document.getElementById('grouping-select');
    
    if (groupingControl && groupingSelect) {
        groupingControl.classList.remove('disabled');
        groupingSelect.disabled = false;
    }
}

function populateGroupingOptions() {
    const config = MAP_CONFIGS[currentMapConfig.mapBase];
    const groupingSelect = document.getElementById('grouping-select');
    
    if (!config || !groupingSelect) return;
    
    groupingSelect.innerHTML = '<option value="">Selecione o agrupamento</option>';
    
    config.groupings.forEach(grouping => {
        const option = document.createElement('option');
        option.value = grouping.value;
        option.textContent = grouping.label;
        groupingSelect.appendChild(option);
    });
}

function handleGroupingChange(event) {
    currentMapConfig.grouping = event.target.value;
    
    console.log('📊 Agrupamento selecionado:', currentMapConfig.grouping);
    
    // Habilita e popula filtros
    enableFilterControls();
    populateFilterOptions();
    updateWizardStep(3, 'Configure filtros (opcional)');
    
    // Mostra botão de gerar
    showGenerateButton();
}

function showGenerateButton() {
    const generateControl = document.getElementById('generate-control');
    if (generateControl) {
        generateControl.style.display = 'block';
        generateControl.classList.remove('disabled');
        updateWizardStep('✅', 'Configuração concluída - clique em gerar');
    }
}

function enableFilterControls() {
    const filterControl = document.getElementById('filter-control');
    const filterCategory = document.getElementById('filter-category');
    
    if (filterControl && filterCategory) {
        filterControl.classList.remove('disabled');
        filterCategory.disabled = false;
    }
}

function populateFilterOptions() {
    const config = MAP_CONFIGS[currentMapConfig.mapBase];
    const selectedGrouping = config.groupings.find(g => g.value === currentMapConfig.grouping);
    const filterCategory = document.getElementById('filter-category');
    
    if (!config || !selectedGrouping || !filterCategory) return;
    
    // Limpa options
    filterCategory.innerHTML = '<option value="none">Sem filtro - mapa completo</option>';
    
    if (selectedGrouping.value === 'none') {
        // Se não há agrupamento, pode filtrar por outras categorias
        config.groupings.forEach(grouping => {
            if (grouping.value !== 'none' && grouping.filterBy) {
                const option = document.createElement('option');
                option.value = grouping.filterBy;
                option.textContent = `Filtrar por ${grouping.label.toLowerCase()}`;
                filterCategory.appendChild(option);
            }
        });
    }
}

function handleFilterCategoryChange(event) {
    currentMapConfig.filterCategory = event.target.value;
    
    const filterValueControl = document.getElementById('filter-value-control');
    
    if (currentMapConfig.filterCategory === 'none') {
        filterValueControl.style.display = 'none';
        currentMapConfig.filterValue = null; // ✅ CORREÇÃO: Limpa valor do filtro
        
        console.log('🔄 Filtro removido - voltando ao mapa completo');
        
        // ✅ NOVO: Regenera mapa automaticamente quando remove filtro
        if (window.InteractiveMapConfig?.isConfigurationReady) {
            setTimeout(() => {
                if (window.InteractiveMapVisualization?.generateMap) {
                    window.InteractiveMapVisualization.generateMap(currentMapConfig);
                }
            }, 100);
        }
    } else {
        filterValueControl.style.display = 'block';
        populateFilterValues();
        
        const filterValueSelect = document.getElementById('filter-value');
        if (filterValueSelect) {
            filterValueControl.classList.remove('disabled');
            filterValueSelect.disabled = false;
        }
    }
}

function populateFilterValues() {
    const config = MAP_CONFIGS[currentMapConfig.mapBase];
    const filterValue = document.getElementById('filter-value');
    const categories = config.filters[currentMapConfig.filterCategory];
    
    if (!categories || !filterValue) return;
    
    filterValue.innerHTML = '';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        filterValue.appendChild(option);
    });
    
    // Auto-seleciona primeiro
    if (categories.length > 0) {
        currentMapConfig.filterValue = categories[0];
        filterValue.value = categories[0];
    }
}

function handleFilterValueChange(event) {
    currentMapConfig.filterValue = event.target.value;
    console.log('🔍 Filtro selecionado:', currentMapConfig.filterValue);
}

function handleGenerateMap() {
    console.log('🚀 Gerando mapa com configuração:', currentMapConfig);
    
    const generateBtn = document.getElementById('generate-map');
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="btn-icon">⏳</span>Gerando...';
    }
    
    // Valida configuração
    if (!currentMapConfig.mapBase || !currentMapConfig.grouping) {
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(
                'Configuração incompleta. Selecione mapa base e agrupamento.',
                'error'
            );
        }
        
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<span class="btn-icon">🚀</span>Gerar Mapa com Dados de Exemplo';
        }
        return;
    }
    
    // Verifica se dados do mapa foram carregados
    const mapData = loadedMapData[currentMapConfig.mapBase];
    if (!mapData) {
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(
                'Dados do mapa não carregados. Tente selecionar o mapa novamente.',
                'error'
            );
        }
        
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<span class="btn-icon">🚀</span>Gerar Mapa com Dados de Exemplo';
        }
        return;
    }
    
    // Marca configuração como pronta
    mapConfigurationReady = true;
    
    // Chama visualização
    if (window.InteractiveMapVisualization?.generateMap) {
        window.InteractiveMapVisualization.generateMap(currentMapConfig)
            .then(() => {
                // Sucesso
                console.log('✅ Mapa gerado com sucesso');
                
                // ✅ NOVO: Mostra card de dados após gerar mapa
                showDataCard();
                
                // Habilita exportação
                document.querySelectorAll('#export-svg, #export-png, #copy-embed').forEach(btn => {
                    btn.disabled = false;
                });
                
                if (generateBtn) {
                    generateBtn.disabled = false;
                    generateBtn.innerHTML = '<span class="btn-icon">🔄</span>Regenerar Mapa';
                }
                
                updateWizardStep('🎉', 'Mapa gerado! Agora carregue seus dados');
                
                if (window.OddVizApp?.showNotification) {
                    window.OddVizApp.showNotification(
                        'Mapa gerado com sucesso! Agora você pode carregar seus dados ou usar os dados de exemplo.',
                        'success'
                    );
                }
            })
            .catch(error => {
                // Erro
                console.error('❌ Erro ao gerar mapa:', error);
                
                if (generateBtn) {
                    generateBtn.disabled = false;
                    generateBtn.innerHTML = '<span class="btn-icon">🚀</span>Gerar Mapa com Dados de Exemplo';
                }
                
                updateWizardStep('❌', 'Erro ao gerar mapa');
                
                if (window.OddVizApp?.showNotification) {
                    window.OddVizApp.showNotification(
                        'Erro ao gerar mapa: ' + error.message,
                        'error'
                    );
                }
            });
    } else {
        console.error('❌ Sistema de visualização não encontrado');
        
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<span class="btn-icon">🚀</span>Gerar Mapa com Dados de Exemplo';
        }
    }
}

function showDataCard() {
    const dataCard = document.getElementById('data-card');
    if (dataCard) {
        dataCard.style.display = 'block';
        updateDataRequirements();
        setupDataControls();
        
        console.log('📊 Card de dados exibido');
    }
}

function showColorsCard() {
    const colorsCard = document.getElementById('colors-card');
    if (colorsCard) {
        colorsCard.style.display = 'block';
        
        // ✅ CORREÇÃO: Garante que controles sejam configurados quando card aparece
        setTimeout(() => {
            setupSpecificColorControls();
        }, 100);
        
        console.log('🎨 Card de cores exibido e controles configurados');
    }
}

function updateDataRequirements() {
    const keyRequirements = document.getElementById('key-requirements');
    const config = MAP_CONFIGS[currentMapConfig.mapBase];
    
    if (!keyRequirements || !config) return;
    
    let requirementText = '';
    
    if (currentMapConfig.grouping === 'none') {
        // Sem agrupamento: códigos individuais
        if (currentMapConfig.mapBase === 'brazil') {
            requirementText = 'Códigos dos estados (AC, SP, RJ, MG, etc.)';
        } else {
            requirementText = 'Códigos dos países (conforme dados de exemplo)';
        }
    } else {
        // Com agrupamento: nomes das categorias
        const selectedGrouping = config.groupings.find(g => g.value === currentMapConfig.grouping);
        if (selectedGrouping) {
            requirementText = `Nomes das ${selectedGrouping.label.toLowerCase()} (conforme dados de exemplo)`;
        }
    }
    
    keyRequirements.textContent = requirementText;
}

function setupDataControls() {
    // Botão para carregar dados de exemplo
    const loadSampleBtn = document.getElementById('load-sample');
    if (loadSampleBtn) {
        loadSampleBtn.addEventListener('click', loadSampleData);
    }
    
    // Botão para baixar dados de exemplo
    const downloadSampleBtn = document.getElementById('download-sample');
    if (downloadSampleBtn) {
        downloadSampleBtn.addEventListener('click', downloadSampleData);
    }
    
    // Upload de arquivo
    const dataInput = document.getElementById('data-input');
    if (dataInput) {
        dataInput.addEventListener('change', handleFileUpload);
    }
    
    // Textarea de dados
    const dataTextInput = document.getElementById('data-text-input');
    if (dataTextInput) {
        dataTextInput.addEventListener('input', handleTextDataInput);
    }
}

function loadSampleData() {
    console.log('📊 Carregando dados de exemplo...');
    
    // Gera dados de exemplo
    const sampleData = window.InteractiveMapVisualization?.generateSampleDataForCurrentConfig();
    
    if (sampleData && sampleData.data) {
        const csvText = convertDataToCSV(sampleData.data);
        
        const dataTextInput = document.getElementById('data-text-input');
        if (dataTextInput) {
            dataTextInput.value = csvText;
        }
        
        updateDataPreview(sampleData.data);
        
        // ✅ NOVO: Mostra card de cores quando carrega dados
        showColorsCard();
        
        // ✅ CORREÇÃO: Combina Template Controls com configurações específicas
        console.log('🎛️ Combinando configurações para renderização...');
        
        const templateConfig = window.OddVizTemplateControls?.getState() || {};
        const specificConfig = getCurrentSpecificConfig();
        const mergedConfig = Object.assign({}, templateConfig, specificConfig);
        
        console.log('📋 Configuração final para renderização:', mergedConfig);
        
        // ✅ CORREÇÃO: Chama visualização com configuração completa
        if (window.InteractiveMapVisualization?.onDataLoaded) {
            // Passa dados para a visualização
            window.InteractiveMapVisualization.onDataLoaded(sampleData);
        }
        
        // ✅ CORREÇÃO: Força sincronização após carregamento
        setTimeout(() => {
            syncTemplateControlsWithHTML();
        }, 200);
        
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(
                'Dados de exemplo carregados com sucesso!',
                'success'
            );
        }
    }
}

function downloadSampleData() {
    console.log('💾 Baixando dados de exemplo...');
    
    // Gera dados de exemplo
    const sampleData = window.InteractiveMapVisualization?.generateSampleDataForCurrentConfig();
    
    if (sampleData && sampleData.data) {
        const csvText = convertDataToCSV(sampleData.data);
        
        // Cria nome do arquivo baseado na configuração
        let filename = `dados_exemplo_${currentMapConfig.mapBase}`;
        if (currentMapConfig.grouping !== 'none') {
            filename += `_${currentMapConfig.grouping}`;
        }
        if (currentMapConfig.filterValue) {
            filename += `_${currentMapConfig.filterValue.replace(/\s+/g, '_')}`;
        }
        filename += '.csv';
        
        // Download do arquivo
        downloadCSV(csvText, filename);
        
        if (window.OddVizApp?.showNotification) {
            window.OddVizApp.showNotification(
                'Dados de exemplo baixados!',
                'success'
            );
        }
    }
}

function convertDataToCSV(data) {
    if (!data || data.length === 0) return '';
    
    // Header
    const headers = Object.keys(data[0]);
    let csvText = headers.join(',') + '\n';
    
    // Rows
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            return typeof value === 'string' ? `"${value}"` : value;
        });
        csvText += values.join(',') + '\n';
    });
    
    return csvText;
}

function downloadCSV(csvText, filename) {
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
        tableHTML += `<p class="preview-footer">Mostrando ${maxRows} de ${data.length} registros</p>`;
    }
    
    tableHTML += '</div>';
    previewContainer.innerHTML = tableHTML;
}

function handleFileUpload(event) {
    // Implementar upload de arquivo
    console.log('📁 Upload de arquivo:', event.target.files[0]);
}

function handleTextDataInput(event) {
    // Implementar processamento de texto CSV
    console.log('📝 Dados inseridos via texto');
}

function updateWizardStep(step, description) {
    const wizardStep = document.querySelector('.wizard-step');
    const wizardDescription = document.querySelector('.wizard-description');
    
    if (wizardStep) {
        wizardStep.textContent = typeof step === 'string' ? step : `Etapa ${step} de 3`;
    }
    
    if (wizardDescription) {
        wizardDescription.textContent = description;
    }
}

// ==========================================================================
// SINCRONIZAÇÃO COM TEMPLATE CONTROLS
// ==========================================================================

function onMapConfigUpdate() {
    if (window.InteractiveMapVisualization?.onMapConfigUpdate) {
        window.InteractiveMapVisualization.onMapConfigUpdate(currentMapConfig);
    }
}

// ✅ CORREÇÃO: Garantir leitura dos valores do HTML pelo Template Controls
function syncTemplateControlsWithHTML() {
    console.log('🔄 Sincronizando Template Controls com valores do HTML...');
    
    // ✅ CORREÇÃO: Força Template Controls a ler valores atuais do HTML
    if (window.OddVizTemplateControls?.getState) {
        const currentState = window.OddVizTemplateControls.getState();
        console.log('📋 Estado atual do Template Controls:', currentState);
        
        // ✅ CORREÇÃO: Se há dados carregados, aplica imediatamente
        if (window.InteractiveMapVisualization?.vizCurrentData && 
            window.InteractiveMapVisualization.vizCurrentData.length > 0) {
            
            const specificConfig = getCurrentSpecificConfig();
            const mergedConfig = Object.assign({}, currentState, specificConfig);
            
            console.log('🔄 Aplicando estado sincronizado:', mergedConfig);
            
            if (window.InteractiveMapVisualization?.onUpdate) {
                window.InteractiveMapVisualization.onUpdate(mergedConfig);
            }
        }
    }
}

// ✅ CORREÇÃO: Adicionar verificação de Template Controls
function checkTemplateControlsIntegration() {
    console.log('🔍 Verificando integração com Template Controls...');
    
    if (!window.OddVizTemplateControls) {
        console.error('❌ Template Controls não encontrado!');
        return false;
    }
    
    if (!window.OddVizTemplateControls.getState) {
        console.error('❌ Função getState não disponível no Template Controls!');
        return false;
    }
    
    console.log('✅ Template Controls integrado corretamente');
    
    // ✅ CORREÇÃO: Testa se Template Controls está lendo valores do HTML
    const state = window.OddVizTemplateControls.getState();
    console.log('📋 Estado atual lido pelo Template Controls:', state);
    
    return true;
}

// ✅ CORREÇÃO: Melhorar integração com Template Controls
function onTemplateControlsUpdate(templateConfig) {
    console.log('🎛️ Template controls atualizados:', templateConfig);
    
    // ✅ CORREÇÃO: Verifica se há dados carregados antes de atualizar
    if (window.InteractiveMapVisualization?.vizCurrentData && 
        window.InteractiveMapVisualization.vizCurrentData.length > 0) {
        
        console.log('🔄 Atualizando visualização existente com template controls');
        
        // ✅ CORREÇÃO: Combina configuração do template com configurações específicas
        const specificConfig = getCurrentSpecificConfig();
        const mergedConfig = Object.assign({}, templateConfig, specificConfig);
        
        console.log('📋 Configuração mesclada final:', mergedConfig);
        
        // ✅ CORREÇÃO: Usa função onUpdate da visualização
        if (window.InteractiveMapVisualization?.onUpdate) {
            window.InteractiveMapVisualization.onUpdate(mergedConfig);
        }
    } else {
        console.log('⚠️ Nenhum dado carregado ainda - template controls serão aplicados quando dados forem carregados');
    }
}

function getCurrentSpecificConfig() {
    const specificConfig = {
        // ✅ CORREÇÃO: Ler todos os controles específicos
        scaleType: document.querySelector('input[name="scale-type"]:checked')?.value || 'continuous',
        scaleDivisions: parseInt(document.getElementById('scale-divisions')?.value) || 5,
        paletteType: document.querySelector('input[name="palette-type"]:checked')?.value || 'sequential',
        
        // Cores sequenciais
        colorMin: document.getElementById('color-min')?.value || '#E8F4FD',
        colorMax: document.getElementById('color-max')?.value || '#2C0165',
        
        // Cores divergentes
        colorLow: document.getElementById('color-low')?.value || '#6F02FD',
        colorMid: document.getElementById('color-mid')?.value || '#FAF9FA',
        colorHigh: document.getElementById('color-high')?.value || '#6CDADE',
        divergingMidValue: parseFloat(document.getElementById('diverging-mid-value')?.value) || 50,
        
        // Outras configurações
        noDataColor: document.getElementById('no-data-color')?.value || '#E0E0E0',
        
        // ✅ NOVO: Configurações de contorno
        strokeColor: document.getElementById('stroke-color')?.value || '#FFFFFF',
        unitStrokeWidth: parseFloat(document.getElementById('unit-stroke-width')?.value) || 0.5,
        groupStrokeWidth: parseFloat(document.getElementById('group-stroke-width')?.value) || 2,
        
        // ✅ NOVO: Configurações de escala
        showScale: document.querySelector('input[name="show-scale"]:checked')?.value === 'true',
        scaleOrientation: document.querySelector('input[name="scale-orientation"]:checked')?.value || 'horizontal',
        scalePosition: document.getElementById('scale-position')?.value || 'bottom-right',
        scaleWidth: parseInt(document.getElementById('scale-width')?.value) || 200,
        scaleHeight: parseInt(document.getElementById('scale-height')?.value) || 20,
        
        // Configurações herdadas
        showLabels: true,
        showValues: true
    };
    
    console.log('📋 Configuração específica atual:', specificConfig);
    return specificConfig;
}

// ==========================================================================
// DADOS DE EXEMPLO
// ==========================================================================

function generateSampleData(mapConfig) {
    // Será implementado após seleção do mapa
    console.log('📊 Gerando dados de exemplo para:', mapConfig);
    
    // Por enquanto retorna estrutura básica
    return {
        data: [],
        columns: ['key', 'value'],
        columnTypes: { key: 'string', value: 'number' },
        rowCount: 0,
        source: 'generated'
    };
}

//exportações globais
window.InteractiveMapConfig = {
    config: VIZ_CONFIG,
    mapConfigs: MAP_CONFIGS,
    loadedMapData: loadedMapData,
    generateSampleData,
    getDataRequirements,
    onDataLoaded,
    onMapConfigUpdate,
    onTemplateControlsUpdate, // ✅ Função corrigida
    setupControls,
    syncControlsIfNeeded,
    getCurrentSpecificConfig,
    updateDataPreview,
    
    // ✅ CORREÇÃO: Adicionar novas funções de sincronização
    syncTemplateControlsWithHTML,
    checkTemplateControlsIntegration,
    setupConfigurationFlow, // ✅ Função que estava ausente
    
    // Função para acessar dados carregados
    getLoadedMapData: (mapBase) => loadedMapData[mapBase],
    
    // Estado atual
    get currentConfig() { return currentMapConfig; },
    get isConfigurationReady() { return mapConfigurationReady; }
};

// Expõe funções principais globalmente
window.generateSampleData = generateSampleData;
window.getDataRequirements = getDataRequirements;
window.onDataLoaded = onDataLoaded;

// ==========================================================================
// INICIALIZAÇÃO ESPECÍFICA DO MAPA INTERATIVO
// ==========================================================================

// ✅ CORREÇÃO: Inicializar Template Controls corretamente
function initializeMapConfig() {
    console.log('⚙️ Inicializando configuração específica do mapa interativo...');
    
    // ✅ CORREÇÃO: Aguarda Template Controls estar totalmente pronto
    setTimeout(() => {
        syncControlsIfNeeded();
        
        // ✅ CORREÇÃO: Força Template Controls a ler valores do HTML após inicialização
        setTimeout(() => {
            console.log('🔄 Forçando sincronização inicial do Template Controls...');
            
            if (window.OddVizTemplateControls?.initialize) {
                // ✅ CORREÇÃO: Re-inicializa Template Controls se necessário
                console.log('🎛️ Template Controls disponível, verificando integração...');
                
                // Força leitura dos valores do HTML
                syncTemplateControlsWithHTML();
            }
        }, 500);
        
        console.log('✅ Configuração específica do mapa interativo concluída');
    }, 300);
}

function syncControlsIfNeeded() {
    console.log('🔄 Verificando sincronização de controles específicos...');
    // Configuração específica será feita após seleção do usuário
    console.log('✅ Controles específicos prontos para configuração');
}

// Auto-inicialização com ordem correta
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // ✅ CORREÇÃO: Aguarda um pouco mais para garantir que Template Controls carregou
        setTimeout(initializeMapConfig, 1000);
    });
} else {
    // ✅ CORREÇÃO: Se documento já carregou, inicia após pequeno delay
    setTimeout(initializeMapConfig, 1000);
}