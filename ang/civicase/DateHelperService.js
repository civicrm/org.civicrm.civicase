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
      var isOverdue;

      if (activity.is_overdue) {
        isOverdue = typeof (activity.is_overdue) !== 'boolean' ? activity.is_overdue === '1' : activity.is_overdue;
      } else {
        isOverdue = moment(activity.activity_date_time).isBefore(moment());
      }

      return isOverdue;
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
