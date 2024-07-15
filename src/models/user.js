import tokenManager from '@/utils/token';
import { queryCurrent, query as queryUsers } from '@/services/user';

const UserModel = {
  namespace: 'user',
  state: {
    currentUser: {},
  },
  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },

    *fetchCurrent(_, { call, put }) {
      const userProfile = tokenManager.decode(tokenManager.get());
      yield put({
        type: 'saveCurrentUser',
        payload: {
          name: userProfile.ssoAccount,
          fullName : userProfile.fullName,
          avatar: `https://gdc.scg.com/images/empPhoto/cementhai_${userProfile.ssoAccount}_LThumb.jpg`,
          userid: userProfile.ssoAccount,
        }
      });
    },
  },
  reducers: {
    saveCurrentUser(state, action) {
      return { ...state, currentUser: action.payload || {} };
    },

    changeNotifyCount(
      state = {
        currentUser: {},
      },
      action,
    ) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};
export default UserModel;
