/* eslint-env jasmine */
(function (CRM, _) {
  describe('crmUrl', function () {
    var $filter, crmUrl;

    beforeEach(module('civicase'));

    beforeEach(inject(function (_$filter_) {
      $filter = _$filter_;
      CRM.url = jasmine.createSpy('url');

      initCrmUrlFilter();
    }));

    describe('getting the href', function () {
      var hrefLocation;
      var expectedHref = '/civicrm/a/civicase';
      var expectedHrefLocation = 'http://civicrm.org/' + expectedHref;
      var expectedQuery = { cid: _.uniqueId() };

      beforeEach(function () {
        CRM.url.and.returnValue(expectedHrefLocation);

        hrefLocation = crmUrl(expectedHref, expectedQuery);
      });

      it('passes the href and query to CRM url', function () {
        expect(CRM.url).toHaveBeenCalledWith(expectedHref, expectedQuery);
      });

      it('returns the result from CRM url', function () {
        expect(hrefLocation).toEqual(expectedHrefLocation);
      });
    });

    /**
     * Initializes the CRM Url filter and stores it in a variable.
     */
    function initCrmUrlFilter () {
      crmUrl = $filter('crmUrl');
    }
  });
})(CRM, CRM._);
