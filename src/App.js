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
        this._arr = [];
        var that = this;
        console.log('_addContent');
        
        Rally.data.ModelFactory.getModel({
            type: 'Defect',
            context: {
                workspace: '/workspace/12352608129'
            },
            success: function(model) {
                that._allowedValuesStore = model.getField( 'Resolution' ).getAllowedValueStore( );
                console.log("allowed values count", that._allowedValuesStore.getCount());
                that._getDropdownValues();
                that._makeStore();
            }
        });
    },

    _getDropdownValues: function(){
        var that = this;
        this._allowedValuesStore.load({
        scope: this,
        callback: function(records, operation, success){
            console.log(records[1].get('StringValue'));
            Ext.Array.each(records, function(val) {
                            var s = val.get('StringValue');
                            that._arr.push(s);
            });
            console.log("arr[2]", this._arr[2])
            }
        });
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
                if (data.length === 0) {
                    this._createGrid(defects);  //to force refresh on testset grid when there are no items in the iteration
                }

                var countArchitecture=0;
                var countCodeChange=0;
                var countNotADefect=0;
                var countNone = 0;
                var countConfigurationChange =0;
                var countDatabaseChange = 0;
                var countDuplicate = 0;
                var countNeedMoreInformation =0;
                var countSoftwareLimitation =0;
                var countUserInterface = 0;
                
                
                Ext.Array.each(data, function(defect) {
                            
                            var resolution = defect.get('Resolution');
                            switch(resolution)
                            {
                            case "Architecture":
                              countArchitecture++;
                              break;
                            case "Code Change":
                              countCodeChange++;
                              break;
                            case "Not a Defect":
                              countNotADefect++;
                              break;
                            case "None":
                              countNone++;
                              break;
                            case "Configuration Change":
                              countConfigurationChange++;
                              break;
                            case "Database Change":
                              countDatabaseChange++;
                              break;
                            case "Duplicate":
                              countDuplicate++;
                              break;
                            case "Need More Information":
                              countDuplicate++;
                              break;
                            case "Software Limitation":
                              countSoftwareLimitation++;
                              break;
                            case "User Interface":
                              countUserInterface++;
                              break;
                            default:
                              countNone++;
                            }
                });
                   
                            var d  = {
                                'Architecture': countArchitecture,
                                'Code Change': countCodeChange,
                                'Not a Defect' : countNotADefect,
                                '' : countNone, 
                                'Configuration Change': countConfigurationChange,
                                'Database Change': countDatabaseChange,
                                'Duplicate': countDuplicate,
                                'Need More Information': countNeedMoreInformation,
                                'Software Limitation': countSoftwareLimitation,
                                'User Interface':countUserInterface,
                            };

                           defects.push(d);
                           this._createGrid(defects);         
    },
    
    _createGrid: function(defects) {
        console.log('_createGrid');
        console.log('this._arr[3]', this._arr[3]);
        var that = this;
        
        var myStore = Ext.create('Rally.data.custom.Store', {
                data: defects,
                pageSize: 100,  
            });
        
        var columnConfig = [];
                   
                for (var i=0;i<this._arr.length; i++) {
                    var columnConfigElement = {}; 
                    columnConfigElement['text'] = that._arr[i];
                    columnConfigElement['dataIndex'] = that._arr[i];
                    columnConfig.push(columnConfigElement);
                }
        
        console.log('columnConfig', columnConfig);
        
        if (!this.grid) {
        this.grid = this.add({
            xtype: 'rallygrid',
            itemId: 'mygrid',
            store: myStore,
            columnCfgs: columnConfig
        });
         
         }else{
            this.grid.reconfigure(myStore);
         }
    }
       
});
