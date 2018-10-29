(function (angular, CRM) {
  var module = angular.module('civicase');

  module.filter('civicaseCrmUrl', function () {
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
