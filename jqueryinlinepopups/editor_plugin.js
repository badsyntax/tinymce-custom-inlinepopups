/**
 * @filename : editor_plugin.js
 * @description : jQuery UI Inline Popups plugin to replace the default inlinepopups
 * @developer : badsyntax (Richard Willis)
 * @contact : http://badsyntax.co
 * @moreinfo : http://is.gd/j1FuI
 */

(function() {

	var DOM = tinymce.DOM, 
		Element = tinymce.dom.Element, 
		Event = tinymce.dom.Event, 
		each = tinymce.each, 
		is = tinymce.is;

	// Create the editor plugin
	tinymce.create('tinymce.plugins.jQueryInlinePopups', {
			
		init : function(ed, url) {

			// Replace window manager
			ed.onBeforeRenderUI.add(function() {				
				ed.windowManager = new tinymce.InlineWindowManager(ed);
			});
		},

		getInfo : function() {
			return {
				longname : 'jQueryUIInlinePopups',
				author : 'Richard Willis',
				authorurl : 'http://badsyntax.co',
				infourl : 'http://is.gd/j1FuI',
				version : '0.1b'
			};
		}
	});

	// Create the window manager
	tinymce.create('tinymce.InlineWindowManager:tinymce.WindowManager', {
			
		InlineWindowManager : function(ed) {
			this.parent(ed);
			this.count = 0;
			this.windows = {};
		},

		open : function(f, p) {

			f = f || {};
			p = p || {};

			// Run native windows
			if (!f.inline) {
				return t.parent(f, p);
			}
				
			var 
				t = this,
				// Dialog config
				config = {
					title: f.title || '',
					width: 'auto',
					height: 'auto',
					modal: true,
					resizable: false,
					draggable: true,
					dialogClass: 'ui-dialog-tinymce'
				},
				id = DOM.uniqueId(),
				// jQuery Dialog element
				dialog = $('<div />')
					.attr('id', 'dialog-' + id)
					.hide()
					.appendTo('body'),
				// Window info
				w = {
					id : id,
					features : f,
					element: dialog
				};

			if (f.title) {
				dialog.attr('title', f.title);
			}

			// Inline content
			if (f.content){
				if (f.type == 'confirm'){
					config.buttons = [{
						'text': 'Ok',
						'click': function(e){
							f.button_func(true);
						}
					}, {
						'text': 'Cancel',
						'click': function(e){
							f.button_func(false);
						}
					}];										
				}
				else if (f.type == 'alert'){
					config.buttons = [{
						'text': 'Ok',
						'click': function(e){
							f.button_func(true);
						}
					}];
				}
			
				dialog.html($('<div />', {
					'class': 'ui-dialog-tinymce-content',
					'html': f.content
				}));
			}
			// iFramed document
			else 
			{
				var iframe = $('<iframe />', { 
					id: id + '_ifr',
					frameborder: 0 
				})
				.css({ 
					width: f.width,
					height: f.height
				})
				.appendTo(dialog);
			}

			p.mce_inline = true;
			p.mce_window_id = id;
			p.mce_auto_focus = f.auto_focus;
					
			this.features = f;
			this.params = p;
			this.onOpen.dispatch(this, f, p);

			dialog.dialog(config);
			
			// Load in iframe src
			if (!f.content) {
				iframe.attr( 'src', f.url || f.file );
			}

			// Add window
			t.windows[id] = w;

			t.count++;

			return w;
		},

		_findId : function(w) {
	
			var t = this;

			if (typeof(w) == 'string') {
				return w;
			}

			each(t.windows, function(wo) {
				var ifr = DOM.get(wo.id + '_ifr');

				if (ifr && w == ifr.contentWindow) {
					w = wo.id;
					return false;
				}
			});

			return w;
		},

		resizeBy : function(dw, dh, id) {
			return;
		},

		focus : function(id) {	
			return; 
		},

		close : function(win, id) {
	
			var t = this, w, d = DOM.doc, ix = 0, fw, id;

			id = t._findId(id || win);

			// Probably not inline
			if (!t.windows[id]) {
				t.parent(win);
				return;
			}

			t.count--;

			if (w = t.windows[id]) {
		
				t.onClose.dispatch(t);
	
				Event.clear(id);
				Event.clear(id + '_ifr');

				DOM.setAttrib(id + '_ifr', 'src', 'javascript:""'); // Prevent leak
	
				w.element.dialog('destroy').remove();
	
				delete t.windows[id];
			}
		},

		setTitle : function(w, ti) {
	
			var e;

			w = this._findId(w);

			if (e = DOM.get('ui-dialog-title-dialog-' + w)) {
				e.innerHTML = DOM.encode(ti);
			}
		},

		alert : function(txt, cb, s) {
			this._messagePopup('alert', 'Alert', txt, cb, s);
		},

		confirm : function(txt, cb, s) {
			this._messagePopup('confirm', 'Confirm', txt, cb, s);
		},
		
		_messagePopup : function(type, title, txt, cb, s) {
			var t = this, w;
			w = t.open({
				title : title,
				type : type,
				button_func : function(s) {
					(cb) && cb.call(s || t, s);
					t.close(null, w.id);
				},
				content : DOM.encode(t.editor.getLang(txt, txt)),
				inline : 1,
				width : 400,
				height : 130
			});
		}
	});

	// Register plugin
	tinymce.PluginManager.add('jqueryinlinepopups', tinymce.plugins.jQueryInlinePopups);
})();