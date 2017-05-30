(function(angular, $, _) {

  // CaseList directive controller
  function casePeopleController($scope, crmApi) {
    // The ts() and hs() functions help load strings for this module.
    var ts = $scope.ts = CRM.ts('civicase'),
      item = $scope.item,
      clientIds = _.map(item.client, 'contact_id'),
      clients = _.indexBy(item.client, 'contact_id'),
      relTypes = CRM.civicase.relationshipTypes,
      relTypesByName = _.indexBy(relTypes, 'name_b_a');

    $scope.CRM = CRM;
    $scope.allowMultipleCaseClients = CRM.civicase.allowMultipleCaseClients;
    $scope.caseRoles = [];
    $scope.rolesPage = 1;
    $scope.rolesAlphaFilter = '';
    $scope.rolesSelectionMode = '';
    $scope.rolesSelectedTask = '';
    $scope.relations = [];
    $scope.relationsPage = 1;
    $scope.relationsAlphaFilter = '';
    $scope.relationsSelectionMode = '';
    $scope.relationsSelectedTask = '';
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
    
    var getSelectedRelations = $scope.getSelectedRelations = function(onlyChecked) {
      if (onlyChecked || $scope.relationsSelectionMode === 'checked') {
        return _.collect(_.filter($scope.relations, {checked: true}), 'id');
      }
      else if ($scope.relationsSelectionMode === 'all') {
        return _.collect($scope.relations, 'id');
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
      $scope.rolesCount = caseRoles.length;
      // Apply pager
      if ($scope.rolesCount <= (25 * ($scope.rolesPage - 1))) {
        // Reset if out of range
        $scope.rolesPage = 1;
      }
      $scope.caseRoles = _.slice(caseRoles, (25 * ($scope.rolesPage - 1)), 25 * $scope.rolesPage);
    };

    $scope.setSelectionMode = function(mode, tab) {
      $scope[tab + 'SelectionMode'] = mode;
    };

    $scope.doContactTask = function() {
      var task = $scope.rolesSelectedTask;
      $scope.rolesSelectedTask = '';
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
          // Add case role
          if (role.relationship_type_id) {
            _.each(item.client, function (client) {
              apiCalls.push(['Relationship', 'create', {
                relationship_type_id: role.relationship_type_id,
                start_date: 'now',
                contact_id_a: client.contact_id,
                contact_id_b: val,
                case_id: item.id
              }]);
            });
          }
          // Add case client
          else {
            apiCalls.push(['CaseContact', 'create', {case_id: item.id, contact_id: val}]);
          }
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

    $scope.setLetterFilter = function(letter, tab) {
      if ($scope[tab + 'AlphaFilter'] === letter) {
        $scope[tab + 'AlphaFilter'] = '';
      } else {
        $scope[tab + 'AlphaFilter'] = letter;
      }
      if (tab === 'roles') {
        getCaseRoles();
      } else {
        getRelations();
      }
    };

    var getRelations = $scope.getRelations = function() {
      var params = {
        options: {limit: 25, offset: $scope.relationsPage - 1},
        case_id: item.id,
        sequential: 1,
        return: ['display_name', 'phone', 'email']
      };
      if ($scope.relationsAlphaFilter) {
        params.display_name = $scope.relationsAlphaFilter;
      }
      crmApi('Case', 'getrelations', params).then(function (contacts) {
        $scope.relations = _.each(contacts.values, function(rel) {
          var relType = relTypes[rel.relationship_type_id];
          rel.relation = relType['label_' + rel.relationship_direction];
          rel.client = clients[rel.client_contact_id].display_name;
        });
        $scope.relationsCount = contacts.count;
      });
    };
    $scope.$watch('tab', function(tab) {
      if (tab === 'relations' && !$scope.relations.length) {
        getRelations();
      }
    });
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
