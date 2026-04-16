//MARK ATTENDANCE
export const markAttendance = async (req, res) => {
    try {
        

        
    } catch (error) {
        console.log("Error in the markAttendance controller", error);
        res.status(500).json({success: false, message: error.message});
    }
}


//UPDATE ATTENDANCE
export const updateAttendance = async (req, res) => {
    try {
        
    } catch (error) {
        console.log("Error in the updateAttendance controller", error);
        res.status(500).json({success: false, message: error.message});
    }
}

//DELETE ATTENDANCE
export const deleteAttendance = async (req, res) => {
    try {
        
    } catch (error) {
        console.log("Error in the deleteAttendance controller", error);
        res.status(500).json({success: false, message: error.message});
    }
}

//ALL ATTENDANCE (SUPER ADMIN)
export const allAttendance = async (req, res) => {
    try {
        
    } catch (error) {
        console.log("Error in the allAttendance controller", error);
        res.status(500).json({success: false, message: error.message});
    }
}


//ADMIN ATTENDANCE
export const adminAttendance = async (req, res) => {
    try {
        
    } catch (error) {
        console.log("Error in the adminAttendance controller", error);
        res.status(500).json({success: false, message: error.message});
    }
}


//STAFF ATTENDANCE
export const staffAttendance = async (req, res) => {
    try {
        
    } catch (error) {
        console.log("Error in the staffAttendance controller", error);
        res.status(500).json({success: false, message: error.message});
    }
}


//MY ATTENDANCE (STUDENT)
export const myAttendance = async (req, res) => {
    try {
        
    } catch (error) {
        console.log("Error in the myAttendance controller", error);
        res.status(500).json({success: false, message: error.message});
    }
}

//MONTHLY SUMMARY FILTER BASED FOR ALL (SUPERADMIN --> // GLOBAL, ADMIN ---> DEPARTMENT WISE, STAFF --> SUBJECT WISE,  // STUDENT --> OVERALL PERCENATGE WISE)
export const monthlysummary = (req, res) => {
    try {
        
    } catch (error) {
        console.log("Error in the monthly summary controller", error);
        res.status(500).json({success: false, message: error.message});
        
    }
}


