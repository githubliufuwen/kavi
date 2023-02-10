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

let DELETE_SUCCESS_TIP = "Delete Success!"
let EDIT_SUCCESS_TIP = "Edit Success!"
let ADD_SUCCESS_TIP = "Add Success!"
$(function () {
    //close cache
    $('input[type="text"]').attr("autocomplete",'off')

    $.ajaxSetup({
        contentType: "application/json;charset=UTF-8",
        error:function (e) {
            let msg = e.responseText
            toastr.error(msg)
        },
        dataType: 'json'
    })

})

/**
 * iframe config
 * @type {{iconMaximize: string, widget: string, useNavbarItems: boolean, autoIframeMode: boolean, loadingScreen: boolean, onTabClick: (function(*): *), autoDarkMode: boolean, autoItemActive: boolean, iconMinimize: string, onTabChanged: (function(*): *), scrollBehaviorSwap: boolean, autoShowNewTab: boolean, allowReload: boolean, scrollOffset: number, allowDuplicates: boolean, onTabCreated: (function(*): *)}}
 */
let iframeConfig = {
    onTabClick: function onTabClick(item) {
        return item;
    },
    onTabChanged: function onTabChanged(item) {
        return item;
    },
    onTabCreated: function onTabCreated(item) {
        return item;
    },
    autoIframeMode: true,
    autoItemActive: true,
    autoShowNewTab: true,
    autoDarkMode: true,
    allowDuplicates: false,
    allowReload: true,
    loadingScreen: false,
    useNavbarItems: true,
    scrollOffset: 40,
    scrollBehaviorSwap: false,
    iconMaximize: 'fa-expand',
    iconMinimize: 'fa-compress',
    widget: 'iframe'
}


let Route_detail = function RouteDetail(){
    let route_id =''
    let plugins = []
    RouteDetail._init = function (routeId){
        route_id = routeId
        $(document).on('click','a.del-plug',function (e) {
            let id = Table.getRowByChildElement(e.target).attr('id')
            KaviSwal(id,deletePlug)
        })
        $(document).on('click','a[data-target="#rawview"].route-plugin',function (e) {
            let id = Table.getRowByChildElement(e.target).attr('id')
            showRawPlugin(id)
        })
        //pull route data
        routePlugins()
        //get detail
        routeDetail()
    }
    function routeDetail() {
        $.ajax({
            type: 'get',
            url: kaviConfig.kongUrl+"/routes/"+route_id,
            success:function (data){
                //set title
                $("#detail-name-title").text(data.name)
                //set form
                setRouteForm(data)
            }
        })
    }

    function setRouteForm(data){
        console.log(data)
        $('#route-tags').tagsInput();
        $('#protocols').tagsInput();

        console.log(data)

    }

    function routePlugins(){
        $.ajax({
            url:kaviConfig.kongUrl+"/routes/"+route_id+"/plugins",
            type: 'get',
            success: function (data) {
                if(data !=null && data.data){
                    plugins = data.data.sort(compare('created_at'))
                }else{
                    plugins=[]
                }
                renderRoutePlgins();
            }
        })
    }
    function renderRoutePlgins() {
        $('#route-plugins tbody').empty();
        if(plugins.length==0){
            noData("route-plug-nodata")
            return
        }
        $.fn.bootstrapSwitch.defaults.size = 'mini';
        let html = "";
        for(let plug of plugins){
            let checked = plug.enabled?"checked":''
            html += "<tr id=\""+plug.id+"\">" +
                "         <td>" +
                "             <a data-toggle=\"modal\" class=\"route-plugin\" data-target=\"#rawview\" href=\"#\" style=\"text-decoration: none;color: white\">" +
                "                  <i class=\"fa fa-eye\"></i>" +
                "             </a>" +
                "            </td>" +
                "            <td>" +
                "               <a class=\"text text-success route-plugin-name\" href=\"#\">" +
                plug.name+
                "                </a>" +
                "                </td>" +
                "                 <td>" +
                "                  <input type=\"checkbox\" "+checked+" data-size=\"mini\" class=\"plug-switch\" data-off-color=\"danger\" data-on-color=\"success\">" +
                "                  </td>" +
                "                  <td class=\"\">" +
                "                    <a class=\"btn btn-outline-danger btn-xs del-plug\">" +
                "                        <i class=\"fa fa-trash\"></i>" +
                "                         Delete" +
                "                     </a>" +
                "                    </td>" +
                "            </tr>";
        }

        $('#route-plugins tbody').append(html);
        $("input.plug-switch").each(function(){
            $(this).bootstrapSwitch({
                state: $(this).prop('checked'),
                onSwitchChange: function (event,state){
                    let id = Table.getRowByChildElement(event.target).attr('id')
                    let plugin = findDataById(id,plugins)
                    if(plugin == null){
                        return false
                    }
                    //set enabled
                    plugin.enabled = state
                    //edit
                    editEnabled(plugin)

                }
            });
        })
    }

    //del plug
    function deletePlug(id) {
        $.ajax({
            type:'delete',
            url: kaviConfig.kongUrl+"/plugins/"+id,
            success: function (data) {
                if(!data){
                    data = DELETE_SUCCESS_TIP
                }
                toastr.success(data)
                routePlugins()
            }
        })
    }
    function editEnabled(plugin){
        $.ajax({
            type: 'PATCH',
            data: JSON.stringify(plugin),
            url: kaviConfig.kongUrl+"/routes/"+route_id+"/plugins/"+plugin.id,
            success: function (data) {
                toastr.success(EDIT_SUCCESS_TIP)
                routePlugins()
            },
            error: function (e) {
                let msg = e.responseText
                toastr.error(msg)
                //refresh
                routePlugins()
            }
        })
    }
    function showRawPlugin(id) {
        $.ajax({
            type:"get",
            url:kaviConfig.kongUrl+"/plugins/"+id,
            success: function (data) {
                $("#rawview-text").jsonViewer(data,jsonviewConfig)
            }
        });
    }
return RouteDetail
}()

/**
 * routes js
 * @type {any}
 */
let Route = function Route(){
    let SELECTOR_CLASS_TBODY = 'tbody.table-body'
    let allRoutes=[]
    Route._init = function (){
        /**
         * register events
         */
        $(document).on('click','a[data-target="#rawview"]',function (e) {
            let routeId = Table.getRowByChildElement(e.target).attr('id')
            showRawview(routeId)
        })
        $(document).on('click','a.tab-del',function (e) {
            let routeId = Table.getRowByChildElement(e.target).attr('id')
            KaviSwal(routeId, delroute)
        })
        $(document).on('click','a.route-name',function (e){
            let routeId = Table.getRowByChildElement(e.target).attr('id')
            window.location.href='./route_detail.html?id='+routeId
        })
        $(document).on('click','a.svc-name',function (e){
            let routeId = Table.getRowByChildElement(e.target).attr('id')
            let route = findDataById(routeId,allRoutes)
            window.location.href='./services_detail.html?id='+route.service.id
        })
        $("#searchRoutes").click(function() {
            let keyword = $("#searchInput").val()
            if(allRoutes.length==0){
                return
            }
            if(!keyword){
                pagi(renderRoutes,allRoutes)
                return
            }
            //search name
            let hits = []
            for(let item of allRoutes){
                let name = item.name+'';
                if(name.includes(keyword)){
                    hits.push(item)
                }
            }
            pagi(renderRoutes,hits);
        })

        //pull routes
        list();
    }
    function delroute(id) {
        $.ajax({
            type:"delete",
            url:kaviConfig.kongUrl+"/routes/"+id,
            success: function (data) {
                toastr.success(DELETE_SUCCESS_TIP)
                getAllRoutes();
            }
        });
    }
    function showRawview(id) {
        $.ajax({
            type:'get',
            url:kaviConfig.kongUrl+'/routes/'+id,
            success:function (data) {
                $("#rawview-text").jsonViewer(data,jsonviewConfig)
            }
        })
    }
    function list(){
        $.ajax({
            url:kaviConfig.kongUrl+"/services",
            type:'get',
            success: function (data) {
                getAllRoutes(data.data)
            }
        })
    }
    function getAllRoutes(services) {
        $.ajax({
            type:'get',
            url:kaviConfig.kongUrl+'/routes',
            param:{},
            success: function (data) {
                if(data && data.data){
                    allRoutes = data.data.sort(compare('created_at'))
                    if(services){
                        allRoutes.forEach(r=>{
                            let svc = findDataById(r.service.id,services)
                            if(svc){
                                r.service.name = svc.name
                            }
                        })
                    }
                }else {
                    allRoutes=[]
                }
                pagi(renderRoutes,allRoutes)
            },
            error: function (e) {
               renderRoutes([])
            }
        })
    }
    function renderRoutes (data){
        $(SELECTOR_CLASS_TBODY).empty();
        noData('tab-nodata',data && data.length>0?false:true)
        for (let i = 0; i < data.length; i++) {
            let item = data[i]
            let tag_html = "";
            if(item.tags && item.tags.length>0){
                for(let tag of item.tags){
                    tag_html += "<li class=\"list-inline-item\">" +
                        "<span class=\"badge badge-success\">"+tag+
                        "</span></li>";
                }
            }
            let paths_str = ''
            for(let path of item.paths){
                paths_str+=path+','
            }
            paths_str = paths_str.substring(0,paths_str.length-1)
            let stripPath = item.strip_path?"badge-success":"badge-danger";
            let tr = "<tr id=\""+item.id+"\">" +
                "                        <td>" +
                "                            <a data-toggle=\"modal\" data-target=\"#rawview\" href=\"#\" style=\"text-decoration: none;color: white\">" +
                "                                <i class=\"fa-eye fa\"></i>" +
                "                            </a>" +
                "                        </td>" +
                "                        <td>" +
                "                            <a href=\"#\"  class=\"text text-success text-bold route-name\">" +
                item.name +
                "                            </a>" +
                "                        </td>" +
                "                        <td>" +
                "                            <ul class=\"list-inline\">" +
                tag_html+
                "                            </ul>" +
                "                        </td>" +
                "                        <td>" +
                paths_str +
                "                        </td>" +
                "                        <td>"+
                "                           <a href=\"#\"  class=\"text text-success text-bold svc-name\">" +
                item.service.name +
                "                            </a>" +
                "                        </td>" +
                "                        <td>" +
                new Date(item.created_at*1000).format('yyyy/MM/dd')+
                "                        </td>"+
                "                        <td>" +
                "                            <a class=\"btn btn-outline-danger btn-xs tab-del\" href=\"#\">" +
                "                                <i class=\"fas fa-trash\">" +
                "                                </i>" +
                "                                Delete" +
                "                            </a>" +
                "                        </td>" +
                "                    </tr>";
            $(SELECTOR_CLASS_TBODY).append(tr);
        }
    }

    return Route
}()

/**
 * Services js
 * @type {any}
 */
let Service = function Service(){
    let allServices = []
    Service._init = function (){
        /**
         * register table events
         */
        $(document).on('click','a[data-target="#rawview"]',function (e) {
            showRawview(e.target)
        })
        $(document).on('click','a.sv-name',function (e) {
            serviceDetail(e.target)
        })
        $(document).on('click','a.sv-del',function (e) {
            // deleteService(e.target)
            KaviSwal(e.target,deleteService)
        })
        $(document).on('click','#svc-addnew',function (e) {
            //init tags input
            $('#svc-tags').tagsInput()
            $('#svc-ca_certificates').tagsInput()
            $('#svc-enabled').bootstrapSwitch()
        })
        $(document).on('click','#submitSvc',function (e) {
            KaviSwal(e.target,addService)

        })
        $("#searchService").click(function() {
            let keyword = $("#searchInput").val()
            if(allServices.length==0){
                return
            }
            if(!keyword){
                pagi(renderSerices,allServices)
                return
            }
            //search name
            let hits = []
            for(let sv of allServices){
                let name = sv.name+'';
                if(name.includes(keyword)){
                    hits.push(sv)
                }
            }
            pagi(renderSerices,hits);
        })
        //get service data
        Service.getAllService()
    }
    Service.getAllService = function getAllService(){
        $.ajax({
            type:"get",
            url: kaviConfig.kongUrl+"/services",
            success:function (data){
                if(data && data.data){
                    allServices = data.data.sort(compare("created_at"));
                }else{
                    allServices=[]
                }
                pagi(renderSerices,allServices)
            }
        });
    }

    /**
     * add new service
     */
    function addService() {
        let svc = getServiceFormData();
        $.ajax({
            type:'POST',
            url:kaviConfig.kongUrl+"/services",
            data:JSON.stringify(svc),
            success:function (data) {
                toastr.success(ADD_SUCCESS_TIP)
                Service.getAllService()
                //hide input form
                $('#addService').modal('hide')
                window.location.reload()
            }
        })
    }

    let SELECTOR_CLASS_TBODY = 'tbody.table-body'
    function renderSerices (data){
        $(SELECTOR_CLASS_TBODY).empty();
        noData('svc-nodata',data && data.length>0?false:true)
        for (let i = 0; i < data.length; i++) {
            let sv = data[i]
            let tag_html = "";
            if(sv.tags && sv.tags.length>0){
                for(let tag of sv.tags){
                    tag_html += "<li class=\"list-inline-item\">" +
                        "<span class=\"badge badge-success\">"+tag+
                        "</span></li>";
                }
            }
            let enabled = sv.enabled?"badge-success":"badge-danger";
            let tr = "<tr id=\""+sv.id+"\">" +
                "                        <td>" +
                "                            <a data-toggle=\"modal\" data-target=\"#rawview\" href=\"#\" style=\"text-decoration: none;color: white\">" +
                "                                <i class=\"fa-eye fa\"></i>" +
                "                            </a>" +
                "                        </td>" +
                "                        <td>" +
                "                            <a href=\"#\"  class=\"text text-success text-bold sv-name\">" +
                sv.name +
                "                            </a>" +
                "                        </td>" +
                "                        <td>" +
                "                            <ul class=\"list-inline\">" +
                tag_html+
                "                            </ul>" +
                "                        </td>" +
                "                        <td>" +
                                            sv.host +
                "                        </td>" +
                "                        <td>"+
                "                            <span class=\"badge "+enabled+"\">" +
                                             String(sv.enabled).toUpperCase() +
                "                            </span>" +
                "                        </td>" +
                "                        <td>" +
                new Date(sv.created_at*1000).format('yyyy/MM/dd')+
                "                        </td>"+
                "                        <td>" +
                "                            <a class=\"btn btn-outline-danger btn-xs sv-del\" href=\"#\">" +
                "                                <i class=\"fas fa-trash\">" +
                "                                </i>" +
                "                                Delete" +
                "                            </a>" +
                "                        </td>" +
                "                    </tr>";
            $(SELECTOR_CLASS_TBODY).append(tr);
        }
    }
    function showRawview(e){
        let id = Table.getRowByChildElement(e).attr('id');
        $.ajax({
            type:"get",
            url:kaviConfig.kongUrl+"/services/"+id,
            data:{
            },
            success:function (data) {
                $("#rawview-text").jsonViewer(data,jsonviewConfig)
            }
        });
    }
    function deleteService(element){
        let id = Table.getRowByChildElement(element).attr('id');
        $.ajax({
            type:"delete",
            url:kaviConfig.kongUrl+"/services/"+id,
            success: function (data) {
                if(!data){
                    data = DELETE_SUCCESS_TIP
                }
                toastr.success(data)
                Service.getAllService();
            }
        });
    }
    function serviceDetail(element){
        let id = Table.getRowByChildElement(element).attr('id');
        window.location.href="./services_detail.html?id="+id
    }
    return Service
}()

function getServiceFormData(){
    let svc = {};
    var enabledx = $('#svc-enabled').bootstrapSwitch('state')
    svc.enabled = enabledx;
    let svcname = $('#svc-name').val()
    svc.name = svcname.trim()
    let protocol = $('#svc-protocol').val()
    svc.protocol = protocol?protocol.trim():'http'
    let hostv = $('#svc-host').val()
    svc.host = hostv.trim()
    let port = $('#svc-port').val()
    svc.port =port?parseInt(port):80
    let path = $('#svc-path').val()
    svc.path=path?path.trim():null
    let tagsStr = $('#svc-tags').val()
    if(tagsStr){
        let tags = tagsStr.split(";")
        let tagsArr = new Array()
        for(let t of tags){
            if(t.trim()){
                tagsArr.push(t)
            }
        }
        svc.tags = tagsArr.length>0?tagsArr:null
    }
    let retry = $('#svc-retry').val()
    svc.retries=retry?parseInt(retry):0
    let ct = $('#svc-conn-timeout').val()
    svc.connect_timeout=ct?parseInt(ct):svc.connect_timeout
    let rt = $('#svc-read-timeout').val()
    svc.read_timeout= rt?parseInt(rt):svc.read_timeout
    let wt = $('#svc-write-timeout').val()
    svc.write_timeout=wt?parseInt(wt):svc.write_timeout
    let crtc = $('#svc-crt-client').val()
    svc.client_certificate=crtc?{id:crtc}:null
    let tlsv= $('#svc-tls-verify').val()
    svc.tls_verify=tlsv?tlsv.trim():null
    let tlsvd = $('#svc-tls_verify_depth').val()
    svc.tls_verify_depth=tlsvd?tlsvd.trim():null
    let crtsStr = $('#svc-ca_certificates').val()
    if(crtsStr){
        let crts = crtsStr.split(";")
        let crtArr = new Array()
        for(let c of crts){
            if(c.trim()){
                crtArr.push(c)
            }
        }
        svc.ca_certificates=crtArr.length>0?crtArr:null
    }
    let url = $('#svc-url').val()
    if(url){
        svc.url = url.trim()
    }
    return svc;
}

function KaviSwal(param,confirmFunc,cancelFunc) {
   Swal.fire({
        title: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#dc3545',
        background: '#19191A',
        reverseButtons: true
    }).then((result) => {
        if (!result.isConfirmed) {
            if(cancelFunc!= undefined){
                cancelFunc(param)
            }
            return
        }
        if(confirmFunc!=undefined)
        confirmFunc(param);
    })
}

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

/**
 * object compare  desc
 * @param field
 * @returns {function(*, *)}
 */
function compare(field){
    return function(m,n){
        let a = m[field];
        let b = n[field];
        return b-a;
    }
}

/**
 * jsonviewer config
 * @type {{withLinks: boolean, rootCollapsable: boolean, withQuotes: boolean}}
 */
let jsonviewConfig = {
    rootCollapsable: false,
    withQuotes: true,
    withLinks: false
}

let pagi = function Pagi(){
    /**
     *pagi constants
     */
    let SELECTOR_CLASS_PAGI_PRIVIOUS = '.pagi-previous'
    let SELECTOR_CLASS_PAGI_AFTER = '.pagi-after'
    let SELECTOR_CLASS_PAGI_PAGE = '.pagi-page'
    let SELECTOR_CLASS_PAGI_TOTAL = '.pagi-total'
    let SELECTOR_CLASS_PAGI_CURRENT = '.pagi-current'
    let SELECTOR_CLASS_PAGI_PERPAGE = '.pagi-perpage'

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
        current=1
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
        $('.pagi-info').empty()
        let pagi_total = "<i class=\"fa fa-shopping-bag\"></i>" +
            "                    Total items <span class = \"pagi-total text-danger\">0</span>," +
            "                    current page <span class=\"pagi-current text-danger\">1</span>," +
            "                    and <span class = \"pagi-perpage text-danger\">40</span> items per page."
        $('.pagi-info').append(pagi_total)
        $(".pagi").empty()
        let pagi = "<li class=\"page-item\"><a href=\"#\" class=\"page-link pagi-previous text-white\">&lt;</a></li>";
        for (let i=0;i<totalPages;i++){
            pagi += "<li class=\"page-item \"><a href=\"#\" class=\"page-link pagi-page text-white\">"+(i+1)+"</a></li>";
        }
        pagi +=" <li class=\"page-item\"><a href=\"#\" class=\"page-link pagi-after text-white\">&gt;</a></li>";
        $(".pagi").append(pagi)
    }
    //return pagi func
    return pagi;
}()
/**
 * no data function
 * @type {(function(eleId): void)|*}
 */
let noData = function NoData(eleId,show){
    let SELECTOR_NO_DATA  = "#"+eleId
    if(show==undefined || show == null){
        show = true
    }
    $(SELECTOR_NO_DATA).empty();
    if(!show){
        return
    }
    //clean and renders
    let html = '<div class="error-page">' +
        '                                <div class="error-content">' +
        '                                    <h4 class="text-secondary">' +
        '                                        <i class="fas fa-exclamation-triangle text-secondary"></i>' +
        '                                        Data Not Found' +
        '                                    </h4>' +
        '                                    <p>' +
        '                                        <svg t="1673697728909" class="icon" viewBox="0 0 1567 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3205" width="200" height="200"><path d="M156.662278 699.758173h21.097186A10.444152 10.444152 0 0 1 187.994733 710.202325c0 5.765172-4.490985 10.444152-10.235269 10.444152H156.662278v21.097186A10.444152 10.444152 0 0 1 146.218126 751.978932a10.277045 10.277045 0 0 1-10.444152-10.235269V720.646477H114.676787A10.444152 10.444152 0 0 1 104.441518 710.202325c0-5.765172 4.490985-10.444152 10.235269-10.444152H135.773974v-21.097187A10.444152 10.444152 0 0 1 146.218126 668.425717c5.765172 0 10.444152 4.490985 10.444152 10.235269v21.097187z m1378.628042-83.553215v-21.097186A10.277045 10.277045 0 0 0 1524.846168 584.872503a10.444152 10.444152 0 0 0-10.444152 10.235269v21.097186h-21.097186a10.277045 10.277045 0 0 0-10.235269 10.444152c0 5.598065 4.595427 10.444152 10.235269 10.444152h21.097186v21.097187c0 5.744284 4.67898 10.235269 10.444152 10.235268a10.444152 10.444152 0 0 0 10.444152-10.235268V637.093262h21.097187c5.744284 0 10.235269-4.67898 10.235268-10.444152a10.444152 10.444152 0 0 0-10.235268-10.444152H1535.29032zM776.460024 960.861969H250.596979A20.80475 20.80475 0 0 1 229.77134 939.973665c0-11.530344 9.462402-20.888304 20.825639-20.888303h94.728457A83.010119 83.010119 0 0 1 334.212859 877.413196v-605.96969A83.49055 83.49055 0 0 1 417.849627 187.994733H480.430984V167.001988A83.49055 83.49055 0 0 1 564.067752 83.553215h501.152182A83.448773 83.448773 0 0 1 1148.856702 167.001988v605.969689c0 15.185797-4.052331 29.410732-11.133466 41.672166h115.554096c11.551232 0 20.909192 9.274407 20.909192 20.888304 0 11.530344-9.295295 20.888304-20.888304 20.888304H1002.638576v20.992745c0 15.185797-4.052331 29.410732-11.133466 41.672166h11.196131c11.488567 0 20.825639 9.274407 20.825639 20.888303 0 11.530344-9.462402 20.888304-20.825639 20.888304h-109.893365c9.545955 16.000441 7.478013 36.972297-6.41271 50.863019a41.672166 41.672166 0 0 1-59.072122 0L776.460024 960.861969z m76.367638-41.776607h66.424806c22.977134 0 41.609501-18.59059 41.609501-41.881049V270.461756c0-22.559368-18.047494-40.690416-40.314426-40.690416H416.303892c-22.266932 0-40.314426 18.214601-40.314426 40.690416v606.742557c0 23.123352 18.799473 41.881049 41.588613 41.881049h317.084449l-10.736588-10.757477a41.693054 41.693054 0 0 1-10.861918-40.377091l-19.718558-19.739447A146.259902 146.259902 0 0 1 502.363703 627.693525a146.218126 146.218126 0 0 1 220.517822 190.981761l19.739447 19.739447a41.630389 41.630389 0 0 1 40.377091 10.841029L852.827662 919.085362zM1002.638576 814.643843h62.852906A41.797496 41.797496 0 0 0 1107.080095 772.867236V167.106429c0-23.14424-18.632367-41.776607-41.588613-41.776607H563.775316A41.797496 41.797496 0 0 0 522.207592 167.106429v20.888304h396.794216A83.448773 83.448773 0 0 1 1002.638576 271.443506V814.643843zM266.325872 46.998683h31.123572c8.773088 0 15.875111 6.955805 15.875111 15.666228 0 8.647758-7.102023 15.666228-15.875111 15.666228h-31.123572v31.123572c0 8.773088-6.955805 15.875111-15.666228 15.875111a15.770669 15.770669 0 0 1-15.666228-15.875111V78.331139H203.869844A15.728893 15.728893 0 0 1 187.994733 62.664911c0-8.647758 7.102023-15.666228 15.875111-15.666228h31.123572V15.875111c0-8.773088 6.955805-15.875111 15.666228-15.875111 8.647758 0 15.666228 7.102023 15.666228 15.875111v31.123572zM20.888304 939.973665c0-11.530344 9.462402-20.888304 20.825638-20.888303h125.455152c11.488567 0 20.825639 9.274407 20.825639 20.888303 0 11.530344-9.462402 20.888304-20.825639 20.888304H41.713942A20.80475 20.80475 0 0 1 20.888304 939.973665z m658.733544-135.021995a104.441518 104.441518 0 1 0-147.722083-147.722083 104.441518 104.441518 0 0 0 147.722083 147.722083zM459.542681 313.324555a20.888304 20.888304 0 0 1 20.867415-20.888304H710.202325a20.888304 20.888304 0 1 1 0 41.776608H480.430984A20.825639 20.825639 0 0 1 459.542681 313.324555z m0 104.441518c0-11.530344 9.295295-20.888304 20.742085-20.888303h334.505295c11.44679 0 20.742086 9.274407 20.742086 20.888303 0 11.530344-9.295295 20.888304-20.742086 20.888304H480.284766A20.762974 20.762974 0 0 1 459.542681 417.766073z m0 104.441519c0-11.530344 9.316183-20.888304 20.846527-20.888304h146.301679c11.509455 0 20.846527 9.274407 20.846527 20.888304 0 11.530344-9.316183 20.888304-20.846527 20.888303h-146.301679A20.80475 20.80475 0 0 1 459.542681 522.207592zM62.664911 396.87777a62.664911 62.664911 0 1 1 0-125.329822 62.664911 62.664911 0 0 1 0 125.329822z m0-31.332456a31.332456 31.332456 0 1 0 0-62.664911 31.332456 31.332456 0 0 0 0 62.664911zM1357.739739 271.547948a62.664911 62.664911 0 1 1 0-125.329822 62.664911 62.664911 0 0 1 0 125.329822z m0-31.332456a31.332456 31.332456 0 1 0 0-62.664911 31.332456 31.332456 0 0 0 0 62.664911z" fill="#8A96A3" p-id="3206"></path></svg>' +
        '                                    </p>' +
        '                                </div>' +
        '                            </div>';
    $(SELECTOR_NO_DATA).append(html)
}



/**
 * find data local
 * @param id
 * @param data
 * @returns {*}
 */
function findDataById(id,data) {
    for(let d of data){
        if(id == d.id){
            return d
        }
    }
}

/**service detail module*/
let ServiceDetail = function ServiceDetail() {
    let svcid = ''
    let plugins = []
    ServiceDetail._init= function (serviceId) {
        svcid = serviceId
        //init
        $(document).on('click','a[data-target="#rawview"].svc-plugin',function (e) {
            let id = Table.getRowByChildElement(e.target).attr('id')
            showRawPlugin(id)
        })
        $(document).on('click','a[data-target="#rawview"].svc-route',function (e) {
            let id = Table.getRowByChildElement(e.target).attr('id')
            showRawRoute(id)
        })
        $(document).on('click','a.del-svc-plug',function (e) {
            let id = Table.getRowByChildElement(e.target).attr('id')
            KaviSwal(id,deletePlug)
        })
        $(document).on('click','a.del-svc-routes',function (e) {
            let id = Table.getRowByChildElement(e.target).attr('id')
            KaviSwal(id,delroute)
        })
        $(document).on('click','#svc-edit-submit',function (e) {
            KaviSwal(e,submitEdit)
        })
        getServiceDetail()
        pullPlugins()
        pullRoutes();

    }
    function submitEdit(){
        let editSvc = getServiceFormData()
        $.ajax({
            type: 'patch',
            url:kaviConfig.kongUrl+"/services/"+svcid,
            data: JSON.stringify(editSvc),
            success: function (data) {
                toastr.success(EDIT_SUCCESS_TIP)
                getServiceDetail()
            }
        })
    }

    // service detail
    let svc = null;
    function getServiceDetail() {

        $.ajax({
            type: 'get',
            url:kaviConfig.kongUrl+"/services/"+svcid,
            success: function (data) {
                if(data!=null){
                    svc = data
                }
                setForm()
            }
        })
    }

    function setForm() {
        //title name
        $('#svc-detail-title-name').text(svc.name)
        $('#svc-enabled').bootstrapSwitch({
            state: svc==null?false:svc.enabled
        })

        $('#svc-name').val(svc.name)
        $('#svc-protocol').val(svc.protocol)
        $('#svc-host').val(svc.host)
        $('#svc-port').val(svc.port)
        $('#svc-path').val(svc.path)
        let tagsVal = ""
        if(svc.tags !=null){
            for(let tag of svc.tags){
                tagsVal += tag+';'
            }
            tagsVal = tagsVal.substring(0,tagsVal.length-1)
        }
        $('#svc-tags').val(tagsVal)
        $('#svc-tags').tagsInput();
        $('#svc-retry').val(svc.retries)
        $('#svc-conn-timeout').val(svc.connect_timeout)
        $('#svc-read-timeout').val(svc.read_timeout)
        $('#svc-write-timeout').val(svc.write_timeout)
        $('#svc-crt-client').val(svc.client_certificate?svc.client_certificate.id:'')
        $('#svc-tls-verify').val(svc.tls_verify)
        $('#svc-tls_verify_depth').val(svc.tls_verify_depth)
        let svcCrts = svc.ca_certificates
        let svcCrtStr = ""
        if(svcCrts){
            for(let crt of svcCrts){
                svcCrtStr+=crt+";"
            }
            svcCrtStr = svcCrtStr.substring(0,svcCrtStr.length)
        }
        $('#svc-ca_certificates').val(svcCrtStr)
        $('#svc-ca_certificates').tagsInput()
        $('#svc-url').val(svc.url)

    }

    function showRawPlugin(id) {
        $.ajax({
            type:"get",
            url:kaviConfig.kongUrl+"/plugins/"+id,
            success: function (data) {
                $("#rawview-text").jsonViewer(data,jsonviewConfig)
            }
        });
    }
    function pullPlugins() {
        plugins=[]
        $.ajax({
            type:"get",
            url:kaviConfig.kongUrl+"/services/"+svcid+"/plugins",
            success: function (data) {
                if(data!=null && data.data){
                    plugins = data.data.sort(compare('created_at'))
                }
                renderAllServicePlugins()
            },
            error: function (e) {
                let msg = e.responseText
                toastr.error(msg)
                //render empty
                renderAllServicePlugins()
            }
        });
    }
    function renderAllServicePlugins() {
        $('#svc-plugins tbody').empty();
        if(plugins.length==0){
            noData("svc-nodata-plug")
            return
        }
        $.fn.bootstrapSwitch.defaults.size = 'mini';
        let html = "";
        for(let svc_plug of plugins){
            let checked = svc_plug.enabled?"checked":''
            html += "<tr id=\""+svc_plug.id+"\">" +
                "         <td>" +
                "             <a data-toggle=\"modal\" class=\"svc-plugin\" data-target=\"#rawview\" href=\"#\" style=\"text-decoration: none;color: white\">" +
                "                  <i class=\"fa fa-eye\"></i>" +
                "             </a>" +
                "            </td>" +
                "            <td>" +
                "               <a class=\"text text-success svc-plugin-name\" href=\"#\">" +
                                    svc_plug.name+
                "                </a>" +
                "                </td>" +
                "                 <td>" +
                "                  <input type=\"checkbox\" "+checked+" data-size=\"mini\" class=\"svc-plug-switch\" data-off-color=\"danger\" data-on-color=\"success\">" +
                "                  </td>" +
                "                  <td class=\"\">" +
                "                    <a class=\"btn btn-outline-danger btn-xs del-svc-plug\">" +
                "                        <i class=\"fa fa-trash\"></i>" +
                "                         Delete" +
                "                     </a>" +
                "                    </td>" +
                "            </tr>";
        }

        $('#svc-plugins tbody').append(html);
        $("input.svc-plug-switch").each(function(){
            $(this).bootstrapSwitch({
                state: $(this).prop('checked'),
                onSwitchChange: function (event,state){
                    let id = Table.getRowByChildElement(event.target).attr('id')
                    let plugin = findDataById(id,plugins)
                    if(plugin == null){
                        return false
                    }
                    //set enabled
                    plugin.enabled = state
                    //edit
                    editEnabled(plugin);
                }
            });
        })
    }

    function editEnabled(plugin){
        $.ajax({
            type: 'PATCH',
            data: JSON.stringify(plugin),
            url: kaviConfig.kongUrl+"/services/"+svcid+"/plugins/"+plugin.id,
            success: function (data) {
                toastr.success(EDIT_SUCCESS_TIP)
                pullPlugins(svcid)
            },
            error: function (e) {
                let msg = e.responseText
                toastr.error(msg)
                //refresh
                pullPlugins(svcid)
            }
        })
    }

    /**routes*/
    let routes = []
    function pullRoutes() {
        routes=[]
        $.ajax({
            type:'get',
            url:kaviConfig.kongUrl+"/services/"+svcid+"/routes",
            success: function (data) {
                if(data !=null && data.data){
                    routes = data.data.sort(compare('created_at'))
                }
                //render
                renderAllRoutes()
            },
            error: function (e) {
                let msg = e.responseText
                toastr.error(msg)
                //refresh
                renderAllRoutes()
            }
        })
    }
    function renderAllRoutes() {
        $('#svc-routes tbody').empty();
        $(".svc-routes-total").text(routes.length)
        if (routes.length == 0) {
            noData("svc-nodata-routes")
            return
        }
        let html = "";
        for (let route of routes) {
            let path = route.paths[0]
            html += "<tr id=\"" + route.id + "\">" +
                "         <td>" +
                "             <a data-toggle=\"modal\" class=\"svc-route\" data-target=\"#rawview\" href=\"#\" style=\"text-decoration: none;color: white\">" +
                "                  <i class=\"fa fa-eye\"></i>" +
                "             </a>" +
                "            </td>" +
                "            <td>" +
                "               <a class=\"text text-success svc-plugin-name\" href=\"#\">" +
                                    route.name +
                "                </a>" +
                "                </td>" +
                "                <td>" +
                                    path +
                "                 </td>" +
                "                  <td>" +
                "                    <a class=\"btn btn-outline-danger btn-xs del-svc-routes \">" +
                "                        <i class=\"fa fa-trash\"></i>" +
                "                         Delete" +
                "                     </a>" +
                "                    </td>" +
                "            </tr>";
        }
        $("#svc-routes tbody").append(html)
    }
    function deletePlug(id) {
        $.ajax({
            type:'delete',
            url: kaviConfig.kongUrl+"/plugins/"+id,
            success: function (data) {
                if(!data){
                    data = DELETE_SUCCESS_TIP
                }
                toastr.success(data)
                pullPlugins(svcid)
            }
        })
    }
    function delroute(id) {
        $.ajax({
            type:"delete",
            url:kaviConfig.kongUrl+"/routes/"+id,
            success: function (data) {
                toastr.success(DELETE_SUCCESS_TIP)
                pullRoutes()
            }
        });
    }
    function showRawRoute(id) {
        $.ajax({
            type:"get",
            url:kaviConfig.kongUrl+"/routes/"+id,
            success: function (data) {
                $("#rawview-text").jsonViewer(data,jsonviewConfig)
            }
        });
    }
    return ServiceDetail
}()






