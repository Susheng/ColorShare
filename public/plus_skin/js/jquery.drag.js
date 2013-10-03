(function(b,h){function i(a,c){var d=a.nodeName.toLowerCase();if("area"===d){var d=a.parentNode,e=d.name;if(!a.href||!e||d.nodeName.toLowerCase()!=="map")return!1;d=b("img[usemap=#"+e+"]")[0];return!!d&&j(d)}return(/input|select|textarea|button|object/.test(d)?!a.disabled:"a"==d?a.href||c:c)&&j(a)}function j(a){return!b(a).parents().andSelf().filter(function(){return b.curCSS(this,"visibility")==="hidden"||b.expr.filters.hidden(this)}).length}b.ui=b.ui||{};b.ui.version||(b.extend(b.ui,{version:"1.8.15",
keyCode:{ALT:18,BACKSPACE:8,CAPS_LOCK:20,COMMA:188,COMMAND:91,COMMAND_LEFT:91,COMMAND_RIGHT:93,CONTROL:17,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,INSERT:45,LEFT:37,MENU:93,NUMPAD_ADD:107,NUMPAD_DECIMAL:110,NUMPAD_DIVIDE:111,NUMPAD_ENTER:108,NUMPAD_MULTIPLY:106,NUMPAD_SUBTRACT:109,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SHIFT:16,SPACE:32,TAB:9,UP:38,WINDOWS:91}}),b.fn.extend({propAttr:b.fn.prop||b.fn.attr,_focus:b.fn.focus,focus:function(a,c){return typeof a==="number"?this.each(function(){var d=
this;setTimeout(function(){b(d).focus();c&&c.call(d)},a)}):this._focus.apply(this,arguments)},scrollParent:function(){var a;a=b.browser.msie&&/(static|relative)/.test(this.css("position"))||/absolute/.test(this.css("position"))?this.parents().filter(function(){return/(relative|absolute|fixed)/.test(b.curCSS(this,"position",1))&&/(auto|scroll)/.test(b.curCSS(this,"overflow",1)+b.curCSS(this,"overflow-y",1)+b.curCSS(this,"overflow-x",1))}).eq(0):this.parents().filter(function(){return/(auto|scroll)/.test(b.curCSS(this,
"overflow",1)+b.curCSS(this,"overflow-y",1)+b.curCSS(this,"overflow-x",1))}).eq(0);return/fixed/.test(this.css("position"))||!a.length?b(document):a},zIndex:function(a){if(a!==h)return this.css("zIndex",a);if(this.length)for(var a=b(this[0]),c;a.length&&a[0]!==document;){c=a.css("position");if(c==="absolute"||c==="relative"||c==="fixed")if(c=parseInt(a.css("zIndex"),10),!isNaN(c)&&c!==0)return c;a=a.parent()}return 0},disableSelection:function(){return this.bind((b.support.selectstart?"selectstart":
"mousedown")+".ui-disableSelection",function(a){a.preventDefault()})},enableSelection:function(){return this.unbind(".ui-disableSelection")}}),b.each(["Width","Height"],function(a,c){function d(a,c,d,f){b.each(e,function(){c-=parseFloat(b.curCSS(a,"padding"+this,!0))||0;d&&(c-=parseFloat(b.curCSS(a,"border"+this+"Width",!0))||0);f&&(c-=parseFloat(b.curCSS(a,"margin"+this,!0))||0)});return c}var e=c==="Width"?["Left","Right"]:["Top","Bottom"],f=c.toLowerCase(),g={innerWidth:b.fn.innerWidth,innerHeight:b.fn.innerHeight,
outerWidth:b.fn.outerWidth,outerHeight:b.fn.outerHeight};b.fn["inner"+c]=function(a){if(a===h)return g["inner"+c].call(this);return this.each(function(){b(this).css(f,d(this,a)+"px")})};b.fn["outer"+c]=function(a,e){if(typeof a!=="number")return g["outer"+c].call(this,a);return this.each(function(){b(this).css(f,d(this,a,!0,e)+"px")})}}),b.extend(b.expr[":"],{data:function(a,c,d){return!!b.data(a,d[3])},focusable:function(a){return i(a,!isNaN(b.attr(a,"tabindex")))},tabbable:function(a){var c=b.attr(a,
"tabindex"),d=isNaN(c);return(d||c>=0)&&i(a,!d)}}),b(function(){var a=document.body,c=a.appendChild(c=document.createElement("div"));b.extend(c.style,{minHeight:"100px",height:"auto",padding:0,borderWidth:0});b.support.minHeight=c.offsetHeight===100;b.support.selectstart="onselectstart"in c;a.removeChild(c).style.display="none"}),b.extend(b.ui,{plugin:{add:function(a,c,d){var a=b.ui[a].prototype,e;for(e in d)a.plugins[e]=a.plugins[e]||[],a.plugins[e].push([c,d[e]])},call:function(a,c,b){if((c=a.plugins[c])&&
a.element[0].parentNode)for(var e=0;e<c.length;e++)a.options[c[e][0]]&&c[e][1].apply(a.element,b)}},contains:function(a,c){return document.compareDocumentPosition?a.compareDocumentPosition(c)&16:a!==c&&a.contains(c)},hasScroll:function(a,c){if(b(a).css("overflow")==="hidden")return!1;var d=c&&c==="left"?"scrollLeft":"scrollTop",e=!1;if(a[d]>0)return!0;a[d]=1;e=a[d]>0;a[d]=0;return e},isOverAxis:function(a,c,b){return a>c&&a<c+b},isOver:function(a,c,d,e,f,g){return b.ui.isOverAxis(a,d,f)&&b.ui.isOverAxis(c,
e,g)}}))})(jQuery);

(function(c,h){if(c.cleanData){var i=c.cleanData;c.cleanData=function(a){for(var b=0,d;(d=a[b])!=null;b++)c(d).triggerHandler("remove");i(a)}}else{var j=c.fn.remove;c.fn.remove=function(a,b){return this.each(function(){b||(!a||c.filter(a,[this]).length)&&c("*",this).add([this]).each(function(){c(this).triggerHandler("remove")});return j.call(c(this),a,b)})}}c.widget=function(a,b,d){var e=a.split(".")[0],f,a=a.split(".")[1];f=e+"-"+a;if(!d)d=b,b=c.Widget;c.expr[":"][f]=function(b){return!!c.data(b,
a)};c[e]=c[e]||{};c[e][a]=function(a,c){arguments.length&&this._createWidget(a,c)};b=new b;b.options=c.extend(!0,{},b.options);c[e][a].prototype=c.extend(!0,b,{namespace:e,widgetName:a,widgetEventPrefix:c[e][a].prototype.widgetEventPrefix||a,widgetBaseClass:f},d);c.widget.bridge(a,c[e][a])};c.widget.bridge=function(a,b){c.fn[a]=function(d){var e=typeof d==="string",f=Array.prototype.slice.call(arguments,1),g=this,d=!e&&f.length?c.extend.apply(null,[!0,d].concat(f)):d;if(e&&d.charAt(0)==="_")return g;
e?this.each(function(){var b=c.data(this,a),e=b&&c.isFunction(b[d])?b[d].apply(b,f):b;if(e!==b&&e!==h)return g=e,!1}):this.each(function(){var e=c.data(this,a);e?e.option(d||{})._init():c.data(this,a,new b(d,this))});return g}};c.Widget=function(a,b){arguments.length&&this._createWidget(a,b)};c.Widget.prototype={widgetName:"widget",widgetEventPrefix:"",options:{disabled:!1},_createWidget:function(a,b){c.data(b,this.widgetName,this);this.element=c(b);this.options=c.extend(!0,{},this.options,this._getCreateOptions(),
a);var d=this;this.element.bind("remove."+this.widgetName,function(){d.destroy()});this._create();this._trigger("create");this._init()},_getCreateOptions:function(){return c.metadata&&c.metadata.get(this.element[0])[this.widgetName]},_create:function(){},_init:function(){},destroy:function(){this.element.unbind("."+this.widgetName).removeData(this.widgetName);this.widget().unbind("."+this.widgetName).removeAttr("aria-disabled").removeClass(this.widgetBaseClass+"-disabled ui-state-disabled")},widget:function(){return this.element},
option:function(a,b){var d=a;if(arguments.length===0)return c.extend({},this.options);if(typeof a==="string"){if(b===h)return this.options[a];d={};d[a]=b}this._setOptions(d);return this},_setOptions:function(a){var b=this;c.each(a,function(a,c){b._setOption(a,c)});return this},_setOption:function(a,b){this.options[a]=b;a==="disabled"&&this.widget()[b?"addClass":"removeClass"](this.widgetBaseClass+"-disabled ui-state-disabled").attr("aria-disabled",b);return this},enable:function(){return this._setOption("disabled",
!1)},disable:function(){return this._setOption("disabled",!0)},_trigger:function(a,b,d){var e=this.options[a],b=c.Event(b);b.type=(a===this.widgetEventPrefix?a:this.widgetEventPrefix+a).toLowerCase();d=d||{};if(b.originalEvent)for(var a=c.event.props.length,f;a;)f=c.event.props[--a],b[f]=b.originalEvent[f];this.element.trigger(b,d);return!(c.isFunction(e)&&e.call(this.element[0],b,d)===!1||b.isDefaultPrevented())}}})(jQuery);

(function(b){b.widget("ui.mouse",{options:{cancel:":input,option",distance:1,delay:0},_mouseInit:function(){var a=this;this.element.bind("mousedown."+this.widgetName,function(b){return a._mouseDown(b)}).bind("click."+this.widgetName,function(c){if(!0===b.data(c.target,a.widgetName+".preventClickEvent"))return b.removeData(c.target,a.widgetName+".preventClickEvent"),c.stopImmediatePropagation(),!1});this.started=!1},_mouseDestroy:function(){this.element.unbind("."+this.widgetName)},_mouseDown:function(a){a.originalEvent=
a.originalEvent||{};if(!a.originalEvent.mouseHandled){this._mouseStarted&&this._mouseUp(a);this._mouseDownEvent=a;var c=this,d=a.which==1,e=typeof this.options.cancel=="string"?b(a.target).closest(this.options.cancel).length:!1;if(!d||e||!this._mouseCapture(a))return!0;this.mouseDelayMet=!this.options.delay;if(!this.mouseDelayMet)this._mouseDelayTimer=setTimeout(function(){c.mouseDelayMet=!0},this.options.delay);if(this._mouseDistanceMet(a)&&this._mouseDelayMet(a)&&(this._mouseStarted=this._mouseStart(a)!==
!1,!this._mouseStarted))return a.preventDefault(),!0;!0===b.data(a.target,this.widgetName+".preventClickEvent")&&b.removeData(a.target,this.widgetName+".preventClickEvent");this._mouseMoveDelegate=function(a){return c._mouseMove(a)};this._mouseUpDelegate=function(a){return c._mouseUp(a)};b(document).bind("mousemove."+this.widgetName,this._mouseMoveDelegate).bind("mouseup."+this.widgetName,this._mouseUpDelegate);a.preventDefault();return a.originalEvent.mouseHandled=!0}},_mouseMove:function(a){if(b.browser.msie&&
!(document.documentMode>=9)&&!a.button)return this._mouseUp(a);if(this._mouseStarted)return this._mouseDrag(a),a.preventDefault();if(this._mouseDistanceMet(a)&&this._mouseDelayMet(a))(this._mouseStarted=this._mouseStart(this._mouseDownEvent,a)!==!1)?this._mouseDrag(a):this._mouseUp(a);return!this._mouseStarted},_mouseUp:function(a){b(document).unbind("mousemove."+this.widgetName,this._mouseMoveDelegate).unbind("mouseup."+this.widgetName,this._mouseUpDelegate);if(this._mouseStarted)this._mouseStarted=
!1,a.target==this._mouseDownEvent.target&&b.data(a.target,this.widgetName+".preventClickEvent",!0),this._mouseStop(a);return!1},_mouseDistanceMet:function(a){return Math.max(Math.abs(this._mouseDownEvent.pageX-a.pageX),Math.abs(this._mouseDownEvent.pageY-a.pageY))>=this.options.distance},_mouseDelayMet:function(){return this.mouseDelayMet},_mouseStart:function(){},_mouseDrag:function(){},_mouseStop:function(){},_mouseCapture:function(){return!0}})})(jQuery);

(function(d){d.widget("ui.draggable",d.ui.mouse,{widgetEventPrefix:"drag",options:{addClasses:!0,appendTo:"parent",axis:!1,connectToSortable:!1,containment:!1,cursor:"auto",cursorAt:!1,grid:!1,handle:!1,helper:"original",iframeFix:!1,opacity:!1,refreshPositions:!1,revert:!1,revertDuration:500,scope:"default",scroll:!0,scrollSensitivity:20,scrollSpeed:20,snap:!1,snapMode:"both",snapTolerance:20,stack:!1,zIndex:!1},_create:function(){if(this.options.helper=="original"&&!/^(?:r|a|f)/.test(this.element.css("position")))this.element[0].style.position=
"relative";this.options.addClasses&&this.element.addClass("ui-draggable");this.options.disabled&&this.element.addClass("ui-draggable-disabled");this._mouseInit()},destroy:function(){if(this.element.data("draggable"))return this.element.removeData("draggable").unbind(".draggable").removeClass("ui-draggable ui-draggable-dragging ui-draggable-disabled"),this._mouseDestroy(),this},_mouseCapture:function(a){var c=this.options;if(this.helper||c.disabled||d(a.target).is(".ui-resizable-handle"))return!1;
this.handle=this._getHandle(a);if(!this.handle)return!1;d(c.iframeFix===!0?"iframe":c.iframeFix).each(function(){d('<div class="ui-draggable-iframeFix" style="background: #fff;"></div>').css({width:this.offsetWidth+"px",height:this.offsetHeight+"px",position:"absolute",opacity:"0.001",zIndex:1E3}).css(d(this).offset()).appendTo("body")});return!0},_mouseStart:function(a){var c=this.options;this.helper=this._createHelper(a);this._cacheHelperProportions();if(d.ui.ddmanager)d.ui.ddmanager.current=this;
this._cacheMargins();this.cssPosition=this.helper.css("position");this.scrollParent=this.helper.scrollParent();this.offset=this.positionAbs=this.element.offset();this.offset={top:this.offset.top-this.margins.top,left:this.offset.left-this.margins.left};d.extend(this.offset,{click:{left:a.pageX-this.offset.left,top:a.pageY-this.offset.top},parent:this._getParentOffset(),relative:this._getRelativeOffset()});this.originalPosition=this.position=this._generatePosition(a);this.originalPageX=a.pageX;this.originalPageY=
a.pageY;c.cursorAt&&this._adjustOffsetFromHelper(c.cursorAt);c.containment&&this._setContainment();if(this._trigger("start",a)===!1)return this._clear(),!1;this._cacheHelperProportions();d.ui.ddmanager&&!c.dropBehaviour&&d.ui.ddmanager.prepareOffsets(this,a);this.helper.addClass("ui-draggable-dragging");this._mouseDrag(a,!0);d.ui.ddmanager&&d.ui.ddmanager.dragStart(this,a);return!0},_mouseDrag:function(a,c){this.position=this._generatePosition(a);this.positionAbs=this._convertPositionTo("absolute");
if(!c){var b=this._uiHash();if(this._trigger("drag",a,b)===!1)return this._mouseUp({}),!1;this.position=b.position}if(!this.options.axis||this.options.axis!="y")this.helper[0].style.left=this.position.left+"px";if(!this.options.axis||this.options.axis!="x")this.helper[0].style.top=this.position.top+"px";d.ui.ddmanager&&d.ui.ddmanager.drag(this,a);return!1},_mouseStop:function(a){var c=!1;d.ui.ddmanager&&!this.options.dropBehaviour&&(c=d.ui.ddmanager.drop(this,a));if(this.dropped)c=this.dropped,this.dropped=
!1;if((!this.element[0]||!this.element[0].parentNode)&&this.options.helper=="original")return!1;if(this.options.revert=="invalid"&&!c||this.options.revert=="valid"&&c||this.options.revert===!0||d.isFunction(this.options.revert)&&this.options.revert.call(this.element,c)){var b=this;d(this.helper).animate(this.originalPosition,parseInt(this.options.revertDuration,10),function(){b._trigger("stop",a)!==!1&&b._clear()})}else this._trigger("stop",a)!==!1&&this._clear();return!1},_mouseUp:function(a){this.options.iframeFix===
!0&&d("div.ui-draggable-iframeFix").each(function(){this.parentNode.removeChild(this)});d.ui.ddmanager&&d.ui.ddmanager.dragStop(this,a);return d.ui.mouse.prototype._mouseUp.call(this,a)},cancel:function(){this.helper.is(".ui-draggable-dragging")?this._mouseUp({}):this._clear();return this},_getHandle:function(a){var c=!this.options.handle||!d(this.options.handle,this.element).length?!0:!1;d(this.options.handle,this.element).find("*").andSelf().each(function(){this==a.target&&(c=!0)});return c},_createHelper:function(a){var c=
this.options,a=d.isFunction(c.helper)?d(c.helper.apply(this.element[0],[a])):c.helper=="clone"?this.element.clone().removeAttr("id"):this.element;a.parents("body").length||a.appendTo(c.appendTo=="parent"?this.element[0].parentNode:c.appendTo);a[0]!=this.element[0]&&!/(fixed|absolute)/.test(a.css("position"))&&a.css("position","absolute");return a},_adjustOffsetFromHelper:function(a){typeof a=="string"&&(a=a.split(" "));d.isArray(a)&&(a={left:+a[0],top:+a[1]||0});if("left"in a)this.offset.click.left=
a.left+this.margins.left;if("right"in a)this.offset.click.left=this.helperProportions.width-a.right+this.margins.left;if("top"in a)this.offset.click.top=a.top+this.margins.top;if("bottom"in a)this.offset.click.top=this.helperProportions.height-a.bottom+this.margins.top},_getParentOffset:function(){this.offsetParent=this.helper.offsetParent();var a=this.offsetParent.offset();this.cssPosition=="absolute"&&this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0])&&(a.left+=
this.scrollParent.scrollLeft(),a.top+=this.scrollParent.scrollTop());if(this.offsetParent[0]==document.body||this.offsetParent[0].tagName&&this.offsetParent[0].tagName.toLowerCase()=="html"&&d.browser.msie)a={top:0,left:0};return{top:a.top+(parseInt(this.offsetParent.css("borderTopWidth"),10)||0),left:a.left+(parseInt(this.offsetParent.css("borderLeftWidth"),10)||0)}},_getRelativeOffset:function(){if(this.cssPosition=="relative"){var a=this.element.position();return{top:a.top-(parseInt(this.helper.css("top"),
10)||0)+this.scrollParent.scrollTop(),left:a.left-(parseInt(this.helper.css("left"),10)||0)+this.scrollParent.scrollLeft()}}else return{top:0,left:0}},_cacheMargins:function(){this.margins={left:parseInt(this.element.css("marginLeft"),10)||0,top:parseInt(this.element.css("marginTop"),10)||0,right:parseInt(this.element.css("marginRight"),10)||0,bottom:parseInt(this.element.css("marginBottom"),10)||0}},_cacheHelperProportions:function(){this.helperProportions={width:this.helper.outerWidth(),height:this.helper.outerHeight()}},
_setContainment:function(){var a=this.options;if(a.containment=="parent")a.containment=this.helper[0].parentNode;if(a.containment=="document"||a.containment=="window")this.containment=[a.containment=="document"?0:d(window).scrollLeft()-this.offset.relative.left-this.offset.parent.left,a.containment=="document"?0:d(window).scrollTop()-this.offset.relative.top-this.offset.parent.top,(a.containment=="document"?0:d(window).scrollLeft())+d(a.containment=="document"?document:window).width()-this.helperProportions.width-
this.margins.left,(a.containment=="document"?0:d(window).scrollTop())+(d(a.containment=="document"?document:window).height()||document.body.parentNode.scrollHeight)-this.helperProportions.height-this.margins.top];if(!/^(document|window|parent)$/.test(a.containment)&&a.containment.constructor!=Array){var a=d(a.containment),c=a[0];if(c){a.offset();var b=d(c).css("overflow")!="hidden";this.containment=[(parseInt(d(c).css("borderLeftWidth"),10)||0)+(parseInt(d(c).css("paddingLeft"),10)||0),(parseInt(d(c).css("borderTopWidth"),
10)||0)+(parseInt(d(c).css("paddingTop"),10)||0),(b?Math.max(c.scrollWidth,c.offsetWidth):c.offsetWidth)-(parseInt(d(c).css("borderLeftWidth"),10)||0)-(parseInt(d(c).css("paddingRight"),10)||0)-this.helperProportions.width-this.margins.left-this.margins.right,(b?Math.max(c.scrollHeight,c.offsetHeight):c.offsetHeight)-(parseInt(d(c).css("borderTopWidth"),10)||0)-(parseInt(d(c).css("paddingBottom"),10)||0)-this.helperProportions.height-this.margins.top-this.margins.bottom];this.relative_container=a}}else if(a.containment.constructor==
Array)this.containment=a.containment},_convertPositionTo:function(a,c){if(!c)c=this.position;var b=a=="absolute"?1:-1,f=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,e=/(html|body)/i.test(f[0].tagName);return{top:c.top+this.offset.relative.top*b+this.offset.parent.top*b-(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollTop():
e?0:f.scrollTop())*b),left:c.left+this.offset.relative.left*b+this.offset.parent.left*b-(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:(this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():e?0:f.scrollLeft())*b)}},_generatePosition:function(a){var c=this.options,b=this.cssPosition=="absolute"&&!(this.scrollParent[0]!=document&&d.ui.contains(this.scrollParent[0],this.offsetParent[0]))?this.offsetParent:this.scrollParent,f=/(html|body)/i.test(b[0].tagName),e=a.pageX,h=a.pageY;
if(this.originalPosition){var g;if(this.containment)this.relative_container?(g=this.relative_container.offset(),g=[this.containment[0]+g.left,this.containment[1]+g.top,this.containment[2]+g.left,this.containment[3]+g.top]):g=this.containment,a.pageX-this.offset.click.left<g[0]&&(e=g[0]+this.offset.click.left),a.pageY-this.offset.click.top<g[1]&&(h=g[1]+this.offset.click.top),a.pageX-this.offset.click.left>g[2]&&(e=g[2]+this.offset.click.left),a.pageY-this.offset.click.top>g[3]&&(h=g[3]+this.offset.click.top);
c.grid&&(h=c.grid[1]?this.originalPageY+Math.round((h-this.originalPageY)/c.grid[1])*c.grid[1]:this.originalPageY,h=g?!(h-this.offset.click.top<g[1]||h-this.offset.click.top>g[3])?h:!(h-this.offset.click.top<g[1])?h-c.grid[1]:h+c.grid[1]:h,e=c.grid[0]?this.originalPageX+Math.round((e-this.originalPageX)/c.grid[0])*c.grid[0]:this.originalPageX,e=g?!(e-this.offset.click.left<g[0]||e-this.offset.click.left>g[2])?e:!(e-this.offset.click.left<g[0])?e-c.grid[0]:e+c.grid[0]:e)}return{top:h-this.offset.click.top-
this.offset.relative.top-this.offset.parent.top+(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollTop():f?0:b.scrollTop()),left:e-this.offset.click.left-this.offset.relative.left-this.offset.parent.left+(d.browser.safari&&d.browser.version<526&&this.cssPosition=="fixed"?0:this.cssPosition=="fixed"?-this.scrollParent.scrollLeft():f?0:b.scrollLeft())}},_clear:function(){this.helper.removeClass("ui-draggable-dragging");this.helper[0]!=
this.element[0]&&!this.cancelHelperRemoval&&this.helper.remove();this.helper=null;this.cancelHelperRemoval=!1},_trigger:function(a,c,b){b=b||this._uiHash();d.ui.plugin.call(this,a,[c,b]);if(a=="drag")this.positionAbs=this._convertPositionTo("absolute");return d.Widget.prototype._trigger.call(this,a,c,b)},plugins:{},_uiHash:function(){return{helper:this.helper,position:this.position,originalPosition:this.originalPosition,offset:this.positionAbs}}});d.extend(d.ui.draggable,{version:"1.8.15"});d.ui.plugin.add("draggable",
"connectToSortable",{start:function(a,c){var b=d(this).data("draggable"),f=b.options,e=d.extend({},c,{item:b.element});b.sortables=[];d(f.connectToSortable).each(function(){var c=d.data(this,"sortable");c&&!c.options.disabled&&(b.sortables.push({instance:c,shouldRevert:c.options.revert}),c.refreshPositions(),c._trigger("activate",a,e))})},stop:function(a,c){var b=d(this).data("draggable"),f=d.extend({},c,{item:b.element});d.each(b.sortables,function(){if(this.instance.isOver){this.instance.isOver=
0;b.cancelHelperRemoval=!0;this.instance.cancelHelperRemoval=!1;if(this.shouldRevert)this.instance.options.revert=!0;this.instance._mouseStop(a);this.instance.options.helper=this.instance.options._helper;b.options.helper=="original"&&this.instance.currentItem.css({top:"auto",left:"auto"})}else this.instance.cancelHelperRemoval=!1,this.instance._trigger("deactivate",a,f)})},drag:function(a,c){var b=d(this).data("draggable"),f=this;d.each(b.sortables,function(){this.instance.positionAbs=b.positionAbs;
this.instance.helperProportions=b.helperProportions;this.instance.offset.click=b.offset.click;if(this.instance._intersectsWith(this.instance.containerCache)){if(!this.instance.isOver)this.instance.isOver=1,this.instance.currentItem=d(f).clone().removeAttr("id").appendTo(this.instance.element).data("sortable-item",!0),this.instance.options._helper=this.instance.options.helper,this.instance.options.helper=function(){return c.helper[0]},a.target=this.instance.currentItem[0],this.instance._mouseCapture(a,
!0),this.instance._mouseStart(a,!0,!0),this.instance.offset.click.top=b.offset.click.top,this.instance.offset.click.left=b.offset.click.left,this.instance.offset.parent.left-=b.offset.parent.left-this.instance.offset.parent.left,this.instance.offset.parent.top-=b.offset.parent.top-this.instance.offset.parent.top,b._trigger("toSortable",a),b.dropped=this.instance.element,b.currentItem=b.element,this.instance.fromOutside=b;this.instance.currentItem&&this.instance._mouseDrag(a)}else if(this.instance.isOver)this.instance.isOver=
0,this.instance.cancelHelperRemoval=!0,this.instance.options.revert=!1,this.instance._trigger("out",a,this.instance._uiHash(this.instance)),this.instance._mouseStop(a,!0),this.instance.options.helper=this.instance.options._helper,this.instance.currentItem.remove(),this.instance.placeholder&&this.instance.placeholder.remove(),b._trigger("fromSortable",a),b.dropped=!1})}});d.ui.plugin.add("draggable","cursor",{start:function(){var a=d("body"),c=d(this).data("draggable").options;if(a.css("cursor"))c._cursor=
a.css("cursor");a.css("cursor",c.cursor)},stop:function(){var a=d(this).data("draggable").options;a._cursor&&d("body").css("cursor",a._cursor)}});d.ui.plugin.add("draggable","opacity",{start:function(a,c){var b=d(c.helper),f=d(this).data("draggable").options;if(b.css("opacity"))f._opacity=b.css("opacity");b.css("opacity",f.opacity)},stop:function(a,c){var b=d(this).data("draggable").options;b._opacity&&d(c.helper).css("opacity",b._opacity)}});d.ui.plugin.add("draggable","scroll",{start:function(){var a=
d(this).data("draggable");if(a.scrollParent[0]!=document&&a.scrollParent[0].tagName!="HTML")a.overflowOffset=a.scrollParent.offset()},drag:function(a){var c=d(this).data("draggable"),b=c.options,f=!1;if(c.scrollParent[0]!=document&&c.scrollParent[0].tagName!="HTML"){if(!b.axis||b.axis!="x")if(c.overflowOffset.top+c.scrollParent[0].offsetHeight-a.pageY<b.scrollSensitivity)c.scrollParent[0].scrollTop=f=c.scrollParent[0].scrollTop+b.scrollSpeed;else if(a.pageY-c.overflowOffset.top<b.scrollSensitivity)c.scrollParent[0].scrollTop=
f=c.scrollParent[0].scrollTop-b.scrollSpeed;if(!b.axis||b.axis!="y")if(c.overflowOffset.left+c.scrollParent[0].offsetWidth-a.pageX<b.scrollSensitivity)c.scrollParent[0].scrollLeft=f=c.scrollParent[0].scrollLeft+b.scrollSpeed;else if(a.pageX-c.overflowOffset.left<b.scrollSensitivity)c.scrollParent[0].scrollLeft=f=c.scrollParent[0].scrollLeft-b.scrollSpeed}else{if(!b.axis||b.axis!="x")a.pageY-d(document).scrollTop()<b.scrollSensitivity?f=d(document).scrollTop(d(document).scrollTop()-b.scrollSpeed):
d(window).height()-(a.pageY-d(document).scrollTop())<b.scrollSensitivity&&(f=d(document).scrollTop(d(document).scrollTop()+b.scrollSpeed));if(!b.axis||b.axis!="y")a.pageX-d(document).scrollLeft()<b.scrollSensitivity?f=d(document).scrollLeft(d(document).scrollLeft()-b.scrollSpeed):d(window).width()-(a.pageX-d(document).scrollLeft())<b.scrollSensitivity&&(f=d(document).scrollLeft(d(document).scrollLeft()+b.scrollSpeed))}f!==!1&&d.ui.ddmanager&&!b.dropBehaviour&&d.ui.ddmanager.prepareOffsets(c,a)}});
d.ui.plugin.add("draggable","snap",{start:function(){var a=d(this).data("draggable"),c=a.options;a.snapElements=[];d(c.snap.constructor!=String?c.snap.items||":data(draggable)":c.snap).each(function(){var b=d(this),c=b.offset();this!=a.element[0]&&a.snapElements.push({item:this,width:b.outerWidth(),height:b.outerHeight(),top:c.top,left:c.left})})},drag:function(a,c){for(var b=d(this).data("draggable"),f=b.options,e=f.snapTolerance,h=c.offset.left,g=h+b.helperProportions.width,n=c.offset.top,o=n+b.helperProportions.height,
i=b.snapElements.length-1;i>=0;i--){var j=b.snapElements[i].left,l=j+b.snapElements[i].width,k=b.snapElements[i].top,m=k+b.snapElements[i].height;if(j-e<h&&h<l+e&&k-e<n&&n<m+e||j-e<h&&h<l+e&&k-e<o&&o<m+e||j-e<g&&g<l+e&&k-e<n&&n<m+e||j-e<g&&g<l+e&&k-e<o&&o<m+e){if(f.snapMode!="inner"){var p=Math.abs(k-o)<=e,q=Math.abs(m-n)<=e,r=Math.abs(j-g)<=e,s=Math.abs(l-h)<=e;if(p)c.position.top=b._convertPositionTo("relative",{top:k-b.helperProportions.height,left:0}).top-b.margins.top;if(q)c.position.top=b._convertPositionTo("relative",
{top:m,left:0}).top-b.margins.top;if(r)c.position.left=b._convertPositionTo("relative",{top:0,left:j-b.helperProportions.width}).left-b.margins.left;if(s)c.position.left=b._convertPositionTo("relative",{top:0,left:l}).left-b.margins.left}var t=p||q||r||s;if(f.snapMode!="outer"){p=Math.abs(k-n)<=e;q=Math.abs(m-o)<=e;r=Math.abs(j-h)<=e;s=Math.abs(l-g)<=e;if(p)c.position.top=b._convertPositionTo("relative",{top:k,left:0}).top-b.margins.top;if(q)c.position.top=b._convertPositionTo("relative",{top:m-b.helperProportions.height,
left:0}).top-b.margins.top;if(r)c.position.left=b._convertPositionTo("relative",{top:0,left:j}).left-b.margins.left;if(s)c.position.left=b._convertPositionTo("relative",{top:0,left:l-b.helperProportions.width}).left-b.margins.left}!b.snapElements[i].snapping&&(p||q||r||s||t)&&b.options.snap.snap&&b.options.snap.snap.call(b.element,a,d.extend(b._uiHash(),{snapItem:b.snapElements[i].item}));b.snapElements[i].snapping=p||q||r||s||t}else b.snapElements[i].snapping&&b.options.snap.release&&b.options.snap.release.call(b.element,
a,d.extend(b._uiHash(),{snapItem:b.snapElements[i].item})),b.snapElements[i].snapping=!1}}});d.ui.plugin.add("draggable","stack",{start:function(){var a=d(this).data("draggable").options,a=d.makeArray(d(a.stack)).sort(function(a,c){return(parseInt(d(a).css("zIndex"),10)||0)-(parseInt(d(c).css("zIndex"),10)||0)});if(a.length){var c=parseInt(a[0].style.zIndex)||0;d(a).each(function(a){this.style.zIndex=c+a});this[0].style.zIndex=c+a.length}}});d.ui.plugin.add("draggable","zIndex",{start:function(a,
c){var b=d(c.helper),f=d(this).data("draggable").options;if(b.css("zIndex"))f._zIndex=b.css("zIndex");b.css("zIndex",f.zIndex)},stop:function(a,c){var b=d(this).data("draggable").options;b._zIndex&&d(c.helper).css("zIndex",b._zIndex)}})})(jQuery);