<?php

class CRM_Civicase_RelatedCases {

  /**
   * Retrieve contact ids of all contacts(with cases) related to given Organization contact.
   *
   * @param int $organizationId
   *
   * @return array
   */
  public function getOrganizationRelatedCaseContactIds($organizationId, $countOnly=FALSE) {
    if(!$organizationId) {
      return array();
    }
    $sql = 'SELECT';
    if($countOnly) {
      $sql .= ' COUNT(cc.case_id) ';
    }
    else {
      $sql .= ' rel.contact_id_a as id ';
    }
    $sql .= "FROM civicrm_case_contact AS cc
      INNER JOIN civicrm_relationship AS rel ON rel.contact_id_a = cc.contact_id
      INNER JOIN civicrm_relationship_type AS rtype ON rel.relationship_type_id = rtype.id
      WHERE 'Organization' IN (rtype.contact_type_a, rtype.contact_type_b)
      AND %1 = CASE
        WHEN (rtype.contact_type_a = 'Organization') THEN rel.contact_id_a
        ELSE rel.contact_id_b
      END";
    $all = CRM_Core_DAO::executeQuery($sql, array(
      1 => array($organizationId, 'Integer'),
    ));
    if($countOnly) {
      return $all->fetchValue();
    }
    $all = $all->fetchAll();
    $ids = array();
    foreach($all as $each) {
      if(!in_array($each['id'], $ids))
        $ids[] = $each['id'];
    }
    return $ids;
  }

  /**
   * Retrieve count of all cases of all contacts that are related to given Organization contact.
   *
   * @param int $organizationId
   * @return int
   */
  public function getOrganizationRelatedCasesCount($organizationId) {
    return $this->getOrganizationRelatedCaseContactIds($organizationId, TRUE);
  }

  /**
   * Retrieve contact type for given contact id
   *
   * @param int $contact_id
   * @return string
   */
  public function getContactType($contact_id) {
    $sql = "SELECT contact_type FROM civicrm_contact
      WHERE id = %1";
    return CRM_Core_DAO::executeQuery($sql, array(
      1 => array($contact_id, 'Integer'),
    ))->fetchValue();
  }
}

