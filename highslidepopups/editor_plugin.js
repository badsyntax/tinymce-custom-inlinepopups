/**
 * @filename : editor_plugin.js
 * @description : Highslide Inline Popups plugin to replace the default inlinepopups
 * @developer : badsyntax (Richard Willis)
 * @contact : http://badsyntax.co
 * @demo : http://demos.badsyntax.co/tinymce-highslide-popups/
 */

(function() {

	var DOM = tinymce.DOM, 
		Element = tinymce.dom.Element, 
		Event = tinymce.dom.Event, 
		each = tinymce.each, 
		is = tinymce.is;

	// Create the editor plugin
	tinymce.create('tinymce.plugins.highslideinlinepopups', {
			
		init : function(ed, url) {

			// Replace window manager
			ed.onBeforeRenderUI.add(function() {				
				ed.windowManager = new tinymce.InlineWindowManager(ed);
			});
		},

		getInfo : function() {
			return {
				longname : 'HighslideInlinePopups',
				author : 'Richard Willis',
				authorurl : 'http://badsyntax.co',
				infourl : 'http://is.gd/j1FuI',
				version : '0.1a'
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
				// Highslide config
				config = {
					// bit of a hack to force highslide to always create heading element
					headingText: f.title || '&nbsp;',
					align: 'center',
					width: f.width + 1,
					height: f.height + 38,
					showCredits: false,
					allowHeightReduction: false,
					objectType: 'iframe',
					src: f.url || f.file || 'javascript:""'
				},
				id = DOM.uniqueId(),
				// Window info
				w = {
					id : id,
					features : f
				};

			// Inline content
			if (f.content){
				if (f.type == 'confirm'){
					f.button_func( window.confirm(f.content) );
				}
				else if (f.type == 'alert'){
					window.alert(f.content);
					f.button_func(true);
				}
				return;
			}

			p.mce_inline = true;
			p.mce_window_id = id;
			p.mce_auto_focus = f.auto_focus;
					
			this.features = f;
			this.params = p;
			this.onOpen.dispatch(this, f, p);

			// Set iframe ID - this can be improved!
			hs.Expander.prototype.onBeforeExpand = function(){
				this.iframe.id = id + '_ifr';
			};
			// Set heading (dialog title) ID
			hs.Expander.prototype.onAfterGetHeading = function(expander){
				this.heading.id = 'highslide-heading-' + id;
			};
			
			hs.htmlExpand(null, config);

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
	
				hs.close();
	
				delete t.windows[id];
			}
		},

		// TODO: this method is called before the iframe id has been set.
		// A 50 milliseconds delay seems /OK/, but a solution to set the iframe id
		// must be found to prevent assuming the delay value!
		setTitle : function(w, ti) {

			var t = this;

			setTimeout(function(){
	
				var e;

				w = t._findId(w);

				if (e = DOM.get('highslide-heading-' + w)) {
					e.innerHTML = DOM.encode(ti);
				}
			}, 50);
		},

		alert : function(txt, cb, s) {
			this._messagePopup('alert', txt, cb, s);
		},

		confirm : function(txt, cb, s) {
			this._messagePopup('confirm', txt, cb, s);
		},
		
		_messagePopup : function(type, txt, cb, s) {
			var t = this;
			t.open({
				type : type,
				button_func : function(s) {
					(cb) && cb.call(s || t, s);
				},
				content : DOM.encode(t.editor.getLang(txt, txt)),
				inline : 1,
				width : 400,
				height : 130
			});
		}
	});

	// Register plugin
	tinymce.PluginManager.add('highslideinlinepopups', tinymce.plugins.highslideinlinepopups);
})();
