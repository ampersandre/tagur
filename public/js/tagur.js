
var Tagur = (function() {
	function limitInput(target, limit, elem) {
        target.on("keyup focus", function() {
            setCount(target[0], elem);
        });
        function setCount(src, elem) {
            var chars = src.value.length;
            if (chars > limit) {
                src.value = src.value.substr(0, limit);
                chars = limit;
            }
            elem.html( limit - chars );
        }
        setCount(target[0], elem);
    }
	/* Scope each image comment instance to the specified image */
	var prepare = function(options) {
		/* Default Settings */
		var settings = {
			id: '',
			image: null,
			width: null,
			host: null,
			height: null,
			onCommentAdded: null,
			markerPosition: function(marker, x, y) {
				marker.css({ left:x-11, top:y-12 });
			},
			editorPosition: function(editor, x, y) {
                var width = imageWidth();
                var height = imageHeight();
				if (x >= width / 2 && y >= height / 2) { /* The marker is in the bottom-right of the image */
					editor.css({ top:'auto', right:width-x+13, bottom: height-y+2, left: 'auto' });
				} else if (x >= width / 2 && y < height / 2) { /* The marker is in the top-right of the image */
					editor.css({ top:y-12, right:width-x+13, bottom: 'auto', left: 'auto' });
				} else if (x < width / 2 && y < height / 2) { /* The marker is in the top-left of the image */
					editor.css({ top:y-12, right:'auto', bottom: 'auto', left: x+7 });
				} else { /* The marker is in the bottom-left of the image */
					editor.css({ top:'auto', right:'auto', bottom: height-y+2, left: x+7 });
				}
                // Try this: always assume the marker is in the top-left;
                editor.css({ top:y-12, right:'auto', bottom: 'auto', left: x+7 });
			},
			popupPosition: function(popup, x, y) {
                var width = imageWidth();
                var height = imageHeight();
				popup.removeClass('br bl tr tl');
				if (x >= width / 2 && y >= height / 2) { /* The marker is in the bottom-right of the image */
					popup.css({ top:'auto', right:width-x+15, bottom: height-y+2, left: 'auto' }).addClass('br');
				} else if (x >= width / 2 && y < height / 2) { /* The marker is in the top-right of the image */
					popup.css({ top:y-15, right:width-x+15, bottom: 'auto', left: 'auto' }).addClass('tr');
				} else if (x < width / 2 && y < height / 2) { /* The marker is in the top-left of the image */
					popup.css({ top:y-15, right:'auto', bottom: 'auto', left: x+9 }).addClass('tl');
				} else { /* The marker is in the bottom-left of the image */
					popup.css({ top:'auto', right:'auto', bottom: height-y+2, left: x+9 }).addClass('bl');
				}
                // Try this: always put it to the left of the marker
                popup.css({ top:y-15, right:'auto', bottom: 'auto', left: x+9 }).addClass('tl');
			},
			readOnly: false
		}
		/* Apply Overrides */
		$.extend(settings, options);
		
		/* State Variables */
		var image = settings.image || $('#'+settings.id);
		function imageWidth() { return settings.width || image.width(); }
		function imageHeight() { return settings.height || image.height(); }
		var comments = [];
		var newMarker;

		/* UI */
		var imageContainer = $('<div class="annotationContainer">');
		var popup = $('<div class="annotationPopup">').hide();
		var editor = $('<div class="annotationEditor">').hide();
		var editorInput = $('<input type="text" class="annotationEditorInput"/>');
		var editorInputLimitCount = $('<span>');
		var editorInputLimit = $('<div class="annotationEditorInputLimit"> remaining</div>').prepend(editorInputLimitCount);
		var editorSave = $('<button class="annotationEditorSave">Save</butston>');
		var editorCancel = $('<button class="annotationEditorCancel">Cancel</button>');
		editor.append(editorInput).append(editorInputLimit).append(editorSave).append(editorCancel).click(function(e) { e.stopPropagation(); });
		
		editorInput.keypress(function(e){ if (e.which == 13) { editorSave.click(); return false; } });

		imageContainer = image.wrap(imageContainer).parent();
		imageContainer.append(editor).append(popup);

		/* UI Functionality */
		editorSave.click(function() {
			newMarker.comment = $('<div></div>').text(editorInput.val()).html();
			if (newMarker.comment) {
				var comment = {
					comment: newMarker.comment,
					xP: newMarker.xP,
					yP: newMarker.yP,
					marker: newMarker
				}
				comments.push(comment);
				if ($.isFunction(settings.onCommentAdded)) { settings.onCommentAdded.call(newMarker, comment); }
			} else {
				newMarker.remove();
			}
			newMarker = undefined;
			editor.hide();
			editorInput.val('');
		});
		editorCancel.click(function() {
			newMarker.remove();
			editorInput.val('');
			editor.hide();
		});

		if (!settings.readOnly) {
			imageContainer.click(function(e) {
				if (newMarker) { newMarker.remove(); }
		        var posX = e.pageX-$(this).offset().left, posY = e.pageY-$(this).offset().top;

                var xP = posX / imageWidth();
                var yP = posY / imageHeight();

		        newMarker = addMarker(xP, yP);
		        settings.editorPosition(editor, posX, posY);
		        editor.show();
		        editorInput.focus();
			});
		}
		limitInput(editorInput, 140, editorInputLimitCount);

		/* Public Methods */
		function addMarker(xP, yP) {
			var marker = $('<div class="annotationMarker">');
			settings.markerPosition(marker, xP * imageWidth(), yP * imageHeight());
	        marker.hover(function() {
	        	marker.addClass('hover');
	        	if (marker.comment){
		        	popup.html(marker.comment).show();
		        	settings.popupPosition(popup, xP * imageWidth(), yP * imageHeight());
	        	}
	        }, function() {
	        	marker.removeClass('hover');
	        	popup.hide();
	        });
	        marker.click(function(e) { e.stopPropagation(); });

	        marker.xP = xP;
	        marker.yP = yP;

	        imageContainer.append(marker);
	        return marker;
		}

		var addComment = function(comment) {
			var marker = addMarker(comment.xP, comment.yP);
			marker.comment = comment.comment;
			comment.marker = marker;
			comments.push(comment);
			return comment;
		}
		var getComments = function() { return comments; }
		var getSettings = function() { return settings; }
		var imageSrc = settings.host ? settings.host + image.attr('src') : image.attr('src');
		
		return {
			addComment: addComment,
			addMarker: addMarker,
			getComments: getComments,
			getSettings: getSettings,
			image: image,
			container: imageContainer,
			src: imageSrc
		}
	}

	return { prepare: prepare }
	
})();