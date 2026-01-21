/*
 * This file launches the application by asking Ext JS to create
 * and launch() the Application class.
 */
Ext.application({
    extend: 'AppAiM.Application',

    name: 'AppAiM',

    requires: [
        // This will automatically load all classes in the AppAiM namespace
        // so that application classes do not need to require each other.
        'AppAiM.*'
    ],

    // The name of the initial view to create.
    mainView: 'AppAiM.view.main.Main'
});
