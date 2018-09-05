<?php

class CRM_Civicase_Page_ActivityFiles {

  /**
   * Download all activity files contained in a single zip file.
   */
  public static function downloadAll() {
    $activity = self::getActivityFromRequest();

    $zipName = self::getZipName($activity);
    $zipDestination = self::getDestinationPath();
    $zipFullPath = $zipDestination . '/' . $zipName;
    $files = self::getActivityFilePaths($activity['id']);

    self::createOrUpdateZipFile($zipFullPath, $files);
    self::downloadZipFile($zipFullPath);
  }

  /**
   * Returns the activity specified by the request. In case the request gives
   * an invalid activity id it throws a 404 status code.
   */
  private static function getActivityFromRequest() {
    $activityId = CRM_Utils_Array::value('activity_id', $_GET);
    self::validateActivityId($activityId);

    $activityResult = civicrm_api3('Activity', 'get', ['id' => $activityId]);

    if ($activityResult['count'] === 0) {
      return self::throw404StatusCode();
    }

    return CRM_Utils_Array::first($activityResult['values']);
  }

  /**
   * Validates that the activity id was provided. If not, it returns a 404 status code.
   *
   * @param string|null $activityId
   */
  private static function validateActivityId($activityId) {
    if (empty($activityId)) {
      self::throw404StatusCode();
    }
  }

  /**
   * Throws a 404 status code and closes the connection.
   */
  private static function throw404StatusCode() {
    http_response_code(404);
    CRM_Utils_System::civiExit();
  }

  /**
   * Given an activity, it returns the name for the zip file containing all of
   * its files. Ex: 123-department-relocation.zip
   *
   * @param array $activity
   *
   * @return string
   */
  private static function getZipName($activity) {
    $activitySlug = CRM_Utils_String::munge($activity['subject'], '-');

    return $activity['id'] . '-' . $activitySlug . '.zip';
  }

  /**
   * Returns the destination path for the zip file.
   *
   * @return string
   */
  private static function getDestinationPath() {
    $config = CRM_Core_Config::singleton();

    return $config->customFileUploadDir;
  }

  /**
   * Returns a list of file paths that are part of a given activity.
   *
   * @param int $activityId
   *
   * @return array
   */
  private static function getActivityFilePaths($activityId) {
    $filePaths = [];
    $activityFiles = CRM_Core_BAO_File::getEntityFile('civicrm_activity', $activityId);

    foreach ($activityFiles as $activityFile) {
      $filePaths[] = $activityFile['fullPath'];
    }

    return $filePaths;
  }

  /**
   * Creates or updates a zip file at the given path and containing the given files.
   *
   * @param string $zipFullPath
   * @param array $filePaths
   */
  private static function createOrUpdateZipFile($zipFullPath, $filePaths) {
    $zipName = basename($zipFullPath);
    $zip = new ZipArchive();
    $mode = ZipArchive::CREATE | ZipArchive::OVERWRITE;
    $zip->open($zipFullPath, $mode);

    foreach ($filePaths as $filePath) {
      $fileName = basename($filePath);

      $zip->addFile($filePath, $fileName);
    }

    $zip->close();
  }

  /**
   * Setups the given zip file so it can be downloaded by the browser.
   *
   * @param string $zipFullPath
   */
  private static function downloadZipFile($zipFullPath) {
    $zipName = basename($zipFullPath);
    $fileResource = NULL;

    readfile($zipFullPath, FALSE, $fileResource);
    CRM_Utils_System::download($zipName, 'application/zip', $fileResource);
  }

}
