import { auth } from "../config/firebase-config";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
export function Header({ cookie, name, photo }) {
  const nav = useNavigate();
  async function LogOut() {
    await signOut(auth);

    cookie.remove("auth-token");
    nav("/");
    localStorage.removeItem("name");
    localStorage.removeItem("photo");
  }
  return (
    <>
      <div className="flex">
        <div className="header">
          <img src={photo} alt="" className="profile-photo" />
          <h1>{name}</h1>
        </div>
        <button className="btn-sign-out" onClick={LogOut}>
          Sign Out
        </button>
      </div>
      <hr />
    </>
  );
}
