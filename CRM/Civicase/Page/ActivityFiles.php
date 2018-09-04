<?php

class CRM_Civicase_Page_ActivityFiles {

  /**
   * Download all activity files contained in a single zip file.
   */
  public static function downloadAll() {
    $activityId = CRM_Utils_Array::value('activity_id', $_GET);

    self::validateActivityId($activityId);

    $zipName = 'activity-' . $activityId . '-files.zip';
    $zipDestination = self::getDestinationPath();
    $zipFullPath = $zipDestination . '/' . $zipName;
    $files = self::getActivityFilePaths($activityId);

    self::createOrUpdateZipFile($zipFullPath, $files);
    self::downloadZipFile($zipFullPath);
  }

  /**
   * Validates that the activity id was provided. If not, it returns a 404 status code.
   *
   * @param string|null $activityId
   */
  private static function validateActivityId($activityId) {
    if (empty($activityId)) {
      http_response_code(404);
      CRM_Utils_System::civiExit();
    }
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
      $zip->addFile($filePath, substr($filePath, strrpos($filePath, '/') + 1));
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

    header('Content-Type: application/zip');
    header('Content-disposition: attachment; filename=' . $zipName);
    header('Content-Length: ' . filesize($zipFullPath));

    readfile($zipFullPath);

    CRM_Utils_System::civiExit();
  }

}
