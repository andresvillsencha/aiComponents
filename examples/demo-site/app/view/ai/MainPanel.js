Ext.define('AppAi.view.ai.MainPanel', {
    extend: 'Ext.panel.Panel', 

    initComponent: function () {
        let me = this;
        let grid = (me.items && Array.isArray(me.items) && me.items[0]) ? me.items[0] : {};
        let details = (me.items && Array.isArray(me.items) && me.items[1]) ? me.items[1] : {};

        // Prepare for display, add responsiveness
        Object.assign(grid, {
            region: "center",
            tools: [{
                iconCls: 'fa fa-code',
                handler: function () {
                    // Show and hide east panel
                    let detailsPanel=me.down(details.xtype);
                    detailsPanel.setHidden(!detailsPanel.isHidden());
                    detailsPanel.setCollapsed(false);
                }
            }],
            listeners: { 
                // resize: function (grid,width,height) {
                //     // Let's hide the text from the buttons
                //     let responseButton = grid.down('toolbar').getComponent('responseButton');
                //     let clearFiltersButton = grid.down('toolbar').getComponent('clearFiltersButton');
                //     let queryContainer = grid.down('toolbar').getComponent('ai-search');
                //     // let textField = queryContainer ? queryContainer.getComponent('queryField') : null;
                //     let searchButton = queryContainer ? queryContainer.getComponent('searchButton') : null;

                //     if (width<900) {
                //         responseButton.setText('');
                //         clearFiltersButton.setText('');
                //         if (searchButton) searchButton.setText('');
                //         if (queryContainer) {
                //             queryContainer.setWidth(320);
                //         }
                //     } else {
                //         responseButton.setText(responseButton.initialConfig.text);
                //         clearFiltersButton.setText(clearFiltersButton.initialConfig.text);
                //         if (searchButton) searchButton.setText(searchButton.initialConfig.text);
                //         if (queryContainer) {
                //             queryContainer.setWidth(queryContainer.initialConfig.width);
                //         }
                //     }

                // }
            }
        });


        me.callParent();
    },

});