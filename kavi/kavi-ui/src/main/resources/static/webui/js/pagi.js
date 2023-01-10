
let total = 0
let data = []
let currnet = 1
let perPage = 20
let totalPages = 1

let renderData = null

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

function doRender(){
    renderTotal()
    if(total==0){
        return;
    }
    let data = pageData();
    renderData(data)
}

function pageData(){
    let st = (currnet-1)*perPage;
    let tmp = st+perPage;
    let ed = tmp>total-1?null:tmp;
    return ed==null?data.slice(st):data.slice(st,ed)
}

function bindingPagi(){
    $(".pagi-previous").click(function (e){
        if(currnet==1){
            return
        }
        currnet -= 1
        doRender()
    })
    $(".pagi-after").click(function (e){
        if(currnet==totalPages){
            return
        }
        currnet += 1
        doRender()
    })
    $(".pagi-page").click(function (e) {
        let target = $(e.target)
        let p = target.text()
        currnet = parseInt(p)
        doRender()
    })
}
function renderTotal(){
    $(".pagi-total").text(total);
    $(".pagi-current").text(currnet);

}

function countPages(){
    let p = total/perPage;
    p = Math.floor(p)
    let pages = total%perPage==0?p:p+1;
    //at least 1 page
    return pages==0?1:pages;
}

function renderPagi(){
    let pagi = "<li class=\"page-item\"><a href=\"#\" class=\"page-link pagi-previous\">&lt;</a></li>";
    for (let i=0;i<totalPages;i++){
        pagi += "<li class=\"page-item\"><a href=\"#\" class=\"page-link pagi-page\">"+(i+1)+"</a></li>";
    }
    pagi +=" <li class=\"page-item\"><a href=\"#\" class=\"page-link pagi-after\">&gt;</a></li>";
    $(".pagi").empty()
    $(".pagi").append(pagi)
}



