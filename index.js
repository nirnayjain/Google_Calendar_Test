const express=require('express');
const app=express();
const {google} = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();
const port=process.env.PORT;
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const scope= [
'https://www.googleapis.com/auth/calendar'
];
const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scope,
    include_granted_scopes: true
  });
app.use(express.json())
app.get("/rest/v1/calendar/init/",(req,res)=>{ 
     res.redirect(url);
})
app.get("/rest/v1/calendar/redirect/",async(req,res)=>{
    const code=req.query.code;
   
    let { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
     
    const result=[];
  const calendar = google.calendar('v3');
calendar.events.list({
    calendarId: 'primary',
    auth: oauth2Client,
    timeMin: (new Date()).toISOString(),
    // maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
}, (err, res1) => {
    if (err) return console.log('The API returned an error: ' + err);
    const events = res1.data.items;
    if (events.length) {
        
        events.map((event, i) => {
            const start = event.start.dateTime || event.start.date;
               
            result.push(`${start} - ${event.summary}`);
        }) 
        res.json({data:result})
      }
        else {
        res.json({data:'No upcoming events found.'});
    }
});
})

app.listen(port,()=>console.log(`Server is listening on port ${port}`))