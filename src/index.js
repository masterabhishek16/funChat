import React,{useEffect,useState} from "react";
import ReactDOM from "react-dom";
import App from "./components/App";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import registerServiceWorker from "./registerServiceWorker";
import firebase from './firebase'
import reducer,{initialState,actionType} from './components/Reducer';
import {StateProvider,useStateValue} from './components/StateProvider'

import "semantic-ui-css/semantic.min.css";

import { BrowserRouter as Router, Switch, Route, withRouter } from "react-router-dom";

function Root(props) {
	const [{user},dispatch]=useStateValue();
	const [loading,setLoding]=useState(false)
	useEffect(() => {
		
		firebase.auth().onAuthStateChanged(user=>{

			if(user){
				props.history.push("/");
				 dispatch({
                 	type:actionType.SET_USER,
                 	user:user
                 })
			}
			else{
				props.history.push("/login");
				dispatch({
                 	type:actionType.SET_USER,
                 	user:null
                 })
			}
		})
	}, [])
	return (
		
	      <Switch>
		      <Route exact path="/" component={App} />
		      <Route path="/login" component={Login} />
		      <Route path="/register" component={Register} />
	      </Switch>
	   
	);
}

const RootWithAuth=withRouter(Root);

ReactDOM.render(
	<StateProvider initialState={initialState} reducer={reducer}>
	<Router>
	<RootWithAuth />
	</Router>
	</StateProvider>, document.getElementById("root"));
registerServiceWorker();

