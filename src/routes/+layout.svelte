<script>
	import '../app.css';
	import { page } from '$app/stores';
  </script>
  
  <main class="bg-black min-h-screen flex flex-col items-center justify-start text-white p-5 relative">
	{#if $page.url.pathname !== '/'}
	  <a href="/" class="absolute font-bold top-5 left-5 text-white p-2 bg-gray-700 text-white rounded-md hover:bg-gray-600">
		Home
	</a>
	{/if}
	
	<slot />
  </main>