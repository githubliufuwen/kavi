let kaviConfig = {
    baseUrl:'http://localhost:8080/kavi',
    kong:'/kong',
    admin:'/admin',
    kongUrl:function (){
        return this.baseUrl+this.kong;
    },
    adminUrl:function (){
        return this.baseUrl+this.admin;
    }
}

function getGlobalConfig(){
    return kaviConfig;
}

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
