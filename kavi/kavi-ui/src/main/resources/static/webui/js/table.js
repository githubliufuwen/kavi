
function getTableRowId(element){
    let parent = getTableRow(element);
    let id = parent.attr('id')
    return id
}

function getTableRow(element){
    let ele = $(element)
    let parent = ele.parents('tr');
    return parent;
}