$(document).ready(function(){
  $('.dragdir').draggable({
      cursor: 'hand',
      helper: 'clone'
  });
  $('.dragfile').draggable({
      cursor: 'hand',
      helper: 'clone'
  });
  $('.p_c_hs').droppable({
      drop: function( event, ui ) {
        //console.log($(ui.draggable).attr('name'));
        //begin to transfer file.
        if($(ui.draggable).prop("tagName")=="TR")
          shareFile($(ui.draggable).attr('name'),$(this).parent().attr('id'));
      }
    });
  var ajaxUpload = new AjaxUpload('newFile', {
    action: '/uploadfile',
    name: 'uploadfile',
    multiple: true,
    onSubmit : function(file, ext){
      console.log('Upload on Submit.');
      ajaxUpload._settings['action'] = '/uploadfile' + $('#currentPath').text();
    },  
    onComplete: function(file, response){
      console.log('Upload completed.');
      refreshDirectory($('#currentPath').text());
    }   
  }); 
});
