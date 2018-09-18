(function () {
  var module = angular.module('civicase.data');
  CRM.civicase.customSearchFields = [
    {
      'fields': [{id: 'a1'}, {id: 'a2'}]
    },
    {
      'fields': [{id: 'b1'}, {id: 'b2'}]
    }
  ];

  module.constant('CustomSearchFields', {
    values: CRM.civicase.customSearchFields
  });
}());
