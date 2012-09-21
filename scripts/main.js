require.config({
	paths : {
		bootstrap : 'lib/bootstrap.min',
		doT : 'lib/doT.min',
		views : 'templates/templates',
		backbone : 'lib/backbone',
		storage : 'lib/backbone.localStorage',
		underscore : 'lib/underscore'
	},
	shim : {
		'bootstrap' : [ 'jquery' ]
		,
		'backbone' : {
			deps : [ 'underscore', 'jquery' ],
			exports : 'Backbone'
		},
		'underscore' : {
			exports : '_'
		},
		'storage' : {
			deps : [ 'backbone' ],
			exports : 'Backbone.Storage'
		}

	}
});

require(
		[ 'jquery', 'views', 'bootstrap', 'domReady!',
				,'storage' ],

		function($, views) {
			Backbone.sync = function(method, model, success, error){ 
			    success();
			  }
			var Item = Backbone.Model.extend({
				idAttribute : "_id",
				defaults : {

				}
			});
			var List = Backbone.Collection.extend({
						model : Item,
					});
			var ItemView = Backbone.View.extend({

				initialize : function() {
					_.bindAll(this, 'remove');
				},
				remove : function() {
					this.model.destroy();
				}
			});

			var ListView = Backbone.View.extend({
				el : $('#above-buttons'), 
				events : {
					'click button#add' : 'buttonAdd'
				},
				initialize : function() {
					_.bindAll(this, 'render', 'addItem', 'getAll', 'get','remove'); 
					this.collection = new List([
					{_id : 1,lastname : "Dicken",firstname : "Charles",	address : "Odensstr 12a",
						birthday : "1976/10/13", zip :"12345",phone : "2332123444" },
					{_id : 2,lastname : "Duck",firstname : "Pearl",	address : "Paris Avenue 19",
							birthday : "1956/12/16", zip :"45615",phone : "66663344" },
					{_id : 3,lastname : "Bruno",firstname : "William",	address : "Ostseestr 124",
								birthday : "1979/10/19", zip :"12395",phone : "2323423525" },
					{_id : 4,lastname : "Piek",firstname : "Peter",	address : "Haylazai 76",
									birthday : "1970/10/29", zip :"43215",phone : "29988423525" },
					 ]);
                    this.collection.bind('add', this.buttonAdd); // collection event binder
					localStorage.setItem("Contacts", JSON.stringify(this.collection.models));
					this.render();
				},
				getEmptyModel : function(){
					var emptyList = new List([ {_id : 0, lastname : "",firstname : "",	address : "",
							birthday : "",zip : "" ,phone:""}]);
					return emptyList.get(0);
				},
				saveCollection : function(){
					localStorage.setItem("Contacts", JSON.stringify(this.collection.models));
				},
				render : function() {
					var self = this;
					$(this.el).append("<button id='remove'>Remove</button>");
					$(this.el).append("<button id='add'>Add</button>");

				},
				getAll : function() {
					var values = localStorage.getItem("Contacts");
					return JSON.parse(values);
				},
				get : function(id) {
					return this.collection.get(id);
				},
				buttonAdd : function() {
					$('#create-body').html(views.dialog(this.getEmptyModel()));
					$('#create-modal').modal('show');
					
				},
				addItem : function(item) {
					this.collection.add(item);
				},
				remove : function(id) {
					
					this.collection.remove(this.get(id));
					this.saveCollection();
					$('#customer-rows').html(views.tablerow(listView.getAll()));
				},
				update : function(data) {
					var jsonStr = JSON.stringify(data);
					//				var values = localStorage.getItem("Contacts");
//					var jsonAfter = JSON.parse(values);
//								    	alert(values);
//								    	alert(currentmodel.get('firstname'));
					//			    	alert(JSON.stringify(currentmodel));
//					alert(currentmodel.get('firstname'));
//					alert(jsonStr);
					var currentmodel = this.get(data['_id']);
					currentmodel.set(data);
					this.collection[data['_id']] = currentmodel;
					this.saveCollection();
					$('#customer-rows').html(views.tablerow(listView.getAll()));

				},
				create : function(data) {
					var jsonStr = JSON.stringify(data);
					this.collection.add(new Item(JSON.parse(jsonStr)));
					this.saveCollection();
					$('#customer-rows').html(views.tablerow(listView.getAll()));
				},
			 


			});
			
			function uniqid() {   var newDate = new Date;   return newDate.getTime();  }
			
			var listView = new ListView();
			var arrayOfJson = JSON.stringify(listView.getAll());
			$('#customer-rows').html(views.tablerow(listView.getAll()));

			$('#customer-table').on('click', 'a.edit-customer', function(e) {
				e.preventDefault();
				var idx = $(this).data('id');
				$('#modal-body').html(views.dialog(listView.get(idx)));
				$('#customer-modal').modal('show');
			});
			$('#customer-table').on('click','a.remove-customer',function(e) {
				e.preventDefault();
				var id = $(this).data('id');
                listView.remove(id);
			});

			$('#customer-modal').on('click','a.save-customer',function(e) {
						e.preventDefault();

						var url = $('#customer-form').serialize();
						split = url.split('&');

						var obj = {};
						for ( var i = 0; i < split.length; i++) {
							var kv = split[i].split('=');
							obj[kv[0]] = decodeURIComponent(kv[1] ? kv[1]
									.replace(/\+/g, ' ') : kv[1]);
						}
						listView.update(obj);
						$('#customer-modal').modal('hide');
					});
			$('#create-modal').on('click','a.create-customer',function(e) {
				e.preventDefault();

				var url = $('#customer-form').serialize();
				split = url.split('&');

				var obj = {};
				for ( var i = 0; i < split.length; i++) {
					var kv = split[i].split('=');
					obj[kv[0]] = decodeURIComponent(kv[1] ? kv[1]
							.replace(/\+/g, ' ') : kv[1]);
				}
				obj._id = uniqid();
				listView.create(obj);
				$('#create-modal').modal('hide');
			});

		});
