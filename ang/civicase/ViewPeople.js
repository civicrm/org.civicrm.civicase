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
    $scope.CRM = CRM;
    $scope.allowMultipleCaseClients = CRM.civicase.allowMultipleCaseClients;
    $scope.caseRoles = [];
    $scope.rolePage = 1;
    $scope.rolesAlphaFilter = '';
    $scope.rolesSelectionMode = '';
    $scope.selectedTask = '';
    $scope.letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    $scope.contactTasks = CRM.civicase.contactTasks;

    var getSelectedRoles = $scope.getSelectedRoles = function(onlyChecked) {
      if (onlyChecked || $scope.rolesSelectionMode === 'checked') {
        return _.collect(_.filter($scope.caseRoles, {checked: true}), 'contact_id');
      }
      else if ($scope.rolesSelectionMode === 'all') {
        return _.collect($scope.caseRoles, 'contact_id');
      }
      return [];
    };

    var getCaseRoles = $scope.getCaseRoles = function() {
      var caseRoles = [],
        allRoles = [],
        selected = getSelectedRoles();
      _.each(_.cloneDeep(item.definition.caseRoles), function(role) {
        var relType = relTypesByName[role.name];
        role.role = relType.label_b_a;
        role.contact_type = relType.contact_type_b;
        role.contact_sub_type = relType.contact_sub_type_b;
        role.description = (role.manager ? (ts('Case Manager.') + ' ') : '') + (relType.description || '');
        role.relationship_type_id = relType.id;
        if (!$scope.rolesAlphaFilter) caseRoles.push(role);
        allRoles.push(_.cloneDeep(role));
      });
      _.each(item.contacts, function (contact) {
        var role = contact.relationship_type_id ? _.findWhere(caseRoles, {relationship_type_id: contact.relationship_type_id}) : null;
        if ((!role || role.contact_id) && contact.relationship_type_id) {
          role = _.cloneDeep(_.findWhere(allRoles, {relationship_type_id: contact.relationship_type_id}));
          caseRoles.push(role);
        }
        // Apply alpha filters
        if ($scope.rolesAlphaFilter && contact.display_name.toUpperCase().indexOf($scope.rolesAlphaFilter) < 0) {
          if (role) _.pull(caseRoles, role);
        } else if (role) {
          $.extend(role, {checked: selected.indexOf(contact.contact_id) >= 0}, contact);
        } else {
          caseRoles.push($.extend({role: ts('Client'), checked: selected.indexOf(contact.contact_id) >= 0}, contact));
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

    $scope.setRolesSelectionMode = function(mode) {
      $scope.rolesSelectionMode = mode;
    };

    $scope.doContactTask = function() {
      var task = $scope.selectedTask;
      $scope.selectedTask = '';
      console.log(task);
    };

    $scope.assignRole = function(role, replace) {
      CRM.confirm({
        title: replace ? ts('Replace %1', {1: role.role}) : ts('Add %1', {1: role.role}),
        message: '<input name="caseRoleSelector" />',
        open: function() {
          $('[name=caseRoleSelector]', this).crmEntityRef({create: true, api: {params: {contact_type: role.contact_type, contact_sub_type: role.contact_sub_type}, extra: ['display_name']}});
        }
      }).on('crmConfirm:yes', function() {
        var apiCalls = [],
          val = $('[name=caseRoleSelector]', this).val();
        if (replace) {
          apiCalls.push(unassignRoleCall(role));
        }
        if (val) {
          var newContact = $('[name=caseRoleSelector]', this).select2('data').extra.display_name;
          _.each(item.client, function(client) {
            apiCalls.push(['Relationship', 'create', {relationship_type_id: role.relationship_type_id, start_date: 'now', contact_id_a: client.contact_id, contact_id_b: val, case_id: item.id}]);
          });
          apiCalls.push(['Activity', 'create', {
            case_id: item.id,
            target_contact_id: replace ? [val, role.contact_id] : val,
            status_id: 'Completed',
            activity_type_id: role.relationship_type_id ? 'Assign Case Role' : (replace ? 'Reassigned Case' : 'Add Client To Case'),
            subject: replace ? ts('%1 replaced %2 as %3', {1: newContact, 2: role.display_name, 3: role.role}) : ts('%1 added as %2', {1: newContact, 2: role.role})
          }]);
          $scope.refresh(apiCalls);
        }
      });
    };

    $scope.unassignRole = function(role) {
      CRM.confirm({
        title: ts('Remove %1', {1: role.role}),
        message: ts('Remove %1 as %2?', {1: role.display_name, 2: role.role})
      }).on('crmConfirm:yes', function() {
        var apiCalls = [unassignRoleCall(role)];
        apiCalls.push(['Activity', 'create', {
          case_id: item.id,
          target_contact_id: role.contact_id,
          status_id: 'Completed',
          activity_type_id: role.relationship_type_id ? 'Remove Case Role' : 'Remove Client From Case',
          subject: ts('%1 removed as %2', {1: role.display_name, 2: role.role})
        }]);
        $scope.refresh(apiCalls);
      });
    };

    function unassignRoleCall(role) {
      // Case Role
      if (role.relationship_type_id) {
        return ['Relationship', 'get', {
          relationship_type_id: role.relationship_type_id,
          contact_id_b: role.contact_id,
          case_id: item.id,
          is_active: 1,
          'api.Relationship.create': {is_active: 0, end_date: 'now'}
        }];
      }
      // Case Client
      else {
        return ['CaseContact', 'get', {
          case_id: item.id,
          contact_id: role.contact_id,
          'api.CaseContact.delete': {}
        }];
      }
    }

    $scope.$watch('item', getCaseRoles, true);

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
        item: '=civicaseViewPeople',
        refresh: '=refreshCallback'
      }
    };
  });

})(angular, CRM.$, CRM._);
