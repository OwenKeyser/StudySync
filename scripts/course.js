const COURSE_STORAGE_KEY = 'studysync.courses.v1';
const ASSIGNMENT_KEYS = [];

const courseGrid = document.querySelector('#course-grid');
const courseForm = document.querySelector('#course-form');
const message = document.querySelector('#form-message');
let courses = loadCourses();

// Load Courses from local storage
function loadCourses() {
    try {
        const stored = JSON.parse(localStorage.getItem(COURSE_STORAGE_KEY) || '[]');
        return Array.isArray(stored) ? stored.filter(s => s && typeof s.id === 'string') : [];
    } catch { return []; }
}

// Save courses to local storage
function saveCourses() {
    try { 
        localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(courses));
        return true; 
    }
    catch { 
        message.textContent = 'Storage is unavailable. Changes will not be saved after reload.';
        return false;
    }
}

// Load Assignments for a specific class from local storage
function loadAssignments(key) {
    try {
        const stored = JSON.parse(localStorage.getItem(key) || '[]');
        return Array.isArray(stored) ? stored.filter(s => s && typeof s.id === 'string') : [];
    } catch { return []; }
}

// Save Assignments for a specific class to local storage
function saveAssignments(key, assignments) {
    try { 
        localStorage.setItem(key, JSON.stringify(assignments));
        return true; 
    }
    catch { 
        message.textContent = 'Storage is unavailable. Changes will not be saved after reload.';
        return false;
    }
}

// Render the page and any changes
function render()  {
    // Prepares to change course grid
    courseGrid.replaceChildren();

    // Notice for having no saved courses yet
    if (!courses.length) {
        const notice = document.createElement('p');
        notice.className = 'notice';
        notice.textContent = 'No Courses Added';
        courseGrid.append(notice);
    }

    // Add course panels for each course that have been added
    for (const course of courses) {
        // Create storage reference for the course's assignments
        ASSIGNMENT_KEYS.push(`studysync.${course.id}.v1`);
        let assignments = [];
        for (const key of ASSIGNMENT_KEYS) {
            if(key == `studysync.${course.id}.v1`) {
                assignments = loadAssignments(key);
            }
        }

        const item = document.createElement('div');
        item.className = 'course';

        // Create Elements for course info.
        const info = document.createElement('div');
        info.className = 'course-info';

        const title = document.createElement('h2');
        title.textContent = course.title;

        const meetingTime = document.createElement('p');
        meetingTime.textContent = `Meeting Time: ${course.meetingDays} ${course.timeStart}-${course.timeEnd}`

        const grade = document.createElement('p');
        grade.textContent = `Grade: ${course.grade}%`

        info.append(title, meetingTime, grade);

        // Create Elements for course content
        const content = document.createElement('div');
        content.className = 'course-content';

        // Create assignment table
        const table = document.createElement('table');
        table.className = "assignment-table";
        const row = document.createElement('tr');
        const tableAssignmentHeader = document.createElement('th');
        tableAssignmentHeader.textContent = 'Assignment';
        const tableDueDateHeader = document.createElement('th');
        tableDueDateHeader.textContent = 'Due Date';
        const tableStatusHeader = document.createElement('th');
        tableStatusHeader.textContent = 'Status';
        const tableActionRow = document.createElement('th');
        tableActionRow.textContent = 'Action';
        row.append(tableAssignmentHeader, tableDueDateHeader, tableStatusHeader, tableActionRow);
        table.append(row);

        // Load assignments to assignment table
        for(const assignment of assignments) {
            const tableRow = document.createElement('tr');
            const tableAssignmentInput = document.createElement('td');
            tableAssignmentInput.textContent = assignment.title;
            const tableDueDateInput = document.createElement('td');
            tableDueDateInput.textContent = assignment.dueDate;
            const tableStatusInput = document.createElement('td');
            tableStatusInput.textContent = assignment.status;
            
            const removeElement = document.createElement('td');
            removeElement.className = 'remove-element'; 
            const assignRemove = document.createElement('button');
            assignRemove.className = 'delete'
            assignRemove.textContent = 'Delete assignment'; 
            assignRemove.setAttribute('aria-label', `Delete ${assignment.title}`); 
            assignRemove.addEventListener('click', () => { 
                assignments = assignments.filter(s => s.id !== assignment.id);
                
                for (const key of ASSIGNMENT_KEYS) {
                    if(key == `studysync.${course.id}.v1`) {
                        saveAssignments(key, assignments);
                    }
                }

                render(); 
                message.textContent = 'Assignment deleted.'; 
            });

            removeElement.append(assignRemove)
            tableRow.append(tableAssignmentInput, tableDueDateInput, tableStatusInput, removeElement);
            table.append(tableRow);
        }

        // Create form to add assignments to course
        const assignmentForm = document.createElement('form');
        assignmentForm.className = "assignment-form"
        const name = document.createElement('input');
        name.name = 'title';
        name.required = true;
        name.placeholder = "e.g. Assignment #1";
        const assignmentDueDate = document.createElement('input');
        assignmentDueDate.name = 'due-date';
        assignmentDueDate.type = 'date';
        assignmentDueDate.required = true;
        const assignmentStatus = document.createElement('input');
        assignmentStatus.name = 'status';
        assignmentStatus.required = true;
        assignmentStatus.placeholder = "e.g. Submitted";
        const addAssignment = document.createElement('button');
        addAssignment.textContent = "Add Assignment";
        addAssignment.addEventListener('click', () => {
            const data = new FormData(assignmentForm);
            const title = String(data.get('title')).trim();
            const dueDate = String(data.get('due-date'));
            const status = String(data.get('status')).trim();

            assignments.push({ id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, title, dueDate, status });
            for (const key of ASSIGNMENT_KEYS) {
                if(key == `studysync.${course.id}.v1`) {
                    const saved = saveAssignments(key, assignments);
                    if (saved) {
                        message.textContent = 'Assignment added!';
                    }
                }
            }
            
            assignmentForm.reset();
            render();
        })
        assignmentForm.append(name, assignmentDueDate, assignmentStatus, addAssignment);

        // Create button for deleting a course
        const remove = document.createElement('button');
        remove.className = 'delete'
        remove.textContent = 'Delete course'; 
        remove.setAttribute('aria-label', `Delete ${course.title}`); 
        remove.addEventListener('click', () => { 
            courses = courses.filter(s => s.id !== course.id);
            assignments = null;
            for (let i=0; i<ASSIGNMENT_KEYS.length; i++) {
                if(ASSIGNMENT_KEYS[i] == `studysync.${course.id}.v1`) {
                    delete ASSIGNMENT_KEYS[i];
                }
            }

            saveCourses(); 
            render(); 
            message.textContent = 'Course deleted.'; 
        });
        
        // Append content to course, then append course to course grid
        content.append(table, assignmentForm, remove);
        item.append(info, content);
        courseGrid.append(item);
    }
}    

// Event listener to add a course
courseForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(courseForm);
    const title = String(data.get('title')).trim();
    const meetingDays = String(data.get('meeting-days'));
    const timeStart = String(data.get('time-start'));
    const timeEnd = String(data.get('time-end'));
    const grade = Number(data.get('grade'));

    if(timeStart >= timeEnd) {
        message.textContent = 'Meeting end time should not be before or the same as the meeting start time';
        return;
    }
    courses.push({ id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, title, meetingDays, timeStart, timeEnd, grade });
    const saved = saveCourses();
    if (saved) {
        message.textContent = 'Course added!';
    }
    courseForm.reset();
    render();
});

// Renders the initial page
render();