(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

  module.directive('contactCard', function ($document, ContactsDataService) {
    return {
      restrict: 'A',
      replace: true,
      templateUrl: '~/civicase/ContactCard.html',
      scope: {
        data: '=contacts',
        isAvatar: '=avatar',
        noIcon: '=noIcon'
      },
      link: contactCardLink
    };

    /**
     * Link function for contactCard directive
     *
     * @param {object} scope
     * @param {object} elem
     * @param {object} attrs
     */
    function contactCardLink (scope, elem, attrs) {
      scope.getContactIconOf = ContactsDataService.getContactIconOf;
      scope.isPopupVisible = false;
      scope.ts = CRM.ts('civicase');
      scope.url = CRM.url;

      (function init () {
        scope.$watch('data', refresh);
        $document.bind('click', closeDropdownIfClickedOutside);
      }());

      /**
       * Toggle dropdown visibility
       *
       * @param {object} $event
       */
      scope.toggleDropdownVisibility = function ($event) {
        scope.isPopupVisible = !scope.isPopupVisible;
        $event.stopPropagation();
      };

      /**
       * Close the Dropdown when clicked outside
       *
       * @param {object} event
       */
      function closeDropdownIfClickedOutside (event) {
        var isClickedElementChildOfPopup = elem
          .find(event.target)
          .length > 0;

        if (isClickedElementChildOfPopup) {
          return;
        }

        scope.$apply(function () {
          scope.isPopupVisible = false;
        });
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
          image_URL: ContactsDataService.getImageUrlOf(contactID)
        });
      }

      /**
       * Watch function for data refresh
       */
      function refresh () {
        if (_.isPlainObject(scope.data)) {
          scope.contacts = [];
          _.each(scope.data, function (name, contactID) {
            if (scope.isAvatar) {
              prepareAvatarData(name, contactID);
            } else {
              scope.contacts.push({display_name: name, contact_id: contactID});
            }
          });
        } else {
          scope.contacts = _.cloneDeep(scope.data);
        }
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
