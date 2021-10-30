
import React, { useEffect } from "react";
import "./App.css";
import "video-react/dist/video-react.css"; // import css

// import ReactDOM from "react-dom";
import Modal from "react-modal";
import { MdMic } from "react-icons/md";
import { MdMicOff } from "react-icons/md";
import { MdVideocam } from "react-icons/md";
import { MdVideocamOff } from "react-icons/md";
import { MdPeople } from "react-icons/md";
import { MdScreenShare } from "react-icons/md";
import { MdChatBubble } from "react-icons/md";
import { MdExitToApp } from "react-icons/md";
import { MdClear } from "react-icons/md";
import { MdKeyboardArrowRight } from "react-icons/md";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { MdPersonalVideo } from "react-icons/md";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";

import { io } from "socket.io-client";
import Peer from "peerjs";

import styled from "styled-components";

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
const socket = io("http://localhost:8000", {
  query: {
    meetingid: params["meeting_id"],
    user_id: params["id"]
  },
});
var peer = new Peer();
let screen_share_peer = new Peer()


const customStyles = {
  content: {
    top: "18%",
    left: "35%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    height: "60%",
    width: "30%",
    borderRadius: 20,
    // transform: "translate(-50%, -50%)",
  },
};
const Container = styled.div`
    padding: 20px;
    display: flex;
    width:90%;
    height: 90vh;
    margin: auto;
    flex-wrap: wrap;
`;
function App() {
  const videoInput = React.useRef(null);
  const vidgrid = React.useRef(null);
  // const remoteInput = React.useRef(null);
  const [Mydetails, setMydetails] = React.useState({});
  const [chats, setChats] = React.useState(true);
  const [voice, setVoice] = React.useState(true);
  const [mystream, setMystream] = React.useState(true);
  const [video, setVideo] = React.useState(true);
  // const [panel, setPanel] = React.useState(true);
  const [message, setMessage] = React.useState("");
  const [chatlist, setChatlist] = React.useState([]);
  const [members, setMembers] = React.useState([]);
  const [modalIsOpen, setIsOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [streams, setStreams] = React.useState([]);
  const [screenshare, setScreenshare] = React.useState(false);
  const [usercalls, setUsercalls] = React.useState([])
  const [changeScreenView, setChangeScreenView] = React.useState(false)
  const [Sharingpeerid, setSharingpeerid] = React.useState({})
  const [screensharingUsers, setScreensharingUsers] = React.useState([])
  const [screenStreams, setScreenStreams] = React.useState([]);
  const [usersharingcalls, setUsersharingcalls] = React.useState([])
  const [newuserlist, setNewuserlist] = React.useState(null)

  // let myVideoStream;
  useEffect(() => {
    socket.on("getScreenshare", (e) => {
      console.log(e, "changview")
      if (e == "Stopped") {
        setChangeScreenView(false)
      }
      else {
        setSharingpeerid(e)
        setChangeScreenView(true)
      }
    });
    socket.on("screenshareon", (status, peerid) => {
      console.log(status, peerid, 'hrhehrhthy')
      if (status == true) {
        setSharingpeerid(peerid)
        setChangeScreenView(true)
      }
    })
    socket.on("My_details", (details) => {
      // console.log(details, 'sss')
      State_update(setMydetails, details, vidgrid)
      setMydetails(details)
    })
    // const myVideo = document.createElement("video");
    // myVideo.muted = true;
    {
      screenshare == false ? (

        navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        })
          .then((stream) => {
            setMystream(stream);

            socket.on("NewUser", (newuser) => {
              console.log(newuser, 'added');
              // setNewuserlist(null)
              State_update(setNewuserlist, newuser, vidgrid)
              // setNewuserlist(newuser)

            })
            socket.on("get_messsage", (e) => {
              // console.log(e);
              State_update(setChatlist, (old) => [...old, e], vidgrid)
              // setChatlist((old) => [...old, e]);
            });

            // if (changeScreenView == true) {
            videoInput.current.srcObject = stream;
            // }

            peer.on("call", function (call) {
              console.log(call, "qqqqqqqqqqqqqqq")
              call.answer(stream); // Answer the call with an A/V stream.
              call.on("stream", function (remoteStream) {
                let tt = remoteStream.getTracks()
                console.log("coll", tt)
                vidgrid.current.append_stream(remoteStream, false)
                //const id = await localStorage.getItem('Myid')
                //let obj = remoteStream
                //obj['peerid'] = id
                console.log("dfdfdfdfdf", remoteStream)

                //setStreams([...streams, obj]);
                // console.log(obj, "qwertyyyyyyy")
              });


            });
            screen_share_peer.on("call", function (call) {
              call.answer(stream); // Answer the call with an A/V stream.
              call.on("stream", async function (remoteStream) {
                const id = await localStorage.getItem('MySharingid')
                console.log("call recieved")
                let obj = remoteStream
                obj['Screenshareid'] = id
                setScreenStreams([obj]);
              });
            });
            socket.on("call", async (ee) => {
              console.log("qqqqqqqqqqqwwwww", ee)
              const id = await localStorage.getItem('Myid')
              ee.forEach(element => {
                // console.log(element, 'aaasssdddd')
                if (element.peer_id != id) {
                  console.log(element.peer_id != id, "kkkkkks")

                  var call = peer.call(`${element.peer_id}`, stream);
                  setUsercalls([...usercalls, call])
                  call.on("stream", function (remoteStream) {
                    if (element.peer_id != id) {
                      console.log("qwqwqwqwqwqFffffffff", remoteStream);
                      let obj = remoteStream
                      //window.localStorage.setItem("vv", remoteStream)
                      obj['peerid'] = element.peer_id
                      vidgrid.current.append_stream(remoteStream, true)
                      //setStreams([...streams, obj]);
                      // replaceStream(usercalls[0], stream)
                      // console.log(obj, "qwertyyyyffffyyy")

                    }
                  });


                }
              });
            });
          })
      ) : (
          navigator.mediaDevices.getDisplayMedia({
            cursor: true
          })
            .then(async (stream) => {
              setMystream(stream);
              // videoInput.current.srcObject = stream;
              //console.log(usercalls[0].peerConnection.getSenders(), "aaaaaaaaaaaaccccccccc")
              // loop through all call and disonnct
              // call all the users again
              //replaceStream(usercalls[0], stream)
              const id = await localStorage.getItem('MySharingid')
              screensharingUsers.forEach(element => {
                // console.log(element, 'aaasssdddd')
                if (element.Screen_share_peer != id) {
                  console.log(element.Screen_share_peer != id, "kkkkkks")
                  var call = screen_share_peer.call(`${element.Screen_share_peer}`, stream);
                  setUsersharingcalls([...usersharingcalls, call])
                  call.on("stream", function (remoteStream) {
                    console.log("FFFFFFFFFFFFFFFFFFFFFFF");
                    if (element.peer_id != id) {
                      console.log("qwqwqwqwqwqF");
                      let obj = remoteStream
                      obj['Screenshareid'] = element.Screen_share_peer
                      setScreenStreams([obj]);
                      // replaceStream(usercalls[0], stream)
                      // console.log(obj, "qwertyyyyffffyyy")
                    }
                  });
                }
              });
              // myVideoStream = stream;
              // peer.on("call", function (call) {
              //   call.answer(stream); // Answer the call with an A/V stream.
              //   call.on("stream", function (remoteStream) {
              //     setStreams([...streams, remoteStream]);
              //     console.log(remoteStream, "qwertyyyyyyy")
              //   });
              // });
              // socket.on("call", async (ee) => {
              //   console.log("qqqqqqqqqqqwwwww", ee)
              //   const id = await localStorage.getItem('Myid')
              //   ee.forEach(element => {
              //     console.log(element, 'aaasssdddd')
              //     if (element.peer_id != id) {
              //       console.log(element.peer_id != id, "kkkkkks")
              //       var call = peer.call(`${element.peer_id}`, stream);
              //       call.on("stream", function (remoteStream) {
              //         if (element.peer_id != id) {
              //           console.log("qwqwqwqwqwqF");
              //           setStreams([...streams, remoteStream]);
              //         }
              //       });
              //     }
              //   });
              // });
            })
        )
    }

    peer.on("open", function (id) {
      localStorage.setItem('Myid', id)
      // console.log('My peer ID is: ' + id);

      socket.emit("connect_meeting", {
        userid: params["id"],
        meetingid: params["meeting_id"],
        time: new Date(),
        status: 1,
        peerid: id,
      });
    })
    socket.on("User_Connected", (ee) => {
      // console.log(ee, 'aaccxxxx')
      setMembers(ee);
      ee.forEach(element => {
        let conn = peer.connect(`${element.peer_id}`);
        conn.on("open", function () {
          // here you have conn.id
          // conn.send("hi!");
        });
        peer.on("connection", function (conn) {
          conn.on("data", function (data) {
            // Will print 'hi!'
            // console.log(data);
          });
        });
        // console.log(element, 'aa')
      });
    });

    screen_share_peer.on("open", function (screenid) {
      localStorage.setItem('MySharingid', screenid)
      socket.emit("connect_screen", {
        userid: params["id"],
        meetingid: params["meeting_id"],
        time: new Date(),
        status: 1,
        screensharepeer: screenid
      });
    });
    socket.on("Users_Screen", (ee) => {
      ee.forEach(element => {
        let conn = peer.connect(`${element.Screen_share_peer}`);
        conn.on("open", function () {
          // here you have conn.id
          // conn.send("hi!");
        });
        screen_share_peer.on("connection", function (conn) {
          conn.on("data", function (data) {
            // Will print 'hi!'
            // console.log(data);
          });
        });
      });
    });
    socket.on("Screensharecall", (users) => {
      setScreensharingUsers(users);
    })

  }, [screenshare]);

  // function call_user() {
  //   var call = screen_share_peer.call(`${newuserlist.Screen_share_peer}`, mystream);
  //   setUsersharingcalls([...usersharingcalls, call])
  //   call.on("stream", function (remoteStream) {

  //     let obj = remoteStream
  //     obj['Screenshareid'] = newuserlist.Screen_share_peer
  //     setScreenStreams([obj]);
  //     // replaceStream(usercalls[0], stream)
  //     // console.log(obj, "qwertyyyyffffyyy")
  //   });
  // }



  // function replaceStream(peerConnection, mediaStream) {
  //   for (const sender of usercalls[0].peerConnection.getSenders()) {
  //     if (sender.track.kind == "audio") {
  //       if (mediaStream.getAudioTracks().length > 0) {
  //         sender.replaceTrack(mediaStream.getAudioTracks()[0]);
  //       }
  //     }
  //     if (sender.track.kind == "video") {
  //       if (mediaStream.getVideoTracks().length > 0) {
  //         sender.replaceTrack(mediaStream.getVideoTracks()[0]);
  //       }
  //     }
  //   }
  // }
  function mute_mic_fucntion(setstate, device, vidgrid) {
    let tmp = vidgrid.current.get_stream()
    console.log("download:streams=>", tmp)
    if (device == "audio")
      setstate.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    else
      setstate.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    setTimeout(() => {
      vidgrid.current.upload_stream(tmp)
    }, 0);
  }

  const muteMic = () => {
    // console.log("ss")
    mute_mic_fucntion(mystream, "audio", vidgrid)
    //mystream.getAudioTracks().forEach(track => track.enabled = !track.enabled);

  }

  const muteCam = () => {
    // console.log("ss")
    mute_mic_fucntion(mystream, "video", vidgrid)
    // mystream.getVideoTracks().forEach(track => track.enabled = !track.enabled);

  }

  const Video = (props) => {
    // console.log(props.remotestreams, 'xxxx')
    const refe = React.useRef();

    const [shown, setShown] = React.useState(false);
    const [mic, setMic] = React.useState(true);
    const [cam, setCam] = React.useState(true);
    useEffect(() => {
      // //   props.peer.on("stream", stream => {
      refe.current.srcObject = props.remotestreams;
      // //   })
    }, []);
    const micop = () => {
      if (mic === true) {
        setMic(false);
      } else {
        setMic(true);
      }
    };
    const camop = () => {
      if (cam === true) {
        setCam(false);
      } else {
        setCam(true);
      }
    };


    return (
      <div key={props.ind} style={{ height: 200, width: 200, borderRadius: 10, position: 'relative', marginLeft: 5 }} onMouseLeave={() => setShown(false)}>
        <video
          style={{
            // position: "absolute",
            height: 200, width: 200,
            borderRadius: 10,
            // position: 'absolute',
            // zIndex: 1
          }}

          ref={refe}
          autoPlay={true}
          onMouseEnter={() => setShown(true)}
          onMouseOver={() => setShown(true)}
          muted={mic}

        ></video>
        {shown && (
          <div style={{ position: "absolute", background: 'grey', top: 0, height: 200, width: 200, borderRadius: 10, opacity: "70%", alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
            <div>
              {/* {console.log('11')} */}
              {mic === true ? (
                <>
                  <MdMic size={30} color={"black"} style={{ marginRight: 10 }} onClick={() => micop()} />
                </>
              ) : (
                  <>
                    <MdMicOff size={30} color={"black"} style={{ marginRight: 10 }} onClick={() => micop()} />
                  </>
                )}
              {cam === true ? (
                <>
                  <MdVideocam size={30} onClick={() => camop()} />
                </>
              ) : (
                  <>
                    <MdVideocamOff size={30} onClick={() => camop()} />
                  </>
                )}
            </div></div>
        )}
      </div>

      // <video autoPlay={true} ref={refe} style={{ height: 200, width: 200, borderRadius: 10 }} onMouseOver={() => VideoOptions()} />
      // <div>jj</div>
    );
  }

  const Sendmessage = () => {
    setMessage("");
    socket.emit("message", {
      room: params["meeting_id"],
      Name: Mydetails.name,
      message: message,
    });

    State_update(setChatlist, (old) => [
      ...old,
      {
        room: params["meeting_id"],
        Name: Mydetails.name,
        message: message,
      },
    ], vidgrid)
    // setChatlist((old) => [
    //   ...old,
    //   {
    //     room: params["meeting_id"],
    //     Name: Mydetails.name,
    //     message: message,
    //   },
    // ]);
  };
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    console.log("click");
  };

  const handleClose = () => {
    setAnchorEl(null);
    console.log(Boolean(anchorEl), "endkkkkkkkkkkk");
  };
  function State_update(setstate, value, vidgrid) {
    let tmp = vidgrid.current.get_stream()
    console.log("download:streams=>", tmp)
    setstate(value)
    setTimeout(() => {
      vidgrid.current.upload_stream(tmp)
    }, 0);
  }
  function openModal() {
    State_update(setIsOpen, true, vidgrid)
  }



  function closeModal() {
    State_update(setIsOpen, false, vidgrid)
  }
  const chatopen = () => {
    if (chats === true) {
      setChats(false);
    } else {
      setChats(true);
    }
  };

  const voiceopen = () => {
    if (voice === true) {
      setVoice(false);
      muteMic()
    } else {
      setVoice(true);
      muteMic()
    }
    // create new video fuction here
  };
  const videoopen = () => {
    if (video === true) {
      setVideo(false);
      muteCam()
    } else {
      setVideo(true);
      muteCam()
    }
  };


  const Onscreenshare = async () => {
    if (screenshare == false) {
      setAnchorEl(null);
      setScreenshare(true)
      setChangeScreenView(true)
      console.log("step 1 sharing")
      const id = await localStorage.getItem('MySharingid')
      socket.emit("Screenshare", { peer_id: id, room: params["meeting_id"] }, true)
    }
    else {
      setAnchorEl(null);
      setScreenshare(false)
      socket.emit("Screenshare", "Stopped")
      setChangeScreenView(false)
    }
  }

  const MySharedScreen = (props) => {
    // console.log("step 3 sharing")
    const refe = React.useRef();
    useEffect(() => {
      refe.current.srcObject = props.remotestreams;
    }, []);

    return (
      <>
        <video
          className="videosharing"
          style={{
            // position: "absolute",
            height: 500, width: "130%",
            borderRadius: 10,
            marginLeft: -100,
            marginTop: "10%",
            alignSelf: 'center',
            justifySelf: 'center'
            // position: 'absolute',
            // zIndex: 1
          }}
          ref={refe}
          autoPlay={true}
        ></video>
      </>
      // 
    )


  }
  const Vidgrid = React.forwardRef((props, ref) => {
    const [streamss, setStreamss] = React.useState([])
    React.useImperativeHandle(ref, () => ({
      get_stream() {
        return streamss
      },
      upload_stream(streams) {
        console.log("upload:streams=>", streams)
        setStreamss(streams)
      },
      append_stream(stream, check) {
        // let tmp = streamss
        if (check) {
          console.log(stream, 'accccdddd')
          // tmp.push(stream)
          let tmp = streamss
          let checkk = tmp.some(el => el.id === stream.id);
          console.log(checkk, "ffffffff")
          if (!checkk) {
            setStreamss([...streamss, stream])
          }
        }
        else {
          setStreamss([...streamss, stream])
          // var res = streamss.filter(val => {
          //   if (val.id == stream.id)
          //     return val.id
          // })
          // console.log(res, streamss, "finn")
          // if (res.length <= 1) {
          //   setStreamss([...streamss, stream])
          // }
        }
        console.log(stream.id, 'sssssssccc')
      }
    }));

    useEffect(() => {
      console.log(streamss, "pp")

    }, [])

    return (
      <>
        {
          streamss.length == 0 ? (<div style={{ "color": "white" }}>No Participants</div>) : (
            streamss.map((element, i) => {
              // console.log("1121212121", streamss.length)
              console.log(element, 'aaa', i)
              return <Video remotestreams={element} ind={i} />
            })
          )
        }
      </>
    )
  })
  const SharedScreen = (props) => {
    console.log("step3sharing")
    const refs = React.useRef();
    useEffect(() => {
      console.log(props.remotestreams, 'sssss')
      refs.current.srcObject = props.remotestreams;
    }, []);

    return (
      <><video
        className="videosharing"
        style={{
          // position: "absolute",
          height: 500, width: "130%",
          borderRadius: 10,
          marginLeft: -100,
          marginTop: "10%",
          alignSelf: 'center',
          justifySelf: 'center'
          // position: 'absolute',
          // zIndex: 1
        }}
        ref={refs}
        autoPlay={true}
      ></video></>
      // 
    )


  }

  return (
    <div className="main">
      <Modal
        isOpen={modalIsOpen}
        // onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Example Modal"
      >
        <div className="modal_div">
          <p className="modaltext">
            Participants{" "}
            <MdClear
              size={20}
              style={{ right: 20, position: "absolute" }}
              onClick={closeModal}
            />
          </p>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
            {members.length == 0 ? (
              <p className="modaluser">No Participants</p>

            ) : (
                members.map((element, i) => {
                  return <div style={{ flexDirection: 'row', display: 'flex', marginTop: 10, width: '70%', justifyContent: 'center' }}><img src={`https://zeelco.com/public/profile_img/${element.profile_pic}`} alt="User" style={{ height: 50, width: 50, borderRadius: 100 }} /><p style={{ marginLeft: "10%" }} className="modaluser">{element.name}</p></div>
                })
              )}
          </div>
        </div>
      </Modal>
      {/* {console.log(streams, 'aasdlllfffccc')} */}
      <div className="main__left">
        <div className="main__videos">
          <div id="video-grid">

            {/* {
              participants.map((e)=>{
              return( */}
            {/* {remotevideos()} */}
            <Container style={{ marginLeft: '15%' }}>
              {
                changeScreenView == true ? <>
                  {screenshare == true ?
                    (<><MySharedScreen remotestreams={mystream} /></>)
                    : (
                      screenStreams.map((element, i) => {
                        // console.log(element, Sharingpeerid.peer_id, "ssssssss")
                        { console.log("step 2 sharing") }
                        return <SharedScreen remotestreams={element} />
                      })
                    )}
                </>

                  // streams.forEach(element => {
                  //   console.log(element, Sharingpeerid.peer_id, "sasas")
                  //   if (element.peer_id == Sharingpeerid.peer_id)
                  //     <>
                  //       <SharedScreen remotestreams={element} />
                  //     </>
                  // })

                  // <SharedScreen remotestreams={videoInput} />
                  :
                  (<>
                    <video
                      style={{
                        // position: "absolute",
                        height: 200, width: 200,
                        borderRadius: 10,
                      }}
                      ref={videoInput}
                      autoPlay={true}
                    >
                      {/* <p style={{ color: "white" }}>My video</p> */}
                    </video>
                    {Mydetails == null ? <></> :
                      <p style={{ fontWeight: "bolder", color: "white", position: 'absolute', zIndex: 5, marginTop: 200, marginLeft: 47 }}>{Mydetails.name}</p>
                    }
                    <Vidgrid ref={vidgrid}></Vidgrid>
                  </>)
              }

            </Container>
            {/* {console.log(Remotevideos(), 'sskkkkkkkk')} */}
            {/* )

             })
           } */}
          </div>
        </div>
        {/* {panel === true ? ( */}
        <>
          <div className="main__controls">
            <div className="main__controls__block">
              <div
                onClick={() => voiceopen()}
                className="main__controls__button main__mute__button" style={{ marginTop: "60%" }}
              >
                {voice === true ? (
                  <>
                    <MdMic size={30} />
                    <span>Mute</span>
                  </>
                ) : (
                    <>
                      <MdMicOff size={30} />
                      <span>UnMute</span>
                    </>
                  )}
              </div>
              <div
                onClick={() => videoopen()}
                className="main__controls__button main__video__button"
              >
                {video === true ? (
                  <>
                    <MdVideocam size={30} />
                    <span>Stop Video</span>
                  </>
                ) : (
                    <>
                      <MdVideocamOff size={30} />
                      <span>Play Video</span>
                    </>
                  )}
              </div>
            </div>
            <div className="main__controls__block">
              <div
                className="main__controls__button"
                onClick={() => openModal()}
              >
                <MdPeople size={30} />
                <span>Participants</span>
              </div>
              {/* <div className="main_">
                  <MdKeyboardArrowLeft
                    size={30}
                    onClick={() => setPanel(false)}
                  />
                </div> */}

              <div className="main__controls__button">
                <div
                  style={{ height: "100%", width: "100%" }}
                  onClick={(e) => handleClick(e)}
                >
                  <div style={{ marginLeft: 25 }}>
                    <MdScreenShare size={30} />
                  </div>
                  <div style={{ marginLeft: 20 }}>
                    <span>Share</span>
                  </div>
                </div>
                <Menu
                  id="simple-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem onClick={Onscreenshare}>

                    <MdScreenShare size={30} />
                    {screenshare == false ? (
                      <span style={{ marginLeft: 10 }}> Share Screen</span>
                    ) : (
                        <span style={{ marginLeft: 10 }}> Stop Sharing</span>
                      )}
                  </MenuItem>
                  <MenuItem onClick={handleClose}>
                    <MdPersonalVideo size={30} />
                    <span style={{ marginLeft: 10 }}> White Board</span>
                  </MenuItem>
                </Menu>
              </div>
              {/* <div
                className="main__controls__button"
                onClick={() => chatopen()}
              >
                <MdChatBubble size={30} />
                <span>Chat</span>
              </div> */}
              <div
                className="main__controls__button"
                onClick={() => chatopen()}
              >
                <MdExitToApp size={30} color="red" />
                <span className="leave_meeting">Leave</span>
              </div>
            </div>
            {/* <div className="main__controls__block">
            <div className="main__controls__button">
            <exit_to_app size={30} />
            <span className="leave_meeting">Leave Meeting</span>
            </div>
          </div> */}
          </div>
        </>
        {/* ) : (
            <>
              <div className="main_arr" style={{ marginTop: "25%" }}>
                <MdKeyboardArrowRight
                  color="white"
                  size={30}
                  onClick={() => setPanel(true)}
                />
              </div>
            </>
          )} */}
      </div>
      {chats === true ? (
        <>
          <div className="main__right">
            <div className="main__header">
              <h4>Chat</h4>
            </div>
            <div className="main__chat__window">
              <ul className="messages">
                {chatlist.length === 0 ? (
                  <>
                    <div>
                      <span
                        style={{
                          color: "white",
                          fontSize: 20,
                          fontWeight: "bold",
                        }}
                      >
                        {" "}
                        No messages yet!{" "}
                      </span>
                    </div>
                  </>
                ) : (
                    <>
                      {chatlist.map((element, i) => {
                        return (
                          <div
                            key={i}
                            style={{ width: "150px", marginTop: "5%" }}
                          >
                            <span
                              style={{
                                color: "white",
                                fontSize: 20,
                                fontWeight: "bold",
                              }}
                            >
                              {" "}
                              {element.Name} :{" "}
                            </span>
                            <span
                              style={{
                                color: "white",
                              }}
                            >
                              {element.message}
                            </span>
                          </div>
                        );
                      })}
                    </>
                  )}
              </ul>
            </div>
            <div className="main__message__container">
              <input
                id="chat_message"
                value={message}
                type="text"
                placeholder="Type message here..."
                onChange={(e) => State_update(setMessage, e.target.value, vidgrid)}
                onKeyPress={(event) => {
                  if (event.key === "Enter") {
                    Sendmessage();
                  }
                }}
              />
            </div>
          </div>
        </>
      ) : (
          <></>
        )}
    </div>
  );
}

export default App;


