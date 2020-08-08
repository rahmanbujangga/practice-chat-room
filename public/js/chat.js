const socket = io();

//elements and template
const $msgForm = document.getElementById("message-form");
const $msgFormInput = $msgForm.querySelector("input");
const $msgFormBtn = $msgForm.querySelector("button");
const $sendLocBtn = document.getElementById("send-location");
const $messages = document.getElementById("messages");
const templateMsg = document.getElementById("msg-template").innerHTML;
const templateLoc = document.getElementById("loc-template").innerHTML;
const templateSidebar = document.getElementById("sidebar-template").innerHTML;

//options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  //new message element
  const $newMsg = $messages.lastElementChild;

  //Height of new messages
  const newMsgStyles = getComputedStyle($newMsg);
  const newMsgMargin = parseInt(newMsgStyles.marginBottom);
  const newMsgHeight = $newMsg.offsetHeight + newMsgMargin;

  //visible height message
  const visibleHeight = $messages.offsetHeight;

  //height of messages container
  const heightMsgContainer = $messages.scrollHeight;

  //how far scrolled
  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (heightMsgContainer - newMsgHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on("logMsg", (message) => {
  console.log(message.username);
  const html = Mustache.render(templateMsg, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format(`h:mm a`),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMsg", (msg) => {
  console.log(msg.username);
  const html = Mustache.render(templateLoc, {
    username: msg.username,
    locUrl: msg.url,
    createdAt: moment(msg.createdAt).format(`h:mm a`),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(templateSidebar, {
    room,
    users,
  });
  document.querySelector(".chat__sidebar").innerHTML = html;
});

$msgForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $msgFormBtn.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;
  socket.emit("submitMsg", message, (error) => {
    $msgFormBtn.removeAttribute("disabled");
    $msgFormInput.value = "";
    $msgFormInput.focus();
    if (error) {
      return console.log(error);
    }

    console.log("Message was delivered");
  });
});

$sendLocBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported in your browser");
  }

  $sendLocBtn.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit("sendLocation", { latitude, longitude }, () => {
      console.log("The location shared is success!");
      $sendLocBtn.removeAttribute("disabled");
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
