Ext.define('AppAi.view.ai.openAiGrid.DetailsPanel', {
    extend: 'AppAi.view.ai.MainDetailsPanel',
    xtype: 'openai-grid-details',

    requires: [
        'AppAi.view.ai.DetailsPanelController'
    ],

    aboutGrid: [{
        title: 'About',
        itemId: 'about',
        contentType: 'readhtml',
        className: 'resources.about-sg',
    }],

    items: [{
        title: 'Overview',
            items: [{
            title: 'About',
            itemId: 'about-sg',
            contentType: 'readhtml',
            className: 'resources.about-openai-grid',
        },{
            title: 'Server Installation Guide',
            className: 'resources.server',
            contentType: 'readhtml'
        },{
            title: 'Ext JS',
            className: 'resources.client',
            contentType: 'readhtml'
        }]
    }, {
        title: 'Ext JS',
        items: [{
            title: 'View',
            itemId: 'view',
            className: 'app.view.ai.openAiGrid.DataGrid',
        }, {
            title: 'Controller',
            itemId: 'controller',
            className: 'app.view.ai.openAiGrid.DataGridController'
        }, {
            title: 'Store',
            className: 'app.store.SchoolDataStore'
        }]
    }],

    initComponent: function () {
        this.callParent();

        let ctrl = this.getController();

        ctrl.loadTabs();
    }
});