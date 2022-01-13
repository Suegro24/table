const table = {
    data: [],
    currentData: [],
    removedData: [],
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
        name: 'BUFF',
        sort: 'unsorted',
        index: 2
    },
    {
        name: 'TM',
        sort: 'unsorted',
        index: 3
    },
    {
        name: 'WAX',
        sort: 'unsorted',
        index: 4
    },
    {
        name: 'Profit TM',
        sort: 'unsorted',
        index: 5
    },
    {
        name: 'Profit WAX',
        sort: 'unsorted',
        index: 6
    },
    {
        name: 'Avg. TM/WAX',
        sort: 'unsorted',
        index: 7
    }],
    run: async function() {
        await fetch('https://api.pricempire.com/v1/getAllItems?token=f8155bd3-91f5-4279-9e93-52d166ab71e5&source=buff163%2Ccsgotm%2Cwaxpeer%2Cshadowpay&currency=USD&fbclid=IwAR1vcquhpLO8HeNP9ZH-R_ks5sxCI5-qBnc-R2Ax27jdbmaVTP60tum0yFI')
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                const errorMessage = 'Failed to load data, retrying...';
                throw new Error(errorMessage);
            }
        })
        .then(data => {
            const json = data;
            json.items = json.items.filter(item => {
                return !item.name.toLowerCase().includes('sealed graffiti') && !item.name.toLowerCase().includes('sticker') && !item.name.toLowerCase().includes('souvenir');
            })
            table.data = json.items.slice(0, 100);
            table.currentData = json.items.slice(0, 100);
            this.initAll();
        })
        .catch(() => {
            setTimeout(() => {
                this.run();
            }, 1000)
        })
    },
    initAll: function() {
        this.createTable();
        this.initSearch();
        this.initSort();
        this.initFilterForm();
        this.initFileForm();
        this.initResetDataButton();
        this.initRemoveButton();
        table.toggleLoading(false);
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
        const tableView = document.createElement('table');
        tableView.classList.add('table')

        const tableHeader = document.createElement('tr');
        tableHeader.classList.add('fixed');

        for (let header of this.headers) {
            const th = document.createElement('th');
            th.textContent = header.name;
            tableHeader.appendChild(th);
        }
        tableView.appendChild(tableHeader);
            for (let i = 0; i < this.currentData.length; i++) {
                try {
                    const profitTM = Math.round((this.getItemValueByHeaderIndex(table.currentData[i], 3) - table.currentData[i].prices.buff163.price)/table.currentData[i].prices.buff163.price * 100);
                    const profitWAX = Math.round((this.getItemValueByHeaderIndex(table.currentData[i], 4) - table.currentData[i].prices.buff163.price)/table.currentData[i].prices.buff163.price * 100);
                    const avgProfit = (profitTM + profitWAX) / 2;
                    const tr = document.createElement('tr');

                    this.currentData[i].index = i;

                    tr.classList.add('position-relative');
                    tr.dataset.index = i;
                    tr.dataset.state = 'showed';

                    tr.innerHTML = `                      
                        <td>${table.currentData[i].name}</td>
                        <td>${table.currentData[i].steamVolume != 0 ? table.currentData[i].steamVolume : '-'}</td>
                        <td>${table.currentData[i].prices.buff163.price != 0 ? (table.currentData[i].prices.buff163.price/100).toFixed(2) + '$' : '-'}</th>
                        <td>${this.getItemValueByHeaderIndex(table.currentData[i], 3) != 0 ? (this.getItemValueByHeaderIndex(table.currentData[i], 3)/100).toFixed(2) + '$' : '-'}</td>
                        <td>${this.getItemValueByHeaderIndex(table.currentData[i], 4) != 0 ? (this.getItemValueByHeaderIndex(table.currentData[i], 4)/100).toFixed(2) + '$' : '-'}</td>
                        <td class="${profitTM <= 25 ? 'background-red' : profitTM <= 40 ? 'background-yellow' : 'background-green'}">${ profitTM > -100 ? profitTM + '% ' : '-'}(${(this.getItemValueByHeaderIndex(table.currentData[i], 3) - table.currentData[i].prices.buff163.price) != 0 ? ((this.getItemValueByHeaderIndex(table.currentData[i], 3) - table.currentData[i].prices.buff163.price)/100).toFixed(2) + '$' : '-'})</td>
                        <td class="${profitWAX <= 25 ? 'background-red' : profitWAX <= 40 ? 'background-yellow' : 'background-green'}">${ profitWAX > -100 ? profitWAX + '% ' : '-'}(${(this.getItemValueByHeaderIndex(table.currentData[i], 4) - table.currentData[i].prices.buff163.price) != 0 ? ((this.getItemValueByHeaderIndex(table.currentData[i], 4) - table.currentData[i].prices.buff163.price)/100).toFixed(2) + '$' : '-'})</td>
                        <td>${avgProfit}%</td>
                        <button class="button button--red button-remove">X</button>`
                    tableView.appendChild(tr);
                } catch(error) {
                    continue;
                }
            }

            for (let i = 0; i < this.removedData.length; i++) {
                try {
                    const profitTM = Math.round((this.getItemValueByHeaderIndex(table.removedData[i], 3) - table.removedData[i].prices.buff163.price)/table.removedData[i].prices.buff163.price * 100);
                    const profitWAX = Math.round((this.getItemValueByHeaderIndex(table.removedData[i], 4) - table.removedData[i].prices.buff163.price)/table.removedData[i].prices.buff163.price * 100);
                    const avgProfit = (profitTM + profitWAX) / 2;
                    const tr = document.createElement('tr');

                    this.removedData[i].index = i;

                    tr.classList.add('position-relative', 'tr-hidden');
                    tr.dataset.index = i;
                    tr.dataset.state = 'removed';

                    tr.innerHTML = `                      
                        <td>${table.removedData[i].name}</td>
                        <td>${table.removedData[i].steamVolume != 0 ? table.removedData[i].steamVolume : '-'}</td>
                        <td>${table.removedData[i].prices.buff163.price != 0 ? (table.removedData[i].prices.buff163.price/100).toFixed(2) + '$' : '-'}</th>
                        <td>${this.getItemValueByHeaderIndex(table.removedData[i], 3) != 0 ? (this.getItemValueByHeaderIndex(table.removedData[i], 3)/100).toFixed(2) + '$' : '-'}</td>
                        <td>${this.getItemValueByHeaderIndex(table.removedData[i], 4) != 0 ? (this.getItemValueByHeaderIndex(table.removedData[i], 4)/100).toFixed(2) + '$' : '-'}</td>
                        <td class="${profitTM <= 25 ? 'background-red' : profitTM <= 40 ? 'background-yellow' : 'background-green'}">${ profitTM > -100 ? profitTM + '% ' : '-'}(${(this.getItemValueByHeaderIndex(table.removedData[i], 3) - table.removedData[i].prices.buff163.price) != 0 ? ((this.getItemValueByHeaderIndex(table.removedData[i], 3) - table.removedData[i].prices.buff163.price)/100).toFixed(2) + '$' : '-'})</td>
                        <td class="${profitWAX <= 25 ? 'background-red' : profitWAX <= 40 ? 'background-yellow' : 'background-green'}">${ profitWAX > -100 ? profitWAX + '% ' : '-'}(${(this.getItemValueByHeaderIndex(table.removedData[i], 4) - table.removedData[i].prices.buff163.price) != 0 ? ((this.getItemValueByHeaderIndex(table.removedData[i], 4) - table.removedData[i].prices.buff163.price)/100).toFixed(2) + '$' : '-'})</td>
                        <td>${avgProfit}%</td>
                        <button class="button button--red button-remove">X</button>`
                    tableView.appendChild(tr);
                } catch(error) {
                    continue;
                }
            }
            const main = document.querySelector('#main');
            main.innerHTML = '<div id="loading" class="loading"><div class="lds-ring"><div></div><div></div><div></div><div></div></div></div>';
            main.appendChild(tableView);
            table.toggleLoading(false);
    },
    initSearch: function() {
        const search = document.querySelector('#search');
        ['change', 'keyup', 'paste'].forEach(evt => {
            search.addEventListener(`${evt}`, this.search, false);
        })
    },
    search: function() {
        const searchedText = document.querySelector('#search').value;
        if (searchedText.length < 3) return;
        if (searchedText.length === 0) {
            table.currentData = table.data
        }
        else {
            table.currentData = table.data.filter(item => item.name.toLowerCase().includes(searchedText.toLowerCase()));
        }
        this.initAll();
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
        table.currentData = table.currentData.filter(item => typeof table.getItemValueByHeaderIndex(item, headerIndex) == 'string' || ( table.getItemValueByHeaderIndex(item, headerIndex) > -1 && isFinite(table.getItemValueByHeaderIndex(item, headerIndex)) && table.getItemValueByHeaderIndex(item, headerIndex) != 0));
        await quickSort(table.currentData, 0, table.currentData.length - 1, headerIndex, sortType).then(result => {
            table.currentData = result;
            table.initAll();
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
                    return item.prices.buff163.price;
                }
                case 3: {
                    return table.minOfValues(item.prices.csgotm.price, item.prices.csgotm_avg7.price, item.prices.csgotm_avg30.price, item.prices.csgotm_avg60.price, item.prices.csgotm_avg90.price);
                }
                case 4: {
                    return table.minOfValues(item.prices.waxpeer.price, item.prices.waxpeer_avg.price, item.prices.waxpeer_avg7.price, item.prices.waxpeer_avg30.price, item.prices.waxpeer_avg60.price, item.prices.waxpeer_avg90.price);
                }
                case 5: {
                    return ((table.getItemValueByHeaderIndex(item, 3) - item.prices.buff163.price)/item.prices.buff163.price);
                }
                case 6: {
                    return ((table.getItemValueByHeaderIndex(item, 4) - item.prices.buff163.price)/item.prices.buff163.price);
                }
                case 7: {
                    const profitTM = Math.round((table.getItemValueByHeaderIndex(item, 3) - item.prices.buff163.price)/item.prices.buff163.price * 100);
                    const profitWAX = Math.round((table.getItemValueByHeaderIndex(item, 4) - item.prices.buff163.price)/item.prices.buff163.price * 100);
                    return table.avgProfit([profitTM, profitWAX]);
                }
            }
        } catch(error) {
            return undefined;
        }
        
    },
    avgProfit: function(values){
        if(values.length === 0) return 

        let sum = 0;
        for (const value of values) {
            sum += value;
        }
        return sum/values.length;
    },
    initFilterForm: function() {
        const forms = document.querySelectorAll('.filterForm');
        forms.forEach(form => {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                let result = table.currentData;
                forms.forEach((f, index) => {
                    const from = f.elements.namedItem('from').value;
                    const to = f.elements.namedItem('to').value;

                    if (!from || !to) return;
                    if (index == 0) {
                        result = result.filter(item => {
                            return table.getItemValueByHeaderIndex(item, 2)/100 >= from && table.getItemValueByHeaderIndex(item, 2)/100 <= to
                        })
                    } else if (index == 1) {
                        result = result.filter(item => {
                            return table.getItemValueByHeaderIndex(item, 1) >= from && table.getItemValueByHeaderIndex(item, 1) <= to
                        })
                    } else {
                        result = result.filter(item => {
                            return table.getItemValueByHeaderIndex(item, 7) >= from && table.getItemValueByHeaderIndex(item, 7) <= to
                        })
                    }
                })
                table.currentData = result;
                initAll();
            });
        })
    },
    initFileForm: function() {
        const fileForm = document.getElementById("fileForm");
        const csvFile = document.getElementById("csvFile");

        const csvToArray = (str, delimiter = ',') => {
            const headers = str.slice(0, str.indexOf("\n")).toLowerCase().split(delimiter);
            const rows = str.slice(str.indexOf("\n") + 1).split("\n");

            let arr = rows.map(function (row) {
                const values = row.split(delimiter);
                const el = headers.reduce(function (object, header, index) {
                  object[header] = values[index];
                  return object;
                }, {});
                return el;
              });

              arr = arr.map(item => {
                  if (item.exterior && item.exterior.endsWith("\r")) {
                      item.exterior = item.exterior.slice(0, item.exterior.length - 2);
                  }
                  if (item.name && item.name.startsWith(`\"`)) {
                      item.name = item.name.slice(1, item.name.length - 2);
                  }
                  return item;
              })
              return arr
        }

        fileForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const input = csvFile.files[0];
            const reader = new FileReader();

            reader.onload = function (e) {
                const text = e.target.result
                const data = csvToArray(text);
                table.currentData = table.data.filter(item => {
                    let isStattrak = item.name.includes('StatTrak™');
                    for (const d of data) {
                        if (item.name.toLowerCase().includes(d.name.toLowerCase()) &&
                           (d.exterior && item.name.toLowerCase().includes(d.exterior.toLowerCase())) &&
                           ((isStattrak && d.name.includes("StatTrak™")) || !isStattrak)) {
                            return item;
                        }
                    }
                }) 
                initAll();
            };

            reader.readAsText(input);
        });
    },
    minOfValues: function(...values) {
        return Math.min(...values);
    },
    initResetDataButton: function() {
        const resetDataButton = document.querySelector('#resetDataButton');
        resetDataButton.addEventListener('click', this.resetData, false);
    },
    resetData: function() {
        table.currentData = table.data;
        this.initAll();
    },
    initRemoveButton: function() {
        const removeButtons = document.querySelectorAll('.button-remove');
        removeButtons.forEach(button => {
            const index = button.parentElement.dataset.index;
            const state = button.parentElement.dataset.state;
            button.addEventListener('click', this.toggleElement.bind(this, index, state), false)
        })
    },
    toggleElement: function(index, state) {
        if (state === 'showed') {
            this.removedData.push(this.currentData[index]);
            this.currentData.splice(index, 1);
        } else if (state === 'removed') {
            this.currentData.push(this.removedData[index]);
            this.removedData.splice(index, 1);
        }
        this.initAll();
    }
}


table.run();