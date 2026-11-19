import { loadCourses, loadAssignments, ASSIGNMENT_KEYS } from "./course.js"

const STORAGE_KEY = 'studysync.sessions.v1';
const dashboardCourseGrid = document.querySelector(".dashboard-course-grid");
const courseNotice = document.querySelector("#course-notice");
const assignmentTable = document.querySelector("#assignment-table");
const assignmentNotice = document.querySelector("#assignment-notice");
const sessionTable = document.querySelector("#study-session-table");
const sessionNotice = document.querySelector("#study-session-notice");
let courses = loadCourses();
let sessions = loadSessions();

function loadSessions() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored.filter(s => s && typeof s.id === 'string' && typeof s.date === 'string') : [];
  } catch { return []; }
}

function renderStudyTasks() {
    sessionTable.replaceChildren();
    const headerRow = document.createElement('tr');
    const headerTitle = document.createElement('th');
    headerTitle.textContent = "Study Session";
    const headerDate = document.createElement('th');
    headerDate.textContent = "Session Date";
    const headerStartTime = document.createElement('th');
    headerStartTime.textContent = "Start Time"
    const headerDuration = document.createElement('th');
    headerDuration.textContent = "Duration"
    const headerCourse = document.createElement('th');
    headerCourse.textContent = "Course"

    headerRow.append(headerTitle, headerDate, headerStartTime, headerDuration, headerCourse);
    sessionTable.append(headerRow);

    if(!sessions.length) {
        sessionNotice.hidden = false;
    } else {
        sessionNotice.hidden = true;
    }
    
    for(const session of sessions) {
        const currentRow = document.createElement('tr');
        const title = document.createElement('td');
        title.textContent = session.title;
        const date = document.createElement('td');
        date.textContent = session.date;
        const time = document.createElement('td');
        time.textContent = session.time;
        const duration = document.createElement('td');
        duration.textContent = session.duration;
        const sessionCourse = document.createElement('td');
        sessionCourse.textContent = session.course;

        currentRow.append(title, date, time, duration, sessionCourse);
        sessionTable.append(currentRow);
    }
}

function renderCourses() {
    dashboardCourseGrid.replaceChildren();

    if(!courses.length) {
        courseNotice.hidden = false;
        dashboardCourseGrid.hidden = true;
    } else {
        courseNotice.hidden = true;
        dashboardCourseGrid.hidden = false;
    }

    for(const course of courses) {
        const coursePanel = document.createElement('div');
        coursePanel.className = "course";

        const courseTitle = document.createElement('h2');
        courseTitle.textContent = course.title;
        const courseMeetingTime = document.createElement('p');
        courseMeetingTime.textContent = `Meeting Time: ${course.meetingDays} ${course.timeStart}-${course.timeEnd}`
        const courseGrade = document.createElement('p');
        courseGrade.textContent = `Grade: ${course.grade}%`

        coursePanel.append(courseTitle, courseMeetingTime, courseGrade);
        dashboardCourseGrid.append(coursePanel);
    }
}

function renderAssignments() {
    assignmentTable.replaceChildren();
    const headerRow = document.createElement('tr');
    const headerTitle = document.createElement('th');
    headerTitle.textContent = "Assignment";
    const headerDueDate = document.createElement('th');
    headerDueDate.textContent = "Due Date";
    const headerStatus = document.createElement('th');
    headerStatus.textContent = "Status"
    const headerCourse = document.createElement('th');
    headerCourse.textContent = "Course"

    headerRow.append(headerTitle, headerDueDate, headerStatus, headerCourse);
    assignmentTable.append(headerRow);
    
    let assignments = [];
    for(const course of courses) {    
        for (const key of ASSIGNMENT_KEYS) {
            if(key == `studysync.${course.id}.v1`) {
                assignments = assignments.concat(loadAssignments(key));
            }
        }
    }

    if(!assignments.length) {
        assignmentNotice.hidden = false;
    } else {
        assignmentNotice.hidden = true;
    }
    
    for(const assignment of assignments) {
        const currentRow = document.createElement('tr');
        const title = document.createElement('td');
        title.textContent = assignment.title;
        const dueDate = document.createElement('td');
        dueDate.textContent = assignment.dueDate;
        const status = document.createElement('td');
        status.textContent = assignment.status;
        const assignmentCourse = document.createElement('td');
        assignmentCourse.textContent = assignment.assignmentCourse;

        currentRow.append(title, dueDate, status, assignmentCourse);
        assignmentTable.append(currentRow);
    }
}

renderAssignments();
renderStudyTasks();
renderCourses();
