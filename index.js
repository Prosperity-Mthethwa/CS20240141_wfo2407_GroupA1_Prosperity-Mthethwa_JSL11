// TASK: import helper functions from utils
import {getTasks,createNewTask,patchTask,putTask,deleteTask} from "./utils/taskFunctions.js";

// TASK: import initialData

import { initialData } from "./initialData.js"


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {

  // elements//
  sideBar: document.querySelector(".side-bar"),
  logo: document.getElementById("logo"),
  boardsNavLinks: document.getElementById("boards-nav-links-div"),
  darkThemeIcon: document.getElementById("icon-dark"),
  themeSwitch: document.getElementById("switch"),
  lightThemeIcon: document.getElementById("icon-light"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),

  //header//
  headerBoardName: document.getElementById("header-board-name"),
  addNewTaskBtn: document.getElementById("create-new-task-btn"),
  editBoardBtn: document.getElementById("edit-board-btn"),

  //Task columns//
  columnDivs: document.querySelectorAll(".column-div"),
  todoColumn: document.querySelector('.column-div[data-status="todo"]'),
  doingColumn: document.querySelector('.column-div[data-status="doing"]'),
  doneColumn: document.querySelector('.column-div[data-status="done"]'),
  filterDiv: document.getElementById("filterDiv"),

  //New Task Modal//
  titleInput: document.getElementById("title-input"),
  descInput: document.getElementById("desc-input"),
  selectStatus: document.getElementById("select-status"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),
  newTaskModal: document.getElementById("new-task-modal-window"),
  modalWindow: document.getElementById("new-task-modal-window"),

  //Edit task modal
  editTaskModal: document.querySelector(".edit-task-modal-window"),
  editTaskTitleInput: document.getElementById("edit-task-title-input"),
  editTaskDescInput: document.getElementById("edit-task-desc-input"),
  editSelectStatus: document.getElementById("edit-select-status"),
  saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
  cancelEditBtn: document.getElementById("cancel-edit-btn"),
  deleteTaskBtn: document.getElementById("delete-task-btn"),

  //filter//
  filterDiv: document.getElementById("filterDiv"),
};

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; //removed semi-colon(bug 1)
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ""; // Clears the container
  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => {
      // Use 'addEventListener' to attach click event listener
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; // Corrected assignment syntax
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName); //used strict equality operator

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks
    .filter((task) => task.status === status)
    .forEach((task) => { 
      //used strict equality operator '==='//
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener("click",() => { 
        openEditTaskModal(task);
      }); //added event listener//

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    //fixed camelCase for.Each//
    if(btn.textContent === boardName) {
      btn.classList.add('active') //added btn.classList.add for adding classes//
    }
    else {
      btn.classList.remove('active'); //classlist for removing classes//
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(
    '.column-div[data-status="${task.status}"]'); 

  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    console.warn(
      `Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute("data-task-id", task.id);
  
  tasksContainer.appendChild(); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener("click", () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click",() => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click",() => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener("change", toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener("submit",  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? "block" : "none";  //fixed ternary operator syntax//
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

//Function 8
function addTask(event) {
  event.preventDefault();

  // Assign user input to the task object
  const task = {
    title: document.getElementById("title-input").value,
    description: document.getElementById("desc-input").value,
    status: document.getElementById("select-status").value,
    board: activeBoard,
  };

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    /*newTask.board = activeBoard;
    initialData.push(newTask);*/
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
    event.target.reset();

    /*initialData.push(newTask);
    initialData.pop();
    localStorage.setItem("tasks", JSON.stringify(initialData));*/
    putTask(newTask);
    /*refreshTasksUI();*/
  }
}
//Function 9
function toggleSidebar(show) {
  if (show) {
    elements.sideBar.style.display = "flex"; // Display the sidebar as flex layout
    elements.showSideBarBtn.style.display = "none";
  } else {
    elements.sideBar.style.display = "none"; 
    elements.showSideBarBtn.style.display = "block";
  }
}
toggleSidebar(true);

//Function 10
function toggleTheme() {
  // Get a reference to the document body
  const body = document.body;

  // Toggle between light and dark theme classes on the body
  body.classList.toggle("light-theme");
  body.classList.toggle("dark-theme");

  // Check if the current theme is light or dark
  const isLightTheme = body.classList.contains("light-theme");

  // Store the theme preference in local storage using ternary operator
  localStorage.setItem("theme", isLightTheme ? "light" : "dark");
}

//Function 11
function openEditTaskModal(task) {

  const titleInput = document.getElementById("edit-task-title-input");
  const descInput = document.getElementById("edit-task-desc-input");
  const statusSelect = document.getElementById("edit-select-status");

  // Get button elements from the task modal
  titleInput.value = task.title;
  descInput.value = task.description;
  statusSelect.value = task.status;

  // Call saveTaskChanges upon click of Save Changes button
  const saveTaskChangesBtn = document.getElementById("save-task-changes-btn");
  const deleteTaskBtn = document.getElementById("delete-task-btn");

  saveTaskChangesBtn.addEventListener("click", () => {
    saveTaskChanges(task.id);
    refreshTasksUI();
    toggleModal(false, elements.editTaskModal);
  });

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.addEventListener("click", () => {
    deleteTask(task.id);
    // No need to reload the page, just refresh the UI
    refreshTasksUI();
    toggleModal(false, elements.editTaskModal);
  });
  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}


//Function 12
function saveTaskChanges(taskId) {
  // Get new user inputs
  const titleInput = document.getElementById("edit-task-title-input");
  const descInput = document.getElementById("edit-task-desc-input");
  const statusSelect = document.getElementById("edit-select-status");

  const updatedTask = {
    id: taskId,
    title: titleInput.value,
    description: descInput.value,
    status: statusSelect.value,
  };

  // Update task using an exported helper functoin
  patchTask(taskId, updatedTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener("DOMContentLoaded", function () {
  init(); 
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem("light-theme") === "enabled";
  document.body.classList.toggle("light-theme", isLightTheme);
  fetchAndDisplayBoardsAndTasks(); 
}