/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend: 'AppAi.Application',

    name: 'AppAi',

    requires: [
        // This will automatically load all classes in the AppAi namespace
        // so that application classes do not need to require each other.
        'AppAi.*'
    ],

    // The name of the initial view to create.
    mainView: 'AppAi.view.main.Main'
});
