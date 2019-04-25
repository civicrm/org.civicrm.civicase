<tr class="crm-case-form-block-allowCaseLocks">
  <td class="label">{$form.civicaseAllowCaseLocks.label}</td>
  <td>{$form.civicaseAllowCaseLocks.html}<br />
    <span class="description">{ts}This will allow cases to be locked for certain contacts.{/ts}</span>
  </td>
</tr>
<tr class="crm-case-form-block-allowCaseLocks">
  <td class="label">{$form.civicaseAllowCaseWebform.label}</td>
  <td>{$form.civicaseAllowCaseWebform.html}<br />
    <span class="description">{ts}This setting allows the user to set a webform to be triggered when clicking the "Add Case" button on the Cases tab on the Contact{/ts}</span>
  </td>
</tr>
<tr class="crm-case-form-block-webformUrl">
  <td class="label">{$form.civicaseWebformUrl.label}</td>
  <td>{$form.civicaseWebformUrl.html}<br />
    <span class="description">{ts}A Webform url e.g node/233{/ts}</span>
  </td>
</tr>

<script type="text/javascript">
  {literal}
    CRM.$(function($) {
      allowCaseWebformToggle();
      cj('input[name="civicaseAllowCaseWebform"]').click(function() {
        allowCaseWebformToggle();
      });
    });

  /**
   * Logic for what happens when the allow case webform radio button is
   * toggled.
   */
  function allowCaseWebformToggle() {
    var allowCaseWebform = cj('input[name="civicaseAllowCaseWebform"]:checked').val();
    if (allowCaseWebform === '0') {
      cj('.crm-case-form-block-webformUrl').hide();
    }
    else if (allowCaseWebform === '1') {
      cj('.crm-case-form-block-webformUrl').show();
    }
  }
  {/literal}
</script>
