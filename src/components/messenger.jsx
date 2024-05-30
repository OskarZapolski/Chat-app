import { useEffect, useRef, useState } from "react";
import { auth, db, storage } from "../config/firebase-config";
import { Header } from "./header";
import {} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
  getDocs,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { User } from "./user";
import { Message } from "./message";
import { v4 } from "uuid";

export function Messenger({ cookie, isUserFromGoogle }) {
  const messageRef = collection(db, "messages");

  const inputFileRef = useRef("");

  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [room, setRoom] = useState("");
  const [possibleChats, setPossibleChats] = useState([]);
  const [withWhoChat, setWithWhoChat] = useState(null);
  const [uploadImage, setUploadImage] = useState(null);
  const [imageFullName, setImageFullName] = useState("");
  const [newMessages, setNewMessages] = useState([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [widthWindow, setWidthWindow] = useState(false);

  const Name = localStorage.getItem("name");
  const Photo = localStorage.getItem("photo");

  const styles = {
    users: {
      display: room && widthWindow ? "none" : "block",
      width: !room && widthWindow ? "100vw" : !widthWindow && "17vw",
    },
    form: {
      width: room && widthWindow && "93vw",
      display: room && widthWindow ? "block" : !widthWindow ? "block" : "none",
    },
  };

  useEffect(() => {
    const listUsers = [];

    const qUsers = query(collection(db, "users"));
    const unsubscribe = onSnapshot(qUsers, (snapshot) => {
      listUsers.length = 0;
      snapshot.forEach((user) => {
        if (user.data().name !== Name) {
          listUsers.push({ ...user.data(), id: user.id });
        }
      });

      const helpArr = [];
      const yourChats = [];
      listUsers.map((user) => {
        let sorted = [Name, user.name].sort();
        helpArr.push(`${sorted[0]}${sorted[1]}`);
        yourChats.push({ room: `${sorted[0]}${sorted[1]}` });
      });

      setUsers(listUsers);
      setPossibleChats(helpArr);
      setNewMessages(yourChats);
    });

    return () => unsubscribe();
  }, []);
  useEffect(() => {
    function resizeHandler() {
      if (window.innerWidth <= 750 && !widthWindow) {
        setWidthWindow(true);
      } else if (window.innerWidth > 750 && widthWindow) {
        setWidthWindow(false);
      }
    }
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, [window.innerWidth]);

  useEffect(() => {
    const q = query(
      messageRef,
      where("room", "==", room),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let message = [];

      snapshot.forEach((doc) => {
        message.push({ ...doc.data(), id: doc.id });
      });

      setMessages(message);
    });

    return () => unsubscribe();
  }, [room]);
  async function updateMessage(id) {
    await updateDoc(doc(db, "messages", id), { wasSeen: true });
  }

  useEffect(() => {
    const messagesToUpdate = [];
    const unsubscribe = onSnapshot(
      query(messageRef, orderBy("createdAt", "desc")),
      (snapshot) => {
        let count = 0;
        snapshot.forEach((snap) => {
          if ((!isFirstLoad && count === 0) || isFirstLoad) {
            count++;

            if (snap.data().room.includes(Name)) {
              setNewMessages((prev) =>
                prev.map((possibleMess) => {
                  if (room === snap.data().room) {
                    updateMessage(snap.id);
                  } else {
                    if (room.includes(snap.data().user) === false) {
                      if (!possibleMess.text || possibleMess.wasSeen) {
                        if (possibleMess.room === snap.data().room) {
                          return {
                            ...possibleMess,
                            ...snap.data(),
                            id: snap.id,
                          };
                        }
                      }
                    }
                  }

                  return possibleMess;
                })
              );
            }
          }
        });
      }
    );

    setIsFirstLoad(false);
    return unsubscribe;
  }, [messages]);
  console.log(newMessages);
  useEffect(() => {
    async function addImgToStorage() {
      try {
        if (uploadImage) {
          const url = uploadImage.name + v4();
          setImageFullName(url);
          const imageRef = ref(storage, `images/${url}`);

          await uploadBytes(imageRef, uploadImage);
          setMessageText("image");
        }
      } catch (err) {
        console.error(err);
      }
    }
    addImgToStorage();
  }, [uploadImage]);

  async function handleSubmitForm(e) {
    try {
      e.preventDefault();
      if (messageText) {
        await addDoc(messageRef, {
          text: messageText,
          createdAt: serverTimestamp(),
          user: Name,
          room,
          photo: Photo,
          uploadImage: uploadImage ? imageFullName : null,
          wasSeen: false,
        });
        setMessageText("");
        setUploadImage(null);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const displayUser = users.map((user) => {
    return (
      <User
        currentUser={Name}
        photo={user.photo}
        name={user.name}
        setRoom={setRoom}
        setPossibleChats={setPossibleChats}
        possibleChats={possibleChats}
        setWithWhoChat={setWithWhoChat}
        newMessages={newMessages}
        id={user.id}
      />
    );
  });

  return (
    <div className="messenger">
      <Header cookie={cookie} name={Name} photo={Photo} />
      <div className="wrapper">
        <div className="users" style={styles.users}>
          <h2>users</h2>
          <div className="users-container">{displayUser}</div>
        </div>
        {withWhoChat && room ? (
          <form
            action=""
            onSubmit={(e) => handleSubmitForm(e)}
            style={styles.form}
          >
            {users.map((user) => {
              if (room.includes(user.name)) {
                return (
                  <div className="with-who-chat">
                    <img
                      src="arrowBack.png"
                      alt=""
                      className="arrow-back"
                      onClick={() => setRoom("")}
                    />
                    <div
                      className="small-photo-user"
                      style={{ backgroundImage: `url(${user.photo})` }}
                    ></div>
                    <p>{user.name}</p>
                  </div>
                );
              }
            })}

            <div className="chat">
              {messages.map((mess) => (
                <Message
                  text={mess.text}
                  user={mess.user}
                  photo={mess.photo}
                  uploadImage={mess.uploadImage}
                  currentUser={Name}
                />
              ))}
            </div>
            <div className="box">
              <input
                type="text"
                placeholder="write your message..."
                className="message-input"
                value={messageText}
                onChange={(e) => {
                  if (!uploadImage) setMessageText(e.target.value);
                }}
              />
              <label htmlFor="files" className="load-img">
                <img src="uploadImg.jpg" alt="" />
              </label>
              <input
                type="file"
                id="files"
                className="file-input"
                ref={inputFileRef}
                onChange={(e) => {
                  setUploadImage(e.target.files[0]);
                  inputFileRef.current.value = "";
                }}
              />
              <button className="send-btn">
                <img src="message-send.png" alt="" />
              </button>
            </div>
          </form>
        ) : (
          <p className="select-chat">select chat</p>
        )}
      </div>
    </div>
  );
}
