const table = {
    data: [],
    currentItemsLimit: 100,
    currentData: [],
    headers: [{
        name: 'name',
        sort: 'unsorted'
    },
    {
        name: 'steamVolume',
        sort: 'unsorted'
    },
    {
        name: 'buff163, sourcePrice',
        sort: 'unsorted'
    },
    {
        name: 'buff163, price',
        sort: 'unsorted'
    },
    {
        name: 'csgotm_avg7, price',
        sort: 'unsorted'
    },
    {
        name: 'waxpeer_avg7, price',
        sort: 'unsorted'
    },
    {
        name: 'shadowpay_avg7, price',
        sort: 'unsorted'
    },
    {
        name: 'csgotm_avg7, price - buff163, price',
        sort: 'unsorted'
    },
    {
        name: 'waxpeer_avg7, price - buff163, price',
        sort: 'unsorted'
    },
    {
        name: 'shadowpay_avg7, price - buff163, price',
        sort: 'unsorted'
    },
    {
        name: 'różnica 1 / cena buff price',
        sort: 'unsorted'
    },
    {
        name: 'różnica 2 / cena buff price',
        sort: 'unsorted'
    },
    {
        name: 'różnica 3 / cena buff price',
        sort: 'unsorted'
    }],
    run: async function() {
        await this.loadData().then(() => {
            this.createTable();
            this.toggleLoading();
        })
        this.initSearch();
        this.initSort();
    },
    loadData: async function() {
        const response = await fetch('./getAllItems.json');
        const json = await response.json();
        this.data = json.items;
        this.currentData = json.items.slice(0, table.currentItemsLimit)
    },
    toggleLoading: function() {
        const loading = document.querySelector('#loading');
        if (!loading) {
            const main = document.querySelector('#main');
            const loader = document.createElement('div');
            loader.className = 'loader';
            main.appendChild(loader);
        }
        else {
            loading.style.display = 'none';
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
            for (let i = 0; i < 100; i++) {
                try {
                    table += `
                    <tr>
                        <td>${this.currentData[i].name}</td>
                        <td>${this.currentData[i].steamVolume}</td>
                        <td>${this.currentData[i].prices.buff163.sourcePrice}</td>
                        <td>${this.currentData[i].prices.buff163.price}</th>
                        <td>${this.currentData[i].prices.csgotm_avg7.price}</td>
                        <td>${this.currentData[i].prices.waxpeer_avg7.price}</td>
                        <td>${this.currentData[i].prices.shadowpay_avg7.price}</td>
                        <td>${this.currentData[i].prices.csgotm_avg7.price - this.currentData[i].prices.buff163.price}</td>
                        <td>${this.currentData[i].prices.waxpeer_avg7.price - this.currentData[i].prices.buff163.price}</td>
                        <td>${this.currentData[i].prices.shadowpay_avg7.price - this.currentData[i].prices.buff163.price}</td>
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
    },
    initSort: function() {
        const headers = document.querySelectorAll('.table tr th');
        headers.forEach(header => {
            header.addEventListener('click', this.sort.bind(null, header.innerHTML), false);
        })
    },
    sort: function(name) {
        console.log('test');
        let sortType = '';
        table.headers.forEach(header => {
            if (header.name === name) {
                header.sort = header.sort === 'unsorted' ? 'desc' : header.sort === 'desc' ? 'asc' : 'desc';
                sortType = header.sort;
            }
            else {
                header.sort = 'unsorted';
            }  
        })

        const _mergeArrays = (a, b, sortType) => {
            const c = []
          
            while (a.length && b.length) {
                if (sortType === 'asc') {
                    c.push(a[0][name] > b[0][name] ? b.shift() : a.shift())
                }
                else {
                    c.push(a[0][name] < b[0][name] ? b.shift() : a.shift())
                }
            }
          
            while (a.length) {
              c.push(a.shift())
            }
            while (b.length) {
              c.push(b.shift())
            }
          
            return c
          }
          
          const mergeSort = (a, sortType) => {
            if (a.length < 2) return a
            const middle = Math.floor(a.length / 2)
            const a_l = a.slice(0, middle)
            const a_r = a.slice(middle, a.length)
            const sorted_l = mergeSort(a_l)
            const sorted_r = mergeSort(a_r)
            return _mergeArrays(sorted_l, sorted_r, sortType)
          }

          console.log(table.currentData);
          table.currentData = mergeSort(table.currentData, sortType);
          table.createTable();
          table.initSort();
          console.log(table.currentData);
    }
}

table.run();