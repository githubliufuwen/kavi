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
        $(document).on('click','a[data-target="#rowview"]',function (e) {
            showRowview(e.target)
        })
        $(document).on('click','a.sv-name',function (e) {
            serviceDetail(e.target)
        })
        $(document).on('click','a.sv-del',function (e) {
            deleteService(e.target)
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
            dataType:"json",
            data:{
            },
            success:function (data){
                if(data==null ||data.data.length==0){
                    return
                }
                allServices = data.data.sort(compare("created_at"));
                pagi(renderSerices,allServices)
            }
        });
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
                "                            <a data-toggle=\"modal\" data-target=\"#rowview\" href=\"#\" style=\"text-decoration: none;color: white\">" +
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
                "                            <a class=\"btn btn-outline-danger btn-sm sv-del\" href=\"#\">" +
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
        let id = Table.getRowByChildElement(e).attr('id');
        $.ajax({
            type:"get",
            url:kaviConfig.kongUrl+"/services/"+id,
            dataType:"json",
            data:{
            },
            success:function (data) {
                $("#rowview-text").jsonViewer(data,jsonviewConfig)
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
            let id = Table.getRowByChildElement(element).attr('id');
            $.ajax({
                type:"delete",
                url:kaviConfig.kongUrl+"/services/"+id,
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
    function serviceDetail(element){
        let id = Table.getRowByChildElement(element).attr('id');
        window.location.href="./services_detail.html?id="+id
    }
    return Service
}()

