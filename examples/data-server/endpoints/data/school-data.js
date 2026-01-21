/**
 * Node JS Endpoint
 * 
 * To make this file work, you will need a running extjs server * 
 */
// Import required modules
    const express = require('express');
    const router = express.Router(); 
    const path = require('path');
    const fs = require('fs').promises;
    const fl = require('./dataLoader');

    const dataFile = '../../data/SchoolData.json';


// Check the prompt
    router.get('/', async (req, res) => {
        const response = await fl.loadData(req,dataFile);
        if (response.success) {
            res.json({
                success: true,
                data: response.data,
                count: response.count
            });
        } else {
            res.status(500).json({
                success: false,
                message: response.message
            });
        }
    });

// Export this router to be used in the main Express app
module.exports = router;