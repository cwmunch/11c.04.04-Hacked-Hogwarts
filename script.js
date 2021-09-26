"use strict";

window.addEventListener("DOMContentLoaded", filterBtns);

let allStudents = [];
let halfBlood = [];
let pureBlood = [];
let expelledStudents = [];

const Student = {
  firstName: "",
  middleName: "",
  nickName: "",
  lastName: "",
  gender: "",
  bloodStatus: "",
  house: "",
  responsibilities: "",
  prefect: false,
  inquisitorial: false,
  enrollment: true,
  imageUrl: "",
};

function filterBtns() {
  console.log("Bring forth the sorting hat!");

  document.querySelectorAll("[data-action=filter]").forEach((button) => {
    button.addEventListener("click", selectFilter);
  });
  document.querySelectorAll("[data-action='sort']").forEach((button) => {
    button.addEventListener("click", selectSort);
  });
  document.querySelector("[data-action=search]").addEventListener("input", selectSearch);

  loadJSONData();
}

//Here we fetch JSON
function loadJSONData() {
  //initial fetch
  loadJSON("https://petlatkea.dk/2021/hogwarts/families.json", prepBloodStatus);
  loadJSON("https://petlatkea.dk/2021/hogwarts/students.json", bloodLoadTimer);

  //actual fetch
  async function loadJSON(url, callback) {
    const jsonData = await fetch(url);
    const students = await jsonData.json();

    callback(students);
  }

  //Get blood status from JSON
  function prepBloodStatus(jsonData) {
    halfBlood = jsonData.half;
    pureBlood = jsonData.pure;

    bloodIsLoaded = true;
  }

  //set a timeout to wait for families.json to be loaded first
  function bloodLoadTimer() {
    console.log("The train is on schedule");
    if ((bloodIsLoaded = false)) {
      setTimeout(bloodLoadTimer);
    } else {
      prepStudentArray(jsonData);
    }
  }
}

function prepStudentArray() {
  allStudents = jsonData.map(cleanStudentArray);
  setFilter(settings.filterBy);
}

//Cleaning Student Array
function cleanStudentArray(studentObject) {
  //setting up variables
  const student = Object.create(Student);
  const nameTrimmed = studentObject.fullname.trim();
  const firstSpace = nameTrimmed.indexOf(" ");
  const lastSpace = nameTrimmed.lastIndexOf(" ");

  //Cleaning first names
  student.firstName = jsonObject.fullname.substring(0, firstSpace);
  console.log(student.firstName);

  //Cleaning middle names
  student.middleName = jsonObject.fullname.substring(firstSpace, lastSpace);

  //Cleaning last names
  student.lastName = jsonObject.fullname.trim().substring(lastSpace);

  console.log(`check fullnames:`);
}
