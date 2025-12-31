export function getElements() {
  return {
    stats: document.getElementById('stats'),
    projectPhases: document.getElementById('project-phases'),
    tasksTableBody: document.querySelector('#tasksTable tbody'),
    search: document.getElementById('search'),
    statusFilter: document.getElementById('statusFilter'),
    ownerFilter: document.getElementById('ownerFilter'),
    phaseFilter: document.getElementById('phaseFilter'),
    projectFilter: document.getElementById('projectFilter'),
    dateStartFilter: document.getElementById('dateStartFilter'),
    dateEndFilter: document.getElementById('dateEndFilter'),
    dateClearBtn: document.getElementById('dateClearBtn'),
    noteModal: document.getElementById('noteModal'),
    noteBody: document.getElementById('noteBody'),
    noteClose: document.getElementById('noteClose'),
    ticktickStatus: document.getElementById('ticktickStatus'),
    ticktickProjectSelect: document.getElementById('ticktickProjectSelect'),
    ticktickMessage: document.getElementById('ticktickMessage'),
    ticktickTasks: document.getElementById('ticktickTasks'),
  };
}
