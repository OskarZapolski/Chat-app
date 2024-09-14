import { getDownloadURL, ref } from "firebase/storage";
import { auth, storage, db } from "../config/firebase-config";
import { useEffect, useState } from "react";
import { doc, updateDoc } from "firebase/firestore";

export function User({
  photo,
  name,
  setRoom,
  possibleChats,
  setWithWhoChat,
  currentUser,
  newMessages,

  id,
}) {
  const [photoUrl, setPhotoUrl] = useState("");
  const [text, setText] = useState("");

  const style = {
    backgroundImage: `url(${photoUrl})`,
  };

  useEffect(() => {
    try {
      async function findProfileImage() {
        if (!photo.includes("https")) {
          await getDownloadURL(ref(storage, `images/${photo}`)).then((res) => {
            setPhotoUrl(res);
          });
        } else {
          setPhotoUrl(photo);
        }
      }
      findProfileImage();

      return () => findProfileImage();
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    setText(
      newMessages.map((message) => {
        if (message.room.includes(name) && message.wasSeen === false) {
          console.log(message);
          return message.text;
        }
      })
    );
  }, [newMessages]);

  async function updateMessage(id) {
    try {
      await updateDoc(doc(db, "messages", id), { wasSeen: true });
    } catch (err) {
      console.error(err);
    }
  }

  function findRoom() {
    setWithWhoChat(true);
    possibleChats.forEach((chat) => {
      if (chat.includes(currentUser) && chat.includes(name)) {
        setRoom(chat);

        newMessages.map((mess) => {
          if (chat === mess.room && mess.id) {
            updateMessage(mess.id);
            mess.wasSeen = true;
          }
        });
      }
    });
  }
  const dot = newMessages.map((message) => {
    if (message.user === name && message.wasSeen === false) {
      return <div className="new-message"></div>;
    }
  });

  const styleUserInfo = {
    justifyContent: text !== "" ? "space-around" : "center",
  };

  return (
    <div className="user" onClick={() => findRoom()} key={id}>
      <div style={style} className="photo">
        {dot}
      </div>

      <div className="user-info" style={styleUserInfo}>
        <p className="user-nick">{name}</p>
        {text && <p className="new-message-popup-text">{text}</p>}
      </div>
    </div>
  );
}
