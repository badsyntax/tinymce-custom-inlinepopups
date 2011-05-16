/**
 * @filename : editor_plugin.js
 * @description : TinyMCE Dojo inline popups plugin
 * @developer : badsyntax (Richard Willis)
 * @contact : http://badsyntax.co
 * @demo : http://demos.badsyntax.co/tinymce-dojo-popups/
 * @project: https://github.com/badsyntax/tinymce-custom-inlinepopups
 */

(function() {

	var DOM = tinymce.DOM, 
		Event = tinymce.dom.Event, 
		each = tinymce.each;

	// Create the editor plugin
	tinymce.create('tinymce.plugins.DojoInlinePopups', {
			
		init : function(ed, url) {

			// Replace window manager
			ed.onBeforeRenderUI.add(function() {				
				ed.windowManager = new tinymce.InlineWindowManager(ed);
			});
		},

		getInfo : function() {
			return {
				longname : 'jQuery UI Inline Popups',
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
			
			// Config and alert dialogs
			if (f.content){

				if (f.type == 'confirm') {

					f.button_func( window.confirm(f.content) );
				}
				else if (f.type == 'alert') {

					window.alert(f.content);

					f.button_func(true);
				}

				return;
			}
				
			var 
				t = this,
				id = DOM.uniqueId(),

				// Window info
				w = {
					id: id,
					features: f
				},
		
				// Dialog iFrame document
				iframe = dojo.create('iframe', {
					id: id + '_ifr',
					frameborder: 0,
					style: {
						width: f.width + 'px',
						height: f.height + 'px'
					}
				}),

				// Dialog config
				config = {
					title: f.title || '',
					style: 'width:auto;height:auto',
					autofocus: false,
					closable: true,
					id: 'dialog-' + id,
					isLayoutContainer: false,
					content: iframe
				}
			;

			p.mce_inline = true;
			p.mce_window_id = id;
			p.mce_auto_focus = f.auto_focus;
					
			t.features = f;
			t.params = p;
			t.onOpen.dispatch(this, f, p);

			w.element = new dijit.Dialog(config);
			w.element.show();
						
			// Load in iframe src
			if (!f.content) {
				dojo.attr(iframe, 'src', f.url || f.file);
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
	
			var t = this, w, id;

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
	
				w.element.hide();
	
				delete t.windows[id];
			}
		},

		setTitle : function(w, ti) {
	
			var e;

			w = this._findId(w);

			if (e = DOM.get('dialog-' + w + '_title')) {
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

			var t = this;

			this.open({
				type: type,
				button_func : function(s) {
					(cb) && cb.call(s || t, s);
				},
				content: DOM.encode(t.editor.getLang(txt, txt)),
				inline: 1
			});
		}
	});

	// Register plugin
	tinymce.PluginManager.add('dojoinlinepopups', tinymce.plugins.DojoInlinePopups);
})();
