new Vue({
   el: "#app",
   data: {
       total: 0,
       items: {},
       cart : {},
       newSearch: "",
       lastSearch: "",
       searchNum: null,
       start : ["sun", "mercury"]
   },
   methods: {
        addItem: function(value, key) {
            const cart = this.$data.cart;
            const items = this.$data.items;
            if(!cart[key]) {
                Vue.set(this.cart, key, value);
                this.cart[key].qty = 1;
                Vue.delete(this.items, key);
                this.total += value.Price;
                cart[key].availableQty--;
            }
        },
        delItem: function(key){
            Vue.delete(this.items, key);
        },
        dec: function(key) {
            const cart = this.$data.cart;

            this.total -= cart[key].Price;
            this.$data.cart[key].availableQty++;
            if (cart[key].availableQty === 1){
                Vue.set(this.items, key, cart[key]);
                Vue.delete(cart, key);
            }
        },
        random: function(object){
            var data = {search: object};
            this.$http.post('/random', data).then(response => {
                this.items = response.body;
                this.wikipedia(Object.keys(this.items));
            }, response => console.log("error") );
        },
        onSubmit: function(){
            var data = {search: this.lastSearch};
            this.newSearch = this.lastSearch;
            this.$http.post('/search', data).then(response => {
                if(response.body === "No Result"){
                    this.onStart(this.start);
                    this.searchNum = 0;
                }else{
                    this.items = response.body;
                    this.searchNum = Object.keys(this.items).length;
                    this.wikipedia(Object.keys(this.items));
                }
            }, response => console.log("error") );
        },
        wikipedia: function(key){
            var url = "https://en.wikipedia.org/w/api.php?action=opensearch&prop=pageimages&limit=1&format=json&callback=?&search=" + this.items[key].Name;
            var img = 'https://en.wikipedia.org/w/api.php?action=query&origin=*&titles='+this.items[key].Name+'&prop=pageimages&format=json&pithumbsize=400';
            var items = this.items
    
            $.getJSON(url, function(data) {
                if(!items[key].Info) items[key].Info = data[2][0];
                if(!items[key].wikipedia) items[key].wikipedia  = data[3][0];
                console.log(items[key].wikipedia)
            });

            $.getJSON(img, function(data) {
                console.log(data)
                if(!items[key].img) data.query.pages[Object.keys(data.query.pages)].thumbnail.source;
            });

        },
        onStart: function(search){
            search.forEach(function(element) {
                var data = {search: element}
                
                this.$http.post('/search', data).then(response => {
                    var key = Object.keys(response.body)[0];
                    Vue.set(this.items, key, response.body[key]);
                }, response => console.log("error") );
            }, this);
        }
   },
   filters: {
       currency: price => "$".concat(price.toLocaleString())
   },
   mounted: function() {
        this.onStart(this.start);
   }
});

