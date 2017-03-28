(function(angular, $, _) {

  function caseFilesController($scope, crmApi, crmBlocker, crmStatus, FileUploader) {
    var ts = $scope.ts = CRM.ts('civicase'),
      ctx = $scope.ctx,
      block = $scope.block = crmBlocker();

    function initActivity() {
      $scope.activity = {
        case_id: ctx.id,
        activity_type_id: 'File Upload',
        subject: ''
      };
    }
    initActivity();
    $scope.$watchCollection('ctx.id', initActivity);

    $scope.isUploadActive = function() {
      return ($scope.uploader.queue.length > 0);
    };

    $scope.uploader = new FileUploader({
      url: CRM.url('civicrm/ajax/attachment'),
      onAfterAddingFile: function onAfterAddingFile(item) {
        item.crmData = {description: ''};
      },
      onSuccessItem: function onSuccessItem(item, response, status, headers) {
        console.log('onSuccessItem');
        //   $scope.files.push(response.file.values[response.file.id]);
        //   $scope.uploader.removeFromQueue(item);
      },
      onErrorItem: function onErrorItem(item, response, status, headers) {
        console.log('onErrorItem');
        var msg = (response && response.file && response.file.error_message) ? response.file.error_message : ts('Unknown error');
        CRM.alert(item.file.name + ' - ' + msg, ts('Attachment failed'));
        // $scope.uploader.removeFromQueue(item);
      },
      onCompleteAll: function() {
        console.log('onCompleteAll');
        $scope.uploader.clearQueue();
        initActivity();
      }
    });

    $scope.deleteActivity = function deleteActivity() {
      $scope.uploader.clearQueue();
      $scope.activity = null;
    };

    $scope.saveActivity = function saveActivity() {
      var promise = crmApi('Activity', 'create', $scope.activity)
        .then(function (r) {
          var target = {entity_table: 'civicrm_activity', entity_id: r.id};
          _.each($scope.uploader.getNotUploadedItems(), function (item) {
            item.formData = [_.extend({crm_attachment_token: CRM.crmAttachment.token}, target, item.crmData)];
          });
          $scope.uploader.uploadAll();
        });
      return block(crmStatus({start: ts('Uploading...'), success: ts('Uploaded')}, promise));
    };

    // TODO: Test interrupted transfer.
  }

  angular.module('civicase').directive('civicaseUploader', function() {
    return {
      restrict: 'A',
      templateUrl: '~/civicase/CaseUploader.html',
      controller: caseFilesController,
      scope: {
        ctx: '=civicaseUploader'
      }
    };
  });

})(angular, CRM.$, CRM._);
