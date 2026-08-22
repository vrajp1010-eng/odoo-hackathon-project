import Login from "../features/auth/Login";

export default function LoginPage({ onAuthenticated }) {
  return <Login onAuthenticated={onAuthenticated} />;
}
