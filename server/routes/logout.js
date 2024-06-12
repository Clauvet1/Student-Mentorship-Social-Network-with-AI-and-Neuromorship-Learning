const express = require('express');
const router = express.Router();
router.post("/", async (req, res) => {
    // Invalidate the user's session
    req.destroy();
  
    
    // Redirect the user to the login page
    res.redirect("http://localhost:3000/login");
  });

  module.exports = router;