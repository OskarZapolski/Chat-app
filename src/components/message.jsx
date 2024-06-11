import { useState } from "react";
import { storage } from "../config/firebase-config";
import { getDownloadURL, ref } from "firebase/storage";
export function Message({ text, user, photo, uploadImage, currentUser }) {
  const [sendUrl, setSendUrl] = useState("");
  const [isImgScaled, setIsImgScaled] = useState(false);

  const style = {
    justifyContent: user === currentUser ? "end" : "start",
    flexDirection: user === currentUser ? "row-reverse" : "row",
    textAlign: user === currentUser ? "end" : "start",
    position: isImgScaled && "static",
  };
  const divStyle = {
    backgroundImage: `url(${photo})`,
  };

  const textStyle = {
    backgroundColor: user === currentUser && `rgb(0, 162, 255)`,

    width: isImgScaled && "60%",
    maxWidth: isImgScaled && "700px",
    position: isImgScaled && "absolute",
    left: isImgScaled && "50%",
    top: isImgScaled && "50%",
    transform: isImgScaled && "translate(-50%,-50%)",
    zIndex: isImgScaled && "10",

    backdropFilter: isImgScaled && "blur(5px)",
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
          <img
            src={sendUrl}
            alt=""
            className="send-img"
            style={textStyle}
            onClick={() => setIsImgScaled((prev) => !prev)}
          />
        ) : (
          <p className="message-text" style={textStyle}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}
