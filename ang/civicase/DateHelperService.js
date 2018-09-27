(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

  module.service('DateHelper', DateHelper);

  function DateHelper () {
    /**
     * To check if the date is overdue
     *
     * @param {Object} activity object
     * @return {Boolean} if the date is overdue.
     */
    this.isOverdue = function (activity) {
      if (typeof activity.is_overdue !== 'undefined') {
        return typeof (activity.is_overdue) !== 'boolean' ? activity.is_overdue === '1' : activity.is_overdue;
      }
    };

    /**
     * Formats Date in sent format
     * Default format is (DD/MM/YYYY)
     *
     * @param {String} date ISO string
     * @param {String} format ISO string
     * @return {String} the formatted date
     */
    this.formatDate = function (date, format) {
      format = format || 'DD/MM/YYYY';

      return moment(date).format(format);
    };
  }
})(angular, CRM.$, CRM._, CRM);
