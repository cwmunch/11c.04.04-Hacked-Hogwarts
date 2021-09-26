"use strict";

// Wait for the DOM to be loaded, then call start()
window.addEventListener("DOMContentLoaded", start);

let allStudents = [];
let halfBlood = [];
let pureBlood = [];
let expelledStudents = [];

// Prototype students
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
  imageDir: "",
};

// Global variables
const settings = {
  filterBy: "*",
  sortBy: "firstName",
  sortDir: "asc",
  searchBy: "",
  hacked: false,
};

//Filter and sort buttons is made clickable.
function start() {
  console.log("start of semester");

  // Add eventlisteners for searching, filtering and sorting
  document.querySelectorAll("[data-action=filter]").forEach((button) => {
    button.addEventListener("click", selectFilter);
  });
  document.querySelectorAll("[data-action='sort']").forEach((button) => {
    button.addEventListener("click", selectSort);
  });
  document.querySelector("[data-action=search]").addEventListener("input", selectSearch);

  loadJSONData();
}

// Begin fetching JSON.
function loadJSONData() {
  let bloodLoaded = false;
  loadJSON("https://petlatkea.dk/2021/hogwarts/families.json", prepBlodStatus);
  loadJSON("https://petlatkea.dk/2021/hogwarts/students.json", blodLoader);

  // Async fetch JSON data
  async function loadJSON(url, callback) {
    const JSONData = await fetch(url);
    const students = await JSONData.json();

    callback(students);
  }

  // Set difference in blood status
  function prepBlodStatus(jsonData) {
    halfBlood = jsonData.half;
    pureBlood = jsonData.pure;

    bloodLoaded = true;
  }

  // Timeout wait  for families.json to be loaded
  function blodLoader(jsonData) {
    if ((bloodLoaded = false)) {
      setTimeout(blodLoader(jsonData), 100);
    } else {
      prepStudents(jsonData);
    }
  }
}

// JSON data to the allStudents array
function prepStudents(jsonData) {
  allStudents = jsonData.map(prepEachStudent);
  //console.table(allStudents);
  setFilter(settings.filterBy);
}

// Clean the JSON data in objects, and return to array
function prepEachStudent(jsonObject) {
  const student = Object.create(Student);

  const trimmedNames = jsonObject.fullname.trim();
  const firstSpace = trimmedNames.indexOf(" ");
  const lastSpace = trimmedNames.lastIndexOf(" ");

  // Clean the firstnames
  if (firstSpace == -1) {
    student.firstName = trimmedNames;
  } else {
    student.firstName = trimmedNames.substring(0, firstSpace);
  }
  student.firstName = student.firstName.substring(0, 1).toUpperCase() + student.firstName.substring(1).toLowerCase();

  // Clean the middlenames and nicknames
  student.middleName = trimmedNames.substring(firstSpace, lastSpace).trim();
  if (student.middleName.substring(0, 1) == `"`) {
    student.nickName = student.middleName;
    student.middleName = "";
    student.nickName = student.nickName.substring(0, 1) + student.nickName.substring(1, 2).toUpperCase() + student.nickName.substring(2).toLowerCase();
  } else {
    student.nickName = "";
    student.middleName = student.middleName.substring(0, 1).toUpperCase() + student.middleName.substring(1).toLowerCase();
  }

  // Clean the lastnames
  if (lastSpace == -1) {
    student.lastName = "";
  } else {
    student.lastName = trimmedNames.substring(lastSpace + 1);
  }
  const ifHyphens = student.lastName.indexOf("-");
  if (ifHyphens == -1) {
    student.lastName = student.lastName.substring(0, 1).toUpperCase() + student.lastName.substring(1).toLowerCase();
  } else {
    student.lastName =
      student.lastName.substring(0, 1).toUpperCase() + student.lastName.substring(1, ifHyphens + 1).toLowerCase() + student.lastName.substring(ifHyphens + 1, ifHyphens + 2).toUpperCase() + student.lastName.substring(ifHyphens + 2).toLowerCase();
  }

  // Clean the genders
  student.gender = jsonObject.gender.trim();
  student.gender = student.gender.substring(0, 1).toUpperCase() + student.gender.substring(1).toLowerCase();
  if (student.gender === "Girl") {
    student.gender = "Witch";
  } else if (student.gender === "Boy") {
    student.gender = "Wizard";
  }

  // Clean houses
  student.house = jsonObject.house.trim();
  student.house = student.house.substring(0, 1).toUpperCase() + student.house.substring(1).toLowerCase();

  // Add bloodstatus
  student.bloodStatus = "Muggle-born";
  const lenPure = pureBlood.length;
  for (let i = 0; i < lenPure; i++) {
    if (student.lastName === pureBlood[i]) {
      student.bloodStatus = "Pure-blood";
    }
  }
  const lenHalf = halfBlood.length;
  for (let i = 0; i < lenHalf; i++) {
    if (student.lastName === halfBlood[i]) {
      student.bloodStatus = "Half-blood";
    }
  }

  // Add responsibilities
  if (student.bloodStatus === "Pure-blood" && student.house === "Slytherin") {
    student.inquisitorial = true;
  } else {
    student.inquisitorial = false;
  }

  if (student.lastName === "Weasley") {
    student.prefect = true;
  } else if (student.lastName === "Granger") {
    student.prefect = true;
  } else if (student.lastName === "Malfoy") {
    student.prefect = true;
  } else if (student.lastName === "Parkinson") {
    student.prefect = true;
  } else if (student.lastName === "Goldstein") {
    student.prefect = true;
  } else if (student.lastName === "Patil" && student.house === "Ravenclaw") {
    student.prefect = true;
  } else if (student.lastName === "Macmillan") {
    student.prefect = true;
  } else if (student.lastName === "Abbott") {
    student.prefect = true;
  } else {
    student.prefect = false;
  }

  // Add the image urls
  if (ifHyphens == -1) {
    student.imageDir = `images/students/${student.lastName.toLowerCase()}_${student.firstName.substring(0, 1).toLowerCase()}.png`;
  } else {
    student.imageDir = `images/students/${student.lastName.substring(ifHyphens + 1).toLowerCase()}_${student.firstName.substring(0, 1).toLowerCase()}.png`;
  }

  if (student.lastName === "Patil") {
    student.imageDir = `images/students/${student.lastName.toLowerCase()}_${student.firstName.toLowerCase()}.png`;
  }

  return student;
}

// Selected filter
function selectFilter() {
  const filter = this.dataset.filter;
  setFilter(filter);
}

// Sets selected filter
function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

// The function that defines which list is filtered
function filterList(filterListBy) {
  let filteredList;
  if (filterListBy === "expelled") {
    filteredList = expelledStudents;
  } else {
    filteredList = allStudents.filter(isStudentFilter);
  }

  function isStudentFilter(student) {
    if (filterListBy === "*") {
      return allStudents;
    } else if (
      student.house.toLowerCase() === filterListBy.toLowerCase() ||
      student.gender.toLowerCase() === filterListBy.toLowerCase() ||
      student.responsibilities.toLowerCase().includes(filterListBy.toLowerCase()) ||
      student.bloodStatus.toLowerCase() === filterListBy.toLowerCase()
    ) {
      return true;
    }
  }

  return filteredList;
}

// The user seleceted sorting
function selectSort() {
  const sortBy = this.dataset.sort;
  const sortDir = this.dataset.sortDirection;

  // Find the element with class sortby, and remove the class
  document.querySelector(`[data-sort='${settings.sortBy}']`).classList.remove("sortby");

  // Indicate active sorting
  this.classList.add("sortby");

  // Toggle the sorting direction
  if (sortDir === "asc") {
    this.dataset.sortDirection = "desc";
  } else {
    this.dataset.sortDirection = "asc";
  }

  setSort(sortBy, sortDir);
}

// Sets the user selected sorting as the sort used to sort the list
function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}

// Sorts the filtered list
function sortList(filteredList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  }
  const sortedList = filteredList.sort(sortByProberty);

  function sortByProberty(studentA, studentB) {
    if (studentA[settings.sortBy] < studentB[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
  return sortedList;
}

// Selected search input
function selectSearch() {
  const search = document.querySelector("[data-action=search]").value;
  setSearch(search);
}

// Search
function setSearch(search) {
  settings.searchBy = search;
  settings.filterBy = "*";
  buildList();
}

// Returns an array with students from search
function searchList(sortedList) {
  let searchedList = sortedList.filter(isStudentSearch);

  function isStudentSearch(student) {
    const firstName = student.firstName.toLowerCase();
    const lastName = student.lastName.toLowerCase();
    if (settings.searchBy === "") {
      return sortedList;
    } else if (firstName.includes(settings.searchBy.toLowerCase()) || lastName.includes(settings.searchBy.toLowerCase())) {
      return true;
    }
  }

  return searchedList;
}

function buildList(trigger) {
  const filteredList = filterList(settings.filterBy);
  const sortedList = sortList(filteredList);
  const searchedList = searchList(sortedList);

  console.log({ allStudents, searchedList, trigger, expelledStudents });

  displayStudents(searchedList);
}

// Display students
function displayStudents(students) {
  if (settings.filterBy === "*") {
    document.querySelector("main h3").textContent = "All students";
  } else if (settings.filterBy.toLowerCase() === "witch") {
    document.querySelector("main h3").textContent = settings.filterBy.substring(0, 1).toUpperCase() + settings.filterBy.substring(1).toLowerCase() + "es";
  } else if (settings.filterBy.toLowerCase() === "expelled") {
    document.querySelector("main h3").textContent = settings.filterBy.substring(0, 1).toUpperCase() + settings.filterBy.substring(1).toLowerCase() + " students";
  } else if (settings.filterBy.toLowerCase() === "inquisitorial") {
    document.querySelector("main h3").textContent = settings.filterBy.substring(0, 1).toUpperCase() + settings.filterBy.substring(1).toLowerCase() + " squad members";
  } else {
    document.querySelector("main h3").textContent = settings.filterBy.substring(0, 1).toUpperCase() + settings.filterBy.substring(1).toLowerCase() + "s";
  }

  // Clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // Build a new list
  displayListDetails(students);
  students.forEach(displayStudent);
}

// Display number of students
function displayListDetails(students) {
  document.querySelector("#filter__numbers [data-field=all]").textContent = allStudents.length;
  document.querySelector("#filter__numbers [data-field=currently]").textContent = students.length;
  document.querySelector("#filter__numbers [data-field=expelled]").textContent = expelledStudents.length;
  document.querySelector("#filter__numbers [data-field=Slytherin]").textContent = getNumberOfStudents("slyt");
  document.querySelector("#filter__numbers [data-field=Hufflepuff]").textContent = getNumberOfStudents("huff");
  document.querySelector("#filter__numbers [data-field=Ravenclaw]").textContent = getNumberOfStudents("rave");
  document.querySelector("#filter__numbers [data-field=Gryffindor]").textContent = getNumberOfStudents("gryf");
}

// Gets the number of students from each house
function getNumberOfStudents(house) {
  const numberOfStudents = allStudents.filter(getNumber);

  function getNumber(student) {
    if (student.house.substring(0, 4).toLowerCase() === house) {
      return true;
    }
  }
  return numberOfStudents.length;
}

// Display each student in the list
function displayStudent(student) {
  // Create the clone
  const clone = document.querySelector("template#student").content.cloneNode(true);

  // Clone data
  const firstLetter = student.firstName.substring(0, 1);

  clone.querySelector("[data-field=firs]").textContent = student.firstName;
  clone.querySelector("[data-field=last]").textContent = student.lastName;
  clone.querySelector("[data-field=hous]").textContent = student.house;
  clone.querySelector("[data-field=photo]").src = student.imageDir;

  if (student.prefect === true && student.inquisitorial === false) {
    student.responsibilities = `Prefect`;
  } else if (student.prefect === false && student.inquisitorial === true) {
    student.responsibilities = `Inquisitorial squad`;
  } else if (student.prefect === true && student.inquisitorial === true) {
    student.responsibilities = `Prefect, Inquisitorial squad`;
  } else if (student.lastName === "Munch") {
    //do nothing
  } else {
    student.responsibilities = "";
  }
  clone.querySelector("[data-field=resp]").textContent = student.responsibilities;

  if (student.enrollment === false) {
    clone.querySelector("tr").style.textDecoration = "line-through";
  }

  // Add click eventlistener to the students in the list
  clone.querySelector("tr").addEventListener("click", clickStudentModal);
  function clickStudentModal() {
    showStudentModal(student);
  }

  // Append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}

// Displays the modal with a specific students details
function showStudentModal(student) {
  document.querySelector("#student__modal").classList.remove("hide");
  console.log(student);

  // Insert the specific student's details
  document.querySelector(".top__column img").src = student.imageDir;
  document.querySelector(".top__column img").alt = `Portrait of ${student.firstName} ${student.lastName}`;
  if (student.imageDir === "images/students/munch_c.png") {
    document.querySelector(".top__column img").style.maxWidth = "150px";
  }

  document.querySelector(".student__name").textContent = `${student.lastName}, ${student.firstName.substring(0, 1)}.`;
  document.querySelector(".bottom__column [data-field=gender]").textContent = student.gender;
  document.querySelector(".bottom__column [data-field=blood]").textContent = student.bloodStatus;
  document.querySelector(".bottom__column [data-field=house]").textContent = student.house;
  document.querySelector(".bottom__column [data-field=respons]").textContent = student.responsibilities;
  if (student.enrollment === false) {
    document.querySelector(".bottom__column [data-field=enroll]").textContent = "Expelled";
  } else {
    document.querySelector(".bottom__column [data-field=enroll]").textContent = "Enrolled";
  }

  //show student house colors(MUST BE A SMARTER WAY)
  if (student.house === "Slytherin") {
    document.querySelector(".content").classList.add("slytherin__bg");
    document.querySelector(".crest").classList.add("slytherin__crest");
  } else if (student.house === "Hufflepuff") {
    document.querySelector(".content").classList.add("hufflepuff__bg");
    document.querySelector(".crest").classList.add("hufflepuff__crest");
  } else if (student.house === "Ravenclaw") {
    document.querySelector(".content").classList.add("ravenclaw__bg");
    document.querySelector(".crest").classList.add("ravenclaw__crest");
  } else {
    document.querySelector(".content").classList.add("gryffindor__bg");
    document.querySelector(".crest").classList.add("gryffindor__crest");
  }

  // Update button texts depending on responsibilities
  if (student.prefect === true && student.inquisitorial === false) {
    document.querySelector("#student__modal [data-field=makePrefect]").textContent = `Remove`;
    document.querySelector("#student__modal [data-field=makeInquis]").textContent = `Make`;
  } else if (student.prefect === false && student.inquisitorial === true) {
    document.querySelector("#student__modal [data-field=makeInquis]").textContent = `Remove as`;
    document.querySelector("#student__modal [data-field=makePrefect]").textContent = `Make`;
  } else if (student.prefect === true && student.inquisitorial === true) {
    document.querySelector("#student__modal [data-field=makePrefect]").textContent = `Remove`;
    document.querySelector("#student__modal [data-field=makeInquis]").textContent = `Remove as`;
  } else {
    document.querySelector("#student__modal [data-field=makePrefect]").textContent = `Make`;
    document.querySelector("#student__modal [data-field=makeInquis]").textContent = `Make`;
  }

  // Add click to close
  document.querySelector(".content__header .close").addEventListener("click", closeStudentModal);
  function closeStudentModal() {
    document.querySelector(".content__header .close").removeEventListener("click", closeStudentModal);
    document.querySelector("#student__modal .make__prefect").removeEventListener("click", clickMakePrefect);
    document.querySelector("#student__modal .make__inquis").removeEventListener("click", clickMakeInquis);
    document.querySelector("#student__modal .expel").removeEventListener("click", clickExpelStudent);
    document.querySelector("#student__modal").classList.add("hide");

    // Removes house styles
    document.querySelector(".content").classList.remove("slytherin__bg");
    document.querySelector(".crest").classList.remove("slytherin__crest");
    document.querySelector(".content").classList.remove("hufflepuff__bg");
    document.querySelector(".crest").classList.remove("hufflepuff__crest");
    document.querySelector(".content").classList.remove("ravenclaw__bg");
    document.querySelector(".crest").classList.remove("ravenclaw__crest");
    document.querySelector(".content").classList.remove("gryffindor__bg");
    document.querySelector(".crest").classList.remove("gryffindor__crest");
  }

  // Add click to prefect button
  document.querySelector(".make__prefect").addEventListener("click", clickMakePrefect);
  function clickMakePrefect() {
    if (student.prefect === true) {
      student.prefect = false;
      student.responsibilities = student.responsibilities.replace("Prefect", "");
    } else {
      const isPrefect = tryToMakePrefect(student);

      if (!isPrefect) {
        return;
      }
    }

    console.log(student);

    closeStudentModal();
    buildList("prefect");
  }

  // Add click to inqisitorial squad button
  document.querySelector("#student__modal .make__inquis").addEventListener("click", clickMakeInquis);
  function clickMakeInquis() {
    if (student.inquisitorial === true) {
      student.inquisitorial = false;
      student.responsibilities = student.responsibilities.replace("Inquisitorial squad", "");
      closeStudentModal();
      buildList();
    } else {
      tryToMakeInquis(student, () => {
        closeStudentModal();
        buildList();
      });
    }
  }

  // Add click to expel button
  document.querySelector("#student__modal .expel").addEventListener("click", clickExpelStudent);
  function clickExpelStudent() {
    tryToExpelStudent(student, () => {
      closeStudentModal();
      buildList();
    });
  }
}

// Make a student prefect
function tryToMakePrefect(selectedStudent) {
  // Create an array of students whom is form the same house and of same gender
  const prefects = allStudents.filter((student) => student.prefect === true);
  const prefectsPerHouse = prefects.filter((student) => student.house === selectedStudent.house);
  const ofSameHouseAndGender = prefectsPerHouse.filter((student) => student.gender === selectedStudent.gender).shift();

  // If no other student is from the same house or of the same gender,
  // make the selected student prefect. If not, go to removeOtherPrefect.
  if (ofSameHouseAndGender !== undefined) {
    removeOtherPrefect();

    return false;
  } else {
    makePrefect(selectedStudent);

    return true;
  }

  function removeOtherPrefect() {
    // Show #remove_other dialog box, and add eventlisteners to buttons.
    document.querySelector("#remove__other").classList.remove("hide");
    document.querySelector("#remove__other .close").addEventListener("click", closeDialogWindow);
    document.querySelector("#remove__other .remove__other--prefect").addEventListener("click", clickRemovePrefect);

    // Add name to button
    document.querySelector("#remove__other [data-field=selectedStudent]").textContent = `${ofSameHouseAndGender.firstName} ${ofSameHouseAndGender.lastName}`;

    // Don't remove the original prefect
    function closeDialogWindow() {
      document.querySelector("#remove__other").classList.add("hide");
      document.querySelector("#remove__other .close").removeEventListener("click", closeDialogWindow);
      document.querySelector("#remove__other .remove__other--prefect").removeEventListener("click", clickRemovePrefect);
    }

    // Remove the original prefect
    function clickRemovePrefect() {
      document.querySelector("#remove__other .remove__other--prefect").removeEventListener("click", clickRemovePrefect);
      removePrefect(ofSameHouseAndGender);
      makePrefect(selectedStudent);
      buildList();
      closeDialogWindow();
    }
  }

  // Removes the original prefect, by setting the proberty to false
  function removePrefect(ofSameHouseAndGender) {
    ofSameHouseAndGender.prefect = false;
    ofSameHouseAndGender.responsibilities = ofSameHouseAndGender.responsibilities.replace("Prefect", "");
  }

  // Makes the selected student prefect, by setting the proberty to true
  function makePrefect(selectedStudent) {
    selectedStudent.prefect = true;
    selectedStudent.responsibilities += " Prefect";
  }
}

// Make a student an inquisitorial squadront
function tryToMakeInquis(selectedStudent, onClose) {
  document.querySelector("#make__inquis").classList.remove("hide");

  // Add click to close button
  document.querySelector("#make__inquis .close").addEventListener("click", closeDialogWindow);
  function closeDialogWindow() {
    document.querySelector("#make__inquis .make__inquis--confirm").removeEventListener("click", clickInquisButton);
    document.querySelector("#make__inquis").classList.add("hide");
    document.querySelector("#make__inquis .close").removeEventListener("click", closeDialogWindow);
  }

  // If student is a pure blood, add selected students name to button and create message
  if (selectedStudent.bloodStatus === "Pure-blood") {
    isAbleToBeInquis();
  }
  // If not, hide button and change message
  else {
    document.querySelector("#make__inquis .make__inquis--confirm").removeEventListener("click", clickInquisButton);
    document.querySelector("#make__inquis [data-field=inquismessage]").textContent = `${selectedStudent.firstName} ${
      selectedStudent.lastName
    } is a ${selectedStudent.bloodStatus.toLowerCase()} ${selectedStudent.gender.toLowerCase()}, and is not eligible for the Inquisitorial Squad!`;
    document.querySelector("#make__inquis .make__inquis--confirm").style.display = "none";
  }

  function isAbleToBeInquis() {
    document.querySelector("#make__inquis [data-field=inquismessage]").textContent = `${selectedStudent.firstName} ${
      selectedStudent.lastName
    } is a ${selectedStudent.bloodStatus.toLowerCase()} ${selectedStudent.gender.toLowerCase()}, and is eligible for the Inquisitorial Squad!`;
    document.querySelector("#make__inquis [data-field=selectedStudent]").textContent = `${selectedStudent.firstName} ${selectedStudent.lastName}`;
    document.querySelector("#make__inquis .make__inquis--confirm").style.display = "block";
    document.querySelector("#make__inquis .make__inquis--confirm").addEventListener("click", clickInquisButton);
  }

  // Click on inquisition button
  function clickInquisButton() {
    document.querySelector("#make__inquis .make__inquis--confirm").removeEventListener("click", clickInquisButton);
    makeInquis(selectedStudent);
    buildList();
    closeDialogWindow();
    onClose();
  }

  // Make student inquisition squad member by setting proberty to true
  function makeInquis(selectedStudent) {
    selectedStudent.inquisitorial = true;
    selectedStudent.responsibilities += " Inquisitorial squad";

    // If the system has been hacked
    if (settings.hacked === true) {
      // Remove all every 30 sec
      setInterval(() => {
        selectedStudent.inquisitorial = false;
        selectedStudent.responsibilities = selectedStudent.responsibilities.replace("Inquisitorial squad", "");
        buildList();
      }, 10000);
    }
  }
}

// Expelling of a student
function tryToExpelStudent(selectedStudent, onClose) {
  document.querySelector("#expel__student").classList.remove("hide");
  document.querySelector("#expel__student .close").addEventListener("click", closeDialogWindow);

  // If the selected student is already expelled
  if (expelledStudents.includes(selectedStudent)) {
    document.querySelector("#expel__student [data-field=expelmessage]").textContent = `You can't expel ${selectedStudent.firstName} ${selectedStudent.lastName} twice!`;
    document.querySelector("#expel__student .expel__student").style.display = "none";
  } else if (selectedStudent.firstName.toLowerCase() === document.querySelector("#firstName").value.toLowerCase() && selectedStudent.lastName.toLowerCase() === document.querySelector("#lastName").value.toLowerCase()) {
    document.querySelector("#expel__student [data-field=expelmessage]").textContent = `${selectedStudent.firstName} ${selectedStudent.lastName} can't be expelled!`;
    document.querySelector("#expel__student .expel__student").style.display = "none";
  }
  // If the selected student is not expelled
  else {
    document.querySelector("#expel__student .expel__student").addEventListener("click", expelStudent);
    document.querySelector("#expel__student [data-field=expelmessage]").textContent = `Do you want to expel ${selectedStudent.firstName} ${selectedStudent.lastName}?`;
    document.querySelector("#expel__student .expel__student").style.display = "block";
    document.querySelector("#expel__student [data-field=selectedStudent]").textContent = `${selectedStudent.firstName} ${selectedStudent.lastName}`;
  }

  // Close the dialog
  function closeDialogWindow() {
    document.querySelector("#expel__student .close").removeEventListener("click", closeDialogWindow);
    document.querySelector("#expel__student .expel__student").removeEventListener("click", expelStudent);
    document.querySelector("#expel__student").classList.add("hide");
  }

  // The expelling of the selected student
  function expelStudent() {
    document.querySelector("#expel__student .expel__student").removeEventListener("click", expelStudent);
    selectedStudent.enrollment = false;
    const index = allStudents.indexOf(selectedStudent);
    allStudents.splice(index, 1);
    expelledStudents.push(selectedStudent);
    buildList();
    closeDialogWindow();
    onClose();
  }
}

// Hack the system!
document.addEventListener("keydown", (event) => {
  if (event.key === "D") {
    hackTheSystem();
  }
});

function hackTheSystem() {
  console.log("Hack it");
  if (settings.hacked === false) {
    document.querySelector("#student__modal").classList.remove("hide");
    document.querySelector("#hacker").classList.remove("hide");
    document.querySelector("#hacker .hack__list").addEventListener("click", addHackerToList);
    document.querySelector("#hacker .close").addEventListener("click", closeDialogWindow);
  }

  function closeDialogWindow() {
    document.querySelector("#hacker").classList.add("hide");
    document.querySelector("#hacker .hack__list").removeEventListener("click", addHackerToList);
    document.querySelector("#hacker .close").removeEventListener("click", closeDialogWindow);
    document.querySelector("[data-action='search']").value = "";
    settings.searchBy = "";
    buildList();
  }

  // Add the hacker to the list
  function addHackerToList() {
    document.querySelector("#hacker .hack__list").removeEventListener("click", addHackerToList);
    document.querySelector("#hacker .close").removeEventListener("click", closeDialogWindow);
    document.querySelector("[data-action='search']").value = "";
    settings.searchBy = "";

    const firstValue = document.querySelector("#firstName").value;
    const lastValue = document.querySelector("#lastName").value;
    const student = Object.create(Student);
    student.firstName = firstValue.substring(0, 1).toUpperCase() + firstValue.substring(1).toLowerCase();
    student.lastName = lastValue.substring(0, 1).toUpperCase() + lastValue.substring(1).toLowerCase();
    student.gender = document.querySelector("#gender").value;
    student.house = document.querySelector("#house").value;
    student.imageDir = `images/students/${student.lastName.toLowerCase()}_${student.firstName.substring(0, 1).toLowerCase()}.png`;
    student.bloodStatus = "Pure-blood";
    student.responsibilities = "Master of the darkness";

    getNewBloodStatus();
    resetInquStatus();

    allStudents.push(student);
    settings.hacked = true;
    closeDialogWindow();
    showStudentModal(student);
    buildList();
  }
}

// Create random blood status for each students
function getNewBloodStatus() {
  allStudents.forEach(setNewBloodStatus);

  function setNewBloodStatus(student) {
    if (student.bloodStatus !== "Pure-blood") {
      student.bloodStatus = "Pure-blood";
    } else {
      const random = Math.floor(Math.random() * 2);

      if (random === 0) {
        student.bloodStatus = "Muggle-born";
      } else if (random === 1) {
        student.bloodStatus = "Half-blood";
      }
    }
  }
}

// Set each students inquisitorial proberty to false after 3 seconds
function resetInquStatus() {
  allStudents.forEach((student) => {
    student.inquisitorial = false;
    student.responsibilities = student.responsibilities.replace("Inquisitorial squad", "");
  });
}
