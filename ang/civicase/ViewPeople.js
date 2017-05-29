(function(angular, $, _) {

  // CaseList directive controller
  function casePeopleController($scope, crmApi) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase'),
      item = $scope.item,
      clientIds = _.map(item.client, 'contact_id'),
      clients = _.indexBy(item.client, 'contact_id'),
      relTypes = CRM.civicase.relationshipTypes,
      relTypesByName = _.indexBy(relTypes, 'name_b_a'),
      people = $scope.people = [];
    $scope.rolePage = 1;
    $scope.rolesAlphaFilter = '';
    $scope.letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    var getCaseRoles = $scope.getCaseRoles = function() {
      var caseRoles = [];
      _.each(_.cloneDeep(item.definition.caseRoles), function(role) {
        var relType = relTypesByName[role.name];
        role.role = relType.label_b_a;
        role.description = (role.manager ? (ts('Case Manager.') + ' ') : '') + (relType.description || '');
        role.relationship_type_id = relType.id;
        caseRoles.push(role);
      });
      _.each(item.contacts, function (contact) {
        if (contact.relationship_type_id) {
          var role = _.findWhere(caseRoles, {relationship_type_id: contact.relationship_type_id});
          // Apply alpha filters
          if ($scope.rolesAlphaFilter && contact.display_name.toUpperCase().indexOf($scope.rolesAlphaFilter) < 0) {
            _.pull(caseRoles, role);
          } else {
            $.extend(role, contact);
          }
        }
      });
      $scope.roleCount = caseRoles.length;
      // Apply pager
      if ($scope.roleCount <= (25 * ($scope.rolePage - 1))) {
        // Reset if out of range
        $scope.rolePage = 1;
      }
      $scope.caseRoles = _.slice(caseRoles, (25 * ($scope.rolePage - 1)), 25 * $scope.rolePage);
    };

    getCaseRoles();

    $scope.$bindToRoute({expr:'tab', param:'peopleTab', format: 'raw', default: 'roles'});
    $scope.setTab = function(tab) {
      $scope.tab = tab;
    };

    $scope.setRolesLetterFilter = function(letter) {
      if ($scope.rolesAlphaFilter === letter) {
        $scope.rolesAlphaFilter = '';
      } else {
        $scope.rolesAlphaFilter = letter;
      }
      getCaseRoles();
    };

    function getRelations() {
      var params = {
        is_active: 1,
        sequential: 1,
        'relationship_type_id.is_active': 1,
        case_id: {'IS NULL': 1},
        options: {limit: 0},
        return: ['relationship_type_id', 'contact_id_a', 'contact_id_b']
      };
      // We have to call the api twice to get relationships of either direction
      var relationshipApis = {
        a: ['Relationship', 'get', $.extend({
          contact_id_a: {'NOT IN': clientIds},
          contact_id_b: {IN: clientIds},
          "api.Contact.getsingle": {id: '$value.contact_id_a', return: ['display_name', 'email', 'phone']}
        }, params)],
        b: ['Relationship', 'get', $.extend({
          contact_id_a: {IN: clientIds},
          contact_id_b: {'NOT IN': clientIds},
          "api.Contact.getsingle": {id: '$value.contact_id_b', return: ['display_name', 'email', 'phone']}
        }, params)]
      };
      crmApi(relationshipApis).then(function (info) {
        function formatRel(rel, dir) {
          var relType = relTypes[rel.relationship_type_id];
          people.push({
            relation: this.dir === 'a' ? relType.label_a_b : relType.label_b_a,
            client: clients[rel['contact_id_'+this.dir]].display_name,
            display_name: rel['api.Contact.getsingle'].display_name,
            email: rel['api.Contact.getsingle'].email,
            phone: rel['api.Contact.getsingle'].phone
          });
        }
        _.each(info.a.values, formatRel, {dir: 'b'});
        _.each(info.b.values, formatRel, {dir: 'a'});
      });
    }
    getRelations();
  }

  angular.module('civicase').directive('civicaseViewPeople', function() {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/ViewPeople.html',
      controller: casePeopleController,
      scope: {
        item: '=civicaseViewPeople'
      }
    };
  });

})(angular, CRM.$, CRM._);
