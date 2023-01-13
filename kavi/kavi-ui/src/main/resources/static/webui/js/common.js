/**
 * global config
 */
let kaviConfig = function() {
    let conf = {
        kongUrl: this.origin + '/kavi/kong',
        adminUrl: this.origin + '/kavi/admin'
    }
   return conf
}()

Date.prototype.format = function(fmt) {
    let o = {
        "M+" : this.getMonth()+1,
        "d+" : this.getDate(),
        "h+" : this.getHours(),
        "m+" : this.getMinutes(),
        "s+" : this.getSeconds(),
        "q+" : Math.floor((this.getMonth()+3)/3),
        "S" : this.getMilliseconds()
    };
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(let k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}

function compare(field){
    return function(m,n){
        let a = m[field];
        let b = n[field];
        return b-a;
    }
}

let jsonviewConfig = function jsonviewerConfig(){
    let config = {
        rootCollapsable: false,
        withQuotes: true,
        withLinks: false
    }
    return config
}()

/**
 *pagi constants
 */
let SELECTOR_CLASS_PAGI_PRIVIOUS = '.pagi-previous'
let SELECTOR_CLASS_PAGI_AFTER = '.pagi-after'
let SELECTOR_CLASS_PAGI_PAGE = '.pagi-page'
let SELECTOR_CLASS_PAGI_TOTAL = '.pagi-total'
let SELECTOR_CLASS_PAGI_CURRENT = '.pagi-current'
let SELECTOR_CLASS_PAGI_PERPAGE = '.pagi-perpage'

let pagi = function Pagi(){
    let total = 0
    let data = []
    let current = 1
    let perPage = 40
    let totalPages = 1
    let renderData = null
    //public
    function pagi(func,alldata){
        data = alldata
        renderData = func
        total = data.length
        totalPages = countPages();
        //render pagi buttons
        renderPagi()
        //bind pagi click events
        bindingPagi()
        //render default page data
        doRender()
    }
    //private
    function doRender(){
        renderTotal()
        let data = pageData();
        renderData(data)
    }
    function pageData(){
        let st = (current-1)*perPage;
        let tmp = st+perPage;
        let ed = tmp>total-1?null:tmp;
        return ed==null?data.slice(st):data.slice(st,ed)
    }
    function bindingPagi(){
        $(SELECTOR_CLASS_PAGI_PRIVIOUS).click(function (e){
            if(current==1){
                return
            }
            current -= 1
            doRender()
        })
        $(SELECTOR_CLASS_PAGI_AFTER).click(function (e){
            if(current==totalPages){
                return
            }
            current += 1
            doRender()
        })
        $(SELECTOR_CLASS_PAGI_PAGE).click(function (e) {
            let target = $(e.target)
            let p = target.text()
            current = parseInt(p)
            doRender()
        })
    }
    function renderTotal(){
        $(SELECTOR_CLASS_PAGI_TOTAL).text(total);
        $(SELECTOR_CLASS_PAGI_CURRENT).text(current);
        $(SELECTOR_CLASS_PAGI_PERPAGE).text(perPage);

    }
    function countPages(){
        let p = total/perPage;
        p = Math.floor(p)
        let pages = total%perPage==0?p:p+1;
        //at least 1 page
        return pages==0?1:pages;
    }
    function renderPagi(){
        let pagi = "<li class=\"page-item\"><a href=\"#\" class=\"page-link pagi-previous text-white\">&lt;</a></li>";
        for (let i=0;i<totalPages;i++){
            pagi += "<li class=\"page-item\"><a href=\"#\" class=\"page-link pagi-page text-white\">"+(i+1)+"</a></li>";
        }
        pagi +=" <li class=\"page-item\"><a href=\"#\" class=\"page-link pagi-after text-white\">&gt;</a></li>";
        $(".pagi").empty()
        $(".pagi").append(pagi)
    }
    //return pagi func
    return pagi;
}()

/**
 * kavi data table
 */
let Table = function KaviTable(){

    // let  _proto = KaviTable.prototype
    KaviTable.getRowByChildElement = function (element){
        let ele = $(element)
        let parent = ele.parents('tr');
        return parent;
    }
    return KaviTable
}()
