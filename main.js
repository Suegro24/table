const table = {
    data: [],
    currentData: [],
    loading: true,
    medians: [{
            name: 'Profit TM',
            median: 0
        },
        {
            name: 'Profit WAX',
            median: 0
        },
        {
            name: 'Profit Shadow',
            median: 0
        }],
    headers: [{
        name: 'Item',
        sort: 'unsorted',
        index: 0
    },
    {
        name: 'Volume',
        sort: 'unsorted',
        index: 1
    },
    {
        name: 'BUFF (¥)',
        sort: 'unsorted',
        index: 2
    },
    {
        name: 'BUFF ($)',
        sort: 'unsorted',
        index: 3
    },
    {
        name: 'TM ($)',
        sort: 'unsorted',
        index: 4
    },
    {
        name: 'WAX ($)',
        sort: 'unsorted',
        index: 5
    },
    {
        name: 'Shadow ($)',
        sort: 'unsorted',
        index: 6
    },
    {
        name: 'Diff TM ($)',
        sort: 'unsorted',
        index: 7
    },
    {
        name: 'Diff WAX ($)',
        sort: 'unsorted',
        index: 8
    },
    {
        name: 'Diff Shadow ($)',
        sort: 'unsorted',
        index: 9
    },
    {
        name: 'Profit TM',
        sort: 'unsorted',
        index: 10
    },
    {
        name: 'Profit WAX',
        sort: 'unsorted',
        index: 11
    },
    {
        name: 'Profit Shadow',
        sort: 'unsorted',
        index: 12
    }],
    run: async function() {
        await this.loadData().then(() => {
            this.createTable();
            this.createMedianContainer();
            this.toggleLoading(false);
        })
        this.initSearch();
        this.initSort();
        this.initFilterForm();
    },
    loadData: async function() {
        const response = await fetch('./getAllItems.json');
        const json = await response.json();
        json.items = json.items.filter(item => {
            return !item.name.toLowerCase().includes('sealed graffiti') && !item.name.toLowerCase().includes('sticker');
        })
        this.data = json.items;
        this.currentData = json.items;
        let medianValuesProfitTm = [];
        let medianValuesProfitWax = [];
        let medianValuesProfitShadow = [];
        this.currentData.map(function(value) {
            medianValuesProfitTm.push(table.getItemValueByHeaderIndex(value, 10));
            medianValuesProfitWax.push(table.getItemValueByHeaderIndex(value, 11));
            medianValuesProfitShadow.push(table.getItemValueByHeaderIndex(value, 12));
        })
        table.medians[0].median = Math.round(table.getMedian(medianValuesProfitTm)*100) + '%';
        table.medians[1].median = Math.round(table.getMedian(medianValuesProfitWax)*100) + '%';
        table.medians[2].median = Math.round(table.getMedian(medianValuesProfitShadow)*100) + '%';
    },
    toggleLoading: async function(state) {
        const loading = document.querySelector('#loading');
        if (state === false) {
            loading.style.display = 'none';
        }
        else {
            loading.style.display = 'block';
        }
    },
    createTable: function() {
        let table = `<tr class="fixed">`;
        for (let header of this.headers) {
            table += `
                <th>${header.name}</th>
            `
        }
        table += `</tr>`;
            for (let i = 0; i < this.currentData.length; i++) {
                try {
                    table += `
                    <tr>
                        <td>${this.currentData[i].name}</td>
                        <td>${this.currentData[i].steamVolume != 0 ? this.currentData[i].steamVolume : '-'}</td>
                        <td>${this.currentData[i].prices.buff163.sourcePrice  != 0 ? this.currentData[i].prices.buff163.sourcePrice/100 : '-'}</td>
                        <td>${this.currentData[i].prices.buff163.price != 0 ? this.currentData[i].prices.buff163.price/100 : '-'}</th>
                        <td>${this.currentData[i].prices.csgotm_avg7.price != 0 ? this.currentData[i].prices.csgotm_avg7.price/100 : '-'}</td>
                        <td>${this.currentData[i].prices.waxpeer_avg7.price != 0 ? this.currentData[i].prices.waxpeer_avg7.price/100 : '-'}</td>
                        <td>${this.currentData[i].prices.shadowpay_avg7.price != 0 ? this.currentData[i].prices.shadowpay_avg7.price/100 : '-'}</td>
                        <td>${(this.currentData[i].prices.csgotm_avg7.price - this.currentData[i].prices.buff163.price) != 0 ? (this.currentData[i].prices.csgotm_avg7.price - this.currentData[i].prices.buff163.price)/100 : '-'}</td>
                        <td>${(this.currentData[i].prices.waxpeer_avg7.price - this.currentData[i].prices.buff163.price) != 0 ? (this.currentData[i].prices.waxpeer_avg7.price - this.currentData[i].prices.buff163.price)/100 : '-'}</td>
                        <td>${(this.currentData[i].prices.shadowpay_avg7.price - this.currentData[i].prices.buff163.price) != 0 ? (this.currentData[i].prices.shadowpay_avg7.price - this.currentData[i].prices.buff163.price)/100 : '-'}</td>
                        <td>${Math.round((this.currentData[i].prices.csgotm_avg7.price - this.currentData[i].prices.buff163.price)/this.currentData[i].prices.buff163.price * 100) > -100 ? 
                            Math.round((this.currentData[i].prices.csgotm_avg7.price - this.currentData[i].prices.buff163.price)/this.currentData[i].prices.buff163.price * 100) + '%' : 
                            '-'
                        }</td>
                        <td>${Math.round((this.currentData[i].prices.waxpeer_avg7.price - this.currentData[i].prices.buff163.price)/this.currentData[i].prices.buff163.price * 100) > -100 ?
                            Math.round((this.currentData[i].prices.waxpeer_avg7.price - this.currentData[i].prices.buff163.price)/this.currentData[i].prices.buff163.price * 100) + '%' :
                            '-'
                        }</td>
                        <td>${Math.round((this.currentData[i].prices.shadowpay_avg7.price - this.currentData[i].prices.buff163.price)/this.currentData[i].prices.buff163.price * 100) > -100 ? 
                            Math.round((this.currentData[i].prices.shadowpay_avg7.price - this.currentData[i].prices.buff163.price)/this.currentData[i].prices.buff163.price * 100) + '%' :
                            '-'
                        }</td>
                    </tr>
                `
                } catch(error) {
                    continue;
                }
            }
            const main = document.querySelector('#main');
            main.querySelector('.table').innerHTML = table;
    },
    createMedianContainer: function() {
        const medianContainer = document.querySelector('.medianContainer');
        let min = table.medians[0];
        let max = table.medians[0];
        table.medians.map(median => {
            if (median.median < min.median) min = median;
            if (median.median > max.median) max = median;
        })
        let medianList = `
            <ul>
                <li class="${min.name === table.medians[0].name ? 'background-red' : max.name === table.medians[0].name ? 'background-green' : ''}">${table.medians[0].name}: ${table.medians[0].median}</li>
                <li class="${min.name === table.medians[1].name ? 'background-red' : max.name === table.medians[1].name ? 'background-green' : ''}">${table.medians[1].name}: ${table.medians[1].median}</li>
                <li class="${min.name === table.medians[2].name ? 'background-red' : max.name === table.medians[2].name ? 'background-green' : ''}">${table.medians[2].name}: ${table.medians[2].median}</li>
            </ul>
        `
        medianContainer.innerHTML += medianList;
    },
    initSearch: function() {
        const search = document.querySelector('#search');
        ['change', 'paste', 'keyup'].forEach(evt => {
            search.addEventListener(`${evt}`, this.search, false);
        })
    },
    search: function() {
        const searchedText = document.querySelector('#search').value;
        table.currentData = table.data.filter(item => item.name.toLowerCase().includes(searchedText.toLowerCase()));
        table.createTable();
        table.initSort();
    },
    initSort: function() {
        const headers = document.querySelectorAll('.table tr th');
        headers.forEach((header, index) => {
            header.addEventListener('click', this.sort.bind(null, index), false);
        })
    },
    sort: async function(headerIndex) {
        let sortType = '';
        table.headers.forEach((header, index) => {
            if (index === headerIndex) {
                header.sort = header.sort === 'unsorted' ? 'desc' : header.sort === 'desc' ? 'asc' : 'desc';
                sortType = header.sort;
            }
            else {
                header.sort = 'unsorted';
            }  
        })

        async function quickSort(items, left, right, headerIndex, sortType) {
            var index;
            if (items.length > 1) {
                index = partition(items, left, right, headerIndex, sortType);
                if (left < index - 1) {
                    quickSort(items, left, index - 1, headerIndex, sortType);
                }
                if (index < right) {
                    quickSort(items, index, right, headerIndex, sortType);
                }
            }
            return items;
        }

        function partition(items, left, right, headerIndex) {
            var pivot = items[Math.floor((right + left) / 2)],
                i = left,
                j = right;
            while (i <= j) {
                if (sortType === 'desc') {
                    while (table.getItemValueByHeaderIndex(items[i], headerIndex) < table.getItemValueByHeaderIndex(pivot, headerIndex)) {
                        i++;
                    }

                    while (table.getItemValueByHeaderIndex(items[j], headerIndex) > table.getItemValueByHeaderIndex(pivot, headerIndex)) {
                        j--;
                    }
                } else {
                    while (table.getItemValueByHeaderIndex(items[i], headerIndex) > table.getItemValueByHeaderIndex(pivot, headerIndex)) {
                        i++;
                    }

                    while (table.getItemValueByHeaderIndex(items[j], headerIndex) < table.getItemValueByHeaderIndex(pivot, headerIndex)) {
                        j--;
                    }
                }
                if (i <= j) {
                    swap(items, i, j);
                    i++;
                    j--;
                }
            }
            return i;
        }

        function swap(items, leftIndex, rightIndex){
            var temp = items[leftIndex];
            items[leftIndex] = items[rightIndex];
            items[rightIndex] = temp;
        }
        table.toggleLoading(true);
        table.currentData = table.currentData.filter(item => table.getItemValueByHeaderIndex(item, headerIndex));
        await quickSort(table.currentData, 0, table.currentData.length - 1, headerIndex, sortType).then(result => {
            table.currentData = result;
            table.createTable();
            table.initSort();
            table.toggleLoading(false);
        })
    },
    getItemValueByHeaderIndex: function(item, index) {
        try {
            switch(index) {
                case 0: {
                    return item.name;
                }
                case 1: {
                    return item.steamVolume;
                }
                case 2: {
                    return item.prices.buff163.sourcePrice;
                }
                case 3: {
                    return item.prices.buff163.price;
                }
                case 4: {
                    return item.prices.csgotm_avg7.price;
                }
                case 5: {
                    return item.prices.waxpeer_avg7.price;
                }
                case 6: {
                    return item.prices.shadowpay_avg7.price;
                }
                case 7: {
                    return item.prices.csgotm_avg7.price - item.prices.buff163.price;
                }
                case 8: {
                    return item.prices.waxpeer_avg7.price -item.prices.buff163.price;
                }
                case 9: {
                    return item.prices.shadowpay_avg7.price - item.prices.buff163.price;
                }
                case 10: {
                    return ((item.prices.csgotm_avg7.price - item.prices.buff163.price)/item.prices.buff163.price);
                }
                case 11: {
                    return ((item.prices.waxpeer_avg7.price - item.prices.buff163.price)/item.prices.buff163.price);
                }
                case 12: {
                    return ((item.prices.shadowpay_avg7.price - item.prices.buff163.price)/item.prices.buff163.price)
                }
            }
        } catch(error) {
            return '-';
        }
        
    },
    getMedian: function(values){
        if(values.length === 0) return 
      
        values.sort(function(a,b){
          return a-b;
        });
      
        var half = Math.floor(values.length / 2);
        
        if (values.length % 2)
          return values[half];
        
        return (values[half - 1] + values[half]) / 2.0;
    },
    initFilterForm: function() {
        const form = document.querySelector('#filterForm');
        form.addEventListener('click', function(event) {
            event.preventDefault();
            const from = form.elements.namedItem('from').value;
            const to = form.elements.namedItem('to').value;
            if (!from || !to) return;
            table.currentData = table.currentData.filter(item => {
                return table.getItemValueByHeaderIndex(item, 3)/100 >= from && table.getItemValueByHeaderIndex(item, 3)/100 <= to
            })
            table.createTable();
            table.initSort();
        });
    },
}

table.run();