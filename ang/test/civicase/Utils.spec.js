/* eslint-env jasmine */

(function (_) {
  describe('Utils', function () {
    beforeEach(module('civicase', 'civicase.data'));

    describe('formatActivity', function () {
      var formatActivity, activityMock, ContactsDataService, contactMock;

      beforeEach(inject(function (_formatActivity_, _activitiesMockData_, _ContactsDataService_) {
        formatActivity = _formatActivity_;
        activityMock = _activitiesMockData_.get()[0];
        ContactsDataService = _ContactsDataService_;
        contactMock = { id: _.uniqueId(), display_name: 'John Snow' };

        spyOn(ContactsDataService, 'getCachedContact').and.returnValue(contactMock);
      }));

      describe('activity contact names', function () {
        var expectedContacts, returnedContacts;

        beforeEach(function () {
          activityMock.assignee_contact_id = [_.uniqueId()];
          activityMock.source_contact_id = _.uniqueId();
          activityMock.target_contact_id = [_.uniqueId()];
          expectedContacts = {
            assignee_contact_name: {},
            source_contact_name: {},
            target_contact_name: {}
          };
          expectedContacts.assignee_contact_name[contactMock.id] = contactMock.display_name;
          expectedContacts.source_contact_name[contactMock.id] = contactMock.display_name;
          expectedContacts.target_contact_name[contactMock.id] = contactMock.display_name;
          returnedContacts = formatActivity(activityMock);
        });

        it('requests the information for the assignee contact', function () {
          expect(ContactsDataService.getCachedContact).toHaveBeenCalledWith(activityMock.assignee_contact_id);
        });

        it('requests the information for the source contact', function () {
          expect(ContactsDataService.getCachedContact).toHaveBeenCalledWith(activityMock.source_contact_id);
        });

        it('requests the information for the target contact', function () {
          expect(ContactsDataService.getCachedContact).toHaveBeenCalledWith(activityMock.target_contact_id);
        });

        it('attaches all the related contact names to the activity', function () {
          expect(returnedContacts).toEqual(jasmine.objectContaining(expectedContacts));
        });
      });
    });
  });
})(CRM._);
