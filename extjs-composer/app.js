/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend: 'AppComposer.Application',

    name: 'AppComposer',

    requires: [
        // This will automatically load all classes in the AppComposer namespace
        // so that application classes do not need to require each other.
        'AppComposer.*'
    ],

    // The name of the initial view to create.
    mainView: 'AppComposer.view.main.Main'
});
