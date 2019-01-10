(function (angular, $, _) {
  var module = angular.module('civicase');

  module.directive('civicaseCaseDetailsPeopleTab', function () {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/case/case-details/people-tab/case-details-people-tab.directive.html',
      controller: civicaseViewPeopleController,
      scope: {
        item: '=civicaseCaseDetailsPeopleTab',
        refresh: '=refreshCallback'
      }
    };
  });

  module.controller('civicaseViewPeopleController', civicaseViewPeopleController);

  /**
   * ViewPeople Controller
   *
   * @param {Object} $scope
   * @param {Object} crmApi
   */

  function civicaseViewPeopleController ($scope, crmApi, DateHelper) {
    // The ts() and hs() functions help load strings for this module.
    var clients = _.indexBy($scope.item.client, 'contact_id');
    var item = $scope.item;
    var relTypes = CRM.civicase.relationshipTypes;
    var relTypesByName = _.indexBy(relTypes, 'name_b_a');
    var ts = $scope.ts = CRM.ts('civicase');

    $scope.allowMultipleCaseClients = CRM.civicase.allowMultipleCaseClients;
    $scope.roles = [];
    $scope.rolesFilter = '';
    $scope.rolesPage = 1;
    $scope.rolesAlphaFilter = '';
    $scope.rolesSelectionMode = '';
    $scope.rolesSelectedTask = '';
    $scope.relations = [];
    $scope.relationsPage = 1;
    $scope.relationsAlphaFilter = '';
    $scope.relationsSelectionMode = '';
    $scope.relationsSelectedTask = '';
    $scope.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    $scope.contactTasks = CRM.civicase.contactTasks;
    $scope.ceil = Math.ceil;
    $scope.allRoles = [];
    $scope.isRolesLoading = true;
    $scope.isRelationshipLoading = true;

    $scope.formatDate = DateHelper.formatDate;
    $scope.getRelations = getRelations;

    (function init () {
      $scope.$bindToRoute({expr: 'tab', param: 'peopleTab', format: 'raw', default: 'roles'});
      $scope.$watch('item', getCaseRoles, true);
      $scope.$watch('item.definition', function () {
        if ($scope.item && $scope.item.definition && $scope.item.definition.caseRoles) {
          $scope.allRoles = _.each(_.cloneDeep($scope.item.definition.caseRoles), formatRole);
        }
      });
      $scope.$watch('rolesFilter', getCaseRoles);
      $scope.$watch('tab', function (tab) {
        if (tab === 'relations' && !$scope.relations.length) {
          getRelations();
        }
      });
    }());

    /**
     * Get selected contacts from the selection bar
     *
     * @params {String} tab
     * @params {Boolean} onlyChecked
     */
    $scope.getSelectedContacts = function (tab, onlyChecked) {
      var idField = (tab === 'roles' ? 'contact_id' : 'id');
      if (onlyChecked || $scope[tab + 'SelectionMode'] === 'checked') {
        return _.collect(_.filter($scope[tab], {checked: true}), idField);
      } else if ($scope[tab + 'SelectionMode'] === 'all') {
        return _.collect(_.filter($scope[tab], function (el) {
          return el.contact_id;
        }), idField);
      }
      return [];
    };

    /**
     * On the contact tab all the records don't have some contact assigned
     * This filters the list with roles assigned to a contact.
     *
     * @param {Array} records
     */
    $scope.getCountOfRolesWithContacts = function (roles) {
      return _.filter(roles, function (role) {
        return role.contact_id;
      }).length;
    };

    /**
     * Sets selection mode
     *
     * @params {String} mode
     * @params {String} tab
     */
    $scope.setSelectionMode = function (mode, tab) {
      $scope[tab + 'SelectionMode'] = mode;
    };

    /**
     * Sets selected tab
     *
     * @params {String} tag
     */
    $scope.setTab = function (tab) {
      $scope.tab = tab;
    };

    /**
     * Filters result on the basis of letter clicked
     *
     * @params {String} letter
     * @params {String} tab
     */
    $scope.setLetterFilter = function (letter, tab) {
      if ($scope[tab + 'AlphaFilter'] === letter) {
        $scope[tab + 'AlphaFilter'] = '';
      } else {
        $scope[tab + 'AlphaFilter'] = letter;
      }

      if (tab === 'roles') {
        getCaseRoles();
      } else {
        $scope.getRelations();
      }
    };

    /**
     * Update the contacts with the task
     *
     * @params {String} tab
     */
    $scope.doContactTask = function (tab) {
      var task = $scope.contactTasks[$scope[tab + 'SelectedTask']];
      $scope[tab + 'SelectedTask'] = '';
      CRM.loadForm(CRM.url(task.url, {cids: $scope.getSelectedContacts(tab).join(',')}))
        .on('crmFormSuccess', $scope.refresh)
        .on('crmFormSuccess', function () {
          $scope.refresh();
          if (tab === 'relations') {
            $scope.getRelations();
          }
        });
    };

    /**
     * Assign the role to a contact
     *
     * @params {String} role
     * @params {Boolean} replace
     */
    $scope.assignRole = function (role, replace) {
      var message = '<input name="caseRoleSelector" placeholder="' + ts('Select Coantact') + '" />';
      if (role.role !== 'Client') {
        message = message + '<br/><textarea rows="3" cols="35" name="description" class="crm-form-textarea" style="margin-top: 10px;padding-left: 10px;border-color: #C2CFDE;color: #9494A4;" placeholder="Description"></textarea>';
      }
      CRM.confirm({
        title: replace ? ts('Replace %1', {1: role.role}) : ts('Add %1', {1: role.role}),
        message: message,
        open: function () {
          $('[name=caseRoleSelector]', this).crmEntityRef({create: true, api: {params: {contact_type: role.contact_type, contact_sub_type: role.contact_sub_type}, extra: ['display_name']}});
        }
      }).on('crmConfirm:yes', function () {
        var params;
        var apiCalls = [];
        var val = $('[name=caseRoleSelector]', this).val();
        var desc = $('[name=description]', this).val();
        if (replace) {
          apiCalls.push(unassignRoleCall(role));
        }
        if (val) {
          var newContact = $('[name=caseRoleSelector]', this).select2('data').extra.display_name;
          // Add case role
          if (role.relationship_type_id) {
            params = {
              relationship_type_id: role.relationship_type_id,
              start_date: 'now',
              contact_id_b: val,
              case_id: item.id,
              description: desc
            };
            _.each(item.client, function (client) {
              params['contact_id_a'] = client.contact_id;
              apiCalls.push(['Relationship', 'create', params]);
            });
          } else { // Add case client
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

    /**
     * Unassign the role to a contact
     *
     * @params {String} role
     */
    $scope.unassignRole = function (role) {
      CRM.confirm({
        title: ts('Remove %1', {1: role.role}),
        message: ts('Remove %1 as %2?', {1: role.display_name, 2: role.role})
      }).on('crmConfirm:yes', function () {
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

    function unassignRoleCall (role) {
      // Case Role
      if (role.relationship_type_id) {
        return ['Relationship', 'get', {
          relationship_type_id: role.relationship_type_id,
          contact_id_b: role.contact_id,
          case_id: item.id,
          is_active: 1,
          'api.Relationship.create': {is_active: 0, end_date: 'now'}
        }];
      } else { // Case Client
        return ['CaseContact', 'get', {
          case_id: item.id,
          contact_id: role.contact_id,
          'api.CaseContact.delete': {}
        }];
      }
    }

    /**
     * Formats the role in required format
     *
     * @params {Object} role
     */
    function formatRole (role) {
      var relType = relTypesByName[role.name];
      role.role = relType.label_b_a;
      role.contact_type = relType.contact_type_b;
      role.contact_sub_type = relType.contact_sub_type_b;
      role.description = (role.manager ? (ts('Case Manager.') + ' ') : '') + (relType.description || '');
      role.relationship_type_id = relType.id;
    }

    if ($scope.item && $scope.item.definition && $scope.item.definition.caseRoles) {
      $scope.allRoles = _.each(_.cloneDeep($scope.item.definition.caseRoles), formatRole);
    }
    /**
     * Updates the case roles list
     */
    function getCaseRoles () {
      var caseRoles, selected;
      var relDesc = [];
      var allRoles = [];
      if ($scope.item && $scope.item.definition && $scope.item.definition.caseRoles) {
        allRoles = _.each(_.cloneDeep($scope.item.definition.caseRoles), formatRole);
        // Case Roles loading completes after all Roles are fetched
        $scope.isRolesLoading = false;
      }
      caseRoles = $scope.rolesAlphaFilter ? [] : _.cloneDeep(allRoles);
      selected = $scope.getSelectedContacts('roles', true);
      if ($scope.rolesFilter) {
        caseRoles = $scope.rolesFilter === 'client' ? [] : [_.findWhere(caseRoles, {name: $scope.rolesFilter})];
      }

      // get relationship descriptions
      if (item['api.Relationship.get']) {
        _.each(item['api.Relationship.get'].values, function (relationship) {
          relDesc[relationship.contact_id_b + '_' + relationship.relationship_type_id] = relationship['description'] ? relationship['description'] : '';
          relDesc[relationship.contact_id_b + '_' + relationship.relationship_type_id + '_date'] = relationship.start_date;
        });
      }
      // get clients from the contacts
      _.each(item.contacts, function (contact) {
        var role = contact.relationship_type_id ? _.findWhere(caseRoles, {relationship_type_id: contact.relationship_type_id}) : null;
        if ((!role || role.contact_id) && contact.relationship_type_id) {
          role = _.cloneDeep(_.findWhere(allRoles, {relationship_type_id: contact.relationship_type_id}));
          if (!$scope.rolesFilter || role.name === $scope.rolesFilter) {
            caseRoles.push(role);
          }
        }
        // Apply filters
        if ($scope.rolesAlphaFilter && contact.display_name.toUpperCase().indexOf($scope.rolesAlphaFilter) < 0) {
          if (role) _.pull(caseRoles, role);
        } else if (role) {
          if (!$scope.rolesFilter || role.name === $scope.rolesFilter) {
            $.extend(role, {checked: selected.indexOf(contact.contact_id) >= 0}, contact);
          }
        } else if (!$scope.rolesFilter || $scope.rolesFilter === 'client') {
          caseRoles.push($.extend({role: ts('Client'), checked: selected.indexOf(contact.contact_id) >= 0}, contact));
        }
      });

      // Set description and start date for no clients case roles
      _.each(caseRoles, function (role, index) {
        if (role && role.role !== 'Client' && (role.contact_id + '_' + role.relationship_type_id in relDesc)) {
          caseRoles[index]['desc'] = relDesc[role.contact_id + '_' + role.relationship_type_id];
          caseRoles[index]['start_date'] = relDesc[role.contact_id + '_' + role.relationship_type_id + '_date'];
        }
      });
      $scope.rolesCount = caseRoles.length;
      // Apply pager
      if ($scope.rolesCount <= (25 * ($scope.rolesPage - 1))) {
        // Reset if out of range
        $scope.rolesPage = 1;
      }
      $scope.roles = _.slice(caseRoles, (25 * ($scope.rolesPage - 1)), 25 * $scope.rolesPage);
    }

    /**
     * Updates the case relationship list
     */
    function getRelations () {
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
        $scope.relations = _.each(contacts.values, function (rel) {
          var relType = relTypes[rel.relationship_type_id];
          rel.relation = relType['label_' + rel.relationship_direction];
          rel.client = clients[rel.client_contact_id].display_name;
        });
        $scope.relationsCount = contacts.count;
        $scope.isRelationshipLoading = false;
      });
    }
  }
})(angular, CRM.$, CRM._);
