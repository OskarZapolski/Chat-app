import { useState } from "react";
import { storage } from "../config/firebase-config";
import { getDownloadURL, ref } from "firebase/storage";
export function Message({ text, user, photo, uploadImage, currentUser }) {
  const [sendUrl, setSendUrl] = useState("");

  const style = {
    justifyContent: user === currentUser ? "end" : "start",
    flexDirection: user === currentUser ? "row-reverse" : "row",
    textAlign: user === currentUser ? "end" : "start",
  };
  const divStyle = {
    backgroundImage: `url(${photo})`,
  };

  const textStyle = {
    backgroundColor: user === currentUser && `rgb(0, 162, 255)`,
  };

  async function getImages() {
    try {
      if (uploadImage) {
        const imageStorageRef = ref(storage, `images/${uploadImage}`);
        getDownloadURL(imageStorageRef).then((url) => {
          setSendUrl(url);
        });
      }
    } catch (err) {
      console.error(err);
    }
  }
  getImages();
  return (
    <div className="message-box">
      <div className="message" style={style}>
        {user !== currentUser && (
          <div style={divStyle} className="who-sent-photo"></div>
        )}
        {uploadImage ? (
          <img src={sendUrl} alt="" className="send-img" style={textStyle} />
        ) : (
          <p className="message-text" style={textStyle}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
