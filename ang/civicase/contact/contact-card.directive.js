(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

  module.directive('contactCard', function ($document, ContactsCache) {
    contactCardController.$inject = ['$scope'];

    return {
      restrict: 'A',
      replace: true,
      controller: contactCardController,
      templateUrl: '~/civicase/contact/contact-card.directive.html',
      scope: {
        data: '=contacts',
        isAvatar: '=avatar',
        noIcon: '=noIcon'
      }
    };

    function contactCardController (scope) {
      scope.ts = CRM.ts('civicase');
      scope.url = CRM.url;
      scope.mainContact = null;

      (function init () {
        scope.$watch('data', refresh);
      }());

      /**
       * Watch function for data refresh
       */
      function refresh () {
        scope.contacts = [];

        if (_.isPlainObject(scope.data)) {
          _.each(scope.data, function (name, contactID) {
            if (scope.isAvatar) {
              prepareAvatarData(name, contactID);
            } else {
              scope.contacts.push({display_name: name, contact_id: contactID});
            }
          });
        } else if (typeof scope.data === 'string') {
          if (scope.isAvatar) {
            prepareAvatarData(ContactsCache.getCachedContact(scope.data).display_name, scope.data);
          } else {
            scope.contacts.push({display_name: ContactsCache.getCachedContact(scope.data).display_name, contact_id: scope.data});
          }
        } else {
          scope.contacts = _.cloneDeep(scope.data);
        }
      }

      /**
       * Get initials from the sent parameter
       * Example: JD should be returned for John Doe
       *
       * @param {String} string
       * @return {String}
       */
      function getInitials (string) {
        var names = string.split(' ');
        var initials = names[0].substring(0, 1).toUpperCase();

        if (names.length > 1) {
          initials += names[names.length - 1].substring(0, 1).toUpperCase();
        }

        return initials;
      }

      /**
       * Prepares data when the directive is avatar
       *
       * @param {String} name
       * @param {String} contactID
       */
      function prepareAvatarData (name, contactID) {
        var avatarText;

        if (validateEmail(name)) {
          avatarText = name.substr(0, 1).toUpperCase();
        } else {
          avatarText = getInitials(name);
        }

        scope.contacts.push({
          display_name: name,
          contact_id: contactID,
          avatar: avatarText,
          image_URL: ContactsCache.getImageUrlOf(contactID)
        });
      }

      /**
       * Checks whether the sent parameter is a valid email address
       *
       * @param {String} email
       * @return {Boolean}
       */
      function validateEmail (email) {
        var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()\\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        return re.test(String(email).toLowerCase());
      }
    }
  });
})(angular, CRM.$, CRM._, CRM);
