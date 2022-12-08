const router = require("express").Router();
const User = require("./userSchema");
const bcrypt = require("bcryptjs");

router.post("/register", async (req, res) => {
  try {
    const { email, password, username } = req.body;
    var user = await User.findOne({ email });
    if (user) {
      return res.status(400).json("Email already exist");
    }

    const newUser = new User({ username, email, password });
    var user_id = username + "_" + Date.now();

    const newuser = Object.assign(newUser, { user_id: user_id });

    bcrypt.hash(password, 7, async (err, hash) => {
      if (err)
        return res.status(400).json({ msg: "error while saving the password" });

      newuser.password = hash;

      console.log("newuser", newuser);
      const savedUserRes = await newuser.save();

      if (savedUserRes)
        return res.status(200).json({ msg: "user is successfully saved" });
    });
  } catch (err) {
    res.status(400).json(err);
  }

  // res.json(newuser);
});

router.post("/login", async (req, res) => {
  // try {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(400).json("Email not exist");
  }
  const validPwd = await bcrypt.compare(password, user.password);

  if (validPwd) {
    var userSession = { email: user.email, user_id: user.user_id }; // creating user session to keep user loggedin also on refresh
    console.log(userSession);
    req.session.user = userSession; // attach user session to session object from express-session

    return res
      .status(200)
      .json({ msg: "You have logged in successfully", userSession }); // attach user session id to the response. It will be transfer in the cookies
  } else {
    return res.status(400).json("Password not exist");
  }
  // } catch (err) {
  //   res.status(400).json(err);
  // }
});

router.delete(`/logout`, async (req, res) => {
  req.session.destroy((error) => {
    if (error) throw error;

    res.clearCookie("session-id"); // cleaning the cookies from the user session
    res.status(200).send("Logout Success");
  });
});

router.get("/isAuth", async (req, res) => {
  console.log("isAuth req", req.session.user);
  if (req.session.user) {
    return res.json(req.session.user);
  } else {
    return res.status(401).json("unauthorize");
  }
});

module.exports = router;

// ***************************************************************************************************************
// if (validPwd) {
//   const { user_id } = user;
//   var userSession = { email, password, user_id }; // creating user session to keep user loggedin also on refresh
//   req.session.user = userSession; // attach user session to session object from express-session
//   console.log(user);
//   return res
//     .status(200)
//     .json({ msg: "You have logged in successfully", userSession }); // attach user session id to the response. It will be transfer in the cookies
// } else {
//   return res.status(400).json("Password not exist");
// }
