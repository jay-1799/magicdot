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

router.route("/project/:id").get(async (req, res) => {
  if (!req.session.user || req.session.user.role !== "onsite team") {
    return res.redirect("/");
  }
  try {
    const projectDetails = await projectData.getProjectById(req.params.id);
    console.log(projectDetails.status);
    var projectStatus = 0;

    if (projectDetails.status == "approved") {
      projectStatus = 1;
    } else if (projectDetails.status == "site inspection") {
      projectStatus = 2;
    } else if (projectDetails.status == "inventory check") {
      projectStatus = 3;
    } else if (projectDetails.status == "under construction") {
      projectStatus = 4;
    } else if (projectDetails.status == "final inspection") {
      projectStatus = 5;
    } else if (projectDetails.status == "finished") {
      projectStatus = 6;
    } else {
      throw "Project Status Invalid";
    }

    console.log(projectStatus);

    return res.status(200).render("onsiteTeamProjectDetails", {
      title: "Project Details",
      projectDetails: projectDetails,
      projectStatuses: projectStatus - 1,
      projectTasksList: projectDetails.projectTasks,
    });
  } catch (error) {
    return res.status(400).render("error", { error: error });
  }
});

module.exports = router;
