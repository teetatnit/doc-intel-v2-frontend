import request from '@/utils/request';
import tokenManager from '@/utils/token';

const userProfile = tokenManager.decode(tokenManager.get());

export async function getMasterDatasListByParams(params) {
  return request(`${API_URL}/masterdatas`, {
    headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
    params: {
      sort: params.sorter,
      email: userProfile.ssoAccount,
    },
  }).then((res) => {
    return { data: res, success: true };
  });
}

export async function getMasterDatasList() {
  return request(`${API_URL}/masterdatas`).then((res) => {
    return res;
  });
}

export async function getMasterDataByMasterDataId(masterdata_id) {
  return request(`${API_URL}/masterdatas/${masterdata_id}`, {}).then((res) => {
    return { data: res[0], success: true };
  });
}

export async function getMasterDataItemsByMasterDataId(masterdata_id) {
  return request(`${API_URL}/masterdatas/${masterdata_id}/items`).then((res) => {
    return res;
  });
}

export async function updateMasterData(
  masterdata_id,
  document_code,
  vendor_code,
  additional_info,
  numberStyleId,
  ai_prompt,
  day_auto_duedate,
  items,
  delete_items,
) {
  return request(`${API_URL}/masterdatas/${masterdata_id}/update`, {
    method: 'POST',
    data: {
      masterdata_id: masterdata_id,
      document_code: document_code,
      vendor_code: vendor_code,
      additional_info:
        additional_info === undefined || additional_info === null ? '' : additional_info,
      number_style_id: numberStyleId,
      ai_prompt: ai_prompt,
      day_auto_duedate: parseInt(day_auto_duedate),
      items: items,
      delete_items: delete_items,
      update_by: userProfile.ssoAccount,
    },
  });
}

export async function createMasterData(data, items, state) {
  return request(`${API_URL}/masterdatas`, {
    method: 'POST',
    data: {
      document_code: data.document_code,
      vendor_code: data.vendor_code,
      additional_info:
        data.additional_info === undefined || data.additional_info === null
          ? ''
          : data.additional_info,
      model_id: data.model_id,
      model_template_id: data.model_template_id,
      number_style_id: data.number_style_id,
      ai_prompt: data.ai_prompt,
      day_auto_duedate: parseInt(data.day_auto_duedate),
      items: items,
      create_by: userProfile.ssoAccount,
      state: state,
    },
  });
}

export async function deleteMasterData(masterdata_id) {
  return request(`${API_URL}/masterdatas/${masterdata_id}/delete`, {
    method: 'POST',
    data: {
      is_active: 'N',
      update_by: userProfile.ssoAccount,
    },
  });
}

export async function getDefaultAIPrompt() {
  const aiPrompt = `Please help mapping the data at the top. Enter it with the data variable in the object below.: Form Type, Company, Vendor, Payment Type, Subject, Create Date, Due Date, GR Approval For, Currency, Creator, Requestor, Reviewer, Approver, CC, PO No., Document Type, Document No., Document Date, Amount (Exclude Vat.), VAT Rate, VAT Base Total Amount, WHT Rate, WHT Base Total Amount, Total Amount (Include Vat.), Payment Description, PO/Non-PO, Reference, Comment, Expense Code, Cost Center, Order no. (IO), Assignment, Alternative Payee, Payment For
You need to return value in JSON format.
For example,if you extract data "A" with value "ABC" and confidence at 80% you need to return with
{
  "data": {
    "A": "ABC"
  },
  "confidence" : {
    "A" : "80%"
  }
}
If you do not find the data, return the default value or null if there is no default value.
If the document is in Vietnamese, note that the number system uses a decimal comma and a period as a thousand separator.
Currency numbers must be returned as a float datatype.
Rates must be returned as values with a percent.
Date should return in this format YYYY-MM-DD.`

  return aiPrompt;
}
