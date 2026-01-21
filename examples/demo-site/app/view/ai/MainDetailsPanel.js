Ext.define('AppAi.view.ai.MainDetailsPanel', {
    extend: 'Ext.tab.Panel', 
    xtype: 'detpanel',

    requires: [
        'AppAi.view.ai.DetailsPanelController'
    ],

    width: 500,
    
    region: "east",
    collapsible: false,
    splitterResize: false,
    split: false,
    responsiveConfig: {
        tall: {
            hidden: true, 
            width: '100%'
        },
        wide: {
            width: 500
        }
    },


    title: 'Overview + Implementation',

    controller: 'details-controller',

    defaults: {
        scrollable: true,
        xtype: 'tabpanel',
        scrollable: false,
        html: '',
        bodyPadding: 0,

        tabBar: {
            style: {
                backgroundColor: '#4f82c3'
            }
        },
        defaults: {
            scrollable: true,
            contentType: 'nodejs',
            html: 'File Not Found',
            bodyPadding: 16,
            tabConfig: {
                cls: 'sub-tab',
                padding: 16,
            },
        },
    },

    tools: [{
        iconCls: 'fa fa-times',
        handler: function (event,btn,tbar) {
            let detailsPanel=tbar.up('detpanel');
            detailsPanel.setHidden(!detailsPanel.isHidden());
            detailsPanel.setCollapsed(false);
        }
    }],

    initComponent: function () {
        let me=this;
        
        me.callParent();
    }

})