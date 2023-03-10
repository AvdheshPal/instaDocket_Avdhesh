import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import React, { useState, useRef } from 'react';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';



const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorder = useRef(null);
  const [formData, setFormData] = useState(null);
  const [sending,setSending] = useState(null);
  const [chatResp,setChatResp] = useState({"Q":"Your Question","A":"Response from ChatGPT"});


  const startRecording = async () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        mediaRecorder.current = new MediaRecorder(stream);
        mediaRecorder.current.start();
        setRecording(true);
        setPaused(false);

        mediaRecorder.current.addEventListener("dataavailable", async event => {
          const audioBlob = new Blob([event.data], { type: "audio/mpeg" });
          const audioUrl = URL.createObjectURL(audioBlob);

          let data = new FormData()
          data.append('audio.mp3', audioBlob, 'audio.mp3')
          setFormData(data);
          setAudioURL(audioUrl);

        });
      });
  };

  const pauseRecording = () => {
    if (mediaRecorder.current && !paused) {
      mediaRecorder.current.pause();
      setPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder.current && paused) {
      mediaRecorder.current.resume();
      setPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setRecording(false);
      setPaused(false);
    }
  };

  const clearRecording = () => {
    setAudioURL('')
  }


  const sendAudiofile = async () => {
    if (formData) {

      setSending(true)

      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            setChatResp(JSON.parse(xhr.responseText))

            console.log(JSON.parse(xhr.responseText));
            setSending(false)
            clearRecording()
          } else {
            setSending(false)
            clearRecording()
            console.error('Error making request');
          }
        }
      };
      xhr.open('POST', '/api/getans');
      xhr.send(formData);

    }
  }


  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1 className={styles.heading} >Chat GPT</h1>
          
      <main className={styles.main}>

        <div>

        <div className={styles.recorder} >

          {sending ? <div> <Spinner animation="border" role="status">
                       <span className="visually-hidden">Loading...</span>
              </Spinner>
          </div> : <>

          {!recording && <div onClick={startRecording} className={styles.sendbtn} >
          <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"  width={30} height={30}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
           </svg>

        </div>}

          {recording && <div onClick={stopRecording} className={styles.sendbtn} >
           <svg xmlns="http://www.w3.org/2000/svg" fill="red" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" width={30} height={30}>
           <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
            </svg>
        </div>}

          {recording && !paused && <div onClick={pauseRecording} className={styles.sendbtn} >
           <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" width={30} height={30}>
           <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9v6m-4.5 0V9M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
        </div>}

          {recording && paused && <div onClick={resumeRecording} className={styles.sendbtn} >
           <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" width={30} height={30}>
           <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
        </div>}

        <div onClick={sendAudiofile} className={styles.sendbtn} >
           <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" width={30} height={30}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
        </div>

        </>}
        

        </div>
           {audioURL && !sending  && <audio style={{margin:'10px 0px'}} src={audioURL} controls />}
        </div>

        <div className={styles.chat} >

          {chatResp &&  <Card>
                          <Card.Header><strong>Q</strong> : {chatResp.Q}</Card.Header>
                          <Card.Body>
                          <strong>A</strong> : {chatResp.A}
                          </Card.Body>
                        </Card>
            }

   
        </div>
       

      </main>
    </>
  )
}
