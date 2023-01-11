let allServices = []
let baseUrl = getGlobalConfig().kongUrl();

$(function (){
    getAllService();

})
function getAllService(){
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
    allServices = data.data.sort(compare("created_at"));
    pagi(renderSerices,allServices)
}

$("#searchService").click(function() {
    let keyword = $("#searchInput").val()
    searchLocal(keyword);
})
function searchLocal(keyword){
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
        let name = sv.name+"";
        if(name.search(keyword)>0){
            hits.push(sv)
        }
    }
    pagi(renderSerices,hits);
}

function renderSerices (data){
    $("#servicesbody").empty();
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
        let tr = "<tr id=\""+sv.id+"\">" +
            "                        <td>" +
            "                            <a onclick=\"showRowview(this)\" data-toggle=\"modal\" data-target=\"#rowview\" href=\"#\" style=\"text-decoration: none;color: white\">" +
            "                                <i class=\"fa-eye fa\"></i>" +
            "                            </a>" +
            "                        </td>" +
            "                        <td>" +
            "                            <a href=\"#\" class=\"text text-success text-bold\">" +
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
            "                           <a class=\"btn btn-outline-success btn-sm\" href=\"#\" onclick='#'>" +
        "                                    <i class=\"fas fa-plug\">" +
        "                                   </i>" +
        "                                Plugins" +
        "                               </a>" +
            "                            <a class=\"btn btn-outline-danger btn-sm\" href=\"#\" onclick='deleteService(this)'>" +
            "                                <i class=\"fas fa-trash\">" +
            "                                </i>" +
            "                                Delete" +
            "                            </a>" +
            "                        </td>" +
            "                    </tr>";
        $("#servicesbody").append(tr);
    }
}
function showRowview(e){

    let id = getTableRowId(e);
    $.ajax({
        type:"get",
        url:baseUrl+"/services/"+id,
        dataType:"json",
        data:{
        },
        success:function (data) {
            let json = JSON.stringify(data,null,5)
            console.log(json)
            $("#rowview-text").text(JSON.stringify(data,null,4))
        }
    });
}


function deleteService(element){
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
             return
        }
        let id = getTableRowId(element)
        $.ajax({
            type:"delete",
            url:baseUrl+"/services/"+id,
            dataType:"json",
            data:{
            },
            success: function (data) {
                if(!data){
                    data = 'Delete success!'
                }
                toastr.success(data)
                getAllService();
            },
            error:function (e){
                let msg = e.responseText
                toastr.error(msg)
            }
        });
    })
}

