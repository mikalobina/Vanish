
const socket = io();
let roomCode = "";
let myName = "";
let isCreator = false;

document.getElementById("startBtn").onclick = () => {
  socket.emit("createRoom");
  isCreator = true;
};

socket.on("roomCreated", code => {
  roomCode = code;
  myName = "You";
  document.getElementById("startBtn").style.display = "none";
  document.getElementById("codeInput").style.display = "none";
  document.getElementById("roomCodeDisplay").innerText = `Share this code: ${code}`;
});

document.getElementById("joinBtn").onclick = () => {
  const code = document.getElementById("joinCode").value;
  roomCode = code;
  myName = "You";
  isCreator = false;
  socket.emit("joinRoom", code);
};

socket.on("startChat", () => {
  document.getElementById("roomCodeDisplay").style.display = "none";
  document.getElementById("chat").style.display = "block";
  if (isCreator) {
    document.getElementById("vanishBtn").style.display = "block";
  }
});

socket.on("errorMsg", msg => alert(msg));

document.getElementById("sendBtn").onclick = () => {
  const msg = document.getElementById("msgInput").value;
  if (msg.trim()) {
    addMsg(msg, myName);
    socket.emit("sendMsg", { roomCode, msg });
    document.getElementById("msgInput").value = "";
  }
};

socket.on("receiveMsg", ({ msg }) => {
  const sender = myName === "You" ? "Stranger" : "You";
  addMsg(msg, sender);
});

socket.on("chatEnded", () => {
  alert("The other user has vanished. Chat ended.");
  window.location.reload();
});

document.getElementById("vanishBtn").onclick = () => {
  socket.emit("vanish", roomCode);
  window.location.reload();
};

function addMsg(msg, sender) {
  const box = document.getElementById("messages");
  const div = document.createElement("div");
  div.innerText = `${sender}: ${msg}`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
