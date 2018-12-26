(function (angular, $, _) {
  var module = angular.module('civicase');

  module.service('TagsActivityAction', TagsActivityAction);

  function TagsActivityAction ($rootScope, crmApi, dialogService) {
    /**
     * Add/Remove tags to activities
     *
     * @param {String} operation
     * @param {Array} activities
     */
    this.manageTags = function (operation, activities) {
      var title, saveButtonLabel;
      title = saveButtonLabel = 'Tag Activities';

      if (operation === 'remove') {
        title += ' (Remove)';
        saveButtonLabel = 'Remove tags from Activities';
      }

      dialogService.open('MoveCopyActCard', '~/civicase/ActivityActions--tags.html', {}, {
        autoOpen: false,
        height: 'auto',
        width: '40%',
        title: title,
        buttons: [{
          text: saveButtonLabel,
          icons: {primary: 'fa-check'},
          click: function () {
          }
        }]
      });
    };
  }
})(angular, CRM.$, CRM._);
