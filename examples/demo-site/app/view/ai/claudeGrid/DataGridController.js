/**
 * Controller used for the Data Grid
 * 
 * Provides methods to connect to the backend and to process data
 * 
 * Make sure to provide the correct url to your backend service
 */
Ext.define('AppAi.view.ai.claudeGrid.DataGridController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.claude-grid-controller',

  requires: [
    'AppAi.view.ai.ResponseWindow'
  ],

  aiResponse: null,
  aiPrompt: null,
  aiTokens: null,

  /**
   * Clears the grid filters and resets the grid
   * @param {*} btn 
   */
  onClearFiltersClick: function (btn) {
    let me=this;
    let grid = btn.up('grid');
    let filters = grid.getPlugin('gridfilters');
    let store = grid.getStore();
    filters.clearFilters();
    store.setPageSize(50);
    store.clearGrouping();
    store.sorters.clear();
    // show all columns
    Ext.Array.forEach(grid.getColumnManager().getColumns(), function(col) {
        col.setHidden(false);
    });
  },

  /**
   * Saves the response, activates button 
   * @param {*} response 
   * @param {*} query 
   */
  updateResponse: function (response,query) {
    this.getReferences().responseButton.setDisabled(false);
    this.aiResponse=response;
    this.aiTokens = response.tokenData || 0;
    this.aiPrompt=query;
  },

  /** Views the response in a window */
  viewResponse: function () {
    let me=this;
    let view=me.getView();
    let wnd = Ext.create('AppAi.view.ai.ResponseWindow', {
      aiPrompt: me.aiPrompt,
      aiResponse: me.aiResponse,
      aiTokens: me.aiTokens ? (me.aiTokens.real_tokens || 0) : 0, // Tokens - cached tokens
    });
    wnd.show();
  }

});
