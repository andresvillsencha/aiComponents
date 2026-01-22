Ext.define('AppAi.view.ai.form.DetailsPanel', {
    extend: 'AppAi.view.ai.MainDetailsPanel',
    xtype: 'auto-form-details',

    requires: [
        'AppAi.view.ai.DetailsPanelController'
    ],

    aboutGrid: [{
        title: 'About',
        itemId: 'about',
        contentType: 'readhtml',
        className: 'resources.about-hc',
    }],

    items: [{
        title: 'Overview',
            items: [{
            title: 'About',
            itemId: 'about-hc',
            contentType: 'readhtml',
            className: 'resources.about-smart-fill',
        },{
            title: 'Server Installation Guide',
            className: 'resources.server',
            contentType: 'readhtml'
        },{
            title: 'Ext JS',
            className: 'resources.client',
            contentType: 'readhtml'
        }]
    },{
        title: 'Ext JS',
        items: [{
            title: 'View',
            itemId: 'view',
            className: 'app.view.ai.form.AutoForm',
        }]
    }],


    initComponent: function () {
        this.callParent();

        let ctrl = this.getController();

        ctrl.loadTabs();
    }
});