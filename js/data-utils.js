/**
 * ODDATAVIZ - Utilitários de Dados
 * Funções para upload, validação e manipulação de dados CSV/JSON
 */

// ==========================================================================
// CONFIGURAÇÕES DE DADOS
// ==========================================================================

const DATA_CONFIG = {
    // Tipos de arquivo aceitos
    acceptedTypes: ['text/csv', 'application/json', 'text/plain'],
    
    // Tamanho máximo de arquivo (5MB)
    maxFileSize: 5 * 1024 * 1024,
    
    // Configurações CSV
    csv: {
        delimiter: ',',
        alternativeDelimiters: [';', '\t', '|'],
        encoding: 'utf-8',
        skipEmptyLines: true,
        parseNumbers: true
    },
    
    // Configurações de validação
    validation: {
        maxRows: 10000,
        maxColumns: 50,
        requiredColumns: [], // Será definido por cada visualização
        columnTypes: {} // Será definido por cada visualização
    }
};

// ==========================================================================
// VARIÁVEIS GLOBAIS
// ==========================================================================

let currentData = null;
let currentDataMeta = null;

// ==========================================================================
// UTILITÁRIOS GERAIS
// ==========================================================================

/**
 * Detecta o tipo de dado
 */
function detectDataType(value) {
    if (value === null || value === undefined || value === '') {
        return 'null';
    }
    
    if (typeof value === 'boolean') {
        return 'boolean';
    }
    
    if (typeof value === 'number') {
        return 'number';
    }
    
    // Tenta converter para número
    const numValue = Number(value);
    if (!isNaN(numValue) && isFinite(numValue)) {
        return 'number';
    }
    
    // Tenta detectar data
    if (isValidDate(value)) {
        return 'date';
    }
    
    return 'string';
}

/**
 * Verifica se é uma data válida
 */
function isValidDate(value) {
    if (typeof value !== 'string') return false;
    
    const date = new Date(value);
    return !isNaN(date.getTime()) && value.match(/\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4}/);
}

/**
 * Converte valor para o tipo apropriado
 */
function convertValue(value, targetType) {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    
    switch (targetType) {
        case 'number':
            const num = Number(value);
            return isNaN(num) ? null : num;
            
        case 'date':
            const date = new Date(value);
            return isNaN(date.getTime()) ? null : date;
            
        case 'boolean':
            if (typeof value === 'boolean') return value;
            const str = String(value).toLowerCase();
            return str === 'true' || str === '1' || str === 'yes' || str === 'sim';
            
        default:
            return String(value);
    }
}

/**
 * Sanitiza nome de coluna
 */
function sanitizeColumnName(name) {
    return String(name)
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '_')
        .toLowerCase();
}

// ==========================================================================
// PARSING DE DADOS
// ==========================================================================

/**
 * Faz parse de CSV
 */
function parseCSV(csvText) {
    try {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length === 0) {
            throw new Error('Arquivo CSV vazio');
        }
        
        // Detecta delimitador
        const delimiter = detectCSVDelimiter(lines[0]);
        
        // Extrai header
        const headers = parseCSVLine(lines[0], delimiter)
            .map(header => sanitizeColumnName(header));
        
        // Valida headers
        if (headers.length === 0) {
            throw new Error('Nenhuma coluna encontrada');
        }
        
        if (headers.length > DATA_CONFIG.validation.maxColumns) {
            throw new Error(`Muitas colunas. Máximo: ${DATA_CONFIG.validation.maxColumns}`);
        }
        
        // Parse das linhas de dados
        const data = [];
        for (let i = 1; i < lines.length && i <= DATA_CONFIG.validation.maxRows + 1; i++) {
            const values = parseCSVLine(lines[i], delimiter);
            
            if (values.length > 0) {
                const row = {};
                headers.forEach((header, index) => {
                    const value = values[index] || null;
                    row[header] = value;
                });
                data.push(row);
            }
        }
        
        if (data.length === 0) {
            throw new Error('Nenhuma linha de dados encontrada');
        }
        
        // Detecta tipos de colunas
        const columnTypes = detectColumnTypes(data, headers);
        
        // Converte valores para tipos apropriados
        const processedData = data.map(row => {
            const processedRow = {};
            headers.forEach(header => {
                processedRow[header] = convertValue(row[header], columnTypes[header]);
            });
            return processedRow;
        });
        
        return {
            data: processedData,
            columns: headers,
            columnTypes: columnTypes,
            rowCount: processedData.length,
            source: 'csv'
        };
        
    } catch (error) {
        console.error('Erro ao fazer parse do CSV:', error);
        throw new Error(`Erro no CSV: ${error.message}`);
    }
}

/**
 * Detecta delimitador CSV
 */
function detectCSVDelimiter(firstLine) {
    const delimiters = DATA_CONFIG.csv.alternativeDelimiters.concat([DATA_CONFIG.csv.delimiter]);
    let bestDelimiter = DATA_CONFIG.csv.delimiter;
    let maxColumns = 0;
    
    delimiters.forEach(delimiter => {
        const columns = parseCSVLine(firstLine, delimiter);
        if (columns.length > maxColumns) {
            maxColumns = columns.length;
            bestDelimiter = delimiter;
        }
    });
    
    return bestDelimiter;
}

/**
 * Faz parse de uma linha CSV
 */
function parseCSVLine(line, delimiter) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result.map(val => val.replace(/^"|"$/g, '')); // Remove aspas
}

/**
 * Detecta tipos de colunas
 */
function detectColumnTypes(data, headers) {
    const types = {};
    
    headers.forEach(header => {
        const values = data.map(row => row[header]).filter(val => val !== null && val !== '');
        
        if (values.length === 0) {
            types[header] = 'string';
            return;
        }
        
        // Conta tipos
        const typeCounts = {};
        values.forEach(value => {
            const type = detectDataType(value);
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        
        // Escolhe o tipo mais comum
        const mostCommonType = Object.keys(typeCounts)
            .reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b);
        
        types[header] = mostCommonType;
    });
    
    return types;
}

/**
 * Faz parse de JSON
 */
function parseJSON(jsonText) {
    try {
        const parsed = JSON.parse(jsonText);
        
        // Verifica se é array
        if (!Array.isArray(parsed)) {
            throw new Error('JSON deve ser um array de objetos');
        }
        
        if (parsed.length === 0) {
            throw new Error('Array JSON vazio');
        }
        
        if (parsed.length > DATA_CONFIG.validation.maxRows) {
            throw new Error(`Muitas linhas. Máximo: ${DATA_CONFIG.validation.maxRows}`);
        }
        
        // Extrai colunas do primeiro objeto
        const firstItem = parsed[0];
        if (typeof firstItem !== 'object' || firstItem === null) {
            throw new Error('Itens do array devem ser objetos');
        }
        
        const columns = Object.keys(firstItem).map(sanitizeColumnName);
        
        if (columns.length > DATA_CONFIG.validation.maxColumns) {
            throw new Error(`Muitas colunas. Máximo: ${DATA_CONFIG.validation.maxColumns}`);
        }
        
        // Normaliza dados
        const data = parsed.map(item => {
            const normalizedItem = {};
            Object.keys(item).forEach(key => {
                const normalizedKey = sanitizeColumnName(key);
                normalizedItem[normalizedKey] = item[key];
            });
            return normalizedItem;
        });
        
        // Detecta tipos
        const columnTypes = detectColumnTypes(data, columns);
        
        return {
            data: data,
            columns: columns,
            columnTypes: columnTypes,
            rowCount: data.length,
            source: 'json'
        };
        
    } catch (error) {
        console.error('Erro ao fazer parse do JSON:', error);
        throw new Error(`Erro no JSON: ${error.message}`);
    }
}

// ==========================================================================
// VALIDAÇÃO DE DADOS
// ==========================================================================

/**
 * Valida dados processados
 */
function validateData(processedData, requirements = {}) {
    const errors = [];
    const warnings = [];
    
    // Validações básicas
    if (!processedData || !processedData.data || !Array.isArray(processedData.data)) {
        errors.push('Dados inválidos');
        return { valid: false, errors, warnings };
    }
    
    if (processedData.data.length === 0) {
        errors.push('Nenhuma linha de dados');
        return { valid: false, errors, warnings };
    }
    
    // Validações específicas
    if (requirements.requiredColumns) {
        requirements.requiredColumns.forEach(requiredCol => {
            if (!processedData.columns.includes(requiredCol)) {
                errors.push(`Coluna obrigatória não encontrada: ${requiredCol}`);
            }
        });
    }
    
    if (requirements.columnTypes) {
        Object.keys(requirements.columnTypes).forEach(col => {
            const expectedType = requirements.columnTypes[col];
            const actualType = processedData.columnTypes[col];
            
            if (actualType !== expectedType) {
                warnings.push(`Coluna '${col}' deveria ser ${expectedType}, mas é ${actualType}`);
            }
        });
    }
    
    // Verifica valores nulos
    const nullCounts = {};
    processedData.columns.forEach(col => {
        const nullCount = processedData.data.filter(row => row[col] === null || row[col] === undefined).length;
        if (nullCount > 0) {
            nullCounts[col] = nullCount;
            warnings.push(`Coluna '${col}' tem ${nullCount} valores vazios`);
        }
    });
    
    return {
        valid: errors.length === 0,
        errors,
        warnings,
        nullCounts
    };
}

// ==========================================================================
// UPLOAD E MANIPULAÇÃO DE ARQUIVOS
// ==========================================================================

/**
 * Inicializa upload de dados
 */
function initializeDataUpload() {
    const fileInput = document.getElementById('data-input');
    const loadSampleBtn = document.getElementById('load-sample');
    const dataTextInput = document.getElementById('data-text-input');
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
    
    if (loadSampleBtn) {
        loadSampleBtn.addEventListener('click', loadSampleData);
    }
    
    if (dataTextInput) {
        dataTextInput.addEventListener('input', debounce(handleTextareaInput, 500));
    }
}

/**
 * Função de debounce
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Manipula input do textarea
 */
function handleTextareaInput() {
    const textarea = document.getElementById('data-text-input');
    if (!textarea) return;
    
    const textData = textarea.value.trim();
    if (!textData) {
        // Se estiver vazio, limpa dados
        currentData = null;
        updateDataPreview(null);
        return;
    }
    
    try {
        const processedData = parseCSV(textData);
        
        // Valida dados
        const validation = validateData(processedData, getDataRequirements());
        
        if (!validation.valid) {
            showError(`Erro nos dados: ${validation.errors.join(', ')}`);
            return;
        }
        
        if (validation.warnings.length > 0) {
            console.warn('Avisos de dados:', validation.warnings);
        }
        
        // Armazena dados
        setCurrentData(processedData);
        
        // Atualiza preview
        updateDataPreview(processedData);
        
        // Chama callback se existir
        if (typeof onDataLoaded === 'function') {
            onDataLoaded(processedData);
        }
        
    } catch (error) {
        console.error('Erro ao processar dados do textarea:', error);
        showError('Erro ao processar dados: ' + error.message);
    }
}

/**
 * Manipula upload de arquivo
 */
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validações básicas
    if (file.size > DATA_CONFIG.maxFileSize) {
        showError('Arquivo muito grande. Máximo: 5MB');
        return;
    }
    
    if (!DATA_CONFIG.acceptedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
        showError('Tipo de arquivo não suportado. Use CSV ou JSON.');
        return;
    }
    
    // Lê o arquivo
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            let processedData;
            
            if (file.name.endsWith('.json')) {
                processedData = parseJSON(content);
            } else {
                processedData = parseCSV(content);
            }
            
            // Valida dados
            const validation = validateData(processedData, getDataRequirements());
            
            if (!validation.valid) {
                showError(`Erro nos dados: ${validation.errors.join(', ')}`);
                return;
            }
            
            if (validation.warnings.length > 0) {
                console.warn('Avisos de dados:', validation.warnings);
            }
            
            // Armazena dados
            setCurrentData(processedData);
            
            // Atualiza preview
            updateDataPreview(processedData);
            
            // Notifica sucesso
            if (window.OddVizApp && window.OddVizApp.showNotification) {
                window.OddVizApp.showNotification(
                    `Dados carregados: ${processedData.rowCount} linhas, ${processedData.columns.length} colunas`,
                    'success'
                );
            }
            
            // Chama callback se existir
            if (typeof onDataLoaded === 'function') {
                onDataLoaded(processedData);
            }
            
        } catch (error) {
            showError(error.message);
        }
    };
    
    reader.onerror = function() {
        showError('Erro ao ler arquivo');
    };
    
    reader.readAsText(file);
}

/**
 * Carrega dados de exemplo
 */
function loadSampleData() {
    if (typeof getSampleData === 'function') {
        const sampleData = getSampleData();
        setCurrentData(sampleData);
        updateDataPreview(sampleData);
        
        // Atualiza o textarea com dados de exemplo
        const textarea = document.getElementById('data-text-input');
        if (textarea) {
            const csvData = convertDataToCSV(sampleData.data);
            textarea.value = csvData;
        }
        
        if (window.OddVizApp && window.OddVizApp.showNotification) {
            window.OddVizApp.showNotification('Dados de exemplo restaurados!', 'success');
        }
        
        if (typeof onDataLoaded === 'function') {
            onDataLoaded(sampleData);
        }
    } else {
        showError('Dados de exemplo não disponíveis para esta visualização');
    }
}

/**
 * Converte dados para formato CSV
 */
function convertDataToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            // Escapa aspas e adiciona aspas se necessário
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        });
        csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
}

/**
 * Atualiza preview dos dados
 */
function updateDataPreview(processedData) {
    const preview = document.getElementById('data-preview');
    if (!preview) return;
    
    if (!processedData || !processedData.data || processedData.data.length === 0) {
        preview.innerHTML = '<p class="data-placeholder">Nenhum dado carregado</p>';
        return;
    }
    
    // Cria tabela com primeiras 5 linhas
    const previewData = processedData.data.slice(0, 5);
    const table = document.createElement('table');
    table.className = 'data-table';
    
    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    processedData.columns.forEach(col => {
        const th = document.createElement('th');
        th.textContent = col;
        th.title = `Tipo: ${processedData.columnTypes[col]}`;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Body
    const tbody = document.createElement('tbody');
    previewData.forEach(row => {
        const tr = document.createElement('tr');
        processedData.columns.forEach(col => {
            const td = document.createElement('td');
            const value = row[col];
            td.textContent = value === null ? 'null' : String(value);
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    
    preview.innerHTML = '';
    preview.appendChild(table);
    
    // Adiciona info
    if (processedData.data.length > 5) {
        const info = document.createElement('p');
        info.className = 'data-info';
        info.textContent = `Mostrando 5 de ${processedData.rowCount} linhas`;
        info.style.fontSize = '0.75rem';
        info.style.color = 'rgba(250, 249, 250, 0.6)';
        info.style.marginTop = '8px';
        info.style.marginBottom = '0';
        preview.appendChild(info);
    }
}

// ==========================================================================
// GETTERS E SETTERS
// ==========================================================================

/**
 * Define dados atuais
 */
function setCurrentData(processedData) {
    currentData = processedData;
    currentDataMeta = {
        loadedAt: new Date(),
        source: processedData.source,
        rowCount: processedData.rowCount,
        columnCount: processedData.columns.length
    };
    
    // Armazena globalmente para outras funções
    window.chartData = processedData.data;
    window.chartColumns = processedData.columns;
    window.chartColumnTypes = processedData.columnTypes;
}

/**
 * Obtém dados atuais
 */
function getCurrentData() {
    return currentData;
}

/**
 * Obtém metadados dos dados atuais
 */
function getCurrentDataMeta() {
    return currentDataMeta;
}

/**
 * Verifica se há dados carregados
 */
function hasData() {
    return currentData !== null && currentData.data && currentData.data.length > 0;
}

// ==========================================================================
// UTILITÁRIOS DE ERRO
// ==========================================================================

/**
 * Mostra erro
 */
function showError(message) {
    console.error('Data Error:', message);
    if (window.OddVizApp && window.OddVizApp.showNotification) {
        window.OddVizApp.showNotification(message, 'error');
    }
}

// ==========================================================================
// FUNÇÕES PARA SEREM IMPLEMENTADAS POR CADA VISUALIZAÇÃO
// ==========================================================================

/**
 * Obtém requisitos de dados (deve ser implementado por cada viz)
 */
function getDataRequirements() {
    // Esta função deve ser sobrescrita por cada visualização
    return {
        requiredColumns: [],
        columnTypes: {}
    };
}

// ==========================================================================
// EXPORTAÇÕES GLOBAIS
// ==========================================================================

window.OddVizData = {
    parseCSV,
    parseJSON,
    validateData,
    initializeDataUpload,
    getCurrentData,
    getCurrentDataMeta,
    hasData,
    setCurrentData,
    detectDataType,
    convertValue,
    sanitizeColumnName,
    handleTextareaInput,
    convertDataToCSV,
    updateDataPreview,
    DATA_CONFIG
};

// Auto-inicialização
document.addEventListener('DOMContentLoaded', initializeDataUpload);

console.log('Data Utils loaded successfully');
