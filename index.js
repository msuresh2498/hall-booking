const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');


dotenv.config()
const app = express();
app.use(express.json());
const PORT = process.env.PORT;

const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL);
client.connect();
console.log("Mongodb is connected");

app.get("/", function (request, response) {
    response.send("hello World😊😊⭐⭐⭐⭐⭐🎉🎉");
});


//1.Room creation
app.post("/createroom", async function (request, response) {
    const data = request.body;
    const room = request.body.id
    const roomname = "Room".concat(room)
    console.log(data);
    const result = await client.db("basic").collection("roombooking").insertOne({...data, roomName: roomname })
    response.send(result)
});

//get All rooms
app.get("/getallroom", async function (request, response) {
    const result = await client.db("basic").collection("roombooking").find(request.query).toArray()
    response.send(result)
});


//2.Booking room with Details
app.put("/roombooking/:id", async function (request, response) {
    const { id } = request.params;
    console.log(id)
    const data = request.body;
    const requestedStartTime = request.body.startTime;
    const requestedEndTime = request.body.endTime;
    const requestedDate = request.body.date;
    const bookingcheck = await client.db("basic").collection("roombooking").findOne(
        {
            id: id,
            bookedStatus: {
                $elemMatch: {
                    startTime: requestedStartTime,
                    endTime: requestedEndTime,
                    date: requestedDate
                },
            },

        })
    if (bookingcheck) {
        return response.status(400)
            .send({ message: "The room is already reserved for this period." });
    }
    else {
        const customername = request.body.customerName;
        const startTime = request.body.startTime;
        const endTime = request.body.endTime;
        const bookingDate = request.body.date;
        const bookingID = customername.concat(startTime, endTime)
        const result = await
            client.db("basic")
                .collection("roombooking")
                .updateOne({ id: id }, { $addToSet: { bookedStatus: { ...data, bookingid: bookingID, bookingDate: bookingDate } } });

        console.log(result);
        result ? response.send(result) : response.status(404).send({ message: "Room not Found" })
    }

});


//3.List all rooms with booked Data
app.get("/roombooking", async function (request, response) {

    const result = await client.db("basic").collection("roombooking").aggregate([
        {
            $project: {
                roomName: 1,
                bookedStatus: 1,
                customerName: 1,
                date: 1,
                startTime: 1,
                endTime: 1
            }
        }
    ]).toArray();
    console.log(result)
    result ? response.send(result) : response.status(404).send({ message: "Room not Found" })
});


//4.List all customers with booked Data
app.get("/roombooking/customers", async function (request, response) {

    const result = await client.db("basic").collection("roombooking").aggregate([
        {
            $project: {
                roomName: 1,
                bookedStatus: 1

            }
        }
    ]).toArray();
    console.log(result)
    result ? response.send(result) : response.status(404).send({ message: "Room not Found" })
});


//5.List how many times a customers has booked the  with Data
app.get("/roombooking/customerbookeddata", async function (request, response) {

    const result = await client.db("basic").collection("roombooking").aggregate([
        {
            $project: {
                roomName: 1,
                bookedStatus: 1,
                customerName: 1,
                date: 1,
                startTime: 1,
                endTime: 1,
                bookingid: 1,
                bookingDate: 1,
            }
        }
    ]).toArray();
    console.log(result)
    result ? response.send(result) : response.status(404).send({ message: "Room not Found" })
});


app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));