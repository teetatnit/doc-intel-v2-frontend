/*
Creator:            Apiwat Emem
Creation date:      29/06/2021
*/

import request from '@/utils/request';
import tokenManager from '@/utils/token';

const userProfile = tokenManager.decode(tokenManager.get());

export async function upsertFavorite(masterdata_id, is_active) {
  return request(`${API_URL}/favorites/${masterdata_id}/upsert`, {
    method: 'POST',
    data: { 
      "masterdata_id": masterdata_id,
      "is_active" : is_active,
      "favorite_by" : userProfile.ssoAccount
    },
  });
}

