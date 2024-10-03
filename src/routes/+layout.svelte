<script>
	import '../app.css';
	import { page } from '$app/stores';
</script>

<div class="min-h-screen flex flex-col bg-black text-white">
	{#if $page.url.pathname !== '/'}
		<nav class="bg-gray-900 p-4">
			<a href="/" class="font-bold text-white p-2 bg-gray-700 rounded-md hover:bg-gray-600">
				Home
			</a>
		</nav>
	{/if}
	
	<slot />
</div>