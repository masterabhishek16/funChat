export const initialState={
	user:null,
	currentChannel:null,
	isChannelPrivate:null,
	isMessageCountChange:null
}

export const actionType={
	SET_USER:"SET_USER",
	SET_CHANNEL:"SET_CHANNEL",
	SET_PRIVATECHANNEL:"SET_PRIVATECHANNEL",
	SET_MESSAGECHANNEL:"SET_MESSAGECHANNEL"
}

const reducer=(state,action)=>{
	switch(action.type) {
		case actionType.SET_USER:
		  return {
		  	...state,
		  	user:action.user
		  };
		  break;
		case actionType.SET_CHANNEL:
          return{
          	...state,
          	currentChannel:action.currentChannel,isChannelPrivate:false
          };
          break;
        case actionType.SET_PRIVATECHANNEL:
          return{
          	...state,
          	currentChannel:action.currentChannel,isChannelPrivate:true
          };
          break;
        case actionType.SET_MESSAGECHANNEL:
          return{
          	...state,
          	isMessageCountChange:action.isMessageCountChange
          };
          break;
		default: 
		  return state;
	}
}

export default reducer;