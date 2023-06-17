const { User, validate, loginValidate } = require("../models/user");
const Records = require('../models/record');
const History= require('../models/history');
const Request= require('../models/request');
const OldRecord = require('../models/oldRecords');
const bcrypt = require('bcrypt');
const passport = require('passport');
const ejs = require('ejs');
const pdf = require('html-pdf');
const fs = require('fs');
const path = require('path');
const moment=require('moment');
const { stringify } = require("querystring");
var records;
var pid=0;
var dop=[];
var warranty=[];
var viewId="";

exports.hashPassword = async (pass, salt) =>{
    return await bcrypt.hash(pass, salt); 
}
exports.firstPage = async (req, res) => {
    try {
        let hp="Hod@2023";
        let sp="Staffadmin@2023";
        const salt = bcrypt.genSalt(Number(process.env.SALT));
        var findHOD = await User.findOne({firstName: "HOD", email: "hod@gmail.com"});
        if (!findHOD){
            let pass = await this.hashPassword(hp.toString(), parseInt(salt));
            new User({
                firstName: "HOD", 
                lastName: "ISTA", 
                email: "hod@gmail.com", 
                password: pass ,
                isHOD: true,
                isStaffAdmin: false,
                isVerified: true
            }).save();
            pass = await this.hashPassword(sp.toString(),  parseInt(salt));
            new User({
                firstName: "StaffAdmin", 
                lastName: "ISTA",
                email: "staffadmin@gmail.com", 
                password: pass,
                isHOD: false,
                isStaffAdmin: true,
                isVerified: true
            }).save();
        }
        return res.render('Main');
    } catch (error) {
        return res.render('404');
    }
}
exports.HLoginView = async (req, res) => {
    try {
        return res.render('HOD/Login', { msg: "" });
    } catch (error) {
        return res.render('404');
    }
}

exports.SLoginView = async (req, res) => {
    try {
        return res.render('Staff/Login', { msg: "" });
    } catch (error) {
        return res.render('404');
    }
}

exports.HLogin = async (req, res) => {
    try {
        const { error } = loginValidate(req.body);
        if (error) {
            res.render("HOD/Login", { msg: error.details[0].message });
            return;
        }
        passport.authenticate("user-local", {
            successRedirect: "/HOD/dashboard",
            failureRedirect: "/HOD/login",
            failureFlash: true,
        })(req, res);
        return;
    } catch (error) {
        return res.render('404');
    }
}

exports.SLogin = async (req, res) => {
    try {
        const { error } = loginValidate(req.body);
        if (error) {
            res.render("Staff/Login", { msg: error.details[0].message });
            return;
        }
        passport.authenticate("sponsor-local", {
            successRedirect: "/Staff/dashboard",
            failureRedirect: "/Staff/login",
            failureFlash: true,
        })(req, res);
        return;
    } catch (error) {
        return res.render('404');
    }
}

exports.loginView = async (req, res) => {
    try {
        return res.render('Staff-Admin/Login', { msg: "" });
    } catch (error) {
        return res.render('404');
    }
}

exports.login = async (req, res) => {
    try {
        const { error } = loginValidate(req.body);
        if (error) {
            res.render("Staff-Admin/Login", { msg: error.details[0].message });
            return;
        }
        passport.authenticate("sadmin-local", {
            successRedirect: "/Staff-Admin/dashboard",
            failureRedirect: "/Staff-Admin/login",
            failureFlash: true,
        })(req, res);
        return;
    } catch (error) {
        return res.render('404');
    }
}

exports.SSignupView = async (req, res) => {
    try {
        return res.render('Staff/Register', { msg: "" });
    } catch (error) {
        return res.render('404');
    }
}

exports.SSignup = async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) {
            res.render('Staff/Register', { msg: error.details[0].message });
            return;
        }
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            res.render('Staff/Register', { msg: "User already exists" });
            return;
        }
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        await new User({ firstName: req.body.firstName, lastName: req.body.lastName, email: req.body.email, password: hashPassword }).save();
        res.redirect('/Staff/login');
        return;
    } catch (error) {
        return res.render('404');
    }
}

exports.Hlogout = async (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/HOD/login');
    });
}

exports.logout = async (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/Staff-Admin/login');
    });
}

exports.Slogout = async (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/Staff/login');
    });
}

exports.hodDashBoard = async (req, res) => {
    try {
        var rdata = await Records.find();
        // console.log(rdata);
        const request = { isVerified: "false" };

        const staff = await User.countDocuments(request);
        if (rdata != "") {
            const query = { isVerified: "true" };

            const c = await Records.countDocuments(query);

            var sum1 = 0;
            const sum = await Records.aggregate([
                { $match: { isVerified: true } }, {
                    $group: {
                        _id: null,
                        val: { $sum: "$cost" }
                    },
                }]);
            if (sum == "") {
                sum1 = 0;
            }
            else {
                sum1 = sum[0].val;
            }
            sum1=Math.round(sum1);
            records = await Records.find({ isVerified: true });
            var plot = [];
            for (let i = 0; i < records.length; i++) {
                plot.push(moment(records[i].dop).format("YYYY"))
            }
            const counts = {};
            for (const num of plot) {
                counts[num] = counts[num] ? counts[num] + 1 : 1;
            }
            var pYear = [];
            var pCount = [];
            for (const [key, value] of Object.entries(counts)) {
                pYear.push(parseInt(key));
                pCount.push(value);
            }
            return res.render('HOD/DashBoard', { user: req.user.firstName, rec: c, cost: sum1, pending: staff, pYear: pYear, pCount: pCount });
        }
        return res.render('HOD/DashBoard', { user: req.user.firstName, rec: 0, cost: 0, pending: staff, pYear: null, pCount: null });
    } catch (error) {
        console.log(error)
        return res.render('404');
    }
}

exports.StaffAdminDashBoard = async (req, res) => {
    try {
        // console.log(req.user)
        var rdata = await Records.find();
        // console.log(rdata);
        const request = { isVerified: "false" };

        const staff = await User.countDocuments(request);
        if (rdata != "") {


            const query = { isVerified: "true" };

            const c = await Records.countDocuments(query);

            var sum1 = 0;
            const sum = await Records.aggregate([
                { $match: { isVerified: true } }, {
                    $group: {
                        _id: null,
                        val: { $sum: "$cost" }
                    },
                }]);
            if (sum == "") {
                sum1 = 0;
            }
            else {
                sum1 = sum[0].val;
            }
            sum1=Math.round(sum1);
            records = await Records.find({ isVerified: true });
            var plot = [];
            for (let i = 0; i < records.length; i++) {
                plot.push(moment(records[i].dop).format("YYYY"))
            }
            const counts = {};
            for (const num of plot) {
                counts[num] = counts[num] ? counts[num] + 1 : 1;
            }
            var pYear = [];
            var pCount = [];
            for (const [key, value] of Object.entries(counts)) {
                pYear.push(parseInt(key));
                pCount.push(value);
            }
            return res.render('Staff-Admin/DashBoard', { user: req.user.firstName, rec: c, cost: sum1, pending: staff, pYear: pYear, pCount: pCount });
        }
        return res.render('Staff-Admin/DashBoard', { user: req.user.firstName, rec: 0, cost: 0, pending: staff, pYear: null, pCount: null });
    } catch (error) {
        console.log(error)
        return res.render('404');
    }
}

exports.addRecordsView = async (req, res) => {
    try {
        return res.render('Staff-Admin/AddRecords', { user: req.user.firstName, msg: req.flash('infoSubmit') });
    } catch (error) {
        return res.render('404');
    }
}

exports.addRecords = async (req, res) => {
    var c = await Records.count() + 1;
    var id = [];

    for (let i = 1; i <= req.body.quantity; i++) {
        id.push("DIST(" + String(req.body.pname) + ")" + String(req.body.invoice) + "(" + String(req.body.quantity) + "-" + String(i) + ")" + String(req.body.dop));
    }
    try {
        // var r=Records.find({inVoice: req.body.invoice},(err,doc)=>{
        //     if(err) console.log(err);
        //     else{
        //         if(doc.length==0){
        await new Records({
            SI_no: c,
            Q_id: id,
            productName: req.body.pname,
            quantity: req.body.quantity,
            description: req.body.description,
            inVoice: req.body.invoice,
            dop: req.body.dop,
            company: req.body.company,
            rate: req.body.rate,
            taxType: req.body.taxtype,
            percentage: req.body.percent,
            delivery: req.body.delivery,
            cost: req.body.cost,
            warranty: req.body.warranty,
        }).save();
        req.flash('infoSubmit', "Added Successfully");
        return res.redirect('/Staff-Admin/addrecords');
        // }
        // else{
        //     req.flash('infoSubmit', "Invoice No Already Exists");
        //     return res.redirect('/Staff-Admin/addrecords');
        // }
    } catch (error) {
        return res.render('404');
    }
}

exports.staffDashBoard = async (req, res) => {
    try {
        var rdata = await Records.find();
        // console.log(rdata);
        const request = { isVerified: "false" };

        const staff = await User.countDocuments(request);
        if (rdata != "") {


            const query = { isVerified: "true" };

            const c = await Records.countDocuments(query);

            var sum1 = 0;
            const sum = await Records.aggregate([
                { $match: { isVerified: true } }, {
                    $group: {
                        _id: null,
                        val: { $sum: "$cost" }
                    },
                }]);
            if (sum == "") {
                sum1 = 0;
            }
            else {
                sum1 = sum[0].val;
            }
            sum1=Math.round(sum1);
            records = await Records.find({ isVerified: true });
            var plot = [];
            for (let i = 0; i < records.length; i++) {
                plot.push(moment(records[i].dop).format("YYYY"))
            }
            const counts = {};
            for (const num of plot) {
                counts[num] = counts[num] ? counts[num] + 1 : 1;
            }
            var pYear = [];
            var pCount = [];
            for (const [key, value] of Object.entries(counts)) {
                pYear.push(parseInt(key));
                pCount.push(value);
            }
            return res.render('Staff/DashBoard', { user: req.user.firstName, rec: c, cost: sum1, pending: staff, pYear: pYear, pCount: pCount });
        }
        return res.render('Staff/DashBoard', { user: req.user.firstName, rec: 0, cost: 0, pending: staff, pYear: null, pCount: null });
    } catch (error) {
        return res.render('404');
    }
}

exports.hverifyRecords = async (req, res) => {
    try {
        var unverifiedRecords = await Records.find({ isVerified: false });
        res.render('HOD/VerifyRecords', { user: req.user.firstName, records: unverifiedRecords, msg: req.flash('verified') });
        return;
    } catch (error) {
        return res.render('404');
    }
}

exports.verifyRecords = async (req, res) => {
    try {
        var unverifiedRecords = await Records.find();
        res.render('Staff-Admin/VerifyRecords', { user: req.user.firstName, records: unverifiedRecords, msg: req.flash('verified') });
        return;
    } catch (error) {
        return res.render('404');
    }
}

exports.verifedRecords = async (req, res) => {
    try {
        var unverifiedRecords = await Records.find();
        res.render('Staff-Admin/VerifiedRecords', { user: req.user.firstName, records: unverifiedRecords, msg: req.flash('verified') });
        return;
    } catch (error) {
        return res.render('404');
    }
}

exports.hviewRecord = async (req, res) => {
    try {
        const id = req.params.id;
        const record = await Records.findOne({ _id: id });
        var dop = moment(record.dop).format("MMM Do YY");
        var warranty = moment(record.warranty).format("MMM Do YY");
        return res.render('HOD/ViewRecord', { user: req.user.firstName, dop: dop, warranty: warranty, record: record, msg: req.flash('modified') });
    } catch (error) {
        return res.render('404');
    }
}

exports.viewRecord = async (req, res) => {
    try {
        var gRec = await OldRecord.find({});
        // console.log(gRec)
        viewId = req.params.id;
        const record = await Records.findOne({ _id: viewId });
        var dop = moment(record.dop).format("MMM Do YYYY");
        var warranty = moment(record.warranty).format("MMM Do YYYY");
        return res.render('Staff-Admin/ViewRecord', { user: req.user.firstName, record: record, dop: dop, warranty: warranty, gRec: gRec, msg: req.flash('modified'), gmsg: req.flash('godown') });
    } catch (error) {
        return res.render('404');
    }
}



exports.authorizeRecord = async (req, res) => {
    try {
        var vid = req.body.id;
        var authorize = await Records.findByIdAndUpdate({ _id: vid }, { isVerified: true });
        if (authorize == "") {
            return res.render("404");
        }
        req.flash('verified', "Authorized!!");
        return res.redirect('/HOD/verifyRecords');
    } catch (error) {
        return res.render('404');
    }
}

exports.editRecord = async (req, res) => {
    try {
        const id = req.params.id;
        const record = await Records.findOne({ _id: id });
        return res.render("Staff-Admin/EditRecord", { user: req.user.firstName, record: record });
    } catch (error) {
        return res.render('404');
    }
}



exports.updateRecord = async (req, res) => {
    try {
        var uid = req.body.id;
        var update = await Records.findByIdAndUpdate({ _id: uid },
            {
                productName: req.body.pname,
                quantity: req.body.quantity,
                description: req.body.description,
                inVoice: req.body.invoice,
                dop: req.body.dop,
                company: req.body.company,
                rate: req.body.rate,
                taxType: req.body.taxtype,
                percentage: req.body.percent,
                delivery: req.body.delivery,
                cost: req.body.cost,
                warranty: req.body.warranty,
            }
        );
        if (update == "") {
            return res.render("404");
        }
        req.flash('modified', "Edited Successfully");
        res.redirect('/Staff-Admin/viewrecord/' + uid);
    } catch (error) {
        return res.render('404');
    }
}



exports.verifyStaffPage = async (req, res) => {
    try {
        var staffData = await User.find({ $and: [{ isHOD: false }, { isStaffAdmin: false }] });
        res.render("Staff-Admin/VerifyStaff", { user: req.user.firstName, staffData });
        return;
    } catch (error) {
        return res.render('404');
    }
}

exports.verification = async (req, res) => {
    try {
        var deleteUser = await User.findOneAndUpdate({ email: req.body.vemail }, { isVerified: true });
        res.redirect("/Staff-Admin/verifystaff");
        return;
    } catch (error) {
        return res.render('404');
    }
}

exports.deleteStaff = async (req, res) => {
    try {
        var deleteUser = await User.deleteOne({ email: req.body.email });
        res.redirect("/Staff-Admin/verifystaff");
        return;
    } catch (error) {
        res.render("404");
        return;
    }
}

exports.approvedRecordsPage = async (req, res) => {
    try {
        records = await Records.find({ isVerified: true });
        for (i = 0; i < records.length; i++) {
            dop.push(moment(records[i].dop).format("MMM Do YYYY"));
            warranty.push(moment(records[i].warranty).format("MMM Do YYYY"));
        }
        res.render('Staff-Admin/ApprovedRecords', { user: req.user.firstName, dop: dop, warranty: warranty, records: records });
        return;
    } catch (error) {
        return res.render('404');
    }
}

exports.happrovedRecordsPage = async (req, res) => {
    try {
        records = await Records.find({ isVerified: true });
        for (i = 0; i < records.length; i++) {
            dop.push(moment(records[i].dop).format("MMM Do YYYY"));
            warranty.push(moment(records[i].warranty).format("MMM Do YYYY"));
        }
        res.render('HOD/ApprovedRecords', { user: req.user.firstName, dop: dop, warranty: warranty, records: records });
        return;
    } catch (error) {

        console.log(error);
        return res.render('404');
    }
}

exports.SapprovedRecordsPage = async (req, res) => {
    try {
        records = await Records.find({ isVerified: true });
        res.render('Staff/ApprovedRecords', { user: req.user.firstName, records: records });
        return;
    } catch (error) {
        return res.render('404');
    }
}

exports.GetEachQuantity = async (req, res) => {
    var id = req.params.id;
    records = await Records.find({ Q_id: id });
    history = await History.find({ Id: id });
    staffData = await User.find({ $and: [{ isHOD: false }, { isStaffAdmin: false }, { isVerified: true }] });
    try {
        res.render('Staff-Admin/history', { user: req.user.firstName, record: records, Qid: id, his: history, staff: staffData, msg: req.flash('history') });
    }
    catch (error) {
        return res.render('404');
    }
}

exports.addHistory = async (req, res) => {
    // console.log(req.body.pname+""+req.body.floor+""+req.body.room);
    // var h=[];
    // var history=[];
    // h.push(req.body.pname);
    // h.push(req.body.floor);
    // h.push(req.body.room);
    // h.push(req.body.inuse);
    // // console.log(h);
    // history.push(h);
    // // console.log(history);
    try {
        var pair = {
            Faculty: req.body.pname,
            Floor: req.body.floor,
            RoomNo: req.body.room,
            Inuse: req.body.inuse
        };
        History.find({ Id: req.body.qid }, (err, doc) => {
            if (err) console.log(err);
            else {
                if (doc.length == 0) {
                    new History({
                        Id: req.body.qid,
                        History: pair
                    }).save();
                    req.flash('history', "Added Successfully");
                    return res.redirect('/Staff-Admin/history/' + req.body.qid);
                }
                else {
                    // console.log(doc.length);
                    History.find({ Id: req.body.qid }, (err, doc1) => {
                        if (err) console.log(err)
                        else {

                            ht = doc1[0]["History"]
                            // console.log(ht);
                            if (pair["Inuse"] == "Yes") {
                                for (let i = 0; i < ht.length; i++) {
                                    if (ht[i]["Inuse"] == "Yes") {
                                        ht[i]["Inuse"] = "No";
                                    }
                                }
                            }
                            ht.push(pair)
                            History.updateMany({ Id: req.body.qid }, { $set: { History: ht } }, (err, doc2) => {
                                if (err) console.log(err)
                                else {
                                    req.flash('history', "Added Successfully");
                                    return res.redirect('/Staff-Admin/history/' + req.body.qid);
                                }
                            })
                        }
                    })
                }
            }
        })

        // if(h1.length==undefined || h1.length==0){

        // }

    }
    catch (error) {
        console.log(error);
        return res.render('404');
    }
}

exports.CurrentlyUsing = async (req, res) => {
    // {$and:[{"History.Faculty":req.user.firstName},{"History.Inuse":"Yes"}]}
    try {
        var request = await Request.find({ from: req.user.firstName });
        // console.log(request)
        staffData = await User.find({ $and: [{ isHOD: false }, { isStaffAdmin: false }, { isVerified: true }] });
        History.find({
            "$and": [
                { "History": { "$elemMatch": { "Faculty": req.user.firstName } } },
                { "History": { "$elemMatch": { "Inuse": "Yes" } } }
            ]
        }, (err, doc) => {
            if (err) console.log(err);
            else {
                // console.log("hnjm/n"+doc);
                return res.render("Staff/Currentlyused", { his: doc, user: req.user.firstName, staff: staffData, requests: request, msg: req.flash('moverequested') });
            }
        })
    }
    catch (error) {
        console.log(error);
        return res.render('404');
    }
}

exports.yetToApprove = async (req, res) => {
    try {
        var pending = await Request.find({ to: req.user.firstName });
        return res.render('Staff/PendingRequest', { user: req.user.firstName, pending: pending, msg: req.flash('acceptmsg') });
    } catch (error) {
        return res.render('404');
    }
}

exports.moveRecordPage = async (req, res) => {
    try {
        staffData = await User.find({ $and: [{ isHOD: false }, { isStaffAdmin: false }, { isVerified: true }, { firstName: { $ne: req.user.firstName } }] });
        var id = req.params.id;
        // console.log(staffData)
        return res.render('Staff/MoveRecord', { user: req.user.firstName, staff: staffData, id: id });
    } catch (error) {
        return res.render('404');
    }
}

exports.postMoveRecord = async (req, res) => {
    try {
        // console.log(req.body.pname, req.body.qid);
        await new Request({ Id: req.body.qid, from: req.user.firstName, to: req.body.pname }).save();
        req.flash('moverequested', "Product Move Requested");
        return res.redirect('/Staff/currently_using');
    } catch (error) {
        return res.render('404');
    }
}

exports.postAcceptRequest = async (req, res) => {
    try {
        // console.log(req.body.qid+" "+req.body.qfrom+" "+req.user.firstName+" "+req.body.floor+" "+req.body.room);
        var qid = req.body.qid;
        var qfrom = req.body.qfrom;
        var accepter = req.user.firstName;
        var floor = req.body.floor;
        var room = req.body.room;
        var pair = {
            Faculty: accepter,
            Floor: req.body.floor,
            RoomNo: req.body.room,
            Inuse: "Yes"
        };
        await Request.findOneAndDelete({ Id: qid });
        History.find({ Id: qid }, (err, doc1) => {
            if (err) console.log(err)
            else {
                ht = doc1[0]["History"]
                // console.log(ht[0]["Inuse"]);
                for (let i = 0; i < ht.length; i++) {
                    // console.log(ht[i])
                    if (ht[i]["Inuse"] == "Yes" && ht[i]["Faculty"] == qfrom) {
                        // console.log(ht[i]["Inuse"]+" "+ht[i]["Faculty"])
                        ht[i]["Inuse"] = "No";
                    }
                }
                ht.push(pair);
                History.updateMany({ Id: qid }, { $set: { History: ht } }, (err, doc2) => {
                    if (err) console.log(err)
                    else {
                        req.flash('acceptmsg', "Product Accepted");
                        return res.redirect("/Staff/pendingrequest");
                    }
                })
            }
        })
    } catch (error) {
        console.log(error);
        return res.render('404');
    }
}

exports.getProfile = async (req, res) => {
    try {
        return res.render("Staff-Admin/Profile", { user: req.user.firstName, profile: req.user })
    } catch (error) {
        return res.render('404');
    }
}

exports.getHODProfile = async (req, res) => {
    try {
        return res.render("HOD/Profile", { user: req.user.firstName, profile: req.user })
    } catch (error) {
        return res.render('404');
    }
}

exports.getStaffProfile = async (req, res) => {
    try {
        return res.render("Staff/Profile", { user: req.user.firstName, profile: req.user })
    } catch (error) {
        return res.render('404');
    }
}

// exports.editProfile = async(req, res)=>{
//     try {
//         console.log(req.body.fname+" "+req.body.lname+" "+req.body.email);
//         var update = await User.findByIdAndUpdate({ email: req.body.email },
//             {
//                 firstName: req.body.fname,
//                 lastName: req.body.lname
//             }
//         );
//         if (update==""){
//             return res.render('404');
//         }
//         return res.redirect('/Staff-Admin/profile');
//     } catch (error) {
//         return res.render('404');
//     }
// }

exports.HODSearchRecords = async (req, res) => {
    try {
        var dop = [];
        var warranty = [];
        // console.log(req.body.start+" "+req.body.end+" "+req.body.search)
        if (req.body.search != undefined) {
            if (Number(req.body.search) >= 0 && Number(req.body.search) <= 9999) {
                records = await Records.find({ $and: [{ isVerified: true }, { inVoice: Number(req.body.search) }] }); var dop = [];
            }
            else {
                records = await Records.find({
                    isVerified: true,
                    $or: [
                        { productName: { $regex: req.body.search, $options: 'i' } },
                        { description: { $regex: req.body.search, $options: 'i' } },
                        { company: { $regex: req.body.search, $options: 'i' } }
                    ]
                });
            }
        }
        else {
            // console.log(req.body.start+" "+req.body.end)
            records = await Records.find({
                dop: {
                    $gte: req.body.start,
                    $lt: req.body.end
                }
            })
        }
        for (i = 0; i < records.length; i++) {
            dop.push(moment(records[i].dop).format("MMM Do YYYY"));
            warranty.push(moment(records[i].warranty).format("MMM Do YYYY"));
        }
        return res.render('HOD/ApprovedRecords', { user: req.user.firstName, records: records, dop: dop, warranty: warranty });
    } catch (error) {
        console.log(error)
        return res.render('404');
    }
}

exports.HODGeneratePDF = async (req, res) => {
    var sum = 0.0;
    for (let i = 0; i < records.length; i++) {
        sum += records[i].cost;
    }
    ejs.renderFile(path.join('./views/', "pdftoformat.ejs"), { records: records, dop: dop, warranty: warranty, total: sum }, (err, data) => {
        if (err) {
            return res.send(err);
        }
        else {
            let options = {
                "height": "11.25in",
                "width": "14in",
                "header": {
                    "height": "13mm"
                },
                "footer": {
                    "height": "13mm",
                },
            };
            // console.log("h5");
            pdf.create(data, options).toBuffer(function (err, buffer) {
                if (err) return res.send(err);
                res.type('pdf');
                res.end(buffer, 'binary');
            });
            // pdf.create(data, options).toStream("report.pdf", function (err, data) {
            //     if (err) {
            //         return res.send(err);
            //     } 
            //     else {
            //         return res.redirect('/HOD/approvedrecords');
            //     }
            // });
        }
    });
}

exports.staffAdminGeneratePDF = async (req, res) => {
    var sum = 0.0;
    for (let i = 0; i < records.length; i++) {
        sum += records[i].cost;
    }
    ejs.renderFile(path.join('./views/', "pdftoformat.ejs"), { records: records, dop: dop, warranty: warranty, total: sum }, (err, data) => {
        if (err) {
            return res.send(err);
        }
        else {
            let options = {
                "height": "11.25in",
                "width": "14in",
                "header": {
                    "height": "13mm"
                },
                "footer": {
                    "height": "13mm",
                },
            };
            // console.log("h5");
            pdf.create(data, options).toBuffer(function (err, buffer) {
                if (err) return res.send(err);
                res.type('pdf');
                res.end(buffer, 'binary');
            });
            // pdf.create(data, options).toStream("report.pdf", function (err, data) {
            //     if (err) {
            //         return res.send(err);
            //     } 
            //     else {
            //         return res.redirect('/HOD/approvedrecords');
            //     }
            // });
        }
    });
}

exports.staffAdminSearchRecords = async (req, res) => {
    try {
        // console.log(req.body.start+" "+req.body.end+" "+req.body.search)
        if (req.body.search != undefined) {
            if (Number(req.body.search) >= 0 && Number(req.body.search) <= 9999) {
                records = await Records.find({ $and: [{ isVerified: true }, { inVoice: Number(req.body.search) }] });
            }
            else {
                records = await Records.find({
                    isVerified: true,
                    $or: [
                        { productName: { $regex: req.body.search, $options: 'i' } },
                        { description: { $regex: req.body.search, $options: 'i' } },
                        { company: { $regex: req.body.search, $options: 'i' } }
                    ]
                });
            }
        }
        else {
            // console.log(req.body.start+" "+req.body.end)
            records = await Records.find({
                dop: {
                    $gte: req.body.start,
                    $lt: req.body.end
                }
            })
        }
        var dop = [];
        var warranty = [];
        for (i = 0; i < records.length; i++) {
            dop.push(moment(records[i].dop).format("MMM Do YYYY"));
            warranty.push(moment(records[i].warranty).format("MMM Do YYYY"));
        }
        return res.render('Staff-Admin/ApprovedRecords', { user: req.user.firstName, records: records, dop: dop, warranty: warranty });
    } catch (error) {
        console.log(error)
        return res.render('404');
    }
}

exports.moveToGodown = async (req, res) => {
    try {
        var recs = await Records.find({ Q_id: req.body.gRecord });
        var fr = await OldRecord.find({ Q_id: req.body.gRecord });
        if (fr.length == 0) {
            await new OldRecord({
                Q_id: req.body.gRecord,
                productName: recs[0].productName,
                description: recs[0].description,
                inVoice: recs[0].inVoice,
                dop: recs[0].dop,
                company: recs[0].company,
                rate: recs[0].rate,
                taxType: recs[0].taxType,
                percentage: recs[0].percentage,
                warranty: recs[0].warranty
            }).save();
            await Request.findOneAndDelete({ Id: req.body.gRecord });
            History.find({ Id: req.body.gRecord }, (err, doc1) => {
                if (err) console.log(err)
                else {
                    if (doc1 != "") {
                        ht = doc1[0]["History"]
                        // console.log(ht[0]["Inuse"]);
                        for (let i = 0; i < ht.length; i++) {
                            // console.log(ht[i])
                            if (ht[i]["Inuse"] == "Yes") {
                                // console.log(ht[i]["Inuse"]+" "+ht[i]["Faculty"])
                                ht[i]["Inuse"] = "No";
                            }
                        }
                        History.updateMany({ Id: req.body.gRecord }, { $set: { History: ht } }, (err, doc2) => {
                            if (err) console.log(err)
                        })
                    }
                }
            })
            req.flash('godown', "Moved to Godown");
            return res.redirect('/Staff-Admin/viewrecord/' + viewId);
        }
    } catch (error) {
        console.log(error);
        return res.render('404');
    }
}

exports.displayGodownRecords = async (req, res) => {
    try {
        var records = await OldRecord.find({});
        for (i = 0; i < records.length; i++) {
            dop.push(moment(records[i].dop).format("MMM Do YYYY"));
            warranty.push(moment(records[i].warranty).format("MMM Do YYYY"));
        }
        return res.render('Staff-Admin/OldRecords', { user: req.user.firstName, records: records, dop: dop, warranty: warranty });
    } catch (error) {
        return res.render('404');
    }
}