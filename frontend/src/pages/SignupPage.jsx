import Signup from "../features/auth/Signup";

export default function SignupPage({ onAuthenticated }) {
  return <Signup onAuthenticated={onAuthenticated} />;
}
