/**
 * ODDATAVIZ - JavaScript Global
 * Funções de navegação e comportamentos globais
 */

// ==========================================================================
// CONFIGURAÇÕES GLOBAIS - CORRIGIDO PARA GITHUB PAGES
// ==========================================================================

const CONFIG = {
    // URLs base para navegação - DETECTA AUTOMATICAMENTE O PATH BASE
    baseURL: window.location.origin,
    basePath: getBasePath(), // Detecta se está em GitHub Pages ou local
    visualizationsPath: getBasePath() + 'visualizations/',
    
    // Configurações de animação
    animationDuration: 300,
    
    // Lista de visualizações disponíveis (APENAS OFICIAIS)
    availableVisualizations: [
        'waffle-chart',     // ✅ Primeira visualização oficial
        'bar-chart',
        'line-chart', 
        'pie-chart',
        'scatter-plot',
        'heatmap',
        'treemap',
        'area-chart',
        'histogram',
        'box-plot',
        'network-graph'
        // 'test' - NÃO incluir páginas de teste
    ]
};

/**
 * Detecta o path base automaticamente (GitHub Pages vs Local)
 */
function getBasePath() {
    const pathname = window.location.pathname;
    const origin = window.location.origin;
    
    // Se estiver no GitHub Pages (anabertol.github.io/oddataviz/)
    if (pathname.includes('/oddataviz/')) {
        return '/oddataviz/';
    }
    
    // Se estiver em localhost ou servidor local
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return '/';
    }
    
    // Se estiver em GitHub Pages mas não detectou oddataviz, tenta inferir
    if (origin.includes('github.io')) {
        const pathParts = pathname.split('/').filter(part => part);
        if (pathParts.length > 0 && pathParts[0] !== 'visualizations') {
            return `/${pathParts[0]}/`;
        }
    }
    
    // Default para raiz
    return '/';
}

// ==========================================================================
// UTILITÁRIOS GLOBAIS
// ==========================================================================

/**
 * Função para logging com timestamp
 */
function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
    
    switch(type) {
        case 'error':
            console.error(prefix, message);
            break;
        case 'warn':
            console.warn(prefix, message);
            break;
        default:
            console.log(prefix, message);
    }
}

/**
 * Função para sanitizar strings
 */
function sanitizeString(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[<>'"]/g, '');
}

/**
 * Função para mostrar notificações
 */
function showNotification(message, type = 'info', duration = 3000) {
    // Remove notificação existente se houver
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Cria nova notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${sanitizeString(message)}</span>
        <button class="notification-close" aria-label="Fechar notificação">&times;</button>
    `;
    
    // Adiciona estilos inline (serão sobrescritos pelo CSS se existir)
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 16px',
        borderRadius: '8px',
        color: '#FAF9FA',
        backgroundColor: type === 'error' ? '#ff6b6b' : type === 'success' ? '#51cf66' : '#6CDADE',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '300px',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif'
    });
    
    // Botão de fechar
    const closeBtn = notification.querySelector('.notification-close');
    Object.assign(closeBtn.style, {
        background: 'none',
        border: 'none',
        color: 'inherit',
        cursor: 'pointer',
        fontSize: '18px',
        padding: '0',
        marginLeft: 'auto'
    });
    
    // Adiciona ao DOM
    document.body.appendChild(notification);
    
    // Event listener para fechar
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remove após duração especificada
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, duration);
    }
    
    log(`Notification shown: ${message}`, type);
}

// ==========================================================================
// NAVEGAÇÃO - CORRIGIDA PARA GITHUB PAGES
// ==========================================================================

/**
 * Verifica se é uma visualização de desenvolvimento/teste
 */
function isDevelopmentVisualization(vizType) {
    const devTypes = ['test', 'dev', 'demo', 'example'];
    return devTypes.includes(vizType);
}

/**
 * Navega para uma visualização específica - VERSÃO CORRIGIDA PARA GITHUB PAGES
 */
function navigateToVisualization(vizType) {
    // Permite navegação para visualizações de desenvolvimento se acessadas diretamente
    if (!CONFIG.availableVisualizations.includes(vizType) && !isDevelopmentVisualization(vizType)) {
        log(`Visualization type '${vizType}' not found`, 'error');
        showNotification('Visualização não encontrada', 'error');
        return false;
    }
    
    // Constrói URL correta com base path
    const url = `${CONFIG.visualizationsPath}${vizType}/`;
    
    log(`Navigating to: ${url}`);
    console.log('🖱️ NAVEGAÇÃO DEBUG:');
    console.log('- Base Path:', CONFIG.basePath);
    console.log('- Visualizations Path:', CONFIG.visualizationsPath);
    console.log('- Final URL:', url);
    console.log('- Current Location:', window.location.href);
    
    try {
        window.location.href = url;
        return true;
    } catch (error) {
        log(`Navigation error: ${error.message}`, 'error');
        showNotification('Erro ao navegar para a visualização', 'error');
        return false;
    }
}

/**
 * Volta para a homepage
 */
function navigateToHome() {
    try {
        const homeUrl = CONFIG.basePath;
        window.location.href = homeUrl;
        return true;
    } catch (error) {
        log(`Navigation to home error: ${error.message}`, 'error');
        return false;
    }
}

/**
 * Função para criar breadcrumb
 */
function createBreadcrumb(items) {
    const breadcrumb = document.querySelector('.breadcrumb');
    if (!breadcrumb) return;
    
    breadcrumb.innerHTML = '';
    
    items.forEach((item, index) => {
        const link = document.createElement(item.href ? 'a' : 'span');
        link.textContent = item.text;
        link.className = 'breadcrumb-item';
        
        if (item.href) {
            // Ajusta href para incluir base path
            const adjustedHref = item.href.startsWith('/') ? CONFIG.basePath.slice(0, -1) + item.href : item.href;
            link.href = adjustedHref;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (item.action) {
                    item.action();
                } else {
                    window.location.href = adjustedHref;
                }
            });
        } else {
            link.className += ' breadcrumb-current';
        }
        
        breadcrumb.appendChild(link);
        
        if (index < items.length - 1) {
            const separator = document.createElement('span');
            separator.textContent = ' / ';
            separator.className = 'breadcrumb-separator';
            breadcrumb.appendChild(separator);
        }
    });
}

// ==========================================================================
// EVENT LISTENERS GLOBAIS
// ==========================================================================

/**
 * Inicialização quando o DOM estiver carregado
 */
document.addEventListener('DOMContentLoaded', function() {
    log('DOM loaded, initializing app');
    
    // DEBUG: Mostra informações de path
    console.log('=== PATH DEBUG INFO ===');
    console.log('Window Location:', window.location.href);
    console.log('Pathname:', window.location.pathname);
    console.log('Origin:', window.location.origin);
    console.log('Detected Base Path:', CONFIG.basePath);
    console.log('Visualizations Path:', CONFIG.visualizationsPath);
    console.log('Available Visualizations:', CONFIG.availableVisualizations);
    
    // Inicializa navegação dos cards
    initializeCardNavigation();
    
    // Inicializa comportamentos globais
    initializeGlobalBehaviors();
    
    // Inicializa acessibilidade
    initializeAccessibility();
    
    log('App initialization complete');
});

/**
 * Inicializa navegação dos cards de visualização
 */
function initializeCardNavigation() {
    const vizCards = document.querySelectorAll('.viz-card:not(.coming-soon)');
    
    vizCards.forEach(card => {
        const vizType = card.getAttribute('data-viz');
        
        if (!vizType) {
            log('Card without data-viz attribute found', 'warn');
            return;
        }
        
        // DEBUG: Log do card encontrado
        console.log(`📋 Found card: ${vizType}`);
        
        // Click handler
        card.addEventListener('click', () => {
            log(`Card clicked: ${vizType}`);
            console.log(`🖱️ CLICK: Navegando para ${vizType}`);
            navigateToVisualization(vizType);
        });
        
        // Keyboard navigation
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateToVisualization(vizType);
            }
        });
        
        // Adiciona atributos de acessibilidade
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Abrir visualização: ${getVisualizationName(vizType)}`);
    });
    
    log(`Initialized navigation for ${vizCards.length} visualization cards`);
    console.log(`✅ ${vizCards.length} cards de visualização inicializados`);
}

/**
 * Inicializa comportamentos globais
 */
function initializeGlobalBehaviors() {
    // Smooth scroll para links internos
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Handler para links externos
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.setAttribute('rel', 'noopener noreferrer');
    });
    
    // Keyboard shortcuts globais
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + H para voltar à home
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            navigateToHome();
        }
        
        // Escape para fechar notificações
        if (e.key === 'Escape') {
            const notification = document.querySelector('.notification');
            if (notification) {
                notification.remove();
            }
        }
    });
}

/**
 * Inicializa recursos de acessibilidade
 */
function initializeAccessibility() {
    // Adiciona skip link se não existir
    if (!document.querySelector('.skip-link')) {
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.textContent = 'Pular para o conteúdo principal';
        skipLink.className = 'skip-link sr-only';
        skipLink.addEventListener('focus', () => {
            skipLink.classList.remove('sr-only');
        });
        skipLink.addEventListener('blur', () => {
            skipLink.classList.add('sr-only');
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    // Adiciona ID ao main se não existir
    const main = document.querySelector('main');
    if (main && !main.id) {
        main.id = 'main';
    }
    
    // Configura ARIA labels dinâmicos
    updateAriaLabels();
}

/**
 * Atualiza ARIA labels baseado no conteúdo
 */
function updateAriaLabels() {
    // Atualiza contadores para screen readers
    const vizGrid = document.querySelector('.viz-grid');
    if (vizGrid) {
        const totalCards = vizGrid.querySelectorAll('.viz-card:not(.coming-soon)').length;
        vizGrid.setAttribute('aria-label', `${totalCards} visualizações disponíveis`);
    }
}

/**
 * Obtém nome amigável da visualização
 */
function getVisualizationName(vizType) {
    const names = {
        'waffle-chart': 'Gráfico de Waffle',
        'bar-chart': 'Gráfico de Barras',
        'line-chart': 'Gráfico de Linhas',
        'pie-chart': 'Gráfico de Pizza',
        'scatter-plot': 'Gráfico de Dispersão',
        'heatmap': 'Mapa de Calor',
        'treemap': 'Treemap',
        'area-chart': 'Gráfico de Área',
        'histogram': 'Histograma',
        'box-plot': 'Box Plot',
        'network-graph': 'Gráfico de Rede'
    };
    
    return names[vizType] || vizType;
}

// ==========================================================================
// FUNÇÕES DE UTILITÁRIO PARA OUTRAS PÁGINAS
// ==========================================================================

/**
 * Função para detectar se estamos na homepage
 */
function isHomePage() {
    const pathname = window.location.pathname;
    return pathname === CONFIG.basePath || pathname === CONFIG.basePath + 'index.html';
}

/**
 * Função para detectar tipo de visualização atual
 */
function getCurrentVisualizationType() {
    const path = window.location.pathname;
    const match = path.match(/\/visualizations\/([^\/]+)\//);
    return match ? match[1] : null;
}

/**
 * Função para validar se um tipo de visualização é válido
 */
function isValidVisualizationType(vizType) {
    return CONFIG.availableVisualizations.includes(vizType);
}

// ==========================================================================
// EXPORTA FUNÇÕES PARA USO GLOBAL
// ==========================================================================

// Torna funções disponíveis globalmente
window.OddVizApp = {
    navigateToVisualization,
    navigateToHome,
    showNotification,
    createBreadcrumb,
    getVisualizationName,
    isHomePage,
    getCurrentVisualizationType,
    isValidVisualizationType,
    isDevelopmentVisualization,
    CONFIG
};

// Log de inicialização
log('Main.js loaded successfully');
