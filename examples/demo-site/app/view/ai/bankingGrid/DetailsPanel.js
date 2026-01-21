Ext.define('AppAi.view.ai.bankingGrid.DetailsPanel', {
    extend: 'AppAi.view.ai.MainDetailsPanel',
    xtype: 'banking-details',

    requires: [
        'AppAi.view.ai.DetailsPanelController'
    ],

    items: [{
        title: 'Overview',
            items: [{
            title: 'About',
            itemId: 'about-bg',
            contentType: 'readhtml',
            className: 'resources.about-banking-grid',
        },{
            title: 'Installation Guide',
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
            className: 'app.view.ai.bankingGrid.DataGrid',
        }, {
            title: 'Controller',
            itemId: 'controller',
            className: 'app.view.ai.bankingGrid.DataGridController'
        }, {
            title: 'Store',
            className: 'app.store.BankingDataStore'
        }, {
            title: 'Response Window',
            itemId: 'details',
            className: 'app.view.ai.ResponseWindow'
        }, ]
    }],

    initComponent: function () {
        this.callParent();

        let ctrl = this.getController();

        ctrl.loadTabs();
    }
});