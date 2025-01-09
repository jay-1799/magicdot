const express = require("express");
const router = express.Router();
const salesInquiryData = require("../data/salesInquiry");
const usersData = require("../data/users");
const sendMailData = require("../data/sendMail");
const onsiteData = require("../data/onsite");
const projectData = require("../data/project");

router.route("/").get(async (req, res) => {
  try {
    if (!req.session.user || req.session.user.role !== "onsite team") {
      return res.status(200).redirect("/");
    }
    var newInquiryList = await salesInquiryData.getNewSalesInquiryList();
    var ongoingInquiryList = await salesInquiryData.getOngoingInquiryList(
      req.session.user._id
    );
    var assignedProjectsList = await projectData.getApprovedProjects();
    var completedProjectList = await projectData.getFinishedProjects();
    let totalInquiriesAmount = await salesInquiryData.totalInquiriesAmount();

    return res.status(200).render("onsiteDashboard", {
      newInquiryList: newInquiryList,
      newInquiryListCount: newInquiryList.length,
      // ongoingInquiryList: ongoingInquiryList,
      // ongoingInquiryListCount: ongoingInquiryList.length,
      assignedProjectsList: assignedProjectsList,
      completedProjectList: completedProjectList,
      totalInquiriesCount: totalInquiriesAmount,
      title: "Onsite Dashboard",
    });
  } catch (error) {
    return res.status(400).render("error", { error: error });
  }
});

module.exports = router;
