(function(angular, $, _) {
  angular.module('civicase').directive('civicaseTypeDurationChart', function(crmApi) {
    return {
      restrict: 'AE',
      scope: {
        civicaseTypeDurationChart: '='
      },
      link: function($scope, $el, $attr) {
        var dc = CRM.visual.dc, d3 = CRM.visual.d3, crossfilter = CRM.visual.crossfilter;
        var ts = $scope.ts = CRM.ts('civicase');

        function fullDraw(data) {
          $el.find('svg').remove();

          var chart = dc.rowChart($el[0]),
            ndx                 = crossfilter(data),
            caseTypeDimension   = ndx.dimension(function(d) {return d['case_type_id.title'];}),
            countGroup          = caseTypeDimension.group().reduceSum(function(d) {return d.count;});

          chart
            .width(300)
            .height(125)
            .elasticX(true)
            .colors(d3.scale.category20())
            .dimension(caseTypeDimension)
            .group(countGroup)
            .title(function(d){return ts('%1 days', {1: d.value});})
            .render();

          chart.onClick = function(){};

          // CSS would be more maintainable, but that only works in Chrome.
          chart.svg().selectAll('rect').attr('rx', 5).attr('ry', 5);
        }

        $scope.$watchCollection('civicaseTypeDurationChart', function(params){
          // crmApi('Case', 'gettypestats', params).then(function(response){
          //   var data = response.values;
          var data = [
            {'case_type_id.title': 'Fixme', 'count': 32.1},
            {'case_type_id.title': 'Todo', 'count': 15.4},
            {'case_type_id.title': 'Blank', 'count': 13.2},
            {'case_type_id.title': 'Placeholder', 'count': 19.7}
          ];
            data.forEach(function(x) {
              x.count = +x.count;
            });
            fullDraw(data);
          // });
        });
      }
    };
  });
})(angular, CRM.$, CRM._);
