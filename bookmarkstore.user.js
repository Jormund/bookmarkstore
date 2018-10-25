// ==UserScript==
// @id             iitc-plugin-bookmarkstore
// @name           IITC plugin: bookmarkstore
// @category       Info
// @version        0.1.0.20181025.2210
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://cdn.rawgit.com/Jormund/bookmarkstore/master/bookmarkstore.meta.js
// @downloadURL    https://cdn.rawgit.com/Jormund/bookmarkstore/master/bookmarkstore.user.js
// @description    [2018-10-25-2210] Bookmarkstore
// @include        https://ingress.com/intel*
// @include        http://ingress.com/intel*
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
    if (typeof window.plugin !== 'function') window.plugin = function () { };

    // PLUGIN START ////////////////////////////////////////////////////////

    // use own namespace for plugin
    window.plugin.bookmarkstore = function () { };
    window.plugin.bookmarkstore.KEY_STORAGE = 'bookmarkstore-storage';
    window.plugin.bookmarkstore.storage = {};
    window.plugin.bookmarkstore.datas_bkmrk = '';

    // update the localStorage datas
    window.plugin.bookmarkstore.saveStorage = function () {
        localStorage[window.plugin.bookmarkstore.KEY_STORAGE] = JSON.stringify(window.plugin.bookmarkstore.storage);
    };

    // load the localStorage datas
    window.plugin.bookmarkstore.loadStorage = function () {
        if (localStorage[window.plugin.bookmarkstore.KEY_STORAGE]) {
            window.plugin.bookmarkstore.storage = JSON.parse(localStorage[window.plugin.bookmarkstore.KEY_STORAGE]);
        }
    };

    // read bookmarks datas
    window.plugin.bookmarkstore.getBookmarks = function () {
        if (localStorage[window.plugin.bookmarks.KEY_STORAGE]) {
            window.plugin.bookmarkstore.datas_bkmrk = localStorage[window.plugin.bookmarks.KEY_STORAGE];
            return true;
        }
        return false; //window.plugin.bookmarks.bkmrksObj
    };

    // set bookmarks datas
    window.plugin.bookmarkstore.setBookmarks = function () {
        localStorage[window.plugin.bookmarks.KEY_STORAGE] = window.plugin.bookmarkstore.datas_bkmrk;
    };

    // change bookmarks from store
    window.plugin.bookmarkstore.selectStoredBookmarks = function () {
        var bmrkPrjct_name = $('#changeBookmarksButton').val();
        if ($.trim(bmrkPrjct_name) === '') {
            return false;
        }
        if (typeof window.plugin.bookmarkstore.storage[bmrkPrjct_name] === 'undefined') {
            alert('project not found in store');
            return false;
        }
        window.plugin.bookmarkstore.datas_bkmrk = JSON.stringify(window.plugin.bookmarkstore.storage[bmrkPrjct_name]);
        window.plugin.bookmarkstore.setBookmarks();

        window.plugin.bookmarks.refreshBkmrks();
        window.runHooks('pluginBkmrksEdit', { "target": "all", "action": "import" });
    };

    window.plugin.bookmarkstore.resetBookmarks = function () {
        delete localStorage[window.plugin.bookmarks.KEY_STORAGE];
        window.plugin.bookmarks.createStorage();
        window.plugin.bookmarks.loadStorage();
        window.plugin.bookmarks.refreshBkmrks();
        window.runHooks('pluginBkmrksEdit', { "target": "all", "action": "reset" });
    };
    // remove bookmarks from store
    window.plugin.bookmarkstore.removeBookmarks = function () {
        var bmrkPrjct_name = $('#changeBookmarksButton').val();
        if ($.trim(bmrkPrjct_name) === '') {
            window.plugin.bookmarkstore.resetBookmarks();
            return false;
        }
        if (typeof window.plugin.bookmarkstore.storage[bmrkPrjct_name] === 'undefined') {
            alert('project not found in store');
            return false;
        }

        delete window.plugin.bookmarkstore.storage[bmrkPrjct_name];
        window.plugin.bookmarkstore.saveStorage();
        window.plugin.bookmarkstore.refreshMenu();
        window.plugin.bookmarkstore.resetBookmarks();
    };

    // save bookmarks to store
    window.plugin.bookmarkstore.saveBookmarks = function () {
        var html = '<div class=""><div>Give a project name</div>name : <input id="bmrkPrjct_name" type="text"></input></div>';

        dialog({
            html: html,
            id: 'plugin-bookmarkstore-new-name',
            dialogClass: '',
            title: 'new bookmarks project name',
            buttons: {
                'OK': function () {
                    var new_name = $('#bmrkPrjct_name').val();
                    if ($.trim(new_name) === '') {
                        alert('project name required');
                        return false;
                    }
                    var rexp = /^[\+0-9a-zA-Z_-]+$/;
                    if (rexp.test(new_name)) {
                        if (window.plugin.bookmarkstore.storage[new_name] !== undefined) {
                            if (!confirm('name already exists, do you want to overwrite this project ?')) {
                                return false;
                            }
                        }
                        if (window.plugin.bookmarkstore.getBookmarks()) {
                            window.plugin.bookmarkstore.storage[new_name] = JSON.parse(window.plugin.bookmarkstore.datas_bkmrk);
                            window.plugin.bookmarkstore.saveStorage();
                            window.plugin.bookmarkstore.refreshMenu();
                        } else {
                            alert('no bookmarks to save');
                        }
                    } else {
                        alert('alphanumeric string only');
                        return false;
                    }
                    $(this).dialog('close');
                },
                'Cancel': function () {
                    $(this).dialog('close');
                }
            }
        });
    };

    // populate select menu
    window.plugin.bookmarkstore.refreshMenu = function () {
        window.plugin.bookmarkstore.loadStorage();
        $('#changeBookmarksButton').find('option').remove();
        $('#changeBookmarksButton').append($('<option>', { value: '', text: 'Select a project' }));
        if (Object.keys(window.plugin.bookmarkstore.storage).length) {
            $.each(window.plugin.bookmarkstore.storage, function (k, r) {
                $('#changeBookmarksButton').append($('<option>', { value: k, text: k }));
            });
        }
    };
	
	// open opt dialog
	window.plugin.bookmarkstore.openOpt = function() {
		dialog({
		  html: window.plugin.bookmarkstore.htmlSetbox,
		  dialogClass: 'ui-dialog-bkmrksSet',
		  title: 'Bookmarkstore Options'
		});

    //window.runHooks('pluginBkmrksOpenOpt');
	}
	
	// reset store
	window.plugin.bookmarkstore.optReset = function() {
    var promptAction = confirm('All bookmark projects will be deleted. Are you sure?', '');
    if(promptAction) {
      delete localStorage[window.plugin.bookmarkstore.KEY_STORAGE];
	  window.plugin.bookmarkstore.storage = {};
	  window.plugin.bookmarkstore.saveStorage();
      window.plugin.bookmarkstore.refreshMenu();
      //window.runHooks('pluginBkmrksEdit', {"target": "all", "action": "reset"});
      console.log('BOOKMARKSTORE: reset all bookmarks');
      window.plugin.bookmarks.optAlert('Successful. ');
		}
	}
	// copy bookmarks for export
	window.plugin.bookmarkstore.optCopy = function() {
    if(typeof android !== 'undefined' && android && android.shareString) {
      return android.shareString(localStorage[window.plugin.bookmarkstore.KEY_STORAGE]);
    } else {
      dialog({
        html: '<p><a onclick="$(\'.ui-dialog-bkmrksSet-copy textarea\').select();">Select all</a> and press CTRL+C to copy it.</p>'+
			'<textarea readonly>'+
				localStorage[window.plugin.bookmarkstore.KEY_STORAGE]+
			'</textarea>',
        dialogClass: 'ui-dialog-bkmrksSet-copy',
        title: 'Bookmarkstore Export'
			});
		}
	}
	window.plugin.bookmarkstore.optExport = function() {
		if(typeof android !== 'undefined' && android && android.saveFile) {
		  android.saveFile("IITC-bookmarkstore.json", "application/json", localStorage[window.plugin.bookmarkstore.KEY_STORAGE]);
		}
	}

	// import bookmarks via paste
	window.plugin.bookmarkstore.optPaste = function() {
    var promptAction = prompt('Press CTRL+V to paste it.', '');
    if(promptAction !== null && promptAction !== '') {
      try {
        JSON.parse(promptAction); // try to parse JSON first
        localStorage[window.plugin.bookmarkstore.KEY_STORAGE] = promptAction;
        //window.plugin.bookmarks.refreshBkmrks();//do not clear or change current bookmarks, user might want to add them to the store
		window.plugin.bookmarkstore.refreshMenu();//we do refresh the dropdownlist
        //window.runHooks('pluginBkmrksEdit', {"target": "all", "action": "import"});
        console.log('BOOKMARKSTORE: reset and imported bookmarks');
        window.plugin.bookmarks.optAlert('Successful. ');
      } catch(e) {
        console.warn('BOOKMARKSTORE: failed to import data: '+e);
        window.plugin.bookmarks.optAlert('<span style="color: #f88">Import failed </span>');
			}
		}
	}
	
	window.plugin.bookmarkstore.optImport = function() {
    if (window.requestFile === undefined) return;
    window.requestFile(function(filename, content) {
      try {
        JSON.parse(content); // try to parse JSON first
        localStorage[window.plugin.bookmarkstore.KEY_STORAGE] = promptAction;
        //window.plugin.bookmarks.refreshBkmrks();//do not clear or change current bookmarks, user might want to add them to the store
		window.plugin.bookmarkstore.refreshMenu();//we do refresh the dropdownlist
        //window.runHooks('pluginBkmrksEdit', {"target": "all", "action": "import"});
        console.log('BOOKMARKSTORE: reset and imported bookmarks');
        window.plugin.bookmarks.optAlert('Successful. ');
      } catch(e) {
        console.warn('BOOKMARKS: failed to import data: '+e);
        window.plugin.bookmarks.optAlert('<span style="color: #f88">Import failed </span>');
			}
		});
	}

    // init setup
    window.plugin.bookmarkstore.setup = function () {
        if (!window.plugin.bookmarks) {
            console.log('**** bookmarkstore : not loaded, bookmarks is missing ****');
            alert('Bookmarks plugin is required');
            return;
        }
		window.plugin.bookmarkstore.setupCSS();
        window.plugin.bookmarkstore.addPanel();
        console.log('**** bookmarkstore : loaded ****');
    };
	
	window.plugin.bookmarkstore.setupCSS = function() {
		$('<style>').prop('type', 'text/css').html('#bkmrkstoreSetbox a{'+
			'display:block;'+
			'color:#ffce00;'+
			'border:1px solid #ffce00;'+
			'padding:3px 0;'+
			'margin:10px auto;'+
			'width:80%;'+
			'text-align:center;'+
			'background:rgba(8,48,78,.9);'+
			'}'+
			'#bkmrkstoreSetbox a.disabled, #bkmrkstoreSetbox a.disabled:hover{'+
			'color:#666;'+
			'border-color:#666;'+
			'text-decoration:none;}'+
			'#bkmrkstoreSetbox{text-align:center;}')
			.appendTo('head');
	}
    // toolbox menu
    window.plugin.bookmarkstore.addPanel = function () {

		var actions = '';
		actions += '<a onclick="window.plugin.bookmarkstore.optReset();return false;">Reset bookmarkstore</a>';
		actions += '<a onclick="window.plugin.bookmarkstore.optCopy();return false;">Copy bookmarkstore</a>';
		actions += '<a onclick="window.plugin.bookmarkstore.optPaste();return false;">Paste bookmarkstore</a>';
		
		if(window.plugin.bookmarks.isAndroid()) {
		  actions += '<a onclick="window.plugin.bookmarkstore.optImport();return false;">Import bookmarkstore</a>';
		  actions += '<a onclick="window.plugin.bookmarkstore.optExport();return false;">Export bookmarkstore</a>';
		}
		window.plugin.bookmarkstore.htmlSetbox = '<div id="bkmrkstoreSetbox">' + actions + '</div>';
		
        $('#toolbox').after('<div id="bookmarkstore-toolbox" style="padding:3px;"></div>');
        $('#bookmarkstore-toolbox')
			.append(' <strong>Bookmarks : </strong><select onchange="window.plugin.bookmarkstore.selectStoredBookmarks()" id="changeBookmarksButton" title="Change Bookmarks"></select><br />')
			.append(' <a onclick="window.plugin.bookmarkstore.saveBookmarks()">Save</a>&nbsp;&nbsp;')
			.append(' <a onclick="window.plugin.bookmarkstore.removeBookmarks()">Delete</a>&nbsp;&nbsp;')
			.append(' <a onclick="window.plugin.bookmarkstore.resetBookmarks()">Clear bookmarks</a>')
			.append(' <a onclick="window.plugin.bookmarkstore.openOpt()">Opt</a>');
        window.plugin.bookmarkstore.refreshMenu();
    };

    // runrun
    var setup = window.plugin.bookmarkstore.setup;

    setup.info = plugin_info; //add the script info data to the function as a property
    if (!window.bootPlugins) window.bootPlugins = [];
    window.bootPlugins.push(setup);
    // if IITC has already booted, immediately run the 'setup' function
    if (window.iitcLoaded && typeof setup === 'function') {
        setup();
    }

    // PLUGIN END ////////////////////////////////////////////////////////    
} // WRAPPER END ////////////////////////////////////////////////////////    

var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('(' + wrapper + ')(' + JSON.stringify(info) + ');'));
(document.body || document.head || document.documentElement).appendChild(script);
