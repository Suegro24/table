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
        name: 'Liquidity',
        sort: 'unsorted',
        index: 2
    },
    {
        name: 'BUFF',
        sort: 'unsorted',
        index: 3
    },
    {
        name: 'TM',
        sort: 'unsorted',
        index: 4
    },
    {
        name: 'WAX',
        sort: 'unsorted',
        index: 5
    },
    {
        name: 'Profit TM',
        sort: 'unsorted',
        index: 6
    },
    {
        name: 'Profit WAX',
        sort: 'unsorted',
        index: 7
    },
    {
        name: 'Avg. TM/WAX',
        sort: 'unsorted',
        index: 8
    }],
    run: async function() {
        await this.loadData().then(() => {
            this.createTable();
            this.initSearch();
            this.initSort();
            this.initFilterForm();
            this.initFileForm();
            this.toggleLoading(false);
        })
    },
    loadData: async function() {
        await fetch('https://api.pricempire.com/v1/getAllItems?token=f8155bd3-91f5-4279-9e93-52d166ab71e5&source=buff163%2Ccsgotm_avg7%2Cwaxpeer_avg7%2Cshadowpay_avg7&currency=USD&fbclid=IwAR1vcquhpLO8HeNP9ZH-R_ks5sxCI5-qBnc-R2Ax27jdbmaVTP60tum0yFI')
            .then(res => {
                if (!res.ok) {
                    alert('Failed to load data, please try again later');
                }
                return res.json()
            })
            .then(data => {
                const json = data;
                json.items = json.items.filter(item => {
                    return !item.name.toLowerCase().includes('sealed graffiti') && !item.name.toLowerCase().includes('sticker');
                })
                table.data = json.items;
                table.currentData = json.items;
            })
            .catch(error => {
                console.error(error);
            })
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
                    const profitTM = Math.round((this.currentData[i].prices.csgotm_avg7.price - this.currentData[i].prices.buff163.price)/this.currentData[i].prices.buff163.price * 100);
                    const profitWAX = Math.round((this.currentData[i].prices.waxpeer_avg7.price - this.currentData[i].prices.buff163.price)/this.currentData[i].prices.buff163.price * 100);
                    /*const profitShadow = Math.round((this.currentData[i].prices.shadowpay_avg7.price - this.currentData[i].prices.buff163.price)/this.currentData[i].prices.buff163.price * 100);*/
                    const maxProfit = profitTM > profitWAX ? profitTM > profitShadow ? 'TM' : 'Shadow' : profitWAX > profitShadow ? 'WAX' : 'Shadow';
                    const minProfit = profitTM < profitWAX ? profitTM < profitShadow ? 'TM' : 'Shadow' : profitWAX < profitShadow ? 'WAX' : 'Shadow';
                    
                    const avgProfit = (profitTM + profitWAX) / 2;
                    table += `
                    <tr>
                        <td>${this.currentData[i].name}</td>
                        <td>${this.currentData[i].steamVolume != 0 ? this.currentData[i].steamVolume : '-'}</td>
                        <td>${Math.round(this.currentData[i].liquidity * 100)/100}</td>
                        <td>${this.currentData[i].prices.buff163.price != 0 ? (this.currentData[i].prices.buff163.price/100).toFixed(2) + '$' : '-'}</th>
                        <td>${this.currentData[i].prices.csgotm_avg7.price != 0 ? (this.currentData[i].prices.csgotm_avg7.price/100).toFixed(2) + '$' : '-'}</td>
                        <td>${this.currentData[i].prices.waxpeer_avg7.price != 0 ? (this.currentData[i].prices.waxpeer_avg7.price/100).toFixed(2) + '$' : '-'}</td>
                        <td class="${maxProfit === 'TM' ? 'background-green' : minProfit === 'TM' ? 'background-red' : ''}">${ profitTM > -100 ? profitTM + '% ' : '-'}(${(this.currentData[i].prices.csgotm_avg7.price - this.currentData[i].prices.buff163.price) != 0 ? ((this.currentData[i].prices.csgotm_avg7.price - this.currentData[i].prices.buff163.price)/100).toFixed(2) + '$' : '-'})</td>
                        <td class="${maxProfit === 'WAX' ? 'background-green' : minProfit === 'WAX' ? 'background-red' : ''}">${ profitWAX > -100 ? profitWAX + '% ' : '-'}(${(this.currentData[i].prices.waxpeer_avg7.price - this.currentData[i].prices.buff163.price) != 0 ? ((this.currentData[i].prices.waxpeer_avg7.price - this.currentData[i].prices.buff163.price)/100).toFixed(2) + '$' : '-'})</td>
                        <td>${avgProfit}%</td>
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
        ['change', 'keyup', 'paste'].forEach(evt => {
            search.addEventListener(`${evt}`, this.search, false);
        })
    },
    search: function() {
        const searchedText = document.querySelector('#search').value;
        if (searchedText.length === 0) {
            table.currentData = table.data
        }
        else if (searchedText.length < 3) {
            return;
        }
        else {
            table.currentData = table.data.filter(item => item.name.toLowerCase().includes(searchedText.toLowerCase()));
        }
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
        table.currentData = table.currentData.filter(item => typeof table.getItemValueByHeaderIndex(item, headerIndex) == 'string' || ( table.getItemValueByHeaderIndex(item, headerIndex) > -1 && isFinite(table.getItemValueByHeaderIndex(item, headerIndex)) && table.getItemValueByHeaderIndex(item, headerIndex) != 0));
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
                    return item.liquidity;
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
                    return ((item.prices.csgotm_avg7.price - item.prices.buff163.price)/item.prices.buff163.price);
                }
                case 7: {
                    return ((item.prices.waxpeer_avg7.price - item.prices.buff163.price)/item.prices.buff163.price);
                }
                case 8: {
                    const profitTM = Math.round((item.prices.csgotm_avg7.price - item.prices.buff163.price)/item.prices.buff163.price * 100);
                    const profitWAX = Math.round((item.prices.waxpeer_avg7.price - item.prices.buff163.price)/item.prices.buff163.price * 100);
                    return table.avgProfit([profitTM, profitWAX]);
                }
            }
        } catch(error) {
            return undefined;
        }
        
    },
    avgProfit: function(values){
        if(values.length === 0) return 
      
        values.sort(function(a,b){
          return a-b;
        });
      
        /*var half = Math.floor(values.length / 2);
        
        if (values.length % 2)
          return values[half];
        
        return (values[half - 1] + values[half]) / 2.0;*/
    },
    initFilterForm: function() {
        const forms = document.querySelectorAll('.filterForm');
        forms.forEach(form => {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                let result = table.data;
                forms.forEach((f, index) => {
                    const from = f.elements.namedItem('from').value;
                    const to = f.elements.namedItem('to').value;

                    if (!from || !to) return;
                    if (index == 0) {
                        result = result.filter(item => {
                            return table.getItemValueByHeaderIndex(item, 3)/100 >= from && table.getItemValueByHeaderIndex(item, 3)/100 <= to
                        })
                    } else if (index == 1) {
                        result = result.filter(item => {
                            return table.getItemValueByHeaderIndex(item, 1) >= from && table.getItemValueByHeaderIndex(item, 1) <= to
                        })
                    } else {
                        result = result.filter(item => {
                            return table.getItemValueByHeaderIndex(item, 8) >= from && table.getItemValueByHeaderIndex(item, 8) <= to
                        })
                    }
                })
                table.currentData = result;
                table.createTable();
                table.initSort();
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
                  if (!item.exterior) return item;
                  if (item.exterior.endsWith("\r")) {
                      item.exterior = item.exterior.slice(0, item.exterior.length - 2);
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
                    let isFound = false;
                    data.map(d => {
                        if (item.name.toLowerCase().includes(d.name.toLowerCase()) && (d.exterior && item.name.toLowerCase().includes(d.exterior.toLowerCase()))) {
                            isFound = true;
                            return;
                        }
                    })
                    if (isFound) return item;
                }) 
                table.createTable();
                table.initSort();
            };

            reader.readAsText(input);
        });
    }
}

table.run();