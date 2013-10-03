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
        sendfile($(ui.draggable).attr('name'), 'technicolor');
      }
    });
});
