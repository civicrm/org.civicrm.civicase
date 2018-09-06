/* globals angular, CRM */

(function (angular, CRM) {
  angular.module('civicase').filter('crmUrl', function () {
    return crmUrlFilter;
  });

  /**
   * Returns the URL's complete path when provided a relative URL.
   *
   * @param {String} relativeUrl the relative URL path
   * @param {Object} query additional query parameters to append to the URL
   */
  function crmUrlFilter (relativeUrl, query) {
    return CRM.url(relativeUrl, query);
  }
})(angular, CRM);
