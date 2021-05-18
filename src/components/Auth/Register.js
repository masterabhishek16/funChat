import React,{useState,useEffect} from "react";
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import firebase,{db} from '../../firebase';
import md5 from 'md5';
import {useStateValue} from '../StateProvider';
import {actionType} from '../Reducer';

function Register(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [passwordConfirmation,setPasswordConfirmation] = useState("");
  const [{},dispatch]= useStateValue();

  const isAnyFieldEmpty = ()=>{
    if(username.length&&email.length&&passwordConfirmation.length&&password.length) return false;
    else return true;
  }

  const isPasswordValid = ()=>{
    if(password.length<6||passwordConfirmation.length<6||(password!==passwordConfirmation))
      return true;
    else return false;
  }

  const isFormValid = ()=>{
    let errors1=[];
    let error;
    if(isAnyFieldEmpty()){
      error={message:"Some fields are empty"};
      setErrors(errors1.concat(error))
      return false;
    }
    else if(isPasswordValid()){
      error={message:"Password is invalid"};
      setErrors(errors1.concat(error))
      return false;
    }
    else { 
      return true;
    }
  }

  const handleSubmit = e => {
    e.preventDefault();
    if(isFormValid()){
      setLoading(true)
      setErrors([])
     firebase
            .auth()
            .createUserWithEmailAndPassword(email,password)
            .then(createdUser=>{
              createdUser.user.updateProfile({
                displayName:username,
                photoURL:`https://www.gravatar.com/avatar/${md5(email)}?d=identicon`
              }).then(()=>{
                  dispatch({
                  type:actionType.SET_USER,
                  user:createdUser.user
                  })
                  saveUser(createdUser)
              })
              
              setLoading(false)
            })
            .catch(err=>{
              console.log(err);
              setLoading(false)
              setErrors(errors.concat(err))
            })
    }
  }

  const displayError= errors=>errors.map((error,i)=><p key={i}>{error.message}</p>)

  const handleInputError=(errors,input)=>{
    return errors.some(error=>error.message.toLowerCase().includes(input.toLowerCase()))?
    "error":""
  }

  const saveUser=createdUser=>{
    db.collection("users").doc(createdUser.user.uid).set({
       id:createdUser.user.uid,
       name:username,
       photoURL:`https://www.gravatar.com/avatar/${md5(email)}?d=identicon`
    })
  }


    return (
      <Grid textAlign="center" verticalAlign="middle" className="app">
        <Grid.Column style={{ maxWidth: 450 }}>
          <Header as="h1" icon color="orange" textAlign="center">
            <Icon name="puzzle piece" color="orange" />
            Register for FunChat
          </Header>
          <Form onSubmit={handleSubmit} size="large">
            <Segment stacked>
              <Form.Input
                fluid
                name="username"
                value={username}
                icon="user"
                iconPosition="left"
                placeholder="Username"
                onChange={(e)=>setUsername(e.target.value)}
                type="text"
              />

              <Form.Input
                fluid
                name="email"
                value={email}
                icon="mail"
                iconPosition="left"
                placeholder="Email Address"
                onChange={(e)=>setEmail(e.target.value)}
                type="email"
                className={()=>handleInputError(errors,"email")}
              />

              <Form.Input
                fluid
                name="password"
                value={password}
                icon="lock"
                iconPosition="left"
                placeholder="Password"
                onChange={(e)=>setPassword(e.target.value)}
                type="password"
                className={()=>handleInputError(errors,"password")}
              />

              <Form.Input
                fluid
                name="passwordConfirmation"
                value={passwordConfirmation}
                icon="repeat"
                iconPosition="left"
                placeholder="Password Confirmation"
                onChange={(e)=>setPasswordConfirmation(e.target.value)}
                type="password"
                className={()=>handleInputError(errors,"password")}
              />

              <Button disable={loading} className={loading?"loading":""} color="orange" fluid size="large">
                Submit
              </Button>
            </Segment>
          </Form>
          {errors.length>0&&(
             <Message error>
               <h3>Error</h3>
               {displayError(errors)}
             </Message>
          )}
          <Message>
            Already a user? <Link to="/login">Login</Link>
          </Message>
        </Grid.Column>
      </Grid>
    );
}

export default Register;
