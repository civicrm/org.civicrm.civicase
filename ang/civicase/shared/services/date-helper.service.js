(function (angular, $, _, CRM) {
  var module = angular.module('civicase');

  module.service('DateHelper', DateHelper);

  function DateHelper () {
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
