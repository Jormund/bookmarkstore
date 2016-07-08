// ==UserScript==
// @id             iitc-plugin-bookmarkstore
// @name           IITC plugin: bookmarkstore
// @category       Info
// @version        0.0.1.20160708.1425
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @downloadURL    https://github.com/Jormund/bookmarkstore/raw/master/bookmarkstore.user.js
// @description    [2016-07-08-1425] bookmarkstore
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
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

    // init setup
    window.plugin.bookmarkstore.setup = function () {
        if (!window.plugin.bookmarks) {
            console.log('**** bookmarkstore : not loaded, bookmarks is missing ****');
            alert('Bookmarks plugin is required');
            return;
        }
        window.plugin.bookmarkstore.addPanel();
        console.log('**** bookmarkstore : loaded ****');
    };

    // toolbox menu
    window.plugin.bookmarkstore.addPanel = function () {
        $('#toolbox').after('<div id="bookmarkstore-toolbox" style="padding:3px;"></div>');
        $('#bookmarkstore-toolbox')
			.append(' <strong>Bookmarks : </strong><select onchange="window.plugin.bookmarkstore.selectStoredBookmarks()" id="changeBookmarksButton" title="Change Bookmarks"></select><br />')
			.append(' <a onclick="window.plugin.bookmarkstore.saveBookmarks()">Save</a>&nbsp;&nbsp;')
			.append(' <a onclick="window.plugin.bookmarkstore.removeBookmarks()">Delete</a>&nbsp;&nbsp;')
			.append(' <a onclick="window.plugin.bookmarkstore.resetBookmarks()">Clear bookmarks</a>');
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
