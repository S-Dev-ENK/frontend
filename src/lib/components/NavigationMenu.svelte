<script>
    import { page } from '$app/stores';
    
    // 활성 링크 확인을 위한 함수
    const isActive = (path) => $page.url.pathname === path;
</script>

<div class="flex items-center space-x-6">
    <a 
        href="/" 
        class="flex items-center space-x-1 {isActive('/') ? 'text-red-500' : 'text-gray-600'} hover:text-red-600"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span class="text-sm font-medium">Home</span>
    </a>
    
    <a 
        href="/api" 
        class="flex items-center space-x-1 {isActive('/api') ? 'text-gray-800' : 'text-gray-600'} hover:text-gray-800"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="7" height="7" x="14" y="3" rx="1"/>
            <rect width="7" height="7" x="3" y="3" rx="1"/>
            <rect width="7" height="7" x="14" y="14" rx="1"/>
            <rect width="7" height="7" x="3" y="14" rx="1"/>
        </svg>
        <span class="text-sm font-medium">API</span>
    </a>
    
    <a 
        href="/blog" 
        class="flex items-center space-x-1 {isActive('/blog') ? 'text-gray-800' : 'text-gray-600'} hover:text-gray-800"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span class="text-sm font-medium">Blog</span>
    </a>
    
    <a 
        href="/pricing" 
        class="flex items-center space-x-1 {isActive('/pricing') ? 'text-gray-800' : 'text-gray-600'} hover:text-gray-800"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
        </svg>
        <span class="text-sm font-medium">Pricing</span>
    </a>
</div>