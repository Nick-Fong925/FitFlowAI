const initialState = {
    actualUserID: null,
  };
  
  const userReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_USER_ID':
        return { ...state, actualUserID: action.payload };
      default:
        return state;
    }
  };
  
  export default userReducer;