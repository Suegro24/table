const table = {
    data: [],
    currentData: [],
    loading: true,
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
            this.toggleLoading(false);
        })
        this.initSearch();
        this.initSort();
    },
    loadData: async function() {
        const response = await fetch('./getAllItems.json');
        const json = await response.json();
        this.data = json.items;
        this.currentData = json.items;
    },
    toggleLoading: function(state) {
        const loading = document.querySelector('#loading');
        if (state === false) {
            loading.style.display = 'none';
        }
        else {
            loading.style.display = 'block';
        }
    },
    createTable: function() {
        let table = `<tr>`;
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
                        <td>${this.currentData[i].steamVolume}</td>
                        <td>${this.currentData[i].prices.buff163.sourcePrice/100}</td>
                        <td>${this.currentData[i].prices.buff163.price/100}</th>
                        <td>${this.currentData[i].prices.csgotm_avg7.price/100}</td>
                        <td>${this.currentData[i].prices.waxpeer_avg7.price/100}</td>
                        <td>${this.currentData[i].prices.shadowpay_avg7.price/100}</td>
                        <td>${(this.currentData[i].prices.csgotm_avg7.price - this.currentData[i].prices.buff163.price)/100}</td>
                        <td>${(this.currentData[i].prices.waxpeer_avg7.price - this.currentData[i].prices.buff163.price)/100}</td>
                        <td>${(this.currentData[i].prices.shadowpay_avg7.price - this.currentData[i].prices.buff163.price)/100}</td>
                        <td>${Math.round((this.currentData[i].prices.csgotm_avg7.price - this.currentData[i].prices.buff163.price)/this.currentData[i].prices.buff163.price * 100)}%</td>
                        <td>${Math.round((this.currentData[i].prices.waxpeer_avg7.price - this.currentData[i].prices.buff163.price)/this.currentData[i].prices.buff163.price * 100)}%</td>
                        <td>${Math.round((this.currentData[i].prices.shadowpay_avg7.price - this.currentData[i].prices.buff163.price)/this.currentData[i].prices.buff163.price * 100)}%</td>
                    </tr>
                `
                } catch(error) {
                    continue;
                }
            }
            const main = document.querySelector('#main');
            main.querySelector('.table').innerHTML = table;
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
        table.initSearch();
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
            // console.error(error);
            return 'Unknown';
        }
        
    }
}

table.run();