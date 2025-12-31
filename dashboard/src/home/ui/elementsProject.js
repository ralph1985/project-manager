export function getProjectElements() {
  return {
    projectTitle: document.getElementById('projectTitle'),
    projectSelect: document.getElementById('projectSelect'),
    projectStats: document.getElementById('project-stats'),
    tasksTableBody: document.querySelector('#tasksTable tbody'),
    search: document.getElementById('search'),
    statusFilter: document.getElementById('statusFilter'),
    ownerFilter: document.getElementById('ownerFilter'),
    phaseFilter: document.getElementById('phaseFilter'),
    dateStartFilter: document.getElementById('dateStartFilter'),
    dateEndFilter: document.getElementById('dateEndFilter'),
    dateClearBtn: document.getElementById('dateClearBtn'),
    noteModal: document.getElementById('noteModal'),
    noteBody: document.getElementById('noteBody'),
    noteClose: document.getElementById('noteClose'),
    ticktickStatus: document.getElementById('ticktickStatus'),
    ticktickRefresh: document.getElementById('ticktickRefresh'),
    ticktickMessage: document.getElementById('ticktickMessage'),
    ticktickTasks: document.getElementById('ticktickTasks'),
    ticktickColumnId: document.getElementById('ticktickColumnId'),
    projectTodos: document.getElementById('projectTodos'),
  };
}
