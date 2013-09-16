Ext.define('CustomApp', {
    extend: 'Rally.app.TimeboxScopedApp',
    componentCls: 'app',
    scopeType: 'iteration',
    comboboxConfig: {
        fieldLabel: 'Select an Iteration:',
        labelWidth: 100,
        width: 300
    },

    addContent: function() {
        console.log('_makeStore');
        this._makeStore();
    },
    
    _makeStore: function(){
         console.log('_makeStore');
         var filter = Ext.create('Rally.data.QueryFilter', {
                                property: 'Priority',
                                operator: '=',
                                value: 'Resolve Immediately'
                            });
                            filter = filter.or({
                                property: 'Priority',
                                operator: '=',
                                value: 'High Attention'  
                            });
                            
                            filter = filter.and({
                                property: 'State',
                                operator: '=',
                                value: 'Closed'  
                            });
                            
                            
                            filter = filter.and(this.getContext().getTimeboxScope().getQueryFilter());
                            
                            filter.toString();
                            
                            
         Ext.create('Rally.data.WsapiDataStore', {
            model: 'Defect',
            fetch: ['FormattedID','Name','Tasks','State','Resolution','Priority'],
            pageSize: 100,
            autoLoad: true,
            filters: [filter],
            listeners: {
                load: this._onDataLoaded,
                scope: this
            }
        }); 
    },
    
   onScopeChange: function() {
        console.log('onScopeChange');
        this._makeStore();
    },
    
    _onDataLoaded: function(store, data){
                console.log('_onDataLoaded');
                var defects = [];
                var pendingTasks = data.length;
                if (data.length ===0) {
                    this._createGrid(defects);  //to force refresh on testset grid when there are no testsets in the iteration
                }
                Ext.Array.each(data, function(defect) {
                            var d  = {
                                FormattedID: defect.get('FormattedID'),
                                Name: defect.get('Name'),
                                Priority: defect.get('Priority'),
                                State: defect.get('State'),
                                Resolution: defect.get('Resolution'),
                                _ref: defect.get("_ref"),
                            };
                            
                            defects.push(d);
                            this._createGrid(defects);
                }, this);
    },
    
    _createGrid: function(defects) {
        console.log('_createGrid');
        var myStore = Ext.create('Rally.data.custom.Store', {
                data: defects,
                pageSize: 100,  
            });
        if (!this.grid) {
        this.grid = this.add({
            xtype: 'rallygrid',
            itemId: 'mygrid',
            store: myStore,
            columnCfgs: [
                {
                   text: 'Formatted ID', dataIndex: 'FormattedID', xtype: 'templatecolumn',
                    tpl: Ext.create('Rally.ui.renderer.template.FormattedIDTemplate')
                },
                {
                    text: 'Name', dataIndex: 'Name'
                },
                {
                    text: 'Priority', dataIndex: 'Priority'
                },
                {
                    text: 'State', dataIndex: 'State'
                },
                {
                    text: 'Resolution', dataIndex: 'Resolution'
                }
            ]
        });
         
         }else{
            this.grid.reconfigure(myStore);
         }
    }
       
});
