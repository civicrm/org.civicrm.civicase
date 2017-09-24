(function(angular, $, _) {
  // "civicaseChartOpen" is a basic skeletal directive.
  // Example usage: <div civicase-chart-open="{foo: 1, bar: 2}"></div>
  angular.module('civicase').directive('civicaseChartOpen', function(doNutty, crmApi) {
    return {
      restrict: 'AE',
      scope: {
        civicaseChartOpen: '='
      },
      link: function($scope, $el, $attr) {
        var dc = CRM.visual.dc, d3 = CRM.visual.d3, crossfilter = CRM.visual.crossfilter;
        var ts = $scope.ts = CRM.ts('civicase');

        function fullDraw(data) {
          $el.find('svg').remove();

          var ndx = crossfilter(data);
          var caseTypeDimension = ndx.dimension(function(d) { return d.Type; });
          var caseTypeCountGroup = caseTypeDimension.group().reduceSum(function(d){return d.Count;});
          var caseTypeSum = ndx.groupAll().reduceSum(function(d){return d.Count;});

          var chart = dc.pieChart($el[0]);
          chart
              .slicesCap(5)
              .dimension(caseTypeDimension)
              .group(caseTypeCountGroup)
              .label(function(d) {return "";});

          var myFormat = d3.format(".3s");
          doNutty(chart, 250, "total", function(){
            return myFormat(caseTypeSum.value());
          });

          chart.render();
        }

        $scope.$watchCollection('civicaseChartOpen', function(newValue){
          console.log('ChartOpen', newValue);
          var data = [
            {Type: 'Housing Support', Count: '64000'},
            {Type: 'Adult Day Care', Count: '3721'},
            {Type: 'Adult Day Care', Count: '7'},
            {Type: 'Speaking', Count: '1522'}
          ];
          data.forEach(function(x) {
            x.Count = +x.Count;
          });
          fullDraw(data);
        });
      }
    };
  });
})(angular, CRM.$, CRM._);
