import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;
const SECRET_KEY = process.env.SECRET_KEY || "fallback_random_secret_key";
app.use(express.json());

app.use(express.json({ limit: '10mb' })); // or more
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Middleware
app.use(cors());
app.use(bodyParser.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/Frontend/uploads", express.static(path.join(__dirname, "../Frontend/uploads")));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// **User Schema**
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  mobile:Number,
  role: String, // "farmer" or "admin"
});

// **Farmer Details Schema**
const farmerSchema = new mongoose.Schema({
  fullName: String,
  dob: Date,
  gender: String,
  aadhar: String,
  mobile: String,
  address: String,
  farmArea: Number,
  landOwnership: String,
  soilType: String,
  waterSource: String,
  irrigationFacility: String,
  cropType: String,
  farmingType: String,
});

// **Grievance Schema**
const grievanceSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId, // Link grievance to user
  name: String,
  mobileNumber: String,
  complaintCategory: String,
  description: String,
  otherComplaint: String,
  document: String, // File path
  
});

// **Contact Schema**
const contactSchema = new mongoose.Schema({
  farmerName: String,
  mobileNumber: Number,
  email: String,
  message: String,
});

const Contact = mongoose.model("contacts", contactSchema);
const Farmers = mongoose.model("farmers", farmerSchema);
const Users = mongoose.model("users", userSchema);
const Grievance = mongoose.model("grievances", grievanceSchema);

// **Middleware for Authentication**
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ error: "Access denied. No token provided." });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid or expired token" });
    req.user = decoded;
    next();
  });
};

// crop prices API route

app.get("/api/crop-prices", async (req, res) => {
  const state = req.query.state || "Maharashtra";
  const apiUrl = `https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24?api-key=${process.env.CROP_PRICE_API_KEY}&format=json&limit=10&filters[State]=${state}`;

  try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      res.json(data);
  } catch (error) {
      console.error("Error fetching API:", error);
      res.status(500).json({ error: "Failed to fetch crop prices" });
  }
});



// **Register User**
app.post("/register", async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;
    if (password !== confirmPassword) return res.status(400).json({ error: "Passwords do not match" });

    const existingUser = await Users.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Users({ username, password: hashedPassword, role: "farmer" });
    await newUser.save();
    
    res.status(201).json({ message: "Registration successful!" });
  } catch (err) {
    res.status(500).json({ error: "Error registering user", details: err.message });
  }
});






// **Login route api 
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (username === "AKI10" && password === "abhay@123") {
      const adminToken = jwt.sign({ username, role: "Admin" }, SECRET_KEY, { expiresIn: "2h" });
      return res.json({ message: "Admin login successful!", token: adminToken, role: "Admin" });
    }

    const user = await Users.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ userId: user._id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ message: "Login successful!", token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: "Error logging in", details: err.message });
  }
});

// **Edit Profile**
app.post("/userprofile", authenticate, async (req, res) => {
  try {
    const user = await Users.findById(req.user.userId).select("-password"); // Exclude password
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Error fetching user profile", details: err.message });
  }
});

// **Update User Profile**
app.put("/updateprofile", authenticate, async (req, res) => {
  try {
    const { username } = req.body;

    // Find the user by their ID
    const user = await Users.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update the username
    user.username = username;
    await user.save();

    res.json({ message: "Profile updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Error updating profile", details: err.message });
  }
});


// deleting the farmer details at the admin side

app.delete("/api/farmerdetails/:id", async (req, res) => {
  try {
      const { id } = req.params;
      const deletedFarmer = await Farmers.findByIdAndDelete(id);
      if (!deletedFarmer) return res.status(404).json({ error: "Farmer not found" });

      res.json({ message: "Farmer deleted successfully" });
  } catch (error) {
      res.status(500).json({ error: "Error deleting farmer", details: error.message });
  }
});



// **Change Password**
app.put("/changepassword", authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await Users.findById(req.user.userId);
    if (!(await bcrypt.compare(oldPassword, user.password))) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error changing password", details: err.message });
  }
});


// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../Frontend/uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 4 * 1024 * 1024 } // Limit file size to 4MB
});



// **Register Farmer Details**
app.post("/farmerdetails", authenticate, async (req, res) => {
  try {
    const { 
      fullName, dob, gender, aadhar, mobile, address, 
      farmArea, landOwnership, soilType, waterSource, 
      irrigationFacility, cropType, farmingType 
    } = req.body;
    console.log("Received body:", req.body);

    // Validate required fields
    if (!fullName || !dob || !gender || !aadhar || !mobile || !address || !farmArea || !landOwnership || 
        !soilType || !waterSource || !irrigationFacility || !cropType || !farmingType) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if the farmer already exists using Aadhar number
    const existingFarmer = await Farmers.findOne({ aadhar });
    if (existingFarmer) {
      return res.status(400).json({ error: "Farmer with this Aadhar number already exists" });
    }

    // Create a new Farmer entry
    const newFarmer = new Farmers({
      fullName,
      dob,
      gender,
      aadhar,
      mobile,
      address,
      farmArea,
      landOwnership,
      soilType,
      waterSource,
      irrigationFacility,
      cropType,
      farmingType
    });

    // Save farmer details to the database
    await newFarmer.save();
    
    res.status(201).json({ message: "Farmer registered successfully!" });

  } catch (err) {
    console.error("Error registering farmer:", err);
    res.status(500).json({ error: "Error registering farmer", details: err.message });
  }
});


// Geting the farmers data 
app.get("/farmers", async (req, res) => {
  try {
      const farmers = await Farmers.find();
      res.status(200).json(farmers);
  } catch (error) {
      res.status(500).send(error);
  }
});

// Geting the grivience // Fetching the grivience for the admin side
app.get("/grivience", async (req, res) => {
  try {
      const griviences = await Grievance.find();
      res.status(200).json(griviences);
  } catch (error) {
      res.status(500).send(error);
  }
});


// delete Grivience API route for the delete at the admin side

app.delete("/api/grivience/:id", async (req, res) => {
  try {
      const { id } = req.params;

      // Find and delete the grievance using _id
      const deletedGrievance = await Grievance.findByIdAndDelete(id);

      if (!deletedGrievance) {
          return res.status(404).json({ message: "Grievance not found" });
      }

      res.json({ message: "Grievance deleted successfully" });
  } catch (error) {
      console.error("Error deleting grievance:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});




// **Register Grievance**
app.post("/grivience", authenticate, upload.single("uploadDocs"), async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Uploaded File:", req.file);

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { name, mobileNumber, complaintCategory, description, otherComplaint } = req.body;
    const documentPath = `req.file ? /Frontend/uploads/${req.file.filename} : null`;

    const newGrievance = new Grievance({
      userId: req.user.userId,
      name,
      mobileNumber,
      complaintCategory,
      description,
      otherComplaint: complaintCategory === "others" ? otherComplaint : null,
      document: documentPath,
    });

    await newGrievance.save();
    res.status(200).json({ message: "Grievance Registered Successfully!" });
  } catch (error) {
    console.error("Error registering grievance:", error);
    res.status(500).json({ error: "Error registering grievance", details: error.message });
  }
});

// contact us route for the contact us page
app.post("/contact", async (req, res) => {
  const{farmerName,mobileNumber,email,message} = req.body;
  try {
  const contactdata = new Contact({
farmerName,
mobileNumber,
email,
message
   } );
  
   
    await contactdata.save();
    
    
    res.status(201).json({ message: "Response saved" });
  } catch (err) {
    res.status(500).json({ error: "Error sending data", details: err.message });
  }
});






// **Start Server**
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});