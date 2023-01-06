import express from "express"
import cors from "cors"
import { v4 as uuidv4 } from "uuid"
import bcrypt from "bcrypt"
import { StreamChat } from "stream-chat";

const hostname='0.0.0'
const port=3001;

const app = express()
app.use(express.static(__dirname+'../server'))

app.use(cors());
app.use(express.json());

const api_key = "336t9wsg48yy";
const api_screte = "9ec72tm23e6e89pw6m8mkfgqm2y7wydm8nw3egtarhc6qt8apd2npkqtaf22xp9s";

const serverClient = StreamChat.getInstance(api_key, api_screte);

app.get("/",(req,res)=>{
    res.send("heellow");
})

app.post("/signUp", async (req, res) => {
    try {
        const { firstName, lastName, userName, email, password } = req.body;

        if(firstName.length<2 || lastName.length<2 || userName.length===0 || email.length<2 ||password.length<6){
            return res.json({status:"error",message:"fill all field properly !"})
        }
        
        const { users } = await serverClient.queryUsers({email:email })
        if (users.length !== 0) return res.json({status:"error", message: "already registered with this email" });
        const users1= await serverClient.queryUsers({name:userName })
        if (users1.users.length !== 0) return res.json({status:"error", message: "userName should be unique !" });
        
        const userId = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);
        const token = serverClient.createToken(userId);
        const mess=[{}];
        res.json({
            status:"ok",
            message:"user account created", 
            token, 
            userId, 
            firstName, 
            lastName, 
            userName, 
            email, 
            hashedPassword,
            mess
    })
    }
    catch (error) {
        res.json({status:"error",message:error});
    }
})

app.post("/login", async (req, res) => {
    try {

        const { email, password } = req.body;
        const { users } = await serverClient.queryUsers({email:email })
        if (users.length == 0) return res.json({status:"error", message: "email is not registered !" });
        
        const token = serverClient.createToken(users[0].id)
        const passwordMatch = await bcrypt.compare(password, users[0].hashedPassword);
        if (passwordMatch) {
            res.json({
                status:"ok",
                message:"user account created",
                token,
                firstName: users[0].firstName,
                lastName: users[0].lastName,
                userName:users[0].name,
                email,
                userId: users[0].id,
                mess:users[0].mess,
            })
            
        }
        else{
            return res.json({status:"error", message: "wrong password !" });
        }
    } catch (error) {
        res.json({status:"error",message:error});
    }
})

app.listen(port,hostname, () => {
    console.log("server is connected");
})

module.exports = app;