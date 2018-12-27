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
          var model = setModelObjectForModal(tags);

          openTagsModal(model, title, saveButtonLabel);
        });
    };

    /**
     * Set the model object to be used in the modal
     *
     * @param {Array} tags
     * @return {Object}
     */
    function setModelObjectForModal (tags) {
      var model = {};

      model.genericTags = prepareGenericTags(tags);
      model.tagSets = prepareTagSetsTree(tags);

      model.selectedGenericTags = [];
      model.toggleGenericTags = toggleGenericTags;

      return model;
    }

    /**
     * Toggle the State of Generic tags
     *
     * @param {Object} model
     * @param {String} tagID
     */
    function toggleGenericTags (model, tagID) {
      if (model.selectedGenericTags.indexOf(tagID) === -1) {
        model.selectedGenericTags.push(tagID);
      } else {
        model.selectedGenericTags = _.reject(model.selectedGenericTags, function (tag) {
          return tag === tagID;
        });
      }
    }

    /**
     * Opens the modal for addition/removal of tags
     *
     * @param {Object} model
     * @param {String} title
     * @param {String} saveButtonLabel
     */
    function openTagsModal (model, title, saveButtonLabel) {
      dialogService.open('MoveCopyActCard', '~/civicase/ActivityActions--tags.html', model, {
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
    }

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
            if (child.parent_id === tag.id && child.is_tagset === '0') {
              child.text = child.name;
              return true;
            }
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
