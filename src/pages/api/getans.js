const path = require('path');
const fs = require('fs');
import multer from "multer";
import { Configuration, OpenAIApi } from "openai";
import  nc from "next-connect";



const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, path.join(process.cwd(),'public','uploads'));
    },
    filename: function (req, file, callback) {
      const uniquePrefix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      callback(null, "audio.mp3")
    }
  })
})


export const config = {
  api: {
    bodyParser: false, 
  },
};



const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY2,
});

const openai = new OpenAIApi(configuration);



const handler = nc({
    onError: (err, req, res) => {
      console.error(err.stack);
      res.status(500).end("Something broke!");
    },
    onNoMatch: (req, res) => {
      res.status(404).end("Page is not found");
    },
  })
  .use(upload.single('audio.mp3'))
  
  .post(async (req, res) => {

    const audioPath = path.join(process.cwd(), 'public/uploads', 'audio.mp3');
    const resp = await openai.createTranslation(
      fs.createReadStream(audioPath),
      "whisper-1"
    );
    const question = resp.data.text.trim()



    let response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: question}],
    });

    let ans = response.data.choices[0].message.content?.trim()
  
    return res.status(200).send({Q:question,A:ans});

  })
  


  export default handler;
