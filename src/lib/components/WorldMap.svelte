<script>
    import { onMount } from 'svelte';
    import { geoPath, geoMercator, select, zoom as d3zoom } from 'd3';
    import { feature } from 'topojson-client';
    import { zoomIdentity } from 'd3-zoom';
    
    export let data = {};
    export let selectedCategory = 'phishing';
    
    const dummyData = {
        'United States': {
            phishing: { count: 245, percentage: 30 },
            smishing: { count: 180, percentage: 25 },
            qshing: { count: 120, percentage: 20 }
        },
        'China': {
            phishing: { count: 200, percentage: 25 },
            smishing: { count: 150, percentage: 20 },
            qshing: { count: 100, percentage: 15 }
        },
        'South Korea': {
            phishing: { count: 150, percentage: 20 },
            smishing: { count: 120, percentage: 15 },
            qshing: { count: 80, percentage: 10 }
        },
        'Japan': {
            phishing: { count: 100, percentage: 15 },
            smishing: { count: 90, percentage: 12 },
            qshing: { count: 60, percentage: 8 }
        },
        'Germany': {
            phishing: { count: 80, percentage: 10 },
            smishing: { count: 60, percentage: 8 },
            qshing: { count: 40, percentage: 5 }
        }
    };
    
    let mapContainer;
    let width = 1200;  // 지도 너비 증가
    let height = 500;  // 지도 높이 증가
    let worldData;
    let resetTimeout;
    let svg;
    let g;
    let zoomBehavior;
    let selectedCountry = null;
    let hoveredCountry = null;

    function resetMapPosition() {
        if (!svg || !zoomBehavior) return;
        svg.transition()
           .duration(750)
           .call(zoomBehavior.transform, zoomIdentity);
    }

    function handleInteraction() {
        if (resetTimeout) {
            clearTimeout(resetTimeout);
        }
        resetTimeout = setTimeout(resetMapPosition, 3000);
    }

    onMount(async () => {
        try {
            const response = await fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json');
            const topology = await response.json();
            worldData = feature(topology, topology.objects.countries);
            initializeMap();

            return () => {
                if (resetTimeout) {
                    clearTimeout(resetTimeout);
                }
            };
        } catch (error) {
            console.error('Failed to load map:', error);
        }
    });

    function getCountryColor(countryName) {
        const countryData = dummyData[countryName];
        if (!countryData) return '#e5e7eb';  // 기본 회색
        
        const data = countryData[selectedCategory];
        if (!data) return '#e5e7eb';

        if (selectedCountry === countryName || hoveredCountry === countryName) {
            return `rgba(220, 38, 38, ${data.percentage / 100})`; // 빨간색 계열
        }
        
        return `rgba(209, 213, 219, ${data.percentage / 100})`; // 회색 계열
    }

    function initializeMap() {
        svg = select(mapContainer)
            .append('svg')
            .attr('viewBox', `0 0 ${width} ${height}`)
            .attr('class', 'w-full h-full');

        g = svg.append('g');

        const projection = geoMercator()
            .scale(200)  // 스케일 증가
            .center([0, 30])  // 중심점 조정
            .translate([width / 2, height / 2]);

        const path = geoPath().projection(projection);

        zoomBehavior = d3zoom()
            .scaleExtent([1, 8])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
                handleInteraction();
            });

        svg.call(zoomBehavior);

        g.selectAll('path')
            .data(worldData.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('class', 'country')
            .attr('fill', d => getCountryColor(d.properties.name))
            .on('mouseover', function(event, d) {
                hoveredCountry = d.properties.name;
                select(this).style('fill', getCountryColor(d.properties.name));
                updateStats(d.properties.name);
            })
            .on('mouseout', function(event, d) {
                hoveredCountry = null;
                select(this).style('fill', getCountryColor(d.properties.name));
                if (!selectedCountry) {
                    updateStats(null);
                }
            })
            .on('click', function(event, d) {
                selectedCountry = selectedCountry === d.properties.name ? null : d.properties.name;
                g.selectAll('path').style('fill', p => getCountryColor(p.properties.name));
                updateStats(selectedCountry);
            });

        handleInteraction();
    }

    function updateStats(countryName) {
        const statsEl = document.getElementById('country-stats');
        if (!statsEl) return;
        
        if (!countryName || !dummyData[countryName]) {
            statsEl.innerHTML = '<div class="text-gray-500">국가를 선택하세요</div>';
            return;
        }

        const data = dummyData[countryName][selectedCategory];
        statsEl.innerHTML = `
            <div class="font-bold text-lg mb-2">${countryName}</div>
            <div class="grid grid-cols-2 gap-2">
                <span class="text-gray-500">탐지 건수:</span>
                <span class="font-semibold text-right">${data.count}건</span>
                <span class="text-gray-500">비율:</span>
                <span class="font-semibold text-right">${data.percentage}%</span>
            </div>
        `;
    }

    $: if (g) {
        g.selectAll('path')
            .transition()
            .duration(500)
            .attr('fill', d => getCountryColor(d.properties.name));
    }
</script>

<div class="grid grid-cols-4 gap-6 p-6 bg-white">
    <!-- 지도 영역 -->
    <div class="col-span-3">
        <div 
            bind:this={mapContainer} 
            class="w-full border rounded-lg shadow-sm bg-white"
            style="height: 700px;"
        >
            <div class="absolute top-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded shadow-sm">
                3초 후 초기 위치로 돌아갑니다
            </div>
        </div>
    </div>

    <!-- 통계 영역 -->
    <div class="space-y-4">
        <!-- 카테고리 선택 -->
        <div class="bg-white border rounded-lg overflow-hidden">
            {#each Object.keys(dummyData['United States']) as category}
                <button
                    class="w-full text-left px-4 py-3 border-b last:border-b-0
                        {selectedCategory === category ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}"
                    on:click={() => selectedCategory = category}
                >
                    {category}
                </button>
            {/each}
        </div>

        <!-- 국가별 탐지 순위 -->
        <div class="bg-white border rounded-lg p-4">
            <h3 class="text-lg font-semibold mb-3">국가별 {selectedCategory} 탐지 순위</h3>
            <div class="space-y-2">
                {#each Object.entries(dummyData).sort((a, b) => b[1][selectedCategory].count - a[1][selectedCategory].count) as [country, data]}
                    <div class="flex justify-between items-center p-2 {(selectedCountry === country || hoveredCountry === country) ? 'bg-gray-100 rounded' : ''}">
                        <span>{country}</span>
                        <span class="font-medium">{data[selectedCategory].count}건</span>
                    </div>
                {/each}
            </div>
        </div>

        <!-- 선택된 국가 정보 -->
        <div id="country-stats" class="bg-white border rounded-lg p-4">
            <div class="text-gray-500">국가를 선택하세요</div>
        </div>
    </div>
</div>

<style>
    .country {
        stroke: white;
        stroke-width: 0.5;
        transition: all 0.3s ease;
    }

    .country:hover {
        cursor: pointer;
    }

    button {
        transition: all 0.2s ease;
    }
</style>