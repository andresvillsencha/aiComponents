/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend: 'AppAiC.Application',

    name: 'AppAiC',

    requires: [
        // This will automatically load all classes in the AppAiC namespace
        // so that application classes do not need to require each other.
        'AppAiC.*'
    ],

    // The name of the initial view to create.
    mainView: 'AppAiC.view.main.Main'
});
