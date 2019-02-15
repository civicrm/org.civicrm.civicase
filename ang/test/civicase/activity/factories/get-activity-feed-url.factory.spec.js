/* eslint-env jasmine */

(function (_, activityStatusTypes, extractQueryStringParams) {
  describe('getActivityFeedUrl', function () {
    var $location, $route, $sce, activityFeedUrlObject, getActivityFeedUrl;

    beforeEach(module('civicase', function ($provide) {
      $location = jasmine.createSpyObj('$location', ['path']);
      $route = { current: { params: {} } };

      $provide.value('$location', $location);
      $provide.value('$route', $route);
    }));

    beforeEach(inject(function (_$sce_, _getActivityFeedUrl_) {
      $sce = _$sce_;
      getActivityFeedUrl = _getActivityFeedUrl_;
    }));

    describe('when getting the activity feed url from the dashboard page', function () {
      beforeEach(function () {
        $location.path.and.returnValue('/case');

        activityFeedUrlObject = getActivityFeedUrlAsObject();
      });

      it('returns an url pointing to the dashboard activity feed', function () {
        expect(activityFeedUrlObject.baseUrl).toBe('#/case');
        expect(activityFeedUrlObject.params.dtab).toBe('1');
      });
    });

    describe('when getting the activity feed url from the case details page', function () {
      beforeEach(function () {
        $location.path.and.returnValue('/case/list');

        activityFeedUrlObject = getActivityFeedUrlAsObject();
      });

      it('returns an url pointing to the case activity feed', function () {
        expect(activityFeedUrlObject.baseUrl).toBe('#/case/list');
        expect(activityFeedUrlObject.params.tab).toBe('activities');
      });
    });

    describe('when passing an activity id', function () {
      var activityId = _.uniqueId();

      beforeEach(function () {
        activityFeedUrlObject = getActivityFeedUrlAsObject({
          activityId: activityId
        });
      });

      it('filters activities by id', function () {
        expect(activityFeedUrlObject.params.aid).toBe(activityId);
      });
    });

    describe('when passing an activity category', function () {
      var category = _.uniqueId();

      beforeEach(function () {
        activityFeedUrlObject = getActivityFeedUrlAsObject({
          category: category
        });
      });

      it('filter activities by category', function () {
        expect(activityFeedUrlObject.params.af['activity_type_id.grouping']).toBe(category);
      });
    });

    describe('when passing an activity status type', function () {
      beforeEach(function () {
        activityFeedUrlObject = getActivityFeedUrlAsObject({
          statusType: 'completed'
        });
      });

      it('filter activities by status type', function () {
        expect(activityFeedUrlObject.params.af.status_id).toEqual(activityStatusTypes.completed);
      });
    });

    describe('when there are activity filters in the current route', function () {
      beforeEach(function () {
        $route.current.params.af = { status_id: [_.uniqueId()] };
        activityFeedUrlObject = getActivityFeedUrlAsObject();
      });

      it('preserves the current activity filters', function () {
        expect(activityFeedUrlObject.params.af).toEqual($route.current.params.af);
      });
    });

    describe('when requesting filters that already exist in the current route', function () {
      beforeEach(function () {
        $route.current.params.af = { status_id: [_.uniqueId()] };
        activityFeedUrlObject = getActivityFeedUrlAsObject({
          statusType: 'completed'
        });
      });

      it('overrides the current filters with the new ones', function () {
        expect(activityFeedUrlObject.params.af).toEqual({
          status_id: activityStatusTypes.completed
        });
      });
    });

    describe('when requesting the activities for a particular case', function () {
      var caseId = _.uniqueId();

      beforeEach(function () {
        activityFeedUrlObject = getActivityFeedUrlAsObject({
          caseId: caseId
        });
      });

      it('filters activities by case id', function () {
        expect(activityFeedUrlObject.params.caseId).toBe(caseId);
      });
    });

    /**
     * Returns the value returned by calling `getActivityFeedUrl` and gives
     * some extra information: the base URL, the query parameters, and the full
     * url path.
     *
     * @param {Object} urlParams the urlParams to pass to the `getActivityFeedUrl` service.
     * @return {Object} the base url, the query params, and the full url for the activity feed.
     */
    function getActivityFeedUrlAsObject (urlParams) {
      var wrappedActivityFeedUrl = getActivityFeedUrl(urlParams);
      var activityFeedUrl = $sce.valueOf(wrappedActivityFeedUrl);
      var activityFeedParams = extractQueryStringParams(activityFeedUrl);
      var baseUrl = activityFeedUrl.match(/^(.+)\?/)[1];

      return {
        baseUrl: baseUrl,
        params: activityFeedParams,
        url: activityFeedUrl
      };
    }
  });
})(
  CRM._,
  CRM.civicase.activityStatusTypes,
  CRM.testUtils.extractQueryStringParams
);
