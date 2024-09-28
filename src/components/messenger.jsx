import { useEffect, useRef, useState } from "react";
import { db, storage } from "../config/firebase-config";
import { Header } from "./header";
import {} from "firebase/auth";
import { ref, uploadBytes } from "firebase/storage";
import {
  collection,
  query,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
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
  const [isSmallWindow, setIsSmallWindow] = useState(false);
  const [widthWindow, setWidthWindow] = useState(window.innerWidth);

  const Name = localStorage.getItem("name");
  const Photo = localStorage.getItem("photo");

  const styles = {
    users: {
      display: room && isSmallWindow ? "none" : "block",
      width: !room && isSmallWindow ? "100vw" : !isSmallWindow && "25vw",
    },
    form: {
      width: room && isSmallWindow && "93vw",
      display:
        room && isSmallWindow ? "block" : !isSmallWindow ? "block" : "none",
    },
  };

  useEffect(() => {
    async function HelloMessage(user, sorted) {
      await addDoc(messageRef, {
        text: "hello new user",
        createdAt: serverTimestamp(),
        user: user.name,
        room: `${sorted[0]}${sorted[1]}`,
        photo: user.photo,
        uploadImage: null,
        wasSeen: false,
      });
    }
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
      setWidthWindow(window.innerWidth);
    }
    window.addEventListener("resize", resizeHandler);

    return () => {};
  }, []);

  useEffect(() => {
    if (widthWindow <= 750 && !isSmallWindow) {
      setIsSmallWindow(true);
    } else if (widthWindow > 750 && isSmallWindow) {
      setIsSmallWindow(false);
    }
  }, [widthWindow]);

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
          if (count === 0 || isFirstLoad) {
            if (snap.data().room.includes(Name)) {
              setNewMessages((prev) =>
                prev.map((possibleMess) => {
                  if (snap.data().wasSeen === true) {
                    return possibleMess;
                  }

                  if (
                    room === snap.data().room &&
                    room &&
                    snap.data().user != Name
                  ) {
                    updateMessage(snap.id);
                  } else {
                    if (possibleMess.text && snap.data().wasSeen === false) {
                      if (possibleMess.createdAt > snap.data().createdAt) {
                        updateMessage(snap.id);
                      } else {
                        updateMessage(possibleMess.id);
                      }
                    }

                    if (room.includes(snap.data().user) === false) {
                      if (!possibleMess.text || snap.data().wasSeen === false) {
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

  useEffect(() => {
    async function addImgToStorage() {
      try {
        if (uploadImage) {
          const url = uploadImage.name + v4();
          setImageFullName(url);
          const imageRef = ref(storage, `images/${url}`);

          await uploadBytes(imageRef, uploadImage);
          setMessageText(uploadImage.name);
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
                onKeyDown={(e) => {
                  if (uploadImage && e.code === "Backspace") {
                    setMessageText("");
                  }
                }}
              />
              <label htmlFor="files" className="load-img">
                <img src="uploadImg-48.png" alt="" className="upload-img" />
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
                <img src="send48.png" alt="" />
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
