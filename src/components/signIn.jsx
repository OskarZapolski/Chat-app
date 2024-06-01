import {
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, googleProvider, db, storage } from "../config/firebase-config";
import { useNavigate } from "react-router-dom";
import { collection, query, getDocs, addDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export function SignIn({ cookie, setIsUserFromGoogle }) {
  const nav = useNavigate();

  const q = query(collection(db, "users"));

  const emailRef = useRef("");
  const passRef = useRef("");
  const nameRef = useRef("");
  const [picture, setPicture] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        await addDoc(collection(db, "users"), {
          name: nameRef.current.value,
          photo: profilePhoto,
          email: emailRef.current.value,
        });

        localStorage.setItem("name", nameRef.current.value);
        localStorage.setItem("photo", profilePhoto);

        nav(`/chat-app/messenger`);
      } catch (err) {
        console.error(err);
      }
    }
    if (profilePhoto) {
      load();
    }
  }, [profilePhoto]);

  async function createAccount() {
    try {
      if (
        emailRef.current.value &&
        passRef.current.value &&
        nameRef.current.value &&
        picture.name &&
        picture.name.includes(".jpg")
      ) {
        const imagesRef = ref(
          storage,
          `images/${picture.name}${emailRef.current.value}`
        );

        await createUserWithEmailAndPassword(
          auth,
          emailRef.current.value,
          passRef.current.value
        );
        await uploadBytes(imagesRef, picture);
        await getDownloadURL(imagesRef).then((res) => {
          setProfilePhoto(res);
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function signInWithGoogle() {
    try {
      let count = 0;

      const ref = await signInWithPopup(auth, googleProvider);
      cookie.set("auth-token", ref.user.refreshToken);
      localStorage.setItem("name", auth.currentUser.displayName);
      localStorage.setItem("photo", auth.currentUser.photoURL);

      const docs = await getDocs(q);
      docs.forEach((doc) => {
        if (doc.data().name === auth.currentUser.displayName) {
          count += 1;
        }
      });
      if (count === 0) {
        addDoc(collection(db, "users"), {
          name: auth.currentUser.displayName,
          email: auth.currentUser.email,
          photo: auth.currentUser.photoURL,
        });
      }
      setIsUserFromGoogle(true);
      nav(`/chat-app/messenger`);
    } catch (err) {
      console.error(err);
    }
  }
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

  useEffect(() => {
    if (localStorage.getItem("name")) {
      nav(`/chat-app/messenger`);
    }
  }, []);
  return (
    <div className="container">
      <div className="signIn-popup">
        <label htmlFor="email">Email</label>
        <input
          type="text"
          placeholder="something@gmail.com"
          id="email"
          ref={emailRef}
          className="create-acc-input"
        />
        <label htmlFor="pass">Password</label>
        <input
          type="password"
          placeholder="passExample123"
          id="pass"
          ref={passRef}
          className="create-acc-input"
        />
        {!isNewUser ? (
          <>
            <label htmlFor="name">User name</label>
            <input
              type="text"
              id="name"
              placeholder="example user"
              ref={nameRef}
              className="create-acc-input"
            />
            <label htmlFor="">Select your picture</label>
            <input
              type="file"
              className="input-file"
              onChange={(e) => setPicture(e.target.files[0])}
            />
            <button className="btn-create-acc btn" onClick={createAccount}>
              Create account
            </button>
          </>
        ) : (
          <button className="btn-create-acc btn" onClick={logIn}>
            Login
          </button>
        )}
      </div>
      <div className="div-wrapper">
        <button className="signIn btn" onClick={signInWithGoogle}>
          Sign In with google
        </button>
        <button
          className="logIn-btn btn"
          onClick={() => setIsNewUser((prev) => !prev)}
        >
          {isNewUser ? "create account" : "Login"}
        </button>
      </div>
    </div>
  );
}
