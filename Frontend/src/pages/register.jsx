import Form from "../components/form.jsx";
import {ACCESS_TOKEN} from "../constants"

function Register(){
  localStorage.removeItem(ACCESS_TOKEN)
  return <Form route='/users/register/' method='register' />
}

export default Register;