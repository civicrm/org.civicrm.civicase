<table>
    <tr class="crm-case-form-block-civicaseRelatedCasesTab" id="civicaseRelatedCasesTab">
        <td class="label">{$form._qf_civicaseRelatedCasesTab.label}</td>
        <td>{$form._qf_civicaseRelatedCasesTab.html}<br />
            <span class="description">{ts}With this checkbox enabled cases from individuals who are directly related to the organisation will be displayed on the organisation records on a tab called "Related Cases".{/ts}</span>
        </td>
    </tr>
</table>
<script type="text/javascript">
    cj('form.CRM_Admin_Form_Setting_Case table.form-layout tbody').append(cj('#civicaseRelatedCasesTab'));
</script>