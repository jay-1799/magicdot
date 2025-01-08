const connection = require("./config/mongoConnection");
const salesInquiry = require("./data/salesInquiry");
const usersData = require("./data/users");
const projectsData = require("./data/project");
const inventoryData = require("./data/inventory");
// const projectRequest = collections.projectRequest;
const projectRequest = require("./data/projectRequest");
const casual = require("casual");
// const { projectRequest } = require("./config/mongoCollections");

// Generate 20 random inquiries
casual.define("user", function () {
  return {
    firstName: casual.first_name,
    lastName: casual.last_name,
    email: "",
    phone: casual.numerify("##########"),
    subject: casual.title,
    message: casual.text,
  };
});

let userArray = new Array();
for (let i = 0; i < 20; i++) {
  const user = casual.user;
  user.email = `${user.firstName.toLowerCase()}.${user.lastName.toLowerCase()}@gmail.com`;
  userArray.push(user);
}

async function main() {
  const db = await connection.dbConnection();
  await db.dropDatabase();
  try {
    console.log("before 20 inquiry");
    for (let i = 0; i < userArray.length; i++) {
      const inquiry = await salesInquiry.newInquiry(
        userArray[i].firstName,
        userArray[i].lastName,
        userArray[i].email,
        userArray[i].phone,
        userArray[i].subject,
        userArray[i].message
      );
      // console.log(inquiry);
    }
    // Create Sales Representatives
    const sales1 = await usersData.createUser(
      "Sales",
      "Account",
      "sales representative",
      "sales@gmail.com",
      "7698654321",
      "Test@123"
    );
    const sales2 = await usersData.createUser(
      "Salestwo",
      "Account",
      "sales representative",
      "sales2@gmail.com",
      "7698654321",
      "Test@123"
    );

    // Create Customer and their Inquiry

    const customer1 = await usersData.createUser(
      "Customer",
      "lastname",
      "customer",
      "customer@gmail.com",
      "7698654321",
      "Test@123"
    );
    const customer1Inquiry = await salesInquiry.newInquiry(
      "Customer",
      "lastname",
      "customer@gmail.com",
      "7698654321",
      "Solar Home Rooftop",
      "I want to install a solar system"
    );

    // Assign Inquiry to a Sales Representative
    await salesInquiry.assignSalesRepToInquiry(
      customer1Inquiry._id,
      sales1._id
    );

    await salesInquiry.addNewMessage(
      customer1Inquiry._id,
      customer1._id,
      "Hello, I am following up on my solar installation inquiry.",
      null // No files provided
    );

    // Add a response from the Sales Representative
    await salesInquiry.addNewMessage(
      customer1Inquiry._id,
      sales1._id,
      "Thank you for reaching out! I will contact you shortly to discuss your requirements.",
      null // No files provided
    );

    const operations = await usersData.createUser(
      "Operations",
      "Account",
      "operational manager",
      "operations@gmail.com",
      "7698654321",
      "Test@123"
    );
    const onsite = await usersData.createUser(
      "Onsite",
      "Account",
      "onsite team",
      "onsite@gmail.com",
      "7698654321",
      "Test@123"
    );

    const projectRequestData = await projectRequest.createProjectRequest(
      customer1Inquiry._id,
      500,
      1200,
      24000,
      "34 central ave"
    );
    const project = await projectsData.createProjectUsingRequest(
      projectRequestData,
      operations._id
    );
    // await projectRequest.closeProjectRequest(project._id);

    const updatedCustomer = await usersData.addProjectToUser(
      project._id,
      customer1._id
    );
    const updatedOperationalManager = await usersData.addProjectToUser(
      project._id,
      operations._id
    );
    const updatedsalesInquiry = await salesInquiry.addProjectToInquiry(
      project._id,
      customer1Inquiry._id
    );

    // Create Inventory Items
    await inventoryData.createNewInventory("Solar Panel", "892");
    await inventoryData.createNewInventory("Battery 15 kWh", "1263");
    await inventoryData.createNewInventory("Inverter", "275");

    // Create a Project for the Customer
    // const project1 = await projectsData.createProject(
    //   "Customer's Solar Installation",
    //   customer1._id,
    //   [
    //     { name: "Solar Panel", quantity: 10 },
    //     { name: "Battery 15 kWh", quantity: 4 },
    //     { name: "Inverter", quantity: 2 },
    //   ],
    //   "In Progress",
    //   sales1._id
    // );

    // Add Messages to Inquiry
    // await salesInquiry.addNewMessage(
    //   customer1Inquiry._id,
    //   "Customer",
    //   "Please provide me with the pricing details."
    // );
    // await salesInquiry.addNewMessage(
    //   customer1Inquiry._id,
    //   "Sales",
    //   "We will send you the pricing details shortly."
    // );

    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await connection.closeConnection();
  }
}

main();
