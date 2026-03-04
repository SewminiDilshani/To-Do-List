let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let deletedTasks = JSON.parse(localStorage.getItem("deletedTasks")) || [];
let currentLang = "si";

// 🎵 Sounds
const addSound = new Audio('https://www.soundjay.com/buttons/sounds/button-16.mp3');
const deleteSound = new Audio('https://www.soundjay.com/buttons/sounds/button-50.mp3');

// Browser Unlock (සද්ද වැඩ කරන්න පේජ් එකේ එක පාරක් ක්ලික් කරන්න)
window.addEventListener('click', () => {
    addSound.play().then(() => { addSound.pause(); addSound.currentTime = 0; }).catch(()=>{});
    deleteSound.play().then(() => { deleteSound.pause(); deleteSound.currentTime = 0; }).catch(()=>{});
}, { once: true });

const texts = {
    si: { title: "මගේ වැඩ ලැයිස්තුව 📝", total: "මුළු වැඩ", completed: "අවසන් කළා", placeholder: "අලුත් වැඩක් ඇතුළත් කරන්න...", search: "වැඩක් සොයන්න...", add: "එකතු කරන්න", langBtn: "English", deletedTitle: "මකා දැමූ වැඩ", viewDeleted: "🗑️ මකා දැමූ වැඩ බලන්න", hideDeleted: "📁 මකා දැමූ වැඩ සඟවන්න", allFilter: "සියල්ල", addedAt: "එකතු කළේ: " },
    en: { title: "My Task List 📝", total: "Total Tasks", completed: "Completed", placeholder: "New task...", search: "Search...", add: "Add Task", langBtn: "සිංහල", deletedTitle: "Deleted Tasks", viewDeleted: "🗑️ View Deleted Tasks", hideDeleted: "📁 Hide Deleted Tasks", allFilter: "All", addedAt: "Added at: " }
};

// ➕ වැඩක් එකතු කිරීම
document.getElementById("add-btn").addEventListener("click", () => {
    const todoInput = document.getElementById("todo-input");
    const priorityInput = document.getElementById("priority-input");
    const dateInput = document.getElementById("date-input");

    if (todoInput.value.trim() === "") return;

    addSound.currentTime = 0;
    addSound.play().catch(e => console.log("Sound error"));

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newTask = {
        id: Date.now(),
        text: todoInput.value.trim(),
        priority: priorityInput.value,
        date: dateInput.value || "---",
        time: timeString,
        completed: false
    };

    tasks.push(newTask);
    todoInput.value = "";
    saveAndShow();
});

// 📋 ලිස්ට් එක පෙන්වීම සහ පෙරා බැලීම (Filter Logic එක මෙතන තියෙන්නේ)
window.displayTasks = function() {
    const todoList = document.getElementById("todo-list");
    const searchTerm = document.getElementById("search-input").value.toLowerCase();
    const filterValue = document.getElementById("sort-select").value; // Filter අගය ගන්නවා
    const t = texts[currentLang];
    
    todoList.innerHTML = "";

    tasks.forEach((task, index) => {
        // ✅ Filter එක: "all" නම් ඔක්කොම, නැත්නම් අදාළ priority එක විතරයි
        const matchesFilter = (filterValue === "all" || task.priority === filterValue);
        const matchesSearch = task.text.toLowerCase().includes(searchTerm);

        if (matchesFilter && matchesSearch) {
            const li = document.createElement("li");
            li.className = `priority-${task.priority}`;
            li.innerHTML = `
                <div style="flex:1; cursor:pointer;" onclick="toggleComplete(${index})">
                    <strong class="${task.completed ? 'strikethrough' : ''}">${task.text}</strong><br>
                    <small>📅 ${task.date} | ⏰ ${t.addedAt}${task.time}</small>
                </div>
                <div class="action-btns">
                    <button class="edit-btn" onclick="editTask(${index})"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="deleteTask(${index})"><i class="fas fa-trash"></i></button>
                </div>`;
            todoList.appendChild(li);
        }
    });
    updateStats();
};

// 🗑️ මකා දැමීම
window.deleteTask = (index) => {
    deleteSound.currentTime = 0;
    deleteSound.play().catch(e => console.log("Sound error"));
    const removed = tasks.splice(index, 1);
    deletedTasks.push(removed[0]);
    saveAndShow();
};

// Event Listeners for Filter and Search
document.getElementById("sort-select").addEventListener("change", displayTasks);
document.getElementById("search-input").addEventListener("input", displayTasks);

// (අනෙක් සියලුම functions පහළින්)
window.toggleComplete = (index) => { tasks[index].completed = !tasks[index].completed; saveAndShow(); };
window.displayDeletedTasks = function() {
    const deletedList = document.getElementById("deleted-list");
    deletedList.innerHTML = "";
    deletedTasks.forEach((task, index) => {
        const li = document.createElement("li");
        li.style.opacity = "0.7";
        li.innerHTML = `<div style="flex:1;"><strong style="text-decoration:line-through;">${task.text}</strong><br><small>📅 ${task.date}</small></div>
            <div class="action-btns"><button class="restore-btn" onclick="restoreTask(${index})">🔄 Restore</button></div>`;
        deletedList.appendChild(li);
    });
};
window.restoreTask = (index) => { const restored = deletedTasks.splice(index, 1); tasks.push(restored[0]); saveAndShow(); };
window.editTask = (index) => { const newText = prompt("Edit:", tasks[index].text); if (newText) { tasks[index].text = newText; saveAndShow(); } };
function saveAndShow() { localStorage.setItem("tasks", JSON.stringify(tasks)); localStorage.setItem("deletedTasks", JSON.stringify(deletedTasks)); displayTasks(); displayDeletedTasks(); }
function updateStats() {
    const completed = tasks.filter(t => t.completed).length;
    document.getElementById("total-count").innerText = tasks.length;
    document.getElementById("completed-count").innerText = completed;
    document.getElementById("progress-bar").style.width = tasks.length === 0 ? "0%" : (completed / tasks.length) * 100 + "%";
}
function updateLanguageUI() {
    const t = texts[currentLang];
    document.getElementById("app-title").innerText = t.title;
    document.getElementById("total-text").innerText = t.total;
    document.getElementById("completed-text").innerText = t.completed;
    document.getElementById("todo-input").placeholder = t.placeholder;
    document.getElementById("search-input").placeholder = t.search;
    document.getElementById("add-btn").innerText = t.add;
    document.getElementById("lang-btn").innerText = t.langBtn;
    document.getElementById("deleted-title").innerText = t.deletedTitle;
    document.getElementById("sort-select").options[0].text = t.allFilter;
    const container = document.getElementById("deleted-tasks-container");
    document.getElementById("toggle-deleted").innerText = (container.style.display === "none") ? t.viewDeleted : t.hideDeleted;
    displayTasks();
}
document.getElementById("lang-btn").onclick = () => { currentLang = currentLang === "si" ? "en" : "si"; updateLanguageUI(); };
document.getElementById("theme-btn").onclick = () => {
    const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    document.getElementById("theme-btn").innerText = theme === "dark" ? "☀️ Light" : "🌙 Dark";
};
document.getElementById("toggle-deleted").onclick = function() {
    const container = document.getElementById("deleted-tasks-container");
    container.style.display = (container.style.display === "none") ? "block" : "none";
    updateLanguageUI();
};

updateLanguageUI();
saveAndShow();