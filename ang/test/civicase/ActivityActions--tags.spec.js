/* eslint-env jasmine */

(function (_, $) {
  describe('TagsActivityAction', function () {
    var $q, $rootScope, TagsActivityAction, activitiesMockData, TagsMockData,
      crmApiMock, dialogServiceMock;

    beforeEach(module('civicase', 'civicase.data', function ($provide) {
      crmApiMock = jasmine.createSpy('crmApi');
      dialogServiceMock = jasmine.createSpyObj('dialogService', ['open']);

      $provide.value('crmApi', crmApiMock);
      $provide.value('dialogService', dialogServiceMock);
    }));

    beforeEach(inject(function (_$q_, _$rootScope_, _activitiesMockData_, _TagsMockData_,
      _TagsActivityAction_) {
      $q = _$q_;
      $rootScope = _$rootScope_;
      activitiesMockData = _activitiesMockData_;
      TagsMockData = _TagsMockData_;
      TagsActivityAction = _TagsActivityAction_;

      spyOn($.fn, 'dialog');
      spyOn($rootScope, '$emit');
    }));

    describe('Add Tags to Activities bulk action', function () {
      var modalOpenCall;

      beforeEach(function () {
        crmApiMock.and.returnValue($q.resolve([{ values: TagsMockData.get() }]));
        TagsActivityAction.manageTags('add', activitiesMockData.get());
        $rootScope.$digest();
        modalOpenCall = dialogServiceMock.open.calls.mostRecent().args;
      });

      it('fetches the tags from the api endpoint', function () {
        expect(crmApiMock).toHaveBeenCalledWith([['Tag', 'get', {
          'sequential': 1,
          'used_for': { 'LIKE': '%civicrm_activity%' }
        }]]);
      });

      it('sets the title of the modal as "Tag Activities"', function () {
        expect(modalOpenCall[3].title).toBe('Tag Activities');
      });

      it('sets the text of the save button of the modal as "Tag Activities"', function () {
        expect(modalOpenCall[3].buttons[0].text).toBe('Tag Activities');
      });

      it('does not have any selected generic tags initially', function () {
        expect(modalOpenCall[2].selectedGenericTags.length).toBe(0);
      });

      describe('when generic tags are toggled', function () {
        describe('when a checkbox is enabled', function () {
          beforeEach(function () {
            modalOpenCall[2].toggleGenericTags(modalOpenCall[2], TagsMockData.get(0).id);
          });

          it('add the clicked tag as a selected tag', function () {
            expect(modalOpenCall[2].selectedGenericTags).toEqual([TagsMockData.get(0).id]);
          });
        });

        describe('when a checkbox is disabled after being enabled', function () {
          beforeEach(function () {
            modalOpenCall[2].toggleGenericTags(modalOpenCall[2], TagsMockData.get(0).id);
            modalOpenCall[2].toggleGenericTags(modalOpenCall[2], TagsMockData.get(0).id);
          });

          it('removes the clicked tag as a selected tag', function () {
            expect(modalOpenCall[2].selectedGenericTags).toEqual([]);
          });
        });
      });

      describe('generic tags', function () {
        describe('generic tags does not include tagsets', function () {
          var genericTagsHasTagSets;

          beforeEach(function () {
            genericTagsHasTagSets = false;

            modalOpenCall[2].genericTags.forEach(function (tag) {
              if (tag.is_tagset !== '0') {
                genericTagsHasTagSets = true;
              }
            });
          });

          it('does not include tagsets as generic tags', function () {
            expect(genericTagsHasTagSets).toBe(false);
          });
        });

        describe('child tags are indented in the UI', function () {
          var tagWhichHaveOneLevelOfParent, tagWhichHaveTwoLevelofParent;

          beforeEach(function () {
            tagWhichHaveOneLevelOfParent = _.find(modalOpenCall[2].genericTags, function (tag) {
              return tag.name === 'L1';
            });
            tagWhichHaveTwoLevelofParent = _.find(modalOpenCall[2].genericTags, function (tag) {
              return tag.name === 'L2';
            });
          });

          it('does not include tagsets as generic tags', function () {
            expect(tagWhichHaveOneLevelOfParent.indentationLevel).toBe(1);
            expect(tagWhichHaveTwoLevelofParent.indentationLevel).toBe(2);
          });
        });
      });

      describe('tagsets', function () {
        describe('tagsets does not include generic tags', function () {
          var tagSetsHasGenericTags;

          beforeEach(function () {
            tagSetsHasGenericTags = false;

            modalOpenCall[2].tagSets.forEach(function (tag) {
              if (tag.is_tagset === '0') {
                tagSetsHasGenericTags = true;
              }
            });
          });

          it('does not include generic tags as tagsets', function () {
            expect(tagSetsHasGenericTags).toBe(false);
          });
        });

        describe('each tag set has its child tags set as child', function () {
          var eachTagSetHasItsOwnChild = true;

          beforeEach(function () {
            _.each(modalOpenCall[2].tagSets, function (parentTag) {
              _.each(parentTag.children, function (tag) {
                if (tag.parent_id !== parentTag.id) {
                  eachTagSetHasItsOwnChild = false;
                }
              });
            });
          });

          it('saves every child tag as its parent\'s child', function () {
            expect(eachTagSetHasItsOwnChild).toBe(true);
          });
        });
      });

      it('opens the modal to add tags', function () {
        expect(dialogServiceMock.open).toHaveBeenCalledWith(
          'TagsActivityAction',
          '~/civicase/ActivityActions--tags.html',
          jasmine.any(Object),
          jasmine.any(Object)
        );
      });

      describe('when the save button is clicked', function () {
        beforeEach(function () {
          modalOpenCall[2].toggleGenericTags(modalOpenCall[2], TagsMockData.get()[0].id);
          modalOpenCall[3].buttons[0].click();
        });

        describe('api calls', function () {
          var apiCalls = [];

          beforeEach(function () {
            _.each(activitiesMockData.get(), function (activity) {
              apiCalls.push(['EntityTag', 'create', {
                entity_table: 'civicrm_activity',
                entity_id: activity.id,
                tag_id: [TagsMockData.get()[0].id]
              }]);
            });
          });

          it('saves the selected tags to the selected activities', function () {
            expect(crmApiMock).toHaveBeenCalledWith(apiCalls);
          });
        });

        it('closes the dialog', function () {
          expect($.fn.dialog).toHaveBeenCalledWith('close');
        });
      });
    });

    describe('Remove Tags to Activities bulk action', function () {
      var modalOpenCall;

      beforeEach(function () {
        crmApiMock.and.returnValue($q.resolve([{ values: TagsMockData.get() }]));
        TagsActivityAction.manageTags('remove', activitiesMockData.get());
        $rootScope.$digest();
        modalOpenCall = dialogServiceMock.open.calls.mostRecent().args;
      });

      it('fetches the tags from the api endpoint', function () {
        expect(crmApiMock).toHaveBeenCalledWith([['Tag', 'get', {
          'sequential': 1,
          'used_for': { 'LIKE': '%civicrm_activity%' }
        }]]);
      });

      it('sets the title of the modal as "Tag Activities (Remove)"', function () {
        expect(modalOpenCall[3].title).toBe('Tag Activities (Remove)');
      });

      it('sets the text of the save button of the modal as "Remove tags from Activities"', function () {
        expect(modalOpenCall[3].buttons[0].text).toBe('Remove tags from Activities');
      });

      it('does not have any selected generic tags initially', function () {
        expect(modalOpenCall[2].selectedGenericTags.length).toBe(0);
      });

      describe('when generic tags are toggled', function () {
        describe('when a checkbox is enabled', function () {
          beforeEach(function () {
            modalOpenCall[2].toggleGenericTags(modalOpenCall[2], TagsMockData.get(0).id);
          });

          it('add the clicked tag as a selected tag', function () {
            expect(modalOpenCall[2].selectedGenericTags).toEqual([TagsMockData.get(0).id]);
          });
        });

        describe('when a checkbox is disabled after being enabled', function () {
          beforeEach(function () {
            modalOpenCall[2].toggleGenericTags(modalOpenCall[2], TagsMockData.get(0).id);
            modalOpenCall[2].toggleGenericTags(modalOpenCall[2], TagsMockData.get(0).id);
          });

          it('removes the clicked tag as a selected tag', function () {
            expect(modalOpenCall[2].selectedGenericTags).toEqual([]);
          });
        });
      });

      describe('generic tags', function () {
        describe('generic tags does not include tagsets', function () {
          var genericTagsHasTagSets;

          beforeEach(function () {
            genericTagsHasTagSets = false;

            modalOpenCall[2].genericTags.forEach(function (tag) {
              if (tag.is_tagset !== '0') {
                genericTagsHasTagSets = true;
              }
            });
          });

          it('does not include tagsets as generic tags', function () {
            expect(genericTagsHasTagSets).toBe(false);
          });
        });

        describe('child tags are indented in the UI', function () {
          var tagWhichHaveOneLevelOfParent, tagWhichHaveTwoLevelofParent;

          beforeEach(function () {
            tagWhichHaveOneLevelOfParent = _.find(modalOpenCall[2].genericTags, function (tag) {
              return tag.name === 'L1';
            });
            tagWhichHaveTwoLevelofParent = _.find(modalOpenCall[2].genericTags, function (tag) {
              return tag.name === 'L2';
            });
          });

          it('does not include tagsets as generic tags', function () {
            expect(tagWhichHaveOneLevelOfParent.indentationLevel).toBe(1);
            expect(tagWhichHaveTwoLevelofParent.indentationLevel).toBe(2);
          });
        });
      });

      describe('tagsets', function () {
        describe('tagsets does not include generic tags', function () {
          var tagSetsHasGenericTags;

          beforeEach(function () {
            tagSetsHasGenericTags = false;

            modalOpenCall[2].tagSets.forEach(function (tag) {
              if (tag.is_tagset === '0') {
                tagSetsHasGenericTags = true;
              }
            });
          });

          it('does not include generic tags as tagsets', function () {
            expect(tagSetsHasGenericTags).toBe(false);
          });
        });

        describe('each tag set has its child tags set as child', function () {
          var eachTagSetHasItsOwnChild = true;

          beforeEach(function () {
            _.each(modalOpenCall[2].tagSets, function (parentTag) {
              _.each(parentTag.children, function (tag) {
                if (tag.parent_id !== parentTag.id) {
                  eachTagSetHasItsOwnChild = false;
                }
              });
            });
          });

          it('saves every child tag as its parent\'s child', function () {
            expect(eachTagSetHasItsOwnChild).toBe(true);
          });
        });
      });

      it('opens the modal to remove tags', function () {
        expect(dialogServiceMock.open).toHaveBeenCalledWith(
          'TagsActivityAction',
          '~/civicase/ActivityActions--tags.html',
          jasmine.any(Object),
          jasmine.any(Object)
        );
      });

      describe('when the save button is clicked', function () {
        beforeEach(function () {
          modalOpenCall[2].toggleGenericTags(modalOpenCall[2], TagsMockData.get()[0].id);
          modalOpenCall[3].buttons[0].click();
        });

        describe('api calls', function () {
          var apiCalls = [];

          beforeEach(function () {
            _.each(activitiesMockData.get(), function (activity) {
              apiCalls.push(['EntityTag', 'delete', {
                entity_table: 'civicrm_activity',
                entity_id: activity.id,
                tag_id: [TagsMockData.get()[0].id]
              }]);
            });
          });

          it('deletes the selected tags to the selected activities', function () {
            expect(crmApiMock).toHaveBeenCalledWith(apiCalls);
          });
        });

        it('closes the dialog', function () {
          expect($.fn.dialog).toHaveBeenCalledWith('close');
        });
      });
    });
  });
})(CRM._, CRM.$);
