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

      getTags()
        .then(function (tags) {
          console.log(prepareGenericTags(tags));
          console.log(prepareTagSetsTree(tags));
        });

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

    /**
     * Get the tags for Activities from API end point
     *
     * @return {Promise}
     */
    function getTags () {
      return crmApi([['Tag', 'get', {
        'sequential': 1,
        'used_for': { 'LIKE': '%civicrm_activity%' }
      }]]).then(function (data) {
        return data[0].values;
      });
    }

    /**
     * Recursive function to prepare the generic tags
     *
     * @param {Array} tags
     * @param {String} parentID
     * @param {int} level
     * @return {Array}
     */
    function prepareGenericTags (tags, parentID, level) {
      var returnArray = [];

      level = typeof level !== 'undefined' ? level : 0;
      parentID = typeof parent !== 'undefined' ? parentID : undefined;

      var filteredTags = _.filter(tags, function (child) {
        return child.parent_id === parentID && child.is_tagset === '0';
      });

      if (!_.isEmpty(filteredTags)) {
        _.each(filteredTags, function (tag) {
          returnArray.push(tag);
          tag.name = '&nbsp;'.repeat(level * 2) + tag.name;
          returnArray = returnArray.concat(prepareGenericTags(tags, tag.id, level + 1));
        });
      }

      return returnArray;
    }

    /**
     * Prepares the tag sets tree
     *
     * @param {Array} tags
     * @return {Array}
     */
    function prepareTagSetsTree (tags) {
      var returnArray = [];

      var filteredTags = _.filter(tags, function (child) {
        return !child.parent_id && child.is_tagset === '1';
      });

      if (!_.isEmpty(filteredTags)) {
        _.each(filteredTags, function (tag) {
          var children = _.filter(tags, function (child) {
            return child.parent_id === tag.id && child.is_tagset === '0';
          });

          if (children.length > 0) {
            tag.children = children;
          }

          returnArray.push(tag);
        });
      }

      return returnArray;
    }
  }
})(angular, CRM.$, CRM._);
