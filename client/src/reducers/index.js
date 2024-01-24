import { combineReducers } from 'redux';
import userReducer from './userReducer';
import nameReducer from './nameReducer';

const rootReducer = combineReducers({
  user: userReducer,
  username: nameReducer,
  
});

export default rootReducer;