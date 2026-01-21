Ext.define('AppAi.view.ai.claudeGrid.DetailsPanel', {
    extend: 'AppAi.view.ai.MainDetailsPanel',
    xtype: 'claude-grid-details',

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
            className: 'resources.about-claude-grid',
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
            className: 'app.view.ai.claudeGrid.DataGrid',
        }, {
            title: 'Controller',
            itemId: 'controller',
            className: 'app.view.ai.claudeGrid.DataGridController'
        }, {
            title: 'Store',
            className: 'app.store.HealthcareDataStore'
        }]
    }],


    initComponent: function () {
        this.callParent();

        let ctrl = this.getController();

        ctrl.loadTabs();
    }
});