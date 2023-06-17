const express = require('express');
const router = express.Router();
const Controller = require('../controllers/controller');
const { checkAuthenticated, checkNotAuthenticated,checkAuthenticateds,checkAuthenticatedh} = require("../auth/protect");

//Main page
router.get('/', Controller.firstPage);

//Staff login
router.get('/Staff/login', checkNotAuthenticated, Controller.SLoginView);
router.post('/Staff/login', checkNotAuthenticated, Controller.SLogin);
router.post('/Staff/logout', Controller.Slogout);

//HOD login
router.get('/HOD/login', checkNotAuthenticated, Controller.HLoginView);
router.post('/HOD/login', checkNotAuthenticated, Controller.HLogin);
router.post('/HOD/logout', Controller.Hlogout);

//HOD dashboard
router.get('/HOD/dashboard', checkAuthenticatedh, Controller.hodDashBoard);

//HOD verify-records
router.get("/HOD/verifyrecords", checkAuthenticatedh, Controller.hverifyRecords);

//HOD view-records
router.get('/HOD/viewrecord/:id', checkAuthenticatedh, Controller.hviewRecord);

//HOD approvedrecords
router.get("/HOD/approvedrecords", checkAuthenticatedh, Controller.happrovedRecordsPage);


//Staff signup
router.get('/Staff/signup', Controller.SSignupView);
router.post('/Staff/signup', Controller.SSignup);

//Staff-Admin login
router.get('/Staff-Admin/login', checkNotAuthenticated, Controller.loginView);
router.post('/Staff-Admin/login', checkNotAuthenticated, Controller.login);
router.post('/Staff-Admin/logout', Controller.logout);

//Staff-Admin dashboard
router.get('/Staff-Admin/dashboard', checkAuthenticated, Controller.StaffAdminDashBoard);

//staff dashboard
router.get('/Staff/dashboard', checkAuthenticateds, Controller.staffDashBoard);

//Staff-Admin addrecords
router.get('/Staff-Admin/addrecords', checkAuthenticated, Controller.addRecordsView);
router.post('/Staff-Admin/addrecords', checkAuthenticated, Controller.addRecords);

//Staff yet to approve
router.get('/Staff/pendingrequest', checkAuthenticateds, Controller.yetToApprove);

//Staff-Admin verify records
router.get("/Staff-Admin/verifyrecords", checkAuthenticated, Controller.verifyRecords);

//Staff-Admin verified unrecords
router.get('/Staff-Admin/unverifedrecords', checkAuthenticated, Controller.verifedRecords);

//Staff-Admin view records
router.get('/Staff-Admin/viewrecord/:id', checkAuthenticated, Controller.viewRecord);


//HOD authorize record
router.post('/HOD/authorizerecord', checkAuthenticatedh, Controller.authorizeRecord);

//Staff-Admin edit record
router.get('/Staff-Admin/editrecord/:id', checkAuthenticated, Controller.editRecord);
router.post('/Staff-Admin/editrecord', checkAuthenticated, Controller.updateRecord);


//Staff-Admin verify staff
router.get('/Staff-Admin/verifystaff', checkAuthenticated, Controller.verifyStaffPage);
router.post('/Staff-Admin/verification',checkAuthenticated,Controller.verification);
router.post('/Staff-Admin/deletestaff',checkAuthenticated,Controller.deleteStaff)

//Staff-Admin approved records
router.get("/Staff-Admin/approvedrecords", checkAuthenticated, Controller.approvedRecordsPage);

//Staff-Admin post move to godown
router.post('/Staff-Admin/godown', checkAuthenticated, Controller.moveToGodown);

//Staff-Admin get godown records
router.get('/Staff-Admin/godownRecords', checkAuthenticated, Controller.displayGodownRecords);

//Staff-Admin add history
router.post("/Staff-Admin/addhistory",checkAuthenticated,Controller.addHistory);

//Staff approved records
router.get('/Staff/approvedrecords', checkAuthenticateds, Controller.SapprovedRecordsPage);

//Staff currently using records
router.get('/Staff/currently_using', checkAuthenticateds, Controller.CurrentlyUsing);

//Staff quantity
router.get('/Staff-Admin/history/:id', checkAuthenticated, Controller.GetEachQuantity);

//Staff move products
router.get('/Staff/move/:id', checkAuthenticateds, Controller.moveRecordPage);

//Staff post move products
router.post('/Staff/move', checkAuthenticateds, Controller.postMoveRecord);

//Staff post accept request
router.post('/Staff/acceptrequest', checkAuthenticateds, Controller.postAcceptRequest);

//Staff-Admin profile
router.get('/Staff-Admin/profile', checkAuthenticated, Controller.getProfile);

//HOD profile
router.get('/HOD/profile', checkAuthenticatedh, Controller.getHODProfile);

//Staff profile
router.get('/Staff/profile', checkAuthenticateds, Controller.getStaffProfile);

//Staff-Admin editProfile
// router.post('/Staff-Admin/editProfile', checkAuthenticated, Controller.editProfile);

//HOD search records
router.post('/HOD/searchRecords', checkAuthenticatedh, Controller.HODSearchRecords);

//HOD print pdf
router.get('/HOD/generateReport', checkAuthenticatedh, Controller.HODGeneratePDF);

//Staff Admin search records
router.post('/Staff-Admin/searchRecords', checkAuthenticated, Controller.staffAdminSearchRecords);

//Staff Admin print pdf
router.get('/Staff-Admin/generateReport', checkAuthenticated, Controller.staffAdminGeneratePDF);

module.exports = router;