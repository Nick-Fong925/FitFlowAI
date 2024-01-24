const initialState = {
    userName: null,
  };
  
  const nameReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_USER_NAME':
        return { ...state, userName: action.payload };
      default:
        return state;
    }
  };
  
  export default nameReducer;