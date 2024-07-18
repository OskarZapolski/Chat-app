import { signInWithEmailAndPassword } from "firebase/auth";
import { getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase-config";

export function LogIn({ emailRef, passRef, q }) {
  const nav = useNavigate();
  async function logIn() {
    if (emailRef.current.value && passRef.current.value) {
      await signInWithEmailAndPassword(
        auth,
        emailRef.current.value,
        passRef.current.value
      );
      const users = await getDocs(q);
      users.forEach((user) => {
        if (user.data().email === emailRef.current.value) {
          localStorage.setItem("name", user.data().name);
          localStorage.setItem("photo", user.data().photo);
        }
      });
      nav("/chat-app/messenger");
    }
  }
  return (
    <button className="btn-create-acc btn" onClick={logIn}>
      Login
    </button>
  );
}
