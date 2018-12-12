/* eslint-env jasmine */
(function (_) {
  describe('CasesUtils', function () {
    var CasesData, ContactsDataService, CasesUtils;

    beforeEach(module('civicase', 'civicase.data', 'civicase.templates'));

    beforeEach(inject(function (_ContactsDataService_, _CasesData_, _CasesUtils_) {
      ContactsDataService = _ContactsDataService_;
      CasesData = _CasesData_;
      CasesUtils = _CasesUtils_;

      spyOn(ContactsDataService, 'add');
    }));

    describe('fetchMoreContactsInformation()', function () {
      beforeEach(function () {
        var cases = CasesData.get().values[0];

        cases.contacts = [{ contact_id: 1 }];
        cases.allActivities = [{}];
        cases.allActivities[0].assignee_contact_id = [2];
        cases.allActivities[0].target_contact_id = [3];
        cases.allActivities[0].source_contact_id = 4;

        CasesUtils.fetchMoreContactsInformation([cases]);
      });

      it('fetches all contacts of the case', function () {
        expect(ContactsDataService.add).toHaveBeenCalledWith([1, 2, 3, 4]);
      });
    });
  });
})(CRM._);
