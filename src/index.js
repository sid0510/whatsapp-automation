// external packages
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const mongoose = require("mongoose");

const connectDB = () => {
    if (mongoose.connections[0].readyState) {
        console.log("Already connected.");
        return;
    }
    mongoose.connect(
        `${process.env.MONGO_SRC}`,
        {
            useNewUrlParser: true,
        },
        (err) => {
            if (err) throw err;
            console.log("Connected to mongodb.", ``);
        }
    );
};
connectDB();

const auditLogs = new mongoose.Schema({
    name: String,
    actionPerformedBy: String,
    timestamp: Date
});


const retailAppointmentSchema = new mongoose.Schema(
    {
        appointmentId: String,
        isPrepaid: Boolean,
        patientDetails: {
            retailPatientId: String,
            title: String,
            name: String,
            gender: String,
            age: Number,
            phonePrimary: String,
            phonePrimaryEx: String,
            email: String,
            height: String,
            weight: String,
            email: String,
            drink: String,
            smoke: String,
            symptoms: [],
            pincode: String,
            address: String,
        },
        doctorDetails: {
            doctorId: mongoose.Schema.Types.ObjectId,
            emailId: String,
            title: String,
            firstName: String,
            middleName: String,
            lastName: String,
            phonePrimary: String,
            phonePrimaryEx: String,
            licenseNo: String,
            licenseState: String,
            address: String,
            state: String,
            pincode: String,
            qualifications: [],
            practiceType: String,
            consultingFee: String,
            signature: String,
            signatureKey: String,
            hospital: String,
            hospitalKey: String,
            hospitalName: String,
        },
        prescriptions: [
            {
                _id: mongoose.Schema.Types.ObjectId,
                doctorId: mongoose.Schema.Types.ObjectId,
                complaint: String,
                historyAndRelevantInformation: String,
                suggestedInvestigation: String,
                specialInstructions: String,
                diagnosis: [],
                nextAppointment: Date,
                validity: Date,
                refer: String,
                date: Date,
                complaintCheckbox: Boolean,
                historyAndRelevantInformationCheckbox: Boolean,
                suggestedInvestigationCheckbox: Boolean,
                specialInstructionsCheckbox: Boolean,
                diagnosisCheckbox: Boolean,
            },
        ],
        patientType: String,
        visitType: String,
        status: String,
        createdOn: Date,
        categories: [],
        requestType: String,
        source: String,
        sourceEndpoint: String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        appointmentType: String,
        doctorAppointed: String,
        center: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Center",
        },
        uploadedDocuments: [],
        logs: [auditLogs],
        roomId: mongoose.Schema.Types.ObjectId,
        reviews: [
            {
                rating: Number,
                comment: String,
            },
        ],
    },
    { strict: false }
);

const Appointment = mongoose.model("RetailAppointment", retailAppointmentSchema);

// Start the webapp
const webApp = express();

// Webapp settings
webApp.use(bodyParser.urlencoded({
    extended: true
}));
webApp.use(bodyParser.json());

// Server Port
const PORT = process.env.PORT;

// Home route
webApp.get('/', (req, res) => {
    res.send(`Hello World.!`);
});

const WA = require('../helper-function/whatsapp-send-message');

// Route for WhatsApp
webApp.post('/whatsapp', async (req, res) => {

    let message = req.body.Body;
    let senderID = req.body.From;
    console.log(message,senderID);
//     if (message==="hello")
//     WA.sendMessage("Hello from the other side", senderID);

//    else if(message==="hi")
//     WA.sendMessage("Welcome to medpiper", senderID);

//     else WA.sendMessage('Could not understand your response', senderID);

   if (message === "hello") {
         let data = await Appointment.findOne({ "patientDetails.phonePrimary": senderID.replace("whatsapp:+91", "") })
         if (!data) data = { patientDetails: { name: "", phonePrimary: "", address: "", pincode: "" } };
         WA.sendMessage(`👋 Hi ! You're required to undergo a Pre-Policy Health Check(PPHC) as a part of your policy purchase with ACKO Insurance.
         For next steps, we will help you with your booking for the PPHC. Kindly confirm/update the below information we've received from ACKO, to plan and confirm your PPHC.
        1️⃣ Name: ${data.patientDetails.name}
        2️⃣ Mobile Number: ${data.patientDetails.phonePrimary}
        3️⃣ Address: ${data.patientDetails.address}
        4️⃣ Pincode: ${data.patientDetails.pincode}
        What would you like to do?`, senderID);
    }
    else WA.sendMessage('Could not understand your response', senderID);

});
// https://f930-14-102-51-50.in.ngrok.io/whatsapp

// Start the server
webApp.listen(PORT, () => {
    console.log(`Server is up and running at ${PORT}`);
});