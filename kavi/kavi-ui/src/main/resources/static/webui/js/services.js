let CONST_ALL_SERVICE = "http://localhost:8080/kavi/kong/services";


let allServices = []
let totalService=0

function getAllService(baseUrl){
    $.ajax({
        type:"get",
        url:baseUrl+"/services",
        dataType:"json",
        data:{
        },
        success:services
    });
}
function services(data){
    if(data==null ||data.data.length==0){
        console.log("暂无service.")
        return
    }
    totalService = data.data.length;
    allServices = data.data.sort(compare("created_at"));
    renderSerices(allServices);
}


$("#searchService").click(function() {
    let keyword = $("#searchInput").val()
    searchLocal(keyword);
})

function searchReset(){
    totalService=allServices.length;
    renderSerices(allServices)
}

function searchLocal(keyword){
    if(allServices.length==0){
        return
    }
    if(!keyword){
        searchReset();
        return
    }
    //search name
    let hits = []
    for(let sv of allServices){
        let name = sv.name+"";
        if(name.search(keyword)>0){
            hits.push(sv)
        }
    }
    totalService = hits.length
    renderSerices(hits);
}
function clearService(){
    $("#servicesbody").empty();
}

function renderSerices (data){

    $("#totalService").text(totalService);
    clearService();
    if(data ==null || data.length==0){
        return
    }

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
        let tr = "<tr>" +
            "                        <td>" +
            "                            <a href=\"#\" style=\"text-decoration: none;color: white\">" +
            "                                <i class=\"fa-eye fa\"></i>" +
            "                            </a>" +
            "                        </td>" +
            "                        <td>" +
            "                            <a href=\"#\" style=\"font-weight: bold\">" +
                                            sv.name +
            "                            </a>" +
            "                        </td>" +
            "                        <td>" +
            "                            <ul class=\"list-inline\">" +
            "                                <li class=\"list-inline-item\">" +
            "                                    <span class=\"badge badge-danger\">" +
            "                                         <i class=\"fa fa-tags\"></i>" +
            "                                    </span>" +
            "                                </li>" +
                                                tag_html+
            "                            </ul>" +
            "                        </td>" +
            "                        <td class=\"project_progress\">" +
                                            sv.host +
            "                        </td>" +
            "                        <td>" +
            "                            <span class=\"badge badge-success\">" +
                                            sv.enabled +
            "                            </span>" +
            "                        </td>" +
            "                        <td>" +
                                            new Date(sv.created_at*1000).format('yyyy/MM/dd hh:mm:ss')+
            "                        </td>"+
            "                        <td class=\"project-actions text-right\">" +
            "                            <a class=\"btn btn-danger btn-sm\" href=\"#\">" +
            "                                <i class=\"fas fa-trash\">" +
            "                                </i>" +
            "                                Delete" +
            "                            </a>" +
            "                        </td>" +
            "                    </tr>";
        $("#servicesbody").append(tr);
    }
}
