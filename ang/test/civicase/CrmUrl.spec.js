/* eslint-env jasmine */
(function (CRM, _) {
  describe('CrmUrl', function () {
    var $componentController, crmUrl;

    beforeEach(module('civicase'));

    beforeEach(inject(function (_$componentController_) {
      $componentController = _$componentController_;
      CRM.url = jasmine.createSpy('url');
    }));

    describe('getHrefLocation', function () {
      var hrefLocation;
      var expectedHref = '/civicrm/a/civicase';
      var expectedHrefLocation = 'http://civicrm.org/' + expectedHref;
      var expectedQuery = { cid: _.uniqueId() };

      beforeEach(function () {
        CRM.url.and.returnValue(expectedHrefLocation);
        initCrmUrlComponent({
          href: expectedHref,
          query: expectedQuery
        });

        hrefLocation = crmUrl.getHrefLocation();
      });

      it('passes the href and query to CRM url', function () {
        expect(CRM.url).toHaveBeenCalledWith(expectedHref, expectedQuery);
      });

      it('returns the result from CRM url', function () {
        expect(hrefLocation).toEqual(expectedHrefLocation);
      });
    });

    /**
     * Initializes the CRM Url component and stores it in a variable.
     *
     * @param {Object} bindings dependencies to pass to the component as bindings.
     */
    function initCrmUrlComponent (bindings) {
      crmUrl = $componentController('crmUrl', null, bindings || {});
    }
  });
})(CRM, CRM._);
