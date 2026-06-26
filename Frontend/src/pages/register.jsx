import Form from "../components/Form.jsx";
import {ACCESS_TOKEN} from "../constants"

function Register(){
  return <Form route='/users/register/' method='register' />
 }

export default Register;